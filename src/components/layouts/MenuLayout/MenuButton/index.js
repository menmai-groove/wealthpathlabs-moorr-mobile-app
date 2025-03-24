import Close from 'assets/svgs/menu/close';
import Logo from 'assets/svgs/menu/logo';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants } from 'constant';
import { GlobalLib, UtilLib } from 'libs';
import util from 'libs/util';
import { useThemedStyle } from 'providers';
import { useMenu } from 'providers/menu/consumer';
import React, { useCallback } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.menuButton';

export function getMenuBoxHeight(insets) {
  return (
    AppConstants.layout.menu.buttonSize +
    (insets?.bottom || AppConstants.layout.menu.floatingBottom)
  );
}

function MenuButton() {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const insets = useSafeAreaInsets();
  const { menuOpened, buttonVisible } = useMenu();

  const toggle = useCallback(() => {
    UtilLib.handleConfigureNextLayoutAnimation();
    if (!menuOpened) {
      GlobalLib.MenuModal.get().show();
    } else {
      GlobalLib.MenuModal.get().hide();
    }
  }, [menuOpened]);

  if (!buttonVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.menuButtonContainer,
        { bottom: insets.bottom > 0 ? insets.bottom : AppConstants.layout.menu.floatingBottom },
      ]}>
      <TouchableField onPress={toggle}>
        <View
          style={[AppStyle.middleContent, styles.menuButton, menuOpened && styles.closeMenuButton]}>
          {menuOpened ? (
            <Close
              width={util.safePositiveValue(styles.closeIcon.width)}
              height={util.safePositiveValue(styles.closeIcon.height)}
            />
          ) : (
            <Logo
              width={util.safePositiveValue(styles.logoIcon.width)}
              height={util.safePositiveValue(styles.logoIcon.height)}
            />
          )}
        </View>
      </TouchableField>
    </Animated.View>
  );
}

export default MenuButton;
