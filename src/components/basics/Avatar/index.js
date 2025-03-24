import TextField from 'components/basics/TextField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.avatar';

function Avatar({ style, size = 100, linearGradient = false, children }, ref) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);

  useImperativeHandle(ref, () => ({}));

  const renderAvatar = () => {
    switch (typeof children) {
      case 'object': {
        return children;
      }
      case 'string': {
        const fontSize = (size * 38) / 100;
        return (
          <TextField
            type="heading-1"
            style={[
              styles.avatarLetter,
              {
                fontSize,
                lineHeight: fontSize + 10,
              },
            ]}>
            {children
              ?.split(' ')
              .map(letter => letter[0])
              .join('')}
          </TextField>
        );
      }
      default: {
        return (
          <FastImage
            source={require('assets/images/optiIcon/smile.png')}
            style={[styles.optiImage]}
            resizeMode={FastImage.resizeMode.contain}
          />
        );
      }
    }
  };

  return (
    <View
      style={[
        AppStyle.middleContent,
        styles.circle,
        AppStyle.shadow,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        styles.containerStyle,
      ]}>
      {linearGradient ? (
        <LinearGradient
          style={[
            styles.smallCircle,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: (size * 0.9) / 2,
            },
          ]}
          colors={[styles.linearTop.color, styles.linearBottom.color]}
        />
      ) : (
        <View
          style={[
            styles.smallCircle,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: (size * 0.9) / 2,
            },
            styles.smallCircleStyle,
          ]}
        />
      )}
      {renderAvatar()}
    </View>
  );
}

export default forwardRef(Avatar);
