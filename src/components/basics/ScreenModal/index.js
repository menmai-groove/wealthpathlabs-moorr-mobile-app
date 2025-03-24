import i18n from 'bootstrap/i18n';
import ButtonField from 'components/basics/ButtonField';
import Loading from 'components/basics/Loading';
import TextField from 'components/basics/TextField';
import Header from 'components/layouts/Header';
import { isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Modal as RNModal, Platform, StatusBar, View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectCloseModalsRefreshId } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.screenModal';

const initialState = {
  title: '',
  body: null,
  description: null,
  onBackdropPress: () => {},
  onBackButtonPress: () => {},
  onModalHide: () => {},
  onRequestClose: () => {},
  onPressButton: () => {},
  buttonText: i18n.t(`${i18nScope}.ok`),

  renderImage: () => {},
  renderDescription: () => {},
  hideCloseButton: null,
};

const isIOS = Platform.OS === 'ios';

function ScreenModal(props, ref) {
  const closeModalsRefreshId = useSelector(selectCloseModalsRefreshId);
  const [visibility, setVisibility] = useState(false);
  const [states, setStates] = useState(initialState);
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [refreshId, setRefreshId] = useState(Date.now());

  /**
   *
   * @param {Object} params
   * @param {JSX} params.body modal content
   * @param {Function} params.onBackdropPress Callback invoked when clicking backdrop
   * @param {Function} params.onBackButtonPress Callback invoked when clicking Back button
   * @param {Function} params.onModalHide Callback invoked after modal is hidden
   * @param {Function} params.onRequestClose Callback invoked when closing modal manually
   * @param {String} params.title Modal title text
   * @param {String} params.description Modal description text
   * @param {String} params.buttonText Modal button text
   * @param {Function} params.renderDescription Function to render custom description
   * @param {Function} params.renderImage Function to render custom top image
   * @param {Function} params.onPressButton Callback invoked when press button
   */
  const show = useCallback((params, barStyle = 'dark-content') => {
    StatusBar.setBarStyle(barStyle);
    setVisibility(true);
    setStates(prevState => ({
      ...prevState,
      ...params,
      loading: false,
    }));
    setTimeout(() => {
      !isIOS && setRefreshId(Date.now());
    }, 0);
  }, []);

  const hide = useCallback((barStyle = 'light-content') => {
    StatusBar.setBarStyle(barStyle);
    setVisibility(false);
    setTimeout(() => {
      setStates(initialState);
    }, 200);
  }, []);

  const setLoading = useCallback(loading => {
    setStates(prevState => ({
      ...prevState,
      loading,
    }));
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
      setLoading,
    }),
    [show, hide, setLoading],
  );

  const renderDefaultBody = useCallback(
    () => (
      <View style={[AppStyle.flex1, AppStyle.middleContent, styles.modalContainer]}>
        <View style={[AppStyle.flexEndContent]}>
          {typeof states.renderImage === 'function' && states.renderImage()}
          <View style={styles.titleContainer}>
            <TextField style={AppStyle.textCenter} type="heading-2">
              {states.title}
            </TextField>
          </View>
        </View>
        <View style={AppStyle.marginTop10}>
          {typeof states.renderDescription === 'function' ? (
            states.renderDescription()
          ) : (
            <TextField style={AppStyle.textCenter} type="paragraph-2">
              {states.description}
            </TextField>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <ButtonField text={states.buttonText} onPress={states.onPressButton} />
        </View>
      </View>
    ),
    [states, styles],
  );

  return (
    <RNModal
      visible={visibility}
      // onBackdropPress={states.onBackdropPress}
      // onBackButtonPress={states.onBackButtonPress}
      // onModalHide={states.onModalHide}
      onRequestClose={states.onRequestClose}
      animationType="slide"
      transparent
      statusBarTranslucent
      {...props}>
      {!states.hideCloseButton && (
        <Header type="back" background={false} onBackHeader={states.onRequestClose} />
      )}
      <View key={refreshId} style={AppStyle.flex1}>
        {!isEmpty(states.body) && states.body}
        {isEmpty(states.body) && renderDefaultBody()}
        {states.loading && <Loading visible />}
      </View>
    </RNModal>
  );
}

export default forwardRef(ScreenModal);
