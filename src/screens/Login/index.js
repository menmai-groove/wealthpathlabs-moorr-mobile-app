import { yupResolver } from '@hookform/resolvers/yup';
import { useIsFocused } from '@react-navigation/native';
import ImageCover from 'assets/images/login-image-cover.png';
import FaceID from 'assets/svgs/faceID';
import FingerPrint from 'assets/svgs/fingerPrint';
import BiometricPopup from 'components/basics/BiometricPopup';
import BiometricSelectorModal from 'components/basics/BiometricSelectorModal';
import BiometricSetupPrompt from 'components/basics/BiometricSetupPrompt';
import ButtonField from 'components/basics/ButtonField';
import CustomTooltip from 'components/basics/CustomTooltip';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import SecondaryInputField from 'components/basics/SecondaryInputField';
import SecondaryInputPasswordField from 'components/basics/SecondaryInputPasswordField';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import AuthenticationForm from 'components/layouts/AuthenticationForm';
import { AppConfigs, AppError, AppScreenID } from 'constant';
import CryptoJS from 'crypto-js';
import { GlobalLib, LocalStorageLib, NavigationServiceLib, SchemaLib } from 'libs';
import Global from 'libs/global';
import { useDispatchResolve } from 'libs/hooks';
import { useThemedStyle, withExitAppHandler } from 'providers';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, Keyboard, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import { getBiometricInfo, simpleBiometricsPrompt } from 'services/biometrics';
import Keychain from 'services/keychain';
import {
  loginRequest,
  onAccountIsStrongAuth,
  setupBiometricInPrompt,
  updateLoginError,
} from 'store/Auth/action';
import { selectLoginError } from 'store/Auth/selector';
import { AppStyle } from 'theme';
import { useAsyncMemo } from 'use-async-memo';

import themedStyles from './styles';

const i18nScope = 'screens.login';

