/**
 *
 * LaunchScreen
 *
 */

import BiometricPopup from 'components/basics/BiometricPopup';
import BiometricSelectorModal from 'components/basics/BiometricSelectorModal';
import { AppError } from 'constant';
import CryptoJS from 'crypto-js';
import { GlobalLib, PermissionLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import LottieView from 'lottie-react-native';
import { useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
// import codePush from 'react-native-code-push';
import { useDispatch, useSelector } from 'react-redux';
import { getBiometricInfo, simpleBiometricsPrompt } from 'services/biometrics';
import Keychain from 'services/keychain';
import {
  checkUserLogin,
  loginRequest,
  onAccountIsStrongAuth,
  updateTenant,
} from 'store/Auth/action';
import { getAppConfig, requestPermissionsSuccess } from 'store/Root/action';
import {
  selectAppPermissions,
  selectCheckUpdateApp,
  selectConfigLoaded,
  selectNavReady,
} from 'store/Root/selector';
import { AppStyle } from 'theme';
import { useAsyncMemo } from 'use-async-memo';

import { default as AppMeta } from '../../../app.json';

import themedStyles from './styles';

const DURATION = 3000;
const TENANT = 'moorr';

function LaunchScreen() {
  const { t } = useTranslation();
  const isNavReady = useSelector(selectNavReady);
  const isConfigLoaded = useSelector(selectConfigLoaded);
  const isAppPermissions = useSelector(selectAppPermissions);
  const checkUpdateApp = useSelector(selectCheckUpdateApp);
  const dispatch = useDispatch();
  const styles = useThemedStyle(themedStyles);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const timeout = useRef();
  const biometricSelectedValue = useRef(null);
  const [biometricInfo, setBiometricInfo] = useState(null);
  // const [syncStatus, setSyncStatus] = useState();
  // const [syncProgress, setSyncProgress] = useState();

  const dispatchResolve = useDispatchResolve();

  useEffect(() => {
    if (logoLoaded) {
      async function requestPermission() {
        if (AppMeta.ENABLE_PUSH_NOTIFICATION) {
          await PermissionLib.requestNotificationPermission();
        }
        await PermissionLib.requestFaceIDPermission();
        dispatch(requestPermissionsSuccess());
        const biometric = await getBiometricInfo();
        setBiometricInfo(biometric);
      }
      requestPermission();
    }
  }, [dispatch, logoLoaded]);

  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      setLogoLoaded(true);
    }, DURATION + 100);
  }, []);

  const openBiometricSelectorModal = useCallback(
    (listInput, onSubmit) => {
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
        onRequestClose: () => {
          CustomModal.hide();
          dispatch(checkUserLogin());
        },
        onBackdropPress: () => {
          CustomModal.hide();
          dispatch(checkUserLogin());
        },
      });
    },
    [dispatch],
  );

  const checkBiometricsLogin = useCallback(async () => {
    try {
      if (!biometricInfo?.available) {
        return false;
      }
      const credentials = await Keychain.getAllRegisteredAccounts();
      if (!credentials?.length) {
        return false;
      }
      const success = await simpleBiometricsPrompt(t('global.biometricAuthentication'));
      if (!success) {
        return false;
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
                      title={t('screens.login.loginFailedTitle')}
                      description={t('screens.login.loginFailedTokenBiometricsDescription')}
                      buttonText={t('screens.login.close')}
                      onPressButton={() => GlobalLib.CustomModal.get().hide()}
                    />
                  ),
                  onRequestClose: () => GlobalLib.CustomModal.get().hide(),
                  onBackdropPress: () => GlobalLib.CustomModal.get().hide(),
                });
              }
              dispatch(checkUserLogin());
            });
        } else {
          GlobalLib.Toast.get().toastError(t('errorMsg.keyChainError.noCredentialsStored'));
          dispatch(checkUserLogin());
        }
      });
      return true;
    } catch (error) {
      if (error.message) {
        GlobalLib.Toast.get().toastError(error?.message);
      }
      return false;
    }
  }, [biometricInfo, dispatch, dispatchResolve, openBiometricSelectorModal, t]);

  const handleBiometricsLogin = useCallback(async () => {
    const success = await checkBiometricsLogin();
    if (!success) {
      dispatch(checkUserLogin());
    }
  }, [checkBiometricsLogin, dispatch]);

  useEffect(() => {
    if (
      isNavReady &&
      isConfigLoaded &&
      isAppPermissions &&
      !checkUpdateApp &&
      logoLoaded &&
      biometricInfo
    ) {
      handleBiometricsLogin();
    }
  }, [
    dispatch,
    isNavReady,
    isConfigLoaded,
    isAppPermissions,
    checkUpdateApp,
    logoLoaded,
    handleBiometricsLogin,
    biometricInfo,
  ]);

  // const deploymentKey =
  //   Platform.OS === 'android'
  //     ? AppConfigs.codePushDevelopmentKeyAndroid
  //     : AppConfigs.codePushDevelopmentKeyIos;

  // const getCodePushMessage = useCallback(
  //   status => {
  //     switch (status) {
  //       case codePush.SyncStatus.CHECKING_FOR_UPDATE:
  //         return t('codepushMsg.checkForUpdate');
  //       case codePush.SyncStatus.DOWNLOADING_PACKAGE:
  //         return t('codepushMsg.downloadPackage');
  //       case codePush.SyncStatus.INSTALLING_UPDATE:
  //         return t('codepushMsg.installUpdate');
  //       case codePush.SyncStatus.UP_TO_DATE:
  //         return t('codepushMsg.upToDate');
  //       case codePush.SyncStatus.UPDATE_INSTALLED:
  //         return t('codepushMsg.updatedInstalled');
  //     }
  //   },
  //   [t],
  // );

  // const codePushStatusDidChange = status => {
  //   setSyncStatus(status);
  // };

  // const codePushDownloadDidProgress = progress => {
  //   setSyncProgress(progress);
  // };

  useAsyncMemo(async () => {
    // if (__DEV__) {
    if (!isConfigLoaded) {
      dispatch(updateTenant(TENANT));
      dispatch(getAppConfig({ tenant: TENANT }));
    }
    //   return;
    // }
    // codePush.notifyAppReady();
    // codePush
    //   .checkForUpdate(deploymentKey)
    //   .then(update => {
    //     if (!update) {
    //       if (!isConfigLoaded) {
    //         dispatch(updateTenant(TENANT));
    //         dispatch(getAppConfig({ tenant: TENANT }));
    //       }
    //     } else {
    //       codePush
    //         .sync(
    //           {
    //             updateDialog: false,
    //             installMode: codePush.InstallMode.IMMEDIATE,
    //             mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
    //             deploymentKey: deploymentKey,
    //             rollbackRetryOptions: {
    //               delayInMilliseconds: 1000,
    //               maxRetryAttempts: 2,
    //             },
    //           },
    //           codePushStatusDidChange,
    //           codePushDownloadDidProgress,
    //         )
    //         .finally(() => {
    //           if (!isConfigLoaded) {
    //             dispatch(updateTenant(TENANT));
    //             dispatch(getAppConfig({ tenant: TENANT }));
    //           }
    //         });
    //     }
    //   })
    //   .catch(() => {
    //     if (!isConfigLoaded) {
    //       dispatch(updateTenant(TENANT));
    //       dispatch(getAppConfig({ tenant: TENANT }));
    //     }
    //   });
  }, [isConfigLoaded]);

  return (
    <View style={[styles.container]}>
      <View style={AppStyle.marginBottom30}>
        <LottieView
          autoPlay
          loop={false}
          style={styles.logo}
          source={require('assets/images/moorr-animated-logo.json')}
          duration={DURATION}
        />
      </View>
      {/* {!isEmpty(syncProgress) && (
        <View style={styles.codePushWrapper}>
          <View style={styles.codePushStatus}>
            <Text>{getCodePushMessage(syncStatus)}</Text>
          </View>
          <View>
            <ProgressBar
              progress={syncProgress.receivedBytes / syncProgress.totalBytes}
              barStyle={styles.syncProgressBar}
            />
          </View>
        </View>
      )} */}
    </View>
  );
}

LaunchScreen.propTypes = {};

export default LaunchScreen;
