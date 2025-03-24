import React from 'react';
import { Defs, LinearGradient, Stop } from 'react-native-svg';

export const Gradient = ({ index, color }) => (
  <Defs key={`gradient-defs-${index}`}>
    <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
      <Stop offset={'0%'} stopColor={color} stopOpacity={0.4} />
      <Stop offset={'90%'} stopColor={color} stopOpacity={0} />
    </LinearGradient>
  </Defs>
);
