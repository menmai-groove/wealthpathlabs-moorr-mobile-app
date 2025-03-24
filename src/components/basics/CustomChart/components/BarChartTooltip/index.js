import { useFocusEffect } from '@react-navigation/core';
import TextField from 'components/basics/TextField';
import React, { memo, useCallback, useState } from 'react';
import { Platform, View } from 'react-native';
import { ForeignObject } from 'react-native-svg';

const PADDING = 3;
const TRIANGLE_SIZE = 5;

export const BarChartTooltip = memo(
  ({
    width,
    x: xFunction,
    y: yFunction,
    index,
    label,
    value,
    formatLabel,
    formatValue,
    styles,
    tooltipContainerStyle = {},
  }) => {
    const x = xFunction(index);
    const y = yFunction(value);
    const [contentSize, setContentSize] = useState(null);
    const [newPosition, setNewPosition] = useState({
      x: x,
      y: y,
    });
    // const [placement, setPlacement] = useState(null);
    const [refreshId, setRefreshId] = useState(Date.now());
    const [opacity, setOpacity] = useState(0);

    useFocusEffect(
      useCallback(() => {
        setRefreshId(Date.now());
      }, []),
    );

    const onLayout = useCallback(
      ({ nativeEvent }) => {
        const { width: layoutWidth, height: layoutHeight } = nativeEvent.layout;
        const newX = x - layoutWidth * 0.5;
        const newY = y - layoutHeight * 1.2;
        const overLeft = newX < PADDING;
        const overRight = newX + layoutWidth + PADDING > width;
        const newXPosition = overLeft ? PADDING : overRight ? width - layoutWidth - PADDING : newX;
        const newYPosition = newY < PADDING ? y + PADDING + TRIANGLE_SIZE : newY;

        setContentSize({
          width: layoutWidth,
          height: layoutHeight,
        });
        // setPlacement(newY < 0 ? 'top' : 'bottom');
        setNewPosition({
          x: newXPosition,
          y: newYPosition,
        });
        setRefreshId(Date.now());
        setOpacity(1);
      },
      [x, y, width],
    );

    const { borderColor, borderWidth, borderRadius, ...restTooltipContainerStyle } =
      tooltipContainerStyle;

    const textAlign = newPosition?.x > 0 ? 'left' : 'right';
    const hasLabel = label !== null && label !== undefined;
    const hasValue = value !== null && value !== undefined;

    return (
      <ForeignObject x={newPosition.x} y={newPosition.y} key={refreshId}>
        <View
          // onLayout={
          //   Tooltip_UI_VERSION === 2
          //     ? !contentSize && onContainerLayoutV2
          //     : !contentSize && onContainerLayout
          // }
          style={[
            styles.alignSelfCenter,
            Platform.OS === 'ios' && {
              borderColor,
              borderWidth,
              borderRadius,
              opacity,
            },
            // contentSize && {
            //   maxWidth: contentSize.width + (borderWidth ? 0.5 : 0),
            //   // maxHeight: contentSize.height,
            // },
          ]}>
          <View
            // onLayout={
            //   Tooltip_UI_VERSION === 2
            //     ? contentSize && !opacity && onContentLayoutV2
            //     : contentSize && !opacity && onContentLayout
            // }
            onLayout={!contentSize && onLayout}
            style={[
              Platform.OS === 'android' && {
                borderColor,
                borderWidth,
                borderRadius,
                opacity,
              },
              restTooltipContainerStyle,
            ]}>
            {hasLabel && (
              <TextField
                type="captain"
                style={{
                  textAlign,
                }}
                numberOfLines={3}>
                {typeof formatLabel === 'function' ? formatLabel(label) : label}
              </TextField>
            )}
            {hasValue && (
              <TextField
                style={[
                  styles.numberText,
                  {
                    textAlign,
                  },
                ]}
                font={hasLabel ? 'semi-bold' : 'captain'}
                numberOfLines={3}>
                {typeof formatValue === 'function' ? formatValue(value) : value}
              </TextField>
            )}
          </View>
        </View>
      </ForeignObject>
    );
  },
);
