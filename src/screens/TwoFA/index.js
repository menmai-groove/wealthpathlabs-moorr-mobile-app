import { useRoute } from '@react-navigation/core';
import ImageCover from 'assets/images/login-image-cover.png';
import BackIcon from 'assets/svgs/backIcon';
import DropDownForForm from 'components/basics/DropDownForForm';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import AuthenticationForm from 'components/layouts/AuthenticationForm';
import { AppScreenID } from 'constant';
import { NavigationServiceLib } from 'libs';
import { isNil } from 'lodash';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import Email from 'screens/TwoFA/components/Email';
import GA from 'screens/TwoFA/components/GA';
import SMS from 'screens/TwoFA/components/SMS';
import getModule from 'store/Verification/module';
import { selectTwoFAMethods } from 'store/Verification/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.twoFA';

const defaultIndex = 0;
const dropdownList = [
  { value: 'google', display: 'Google Authenticator' },
  { value: 'email', display: 'Email' },
  { value: 'sms', display: 'SMS' },
];

function TwoFAScreen(props) {
  const { t } = props;
  const { params } = useRoute();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const twoFAMethods = useSelector(selectTwoFAMethods);
  const activeDropdownList = useMemo(
    () =>
      dropdownList.filter(item => (!isNil(twoFAMethods) ? twoFAMethods?.[item.value] : false)) ||
      [],
    [twoFAMethods],
  );
  const [twoFAIndex, setTwoFAIndex] = useState(defaultIndex);
  const scrollRef = useRef();
  useOnBackButtonPress(() => handleBack());

  const handleBack = useCallback(async () => {
    NavigationServiceLib.reset(AppScreenID.Login);
  }, []);

  const onSelect = useCallback(indexInput => {
    setTwoFAIndex(indexInput);
  }, []);

  const TwoFAMethod = useCallback(() => {
    const method = activeDropdownList[twoFAIndex]?.value;
    switch (method) {
      case dropdownList[0].value:
        return <GA t={t} params={params} />;
      case dropdownList[1].value:
        return <Email t={t} params={params} />;
      case dropdownList[2].value:
        return <SMS t={t} params={params} />;
      default:
        return null;
    }
  }, [activeDropdownList, twoFAIndex, t, params]);

  const redirectSignUpScreen = useCallback(() => {
    NavigationServiceLib.reset(AppScreenID.SignUp);
  }, []);

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
          title={
            activeDropdownList[twoFAIndex]?.value === 'email'
              ? t(`${i18nScope}.titleEmail`)
              : t(`${i18nScope}.title`)
          }
          renderContent={() => {
            return (
              <View style={AppStyle.flex1}>
                <DropDownForForm
                  value={activeDropdownList[twoFAIndex]}
                  options={activeDropdownList}
                  onSelect={onSelect}
                />
                <View style={[AppStyle.flex1, AppStyle.marginTop20]}>
                  <TwoFAMethod />
                </View>
              </View>
            );
          }}
          renderFooter={() => (
            <View style={[AppStyle.rowFlex, AppStyle.middleContent]}>
              <TextField type="text-label">{t('screens.login.dontHaveAccount')}</TextField>
              <TouchableField onPress={redirectSignUpScreen}>
                <TextField type="text-label" style={styles.signUpText}>
                  {t('screens.login.signUp')}
                </TextField>
              </TouchableField>
            </View>
          )}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withDynamicModuleLoader(getModule()), withTranslation())(TwoFAScreen);
