// https://wattenberger.com/blog/gauge
// https://medium.com/@oriharel/pie-animation-in-react-native-using-svg-55d7d3f90156
import ContentLoader from 'components/layouts/ContentLoader';
import * as shape from 'd3-shape';
import util from 'libs/util';
import { debounce, isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Easing, InteractionManager, Text, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Stop } from 'react-native-svg';
import { AppStyle } from 'theme';

import Slice from './Slice';
import themedStyles from './style';
import Tooltip from './Tooltip';

const d3 = { shape };

const i18nScope = 'components.pieChart';

export const PieChart = forwardRef(
  (
    {
      loading = false,
      style,
      width = '100%',
      // height = 320,
      height = 220,
      chartHeight = 300,
      data = [],
      labelAccessor = () => {},
      valueAccessor = () => {},
      formatLabel,
      formatValue,
      outerRadius = '57%',
      activeOuterRadius = '57%', // thickness = outer - innner
      tooltipOuterRadius = '74%',
      innerRadius = '40%',
      cornerRadius = 0,
      spacing = 0.012,
      startAngle = 0,
      endAngle = 2 * Math.PI,
      tooltipContainerStyle = {},
      centeredText,
      allowNegative = true,
      renderTooltip,
      multipleSelect = false,
    },

    ref,
  ) => {
    const styles = useThemedStyle(themedStyles, i18nScope);
    const componentsRef = useRef([]);
    const indexInputRef = useRef(null);
    const slices = useRef([]);

    const [chartLayout, setChartLayout] = useState();

    const [selectedIndexes, setSelectedIndexes] = useState([]);

    const [interactionsComplete, setInteractionsComplete] = useState(false);

    const radius = useMemo(() => chartHeight / 2, [chartHeight]);

    const newOuterRadius = useMemo(
      () =>
        typeof outerRadius === 'string' ? (radius * parseFloat(outerRadius)) / 100 : outerRadius,
      [outerRadius, radius],
    );
    const newActiveOuterRadius = useMemo(
      () =>
        typeof activeOuterRadius === 'string'
          ? (radius * parseFloat(activeOuterRadius)) / 100
          : activeOuterRadius,
      [activeOuterRadius, radius],
    );
    const newTooltipOuterRadius = useMemo(
      () =>
        typeof tooltipOuterRadius === 'string'
          ? (radius * parseFloat(tooltipOuterRadius)) / 100
          : tooltipOuterRadius,
      [tooltipOuterRadius, radius],
    );
    const newInnerRadius = useMemo(
      () =>
        typeof innerRadius === 'string' ? (radius * parseFloat(innerRadius)) / 100 : innerRadius,
      [innerRadius, radius],
    );

    const dataTotal = useMemo(() => {
      if (!data || !data.length) {
        return 0;
      }

      return data
        .map(a => (allowNegative ? Math.abs(valueAccessor(a)) : valueAccessor(a)))
        .reduce((a, b) => a + b);
    }, [allowNegative, data, valueAccessor]);

    const getArcs = useCallback(() => {
      return d3.shape
        .pie()
        .value(item => {
          let value = valueAccessor(item);
          if (value !== 0 && Math.abs(value) / dataTotal < spacing) {
            value = dataTotal * Math.max(0.01, spacing) * (value > 0 ? 1 : -1);
          }
          if (allowNegative) {
            return Math.abs(value);
          }
          return Math.max(value, 0);
        })
        .sort(null)
        .startAngle(startAngle)
        .endAngle(endAngle)(data);
    }, [allowNegative, data, dataTotal, endAngle, spacing, startAngle, valueAccessor]);

    const createPieArc = useCallback(
      (index, newActiveOuterRadiusInput) => {
        const arcs = getArcs();
        let arcData = arcs[index];
        const arcGenerator = d3.shape
          .arc()
          .outerRadius(newActiveOuterRadiusInput)
          .padAngle(spacing)
          .innerRadius(newInnerRadius)
          .cornerRadius(cornerRadius);
        return arcGenerator(arcData);
      },
      [cornerRadius, getArcs, newInnerRadius, spacing],
    );

    useImperativeHandle(ref, () => ({
      clearTooltip: () => {
        setSelectedIndexes([]);
      },
    }));

    useLayoutEffect(() => {
      slices.current = Array.from({ length: data.length }, () => new Animated.Value(0));
    }, [data]);

    useEffect(() => {
      InteractionManager.runAfterInteractions(() => {
        setInteractionsComplete(true);
      });
    }, []);

    useEffect(() => {
      if (!data || !data.length) {
        return;
      }

      const slicesRef = slices.current;
      const listeners = [];

      if (slices.current.length > 0) {
        slices.current.map(slice => {
          const eventId = slice.addListener(event => {
            componentsRef.current[indexInputRef.current].setNativeProps({
              d: createPieArc(
                indexInputRef.current,
                newOuterRadius + event.value * (newActiveOuterRadius - newOuterRadius),
              ),
            });
          });
          listeners.push(eventId);
        });
      }

      return () => {
        if (slicesRef && slicesRef.length > 0) {
          slicesRef.map((slice, i) => {
            slice.removeListener(listeners[i]);
          });
        }
      };
    }, [createPieArc, newActiveOuterRadius, newOuterRadius, data]);

    const handleOnSelect = useCallback(
      (indexInput, currentSlice, selected) => {
        if (indexInput >= 0 && indexInput < data.length) {
          indexInputRef.current = indexInput;
          const newValue = selected ? 0 : 1;
          Animated.timing(currentSlice, {
            toValue: newValue,
            duration: 300,
            easing: Easing.inOut(Easing.quad), // Make it take a while
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) {
              // NOTE: multipleSelect
              if (multipleSelect) {
                setSelectedIndexes(prevState => {
                  let newIndexes = [...prevState];
                  if (newValue) {
                    newIndexes.push(indexInput);
                  } else {
                    newIndexes.splice(newIndexes.indexOf(indexInput), 1);
                  }
                  return newIndexes;
                });
                return;
              }
              // NOTE: single
              setSelectedIndexes(prevState => {
                let newIndexes = [...prevState];
                if (newValue) {
                  newIndexes = [indexInput];
                } else {
                  newIndexes = [];
                }
                return newIndexes;
              });
            }
          });
        }
      },
      [data, multipleSelect],
    );

    const createPieCentroid = useCallback(
      index => {
        const arcs = getArcs();

        let arcData = arcs[index];

        const arcGenerator = d3.shape
          .arc()
          .outerRadius(newTooltipOuterRadius)
          .padAngle(spacing)
          .innerRadius(newInnerRadius);

        return arcGenerator.centroid(arcData);
      },
      [getArcs, newInnerRadius, newTooltipOuterRadius, spacing],
    );

    const renderCenteredText = useCallback(
      centeredTextInput => {
        switch (typeof centeredTextInput) {
          case 'function': {
            return (
              <View style={styles.pieCenterContainer} pointerEvents="none">
                {centeredTextInput()}
              </View>
            );
          }
          case 'string': {
            return (
              <View style={styles.pieCenterContainer} pointerEvents="none">
                <Text type="heading-2" style={styles.pieCenterDescriptionText}>
                  {centeredTextInput}
                </Text>
              </View>
            );
          }
          default: {
            return null;
          }
        }
      },
      [styles],
    );

    const onChartLayout = useCallback(({ nativeEvent }) => {
      const _layout = nativeEvent.layout;
      setChartLayout({ height: _layout.height, width: _layout.width });
    }, []);

    if (!loading && dataTotal === 0) {
      return (
        <View
          style={[
            AppStyle.middleContent,
            {
              height,
            },
          ]}>
          <View
            style={[
              styles.zeroCircle,
              {
                borderWidth: newOuterRadius - newInnerRadius,
                width: newOuterRadius * 2,
                height: newOuterRadius * 2,
                borderRadius: newOuterRadius,
              },
            ]}
          />
          {renderCenteredText(centeredText)}
        </View>
      );
    }
    return (
      <View
        key={`pie-chart-${dataTotal === 0}`}
        style={[
          styles.graphWrapper,
          {
            width,
            height,
          },
        ]}
        onLayout={!chartLayout && onChartLayout}>
        {!loading && !!chartLayout && renderCenteredText(centeredText)}

        <Svg
          style={[style, !chartLayout && AppStyle.hide]}
          width={chartLayout && util.safePositiveValue(chartLayout.width)}
          height={chartLayout && util.safePositiveValue(chartLayout.height)}
          viewBox={
            chartLayout &&
            `${-chartLayout.width / 2} ${-chartLayout.height / 2} ${chartLayout.width} ${
              chartLayout.height
            }`
          }>
          {data?.map((item, i) => {
            return (
              <G key={`pie-group-${i}`}>
                {typeof item.color !== 'string' && (
                  <Defs>
                    <LinearGradient key={`pie-lineargradient-${i}`} id={`pie-lineargradient-${i}`}>
                      {item.color?.length > 0 &&
                        item.color.map((color, index) => {
                          return (
                            <Stop
                              key={`pie-stop-${index}`}
                              offset={index / (item.color.length - 1)}
                              stopColor={color}
                            />
                          );
                        })}
                    </LinearGradient>
                  </Defs>
                )}
                <Slice
                  d={createPieArc(
                    i,
                    newOuterRadius +
                      (selectedIndexes.includes(i) ? newActiveOuterRadius - newOuterRadius : 0),
                  )}
                  fill={
                    typeof item.color !== 'string' ? `url(#pie-lineargradient-${i})` : item.color
                  }
                  ref={refInput => (componentsRef.current[i] = refInput)}
                  onSelect={debounce(
                    () => {
                      handleOnSelect(i, slices.current[i], selectedIndexes.includes(i));
                    },
                    250,
                    { leading: true, trailing: false },
                  )}
                  {...(valueAccessor(item) < 0 && {
                    fill: styles.sliceContainer.backgroundColor,
                    stroke: item.color[1],
                    strokeWidth: 1,
                  })}
                  {...item.svg}
                />
              </G>
            );
          })}
          {selectedIndexes.map(k => {
            const item = data[k];
            if (isEmpty(item)) {
              return null;
            }
            const centroid = createPieCentroid(k);
            const visible =
              item && allowNegative ? Math.abs(valueAccessor(item)) : valueAccessor(item);
            return visible !== 0 ? (
              <Tooltip
                chartWidth={util.safePositiveValue(chartLayout.width)}
                chartHeight={util.safePositiveValue(chartLayout.height)}
                key={`pie-${centroid[0]}-${centroid[1]}-tooltip-${k}`}
                index={k}
                label={labelAccessor(item)}
                value={valueAccessor(item)}
                formatLabel={formatLabel}
                formatValue={formatValue}
                x={centroid[0]}
                y={centroid[1]}
                tooltipContainerStyle={{
                  ...styles.tooltipContainerStyle,
                  ...tooltipContainerStyle,
                }}
                renderTooltip={renderTooltip}
                style={style}
              />
            ) : null;
          })}
        </Svg>

        {(loading || !chartLayout || !interactionsComplete) && (
          <View style={styles.loader}>
            <ContentLoader
              name="pieChart"
              width={util.safePositiveValue(chartHeight)}
              height={util.safePositiveValue(chartHeight)}
            />
          </View>
        )}
      </View>
    );
  },
);
