import * as React from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path } from 'react-native-svg';

function CheckCircleIcon(props) {
  return (
    <Svg
      data-name="Component 63 \u2013 18"
      xmlns="http://www.w3.org/2000/svg"
      width={28}
      height={28}
      viewBox="0 0 28 28"
      {...props}>
      <Defs>
        <ClipPath id="a">
          <Path data-name="Rectangle 2239" fill="#38c976" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
      <G transform="translate(-291 -225)">
        <Circle
          data-name="Ellipse 169"
          cx={14}
          cy={14}
          r={14}
          transform="translate(291 225)"
          fill="#fff"
        />
        <G data-name="Group 149576">
          <G data-name="Group 149575" clipPath="url(#a)" transform="translate(293 227)">
            <Path
              data-name="Path 74714"
              d="M12 0a12 12 0 1012 12A12 12 0 0012 0m6.141 9.252l-7.171 7.06a.8.8 0 01-1.128-.005L6.144 12.6a.8.8 0 111.132-1.13l3.138 3.143 6.6-6.5a.8.8 0 111.123 1.14"
              fill="#38c976"
            />
          </G>
        </G>
      </G>
    </Svg>
  );
}

export default CheckCircleIcon;
