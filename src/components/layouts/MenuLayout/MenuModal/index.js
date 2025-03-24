import { AppConfigs } from 'constant';
import { useThemedStyle } from 'providers';
import { useMenu } from 'providers/menu/consumer';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import Menu from 'screens/Menu';
import { selectCloseModalsRefreshId } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'screens.menuModal';

const DURATION = AppConfigs.menuAnimationDuration;

function MenuModal(_, ref) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { setMenuOpened } = useMenu();
  const { height: heightScreen } = useWindowDimensions();
  const closeModalsRefreshId = useSelector(selectCloseModalsRefreshId);
  const translateYAnim = useRef(new Animated.Value(heightScreen));
  const isOpened = useRef(false);

  useEffect(() => {
    translateYAnim.current.setValue(heightScreen);
  }, [heightScreen]);

  const show = useCallback(() => {
    isOpened.current = true;
    setMenuOpened(isOpened.current);
    Animated.timing(translateYAnim.current, {
      toValue: 0,
      duration: DURATION,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  }, [setMenuOpened]);

  const hide = useCallback(() => {
    isOpened.current = false;
    setMenuOpened(isOpened.current);
    Animated.timing(translateYAnim.current, {
      toValue: heightScreen,
      duration: DURATION,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  }, [heightScreen, setMenuOpened]);

  useEffect(() => {
    if (closeModalsRefreshId) {
      hide();
    }
  }, [closeModalsRefreshId, hide]);

  /**
   * Customize the instance value that is exposed to parent components when using `ref`
   */
  useImperativeHandle(
    ref,
    () => ({
      show,
      hide,
      isOpened: () => isOpened.current,
    }),
    [show, hide],
  );

  const opacity = translateYAnim.current.interpolate({
    inputRange: [0, heightScreen],
    outputRange: [1, 0],
  });
  const zIndex = translateYAnim.current.interpolate({
    inputRange: [0, heightScreen],
    outputRange: [0, -1],
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { zIndex }]}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.absoluteBackground, { opacity }]} />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          AppStyle.flex1,
          {
            transform: [
              {
                translateY: translateYAnim.current,
              },
            ],
          },
        ]}>
        <Menu />
      </Animated.View>
    </Animated.View>
  );
}

export default forwardRef(MenuModal);
