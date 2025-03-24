// https://github.com/software-mansion/react-native-svg/issues/1389
import util from 'libs/util';
import { isNull } from 'lodash';
import React from 'react';
import { View } from 'react-native';
import { ForeignObject, Rect } from 'react-native-svg';

const BarType = {
  SVG: 1,
  VIEW: 2,
};

export const Bar = ({
  type = BarType.SVG,
  x: xFunction,
  y: yFunction,
  index,
  value,
  onPress = () => {},
  isSelected = null,
  activeColor = '#E34242',
  color = '#ECECF4',
  barWidth = 10,
  rx,
  ry,
  animatedStyles,
  disabled = false,
}) => {
  const x = xFunction(index) - barWidth / 2; // center bar
  const y = value < 0 ? yFunction(0) : yFunction(value); // Update y position for positive numbers
  const backgroundColor = isNull(isSelected) ? activeColor : isSelected ? activeColor : color;
  const barViewStyle = {
    backgroundColor,
    height: Math.abs(yFunction(0) - yFunction(value)), // always positive numbers
    width: barWidth,
    borderTopLeftRadius: rx ?? barWidth / 2,
    borderTopRightRadius: rx ?? barWidth / 2,
  };
  if (type === BarType.VIEW) {
    return (
      <>
        <Rect
          style={animatedStyles}
          x={x}
          y={y}
          width={util.safePositiveValue(barViewStyle.width)}
          height={util.safePositiveValue(barViewStyle.height)}
          fill={'transparent'}
          onPress={() => {
            onPress(index);
          }}
          disabled={disabled}
        />
        <ForeignObject key={`bar-view-${isSelected}`} x={x} y={y}>
          <View style={[barViewStyle, animatedStyles]} />
        </ForeignObject>
      </>
    );
  }
  return (
    <Rect
      x={x} // center bar
      y={y}
      height={Math.abs(yFunction(0) - yFunction(value))} // always positive numbers
      width={util.safePositiveValue(barWidth)}
      fill={barViewStyle.backgroundColor}
      rx={rx ?? barWidth / 2}
      ry={ry ?? barWidth / 2}
      onPress={() => {
        onPress(index);
      }}
      disabled={disabled}
    />
  );
};
