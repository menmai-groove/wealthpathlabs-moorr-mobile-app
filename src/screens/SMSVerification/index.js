import { useRoute } from '@react-navigation/core';
import ImageCover from 'assets/images/login-image-cover.png';
import BackIcon from 'assets/svgs/backIcon';
import BackgroundTimeout from 'components/basics/BackgroundTimeout';
import BiometricSetupPrompt from 'components/basics/BiometricSetupPrompt';
import ButtonField from 'components/basics/ButtonField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import AuthenticationForm from 'components/layouts/AuthenticationForm';
import { AppScreenID } from 'constant';
import CryptoJS from 'crypto-js';
import OTPInputView from 'greact-native-otp-input';
import { GlobalLib, NavigationServiceLib } from 'libs';
import Global from 'libs/global';
import { useDispatchResolve } from 'libs/hooks';
import { debounce, get } from 'lodash';
import moment from 'moment';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import { getBiometricInfo, simpleBiometricsPrompt } from 'services/biometrics';
import { setupBiometricInPrompt } from 'store/Auth/action';
import { selectPasswordToken } from 'store/Auth/selector';
import { resendSms, verifySms, verifySuccess } from 'store/Verification/action';
import getModule from 'store/Verification/module';
import { AppStyle } from 'theme';
import { useAsyncMemo } from 'use-async-memo';

import themedStyles from './styles';

const i18nScope = 'screens.smsVerification';

const PIN_COUNT = 7;

export function TextCountDown({ nextSendSMS, onResend, styles, t }) {
  const [isExpired, setIsExpired] = useState(false);
  const [difference, setDifference] = useState(0);

  useEffect(() => {
    if (nextSendSMS) {
      const now = moment();
      const next = moment(nextSendSMS);
      const newDifference = next - now;
      setDifference(newDifference);
      setIsExpired(false);
    }
  }, [nextSendSMS]);

  const onFinish = useCallback(() => {
    setIsExpired(true);
  }, []);

  if (isExpired) {
    return (
      <TouchableField onPress={onResend}>
        <TextField style={AppStyle.textCenter} type="paragraph-2">
          {t(`${i18nScope}.smsSentWithExpired`)}
          <Text style={styles.resendText}>{t(`${i18nScope}.clickResend`)}</Text>
        </TextField>
      </TouchableField>
    );
  }

  if (nextSendSMS) {
    const countdown = moment(difference);
    const minutes = countdown.format('mm');
    const seconds = countdown.format('ss');
    const text = [minutes, seconds].join(':');

    return (
      <TextField style={AppStyle.textCenter} type="paragraph-2">
        {t(`${i18nScope}.smsSentWithCountdown`)}{' '}
        <TextField style={styles.resendText}>{text}</TextField>
        <BackgroundTimeout
          seconds={difference / 1000}
          onFinish={onFinish}
          onChange={newSeconds => setDifference(newSeconds * 1000)}
        />
      </TextField>
    );
  }

  return (
    <TouchableField onPress={onResend}>
      <Text style={[AppStyle.textCenter, styles.resendText]} type="paragraph-2">
        {t(`${i18nScope}.resend`)}
      </Text>
    </TouchableField>
  );
}

