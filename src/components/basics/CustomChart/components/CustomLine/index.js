import React from 'react';
import { Platform } from 'react-native';
import { Path } from 'react-native-svg';

const isIOS = Platform.OS === 'ios';

export const CustomLine = ({ line, color, strokeDasharray = [], strokeWidth = 1 }) => {
  return (
    <Path
      key={'custom-line-path'}
      d={line}
      stroke={color}
      strokeWidth={strokeWidth}
      fill={'none'}
      strokeDasharray={isIOS ? strokeDasharray : null}
      pointerEvents="none"
    />
  );
};
