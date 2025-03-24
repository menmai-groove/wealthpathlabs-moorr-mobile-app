import util from 'libs/util';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function TrashIcon(props) {
  const { fill = '#fff', width = 10.5, height = 12, ...rest } = props;
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={util.safePositiveValue(width)}
      height={util.safePositiveValue(height)}
      viewBox="0 0 10.5 12"
      {...rest}>
      <Path
        id="Icon_awesome-trash-alt"
        data-name="Icon awesome-trash-alt"
        d="M.75,10.875A1.125,1.125,0,0,0,1.875,12h6.75A1.125,1.125,0,0,0,9.75,10.875V3h-9Zm6.375-6a.375.375,0,0,1,.75,0v5.25a.375.375,0,0,1-.75,0Zm-2.25,0a.375.375,0,1,1,.75,0v5.25a.375.375,0,1,1-.75,0Zm-2.25,0a.375.375,0,1,1,.75,0v5.25a.375.375,0,1,1-.75,0ZM10.125.75H7.312L7.092.312A.563.563,0,0,0,6.588,0H3.909a.556.556,0,0,0-.5.312L3.187.75H.375A.375.375,0,0,0,0,1.125v.75a.375.375,0,0,0,.375.375h9.75a.375.375,0,0,0,.375-.375v-.75A.375.375,0,0,0,10.125.75Z"
        transform="translate(0 0)"
        fill={fill}
      />
    </Svg>
  );
}
