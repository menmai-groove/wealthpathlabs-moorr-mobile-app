import React from 'react';
import { useWindowDimensions } from 'react-native';
import ContentLoader from 'react-content-loader/native';
import { Rect } from 'react-native-svg';
import util from 'libs/util';

export function Loader() {
  const { width: widthScreen } = useWindowDimensions();
  return (
    <ContentLoader
      speed={2}
      width={util.safePositiveValue(widthScreen)}
      height={1000}
      viewBox={`0 0 ${widthScreen} ${1000}`}
      backgroundColor="#b5b5b5"
      foregroundColor={'#cccccc'}>
      <Rect
        x="16"
        y="30"
        rx="6"
        ry="6"
        width={util.safePositiveValue(widthScreen - 30)}
        height="80"
      />
      <Rect
        x="16"
        y="120"
        rx="6"
        ry="6"
        width={util.safePositiveValue(widthScreen - 30)}
        height="80"
      />
      <Rect
        x="16"
        y="210"
        rx="6"
        ry="6"
        width={util.safePositiveValue(widthScreen - 30)}
        height="80"
      />
      <Rect
        x="16"
        y="300"
        rx="6"
        ry="6"
        width={util.safePositiveValue(widthScreen - 30)}
        height="80"
      />
      <Rect x="26" y="400" rx="4" ry="4" width={220} height="25" />
      <Rect x={widthScreen - 100} y="400" rx="4" ry="4" width={25} height="25" />
      <Rect x={widthScreen - 60} y="400" rx="4" ry="4" width={25} height="25" />
      <Rect
        x="16"
        y="440"
        rx="6"
        ry="6"
        width={util.safePositiveValue(widthScreen - 30)}
        height="100"
      />
      <Rect
        x="16"
        y="550"
        rx="6"
        ry="6"
        width={util.safePositiveValue(widthScreen - 30)}
        height="100"
      />
      <Rect
        x="16"
        y="660"
        rx="6"
        ry="6"
        width={util.safePositiveValue(widthScreen - 30)}
        height="100"
      />
      <Rect
        x="16"
        y="770"
        rx="6"
        ry="6"
        width={util.safePositiveValue(widthScreen - 30)}
        height="100"
      />
      <Rect
        x="16"
        y="880"
        rx="6"
        ry="6"
        width={util.safePositiveValue(widthScreen - 30)}
        height="100"
      />
    </ContentLoader>
  );
}
