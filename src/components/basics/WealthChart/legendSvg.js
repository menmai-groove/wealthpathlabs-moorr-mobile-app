import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function LegendSVG({ color = '#008FEB', ...props }) {
  return (
    <Svg
      width={40}
      height={15}
      viewBox="0 0 66 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path d="M1 21l19.5-3.5 19-8 14.5-5L65.5 1" stroke={color} />
    </Svg>
  );
}

export default LegendSVG;
