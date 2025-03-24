/**
 *
 * ErrorNetwork
 *
 */

import ButtonField from 'components/basics/ButtonField';
import TextField from 'components/basics/TextField';
import { useThemedStyle, withExitAppHandler } from 'providers';
import React, { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBar, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { compose } from 'redux';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.errorNetwork';

function ErrorNetwork({ onPress }) {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, 'screens.errorNetwork');
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    StatusBar.setBarStyle('dark-content');
    return () => {
      StatusBar.setBarStyle('light-content');
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* <FastImage
        source={require('assets/images/bg-network-error.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      /> */}
      <View
        style={[
          AppStyle.flex1,
          AppStyle.middleContent,
          insets.top > 0 && { paddingTop: insets.top },
        ]}>
        <FastImage
          style={styles.icon}
          source={require('assets/images/optiIcon/nowifi.png')}
          resizeMode={FastImage.resizeMode.contain}
        />
        <TextField style={styles.header} type="heading-2">
          {t(`${i18nScope}.label`)}
        </TextField>
        <TextField style={styles.content}>{t(`${i18nScope}.content`)}</TextField>
        <View style={styles.buttonContainer}>
          <ButtonField text={t('global.continue')} onPress={onPress} />
        </View>
      </View>
    </View>
  );
}

ErrorNetwork.propTypes = {};

export default compose(withExitAppHandler)(ErrorNetwork);
