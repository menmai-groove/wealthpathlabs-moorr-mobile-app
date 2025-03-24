import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const ArrowRight = props => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={6.5} height={11} {...props}>
    <Path
      d="M1 11a1 1 0 0 1-.707-1.707L4.086 5.5.293 1.707A1 1 0 0 1 1.707.293l4.5 4.5a1 1 0 0 1 0 1.414l-4.5 4.5A1 1 0 0 1 1 11Z"
      fill="#222"
    />
  </Svg>
);

export default ArrowRight;
