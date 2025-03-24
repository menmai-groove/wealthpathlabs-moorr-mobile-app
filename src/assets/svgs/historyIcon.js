import util from 'libs/util';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const HistoryIcon = ({ width = 23, height = 22, color = '#828282', ...props }) => (
  <Svg
    width={util.safePositiveValue(width)}
    height={util.safePositiveValue(height)}
    viewBox="0 0 23 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M12.66 2.75A8.57 8.57 0 006.68 5.166 8.148 8.148 0 004.2 11h-2.82l3.657 3.566.065.128L8.901 11H6.08c0-3.548 2.942-6.417 6.58-6.417 3.637 0 6.58 2.87 6.58 6.417 0 3.547-2.943 6.417-6.58 6.417a6.61 6.61 0 01-4.644-1.889L6.683 16.83a8.433 8.433 0 002.74 1.793 8.602 8.602 0 003.238.627 8.57 8.57 0 005.981-2.416A8.148 8.148 0 0021.12 11a8.148 8.148 0 00-2.478-5.834 8.57 8.57 0 00-5.981-2.416zm-.94 4.583v4.584l3.995 2.31.724-1.174-3.308-1.916V7.333h-1.41z"
      fill={color}
    />
  </Svg>
);

export default HistoryIcon;
