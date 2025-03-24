import { useThemedStyle } from 'providers';
import React from 'react';
import { Animated, Text } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.wheelPickerItem3';

function WheelPickerItem3({ item, isCenter, itemSize }) {
  const styles = useThemedStyle(themedStyles, i18nScope);

  return (
    <Animated.View
      style={[
        AppStyle.middleContent,
        styles.item,
        {
          width: itemSize * 0.8,
          height: itemSize * 0.8,
          borderRadius: (itemSize / 2) * 0.8,
        },
        isCenter && {
          width: itemSize,
          height: itemSize,
          borderRadius: itemSize / 2,
        },
      ]}>
      <Text>{item?.label}</Text>
    </Animated.View>
  );
}

export default WheelPickerItem3;
