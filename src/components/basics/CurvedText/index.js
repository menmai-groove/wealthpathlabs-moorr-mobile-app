import util from 'libs/util';
import React from 'react';
import Svg, { Circle, G, Text as SvgText, TextPath, TSpan } from 'react-native-svg';

function CurvedText(props) {
  const {
    fill = '#000000',
    width = 100,
    height = 100,
    fontSize = width / 10,
    style,
    children,
  } = props;
  // return <SvgText fill={fill} inlineSize={60}>
  //   <TextPath href="#circle" startOffset="50%">
  //     <TSpan dx="0" dy={-fontSize} textAnchor="middle">
  //       {children}
  //     </TSpan>
  //   </TextPath>
  // </SvgText>

  return (
    <Svg
      style={style}
      width={util.safePositiveValue(width)}
      height={util.safePositiveValue(height)}
      viewBox={`0 0 ${width} ${height}`}>
      <G id="circle">
        <Circle r={width / 3} x={width / 2} y={width / 2} transform="rotate(90)" />
      </G>
      <SvgText fill={fill} inlineSize={fontSize}>
        <TextPath href="#circle" startOffset="50%">
          <TSpan dx="0" dy={-fontSize} textAnchor="middle">
            {children}
          </TSpan>
        </TextPath>
      </SvgText>
    </Svg>
  );
}

export default CurvedText;
