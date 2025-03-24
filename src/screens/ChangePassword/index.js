import { yupResolver } from '@hookform/resolvers/yup';
import ButtonField from 'components/basics/ButtonField';
import InputPasswordField from 'components/basics/InputPasswordField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import Header from 'components/layouts/Header';
import { GlobalLib, NavigationServiceLib, SchemaLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { useThemedStyle, withBackHandler } from 'providers';
import React, { useCallback, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, Keyboard, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { compose } from 'redux';
import { changePassword } from 'store/Auth/action';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.changePassword';

function ChangePassword() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const insets = useSafeAreaInsets();

  const dispatchResolve = useDispatchResolve();

  const scrollRef = useRef();
  const scrollTimeout = useRef();
  const currentPasswordInput = useRef(null);
  const passwordInput = useRef(null);
  const confirmPasswordInput = useRef(null);
  const dataFormErrors = useRef({});

  const defaultValues = useMemo(
    () => ({
      currentPassword: __DEV__ ? 'Matkhaula2!' : '',
      newPassword: __DEV__ ? 'Matkhaula1!' : '',
      confirmNewPassword: __DEV__ ? 'Matkhaula1!' : '',
    }),
    [],
  );
  const { handleSubmit, control, errors } = useForm({
    defaultValues,
    resolver: yupResolver(SchemaLib.changePassword),
    shouldFocusError: false,
  });

  const closeModal = useCallback(() => {
    GlobalLib.ScreenModal.get().hide();
  }, []);

  const openModal = useCallback(() => {
    GlobalLib.ScreenModal.get().show({
      title: t(`${i18nScope}.changePasswordSuccessTitle`),
      description: t(`${i18nScope}.msgChangePasswordSuccess`),
      renderImage: () => (
        <View style={AppStyle.middleContent}>
          <FastImage
            source={require('assets/images/components/screenModal/change-password-success.png')}
            style={styles.modalCheckImage}
          />
        </View>
      ),
      onPressButton: () => {
        closeModal();
        NavigationServiceLib.pop();
      },
      hideCloseButton: true,
    });
  }, [closeModal, styles, t]);

  const onSubmitData = useCallback(
    data => {
      Keyboard.dismiss();
      dispatchResolve(changePassword(data))
        .then(() => {
          openModal();
        })
        .catch(() => {});
    },
    [dispatchResolve, openModal],
  );

  const scrollToElement = useCallback(
    (element, timeout = 250) => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        element && scrollRef?.current?.scrollIntoView(element);
      }, timeout);
    },
    [scrollRef],
  );

  const onErrorForm = useCallback(
    (formErrors, dataFormErrorsCurrent, firstKey) => {
      if (firstKey) {
        scrollToElement(dataFormErrorsCurrent[firstKey]?.componentRef);
      }
    },
    [scrollToElement],
  );

  const onErrorData = useCallback(
    formError => {
      Keyboard.dismiss();
      let firstKey;
      let minOffset;
      const fieldIds = SchemaLib.getFormErrorFieldIds(formError);
      for (let i in fieldIds) {
        const key = fieldIds[i];
        if (!firstKey || dataFormErrors.current[key]?.offsetY < minOffset) {
          minOffset = dataFormErrors.current[key]?.offsetY;
          firstKey = key;
        }
      }
      typeof onErrorForm === 'function' && onErrorForm(formError, dataFormErrors.current, firstKey);
    },
    [onErrorForm],
  );

  const updateDataFormErrors = useCallback((key, data) => {
    dataFormErrors.current[key] = {
      ...dataFormErrors.current[key],
      ...data,
    };
  }, []);

  return (
    <View style={styles.container}>
      <Header type="back" />
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={[AppStyle.flex1]}
        contentContainerStyle={insets.bottom > 0 && { paddingBottom: insets.bottom }}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}>
        <View style={[AppStyle.padX20, AppStyle.padBottom20]}>
          <View style={AppStyle.middleContent}>
            <Image
              source={require('assets/images/changePassword/lock.png')}
              style={styles.lockImage}
            />
          </View>
          <View style={styles.title}>
            <TextField type="heading-3">{t(`${i18nScope}.changePassword`)}</TextField>
          </View>
          <View
            style={styles.formBlock}
            collapsable={false}
            onLayout={({ nativeEvent }) => {
              updateDataFormErrors('currentPassword', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('currentPassword', {
                componentRef: element,
              });
            }}>
            <Controller
              name="currentPassword"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputPasswordField
                  ref={currentPasswordInput}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={() => confirmPasswordInput.current.focus()}
                  error={errors.currentPassword?.message}
                  label={t(`${i18nScope}.currentPassword`)}
                  placeholder={t(`${i18nScope}.currentPasswordPlaceholder`)}
                  required
                />
              )}
            />
          </View>
          <View
            style={styles.formBlock}
            collapsable={false}
            onLayout={({ nativeEvent }) => {
              updateDataFormErrors('newPassword', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('newPassword', {
                componentRef: element,
              });
            }}>
            <Controller
              name="newPassword"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputPasswordField
                  ref={passwordInput}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={() => confirmPasswordInput.current.focus()}
                  error={errors.newPassword?.message}
                  label={t(`${i18nScope}.newPassword`)}
                  placeholder={t(`${i18nScope}.newPasswordPlaceholder`)}
                  required
                />
              )}
            />
          </View>
          <View
            style={styles.formBlock}
            collapsable={false}
            onLayout={({ nativeEvent }) => {
              updateDataFormErrors('confirmNewPassword', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('confirmNewPassword', {
                componentRef: element,
              });
            }}>
            <Controller
              name="confirmNewPassword"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputPasswordField
                  ref={confirmPasswordInput}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  error={errors.confirmNewPassword?.message}
                  label={t(`${i18nScope}.confirmNewPassword`)}
                  placeholder={t(`${i18nScope}.confirmNewPasswordPlaceholder`)}
                  required
                />
              )}
            />
          </View>
          <ButtonField
            style={AppStyle.marginTop40}
            text={t(`${i18nScope}.btnChangePassword`)}
            onPress={handleSubmit(onSubmitData, onErrorData)}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withBackHandler)(ChangePassword);
