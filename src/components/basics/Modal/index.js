import TouchableField from 'components/basics/TouchableField';
import { useThemedStyle } from 'providers';
import React from 'react';
import { View } from 'react-native';
import RNModal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AIcon from 'react-native-vector-icons/AntDesign';
import { AppSize } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.customModal';

function Modal({
  containerStyle,
  children,
  hasBackdrop = true,
  hideCloseButton = false,
  statusBarTranslucent = true,
  visible,
  onBackdropPress = () => {},
  onBackButtonPress = () => {},
  onModalHide = () => {},
  onRequestClose = () => {},
  ...props
}) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const insets = useSafeAreaInsets();

  return (
    <RNModal
      animationIn="fadeInUp"
      style={[
        styles.modalContainer,
        hasBackdrop && styles.modalBackdrop,
        insets.top > 0 && { marginTop: insets.top / 2 + 50 },
        insets.bottom > 0 && { marginBottom: insets.bottom / 2 + 50 },
      ]}
      deviceHeight={AppSize.screen.height}
      hideModalContentWhileAnimating
      useNativeDriver
      useNativeDriverForBackdrop
      statusBarTranslucent={statusBarTranslucent}
      isVisible={visible}
      onBackdropPress={onBackdropPress}
      onBackButtonPress={onBackButtonPress}
      onModalHide={onModalHide}
      {...props}>
      <View style={[styles.container, containerStyle]}>
        {!hideCloseButton && (
          <TouchableField
            style={[
              styles.closeIcon,
              containerStyle &&
                containerStyle.padding && {
                  top: containerStyle.padding / 2,
                  right: containerStyle.padding / 2,
                },
            ]}
            onPress={onRequestClose}>
            <AIcon name={'close'} size={28} color={styles.closeIcon.color} />
          </TouchableField>
        )}
        {children}
      </View>
    </RNModal>
  );
}

export default Modal;
