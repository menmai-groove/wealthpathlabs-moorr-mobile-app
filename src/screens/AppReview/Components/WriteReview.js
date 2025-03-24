import ButtonField from 'components/basics/ButtonField';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.appReview';
const i18nScopeGlobal = 'global';

function WriteReview({ onPressSubmit, onPressBack, reviewText, subtitle }) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [review, setReview] = useState(reviewText || '');
  const { t } = useTranslation();
  const [error, setError] = useState('');

  return (
    <Pressable onPress={() => Keyboard.dismiss()}>
      <TextField style={AppStyle.textCenter} type="heading-2">
        {t(`${i18nScope}.yourFeedback`)}
      </TextField>
      <View style={AppStyle.marginX20}>
        <TextField style={[AppStyle.marginTop20, AppStyle.marginBottom5]} type="heading-4">
          {subtitle || t(`${i18nScope}.tellUsWhyYouGaveThisRating`)}
        </TextField>
        <InputField
          value={review}
          keyboardType="default"
          placeholder={t(`${i18nScope}.maxOf1000Characters`)}
          onChangeText={txt => {
            setReview(txt);
            if (isEmpty(txt.trim())) {
              setError(t(`${i18nScope}.required`));
            } else {
              setError('');
            }
          }}
          multiline={true}
          maxLength={1000}
          required={true}
          error={error}
        />
        <TextField style={AppStyle.marginTop5} type="captain">
          {t(`${i18nScope}.note`)}
        </TextField>
      </View>
      <View style={[styles.buttonContainer, AppStyle.marginTop20]}>
        <ButtonField
          onPress={() => {
            onPressBack(review);
          }}
          style={styles.button}
          type="medium-secondary"
          text={t(`${i18nScopeGlobal}.back`)}
        />
        <ButtonField
          style={styles.button}
          onPress={() => {
            if (isEmpty(review.trim())) {
              setError(t(`${i18nScope}.required`));
              return;
            }
            onPressSubmit(review);
          }}
          type="medium-primary"
          text={t(`${i18nScopeGlobal}.submit`)}
        />
      </View>
    </Pressable>
  );
}

export default WriteReview;
