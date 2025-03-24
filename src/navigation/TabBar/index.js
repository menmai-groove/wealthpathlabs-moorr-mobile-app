import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import themedStyle from './styles';

function TabBar(props) {
  const {
    state,
    descriptors,
    navigation,
    activeTextStyle,
    inactiveTextStyle,
    disabledTextStyle,
    style,
    tabStyle,
  } = props;
  const styles = useThemedStyle(themedStyle, 'components.tabBar');

  const onPress = useCallback(
    (route, isFocused) => {
      const { options } = descriptors[route.key];
      if (typeof options.onPress === 'function') {
        options.onPress();
        return;
      }
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    },
    [descriptors, navigation],
  );

  // const onLongPress = useCallback(
  //   route => {
  //     navigation.emit({
  //       type: 'tabLongPress',
  //       target: route.key,
  //     });
  //   },
  //   [navigation],
  // );

  return (
    <SafeAreaView
      style={[
        styles.safeView,
        {
          backgroundColor: style.backgroundColor,
        },
      ]}
      edges={['bottom']}>
      <View style={[styles.bottomTabContainer, style]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;
          const disabled = options.disabled;

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={() => onPress(route, isFocused)}
              style={[styles.bottomTabButton, tabStyle]}
              disabled={disabled}>
              {options?.tabBarIcon &&
                options?.tabBarIcon({
                  focused: isFocused,
                  disabled,
                  ...props,
                })}
              {options?.tabBarTitle ? (
                options.tabBarTitle({
                  focused: isFocused,
                  disabled,
                  ...props,
                  label,
                })
              ) : (
                <TextField
                  style={
                    disabled ? disabledTextStyle : isFocused ? activeTextStyle : inactiveTextStyle
                  }>
                  {label}
                </TextField>
              )}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default TabBar;
