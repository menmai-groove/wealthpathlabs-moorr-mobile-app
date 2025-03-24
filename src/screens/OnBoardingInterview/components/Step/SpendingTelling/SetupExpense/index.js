import { yupResolver } from '@hookform/resolvers/yup';
import DropDownForForm from 'components/basics/DropDownForForm';
import InputField from 'components/basics/InputField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import { SchemaLib } from 'libs';
import { formatCurrency } from 'libs/util';
import { findIndex, isEmpty, isNil, toNumber } from 'lodash';
import { useThemedStyle } from 'providers';
import { default as React, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { withTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import OnboardingFooterControl from 'screens/OnBoardingInterview/components/OnboardingFooterControl';
import Question from 'screens/OnBoardingInterview/components/Question';
import { selectFrequency } from 'store/Auth/selector';
import { selectSpending } from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'screens.onBoardingInterview.spendingTelling.setupExpense';

function SetupExpense(props) {
  const { t, expenseData, onCancel, onSubmit: submitData } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const scrollRef = useRef();
  const scrollTimeout = useRef();
  const dataFormErrors = useRef({});
  const essentialInput = useRef(null);
  const discretionaryInput = useRef(null);
  const [expense, setExpense] = useState(expenseData);

  const frequencies = useSelector(selectFrequency);
  const listSpending = useSelector(selectSpending);

  const defaultValues = useMemo(() => {
    const defaultValue = {
      essential: '',
      discretionary: '',
      frequency: null,
    };
    if (!isEmpty(frequencies) && frequencies?.length > 0) {
      const freq = frequencies?.find(f => f.value === 'Monthly');
      if (freq !== null) {
        defaultValue.frequency = freq;
      } else {
        defaultValue.frequency = frequencies[0];
      }
    }
    return defaultValue;
  }, [frequencies]);
  const { handleSubmit, control, errors, watch, setValue } = useForm({
    defaultValues,
    resolver: yupResolver(SchemaLib.setupExpense),
    shouldFocusError: false,
  });

  const essentialValue = watch('essential', 0);
  const discretionaryValue = watch('discretionary', 0);

  useEffect(() => {
    setValue('essential', expense?.essentialAmount || '');
    setValue('discretionary', expense?.discretionaryAmount || '');
    if (expense?.frequency) {
      let freq = frequencies.find(x => x.value === expense?.frequency);
      if (freq) {
        setValue('frequency', freq);
      }
    }
  }, [expense, frequencies, setValue]);

  const onSubmitData = useCallback(
    data => {
      Keyboard.dismiss();
      essentialInput.current.blur();
      discretionaryInput.current.blur();
      let totalAmount = toNumber(data.essential) + toNumber(data.discretionary);
      let newData = {
        ...expense,
        totalAmount: totalAmount,
        discretionaryAmount: data.discretionary,
        essentialAmount: data.essential,
        frequency: data.frequency?.value,
      };
      submitData(newData);
    },
    [expense, submitData],
  );

  const scrollToElement = useCallback(
    (element, timeout = 250) => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        element && scrollRef?.current?.scrollIntoView(element);
      }, timeout);
    },
    [scrollRef],
  );

  const onErrorForm = useCallback(
    (formErrors, dataFormErrorsCurrent, firstKey) => {
      if (firstKey) {
        scrollToElement(dataFormErrorsCurrent[firstKey]?.componentRef);
      }
    },
    [scrollToElement],
  );

  const onErrorData = useCallback(
    formError => {
      Keyboard.dismiss();
      let firstKey;
      let minOffset;
      const fieldIds = SchemaLib.getFormErrorFieldIds(formError);
      for (let i in fieldIds) {
        const key = fieldIds[i];
        if (!firstKey || dataFormErrors.current[key]?.offsetY < minOffset) {
          minOffset = dataFormErrors.current[key]?.offsetY;
          firstKey = key;
        }
      }
      typeof onErrorForm === 'function' && onErrorForm(formError, dataFormErrors.current, firstKey);
    },
    [onErrorForm],
  );

  const updateDataFormErrors = (key, data) => {
    dataFormErrors.current[key] = {
      ...dataFormErrors.current[key],
      ...data,
    };
  };

  const isSkip = useMemo(() => {
    return isEmpty(essentialValue.trim()) && isEmpty(discretionaryValue.trim());
  }, [essentialValue, discretionaryValue]);

  const handleNext = useCallback(() => {
    handleSubmit(onSubmitData, onErrorData)().finally(() => {
      let index = findIndex(listSpending, item => item.category === expense.category);
      if (listSpending.length > index + 1 && isNil(listSpending[index + 1].totalAmount)) {
        setExpense(listSpending[index + 1]);
      } else {
        let nextExpense = listSpending.find(x => isNil(x.totalAmount));
        if (nextExpense) {
          setExpense(nextExpense);
        } else {
          onCancel();
        }
      }
    });
  }, [handleSubmit, onSubmitData, onErrorData, expense, listSpending, onCancel]);

  const handleClose = useCallback(() => {
    if (isSkip) {
      onCancel();
    } else {
      handleSubmit(onSubmitData, onErrorData)().finally(() => {
        onCancel();
      });
    }
  }, [handleSubmit, onErrorData, onSubmitData, onCancel, isSkip]);

  return (
    <KeyboardAwareScrollView showsVerticalScrollIndicator={false} ref={scrollRef}>
      <TextField type="heading-2" style={AppStyle.textCenter}>
        {t(`${i18nScope}.title`)}
      </TextField>
      <Question emotion="confused" style={AppStyle.marginTop20}>
        <TextField style={styles.textContent}>
          {t(`${i18nScope}.content1`) + '\n'}
          {t(`${i18nScope}.content2`) + '\n'}
          {t(`${i18nScope}.content3`)}
        </TextField>
      </Question>
      <View style={styles.card}>
        <TextField
          type="paragraph-1"
          style={[AppStyle.flex1, AppStyle.marginRight20, styles.textContent]}>
          {expense?.category}
        </TextField>
        <TextField type="heading-2" style={styles.totalCost}>
          {formatCurrency(toNumber(essentialValue) + toNumber(discretionaryValue))}
        </TextField>
      </View>

      <View
        collapsable={false}
        style={[AppStyle.marginTop15]}
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors('essential', {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors('essential', {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          name={'essential'}
          render={({ onChange, onBlur, value }) => (
            <InputField
              ref={essentialInput}
              value={value}
              isNumericInput
              isCurrency
              label={t('forms.spending-telling.essential')}
              placeholder={t('forms.spending-telling.essentialPlaceholder')}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.essential?.message}
              LeftComponent={p => (
                <TextField {...p} style={[styles.inputIcon]}>
                  {'$'}
                </TextField>
              )}
            />
          )}
        />
      </View>
      <View
        collapsable={false}
        style={[AppStyle.marginTop15]}
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors('discretionary', {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors('discretionary', {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          name={'discretionary'}
          render={({ onChange, onBlur, value }) => (
            <InputField
              ref={discretionaryInput}
              value={value}
              isNumericInput
              isCurrency
              label={t('forms.spending-telling.discretionary')}
              placeholder={t('forms.spending-telling.discretionaryPlaceholder')}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.discretionary?.message}
              LeftComponent={p => (
                <TextField {...p} style={[styles.inputIcon]}>
                  {'$'}
                </TextField>
              )}
            />
          )}
        />
      </View>
      <View
        style={[AppStyle.marginTop15]}
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors('frequency', {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors('frequency', {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          name={'frequency'}
          render={({ onChange, value, ref: componentRef }) => (
            <View style={AppStyle.width100}>
              <DropDownForForm
                ref={componentRef}
                value={value}
                options={frequencies}
                label={t('forms.spending-telling.frequency')}
                onSelect={index => {
                  onChange(frequencies[index]);
                }}
                required={true}
                error={errors.frequency?.message}
              />
            </View>
          )}
        />
      </View>
      <OnboardingFooterControl
        onCancel={handleClose}
        onSubmit={handleNext}
        textButtonNext={isSkip ? t('global.skip') : t('global.next')}
        textButtonCancel={t('global.close')}
      />
    </KeyboardAwareScrollView>
  );
}

export default compose(withTranslation())(SetupExpense);
