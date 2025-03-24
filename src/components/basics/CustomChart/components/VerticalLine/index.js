import util from 'libs/util';
import React from 'react';
import { Platform } from 'react-native';
import { Line } from 'react-native-svg';

const isIOS = Platform.OS === 'ios';

export const VerticalLine = ({
  x,
  index,
  stroke = '#60608e',
  strokeWidth = 1,
  strokeDasharray = [],
  newX,
}) => {
  let positionX = newX ?? x(index);
  return (
    <Line
      x1={positionX}
      x2={positionX}
      y1={'0%'}
      y2={'100%'}
      stroke={stroke}
      strokeWidth={util.safePositiveValue(strokeWidth)}
      strokeDasharray={isIOS ? strokeDasharray : null}
    />
  );
};
