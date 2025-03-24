import ButtonField from 'components/basics/ButtonField';
import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.appReview';

export default function ReviewSuggestion({ onPressNow, onPressLater }) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { t } = useTranslation();
  return (
    <View>
      <TextField style={AppStyle.textCenter} type="heading-2">
        {t(`${i18nScope}.reviewSuggestionTitle`)}
      </TextField>
      <TextField style={styles.reviewSuggestionDescription} type="paragraph-2">
        {t(`${i18nScope}.ReviewSuggestionDescription`)}
      </TextField>
      <View style={styles.buttonContainer}>
        <ButtonField
          style={styles.button}
          onPress={onPressLater}
          type="medium-secondary"
          text={t(`${i18nScope}.doItLater`)}
        />
        <ButtonField
          style={styles.button}
          onPress={onPressNow}
          type="medium-primary"
          text={t(`${i18nScope}.rateNow`)}
        />
      </View>
    </View>
  );
}
