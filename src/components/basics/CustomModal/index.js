/**
 *
 * CustomModal
 *
 */

import Condition from 'components/basics/Condition';
import Modal from 'components/basics/Modal';
import { useThemedStyle } from 'providers';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { selectCloseModalsRefreshId } from 'store/Root/selector';

import themedStyles from './style';

const initialState = {
  body: null,
  onBackdropPress: () => {},
  onBackButtonPress: () => {},
  onModalHide: () => {},
  onRequestClose: () => {},
  hideCloseButton: true,
  styles: {},
};

const CustomModal = (props, ref) => {
  const closeModalsRefreshId = useSelector(selectCloseModalsRefreshId);
  const [visibility, setVisibility] = useState(false);
  const [states, setStates] = useState(initialState);
  const styles = useThemedStyle({ ...themedStyles, ...states.styles }, 'components.customModal');
  const insets = useSafeAreaInsets();
  const isOpened = useRef(false);
  /**
   *
   * @param {Object} params
   * @param {String} params.body modal content
   * @param {String} params.onBackdropPress Callback invoked when clicking backdrop
   * @param {String} params.onBackButtonPress Callback invoked when clicking Back button
   * @param {String} params.onModalHide Callback invoked after modal is hidden
   * @param {String} params.onRequestClose Callback invoked when closing modal manually
   * @param {String} params.type Type modal: modal | absolute
   */
  const show = params => {
    isOpened.current = true;
    setVisibility(true);
    setStates(prevState => ({
      ...prevState,
      ...params,
    }));
  };

  const hide = useCallback(() => {
    if (!isOpened.current) {
      return;
    }
    isOpened.current = false;
    setVisibility(false);
    return new Promise(resolve => {
      setTimeout(() => {
        if (!isOpened.current) {
          setStates(initialState);
        }
        resolve();
      }, 300);
    });
  }, []);

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
      isOpened: () => (states.type === 'absolute' ? isOpened.current : visibility),
    }),
    [hide, states, visibility],
  );

  if (states.type === 'absolute') {
    return (
      <Condition display={visibility}>
        <View style={styles.modal}>
          <Pressable onPress={states.onBackdropPress} style={styles.backdropModal} />
          <View
            style={[
              styles.modalContent,
              insets.top > 0 && { marginTop: insets.top / 2 + 30 },
              insets.bottom > 0 && { marginBottom: insets.bottom / 2 + 30 },
              states?.noInsets && styles.noInsets,
            ]}>
            {states.body}
          </View>
        </View>
      </Condition>
    );
  }

  return (
    <Modal
      hideCloseButton={states.hideCloseButton}
      containerStyle={styles.container}
      visible={visibility}
      onBackdropPress={states.onBackdropPress}
      onBackButtonPress={states.onBackButtonPress}
      onModalHide={states.onModalHide}
      animationIn="fadeInUp"
      onRequestClose={states.onRequestClose}>
      {states.body}
    </Modal>
  );
};

export default forwardRef(CustomModal);
