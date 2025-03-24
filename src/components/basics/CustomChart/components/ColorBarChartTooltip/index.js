import TextField from 'components/basics/TextField';
import React, { useCallback, useState } from 'react';
import { Platform, View } from 'react-native';
import { ForeignObject } from 'react-native-svg';
import { AppStyle } from 'theme';

export const ColorBarChartTooltip = ({
  x: xFunction,
  y: yFunction,
  index,
  value,
  title,
  chartWidth,
  chartHeight,
  styles,

  formatValue,
  formatTitle,

  tooltipContainerStyle = {},
}) => {
  const x = xFunction(index);
  const y = yFunction(value);

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
      const newY = y <= chartHeight / 2 ? y : y - height;
      const newX = x <= chartWidth / 4 ? x : x <= chartWidth / 2 ? x - width / 2 : x - width;
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
    [x, y, chartHeight, chartWidth],
  );

  const renderContent = () => {
    return (
      <View style={styles.colorBarChartContainer}>
        <TextField style={styles.colorBarChartLabel}>
          {typeof formatTitle === 'function' ? formatTitle(title) : title}
        </TextField>

        <View style={AppStyle.marginTop5}>
          <TextField style={styles.colorBarChartValue}>
            {typeof formatValue === 'function' ? formatValue(value) : value}
          </TextField>
        </View>
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
