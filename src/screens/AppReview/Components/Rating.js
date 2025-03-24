import ButtonField from 'components/basics/ButtonField';
import AppSlider from 'components/basics/Slider';
import TextField from 'components/basics/TextField';
import AnimatedLottieView from 'lottie-react-native';
import { useThemedStyle } from 'providers';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppSize, AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.appReview';
const i18nScopeGlobal = 'global';

function Rating({ onPressNext, onPressLater, ratingNumber }) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [ratingValue, setRatingValue] = useState(ratingNumber);
  const { t } = useTranslation();

  return (
    <View>
      <TextField style={AppStyle.textCenter} type="heading-2">
        {t(`${i18nScope}.yourFeedback`)}
      </TextField>
      <View style={styles.ratingOptiContainer}>
        <AnimatedLottieView
          resizeMode="contain"
          style={styles.blinkOpti}
          source={require('assets/images/optiIcon/blink.json')}
          autoPlay
          loop
        />
        <View style={styles.ratingOptiTextContent1}>
          <View style={styles.ratingOptiTextContent}>
            <TextField style={AppStyle.textCenter} type="paragraph-2">
              {t(`${i18nScope}.whatDoYouThinkAboutMoorr`)}
            </TextField>
          </View>
        </View>
      </View>
      <View style={AppStyle.marginX10}>
        <AppSlider
          sliderLength={AppSize.screen.width - 80}
          value={ratingValue}
          onValuesChange={val => setRatingValue(Array.isArray(val) ? val[0] : val)}
          containerStyle={styles.sliderContainer}
        />
        <View style={styles.ratingFeelingContainer}>
          <TextField>{t(`${i18nScope}.iHateIt`)}</TextField>
          <View style={styles.ratingFeelLoveContainer}>
            <TextField>{t(`${i18nScope}.iLoveIt`)}</TextField>
            <Svg width={14} height={11.19} viewBox="0 0 14 11.19">
              <Path
                data-name="Path 75169"
                d="M414.2 526.963c-1.9-1.931-6.606-2.851-5.738-6.992s5.945-2.4 6.946.4c.869-1.611 4.008-3.941 6.212-1.6s-.735 5.854-6.212 9.929"
                transform="translate(-408.359 -517.507)"
                fill={styles.ratingLoveIcon.color}
              />
            </Svg>
          </View>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <ButtonField
          onPress={onPressLater}
          style={styles.button}
          type="medium-secondary"
          text={t(`${i18nScopeGlobal}.cancel`)}
        />
        <ButtonField
          style={styles.button}
          onPress={() => onPressNext(ratingValue)}
          type="medium-primary"
          text={t(`${i18nScopeGlobal}.next`)}
        />
      </View>
    </View>
  );
}

export default Rating;
