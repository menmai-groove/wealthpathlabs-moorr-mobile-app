import ArrowRightIcon from 'assets/svgs/arrowRightIcon';
import CheckCircleIcon from 'assets/svgs/onboardingInterview/checkCircleIcon';
import TextField from 'components/basics/TextField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { debounce } from 'lodash';
import { useThemedStyle } from 'providers/';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

function Option({ text, type = 'disable', style, onPress = () => {}, renderIcon = () => {} }) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({
    ...themedStyles,
    container: {
      ...themedStyles.container,
      ...convertedStyle,
    },
  });

  const IconLeft = useMemo(() => {
    let icon = renderIcon(type);
    switch (type) {
      case 'disable':
        return <View style={[styles.iconLeft, styles.iconLeftDisable]}>{icon}</View>;
      case 'enable':
      case 'complete':
        return <View style={styles.iconLeft}>{icon}</View>;
      case 'complete-all':
        return <View style={[styles.iconLeft, styles.iconLeftComplete]}>{icon}</View>;
      default:
        break;
    }
  }, [renderIcon, styles, type]);

  const IconRight = useMemo(() => {
    switch (type) {
      case 'disable':
        return <View style={styles.iconRightDisable} />;
      case 'enable':
        return <View style={styles.iconRight}>{<ArrowRightIcon />}</View>;
      case 'complete':
      case 'complete-all':
        return <CheckCircleIcon />;
      default:
        break;
    }
  }, [styles, type]);
  return (
    <Pressable
      style={[styles.container, type === 'complete-all' && styles.complete]}
      onPress={debounce(onPress, 250, { leading: true, trailing: false })}
      disabled={type === 'disable'}>
      <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
        {IconLeft}
        <TextField style={styles.text}>{text}</TextField>
        {IconRight}
      </View>
    </Pressable>
  );
}

export default Option;
