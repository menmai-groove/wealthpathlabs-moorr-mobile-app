import util from 'libs/util';
import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

const Close = ({ color = '#fff', width = 16, height = 16, ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={util.safePositiveValue(width)}
    height={util.safePositiveValue(height)}
    viewBox="0 0 16 16"
    {...props}>
    <G fill={color}>
      <Path
        data-name="Line 53"
        d="M15 16a1 1 0 0 1-.707-.293l-14-14a1 1 0 0 1 0-1.414 1 1 0 0 1 1.414 0l14 14A1 1 0 0 1 15 16Z"
      />
      <Path
        data-name="Line 54"
        d="M1 16a1 1 0 0 1-.707-.293 1 1 0 0 1 0-1.414l14-14a1 1 0 0 1 1.414 0 1 1 0 0 1 0 1.414l-14 14A1 1 0 0 1 1 16Z"
      />
    </G>
  </Svg>
);

export default Close;
