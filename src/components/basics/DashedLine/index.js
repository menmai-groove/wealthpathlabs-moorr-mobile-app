import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { AppStyle } from 'theme';

const DashedLine = ({
  dashGap = 2,
  dashLength = 4,
  dashThickness = 1,
  dashColor = '#DFDFEB',
  dashStyle,
  style,
}) => {
  const [lineLength, setLineLength] = useState(0);
  const numOfDashes = Math.ceil(lineLength / (dashGap + dashLength));

  const dashStyles = useMemo(
    () => ({
      width: dashLength,
      height: dashThickness,
      marginRight: dashGap,
      marginBottom: 0,
      backgroundColor: dashColor,
    }),
    [dashColor, dashGap, dashLength, dashThickness],
  );

  return (
    <View
      onLayout={event => {
        const { width } = event.nativeEvent.layout;
        setLineLength(width);
      }}
      style={[style, AppStyle.rowFlex]}>
      {[...Array(numOfDashes)].map((_, i) => {
        return <View key={i} style={[dashStyles, dashStyle]} />;
      })}
    </View>
  );
};

export default DashedLine;