function SMSVerificationScreen(props) {
  const { t } = props;
  const { params } = useRoute();
  const styles = useThemedStyle(themedStyles, i18nScope);

  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();
  const [code, setCode] = useState('');
  const [nextSendSMS, setNextSendSMS] = useState(null);
  const scrollRef = useRef();
  const otpRef = useRef();
  const passwordToken = useSelector(selectPasswordToken);

  const biometricInfo = useAsyncMemo(async () => await getBiometricInfo(), []);

  const onCancelBiometric = useCallback(
    verifyAuthData => {
      Global.CustomModal.get().hide();
      const email = params?.email;
      const password = CryptoJS.AES.decrypt(passwordToken, String(email).toLowerCase()).toString(
        CryptoJS.enc.Utf8,
      );
      dispatchResolve(setupBiometricInPrompt({ email, password, isAccept: false })).then(() => {
        dispatch(verifySuccess(verifyAuthData));
      });
    },
    [dispatch, dispatchResolve, params, passwordToken],
  );

  const onAcceptBiometric = useCallback(
    async verifyAuthData => {
      try {
        const success = await simpleBiometricsPrompt(t('global.biometricAuthentication'));
        if (!success) {
          return;
        } else {
          Global.CustomModal.get().hide();
          const email = params?.email;
          const password = CryptoJS.AES.decrypt(
            passwordToken,
            String(email).toLowerCase(),
          ).toString(CryptoJS.enc.Utf8);
          dispatchResolve(setupBiometricInPrompt({ email, password, isAccept: true })).then(() => {
            dispatch(verifySuccess(verifyAuthData));
          });
        }
      } catch (error) {}
    },
    [dispatch, dispatchResolve, t, params, passwordToken],
  );

  const handleSubmit = useCallback(async () => {
    let verifyAuthData = await dispatchResolve(verifySms({ pin: code, email: params?.email }));
    if (verifyAuthData) {
      if (verifyAuthData.isShowPrompt && biometricInfo?.available) {
        Global.CustomModal.get().show({
          body: (
            <BiometricSetupPrompt
              onCancel={() => onCancelBiometric(verifyAuthData)}
              onConfirm={() => onAcceptBiometric(verifyAuthData)}
            />
          ),
          onRequestClose: () => onCancelBiometric(verifyAuthData),
        });
      } else {
        dispatch(verifySuccess(verifyAuthData));
      }
    }
  }, [
    dispatchResolve,
    code,
    params,
    biometricInfo,
    onCancelBiometric,
    onAcceptBiometric,
    dispatch,
  ]);

  const handleResendSms = useCallback(async () => {
    // setNextSendSMS(new Date(new Date().getTime() + 1 * 60000).toISOString());
    try {
      let resendAuthData = await dispatchResolve(resendSms());
      if (resendAuthData) {
        setNextSendSMS(resendAuthData?.nextSendSMS);
      }
    } catch (error) {
      const newNextSendSMS = get(error, [
        'errors',
        0,
        'extensions',
        'exception',
        'data',
        'nextSendSMS',
      ]);
      setNextSendSMS(newNextSendSMS);
    }
  }, [dispatchResolve]);

  const handleSendSms = useCallback(async () => {
    try {
      await dispatchResolve(resendSms());
    } catch (error) {
      const newNextSendSMS = get(error, [
        'errors',
        0,
        'extensions',
        'exception',
        'data',
        'nextSendSMS',
      ]);
      setNextSendSMS(newNextSendSMS);
    }
  }, [dispatchResolve]);

  const handleBack = useCallback(async () => {
    NavigationServiceLib.reset(AppScreenID.Login);
  }, []);

  useOnBackButtonPress(() => handleBack());

  useEffect(() => {
    setTimeout(() => {
      otpRef?.current?.focusField(0);
      handleSendSms();
    }, 500);
  }, [handleSendSms]);

  return (
    <View style={[styles.container]}>
      <Image source={ImageCover} style={styles.imageCover} resizeMode="stretch" />
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={AppStyle.flex1}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.logoContainer]}>
          <TouchableField style={[styles.backButton]} onPress={handleBack}>
            <BackIcon color="#FFF" />
          </TouchableField>
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
                  <Text type="paragraph-2">{t(`${i18nScope}.subTitle`)}</Text>
                  <OTPInputView
                    ref={otpRef}
                    style={styles.otpContainer}
                    pinCount={PIN_COUNT}
                    code={code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                    onCodeChanged={debounce(setCode, 250, {
                      leading: true,
                      trailing: false,
                    })}
                    onCodeFilled={code_ => {
                      setCode(code_);
                    }}
                    autoFocusOnLoad
                    codeInputFieldStyle={styles.underlineStyleBase}
                    codeInputHighlightStyle={styles.underlineStyleHighLighted}
                    keyboardType="number-pad"
                    onErrorFilled={errorCode => {
                      if (errorCode === 'invalid-code') {
                        GlobalLib.Toast.get().toastError(t(`${i18nScope}.invalidCode`));
                      }
                    }}
                  />
                  <View style={styles.buttonContainer}>
                    <ButtonField
                      type={code.length === PIN_COUNT ? 'primary' : 'disabled'}
                      text={t(`${i18nScope}.submit`)}
                      onPress={handleSubmit}
                    />
                  </View>
                  <View style={AppStyle.marginTop20}>
                    <TextCountDown
                      nextSendSMS={nextSendSMS}
                      onResend={handleResendSms}
                      styles={styles}
                      t={t}
                    />
                  </View>
                </View>
              </View>
            );
          }}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(
  withDynamicModuleLoader(getModule()),
  withTranslation(),
)(SMSVerificationScreen);
