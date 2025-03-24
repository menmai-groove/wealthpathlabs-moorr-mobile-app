import util from 'libs/util';
import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

const Logo = ({ color = '#66e84b', width = 56, height = 56, ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={util.safePositiveValue(width)}
    height={util.safePositiveValue(height)}
    viewBox="0 0 56 56"
    {...props}>
    <G data-name="Group 157399">
      <G data-name="Group 156410">
        <G data-name="Group 145141">
          <Path
            data-name="Path 27151"
            d="M34.123 14a8.885 8.885 0 0 0-8.874 8.691 8.877 8.877 0 0 0-12.245 8.211v8.046h.01a2.743 2.743 0 1 0 5.486 0h.011v-8.046a3.37 3.37 0 1 1 6.739 0v3.257h.011a2.743 2.743 0 0 0 5.486 0h.011V22.877a3.37 3.37 0 1 1 6.739 0v6.493a2.753 2.753 0 1 1 5.507 0v-6.493A8.886 8.886 0 0 0 34.127 14"
            fill={color}
          />
          <Path
            data-name="Path 27152"
            d="M40.247 26.617a2.753 2.753 0 1 0 2.754 2.754 2.754 2.754 0 0 0-2.754-2.754"
            fill="#fff"
          />
        </G>
      </G>
    </G>
  </Svg>
);

export default Logo;
