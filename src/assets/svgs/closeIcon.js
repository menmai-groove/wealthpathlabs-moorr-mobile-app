import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

function CloseIcon(props) {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" {...props}>
      <G fill="#fff">
        <Path
          data-name="Line 53"
          d="M14 15a1 1 0 01-.707-.293l-14-14a1 1 0 010-1.414 1 1 0 011.414 0l14 14A1 1 0 0114 15z"
          transform="translate(-1096.5 -2229.5) translate(1097.5 2230.5)"
        />
        <Path
          data-name="Line 54"
          d="M0 15a1 1 0 01-.707-.293 1 1 0 010-1.414l14-14a1 1 0 011.414 0 1 1 0 010 1.414l-14 14A1 1 0 010 15z"
          transform="translate(-1096.5 -2229.5) translate(1097.5 2230.5)"
        />
      </G>
    </Svg>
  );
}

export default CloseIcon;
