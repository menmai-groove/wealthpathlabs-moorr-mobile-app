import BiometricSetupPrompt from 'components/basics/BiometricSetupPrompt';
import ButtonField from 'components/basics/ButtonField';
import OTPInputField from 'components/basics/OTPInputField';
import { AppScreenID } from 'constant';
import CryptoJS from 'crypto-js';
// import OTPInputView from 'greact-native-otp-input';
import { GlobalLib, NavigationServiceLib } from 'libs';
import Global from 'libs/global';
import { useDispatchResolve } from 'libs/hooks';
import { get } from 'lodash';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { TextCountDown } from 'screens/SMSVerification';
import { getBiometricInfo, simpleBiometricsPrompt } from 'services/biometrics';
import { setupBiometricInPrompt } from 'store/Auth/action';
import { selectPasswordToken } from 'store/Auth/selector';
import { resendSms, verifySms, verifySuccess } from 'store/Verification/action';
import { AppStyle } from 'theme';
import { useAsyncMemo } from 'use-async-memo';

import themedStyles from '../../SMSVerification/styles';

const i18nScope = 'screens.smsVerification';

const PIN_COUNT = 7;

const SMS = props => {
  const { t, params } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);

  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();
  const [code, setCode] = useState('');
  const [nextSendSMS, setNextSendSMS] = useState(null);
  // const otpRef = useRef(null);
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
      // otpRef?.current?.focusField(0);
      handleSendSms();
    }, 500);
  }, [handleSendSms]);

  return (
    <View style={AppStyle.flex1}>
      <View style={AppStyle.flex1}>
        <Text type="paragraph-2">{t(`${i18nScope}.subTitle`)}</Text>
        <OTPInputField
          style={styles.otpContainer}
          code={code}
          onCodeChanged={setCode}
          maxLength={PIN_COUNT}
          codeInputFieldStyle={styles.underlineStyleBase}
          codeInputHighlightStyle={styles.underlineStyleHighLighted}
          autoFocusOnLoad
          onErrorFilled={errorCode => {
            if (errorCode === 'invalid-code') {
              GlobalLib.Toast.get().toastError(t(`${i18nScope}.invalidCode`));
            }
          }}
        />
        {/* <OTPInputView
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
              Global.Toast.get().toastError(t(`${i18nScope}.invalidCode`));
            }
          }}
        /> */}
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
};

export default SMS;
