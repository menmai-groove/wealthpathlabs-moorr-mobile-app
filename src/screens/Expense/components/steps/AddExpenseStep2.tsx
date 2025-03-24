import { yupResolver } from '@hookform/resolvers/yup';
import ButtonField from 'components/basics/ButtonField';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { SchemaLib } from 'libs';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useFormData } from 'screens/Expense/useSaveFormData';
import Question from 'screens/OnBoardingInterview/components/Question';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.expense';

export function AddExpenseStep2(props) {
  useOnBackButtonPress(props.onBack);
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { t } = useTranslation();
  const { onPress: handleNextStep, onCancel } = props;
  const { formData, saveFormData } = useFormData();

  const cardNameInput = useRef(null);

  const { handleSubmit, control, errors } = useForm({
    defaultValues: { name: formData.name ?? '' },
    resolver: yupResolver(SchemaLib.addNewExpense),
    shouldFocusError: false,
  });
  const onSubmit = data => {
    Keyboard.dismiss();
    cardNameInput.current.blur();
    saveFormData({ name: data.name || '' });
    handleNextStep(data);
  };

  const onFieldNameChange = text => {
    saveFormData({ name: text });
  };

  const onError = Keyboard.dismiss;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[AppStyle.menuPaddingBottom, AppStyle.pad30]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.activeCategoryItem, AppStyle.marginBottom10]}>
          <TextField style={styles.activeCategoryText}>{formData.type?.value}</TextField>
        </View>
        <Question content={t(`${i18nScope}.addExpense.questionNameCard`)} />
        <View collapsable={false} style={AppStyle.padBottom30}>
          <Controller
            name="name"
            control={control}
            render={({ onChange, onBlur, value }) => (
              <InputField
                ref={cardNameInput}
                placeholder={t(`${i18nScope}.addExpense.nameCardPlaceholder`)}
                value={value}
                onBlur={onBlur}
                onChangeText={text => {
                  onFieldNameChange(text);
                  onChange(text);
                }}
                onSubmitEditing={handleSubmit(onSubmit, onError)}
                error={errors.name?.message}
              />
            )}
          />
        </View>
        <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
          <ButtonField
            type="secondary"
            text={t('global.cancel')}
            style={styles.buttonField}
            onPress={onCancel}
          />
          <ButtonField
            text={t('global.next')}
            style={styles.buttonField}
            onPress={handleSubmit(onSubmit, onError)}
            type={formData?.name?.length < 1 ? 'disabled' : 'primary'}
          />
        </View>
      </ScrollView>
    </View>
  );
}