function Login() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();
  const biometricSelectedValue = useRef(null);
  const isFocused = useIsFocused();

  const emailInput = useRef(null);
  const passwordInput = useRef(null);
  const scrollRef = useRef();
  const scrollTimeout = useRef();
  const dataFormErrors = useRef({});
  const defaultValues = useMemo(
    () => ({
      email: __DEV__ ? AppConfigs.devAccount.username : '',
      currentPassword: __DEV__ ? AppConfigs.devAccount.pass : '',
    }),
    [],
  );
  const biometricInfo = useAsyncMemo(async () => await getBiometricInfo(), []);
  const loginError = useSelector(selectLoginError);

  const { handleSubmit, control, errors, setValue } = useForm({
    defaultValues,
    resolver: yupResolver(SchemaLib.loginSchema),
    shouldFocusError: false,
  });

  const onCancelBiometric = useCallback(
    (email, password) => {
      Global.CustomModal.get().hide();
      dispatchResolve(setupBiometricInPrompt({ email, password, isAccept: false })).then(() => {
        dispatchResolve(onAccountIsStrongAuth());
      });
    },
    [dispatchResolve],
  );

  const onAcceptBiometric = useCallback(
    async (email, password) => {
      try {
        const success = await simpleBiometricsPrompt(t('global.biometricAuthentication'));
        if (!success) {
          return;
        } else {
          Global.CustomModal.get().hide();
          dispatchResolve(setupBiometricInPrompt({ email, password, isAccept: true })).then(() => {
            dispatchResolve(onAccountIsStrongAuth());
          });
        }
      } catch (error) {
        return;
      }
    },
    [dispatchResolve, t],
  );

  const onSubmitData = useCallback(
    async data => {
      Keyboard.dismiss();
      passwordInput.current.blur();

      const email = data?.email?.toLowerCase();
      const password = data?.currentPassword;
      const response = await dispatchResolve(loginRequest({ email, password }));
      if (response?.isShowPrompt && biometricInfo?.available) {
        Global.CustomModal.get().show({
          body: (
            <BiometricSetupPrompt
              onCancel={() => onCancelBiometric(email, password)}
              onConfirm={() => onAcceptBiometric(email, password)}
            />
          ),
          onRequestClose: () => onCancelBiometric(email, password),
        });
      } else if (response?.strongAuth) {
        dispatchResolve(onAccountIsStrongAuth());
      }
    },
    [dispatchResolve, biometricInfo, onCancelBiometric, onAcceptBiometric],
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

  const openBiometricErrorModal = useCallback(() => {
    GlobalLib.CustomModal.get().show({
      body: (
        <BiometricPopup
          title={t(`${i18nScope}.loginFailedTitle`)}
          description={
            biometricInfo?.isFaceID
              ? t(`${i18nScope}.loginFailedFaceIDDescription`)
              : t(`${i18nScope}.loginFailedTouchIDDescription`)
          }
          buttonText={t(`${i18nScope}.close`)}
          onPressButton={() => GlobalLib.CustomModal.get().hide()}
        />
      ),
      onRequestClose: () => GlobalLib.CustomModal.get().hide(),
      onBackdropPress: () => GlobalLib.CustomModal.get().hide(),
    });
  }, [biometricInfo, t]);

  const openBiometricSelectorModal = useCallback((listInput, onSubmit) => {
    if (listInput.length === 1) {
      biometricSelectedValue.current = listInput[0];
      onSubmit();
      return;
    }
    const CustomModal = GlobalLib.CustomModal.get();

    CustomModal.show({
      body: (
        <BiometricSelectorModal
          listAccount={listInput}
          onSelect={item => {
            biometricSelectedValue.current = item;
            onSubmit();
            CustomModal.hide();
          }}
        />
      ),
      onRequestClose: () => CustomModal.hide(),
      onBackdropPress: () => CustomModal.hide(),
    });
  }, []);

  const handleBiometricsLogin = useCallback(async () => {
    try {
      if (!biometricInfo?.available) {
        return;
      }
      const credentials = await Keychain.getAllRegisteredAccounts();
      if (!credentials?.length) {
        return openBiometricErrorModal();
      }
      const success = await simpleBiometricsPrompt(t('global.biometricAuthentication'));
      if (!success) {
        return;
      }
      openBiometricSelectorModal(credentials, () => {
        if (biometricSelectedValue.current) {
          const email = biometricSelectedValue.current.username;
          const password = CryptoJS.AES.decrypt(
            biometricSelectedValue.current.password,
            String(email).toLowerCase(),
          ).toString(CryptoJS.enc.Utf8);
          dispatchResolve(
            loginRequest({
              email,
              password,
            }),
          )
            .then(response => {
              if (response?.strongAuth) {
                dispatchResolve(onAccountIsStrongAuth());
              }
            })
            .catch(err => {
              const networkError = err?.errors?.some(e =>
                e.message.includes(AppError.networkRequestFailed),
              );
              if (!networkError) {
                GlobalLib.CustomModal.get().show({
                  body: (
                    <BiometricPopup
                      title={t(`${i18nScope}.loginFailedTitle`)}
                      description={t(`${i18nScope}.loginFailedTokenBiometricsDescription`)}
                      buttonText={t(`${i18nScope}.close`)}
                      onPressButton={() => GlobalLib.CustomModal.get().hide()}
                    />
                  ),
                  onRequestClose: () => GlobalLib.CustomModal.get().hide(),
                  onBackdropPress: () => GlobalLib.CustomModal.get().hide(),
                });
              }
            });
        } else {
          GlobalLib.Toast.get().toastError(t('errorMsg.keyChainError.noCredentialsStored'));
        }
      });
    } catch (error) {
      if (error.message) {
        GlobalLib.Toast.get().toastError(error?.message);
      }
    }
  }, [
    biometricInfo,
    biometricSelectedValue,
    dispatchResolve,
    openBiometricErrorModal,
    openBiometricSelectorModal,
    t,
  ]);

  const redirectSignUpScreen = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.SignUp);
  }, []);

  const redirectToForgotPasswordScreen = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.RequestPassword);
  }, []);

  useEffect(() => {
    (async () => {
      const rememberMeEmail = await LocalStorageLib.RememberMe.get();
      if (rememberMeEmail) {
        setValue('email', rememberMeEmail);
      }
    })();
  }, [setValue]);

  return (
    <View style={[styles.container]}>
      <Image source={ImageCover} style={styles.imageCover} resizeMode="stretch" />
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={AppStyle.flex1}
        // contentContainerStyle={AppStyle.flex1}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={require('assets/images/secondary-logo-1.png')}
            style={styles.secondaryLogo}
          />
        </View>
        <AuthenticationForm
          style={[AppStyle.padX15]}
          title={t(`${i18nScope}.title`)}
          renderContent={() => {
            return (
              <View style={AppStyle.flex1}>
                <View style={AppStyle.flex1}>
                  <View
                    style={[AppStyle.marginBottom10, styles.formBlock]}
                    collapsable={false}
                    onLayout={({ nativeEvent }) => {
                      updateDataFormErrors('email', {
                        offsetY: nativeEvent.layout.y,
                      });
                    }}
                    ref={element => {
                      updateDataFormErrors('email', {
                        componentRef: element,
                      });
                    }}>
                    <Controller
                      control={control}
                      render={({ onChange, onBlur, value }) =>
                        isFocused ? (
                          <SecondaryInputField
                            type="email"
                            ref={emailInput}
                            returnKeyType={'next'}
                            value={value}
                            keyboardType="email-address"
                            onBlur={onBlur}
                            onChangeText={text => {
                              onChange(text);
                              loginError && dispatch(updateLoginError());
                            }}
                            onSubmitEditing={() => {
                              passwordInput.current.focus();
                            }}
                            error={loginError?.message || errors.email?.message}
                            label={t(`${i18nScope}.email`)}
                            textContentType="username"
                            autoComplete="username"
                            importantForAutofill="yes"
                          />
                        ) : null
                      }
                      name="email"
                    />
                  </View>
                  <View
                    style={[AppStyle.marginTop5, AppStyle.marginBottom10, styles.formBlock]}
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
                      control={control}
                      render={({ onChange, onBlur, value }) =>
                        isFocused ? (
                          <SecondaryInputPasswordField
                            ref={passwordInput}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            onSubmitEditing={handleSubmit(onSubmitData, onErrorData)}
                            error={errors.currentPassword?.message}
                            label={t(`${i18nScope}.password`)}
                            placeholder={t(`${i18nScope}.password`)}
                            textContentType="password"
                            autoComplete="password"
                            importantForAutofill="yes"
                          />
                        ) : null
                      }
                      name="currentPassword"
                    />
                  </View>
                  <View style={[AppStyle.rowFlex, AppStyle.justifyContent]}>
                    <TouchableField onPress={redirectToForgotPasswordScreen}>
                      <TextField style={styles.textWithLink} suppressHighlighting={true}>
                        {t(`${i18nScope}.forgotPassword`)}
                      </TextField>
                    </TouchableField>
                  </View>
                  <View style={styles.formButton}>
                    <View style={AppStyle.flex1}>
                      <ButtonField
                        text={t(`${i18nScope}.login`)}
                        onPress={handleSubmit(onSubmitData, onErrorData)}
                      />
                    </View>
                    {biometricInfo?.available && (
                      <TouchableField onPress={handleBiometricsLogin}>
                        <View style={styles.biometricsButton}>
                          {biometricInfo?.isFaceID && <FaceID />}
                          {biometricInfo?.isTouchID && <FingerPrint />}
                          {biometricInfo?.isAndroidBiometrics && <FingerPrint />}
                        </View>
                      </TouchableField>
                    )}
                  </View>
                </View>

                <View style={[AppStyle.flexEndContent, AppStyle.marginTop40]}>
                  <CustomTooltip
                    hideArrow
                    placement="top"
                    content={<TextField type="captain">{t(`${i18nScope}.note`)}</TextField>}
                    tooltipStyle={styles.tooltipStyle}
                    label={t(`${i18nScope}.readInformation`)}
                  />
                </View>
              </View>
            );
          }}
          renderFooter={() => (
            <View style={[AppStyle.rowFlex, AppStyle.middleContent]}>
              <TextField type="text-label">{t(`${i18nScope}.dontHaveAccount`)}</TextField>
              <TouchableField onPress={redirectSignUpScreen}>
                <TextField type="text-label" style={styles.signUpText}>
                  {t(`${i18nScope}.signUp`)}
                </TextField>
              </TouchableField>
            </View>
          )}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withExitAppHandler)(Login);
