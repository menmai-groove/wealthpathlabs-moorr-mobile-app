import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const Email = props => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={16} height={12.8} {...props}>
    <Path
      data-name="Icon material-email"
      d="M14.4 0H1.6A1.6 1.6 0 0 0 .008 1.6L0 11.2a1.6 1.6 0 0 0 1.6 1.6h12.8a1.6 1.6 0 0 0 1.6-1.6V1.6A1.6 1.6 0 0 0 14.4 0Zm0 3.2L8 7.2l-6.4-4V1.6l6.4 4 6.4-4Z"
      fill="#cbcbcb"
    />
  </Svg>
);

export default Email;
