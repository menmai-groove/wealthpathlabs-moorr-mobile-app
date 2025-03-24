import CurvedText from 'components/basics/CurvedText';
import util from 'libs/util';
import { useThemedStyle } from 'providers';
import React from 'react';
import { Animated } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.wheelPickerItem1';

function WheelPickerItem1({ item, isCenter, itemSize = 50, size = 100 }) {
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
      {item?.label?.split(' ').map((word, i) => (
        <CurvedText
          key={i}
          style={[
            styles.curvedText,
            {
              top: i * 20,
            },
          ]}
          // fill={isCenter ? '#FFFFFF' : '#31354B'}
          width={util.safePositiveValue(size)}
          height={util.safePositiveValue(size)}
          fontSize={12}>
          {word}
        </CurvedText>
      ))}
    </Animated.View>
  );
}

export default WheelPickerItem1;
