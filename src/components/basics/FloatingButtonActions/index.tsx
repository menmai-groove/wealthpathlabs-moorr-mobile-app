import React, { useState } from 'react';
import { FloatingAction, IActionProps } from 'react-native-floating-action';
import { AppConstants } from 'constant';
import { useThemedStyle } from 'providers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isFunction } from 'lodash';

import themedStyles from './style';

interface IActions extends IActionProps {
  screenID: string;
}

interface IFloatingButtonActions {
  actions: IActions[];
  onPressItem?: (name: string) => void;
  onBtnPress?: () => void;
  bottom?: number;
  visible?: boolean;
  disabled?: boolean;
}

const i18nScope = 'components.floatingButtonActions';

export default function FloatingButtonActions({
  actions,
  onPressItem,
  onBtnPress,
  bottom,
  visible = true,
  disabled,
}: IFloatingButtonActions) {
  const styles = useThemedStyle({ ...themedStyles }, i18nScope);
  const insets = useSafeAreaInsets();
  const menuHeight =
    AppConstants.layout.menu.buttonSize +
    (insets.bottom || AppConstants.layout.menu.floatingBottom);
  const paddingBottom = bottom || menuHeight;
  const [isBtnFloatOpening, setIsBtnFloatOpening] = useState(false);
  return (
    <FloatingAction
      actions={actions}
      dismissKeyboardOnPress
      visible={visible}
      distanceToEdge={{
        horizontal: styles.btnFloating.right,
        vertical: paddingBottom,
      }}
      buttonSize={styles.icon.width}
      color={isBtnFloatOpening ? styles.activeIcon.backgroundColor : styles.icon.backgroundColor}
      tintColor={styles.icon.color}
      iconColor={isBtnFloatOpening ? styles.activeIcon.color : styles.icon.color}
      shadow={styles.btnShadow}
      showBackground
      onStateChange={state => {
        if (disabled) {
          return;
        }
        setIsBtnFloatOpening(!state.isActive);
        isFunction(onBtnPress) && onBtnPress();
      }}
      actionsPaddingTopBottom={2}
      onPressItem={onPressItem}
    />
  );
}
