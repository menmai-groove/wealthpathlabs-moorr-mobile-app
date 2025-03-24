import React from 'react';
import { Platform } from 'react-native';
import { Line } from 'react-native-svg';

const isIOS = Platform.OS === 'ios';

export const CustomHorizontalLine = ({ y, value = 0, color = '#60608E', strokeDasharray = [] }) => (
  <Line
    key={'center-horizontal-line'}
    x1={'0%'}
    x2={'100%'}
    y1={y(value)}
    y2={y(value)}
    stroke={color}
    strokeWidth={1}
    strokeDasharray={isIOS ? strokeDasharray : null}
    pointerEvents="none"
  />
);
