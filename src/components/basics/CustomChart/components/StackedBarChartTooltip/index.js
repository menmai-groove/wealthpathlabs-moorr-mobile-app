import TextField from 'components/basics/TextField';
import React, { useCallback, useState } from 'react';
import { Platform, View } from 'react-native';
import { ForeignObject } from 'react-native-svg';
import { AppStyle } from 'theme';

export const StackedBarChartTooltip = ({
  x: xFunction,
  y: yFunction,
  index,
  value: tooltipValue,
  itemWidth,
  chartWidth,
  chartHeight,
  styles,

  // formatLabel,
  formatValue,
  formatTitle,
  formatKey,
  // isFirst = false,
  // isLast = false,

  keys,
  colors,

  tooltipContainerStyle = {},
}) => {
  const stackedBarChartYAccessor =
    typeof tooltipValue.value === 'object'
      ? Object.entries(tooltipValue.value)
          .map(([key, value]) => (keys.includes(key) ? value : 0))
          .reduce((a, b) => a + b, 0)
      : null;
  const x = xFunction(index);
  const y = yFunction(stackedBarChartYAccessor);

  const [opacity, setOpacity] = useState(0);
  const [contentSize, setContentSize] = useState(null);
  const [refreshId, setRefreshId] = useState(Date.now());
  const [over, setOver] = useState('none');
  const [newPosition, setNewPosition] = useState({ x, y });

  const { borderColor, borderWidth, borderRadius, ...restTooltipContainerStyle } =
    tooltipContainerStyle;

  const onContainerLayout = useCallback(({ nativeEvent }) => {
    const { width, height } = nativeEvent.layout;
    const layout = { width, height };
    // const diffX = -Math.abs(x) - width - chartWidth / 2 + chartWidth;
    // if (diffX < 0) {
    //   layout.width = Math.abs(x) + chartWidth / 2;
    //   layout.height = height + height * (layout.width / width);
    // }
    setContentSize({
      width: layout.width,
      height: layout.height,
    });
    setRefreshId(Date.now());
  }, []);

  const onContentLayout = useCallback(
    ({ nativeEvent }) => {
      const { width, height } = nativeEvent.layout;
      const newX =
        x <= chartWidth / 4
          ? x + itemWidth
          : x <= (chartWidth * 2) / 4
          ? x - (width - itemWidth) / 2
          : x - (width - itemWidth);
      const newY = y <= chartHeight / 2 ? y : y - height;
      const newNewPosition = {
        x: newX,
        y: newY,
      };
      const first = x <= chartWidth / 4 ? 'left' : x <= (chartWidth * 2) / 4 ? 'center' : 'right';
      const after = y <= chartHeight / 2 ? 'top' : 'bottom';
      const newOver = `${first}_${after}`;
      setOver(newOver);
      setNewPosition(newNewPosition);
      setOpacity(1);
      setRefreshId(Date.now());
    },
    [x, y, chartHeight, chartWidth, itemWidth],
  );

  const renderContent = () => {
    return (
      <View style={styles.stackedBarChartContainer}>
        <TextField style={styles.stackedBarChartLabel}>
          {typeof formatTitle === 'function' ? formatTitle(tooltipValue.label) : tooltipValue.label}
        </TextField>

        {typeof tooltipValue.value === 'object' ? (
          <View style={AppStyle.marginTop5}>
            {Object.entries(tooltipValue.value).map(([valueKey, valueValue]) => {
              const keyIndex = [...keys].findIndex(keyItem => keyItem === valueKey);
              return keys.includes(valueKey) ? (
                <View key={`value-${valueKey}`} style={[AppStyle.rowFlex]}>
                  <View
                    style={[
                      AppStyle.rowFlex,
                      AppStyle.alignContent,
                      AppStyle.flex1,
                      AppStyle.padRight2,
                    ]}>
                    <View
                      style={[
                        AppStyle.marginRight5,
                        styles.stackedBarChartSquare,
                        {
                          backgroundColor: colors[keyIndex],
                        },
                      ]}
                    />
                    <TextField style={[styles.stackedBarChartValue, AppStyle.flex1]}>
                      {typeof formatKey === 'function' ? formatKey(valueKey) : valueKey}
                    </TextField>
                  </View>
                  <TextField style={styles.stackedBarChartValue}>
                    {typeof formatValue === 'function' ? formatValue(valueValue) : valueValue}
                  </TextField>
                </View>
              ) : null;
            })}
          </View>
        ) : null}
      </View>
    );
  };

  const renderSquareV2 = useCallback(() => {
    const overStyle = over
      .split('_')
      .map(item => (item === 'center' ? { left: '50%' } : { [item]: 0 }));
    return <View style={[styles.squareV2, overStyle, { opacity }]} />;
  }, [styles, over, opacity]);

  return (
    <ForeignObject x={newPosition.x} y={newPosition.y} key={refreshId}>
      <View
        onLayout={!contentSize && onContainerLayout}
        style={[
          styles.alignSelfCenter,
          Platform.OS === 'ios' && {
            borderColor,
            borderWidth,
            borderRadius,
            opacity,
          },
          contentSize && {
            maxWidth: contentSize.width + (borderWidth ? 0.5 : 0),
            // maxHeight: contentSize.height,
          },
        ]}>
        <View
          onLayout={contentSize && !opacity && onContentLayout}
          style={[
            restTooltipContainerStyle,
            Platform.OS === 'android' && {
              borderColor,
              borderWidth,
              borderRadius,
              opacity,
            },
          ]}>
          {renderContent()}
        </View>
        {renderSquareV2()}
      </View>
    </ForeignObject>
  );
};
