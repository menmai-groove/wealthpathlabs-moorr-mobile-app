import TextField from 'components/basics/TextField';
import LottieView from 'lottie-react-native';
import { useThemedStyle, withExitAppHandler } from 'providers';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { withTranslation } from 'react-i18next';
import { StatusBar, useWindowDimensions, View } from 'react-native';
import { compose } from 'redux';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const DURATION = 2500;
const i18nScope = 'screens.onBoardingInterview.success';

function Success(props) {
  const { t, onPress: handleNextStep } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { width: screenWidth } = useWindowDimensions();
  const timeout = useRef();

  useLayoutEffect(() => {
    StatusBar.setBarStyle('dark-content');
    return () => {
      StatusBar.setBarStyle('light-content');
    };
  }, []);

  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      handleNextStep();
    }, DURATION + 100);
  }, [handleNextStep]);

  return (
    <View style={styles.container}>
      <View style={styles.confettiContainer}>
        <LottieView
          resizeMode="contain"
          style={[{ width: screenWidth }, styles.confetti]}
          source={require('assets/images/optiIcon/confetti.json')}
          autoPlay
          loop={false}
          duration={DURATION}
        />
        <LottieView
          resizeMode="contain"
          style={styles.smileOpti}
          source={require('assets/images/optiIcon/excited.json')}
          autoPlay
          loop
        />
      </View>
      <TextField type="heading-2" style={AppStyle.marginTop40}>
        {t(`${i18nScope}.title`)}
      </TextField>
      <TextField style={[AppStyle.marginTop10, AppStyle.textCenter]}>
        {t(`${i18nScope}.message`)}
      </TextField>
    </View>
  );
}

export default compose(withTranslation(), withExitAppHandler)(Success);
