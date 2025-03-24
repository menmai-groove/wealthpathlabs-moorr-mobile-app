import { useFocusEffect } from '@react-navigation/core';
import TextField from 'components/basics/TextField';
import React, { memo, useCallback, useState } from 'react';
import { Animated, View } from 'react-native';
import { ForeignObject } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Entypo';

const PADDING = 3;
const TRIANGLE_SIZE = 5;
const TOOLTIP_MARGIN_PADDING = 10;

export const RangeChartTooltip = memo(
  ({
    width = 0,
    x: xFunction,
    y: yFunction,
    index,
    value,
    formatValue,
    styles,
    newX,
    newY: yNew,
    tooltipValue,
    tooltipFormatValue,
    border,
  }) => {
    let x = newX ?? xFunction(index);
    const y = yNew ?? yFunction(value);
    const [contentSize, setContentSize] = useState(null);
    const [newPosition, setNewPosition] = useState({
      x: x,
      y: y,
    });
    const [placement, setPlacement] = useState(null);
    const [refreshId, setRefreshId] = useState(Date.now());
    const [opacity, setOpacity] = useState(0);
    const isTop = placement === 'top';
    const isBottom = placement === 'bottom';
    const isLessThanLeft = x <= contentSize?.width / 2;
    const isGreaterThanRight = x >= width - contentSize?.width / 2;

    useFocusEffect(
      useCallback(() => {
        setRefreshId(Date.now());
      }, []),
    );

    const onLayout = useCallback(
      ({ nativeEvent }) => {
        const { width: layoutWidth, height: layoutHeight } = nativeEvent.layout;

        const lessThanLeft = x <= layoutWidth / 2;
        const greaterThanRight = x >= width - layoutWidth / 2;

        const _newX = x;
        const newY = y - layoutHeight * (1 + 0.2);
        const newXPosition = lessThanLeft
          ? _newX - PADDING - TRIANGLE_SIZE - TOOLTIP_MARGIN_PADDING
          : greaterThanRight
          ? _newX - layoutWidth + PADDING + TRIANGLE_SIZE + TOOLTIP_MARGIN_PADDING
          : _newX - layoutWidth / 2;
        setContentSize({
          width: layoutWidth,
          height: layoutHeight,
        });
        setPlacement(newY < 0 ? 'top' : 'bottom');
        const newYPosition = newY < 0 ? y + PADDING + TRIANGLE_SIZE : newY;
        setNewPosition({
          x: newXPosition,
          y: newYPosition,
        });
        setRefreshId(Date.now());
        setOpacity(1);
      },
      [x, y, width],
    );

    return (
      <ForeignObject x={newPosition.x} y={newPosition.y} key={refreshId}>
        <Animated.View style={[styles.tooltipContainer]} onLayout={!contentSize && onLayout}>
          <View
            style={[
              styles.tooltipContent,
              {
                opacity,
              },
              border,
            ]}>
            <TextField style={styles.tooltipText}>
              {typeof tooltipFormatValue === 'function'
                ? tooltipFormatValue(tooltipValue)
                : typeof formatValue === 'function'
                ? formatValue(value)
                : value}
            </TextField>
            <Ionicons
              style={[
                styles.triangle2,
                isTop && styles.borderTriangleTop,
                isBottom && styles.borderTriangleBottom,
                isLessThanLeft && styles.borderTriangleLeft,
                isGreaterThanRight && styles.borderTriangleRight,
              ]}
              name={isTop ? 'triangle-up' : 'triangle-down'}
              color={'#ffffff'}
              size={18}
            />
            <Ionicons
              style={[
                styles.triangle2,
                isTop && styles.triangleTop,
                isBottom && styles.triangleBottom,
                isLessThanLeft && styles.triangleLeft,
                isGreaterThanRight && styles.triangleRight,
              ]}
              name={isTop ? 'triangle-up' : 'triangle-down'}
              color={'#541868'}
              size={14}
            />
            {/* <View
              style={[
                styles.tooltipArrow,
                {
                  borderLeftWidth: TRIANGLE_SIZE,
                  borderRightWidth: TRIANGLE_SIZE,
                },
                isTop && {
                  top: -TRIANGLE_SIZE,
                  borderBottomWidth: TRIANGLE_SIZE,
                },
                placement === 'bottom' && {
                  bottom: -TRIANGLE_SIZE,
                  borderTopWidth: TRIANGLE_SIZE,
                },
                isLessThanLeft && styles.left,
                isGreaterThanRight && styles.right,
              ]}
            /> */}
          </View>
        </Animated.View>
      </ForeignObject>
    );
  },
);
