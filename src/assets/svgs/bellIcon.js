import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

function BellIcon({ color = '#fff', ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={21.311}
      height={22.5}
      viewBox="0 0 21.311 22.5"
      {...props}>
      <G data-name="Icon feather-bell" fill={color}>
        <Path
          data-name="Path 77859"
          d="M24.3 20.253H4.5a.754.754 0 01-.727-.536.74.74 0 01.307-.836 5.732 5.732 0 001.472-1.913A15.7 15.7 0 007.051 9.6a7.351 7.351 0 1114.7 0 16.275 16.275 0 001.559 7.48 5.586 5.586 0 001.408 1.8.75.75 0 01-.416 1.374zm-18.088-1.5h16.376a9.489 9.489 0 01-.593-.954 17.106 17.106 0 01-1.742-8.2 5.851 5.851 0 10-11.7 0 17.106 17.106 0 01-1.742 8.2 9.489 9.489 0 01-.596.954z"
          transform="translate(-3.742 -2.25)"
        />
        <Path
          data-name="Path 77860"
          d="M17.308 33.346a2.959 2.959 0 01-2.552-1.47.75.75 0 011.3-.753 1.45 1.45 0 002.509 0 .75.75 0 011.3.753 2.959 2.959 0 01-2.557 1.47z"
          transform="translate(-3.742 -2.25) translate(-2.907 -8.596)"
        />
      </G>
    </Svg>
  );
}

export default BellIcon;
