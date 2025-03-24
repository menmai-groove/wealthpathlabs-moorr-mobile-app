import { useFocusEffect } from '@react-navigation/core';
import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import React, { useCallback, useState } from 'react';
import { Platform, View } from 'react-native';
import { ForeignObject } from 'react-native-svg';

import themedStyles from '../style';

const i18nScope = 'components.pieChart';

const Tooltip_UI_VERSION = 2;

const MemoizedTooltip = React.memo(
  ({
    chartWidth = 0,
    chartHeight = 0,
    x = 0,
    y = 0,
    label,
    value,
    formatLabel,
    formatValue,
    tooltipContainerStyle = {},
    renderTooltip,
  }) => {
    const styles = useThemedStyle(themedStyles, i18nScope);
    const [opacity, setOpacity] = useState(0);
    const [contentSize, setContentSize] = useState(null);
    const [refreshId, setRefreshId] = useState(Date.now());
    const [over, setOver] = useState('none');
    const [newPosition, setNewPosition] = useState({ x, y });

    useFocusEffect(
      useCallback(() => {
        setRefreshId(Date.now());
      }, []),
    );

    const onContainerLayout = useCallback(
      ({ nativeEvent }) => {
        const { width, height } = nativeEvent.layout;
        const layout = { width, height };
        const diffX = Math.abs(x) + width - chartWidth / 2;
        // const diffY = Math.abs(y) + height - chartHeight / 2;
        if (diffX > 0) {
          layout.width = width - diffX;
          layout.height = height + height * (layout.width / width);
        }
        // if (diffY > 0) {
        //   layout.height = height - diffY;
        //   layout.width = width + width * (layout.height / height);
        // }
        setContentSize({
          width: layout.width,
          height: layout.height,
        });
        setRefreshId(Date.now());
      },
      [chartWidth, x],
    );

    const onContainerLayoutV2 = useCallback(
      ({ nativeEvent }) => {
        const { width, height } = nativeEvent.layout;
        const layout = { width, height };
        const diffX = -Math.abs(x) - width - chartWidth / 2 + chartWidth;
        if (diffX < 0) {
          layout.width = Math.abs(x) + chartWidth / 2;
          layout.height = height + height * (layout.width / width);
        }
        setContentSize({
          width: layout.width,
          height: layout.height,
        });
        setRefreshId(Date.now());
      },
      [chartWidth, x],
    );

    const onContentLayout = useCallback(
      ({ nativeEvent }) => {
        const { height, width } = nativeEvent.layout;
        const xLeft = x - width;
        const xRight = x;
        const yTop = y - height;
        const yBottom = y;
        const newX = x < 0 ? xLeft : xRight;
        const newY = y < 0 ? yTop : yBottom;
        const diff = 5;
        const chartHeightMin = Math.ceil(chartHeight / 2) - diff;
        setNewPosition({
          x: newX,
          y:
            newY < 0
              ? Math.abs(newY) > chartHeightMin
                ? newY + height
                : newY
              : newY + height > chartHeightMin
              ? newY - height
              : newY,
        });
        setOver(
          Math.abs(newY) > chartHeightMin
            ? 'top'
            : newY + height > chartHeightMin
            ? 'bottom'
            : 'none',
        );
        setOpacity(1);
        setRefreshId(Date.now());
      },
      [x, y, chartHeight],
    );

    const onContentLayoutV2 = useCallback(
      ({ nativeEvent }) => {
        const { height, width } = nativeEvent.layout;
        const xLeft = x - width;
        const xRight = x;
        const yTop = y - height;
        const yBottom = y;
        const newX = x < 0 ? xLeft : xRight;
        const newY = y < 0 ? yTop : yBottom;
        const diff = 5;
        const chartWidthMin = Math.ceil(chartWidth / 2) - diff;
        const chartHeightMin = Math.ceil(chartHeight / 2) - diff;
        const newNewPosition = {
          x:
            newX < 0
              ? Math.abs(newX) > chartWidthMin
                ? newX + width
                : newX
              : newX + width > chartWidthMin
              ? newX - width
              : newX,
          y:
            newY < 0
              ? Math.abs(newY) > chartHeightMin
                ? newY + height
                : newY
              : newY + height > chartHeightMin
              ? newY - height
              : newY,
        };
        setNewPosition(newNewPosition);
        const first =
          newY < 0
            ? Math.abs(newY) > chartHeightMin
              ? 'top'
              : 'bottom'
            : newY + height > chartHeightMin
            ? 'bottom'
            : 'top';
        const after =
          newX < 0
            ? Math.abs(newX) > chartWidthMin
              ? 'left'
              : 'right'
            : newX + width > chartWidthMin
            ? 'right'
            : 'left';
        const newOver = `${first}_${after}`;
        setOver(newOver);
        setOpacity(1);
        setRefreshId(Date.now());
      },
      [x, y, chartHeight, chartWidth],
    );

    const textAlignV1 = x > 0 ? 'left' : 'right';
    const textAlignV2 = over.split('_')[1];
    const textAlign = Tooltip_UI_VERSION === 2 ? textAlignV2 : textAlignV1;

    const { borderColor, borderWidth, borderRadius, ...restTooltipContainerStyle } =
      tooltipContainerStyle;

    const hasLabel = label !== null && label !== undefined;
    const hasValue = value !== null && value !== undefined;

    const renderSquare = useCallback(() => {
      const isTopLeft = newPosition.y <= 0 && newPosition.x <= 0;
      const isTopRight = newPosition.y <= 0 && newPosition.x > 0;
      const isBottomLeft = newPosition.y > 0 && newPosition.x <= 0;
      const isBottomRight = newPosition.y > 0 && newPosition.x > 0;
      const isOverTop = over === 'top';
      const isOverBottom = over === 'bottom';
      return (
        <View
          style={[
            styles.square,
            isTopLeft && {
              ...(isOverTop ? styles.topLine : styles.bottomLine),
              ...styles.rightLine,
            },
            isTopRight && {
              ...(isOverTop ? styles.topLine : styles.bottomLine),
              ...styles.leftLine,
            },
            isBottomLeft && {
              ...(isOverBottom ? styles.bottomLine : styles.topLine),
              ...styles.rightLine,
            },
            isBottomRight && {
              ...(isOverBottom ? styles.bottomLine : styles.topLine),
              ...styles.leftLine,
            },
          ]}
        />
      );
    }, [newPosition, styles, over]);

    const renderSquareV2 = useCallback(() => {
      const overStyle = over.split('_').map(item => ({ [item]: 0 }));
      return <View style={[styles.squareV2, overStyle]} />;
    }, [styles, over]);

    return (
      <ForeignObject key={refreshId} x={newPosition.x} y={newPosition.y}>
        <View
          onLayout={
            Tooltip_UI_VERSION === 2
              ? !contentSize && onContainerLayoutV2
              : !contentSize && onContainerLayout
          }
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
            onLayout={
              Tooltip_UI_VERSION === 2
                ? contentSize && !opacity && onContentLayoutV2
                : contentSize && !opacity && onContentLayout
            }
            style={[
              Platform.OS === 'android' && {
                borderColor,
                borderWidth,
                borderRadius,
                opacity,
              },
              restTooltipContainerStyle,
            ]}>
            {typeof renderTooltip === 'function' ? (
              renderTooltip({ label, value, textAlign })
            ) : (
              <View>
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
            )}
            {Tooltip_UI_VERSION === 2 ? renderSquareV2() : renderSquare()}
          </View>
        </View>
      </ForeignObject>
    );
  },
);

export default MemoizedTooltip;
