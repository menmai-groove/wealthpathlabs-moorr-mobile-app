import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

function BackIcon({ color = '#000000', ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={21}
      height={16.5}
      viewBox="0 0 21 16.5"
      {...props}>
      <G fill={color}>
        <Path
          data-name="Path 26065"
          d="M26.184 18.75H7.316a.78.78 0 010-1.5h18.868a.78.78 0 010 1.5z"
          transform="translate(.75 .75) translate(-6.5 -10.5)"
        />
        <Path
          data-name="Path 26066"
          d="M15 23.25a.748.748 0 01-.53-.22l-7.5-7.5a.75.75 0 010-1.061l7.5-7.5a.75.75 0 111.06 1.061L8.561 15l6.97 6.97A.75.75 0 0115 23.25z"
          transform="translate(.75 .75) translate(-7.5 -7.5)"
        />
      </G>
    </Svg>
  );
}

export default BackIcon;
