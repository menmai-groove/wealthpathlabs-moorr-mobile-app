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
import { selectHouseholdData } from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.onBoardingInterview.householdKid';

function HouseholdKid(props) {
  useOnBackButtonPress(props.onBack);
  const { t, onPress: handleNextStep } = props;
  const styles = useThemedStyle(themedStyles, 'screens.onBoardingInterview.householdKid');
  const dependantKidInput = useRef(null);
  const householdData = useSelector(selectHouseholdData);

  const { handleSubmit, control, errors, setValue } = useForm({
    defaultValues: { dependantKid: '' },
    resolver: yupResolver(SchemaLib.onBoardingInterviewSchema.householdKid),
    shouldFocusError: false,
  });

  useEffect(() => {
    setValue('dependantKid', householdData?.dependantKid || '');
  }, [householdData, setValue]);

  const onSubmit = data => {
    Keyboard.dismiss();
    dependantKidInput.current.blur();
    handleNextStep({ dependantKid: data.dependantKid });
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
        <Question emotion="blink" content={t(`${i18nScope}.question`)} />
        <View style={AppStyle.flex1} collapsable={false}>
          <Controller
            name="dependantKid"
            control={control}
            render={({ onChange, onBlur, value }) => (
              <InputField
                ref={dependantKidInput}
                keyboardType={'number-pad'}
                placeholder={t(
                  `${i18nScope}.dependantKidPlaceholder`,
                  'Enter number of dependant kids',
                )}
                required
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(onSubmit, onError)}
                error={errors.dependantKid?.message}
              />
            )}
          />
        </View>
        <ButtonField
          style={AppStyle.marginTop20}
          text={t('global.next')}
          onPress={handleSubmit(onSubmit, onError)}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withTranslation())(HouseholdKid);
