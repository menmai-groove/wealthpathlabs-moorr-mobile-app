import { RangeChartTooltipV2 } from 'components/basics/CustomChart/components/RangeChartTooltip/RangeChartTooltipV2';
import ContentLoader from 'components/layouts/ContentLoader';
import NoDataAvailable from 'components/layouts/NoDataAvailable';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import util from 'libs/util';
import { concat, isArray, isEmpty, isNil } from 'lodash';
import { useThemedStyle } from 'providers';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { InteractionManager, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import { Area, Chart, HorizontalAxis, Line, VerticalAxis } from 'react-native-responsive-linechart';
import { Path } from 'react-native-svg';
import {
  AreaChart,
  BarChart,
  Grid,
  LineChart,
  StackedBarChart,
  YAxis,
} from 'react-native-svg-charts';
import { AppStyle } from 'theme';

import {
  Bar,
  BarChartTooltip,
  CustomGrid,
  CustomHorizontalLine,
  CustomLine,
  CustomXAxis,
  Decorator,
  Gradient,
  HorizontalLine,
  RangeChartTooltip,
  StackedBarChartTooltip,
  Tooltip,
  VerticalLine,
} from './components';
import CustomAreaChart from './components/CustomAreaChart';
import themedStyles from './style';

const i18nScope = 'components.customChart';

const BarChartTypes = {
  BAR_CHART_SVG: 1,
  AREA_BAR_CHART: 2,
  AREA_COLOR_BAR_CHART: 3,
};
const RangeChartTypes = {
  RANGE_CHART_SVG: 1,
  RESPONSIVE_LINE_CHART: 2,
};

const SPACING_INNER = 0.3;
const ITEM_WIDTH_LINE_CHART = 80;
const ITEM_WIDTH_STACKED_CHART = 60; // NOTE: if value === 80, the latest bar can't show tooltip
const STACKED_CHART_ITEM_LENGTH = 6;
const NUMBER_POINT_RENDER = 10;
const ANIMATED_BAR_CHART_ITEM_LENGTH = 5;

const CustomChart = (
  {
    loading = false,
    type = 'area-chart',
    width = 600,
    height = 300,
    keys = [],
    colors = [],
    data = [],
    barData = [],
    activeColor = '#fd8354',
    color = '#ececf5',
    gridColor = '#ececf5',
    diff = 0.2,
    high,
    highColor = '#008FEB',
    low,
    lowColor = '#FF0000',
    numberOfTicks = 8,
    xAxisHeight = 20,
    yAxisWidth = 50,
    defaultIndexes = [],
    labelAccessor = () => {},
    valueAccessor = () => {},
    formatLabel,
    formatValue,
    formatTitle,
    formatKey,
    barVersion = BarChartTypes.AREA_BAR_CHART,
    multiple = true,
    transparent = false,
    style,
    barWidth = 10,
    tooltipType = 1,
    scrollToEnd = false,
    contentInset = {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    },
    hideLabel = false,
    pinchNZoom = false,
    tooltipValueAccessor = () => {},
    tooltipFormatValue,
    onTooltipSelected,
    onScroll = () => {},
    viewportWidth = 300,
    rangeChartVersion = RangeChartTypes.RANGE_CHART_SVG,
    onChangeViewport = () => {},
    disableBackgroundAreaChart,
  },
  ref,
) => {
  const { t } = useTranslation();
  const styles = useThemedStyle({ ...themedStyles }, i18nScope);

  const isAreaChart = useMemo(() => type === 'area-chart', [type]);
  const isBarChart = useMemo(() => type === 'bar-chart', [type]);
  const isCombineChart = useMemo(() => type === 'combine-chart', [type]);
  const isCombineChartLineAndBar = useMemo(() => type === 'combine-chart-line-bar', [type]);
  const isStackedBarChart = useMemo(() => type === 'stacked-bar-chart', [type]);
  const isMultiLineChart = useMemo(() => type === 'multi-line-chart', [type]);
  const isRangeChart = useMemo(() => type === 'range-chart', [type]);
  const min = useMemo(
    () =>
      Math.min(
        ...(isMultiLineChart
          ? data.map(item => item.data).flat()
          : concat(
              ...[data, barData, high, low].filter(value => value !== null && value !== undefined),
            )
        ).map(item => valueAccessor(item)),
      ),
    [barData, data, valueAccessor, isMultiLineChart],
  );
  const max = useMemo(
    () =>
      Math.max(
        ...(isMultiLineChart
          ? data.map(item => item.data).flat()
          : concat(
              ...[data, barData, high, low].filter(value => value !== null && value !== undefined),
            )
        ).map(item => valueAccessor(item)),
        1,
      ),
    [barData, data, valueAccessor, isMultiLineChart],
  );
  const formatMax = useMemo(() => max + max * diff, [diff, max]);
  const formatMin = useMemo(
    () => (isStackedBarChart || isBarChart ? Math.min(min, 0) : min),
    [min, isStackedBarChart, isBarChart],
  );

  const [selectedIndexes, setSelectedIndexes] = useState(defaultIndexes);
  const [selectedType, setSelectedType] = useState(type);
  const [layoutRendered, setLayoutRendered] = useState(false);
  const [interactionsComplete, setInteractionsComplete] = useState(false);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const scrollViewRef = useRef();
  const timeoutRenderRef = useRef();
  // const scale = useSharedValue(1);
  // const savedScale = useSharedValue(1);
  const [loaded, setLoaded] = useState(!isRangeChart);
  const contentOffsetX = useRef(0);

  const lineChartRef = useRef(null);
  const initialChartRef = useRef(false);

  const _data = useMemo(() => {
    if (isArray(data)) {
      return data;
    }
    return null;
  }, [data]);
  const _dataLength = useMemo(() => _data?.length, [_data]);

  const multiLineChartData = useMemo(() => {
    return _data
      ?.map(item => ({
        ...item.data,
        svg: {
          ...item?.svg,
        },
      }))
      .flat();
  }, [_data]);

  useEffect(() => {
    typeof onTooltipSelected === 'function' && onTooltipSelected(selectedIndexes);
  }, [selectedIndexes]);
  useEffect(() => {
    return () => {
      timeoutRenderRef.current && clearTimeout(timeoutRenderRef.current);
    };
  }, []);

  const handlePress = useCallback(
    index => {
      if (multiple) {
        setSelectedIndexes(prevState => {
          if (prevState.includes(index)) {
            return prevState.filter(pv => pv !== index);
          }
          return [...prevState, index];
        });
        return;
      }
      setSelectedIndexes(prevState => {
        if (prevState.includes(index)) {
          const idxs = prevState.filter(pv => pv !== index);

          return idxs;
        }
        return [index];
      });
    },
    [multiple],
  );

  const handlePressDecorator = useCallback(
    index => {
      if (!loaded) {
        return;
      }
      setSelectedType(prevState => {
        if (prevState !== 'area-chart') {
          setSelectedIndexes([]);
        }
        return 'area-chart';
      });
      handlePress(index);
    },
    [handlePress, loaded],
  );

  const handlePressBar = useCallback(
    index => {
      setSelectedType(prevState => {
        if (prevState !== 'bar-chart') {
          setSelectedIndexes([]);
        }
        return 'bar-chart';
      });
      handlePress(index);
    },
    [handlePress],
  );

  const onLayout = useCallback(
    e => {
      if (e.nativeEvent?.layout?.width) {
        setLayoutWidth(e.nativeEvent.layout.width);
        onScroll({ layoutWidth: e.nativeEvent.layout.width });
      }
      timeoutRenderRef.current = setTimeout(() => {
        setLayoutRendered(true);
      }, 1000);
    },
    [onScroll],
  );

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setInteractionsComplete(true);
    });

    return () => handle.cancel();
  }, []);

  const [pointData, setPointData] = useState([]);

  useEffect(() => {
    const dataFiltered = _data
      ?.filter(item => item?.type === 'point')
      ?.map(item => ({
        ...item,
        x:
          item.x +
          (isRangeChart && rangeChartVersion === RangeChartTypes.RESPONSIVE_LINE_CHART
            ? 0
            : contentInset.left),
      }));
    let timeout;
    if (dataFiltered?.length > 0) {
      if (pointData?.length < dataFiltered?.length) {
        if (isRangeChart && rangeChartVersion === RangeChartTypes.RESPONSIVE_LINE_CHART) {
          setPointData(dataFiltered);
        } else {
          timeout = setTimeout(() => {
            const _ = dataFiltered?.filter(
              (x, idx) => idx > dataFiltered?.length - (pointData?.length + NUMBER_POINT_RENDER),
            );
            _.sort((x, y) => x.x - y.x);
            setPointData(_);
          }, 400);
        }
      } else {
        setLoaded(true);
      }
    }

    if (isAreaChart) {
      setLoaded(true);
    }

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [_data, contentInset, pointData, isRangeChart, rangeChartVersion]);

  // const disableScroll = () => {
  //   scrollViewRef.current?.setNativeProps({
  //     scrollEnabled: false,
  //   });
  // };
  // const enableScroll = () => {
  //   scrollViewRef.current?.setNativeProps({
  //     scrollEnabled: true,
  //   });
  //   scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  // };

  const handleClearIndexes = useCallback(() => {
    setSelectedIndexes([]);
  }, []);

  useEffect(() => {
    if (pinchNZoom && _dataLength) {
      handleClearIndexes();
    }
  }, [pinchNZoom, _dataLength, handleClearIndexes]);

  // const minScale = 1 * 0.3;
  // const maxScale = 1;
  const pinchGesture = Gesture.Pinch()
    .enabled(pinchNZoom)
    .onTouchesDown(({ numberOfTouches }) => {
      // console.log('onTouchesDown', numberOfTouches);
      if (numberOfTouches >= 2) {
        // runOnJS(disableScroll)();
      }
    })
    // .onBegin(e => {
    //   console.log('onBegin', e);
    // })
    .onStart(() => {
      // NOTE: run when pinch
      // runOnJS(handleClearIndexes)();
    })
    .onUpdate(e => {
      // let newScaleValue = savedScale.value * e.scale;
      // limit newScaleValue min and max
      // newScaleValue = Math.min(maxScale, Math.max(minScale, newScaleValue * maxScale));
      // scale.value = newScaleValue;
    })
    .onEnd(() => {
      // console.log('onEnd');
      // savedScale.value = scale.value;
    })
    .onFinalize(({ numberOfPointers }) => {
      // NOTE: run when all finger move up
      // console.log('onFinalize');
      if (numberOfPointers >= 2) {
        // runOnJS(enableScroll)();
      }
    });
  const tapGesture = Gesture.Tap()
    .enabled(isRangeChart)
    .numberOfTaps(1)
    .onTouchesUp(e => {
      // NOTE: touches up without drag and drop
      // runOnJS(() => {
      //   const pointX = contentOffsetX.current + e.allTouches[0].x;
      //   const newPointData = pointData?.map(pointItem => ({
      //     ...pointItem,
      //     distance: Math.abs(pointItem.x - pointX),
      //   }));
      //   const minDistance = Math.min(...newPointData.map(item => item.distance));
      //   const nearestIndex = newPointData.findIndex(
      //     pointItem => pointItem.distance === minDistance,
      //   );
      //   handlePressDecorator(nearestIndex);
      // })();
    });

  const _length = Math.max(_data?.length, ANIMATED_BAR_CHART_ITEM_LENGTH);
  const gap = barWidth * 0.3 * (_length - 1);
  // const minScaleWidth = barWidth * 0.3 * _length + contentInset.left + contentInset.right + gap;
  const maxScaleWidth = barWidth * _length + contentInset.left + contentInset.right + gap;
  // const animatedBarChartWidthStyles = useAnimatedStyle(() => ({
  //   width: interpolate(scale.value, [minScale, maxScale], [minScaleWidth, maxScaleWidth]),
  // }));
  // const animatedBarWidthStyles = useAnimatedStyle(() => ({
  //   width: interpolate(scale.value, [minScale, maxScale], [10, 30]),
  // }));

  useEffect(() => {
    if (viewportWidth > 0 && !initialChartRef.current) {
      const xDomainMax = Math.max(
        ..._data.filter(item => item?.type === 'interval').map(item => item.x),
      );
      const _min = Math.max(0, xDomainMax - viewportWidth);
      const _max = _min + viewportWidth;
      onChangeViewport({ x: { min: _min, max: _max } });
      initialChartRef.current = true;
    }
    return () => {};
  }, [_data, onChangeViewport, viewportWidth]);

  useImperativeHandle(ref, () => ({
    clearTooltip: () => {
      setSelectedIndexes([]);
      isRangeChart && lineChartRef.current?.setTooltipIndex(undefined);
    },
  }));

  const renderAreaChart = useCallback(() => {
    const newWidth = Math.max(ITEM_WIDTH_LINE_CHART * _data.length, width);
    const newHeight = height;

    const generateLine = (dataProp = []) => {
      // Extract the values for the AreaChart and the line path
      const values = dataProp.map(item => item.value);

      // Define the xScale with time if your x-values represent dates/times
      const x = d3Scale
        .scaleTime()
        .domain([0, values.length - 1])
        .range([0, newWidth]);

      const y = d3Scale
        .scaleLinear()
        .domain([formatMin, formatMax])
        .range([newHeight - contentInset.bottom, contentInset.top]);

      // Define the line generator using d3-shape
      const lineGenerator = d3Shape
        .line()
        .x((d, i) => x(i)) // Use the x scale for time-based values
        .y(d => y(d)) // Use the y scale for the data values
        .curve(d3Shape.curveMonotoneX);

      // Generate the path
      const linePath = lineGenerator(values);
      return linePath;
    };

    // Generate the path
    const highLinePath = generateLine(high);
    const lowLinePath = generateLine(low);

    return (
      <View>
        <AreaChart
          style={{
            width: newWidth,
            height: newHeight,
          }}
          data={_data.map((item, ii) => ({
            ...item,
            svg: {
              ...item.svg,
              onPress: () => {
                handlePress(ii);
              },
            },
          }))}
          xAccessor={({ index }) => index}
          xScale={d3Scale.scaleTime}
          yAccessor={({ item }) => valueAccessor(item)}
          gridMin={formatMin}
          gridMax={formatMax}
          numberOfTicks={numberOfTicks}
          contentInset={contentInset}
          svg={{
            fill: isCombineChart && disableBackgroundAreaChart ? 'transparent' : 'url(#gradient)',
          }}
          curve={d3Shape.curveMonotoneX}
          animate>
          <CustomGrid
            belowChart
            direction={isCombineChart ? Grid.Direction.BOTH : Grid.Direction.VERTICAL}
            svg={{
              stroke: gridColor,
            }}
            horizontalSvg={{
              strokeDasharray: [3, 3],
            }}
          />

          <Gradient color={color} />

          {/* center-line */}
          {isCombineChart && <CustomHorizontalLine color={'#60608E'} value={0} />}

          {selectedType === 'area-chart' &&
            selectedIndexes.map(vi => (
              <HorizontalLine key={`horizontal-line-${vi}`} value={valueAccessor(data[vi])} />
            ))}

          {selectedType === 'area-chart' &&
            selectedIndexes.map(vi => <VerticalLine key={`vertical-line-${vi}`} index={vi} />)}

          {/* Overlay the line using the generated path */}
          {isCombineChart && high?.length > 0 && low?.length > 0 ? (
            <>
              <Path
                pointerEvents="none"
                d={highLinePath}
                fill="none"
                stroke={highColor}
                strokeDasharray={[3, 3]}
              />
              <Path
                pointerEvents="none"
                d={lowLinePath}
                fill="none"
                stroke={lowColor}
                strokeDasharray={[3, 3]}
              />
            </>
          ) : null}

          {/* high-line */}
          {/* {isCombineChart && high && (
            <CustomHorizontalLine color={highColor} value={high} strokeDasharray={[3, 3]} />
          )} */}
          {/* low-line */}
          {/* {isCombineChart && low && (
            <CustomHorizontalLine color={lowColor} value={low} strokeDasharray={[3, 3]} />
          )} */}

          {isCombineChart &&
            barData.map((bItem, bi) => (
              <Bar
                key={`bar-${bi}`}
                index={bi}
                value={valueAccessor(bItem)}
                onPress={handlePressBar}
                activeColor={activeColor}
                color={activeColor}
                isSelected={selectedIndexes.includes(bi) && selectedType === 'bar-chart'}
                disabled={valueAccessor(bItem) === null}
              />
            ))}

          <CustomLine color={color} />

          {data.map((item, vi) => (
            <Decorator
              key={`decorator-group-${vi}`}
              index={vi}
              value={valueAccessor(item)}
              size={10}
              color={color}
              style={styles}
              onPress={handlePressDecorator}
              isSelected={selectedIndexes.includes(vi) && selectedType === 'area-chart'}
              disabled={valueAccessor(item) === null}
            />
          ))}

          {selectedType === 'area-chart' &&
            selectedIndexes.map(vi => (
              <Tooltip
                key={`foreign-object-${vi}`}
                index={vi}
                type={type}
                width={util.safePositiveValue(width)}
                styles={styles}
                label={labelAccessor(data[vi])}
                value={valueAccessor(data[vi])}
                formatLabel={formatLabel}
                formatValue={formatValue}
                isFirst={vi === 0}
                isLast={vi === data.length - 1}
              />
            ))}

          {selectedType === 'bar-chart' &&
            selectedIndexes.map(vi => (
              <Tooltip
                key={`foreign-object-${vi}`}
                index={vi}
                type={type}
                width={util.safePositiveValue(width)}
                styles={styles}
                label={labelAccessor(barData[vi])}
                value={valueAccessor(barData[vi])}
                formatLabel={formatLabel}
                formatValue={formatValue}
                isFirst={vi === 0}
                isLast={vi === barData.length - 1}
              />
            ))}
        </AreaChart>
        <View
          style={[
            AppStyle.flexEndContent,
            {
              minHeight: xAxisHeight + 4,
            },
            AppStyle.marginTop2,
          ]}>
          <CustomXAxis
            data={_data}
            xAccessor={({ index }) => index}
            scale={d3Scale.scaleTime}
            formatLabel={(value, index) => {
              const label =
                typeof labelAccessor === 'function' ? labelAccessor(_data[index]) : value;
              return typeof formatLabel === 'function' ? formatLabel(label) : label;
            }}
            contentInset={{
              left: contentInset.left,
              right: contentInset.right,
            }}
            svg={styles.xAxisSvg}
            activeSvg={styles.activeXAxisSvg}
            selectedIndexes={selectedIndexes}
            styles={styles}
            style={[{ height: xAxisHeight + 4 }]}
          />
        </View>
      </View>
    );
  }, [
    _data,
    activeColor,
    barData,
    color,
    contentInset,
    data,
    formatLabel,
    formatMax,
    formatMin,
    formatValue,
    gridColor,
    handlePress,
    handlePressBar,
    handlePressDecorator,
    height,
    high,
    highColor,
    isCombineChart,
    labelAccessor,
    low,
    lowColor,
    numberOfTicks,
    selectedIndexes,
    selectedType,
    styles,
    type,
    valueAccessor,
    width,
    xAxisHeight,
  ]);

  const renderBarChart = useCallback(() => {
    if (barVersion === BarChartTypes.AREA_COLOR_BAR_CHART) {
      const _defaultData =
        _data.length > ANIMATED_BAR_CHART_ITEM_LENGTH
          ? _data
          : Array(ANIMATED_BAR_CHART_ITEM_LENGTH)
              .fill({
                label: '',
                value: 0,
              })
              .map((item, index) => ({ ...item, ...(_data?.[index] ?? {}) }));
      return (
        <View>
          <CustomAreaChart
            animated
            style={[
              // animatedBarChartWidthStyles,
              {
                height,
                width: maxScaleWidth,
              },
            ]}
            data={_defaultData.map((item, ii) => ({
              ...item,
              svg: {
                ...item.svg,
                onPress: () => {
                  handlePress(ii);
                },
              },
            }))}
            xAccessor={({ index }) => index}
            xScale={d3Scale.scaleTime}
            yAccessor={({ item }) => valueAccessor(item)}
            gridMin={formatMin}
            gridMax={formatMax}
            numberOfTicks={numberOfTicks}
            contentInset={contentInset}
            curve={d3Shape.curveNatural}
            animate>
            <CustomGrid
              belowChart
              direction={Grid.Direction.HORIZONTAL}
              svg={{
                stroke: gridColor,
              }}
              horizontalSvg={{
                strokeDasharray: [3, 3],
              }}
            />

            {_data.length > 0 &&
              _data.map((bItem, bi) => {
                const myActiveColor = bItem?.svg?.fill ?? bItem?.color?.[0] ?? activeColor;
                const myColor = transparent ? myActiveColor + '50' : myActiveColor;
                const isSelected =
                  selectedIndexes.length > 0
                    ? selectedIndexes.includes(bi) && selectedType === 'bar-chart'
                    : null;

                return (
                  <Bar
                    key={`bar-${bi}`}
                    index={bi}
                    value={valueAccessor(bItem)}
                    onPress={handlePressBar}
                    activeColor={myActiveColor}
                    color={myColor}
                    isSelected={isSelected}
                    barWidth={util.safePositiveValue(barWidth)}
                    rx={5}
                    ry={5}
                    // animatedStyles={animatedBarWidthStyles}
                    type={2}
                  />
                );
              })}

            {tooltipType === 2 &&
              selectedIndexes.map(vi => (
                <BarChartTooltip
                  key={`bar-foreign-object-${vi}`}
                  index={vi}
                  type={type}
                  width={util.safePositiveValue(width)}
                  styles={styles}
                  label={labelAccessor(_defaultData[vi])}
                  value={valueAccessor(_defaultData[vi])}
                  formatLabel={formatLabel}
                  formatValue={formatValue}
                  isFirst={vi === 0}
                  isLast={vi === _defaultData.length - 1}
                  tooltipContainerStyle={styles.tooltipContainerStyle}
                />
              ))}

            {tooltipType === 1 &&
              selectedIndexes.map(vi => (
                <Tooltip
                  key={`foreign-object-${vi}`}
                  index={vi}
                  type={type}
                  width={util.safePositiveValue(width)}
                  styles={styles}
                  label={labelAccessor(_defaultData[vi])}
                  value={valueAccessor(_defaultData[vi])}
                  formatLabel={formatLabel}
                  formatValue={formatValue}
                  isFirst={vi === 0}
                  isLast={vi === _defaultData.length - 1}
                />
              ))}
          </CustomAreaChart>
          <View
            style={[
              AppStyle.flexEndContent,
              {
                minHeight: xAxisHeight,
              },
            ]}>
            {!hideLabel && (
              <CustomXAxis
                data={_defaultData}
                xAccessor={({ index }) => index}
                formatLabel={(value, index) => {
                  const label =
                    typeof labelAccessor === 'function'
                      ? labelAccessor(_defaultData[index])
                      : value;
                  return typeof formatLabel === 'function' ? formatLabel(label) : label;
                }}
                contentInset={{
                  left: contentInset.left,
                  right: contentInset.right,
                }}
                svg={styles.xAxisSvg}
                activeSvg={styles.activeXAxisSvg}
                selectedIndexes={selectedIndexes}
                styles={styles}
              />
            )}
          </View>
        </View>
      );
    }

    if (barVersion === BarChartTypes.AREA_BAR_CHART) {
      const _defaultData =
        _data.length > STACKED_CHART_ITEM_LENGTH
          ? _data
          : Array(STACKED_CHART_ITEM_LENGTH)
              .fill({
                label: '',
                value: 0,
              })
              .map((item, index) => ({ ...item, ...(_data?.[index] ?? {}) }));
      return (
        <View>
          <AreaChart
            style={[
              {
                width: Math.max(barWidth * _data.length, width),
                height,
              },
            ]}
            data={_defaultData.map((item, ii) => ({
              ...item,
              svg: {
                ...item.svg,
                onPress: () => {
                  handlePress(ii);
                },
              },
            }))}
            xAccessor={({ index }) => index}
            xScale={d3Scale.scaleTime}
            yAccessor={({ item }) => valueAccessor(item)}
            gridMin={formatMin}
            gridMax={formatMax}
            numberOfTicks={numberOfTicks}
            contentInset={contentInset}
            curve={d3Shape.curveNatural}
            animate>
            <CustomGrid
              belowChart
              direction={Grid.Direction.HORIZONTAL}
              svg={{
                stroke: gridColor,
              }}
              horizontalSvg={{
                strokeDasharray: [3, 3],
              }}
            />

            {data.map((bItem, bi) => {
              const myActiveColor = bItem?.svg?.fill ?? bItem?.color?.[0] ?? activeColor;
              const myColor = transparent ? myActiveColor + '50' : myActiveColor;

              return (
                <Bar
                  type={2}
                  key={`bar-${bi}`}
                  index={bi}
                  value={valueAccessor(bItem)}
                  onPress={handlePressBar}
                  activeColor={myActiveColor}
                  color={myColor}
                  isSelected={selectedIndexes.includes(bi) && selectedType === 'bar-chart'}
                  barWidth={util.safePositiveValue(barWidth)}
                  rx={5}
                  ry={5}
                />
              );
            })}

            {tooltipType === 2 &&
              selectedIndexes.map(vi => (
                <BarChartTooltip
                  key={`bar-foreign-object-${vi}`}
                  index={vi}
                  type={type}
                  width={util.safePositiveValue(width)}
                  styles={styles}
                  label={labelAccessor(_defaultData[vi])}
                  value={valueAccessor(_defaultData[vi])}
                  formatLabel={formatLabel}
                  formatValue={formatValue}
                  isFirst={vi === 0}
                  isLast={vi === _defaultData.length - 1}
                  tooltipContainerStyle={styles.tooltipContainerStyle}
                />
              ))}

            {tooltipType === 1 &&
              selectedIndexes.map(vi => (
                <Tooltip
                  key={`foreign-object-${vi}`}
                  index={vi}
                  type={type}
                  width={util.safePositiveValue(width)}
                  styles={styles}
                  label={labelAccessor(_defaultData[vi])}
                  value={valueAccessor(_defaultData[vi])}
                  formatLabel={formatLabel}
                  formatValue={formatValue}
                  isFirst={vi === 0}
                  isLast={vi === _defaultData.length - 1}
                />
              ))}
          </AreaChart>
          <View
            style={[
              AppStyle.flexEndContent,
              {
                width: Math.max(ITEM_WIDTH_LINE_CHART * _data.length, width),
                minHeight: xAxisHeight,
              },
            ]}>
            {!hideLabel && (
              <CustomXAxis
                data={_defaultData}
                xAccessor={({ index }) => index}
                formatLabel={(value, index) => {
                  const label =
                    typeof labelAccessor === 'function'
                      ? labelAccessor(_defaultData[index])
                      : value;
                  return typeof formatLabel === 'function' ? formatLabel(label) : label;
                }}
                contentInset={{
                  left: contentInset.left,
                  right: contentInset.right,
                }}
                svg={styles.xAxisSvg}
                activeSvg={styles.activeXAxisSvg}
                selectedIndexes={selectedIndexes}
                styles={styles}
              />
            )}
          </View>
        </View>
      );
    }

    if (barVersion === BarChartTypes.BAR_CHART_SVG) {
      return (
        <View
          style={{
            width: Math.max(ITEM_WIDTH_LINE_CHART * _data.length, width),
            height,
          }}>
          <BarChart
            style={AppStyle.flex1}
            data={_data.map((item, ii) => ({
              ...item,
              svg: {
                ...item.svg,
                ...styles.barChartItemSvg,
                // stroke: selectedIndexes.includes(ii) ? activeColor : color,
                stroke: activeColor,
                onPress: () => handlePress(ii),
              },
            }))}
            xAccessor={({ item, index }) => labelAccessor(item) ?? index}
            xScale={d3Scale.scaleBand}
            yAccessor={({ item }) => valueAccessor(item)}
            gridMin={formatMin}
            gridMax={formatMax}
            numberOfTicks={numberOfTicks}
            contentInset={{
              top: contentInset.top,
              bottom: contentInset.bottom,
            }}
            svg={{}}
            spacingInner={1}
            spacingOuter={0.5}
            animate>
            <CustomGrid
              belowChart={true}
              direction={Grid.Direction.HORIZONTAL}
              svg={{
                stroke: gridColor,
                strokeDasharray: [3, 3],
              }}
            />
            {selectedIndexes.map(vi => (
              <Tooltip
                key={`foreign-object-${vi}`}
                index={vi}
                type={type}
                width={util.safePositiveValue(width)}
                styles={styles}
                label={labelAccessor(data[vi])}
                value={valueAccessor(data[vi])}
                formatLabel={formatLabel}
                formatValue={formatValue}
                isFirst={vi === 0}
                isLast={vi === data.length - 1}
              />
            ))}
          </BarChart>
          <View
            style={[
              AppStyle.flexEndContent,
              {
                minHeight: xAxisHeight,
              },
            ]}>
            <CustomXAxis
              data={_data}
              scale={d3Scale.scaleBand}
              xAccessor={({ index }) => index}
              formatLabel={index => {
                const label =
                  typeof labelAccessor === 'function' ? labelAccessor(_data[index]) : _data[index];
                return typeof formatLabel === 'function' ? formatLabel(label) : label;
              }}
              svg={styles.xAxisSvg}
              activeSvg={styles.activeXAxisSvg}
              selectedIndexes={selectedIndexes}
              styles={styles}
              contentInset={{}}
              style={{ height: xAxisHeight }}
            />
          </View>
        </View>
      );
    }
    return null;
  }, [
    _data,
    activeColor,
    contentInset,
    data,
    formatLabel,
    formatMax,
    formatMin,
    formatValue,
    gridColor,
    handlePress,
    handlePressBar,
    height,
    labelAccessor,
    numberOfTicks,
    selectedIndexes,
    selectedType,
    styles,
    type,
    valueAccessor,
    width,
    xAxisHeight,
    barVersion,
    barWidth,
    tooltipType,
    transparent,
    hideLabel,
    maxScaleWidth,
  ]);

  const renderStackedBarChart = useCallback(() => {
    const newWidth = Math.max(ITEM_WIDTH_STACKED_CHART * _data.length, width);

    let newValue = {};
    _data.length > 0 &&
      Object.keys(typeof _data[0]?.value === 'object' ? _data[0]?.value : {}).forEach(key => {
        newValue[key] = 0;
      });
    const _defaultData =
      _data.length > STACKED_CHART_ITEM_LENGTH
        ? _data
        : [
            ...Array(STACKED_CHART_ITEM_LENGTH - _data.length).fill({
              label: '',
              value: newValue,
            }),
            ..._data,
          ];
    return (
      <View>
        <StackedBarChart
          style={{
            width: newWidth,
            height,
          }}
          keys={keys}
          colors={colors}
          data={_defaultData.map((item, ii) => {
            const cloneObj = { ...item.value };
            Object.entries(cloneObj).forEach(([key, value]) => {
              cloneObj[key] = keys.includes(key)
                ? {
                    value,
                    svg: {
                      ...item?.svg,
                      onPress: () => {
                        handlePress(ii);
                      },
                    },
                  }
                : value;
            });
            const newData = {
              label: item.label,
              // ...item.value,
              ...cloneObj,
            };
            return newData;
          })}
          valueAccessor={({ item, key }) => {
            return item?.[key]?.value;
          }}
          xAccessor={({ index }) => index}
          // xScale={d3Scale.scaleTime}
          scale={d3Scale.scaleBand}
          yAccessor={({ item }) => valueAccessor(item)}
          gridMin={formatMin}
          gridMax={formatMax}
          numberOfTicks={numberOfTicks}
          contentInset={contentInset}
          spacingOuter={SPACING_INNER / 2}
          spacingInner={SPACING_INNER}>
          <CustomGrid
            belowChart
            direction={Grid.Direction.HORIZONTAL}
            svg={{
              stroke: gridColor,
            }}
            horizontalSvg={{
              strokeDasharray: [3, 3],
            }}
          />

          {selectedIndexes.map(vi => {
            return (
              <StackedBarChartTooltip
                key={`foreign-object-${vi}`}
                index={vi}
                value={_defaultData[vi]}
                itemWidth={util.safePositiveValue(
                  ((width - yAxisWidth) / _defaultData.length) * (1 - SPACING_INNER),
                )}
                chartWidth={util.safePositiveValue(width)}
                chartHeight={util.safePositiveValue(height)}
                styles={styles}
                formatLabel={formatLabel}
                formatValue={formatValue}
                formatTitle={formatTitle}
                formatKey={formatKey}
                isFirst={vi === 0}
                isLast={vi === _defaultData.length - 1}
                keys={keys}
                colors={colors}
                tooltipContainerStyle={{
                  ...styles.tooltipContainerStyle,
                }}
              />
            );
          })}
        </StackedBarChart>

        <View
          style={[
            AppStyle.flexEndContent,
            {
              minHeight: xAxisHeight,
            },
          ]}>
          <CustomXAxis
            data={_defaultData}
            scale={d3Scale.scaleBand}
            xAccessor={({ index }) => index}
            formatLabel={index => {
              const label =
                typeof labelAccessor === 'function'
                  ? labelAccessor(_defaultData?.[index])
                  : _data?.[index];
              return _defaultData?.[index]?.label === ''
                ? ''
                : typeof formatLabel === 'function'
                ? formatLabel(label)
                : label;
            }}
            contentInset={{
              left: contentInset.left,
              right: contentInset.right,
            }}
            svg={styles.xAxisSvg}
            activeSvg={styles.activeXAxisSvg}
            selectedIndexes={selectedIndexes}
            styles={styles}
          />
        </View>
      </View>
    );
  }, [
    _data,
    width,
    height,
    selectedIndexes,
    colors,
    contentInset,
    formatKey,
    formatLabel,
    formatMax,
    formatMin,
    formatTitle,
    formatValue,
    gridColor,
    handlePress,
    keys,
    labelAccessor,
    numberOfTicks,
    styles,
    valueAccessor,
    xAxisHeight,
    yAxisWidth,
  ]);

  const renderMultiLineChart = useCallback(() => {
    const xAxisData = _data.reduce((a, b) => (a.length < b.length ? b : a)).data;

    return (
      <View>
        <LineChart
          style={{
            width: Math.max(ITEM_WIDTH_LINE_CHART * xAxisData.length, width),
            height,
          }}
          data={_data}
          xAccessor={({ index }) => index}
          yAccessor={({ item }) => valueAccessor(item)}
          curve={d3Shape.curveMonotoneX}
          contentInset={contentInset}>
          <CustomGrid
            type={type}
            belowChart
            direction={Grid.Direction.VERTICAL}
            svg={{
              stroke: gridColor,
            }}
            horizontalSvg={{
              strokeDasharray: [3, 3],
            }}
          />
          {selectedIndexes.map(vi => {
            const dii = Number(vi.split('_')?.[0]);
            const index = Number(vi.split('_')?.[1]);
            return (
              <HorizontalLine
                key={`horizontal-line-${vi}`}
                value={valueAccessor(_data?.[dii]?.data[index])}
              />
            );
          })}

          {selectedIndexes.map(vi => {
            const index = Number(vi.split('_')?.[1]);
            return <VerticalLine key={`vertical-line-${vi}`} index={index} />;
          })}
          {_data?.map((dataItem, dii) => {
            return dataItem?.data?.map((item, vi) => {
              const newIndex = `${dii}_${vi}`;
              return (
                <Decorator
                  key={`decorator-group-${vi}`}
                  index={vi}
                  value={valueAccessor(item)}
                  size={10}
                  color={color}
                  style={styles}
                  onPress={() => {
                    handlePressDecorator(newIndex);
                  }}
                  isSelected={selectedIndexes.includes(newIndex)}
                />
              );
            });
          })}

          {isCombineChartLineAndBar &&
            barData.map((bItem, bi) => (
              <Bar
                key={`bar-${bi}`}
                index={bi}
                value={valueAccessor(bItem)}
                onPress={handlePressBar}
                activeColor={activeColor}
                color={activeColor}
                isSelected={selectedIndexes.includes(bi) && selectedType === 'bar-chart'}
              />
            ))}

          {selectedIndexes.map(vi => {
            const dii = Number(vi.split('_')?.[0]);
            const index = Number(vi.split('_')?.[1]);

            return (
              <Tooltip
                key={`foreign-object-${vi}`}
                index={index}
                type={type}
                width={util.safePositiveValue(width)}
                styles={styles}
                label={labelAccessor(_data?.[dii]?.data[index])}
                value={valueAccessor(_data?.[dii]?.data[index])}
                formatLabel={formatLabel}
                formatValue={formatValue}
                isFirst={index === 0}
                isLast={index === _data?.[dii]?.data?.length - 1}
              />
            );
          })}
        </LineChart>

        <View
          style={[
            AppStyle.flexEndContent,
            {
              minHeight: xAxisHeight,
            },
          ]}>
          <CustomXAxis
            data={isMultiLineChart ? xAxisData : _data}
            scale={d3Scale.scaleTime}
            xAccessor={({ index }) => index}
            formatLabel={index => {
              const label =
                typeof labelAccessor === 'function'
                  ? labelAccessor(xAxisData[index])
                  : xAxisData[index];
              return typeof formatLabel === 'function' ? formatLabel(label) : label;
            }}
            contentInset={{
              left: contentInset.left,
              right: contentInset.right,
            }}
            svg={styles.xAxisSvg}
            activeSvg={styles.activeXAxisSvg}
            selectedIndexes={selectedIndexes.map(selectedIndex =>
              Number(selectedIndex.split('_')?.[1]),
            )}
            styles={styles}
          />
        </View>
      </View>
    );
  }, [
    _data,
    width,
    height,
    contentInset,
    gridColor,
    selectedIndexes,
    xAxisHeight,
    isMultiLineChart,
    styles,
    valueAccessor,
    color,
    handlePressDecorator,
    type,
    labelAccessor,
    formatLabel,
    formatValue,
  ]);

  const renderRangeChart = useCallback(() => {
    const intervalData = _data
      .filter(item => item?.type === 'interval')
      .map(item => ({ ...item, x: item.x + contentInset.left }));

    return (
      <View>
        <CustomAreaChart
          style={[
            {
              width: width + contentInset.left + contentInset.right,
              height,
            },
          ]}
          data={pointData.map((item, ii) => ({
            ...item,
            svg: {
              ...item.svg,
              onPress: () => {
                handlePress(ii);
              },
            },
          }))}
          yAccessor={({ item }) => valueAccessor(item)}
          gridMin={formatMin}
          gridMax={formatMax}
          svg={{
            fill: 'url(#gradient)',
          }}
          numberOfTicks={numberOfTicks}
          contentInset={contentInset}
          curve={d3Shape.curveMonotoneX}
          animate={false}>
          <CustomGrid
            overideData={intervalData}
            belowChart
            direction={Grid.Direction.VERTICAL}
            svg={{
              stroke: gridColor,
            }}
            horizontalSvg={{
              strokeDasharray: [3, 3],
            }}
          />

          <Gradient color={color} />

          {selectedIndexes.map(vi => (
            <HorizontalLine key={`horizontal-line-${vi}`} value={valueAccessor(pointData[vi])} />
          ))}

          {selectedIndexes.map(vi => (
            <VerticalLine key={`vertical-line-${vi}`} index={vi} newX={pointData[vi]?.x} />
          ))}

          <CustomLine color={color} strokeWidth={2} />

          {pointData.map((item, vi) => (
            <Decorator
              key={`decorator-group-${vi}`}
              index={vi}
              value={valueAccessor(item)}
              size={10}
              color={color}
              style={styles}
              onPress={handlePressDecorator}
              newX={item?.x}
              isSelected={selectedIndexes.includes(vi)}
              touchSizeScale={1}
            />
          ))}

          {selectedIndexes.map(vi => (
            <RangeChartTooltip
              key={`foreign-object-${vi}`}
              index={vi}
              type={type}
              width={util.safePositiveValue(width)}
              styles={styles}
              value={valueAccessor(pointData[vi])}
              tooltipValue={tooltipValueAccessor(pointData[vi])}
              formatValue={formatValue}
              tooltipFormatValue={tooltipFormatValue}
              newX={pointData[vi]?.x}
            />
          ))}
        </CustomAreaChart>

        <View
          style={[
            AppStyle.flexEndContent,
            {
              width: width + contentInset.left + contentInset.right,
              minHeight: xAxisHeight,
            },
          ]}>
          <CustomXAxis
            data={intervalData}
            xAccessor={({ item }) => item.x}
            formatLabel={xAccessor => {
              const foundLabel = intervalData.find(item => item.x === xAccessor)?.label;
              return foundLabel;
            }}
            contentInset={{
              left: contentInset.left,
              right: contentInset.right,
            }}
            svg={styles.xAxisSvg}
            activeSvg={styles.activeXAxisSvg}
            styles={styles}
          />
        </View>
      </View>
    );
  }, [
    _data,
    width,
    contentInset,
    height,
    pointData,
    formatMin,
    formatMax,
    numberOfTicks,
    gridColor,
    color,
    selectedIndexes,
    xAxisHeight,
    styles,
    handlePress,
    valueAccessor,
    type,
    tooltipValueAccessor,
    formatValue,
    tooltipFormatValue,
    handlePressDecorator,
  ]);

  if (isNil(_data)) {
    return null;
  }

  if (!loading && isEmpty(_data)) {
    return (
      <View
        style={[
          AppStyle.middleContent,
          {
            height,
          },
        ]}>
        <NoDataAvailable
          type="none"
          title={t('global.emptyChartTitle')}
          description={t('global.emptyChartDescription')}
        />
      </View>
    );
  }

  const renderRangeChartV2 = () => {
    const intervalDataV2 = _data.filter(item => item?.type === 'interval');
    const xDomainMax = Math.max(...intervalDataV2.map(item => item.x));

    const pointDataV2 = pointData.map(item => ({
      ...item,
      x: item.x,
      y: item.value,
    }));

    if (!isRangeChart || pointDataV2.length === 0 || intervalDataV2.length === 0) {
      return null;
    }
    const _maxY = Math.max(...pointDataV2.map(item => valueAccessor(item)), 0);
    const _formatMax = _maxY + _maxY * diff;

    const yAxisMin = formatMin;
    const yAxisMax = formatMax;
    const domain = [yAxisMin, yAxisMax];
    const bottom = formatMin;
    const top = formatMax;
    const y = d3Scale
      .scaleLinear()
      .domain(domain)
      .range([height - bottom, top]);
    const ticksValues = y.ticks(numberOfTicks);

    const padding = {
      left: yAxisWidth,
      bottom: 20,
      right: 20,
      top: 10,
    };

    const smoothing = points => {
      const line = d3Shape
        .line()
        .x(d => d.x)
        .y(d => d.y)
        .defined(item => typeof item.y === 'number')
        .curve(d3Shape.curveMonotoneX)(points);
      return line;
    };

    return (
      <Chart
        // eslint-disable-next-line react-native/no-inline-styles
        style={{ height, width: '100%' }}
        data={pointDataV2}
        padding={padding}
        xDomain={{ min: 0, max: xDomainMax }}
        yDomain={{ min: formatMin, max: _formatMax || 1 }}
        viewport={{
          size: { width: viewportWidth },
          initialOrigin: { x: Math.max(0, xDomainMax - viewportWidth) },
        }}
        onScroll={() => {
          setSelectedIndexes([]);
          lineChartRef.current.setTooltipIndex(undefined);
        }}
        onScrollEnd={({ viewportDomain }) => {
          onChangeViewport(viewportDomain);
        }}>
        <VerticalAxis
          tickValues={ticksValues}
          includeOriginTick={true}
          theme={{
            axis: { visible: false },
            ticks: { visible: false },
            grid: { visible: false },
            labels: {
              formatter: v => (typeof formatValue === 'function' ? formatValue(v) : v.toFixed(2)),
              label: {
                color: '#222222',
                fontSize: 10,
                fontFamily: 'Poppins-Regular',
              },
            },
          }}
        />
        <HorizontalAxis
          tickValues={intervalDataV2.map(item => item.x)}
          theme={{
            axis: { visible: false },
            ticks: { visible: false },
            grid: {
              visible: false,
            },
            labels: {
              label: {
                color: '#222222',
                fontSize: 10,
                fontFamily: 'Poppins-Regular',
              },
              formatter: v => intervalDataV2.find(item => item?.x === v)?.label ?? v.toFixed(1),
            },
          }}
        />
        {/* VerticalLine */}
        <HorizontalAxis
          tickValues={intervalDataV2.filter(item => item?.label !== '').map(item => item.x)}
          theme={{
            axis: { visible: false },
            ticks: { visible: false },
            grid: {
              visible: true,
              stroke: {
                color: '#F5F5FA',
                width: 1,
              },
            },
            labels: { visible: false },
          }}
        />

        <Area
          theme={{
            gradient: {
              from: { color, opacity: 0.8 },
              to: { color, opacity: 0.1 },
            },
          }}
          smoothing={smoothing}
        />
        <Line
          ref={lineChartRef}
          tooltipComponent={
            <RangeChartTooltipV2
              type={type}
              width={util.safePositiveValue(viewportWidth - padding.left - padding.right)}
              styles={styles}
              valueAccessor={valueAccessor}
              tooltipValueAccessor={tooltipValueAccessor}
              formatValue={formatValue}
              tooltipFormatValue={tooltipFormatValue}
            />
          }
          onTooltipSelect={(_, index) => {
            handlePressDecorator(index);
          }}
          theme={{
            stroke: { color, width: 2 },
            scatter: {
              default: {},
              selected: {
                width: 6,
                height: 6,
                rx: 6 / 2,
                color: 'white',
              },
            },
          }}
          smoothing={smoothing}
        />
      </Chart>
    );
  };

  return (
    <View style={style}>
      {
        <View style={[AppStyle.rowFlex, styles.hidden]} onLayout={!layoutRendered && onLayout}>
          {(loading || !layoutRendered || !interactionsComplete) && (
            <ContentLoader
              name="customChart"
              height={util.safePositiveValue(height + xAxisHeight)}
            />
          )}
          {!loading && layoutRendered ? (
            isRangeChart && rangeChartVersion === RangeChartTypes.RESPONSIVE_LINE_CHART ? (
              renderRangeChartV2()
            ) : (
              <>
                <YAxis
                  data={
                    isMultiLineChart
                      ? multiLineChartData
                      : isRangeChart
                      ? _data.filter(item => item.type === 'point')
                      : _data
                  }
                  yAccessor={({ item }) =>
                    typeof valueAccessor === 'function' ? valueAccessor(item) : item
                  }
                  contentInset={{ top: contentInset.top, bottom: contentInset.bottom }}
                  svg={styles.yAxisSvg}
                  formatLabel={value =>
                    typeof formatValue === 'function' ? formatValue(value) : value
                  }
                  style={[
                    styles.yAxisContainer,
                    {
                      minWidth: yAxisWidth,
                      marginBottom: xAxisHeight,
                    },
                  ]}
                  min={formatMin}
                  max={formatMax}
                  numberOfTicks={numberOfTicks}
                />

                <GestureDetector gesture={Gesture.Exclusive(pinchGesture, tapGesture)}>
                  <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onContentSizeChange={() => {
                      const x = width + (contentInset.left || 0) - (layoutWidth - yAxisWidth);
                      scrollToEnd
                        ? scrollViewRef.current?.scrollTo({ x: x, animated: false })
                        : null;
                    }}
                    onScroll={e => {
                      contentOffsetX.current = e.nativeEvent.contentOffset.x;
                      onScroll({ ...e, layoutWidth });
                    }}
                    scrollEventThrottle={16}
                    bounces={false}
                    nestedScrollEnabled>
                    {(isAreaChart || isCombineChart) && renderAreaChart()}

                    {isBarChart && renderBarChart()}

                    {isStackedBarChart && renderStackedBarChart()}

                    {isMultiLineChart && renderMultiLineChart()}

                    {isRangeChart && renderRangeChart()}
                  </ScrollView>
                </GestureDetector>
              </>
            )
          ) : null}
        </View>
      }
    </View>
  );
};
export default React.forwardRef(CustomChart);
