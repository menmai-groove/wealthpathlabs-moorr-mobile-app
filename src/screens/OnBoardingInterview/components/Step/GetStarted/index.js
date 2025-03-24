import ButtonField from 'components/basics/ButtonField';
import TextField from 'components/basics/TextField';
import { useThemedStyle, withExitAppHandler } from 'providers';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Image, ScrollView, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { compose } from 'redux';
import { AppStyle } from 'theme';

import CardComponent from './CardComponent';
import themedStyles from './styles';

const i18nScope = 'screens.onBoardingInterview.getStarted';

function GetStarted(props) {
  const { t, onPress } = props;
  const styles = useThemedStyle(themedStyles, 'screens.onBoardingInterview.getStarted');

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top', 'right', 'left']} style={styles.safeView}>
        <Image source={require('assets/images/secondary-logo-1.png')} style={styles.logo} />
        <LinearGradient
          style={styles.bubbleHeader}
          colors={[styles.bubbleHeader.color1, styles.bubbleHeader.color2]}
          angle={142}
          useAngle
        />
      </SafeAreaView>
      <View style={styles.box}>
        <ScrollView
          contentContainerStyle={[AppStyle.padX30, AppStyle.padY20]}
          showsVerticalScrollIndicator={false}>
          <TextField type="heading-2" font="semi-bold" style={styles.title}>
            {t(`${i18nScope}.titleStartOnboarding`)}
          </TextField>
          <CardComponent
            title={t(`${i18nScope}.titleCardItem1`)}
            description={t(`${i18nScope}.descriptionCardItem1`)}
            image={require('assets/images/onboardingInterview/start-onboarding-1.png')}
          />
          <CardComponent
            title={t(`${i18nScope}.titleCardItem2`)}
            description={t(`${i18nScope}.descriptionCardItem2`)}
            image={require('assets/images/onboardingInterview/start-onboarding-2.png')}
            ltr={false}
          />
          <CardComponent
            title={t(`${i18nScope}.titleCardItem3`)}
            description={t(`${i18nScope}.descriptionCardItem3`)}
            image={require('assets/images/onboardingInterview/start-onboarding-3.png')}
          />
          <TextField style={styles.textFooter}>{t(`${i18nScope}.textFooter`)}</TextField>
          <ButtonField
            style={[AppStyle.marginTop10]}
            text={t(`${i18nScope}.btnGetStarted`)}
            onPress={() => onPress()}
          />
        </ScrollView>
      </View>
    </View>
  );
}

export default compose(withTranslation(), withExitAppHandler)(GetStarted);
