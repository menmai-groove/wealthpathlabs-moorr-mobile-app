import { yupResolver } from '@hookform/resolvers/yup';
import ButtonField from 'components/basics/ButtonField';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { SchemaLib } from 'libs';
import { isEmpty } from 'lodash';
import React, { useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { withTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import { compose } from 'redux';
import { AppStyle } from 'theme';

function FormNumberOfItem(props) {
  const { t, onCancel, onSubmit: changeStep, defaultValue, i18nScope } = props;

  const numberOfItemInput = useRef(null);

  const { handleSubmit, control, errors, watch } = useForm({
    defaultValues: { numberOfItem: defaultValue ?? '' },
    resolver: yupResolver(SchemaLib.onBoardingInterviewSchema.numberOfItem),
    shouldFocusError: false,
  });

  const numberOfItem = watch('numberOfItem');

  const isSkip = useMemo(() => {
    return isEmpty(numberOfItem?.trim());
  }, [numberOfItem]);

  const onSubmit = data => {
    Keyboard.dismiss();
    numberOfItemInput.current.blur();
    changeStep(isSkip ? '0' : data.numberOfItem);
  };

  const onError = () => {
    Keyboard.dismiss();
  };

  return (
    <View>
      <TextField type="heading-2" style={[AppStyle.textCenter]}>
        {t(`${i18nScope}.title1`)}
      </TextField>
      <View style={AppStyle.marginTop30} collapsable={false}>
        <Controller
          name="numberOfItem"
          control={control}
          render={({ onChange, onBlur, value }) => (
            <InputField
              ref={numberOfItemInput}
              returnKeyType={'done'}
              label={t(`${i18nScope}.amount`)}
              placeholder={t(`${i18nScope}.amountPlaceholder`)}
              keyboardType="number-pad"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={handleSubmit(onSubmit, onError)}
              error={errors.numberOfItem?.message}
            />
          )}
        />
      </View>
      <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
        <ButtonField
          type="secondary"
          text={t('global.cancel')}
          style={AppStyle.marginTop20}
          onPress={onCancel}
        />
        <ButtonField
          text={isSkip ? t('global.skip') : t('global.next')}
          style={AppStyle.marginTop20}
          onPress={handleSubmit(onSubmit, onError)}
        />
      </View>
    </View>
  );
}

export default compose(withTranslation())(FormNumberOfItem);
