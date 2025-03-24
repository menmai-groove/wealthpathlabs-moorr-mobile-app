import { useRoute } from '@react-navigation/core';
import ImageCover from 'assets/images/login-image-cover.png';
import BackIcon from 'assets/svgs/backIcon';
import BiometricSetupPrompt from 'components/basics/BiometricSetupPrompt';
import ButtonField from 'components/basics/ButtonField';
import CustomTooltip from 'components/basics/CustomTooltip';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import OTPInputField from 'components/basics/OTPInputField';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import AuthenticationForm from 'components/layouts/AuthenticationForm';
import { AppScreenID } from 'constant';
import CryptoJS from 'crypto-js';
// import OTPInputView from 'greact-native-otp-input';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import Global from 'libs/global';
import { useDispatchResolve } from 'libs/hooks';
import { debounce } from 'lodash';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import { getBiometricInfo, simpleBiometricsPrompt } from 'services/biometrics';
import { setupBiometricInPrompt } from 'store/Auth/action';
import { selectPasswordToken } from 'store/Auth/selector';
import { selectAppPreference } from 'store/Root/selector';
import { verifyAuthenticator, verifySuccess } from 'store/Verification/action';
import getModule from 'store/Verification/module';
import { AppStyle } from 'theme';
import { useAsyncMemo } from 'use-async-memo';

import themedStyles from './styles';

const i18nScope = 'screens.verification';

const PIN_COUNT = 6;

function VerificationScreen(props) {
  const { t } = props;
  const { params } = useRoute();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { googleAuthenticationHelpLink } = useSelector(selectAppPreference);

  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();
  const [code, setCode] = useState('');
  const scrollRef = useRef();
  const tooltipRef = useRef();
  // const otpRef = useRef();
  const passwordToken = useSelector(selectPasswordToken);

  const biometricInfo = useAsyncMemo(async () => await getBiometricInfo(), []);

  // useEffect(() => {
  //   setTimeout(() => {
  //     otpRef?.current?.focusField(0);
  //   }, 500);
  // }, []);

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
      verifyAuthenticator({ pin: code, email: params?.email }),
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

  const onClickHere = useCallback(() => {
    tooltipRef.current.hide();
    UtilLib.openInAppBrowserLink(googleAuthenticationHelpLink);
  }, [googleAuthenticationHelpLink]);

  const handleBack = useCallback(async () => {
    NavigationServiceLib.reset(AppScreenID.Login);
  }, []);

  useOnBackButtonPress(() => handleBack());

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
                  <OTPInputField
                    style={styles.otpContainer}
                    code={code}
                    onCodeChanged={debounce(setCode, 250, {
                      leading: true,
                      trailing: false,
                    })}
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
                        <TextField
                          type="captain"
                          style={styles.clickHereText}
                          onPress={onClickHere}>
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
          }}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withDynamicModuleLoader(getModule()), withTranslation())(VerificationScreen);
