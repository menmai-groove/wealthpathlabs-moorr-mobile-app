import BiometricSetupPrompt from 'components/basics/BiometricSetupPrompt';
import ButtonField from 'components/basics/ButtonField';
import CustomTooltip from 'components/basics/CustomTooltip';
import OTPInputField from 'components/basics/OTPInputField';
import TextField from 'components/basics/TextField';
import CryptoJS from 'crypto-js';
// import OTPInputView from 'greact-native-otp-input';
import { GlobalLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { useThemedStyle } from 'providers';
import React, { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getBiometricInfo, simpleBiometricsPrompt } from 'services/biometrics';
import { setupBiometricInPrompt } from 'store/Auth/action';
import { selectPasswordToken } from 'store/Auth/selector';
import { selectAppPreference } from 'store/Root/selector';
import { verifyAuthenticator, verifySuccess } from 'store/Verification/action';
import { AppStyle } from 'theme';
import { useAsyncMemo } from 'use-async-memo';

import themedStyles from '../../Verification/styles';

const i18nScope = 'screens.verification';

const PIN_COUNT = 6;

const GA = props => {
  const { t, params } = props;
  // const otpRef = useRef();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [code, setCode] = useState('');
  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();
  const tooltipRef = useRef();
  const passwordToken = useSelector(selectPasswordToken);
  const { googleAuthenticationHelpLink } = useSelector(selectAppPreference);

  const biometricInfo = useAsyncMemo(async () => await getBiometricInfo(), []);

  // useEffect(() => {
  //   setTimeout(() => {
  //     otpRef?.current?.focusField(0);
  //   }, 500);
  // }, []);

  const onCancelBiometric = useCallback(
    verifyAuthData => {
      GlobalLib.CustomModal.get().hide();
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
          GlobalLib.CustomModal.get().hide();
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
      verifyAuthenticator({ pin: code, email: params?.email }),
    );
    if (verifyAuthData) {
      if (verifyAuthData.isShowPrompt && biometricInfo?.available) {
        GlobalLib.CustomModal.get().show({
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

  const onClickHere = useCallback(() => {
    tooltipRef.current.hide();
    UtilLib.openInAppBrowserLink(googleAuthenticationHelpLink);
  }, [googleAuthenticationHelpLink]);

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
          autoFocusOnLoad
          codeInputFieldStyle={styles.underlineStyleBase}
          codeInputHighlightStyle={styles.underlineStyleHighLighted}
          keyboardType="number-pad"
          onErrorFilled={errorCode => {
            if (errorCode === 'invalid-code') {
              GlobalLib.Toast.get().toastError(t(`${i18nScope}.invalidCode`));
            }
          }}
        /> */}
        <TextField type="captain">
          <TextField type="captain" font="medium">
            {t(`${i18nScope}.note`)}
          </TextField>
          {t(`${i18nScope}.noteDescription`)}
        </TextField>
        <View style={styles.buttonContainer}>
          <ButtonField
            type={code.length === PIN_COUNT ? 'primary' : 'disabled'}
            text={t(`${i18nScope}.submit`)}
            onPress={handleSubmit}
          />
        </View>
      </View>
      <View style={[AppStyle.flexEndContent, AppStyle.marginTop40]}>
        <CustomTooltip
          ref={tooltipRef}
          hideArrow
          placement="top"
          content={
            <TextField style={styles.spacing} type="captain" font="regular">
              {t(`${i18nScope}.noteContent1`)}
              <TextField type="captain" style={styles.clickHereText} onPress={onClickHere}>
                {t(`${i18nScope}.clickHere`)}
              </TextField>
              {'\n\n'}
              <TextField type="captain" font="medium">
                {t(`${i18nScope}.note`)}
              </TextField>{' '}
              {t(`${i18nScope}.noteContent2`)}
            </TextField>
          }
          tooltipStyle={styles.tooltipStyle}
          label={t(`${i18nScope}.readInformation`)}
        />
      </View>
    </View>
  );
};

export default GA;
