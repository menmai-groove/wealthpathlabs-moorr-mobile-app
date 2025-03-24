/**
 *
 * ConfirmModal
 *
 */

import ButtonField from 'components/basics/ButtonField';
import Modal from 'components/basics/Modal';
import TextField from 'components/basics/TextField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { isEmpty, isFunction } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectCloseModalsRefreshId } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nDefaultScope = 'components.confirmModal';
const initialState = {
  top: undefined,
  title: '',
  content: '',
  i18nScope: i18nDefaultScope,
  style: {
    container: undefined,
    title: undefined,
    content: undefined,
    topComponent: undefined,
    buttonYesContainer: undefined,
    buttonNoContainer: undefined,
    buttonYesText: undefined,
    buttonNoText: undefined,
  },
  buttonNoType: 'secondary',
  buttonYesType: 'primary',
  reverseButton: false,
  onlyOneButton: false,
  onConfirm: () => {},
  onCancel: () => {},
  okText: undefined,
};

const ConfirmModal = ({ componentStyle, topComponent }, ref) => {
  const closeModalsRefreshId = useSelector(selectCloseModalsRefreshId);
  const [visibility, setVisibility] = useState(false);
  const [states, setStates] = useState(initialState);

  const { t } = useTranslation();
  const convertedStyle = mergeArrayObjectIntoObject(componentStyle);
  const themeStyles = useThemedStyle(
    { ...themedStyles, ...convertedStyle },
    'components.confirmModal',
  );

  /**
   *
   * @param {Object} params
   * @param {String} params.title Title of confirm message
   * @param {String} params.content Detail content of confirm message
   * @param {String} params.i18nScope i18n text's prefix
   * @param {Object} params.style
   * @param {Object} params.style.container Modal container style
   * @param {Object} params.style.title Text style of title
   * @param {Object} params.style.content Text style of detail content
   * @param {Object} params.style.buttonYesContainer Container style of [Yes] button
   * @param {Object} params.style.buttonNoContainer Container style of [No] button
   * @param {Object} params.style.buttonYesText Text style of [Yes] button
   * @param {Object} params.style.buttonNoText Text style of [No] button
   * @param {String} params.buttonYesType Tyle of [Yes] button
   * @param {String} params.buttonNoType Tyle of [No] button
   * @param {Function} params.onConfirm Callback invoked when clicking [Yes] button
   * @param {Function} params.onCancel Callback invoked when clicking [No] button
   */
  const show = params => {
    setVisibility(true);
    setStates(prevState => ({
      ...prevState,
      ...params,
    }));
  };

  const hide = () => {
    setVisibility(false);
    return new Promise(resolve => {
      setTimeout(() => {
        setStates(initialState);
        resolve();
      }, 300);
    });
  };

  useEffect(() => {
    if (closeModalsRefreshId) {
      hide();
    }
  }, [closeModalsRefreshId]);

  /**
   * Customize the instance value that is exposed to parent components when using `ref`
   */
  useImperativeHandle(
    ref,
    () => ({
      show,
      hide,
    }),
    [],
  );

  const onConfirm = () => {
    hide();
    isFunction(states.onConfirm) && states.onConfirm();
  };

  const onCancel = () => {
    hide();
    isFunction(states.onCancel) && states.onCancel();
  };

  const customScope = useMemo(() => states.i18nScope || i18nDefaultScope, [states.i18nScope]);

  return (
    <Modal
      hideCloseButton
      containerStyle={[themeStyles.container, states.style.container]}
      visible={visibility}
      onBackdropPress={onCancel}
      onRequestClose={onCancel}>
      <View>
        {!isEmpty(topComponent) && (
          <View style={[themeStyles.topComponent, states.style.topComponent]}>{topComponent}</View>
        )}
        {states.top && (
          <View style={[themeStyles.topComponent, states.style.topComponent]}>{states.top}</View>
        )}
        <TextField type="heading-2" style={[themeStyles.title, states.style.title]}>
          {states.title}
        </TextField>
        {typeof states.content === 'function' ? (
          states.content()
        ) : (
          <TextField style={[themeStyles.content, states.style.content]}>
            {states.content}
          </TextField>
        )}

        <View
          style={[
            states.onlyOneButton && AppStyle.hide,
            states.reverseButton ? AppStyle.rowReverseFlex : AppStyle.rowFlex,
            AppStyle.spaceBetweenContent,
            AppStyle.alignContent,
          ]}>
          <View
            style={[
              AppStyle.flex1,
              states.reverseButton ? AppStyle.alignEnd : AppStyle.alignStart,
            ]}>
            <ButtonField
              type={states.buttonNoType}
              text={t(`${customScope}.no`)}
              style={[themeStyles.buttonContainer, states.style.buttonNoContainer]}
              textStyle={states.style.buttonNoText}
              onPress={onCancel}
            />
          </View>
          <View
            style={[
              AppStyle.flex1,
              states.reverseButton ? AppStyle.alignStart : AppStyle.alignEnd,
            ]}>
            <ButtonField
              type={states.buttonYesType}
              text={t(`${customScope}.yes`)}
              style={[themeStyles.buttonContainer, states.style.buttonYesContainer]}
              textStyle={states.style.buttonYesText}
              onPress={onConfirm}
            />
          </View>
        </View>
        <View style={AppStyle.alignContent}>
          <ButtonField
            type={states.buttonYesType}
            text={states.okText ?? t(`${customScope}.ok`)}
            style={[
              themeStyles.buttonContainer,
              states.style.buttonYesContainer,
              !states.onlyOneButton && AppStyle.hide,
            ]}
            textStyle={states.style.buttonYesText}
            onPress={onConfirm}
          />
        </View>
      </View>
    </Modal>
  );
};

export default forwardRef(ConfirmModal);
