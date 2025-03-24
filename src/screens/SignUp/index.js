import { yupResolver } from '@hookform/resolvers/yup';
import { useIsFocused, useRoute } from '@react-navigation/native';
import ImageCover from 'assets/images/login-image-cover.png';
import BiometricSetupPrompt from 'components/basics/BiometricSetupPrompt';
import ButtonField from 'components/basics/ButtonField';
import CheckBox from 'components/basics/CheckBox';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import SecondaryInputField from 'components/basics/SecondaryInputField';
import SecondaryInputPasswordField from 'components/basics/SecondaryInputPasswordField';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import AuthenticationForm from 'components/layouts/AuthenticationForm';
import OptiModal from 'components/layouts/OptiModal';
import { AppConfigs, AppScreenID as screenID } from 'constant';
import { GlobalLib, NavigationServiceLib, SchemaLib, UtilLib } from 'libs';
import Global from 'libs/global';
import { useDispatchResolve } from 'libs/hooks';
import LottieView from 'lottie-react-native';
import { useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import OptiProvider from 'providers/opti/provider';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, Keyboard, Platform, useWindowDimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import { getBiometricInfo, simpleBiometricsPrompt } from 'services/biometrics';
import {
  loginRequest,
  onAccountIsStrongAuth,
  setupBiometricInPrompt,
  updateTermConditionContent,
} from 'store/Auth/action';
import { selectAppPreference } from 'store/Root/selector';
import { fetchTermCondition, signUpRequest, updateSignUpError } from 'store/SignUp/action';
import getModule from 'store/SignUp/module';
import { selectSignUpExistedStatus } from 'store/SignUp/selector';
import { AppStyle } from 'theme';
import { useAsyncMemo } from 'use-async-memo';

import themedStyles from './styles';

const i18nScope = 'screens.signup';
function SignUp() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, 'screens.signup');
  const dispatchResolve = useDispatchResolve();
  const dispatch = useDispatch();
  const emailExisted = useSelector(selectSignUpExistedStatus);
  const { registerHelpLink } = useSelector(selectAppPreference);
  const route = useRoute();
  const { width: screenWidth } = useWindowDimensions();
  const isFocused = useIsFocused();

  const scrollRef = useRef();
  const scrollTimeout = useRef();
  const emailInput = useRef(null);
  const passwordInput = useRef(null);
  const confirmPasswordInput = useRef(null);
  const dataFormErrors = useRef({});
  const biometricInfo = useAsyncMemo(async () => await getBiometricInfo(), []);

  const defaultValues = useMemo(
    () => ({
      // email: __DEV__ ? 'lethiphuongtuyen001.+*=@mailinator.com' : '',
      email: __DEV__ ? AppConfigs.devAccount.username : '',
      password: __DEV__ ? AppConfigs.devAccount.pass : '',
      confirmPassword: __DEV__ ? AppConfigs.devAccount.pass : '',
      termCondition: __DEV__ ? true : false,
      // acknowledgePolicy: false,
    }),
    [],
  );
  const { handleSubmit, control, errors, setValue, trigger } = useForm({
    defaultValues,
    resolver: yupResolver(SchemaLib.registerSchema),
    shouldFocusError: false,
  });

  useEffect(() => {
    if (route?.params?.termCondition) {
      setValue('termCondition', true);
      trigger('termCondition');
    }
  }, [dispatch, emailExisted, route, setValue, trigger]);

  const closeScreenModal = useCallback(() => {
    GlobalLib.OptiModal.get().hide();
  }, []);

  const redirectToOnboardingScreen = useCallback(
    data => {
      dispatchResolve(
        loginRequest({
          email: data?.email,
          password: data?.password,
        }),
      ).then(response => {
        if (response?.strongAuth) {
          dispatchResolve(onAccountIsStrongAuth()).then(() => closeScreenModal());
        } else {
          closeScreenModal();
        }
      });
    },
    [dispatchResolve, closeScreenModal],
  );

  const onHelpLink = useCallback(() => {
    closeScreenModal();
    UtilLib.openInAppBrowserLink(registerHelpLink);
  }, [registerHelpLink, closeScreenModal]);

  const openScreenModal = useCallback(
    (success, data) => {
      GlobalLib.OptiModal.get().show({
        title: success ? t(`${i18nScope}.successTitle`) : t(`${i18nScope}.errorTitle`),
        renderImage: () => (
          <View style={AppStyle.middleContent}>
            {success ? (
              <View style={styles.confettiContainer}>
                <LottieView
                  resizeMode="contain"
                  style={[{ width: screenWidth }, styles.confetti]}
                  source={require('assets/images/optiIcon/confetti.json')}
                  autoPlay
                  loop
                />
                <LottieView
                  resizeMode="contain"
                  style={styles.smileOpti}
                  source={require('assets/images/optiIcon/excited.json')}
                  autoPlay
                  loop
                />
              </View>
            ) : (
              <FastImage
                source={require('assets/images/optiIcon/sad.png')}
                style={styles.sadIcon}
                resizeMode={FastImage.resizeMode.contain}
              />
            )}
          </View>
        ),
        renderDescription: () => {
          if (success) {
            return (
              <TextField style={AppStyle.textCenter} type="paragraph-2">
                {t(`${i18nScope}.msgSuccess`)}
              </TextField>
            );
          }
          return (
            <TextField style={AppStyle.textCenter} type="paragraph-2">
              {t(`${i18nScope}.msgFailure`)}{' '}
              <TextField type="paragraph-2" style={styles.helpText} onPress={onHelpLink}>
                {t(`${i18nScope}.help`)}
              </TextField>
              {'.'}
            </TextField>
          );
        },
        hideCloseButton: success,
        onPressButton: () => {
          if (success) {
            redirectToOnboardingScreen(data);
          } else {
            closeScreenModal();
          }
        },
        onRequestClose: closeScreenModal,
        buttonText: success
          ? t(`${i18nScope}.successSubmitText`)
          : t(`${i18nScope}.errorSubmitText`),
      });
    },
    [closeScreenModal, onHelpLink, redirectToOnboardingScreen, styles, t, screenWidth],
  );

  const onCancelBiometric = useCallback(
    formatData => {
      const { email, password } = formatData;
      Global.CustomModal.get().hide();
      dispatchResolve(setupBiometricInPrompt({ email, password, isAccept: false })).then(() =>
        openScreenModal(true, formatData),
      );
    },
    [dispatchResolve, openScreenModal],
  );
  const onAcceptBiometric = useCallback(
    async formatData => {
      try {
        const { email, password } = formatData;
        const success = await simpleBiometricsPrompt(t('global.biometricAuthentication'));
        if (!success) {
          return;
        } else {
          Global.CustomModal.get().hide();
          dispatchResolve(setupBiometricInPrompt({ email, password, isAccept: true })).then(() =>
            openScreenModal(true, formatData),
          );
        }
      } catch (error) {}
    },
    [dispatchResolve, openScreenModal, t],
  );

  const onSubmitData = useCallback(
    data => {
      Keyboard.dismiss();
      emailInput.current?.blur();
      passwordInput.current?.blur();
      confirmPasswordInput.current?.blur();

      const { password, termCondition } = data;
      const email = data?.email?.toLowerCase();
      const agreedPoliciesAt = new Date().toISOString();

      const formatData = {
        email,
        password,
        ...(termCondition ? { agreedPoliciesAt } : {}),
      };
      dispatchResolve(signUpRequest(formatData))
        .then(() => {
          if (biometricInfo?.available) {
            Global.CustomModal.get().show({
              body: (
                <BiometricSetupPrompt
                  onCancel={() => onCancelBiometric(formatData)}
                  onConfirm={() => onAcceptBiometric(formatData)}
                />
              ),
              onRequestClose: () => onCancelBiometric(formatData),
            });
          } else {
            openScreenModal(true, formatData);
          }
        })
        .catch(() => {
          openScreenModal(false);
        });
    },
    [biometricInfo, dispatchResolve, onAcceptBiometric, onCancelBiometric, openScreenModal],
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

  const updateDataFormErrors = (key, data) => {
    dataFormErrors.current[key] = {
      ...dataFormErrors.current[key],
      ...data,
    };
  };

  const redirectToLoginScreen = useCallback(() => {
    NavigationServiceLib.navigate(screenID.Login);
  }, []);

  const redirectToSignUpInfoScreen = useCallback(() => {
    NavigationServiceLib.navigate(screenID.SignUpPageInfo);
  }, []);

  const navigateToTermConditionScreen = useCallback(() => {
    dispatchResolve(fetchTermCondition()).then(result => {
      result && dispatch(updateTermConditionContent(result));
    });

    NavigationServiceLib.navigate(screenID.TermCondition, {
      onSubmit: () => {
        NavigationServiceLib.pop();
        NavigationServiceLib.navigate(screenID.SignUp, { termCondition: true });
      },
      onHeaderBack: () => {
        NavigationServiceLib.pop();
      },
    });
  }, [dispatch, dispatchResolve]);

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
          style={AppStyle.padX15}
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
                      name="email"
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
                              emailExisted && dispatch(updateSignUpError());
                            }}
                            onSubmitEditing={() => {
                              passwordInput.current.focus();
                            }}
                            hideError={emailExisted}
                            error={emailExisted?.message || errors.email?.message}
                            label={t(`${i18nScope}.email`)}
                            textContentType="username"
                            autoComplete="username"
                            importantForAutofill="yes"
                          />
                        ) : null
                      }
                    />
                    {emailExisted?.message && (
                      <View style={[AppStyle.padY5]}>
                        <TextField style={styles.errorMsgEmail}>
                          {t(`${i18nScope}.emailExistedPart1`)}{' '}
                          {/* <TextField
                            style={[styles.errorMsgEmail, styles.textWithLink]}
                            onPress={redirectToLoginScreen}
                            suppressHighlighting={true}>
                            {t(`${i18nScope}.login`)}
                          </TextField>{' '}
                          {t(`${i18nScope}.emailExistedPart2`)}{' '} */}
                          <TextField
                            style={[styles.errorMsgEmail, styles.textWithLink]}
                            onPress={redirectToSignUpInfoScreen}
                            suppressHighlighting={true}>
                            {t(`${i18nScope}.learnMore`)}
                          </TextField>
                        </TextField>
                      </View>
                    )}
                  </View>

                  <View
                    style={[AppStyle.marginBottom10, AppStyle.marginTop5, styles.formBlock]}
                    collapsable={false}
                    onLayout={({ nativeEvent }) => {
                      updateDataFormErrors('password', {
                        offsetY: nativeEvent.layout.y,
                      });
                    }}
                    ref={element => {
                      updateDataFormErrors('password', {
                        componentRef: element,
                      });
                    }}>
                    <Controller
                      name="password"
                      control={control}
                      render={({ onChange, onBlur, value }) =>
                        isFocused ? (
                          <SecondaryInputPasswordField
                            ref={passwordInput}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            onSubmitEditing={() => confirmPasswordInput.current.focus()}
                            error={errors.password?.message}
                            label={t(`${i18nScope}.password`)}
                            placeholder={t(`${i18nScope}.passwordPlaceholder`)}
                            textContentType={
                              parseInt(Platform.Version, 10) >= 12 ? 'newPassword' : 'password'
                            }
                            autoComplete="password"
                            importantForAutofill="yes"
                          />
                        ) : null
                      }
                    />
                  </View>

                  <View
                    style={[AppStyle.marginBottom10, AppStyle.marginTop5, styles.formBlock]}
                    collapsable={false}
                    onLayout={({ nativeEvent }) => {
                      updateDataFormErrors('confirmPassword', {
                        offsetY: nativeEvent.layout.y,
                      });
                    }}
                    ref={element => {
                      updateDataFormErrors('confirmPassword', {
                        componentRef: element,
                      });
                    }}>
                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ onChange, onBlur, value }) =>
                        isFocused ? (
                          <SecondaryInputPasswordField
                            ref={confirmPasswordInput}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            onSubmitEditing={() => Keyboard.dismiss()}
                            error={errors.confirmPassword?.message}
                            label={t(`${i18nScope}.confirmPassword`)}
                            placeholder={t(`${i18nScope}.confirmPasswordPlaceholder`)}
                            autoComplete="off"
                            textContentType="none"
                          />
                        ) : null
                      }
                    />
                  </View>

                  <View
                    collapsable={false}
                    onLayout={({ nativeEvent }) => {
                      updateDataFormErrors('termCondition', {
                        offsetY: nativeEvent.layout.y,
                      });
                    }}
                    ref={element => {
                      updateDataFormErrors('termCondition', {
                        componentRef: element,
                      });
                    }}>
                    <Controller
                      control={control}
                      name="termCondition"
                      render={({ onChange, value, ref }) => (
                        <CheckBox
                          ref={ref}
                          containerStyle={AppStyle.marginTop20}
                          value={value}
                          onChange={onChange}
                          required
                          error={errors.termCondition?.message}>
                          <TextField style={styles.label}>
                            {t(`${i18nScope}.labelTermCondition`)}
                            <TextField
                              style={[styles.label, styles.textWithLink]}
                              onPress={navigateToTermConditionScreen}
                              suppressHighlighting={true}>
                              {t(`${i18nScope}.labelTermConditionWithLink`)}
                            </TextField>
                          </TextField>
                        </CheckBox>
                      )}
                    />
                  </View>
                  {/* <View
                    collapsable={false}
                    onLayout={({ nativeEvent }) => {
                      updateDataFormErrors('acknowledgePolicy', {
                        offsetY: nativeEvent.layout.y,
                      });
                    }}
                    ref={element => {
                      updateDataFormErrors('acknowledgePolicy', {
                        componentRef: element,
                      });
                    }}>
                    <Controller
                      control={control}
                      name="acknowledgePolicy"
                      render={({ onChange, value, ref }) => (
                        <CheckBox
                          ref={ref}
                          style={AppStyle.marginTop15}
                          value={value}
                          onChange={onChange}
                          error={errors.acknowledgePolicy?.message}>
                          <TextField type="text-label">
                            {t(`${i18nScope}.labelAcknowledgePolicy`)}{' '}
                            <TextField
                              type="text-label"
                              style={[styles.label, styles.textWithLink]}
                              onPress={() => { }}
                              suppressHighlighting={true}>
                              {t(`${i18nScope}.privacyPolicy`)}
                            </TextField>
                            {' ' + t(`${i18nScope}.and`) + ' '}
                            <TextField
                              type="text-label"
                              style={[styles.label, styles.textWithLink]}
                              onPress={() => { }}
                              suppressHighlighting={true}>
                              {t(`${i18nScope}.cookiePolicy`)}
                            </TextField>
                          </TextField>
                        </CheckBox>
                      )}
                    />
                  </View> */}

                  <View style={styles.formButton}>
                    <View style={AppStyle.flex1}>
                      <ButtonField
                        text={t(`${i18nScope}.signUp`)}
                        onPress={handleSubmit(onSubmitData, onErrorData)}
                      />
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
          renderFooter={() => (
            <View style={[AppStyle.rowFlex, AppStyle.middleContent]}>
              <TextField type="text-label">{t(`${i18nScope}.alreadyHaveAccount`)}</TextField>
              <TouchableField onPress={redirectToLoginScreen}>
                <TextField type="text-label" style={styles.signInText}>
                  {t(`${i18nScope}.signIn`)}
                </TextField>
              </TouchableField>
            </View>
          )}
        />
      </KeyboardAwareScrollView>

      <OptiProvider>
        <OptiModal
          ref={ref => {
            GlobalLib.OptiModal.set(ref);
          }}
        />
      </OptiProvider>
    </View>
  );
}

SignUp.propTypes = {};
SignUp.defaultProps = {};

export default compose(withBackHandler, withDynamicModuleLoader(getModule()))(SignUp);
