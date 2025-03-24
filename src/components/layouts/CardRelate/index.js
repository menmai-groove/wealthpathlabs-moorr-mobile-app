import CheckCircleIcon from 'assets/svgs/onboardingInterview/checkCircleIcon';
import TextField from 'components/basics/TextField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers/';
import React, { useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import themedStyles from './style';

function CardRelate({ text, type, style, onPress, selected, disabled }) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({
    ...themedStyles,
    container: {
      ...themedStyles.container,
      ...convertedStyle,
    },
  });
  const color = useMemo(() => {
    switch (type) {
      case 0:
        return styles.justMe;
      case 1:
        return styles.mePartner;
      case 2:
        return styles.joint;
      case 3:
        return styles.other;
      default:
        return {};
    }
  }, [type, styles]);

  const Icon = useCallback(
    ({ cardType }) => {
      switch (cardType) {
        case 0: {
          return (
            <FastImage
              source={require('assets/images/optiIcon/justMe.png')}
              style={styles.first}
              resizeMode={FastImage.resizeMode.contain}
            />
          );
        }
        case 1: {
          return (
            <FastImage
              source={require('assets/images/optiIcon/ben.png')}
              style={styles.second}
              resizeMode={FastImage.resizeMode.contain}
            />
          );
        }
        case 2: {
          return (
            <FastImage
              source={require('assets/images/optiIcon/joint.png')}
              style={styles.third}
              resizeMode={FastImage.resizeMode.contain}
            />
          );
        }
        case 3: {
          return <TextField style={styles.fourth}>Other</TextField>;
        }
        default: {
          return null;
        }
      }
    },
    [styles],
  );

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: color.backgroundColor },
        disabled && styles.disabledContainer,
      ]}
      disabled={disabled}>
      <View style={[styles.imageBorder, { borderColor: color.borderColor }]}>
        <Icon cardType={type} />
      </View>
      <View style={styles.iconRight}>{selected ? <CheckCircleIcon /> : null}</View>
      <TextField style={styles.text} font="medium">
        {text}
      </TextField>
    </Pressable>
  );
}

export default CardRelate;
