import { mergeArrayObjectIntoObject } from 'libs/util';
import { debounce } from 'lodash';
import { useThemedStyle } from 'providers';
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import themedStyles from './style';

function TouchableField(props: TouchableOpacityProps) {
  const { activeOpacity = 0.7, children, onPress = () => {}, style, ...restProps } = props;
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle(
    {
      container: {
        ...themedStyles.container,
        ...convertedStyle,
      },
    },
    'components.touchableField',
  );

  return (
    <TouchableOpacity
      {...restProps}
      activeOpacity={activeOpacity}
      hitSlop={styles.iconButtonHitSlop}
      style={styles.container}
      onPress={debounce(onPress, 250, { leading: true, trailing: false })}>
      {children}
    </TouchableOpacity>
  );
}

export default TouchableField;
