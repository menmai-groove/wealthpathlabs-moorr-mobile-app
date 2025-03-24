import Avatar from 'components/basics/Avatar';
import ButtonField from 'components/basics/ButtonField';
import CustomMarkdown from 'components/basics/CustomMarkdown';
import Switch from 'components/basics/Switch';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import Header from 'components/layouts/Header';
import { AppConstants, AppScreenID } from 'constant';
import CryptoJS from 'crypto-js';
import { AnalyticsLib, GlobalLib, NavigationServiceLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { isEmpty } from 'lodash';
import { useThemedStyle, withBackHandler } from 'providers';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Platform, ScrollView, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import { getBiometricInfo, simpleBiometricsPrompt } from 'services/biometrics';
import Keychain from 'services/keychain';
import {
  deleteUser,
  logout,
  updateBiometrics,
  updateBiometricsManual,
  updatePasswordToken,
} from 'store/Auth/action';
import { selectPasswordToken, selectUser } from 'store/Auth/selector';
import { AppStyle } from 'theme';
import { useAsyncMemo } from 'use-async-memo';

import themedStyles from './styles';

const i18nScope = 'screens.profileSetting';

function ProfileSetting(props) {
  const { t } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);

  const dispatchResolve = useDispatchResolve();
  const dispatch = useDispatch();
  const [biometricEnable, setBiometricEnable] = useState(false);
  const user = useSelector(selectUser);
  const passwordToken = useSelector(selectPasswordToken);
  const switchRef = useRef();
  const biometricInfo = useAsyncMemo(async () => await getBiometricInfo(), []);

  useEffect(() => {
    if (biometricInfo?.available && user?.email) {
      Keychain.getAccountIfRegistered(user?.email).then(account => {
        setBiometricEnable(!!account);
      });
    }
  }, [biometricInfo, user]);

  const enableBiometric = useCallback(async () => {
    if (!user?.email) {
      return;
    }
    const success = await simpleBiometricsPrompt(t('global.biometricAuthentication'));
    if (!success) {
      return;
    }
    const email = user?.email;
    const password = CryptoJS.AES.decrypt(passwordToken, String(email).toLowerCase()).toString(
      CryptoJS.enc.Utf8,
    );
    await dispatchResolve(
      updateBiometrics({
        email: email,
        password: password,
        isRegisterNewKey: true,
      }),
    );
    dispatch(updateBiometricsManual(email));
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.enableBiometric, {
      platform: Platform.OS,
    });
    setBiometricEnable(true);
  }, [user, t, passwordToken, dispatchResolve, dispatch]);

  const disableBiometric = useCallback(async () => {
    if (!user?.email) {
      return;
    }
    const success = await simpleBiometricsPrompt(t('global.biometricAuthentication'));
    if (!success) {
      return;
    }
    const email = user?.email;
    const { password } = await Keychain.getAccountIfRegistered(email);
    await Keychain.removeAccounts(email);

    dispatch(updatePasswordToken(password));
    dispatch(updateBiometricsManual(email));
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.disableBiometric, {
      platform: Platform.OS,
    });
    setBiometricEnable(false);
  }, [dispatch, t, user]);

  const onValueChange = useCallback(
    async ({ value }) => {
      try {
        GlobalLib.Loading.get().show();
        if (value) {
          await enableBiometric();
        } else {
          await disableBiometric();
        }
      } finally {
        GlobalLib.Loading.get().hide();
      }
    },
    [enableBiometric, disableBiometric],
  );

  const onShowModalConfirm = useCallback(
    data => {
      const { title, body, next: nextStep, ui } = data;
      if (ui === 'dialog') {
        GlobalLib.CustomModal.get().show({
          body: (
            <View style={[AppStyle.padX15]}>
              <View style={AppStyle.alignContent}>
                {!isEmpty(title) && <CustomMarkdown style={styles.title}>{title}</CustomMarkdown>}
              </View>
              {!isEmpty(body) && <TextField style={styles.description}>{body}</TextField>}
              <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
                <ButtonField
                  text={t(`${i18nScope}.cancel`)}
                  onPress={() => {
                    GlobalLib.CustomModal.get().hide();
                  }}
                />
                <ButtonField
                  type="secondary"
                  text={t(`${i18nScope}.delete`)}
                  onPress={() => {
                    onDeleteAccount(nextStep);
                    GlobalLib.CustomModal.get().hide();
                  }}
                />
              </View>
            </View>
          ),
        });
      }
      if (ui === 'toast') {
        GlobalLib.Toast.get().toastInfo(body);
        NavigationServiceLib.reset(AppScreenID.SignUp);
      }
    },

    [onDeleteAccount, styles, t],
  );

  const onDeleteAccount = useCallback(
    async nextStep => {
      const data = await dispatchResolve(deleteUser({ slug: nextStep }));
      if (data) {
        onShowModalConfirm(data);
      }
    },
    [dispatchResolve, onShowModalConfirm],
  );

  const drawerItemList = useMemo(() => {
    const hasPartnerAccount = user?.hasPartnerAccount;
    const isPartner = user?.partnerUID;
    const items = [
      {
        icon: () => (
          <FastImage
            style={{
              width: 31 / 2,
              height: 33 / 2,
            }}
            source={require('assets/images/profileSetting/user.png')}
          />
        ),
        label: t(`${i18nScope}.myProfile`),
        onPress: () => {
          NavigationServiceLib.navigate(AppScreenID.Profile);
        },
      },
      {
        icon: () => (
          <FastImage
            style={{
              width: 33 / 2,
              height: 33 / 2,
            }}
            source={require('assets/images/profileSetting/lock.png')}
          />
        ),
        label: t(`${i18nScope}.changePassword`),
        onPress: () => {
          NavigationServiceLib.navigate(AppScreenID.ChangePassword);
        },
      },
      {
        icon: () => (
          <FastImage
            style={{
              width: 33 / 2,
              height: 33 / 2,
            }}
            source={require('assets/images/profileSetting/delete.png')}
          />
        ),
        label: t(`${i18nScope}.deleteAccount`),
        onPress: () => onDeleteAccount('userDeleteStep1'),
        hidden: hasPartnerAccount || isPartner,
      },
      {
        icon: () => (
          <FastImage
            style={{
              width: 33 / 2,
              height: 33 / 2,
            }}
            source={require('assets/images/profileSetting/power-off.png')}
          />
        ),
        label: t(`${i18nScope}.signOut`),
        onPress: () => {
          GlobalLib.ConfirmModal.get().show({
            title: t('components.logout.title'),
            content: t('components.logout.message'),
            onConfirm: () => dispatch(logout()),
          });
        },
      },
    ];

    if (biometricInfo?.available) {
      items.splice(1, 0, {
        label: biometricInfo?.isFaceID
          ? t(`${i18nScope}.loginFaceID`)
          : biometricInfo?.isTouchID
          ? t(`${i18nScope}.loginTouchID`)
          : t(`${i18nScope}.loginBiometrics`),
        icon: () => (
          <FastImage
            style={{
              width: 37 / 2,
              height: 37 / 2,
            }}
            source={require('assets/images/profileSetting/faceID.png')}
          />
        ),
        switch: () => (
          <Switch ref={switchRef} onValueChange={onValueChange} value={biometricEnable} />
        ),
        onPress: () => {
          switchRef.current.toggle(biometricEnable);
        },
      });
    }

    if (__DEV__) {
      items.push({
        label: 'Settings',
        onPress: () => {
          NavigationServiceLib.navigate(AppScreenID.Settings);
        },
      });
      items.push({
        label: 'Style Guide',
        onPress: () => {
          NavigationServiceLib.navigate(AppScreenID.StyleGuide);
        },
      });
    }
    return items;
  }, [biometricEnable, biometricInfo, dispatch, onValueChange, onDeleteAccount, t, user]);

  return (
    <View style={styles.container}>
      <Header type="none" title={t(`${i18nScope}.title`)} />
      <ScrollView
        style={AppStyle.flex1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={AppStyle.menuPaddingBottom}>
        <View style={[AppStyle.container]}>
          <View style={[styles.content]}>
            <View style={AppStyle.middleContent}>
              <Avatar size={100}>{user?.fullName}</Avatar>
            </View>
            <View style={AppStyle.alignContent}>
              <View style={AppStyle.marginTop5}>
                <TextField type="heading-3">{user?.fullName}</TextField>
              </View>
              <View style={AppStyle.marginTop5}>
                <TextField style={styles.emailText} type="paragraph-2">
                  {user?.email}
                </TextField>
              </View>
            </View>

            <View style={styles.body}>
              {drawerItemList
                ?.filter(item => !item.hidden)
                ?.map((item, index) => {
                  const isFirst = index === 0;
                  return (
                    <TouchableField key={`item-${index}`} onPress={item?.onPress}>
                      <View
                        style={[
                          AppStyle.rowFlex,
                          AppStyle.spaceBetweenContent,
                          {
                            ...(!isFirst ? AppStyle.marginTop25 : {}),
                          },
                        ]}>
                        <View style={AppStyle.rowFlex}>
                          <View style={[AppStyle.middleContent, styles.box]}>
                            {typeof item?.icon === 'function' && item?.icon()}
                          </View>
                          <View style={[AppStyle.justifyContent, AppStyle.marginLeft15]}>
                            <TextField type="paragraph-1">{item?.label}</TextField>
                          </View>
                        </View>
                        <View style={AppStyle.justifyContent}>
                          {typeof item?.switch === 'function' && item?.switch()}
                        </View>
                      </View>
                    </TouchableField>
                  );
                })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default compose(withTranslation(), withBackHandler)(ProfileSetting);
