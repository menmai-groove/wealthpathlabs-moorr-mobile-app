import util from 'libs/util';
import React from 'react';
import { Platform, View } from 'react-native';
import { Circle, ForeignObject, G } from 'react-native-svg';

const isIOS = Platform.OS === 'ios';

export const Decorator = ({
  x,
  y,
  index,
  value,
  size = 10,
  color,
  style = {},
  onPress = () => {},
  isSelected = false,
  newX,
  touchSizeScale = 1.5,
  disabled = false,
}) => {
  let positionX = newX ?? x(index);
  const positionY = y(value);
  return (
    <G key={index} x={positionX} y={positionY}>
      {/* Increase Touch Size */}
      <Circle
        fill={'transparent'}
        r={size * touchSizeScale}
        onPress={() => onPress(index)}
        disabled={disabled}
      />
      {!isIOS ? (
        <Circle
          pointerEvents="none"
          r={size / 2}
          stroke={isSelected ? style.stroke?.color : 'transparent'}
          strokeWidth={util.safePositiveValue(size / 4)}
          fill={isSelected ? color : 'transparent'}
        />
      ) : (
        <ForeignObject x={-size / 2} y={-size / 2}>
          <View
            pointerEvents="none"
            style={[
              style.decorator,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                borderWidth: size / 4,
              },
              isSelected && style.selectedTooltipOpacity,
            ]}
          />
        </ForeignObject>
      )}
    </G>
  );
};
