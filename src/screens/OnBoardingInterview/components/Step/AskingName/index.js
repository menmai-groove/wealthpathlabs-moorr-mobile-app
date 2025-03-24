import { yupResolver } from '@hookform/resolvers/yup';
import ButtonField from 'components/basics/ButtonField';
import InputField from 'components/basics/InputField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import { SchemaLib } from 'libs';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import React, { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { withTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import { selectAskingNameData } from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.onBoardingInterview.askingName';

function AskingName(props) {
  useOnBackButtonPress(props.onBack);
  const { t, onPress: handleNextStep } = props;
  const styles = useThemedStyle(themedStyles, 'screens.onBoardingInterview.askingName');
  const fNameInput = useRef(null);
  const askingNameData = useSelector(selectAskingNameData);

  const { handleSubmit, control, errors, setValue } = useForm({
    defaultValues: { fName: '' },
    resolver: yupResolver(SchemaLib.onBoardingInterviewSchema.askingName),
    shouldFocusError: false,
  });

  useEffect(() => {
    setValue('fName', askingNameData?.name || '');
  }, [askingNameData, setValue]);

  const onSubmit = data => {
    Keyboard.dismiss();
    fNameInput.current.blur();
    handleNextStep({ name: data.fName });
  };

  const onError = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={AppStyle.flex1}
        contentContainerStyle={[AppStyle.padX30, AppStyle.padBottom40]}
        showsVerticalScrollIndicator={false}>
        <Question
          emotion="smile"
          content={t(`${i18nScope}.welcome`)}
          question={t(`${i18nScope}.question`)}
        />
        <View collapsable={false}>
          <Controller
            name="fName"
            control={control}
            render={({ onChange, onBlur, value }) => (
              <InputField
                ref={fNameInput}
                placeholder={t(`${i18nScope}.namePlaceholder`, 'Enter your first name')}
                required
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(onSubmit, onError)}
                error={errors.fName?.message}
              />
            )}
          />
        </View>
        <ButtonField
          style={[AppStyle.marginTop20]}
          text={t('global.next')}
          onPress={handleSubmit(onSubmit, onError)}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withTranslation())(AskingName);
