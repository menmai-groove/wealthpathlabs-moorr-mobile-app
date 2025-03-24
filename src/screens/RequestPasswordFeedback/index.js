import ButtonField from 'components/basics/ButtonField';
import TextField from 'components/basics/TextField';
import Header from 'components/layouts/Header';
import { AppScreenID } from 'constant';
import { NavigationServiceLib, UtilLib } from 'libs';
import { useThemedStyle, withBackHandler } from 'providers';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { selectAppPreference } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.requestPassword';

function RequestPasswordFeedback() {
  const { t } = useTranslation();

  const styles = useThemedStyle(themedStyles, i18nScope);
  const { feedbackInformingLink } = useSelector(selectAppPreference);

  const handleOpenLink = useCallback(() => {
    UtilLib.openInAppBrowserLink(feedbackInformingLink);
  }, [feedbackInformingLink]);

  const onBackHeader = useCallback(() => {
    NavigationServiceLib.pop();
  }, []);

  const redirectToLoginScreen = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.Login);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header type="back" background={false} onBackHeader={onBackHeader} />
      </View>
      <View style={styles.wrap}>
        <View style={[AppStyle.middleContent]}>
          <Image
            source={require('assets/images/icon-forgot-password-2.png')}
            style={styles.image}
          />
        </View>
        <View style={styles.boxContentInform}>
          <TextField type="heading-1">{t(`${i18nScope}.titleInforming`)}</TextField>
          <TextField style={styles.content}>
            {t(`${i18nScope}.contentInforming`)}
            <TextField
              type="paragraph-2"
              style={[styles.content, styles.textWithLink]}
              onPress={handleOpenLink}
              suppressHighlighting={true}>
              {t(`${i18nScope}.contentInformLink`)}
            </TextField>
          </TextField>
        </View>
        <View style={AppStyle.alignContent}>
          <ButtonField
            style={styles.buttonLogin}
            text={t(`${i18nScope}.login`)}
            onPress={redirectToLoginScreen}
          />
        </View>
      </View>
    </View>
  );
}

export default compose(withBackHandler)(RequestPasswordFeedback);
