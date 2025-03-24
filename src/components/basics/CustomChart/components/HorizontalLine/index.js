import util from 'libs/util';
import React from 'react';
import { Line } from 'react-native-svg';

export const HorizontalLine = ({
  y,
  value,
  stroke = '#d2d2e7',
  strokeWidth = 1,
  strokeDasharray = [3, 3],
}) => {
  return (
    <Line
      x1={'0%'}
      x2={'100%'}
      y1={y(value)}
      y2={y(value)}
      stroke={stroke}
      strokeWidth={util.safePositiveValue(strokeWidth)}
      strokeDasharray={strokeDasharray}
    />
  );
};
