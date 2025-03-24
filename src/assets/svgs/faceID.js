import util from 'libs/util';
import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

const FaceID = ({ width = 30, height = 30, color = '#fff', ...rest }) => (
  <Svg
    data-name="Group 149556"
    xmlns="http://www.w3.org/2000/svg"
    width={util.safePositiveValue(width)}
    height={util.safePositiveValue(height)}
    viewBox="0 0 30 30"
    {...rest}>
    <Defs>
      <ClipPath id="a">
        <Path data-name="Rectangle 2230" fill={color} d="M0 0h30.147v30H0z" />
      </ClipPath>
    </Defs>
    <G data-name="Group 149557" clipPath="url(#a)" fill={color}>
      <Path
        data-name="Path 74709"
        d="M26.3 30H3.845A3.849 3.849 0 0 1 0 26.155V3.845A3.849 3.849 0 0 1 3.845 0H26.3a3.849 3.849 0 0 1 3.845 3.845v22.31A3.849 3.849 0 0 1 26.3 30M3.845 1.768a2.079 2.079 0 0 0-2.077 2.077v22.31a2.079 2.079 0 0 0 2.077 2.077H26.3a2.079 2.079 0 0 0 2.077-2.077V3.845A2.079 2.079 0 0 0 26.3 1.768Z"
      />
      <Path
        data-name="Path 74710"
        d="M7.22 11.257a.884.884 0 0 1-.884-.884V8.31a.884.884 0 1 1 1.768 0v2.063a.884.884 0 0 1-.884.884"
      />
      <Path
        data-name="Path 74711"
        d="M21.719 11.257a.884.884 0 0 1-.884-.884V8.31a.884.884 0 0 1 1.768 0v2.063a.884.884 0 0 1-.884.884"
      />
      <Path
        data-name="Path 74712"
        d="M12.115 18.179q-.321 0-.664-.028a.884.884 0 0 1 .143-1.762 2.987 2.987 0 0 0 2.449-.593 2.179 2.179 0 0 0 .493-1.595l-.009-.062V8.311a.884.884 0 0 1 1.768 0v5.732a3.95 3.95 0 0 1-.963 2.96 4.243 4.243 0 0 1-3.219 1.175"
      />
      <Path
        data-name="Path 74713"
        d="M14.352 24.814a5.588 5.588 0 0 1-5.087-3 .884.884 0 0 1 1.593-.766 4.04 4.04 0 0 0 7.037-.11.884.884 0 1 1 1.624.7 5.088 5.088 0 0 1-2.028 2.3 5.958 5.958 0 0 1-3.14.875"
      />
    </G>
  </Svg>
);

export default FaceID;
