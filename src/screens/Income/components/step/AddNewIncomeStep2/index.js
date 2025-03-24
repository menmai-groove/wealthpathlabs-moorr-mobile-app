import { yupResolver } from '@hookform/resolvers/yup';
import ButtonField from 'components/basics/ButtonField';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { SchemaLib, UtilLib } from 'libs';
import { useThemedStyle } from 'providers';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { withTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import { selectIncomeName, selectLabelIncomeType } from 'store/Income/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.income';

function AddNewIncomeStep2(props) {
  const styles = useThemedStyle(themedStyles, 'screens.AddNewIncome.AddNewIncomeStep1');
  const { t, onPress: handleNextStep, onCancel, disabled } = props;
  const incomeName = useSelector(selectIncomeName);
  const cardNameInput = useRef(null);
  const incomeType = useSelector(selectLabelIncomeType);
  const { handleSubmit, control, errors, setValue } = useForm({
    defaultValues: { name: incomeName ?? '' },
    resolver: yupResolver(SchemaLib.addNewIncome),
    shouldFocusError: false,
  });
  const [disabledNext, setDisableNext] = useState(false);
  const onSubmit = data => {
    Keyboard.dismiss();
    cardNameInput.current.blur();
    handleNextStep(data);
  };
  useEffect(() => {
    setValue('name', incomeName || '');
  }, [incomeName, setValue]);

  useEffect(() => {
    const disabledValue = UtilLib.handleCheckValueStep2(incomeName);
    setDisableNext(disabledValue);
  }, [incomeName]);

  const onError = () => {
    Keyboard.dismiss();
  };
  return (
    <View style={styles.container}>
      <ScrollView
        style={(AppStyle.flex1, AppStyle.pad30)}
        contentContainerStyle={AppStyle.menuPaddingBottom}
        showsVerticalScrollIndicator={false}>
        <View style={styles.incomeType}>
          <TextField style={styles.textIncomeType}>{incomeType}</TextField>
        </View>
        <Question emotion="confused" content={t(`${i18nScope}.step2Hint`)} />
        <View collapsable={false} style={AppStyle.padBottom30}>
          <Controller
            name="name"
            control={control}
            render={({ onChange, onBlur, value }) => (
              <InputField
                ref={cardNameInput}
                placeholder={t(`${i18nScope}.nameCardPlaceholder`)}
                value={value}
                onBlur={onBlur}
                onChangeText={text => {
                  onChange(text);
                  const disabledValue = UtilLib.handleCheckValueStep2(text);
                  setDisableNext(disabledValue);
                }}
                onSubmitEditing={() => {}}
                error={errors.name?.message}
                disabled={disabled}
              />
            )}
          />
        </View>
        <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
          <ButtonField
            text={t('global.cancel')}
            style={styles.buttonField}
            onPress={onCancel}
            type={disabled ? 'disabled' : 'secondary'}
            disabled={disabled}
          />
          <ButtonField
            text={t('global.next')}
            style={styles.buttonField}
            onPress={handleSubmit(onSubmit, onError)}
            type={disabledNext || disabled ? 'disabled' : 'primary'}
            disabled={disabled}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export default compose(withTranslation())(AddNewIncomeStep2);
