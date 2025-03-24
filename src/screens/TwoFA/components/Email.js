import BiometricSetupPrompt from 'components/basics/BiometricSetupPrompt';
import ButtonField from 'components/basics/ButtonField';
import OTPInputField from 'components/basics/OTPInputField';
import TouchableField from 'components/basics/TouchableField';
import CryptoJS from 'crypto-js';
import { GlobalLib } from 'libs';
// import OTPInputView from 'greact-native-otp-input';
import Global from 'libs/global';
import { useDispatchResolve } from 'libs/hooks';
import { useThemedStyle } from 'providers';
import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getBiometricInfo, simpleBiometricsPrompt } from 'services/biometrics';
import { setupBiometricInPrompt } from 'store/Auth/action';
import { selectPasswordToken } from 'store/Auth/selector';
import { generateEmailCode, verifyEmailCode, verifySuccess } from 'store/Verification/action';
import { AppStyle } from 'theme';
import { useAsyncMemo } from 'use-async-memo';

import themedStyles from '../styles';

const i18nScope = 'screens.emailVerification';

const PIN_COUNT = 6;

const Email = props => {
  const { t, params } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);

  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();
  const [code, setCode] = useState('');
  // const otpRef = useRef(null);
  const passwordToken = useSelector(selectPasswordToken);
  const [firstSend, setFirstSend] = useState(true);

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
    let verifyAuthData = await dispatchResolve(
      verifyEmailCode({ verifyEmailCodePin: code, email: params?.email }),
    );
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

  const handleResend = useCallback(async () => {
    const result = await dispatchResolve(generateEmailCode());
    result && firstSend && setFirstSend(false);
  }, [firstSend, dispatchResolve]);

  if (firstSend) {
    return (
      <View style={AppStyle.flex1}>
        <View style={AppStyle.flex1}>
          <Text type="paragraph-2">{t(`${i18nScope}.firstSubTitle`)}</Text>
          <View style={[styles.otpContainer]} />
          <View style={styles.buttonContainer}>
            <ButtonField type={'primary'} text={t(`${i18nScope}.send`)} onPress={handleResend} />
          </View>
        </View>
      </View>
    );
  }

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
          style={[styles.otpContainer]}
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
            text={firstSend ? t(`${i18nScope}.send`) : t(`${i18nScope}.submit`)}
            onPress={handleSubmit}
          />
        </View>
        <View style={AppStyle.marginTop20}>
          <TouchableField onPress={handleResend}>
            <Text style={[AppStyle.textCenter, styles.resendText]} type="paragraph-2">
              {t(`${i18nScope}.resend`)}
            </Text>
          </TouchableField>
        </View>
      </View>
    </View>
  );
};

export default Email;
