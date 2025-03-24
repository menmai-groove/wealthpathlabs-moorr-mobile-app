import { useFocusEffect } from '@react-navigation/core';
import TextField from 'components/basics/TextField';
import React, { memo, useCallback, useState } from 'react';
import { Animated, View } from 'react-native';
import { ForeignObject } from 'react-native-svg';

const PADDING = 3;
const TRIANGLE_SIZE = 5;

export const Tooltip = memo(
  ({
    width,
    x: xFunction,
    y: yFunction,
    index,
    // label,
    value,
    // formatLabel,
    formatValue,
    styles,
    isFirst = false,
    isLast = false,
    newX,
  }) => {
    let x = newX ?? xFunction(index);
    const y = yFunction(value);
    const [contentSize, setContentSize] = useState(null);
    const [newPosition, setNewPosition] = useState({
      x: x,
      y: y,
    });
    const [placement, setPlacement] = useState(null);
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
        let _newX = x - layoutWidth * 0.5;
        const newY = y - layoutHeight * (1 + 0.2);
        const newXPosition =
          _newX < 0 ? PADDING : _newX + layoutWidth > width ? width - layoutWidth - PADDING : _newX;
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
        <Animated.View style={styles.tooltipContainer} onLayout={!contentSize && onLayout}>
          <View
            style={[
              styles.tooltipContent,
              {
                opacity,
              },
            ]}>
            <TextField style={styles.tooltipText}>
              {typeof formatValue === 'function' ? formatValue(value) : value}
            </TextField>
            <View
              style={[
                styles.tooltipArrow,
                {
                  borderLeftWidth: TRIANGLE_SIZE,
                  borderRightWidth: TRIANGLE_SIZE,
                },
                placement === 'top' && {
                  top: -TRIANGLE_SIZE,
                  borderBottomWidth: TRIANGLE_SIZE,
                },
                placement === 'bottom' && {
                  bottom: -TRIANGLE_SIZE,
                  borderTopWidth: TRIANGLE_SIZE,
                },
                isFirst && styles.left,
                isLast && styles.right,
              ]}
            />
          </View>
        </Animated.View>
      </ForeignObject>
    );
  },
);
