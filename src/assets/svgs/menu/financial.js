import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const Financial = ({ active = false, ...props }) => (
  <Svg
    data-name="Group 157172"
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    {...props}>
    <Path data-name="Rectangle 4977" fill={active ? '#fff' : '#72228d'} d="M0 0h7.111v8.889H0z" />
    <Path data-name="Rectangle 4978" fill="#66e84b" d="M0 10.667h7.111V16H0z" />
    <Path
      data-name="Rectangle 4979"
      fill={active ? '#fff' : '#72228d'}
      d="M8.889 7.111H16V16H8.889z"
    />
    <Path data-name="Rectangle 4980" fill="#66e84b" d="M8.889 0H16v5.333H8.889z" />
  </Svg>
);

export default Financial;
