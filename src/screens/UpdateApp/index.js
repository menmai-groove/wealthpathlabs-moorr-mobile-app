import ButtonField from 'components/basics/ButtonField';
import TextField from 'components/basics/TextField';
import { AppConfigs } from 'constant';
import { useThemedStyle, withExitAppHandler } from 'providers';
import React, { useCallback, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, StatusBar, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { compose } from 'redux';

import themedStyles from './styles';

const i18nScope = 'screens.updateApp';

function UpdateApp() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    StatusBar.setBarStyle('dark-content');
    return () => {
      StatusBar.setBarStyle('light-content');
    };
  }, []);

  const generateWebLink = useCallback(() => {
    const appLink = AppConfigs.appLink;
    if (Platform.OS === 'android' && appLink.includes('market://')) {
      return 'https://play.google.com/store/apps/details' + appLink.substr(appLink.indexOf('?'));
    }
    if (Platform.OS === 'ios' && appLink.includes('itms-apps://')) {
      return 'https://apps.apple.com/us/app/id' + appLink.substr(appLink.lastIndexOf('/') + 1);
    }
  }, []);

  const goToStore = useCallback(async () => {
    const supported = await Linking.canOpenURL(AppConfigs.appLink);
    if (supported) {
      Linking.openURL(AppConfigs.appLink);
    } else {
      const alternativeLink = generateWebLink();
      Linking.openURL(alternativeLink);
    }
  }, [generateWebLink]);

  return (
    <View style={[styles.flex1, insets.top > 0 && { paddingTop: insets.top }]}>
      <View style={styles.container}>
        {/* <FastImage source={require('assets/images/primary-logo-2.png')} style={styles.logo} /> */}
        <FastImage
          style={styles.icon}
          source={require('assets/images/optiIcon/newVer.png')}
          resizeMode={FastImage.resizeMode.contain}
        />
        <View style={styles.contentCover}>
          <TextField type="heading-2" style={styles.label}>
            {t(`${i18nScope}.label`)}
          </TextField>
          <TextField style={styles.content}>{t(`${i18nScope}.content`)}</TextField>
        </View>
        <View style={styles.buttonContainer}>
          <ButtonField text={t(`${i18nScope}.button`)} onPress={goToStore} />
        </View>
      </View>
    </View>
  );
}

export default compose(withExitAppHandler)(UpdateApp);
