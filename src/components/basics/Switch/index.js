import TouchableField from 'components/basics/TouchableField';
import { useThemedStyle } from 'providers/';
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { Animated } from 'react-native';

import themedStyles from './style';

const i18nScope = 'components.switch';

function Switch({ name, value = false, onValueChange = () => {}, disabled }, ref) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const offsetX = useRef(new Animated.Value(value ? 1 : 0));
  const isTouchable = useRef(false);

  Animated.timing(offsetX.current, {
    toValue: value ? 1 : 0,
    duration: 200,
    useNativeDriver: false,
  }).start(({ finished }) => {
    if (finished) {
      isTouchable.current = true;
    }
  });

  const translateXInterpolate = offsetX.current.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 22],
    extrapolate: 'clamp',
  });

  const backgroundInterpolate = offsetX.current.interpolate({
    inputRange: [0, 1],
    outputRange: [styles.container.backgroundColor, styles.activeContainer.backgroundColor],
    extrapolate: 'clamp',
  });

  const toggleSwitch = useCallback(
    valueInput => {
      isTouchable.current && onValueChange({ name, value: !valueInput });
    },
    [name, onValueChange],
  );

  /**
   * Customize the instance value that is exposed to parent components when using `ref`
   */
  useImperativeHandle(
    ref,
    () => ({
      toggle: toggleSwitch,
    }),
    [toggleSwitch],
  );

  return (
    <TouchableField onPress={() => toggleSwitch(value)} disabled={disabled}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: backgroundInterpolate,
          },
          disabled && styles.disabledContainer,
        ]}>
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [
                {
                  translateX: translateXInterpolate,
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </TouchableField>
  );
}

export default forwardRef(Switch);
