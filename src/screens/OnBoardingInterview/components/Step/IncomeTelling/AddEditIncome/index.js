import { yupResolver } from '@hookform/resolvers/yup';
import ButtonField from 'components/basics/ButtonField';
import Condition from 'components/basics/Condition';
import DropDownForForm from 'components/basics/DropDownForForm';
import InputField from 'components/basics/InputField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants } from 'constant';
import { SchemaLib } from 'libs';
import { first, isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { withTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import OnboardingFooterControl from 'screens/OnBoardingInterview/components/OnboardingFooterControl';
import Question from 'screens/OnBoardingInterview/components/Question';
import {
  selectDataIncomeType,
  selectOwnershipStructure,
  selectOwnersWithoutJoint,
} from 'store/Auth/selector';
import { selectAskingNameData } from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'screens.onBoardingInterview.incomeTelling.addEditIncome';

function AddEditIncome(props) {
  const { t, onCancel, onSubmit: submitData, data: income, onRemove } = props;
  const styles = useThemedStyle(themedStyles);

  const [isDelete, setIsDelete] = useState(false);
  const [showOwnerStructure, setShowOwnerStructure] = useState(
    income?.incomeType?.value === AppConstants.IncomeType.Business,
  );

  const scrollRef = useRef();
  const scrollTimeout = useRef();
  const annualIncomeInput = useRef(null);
  const dataFormErrors = useRef({});
  const incomeTypes = useSelector(selectDataIncomeType);
  const owners = useSelector(selectOwnersWithoutJoint);
  const askingName = useSelector(selectAskingNameData);
  const ownershipStructures = useSelector(selectOwnershipStructure);

  const listOwner = useMemo(() => {
    const temp = [...owners];
    if (temp.length > 0) {
      temp[0].display = askingName?.name;
      temp[0].label = askingName?.name;
    }
    return temp;
  }, [askingName.name, owners]);

  const defaultValues = useMemo(
    () => ({
      incomeType: {},
      ownership: {},
      annualIncome: '',
      ownershipStructure: null,
    }),
    [],
  );
  const { handleSubmit, control, errors, setValue, getValues } = useForm({
    defaultValues,
    resolver: yupResolver(SchemaLib.addEditIncome),
    shouldFocusError: false,
  });
  useEffect(() => {
    if (income) {
      setValue('incomeType', income.incomeType || {});
      setValue('ownership', income.ownership || {});
      setValue('annualIncome', income.annualIncome || '');
      if (income.incomeType?.value === AppConstants.IncomeType.Business) {
        setValue('ownershipStructure', income.ownershipStructure || null);
      }
    }
  }, [income, setValue, isDelete]);

  useEffect(() => {
    if (showOwnerStructure && isEmpty(getValues('ownershipStructure'))) {
      setValue('ownershipStructure', first(ownershipStructures));
    }
  }, [getValues, ownershipStructures, setValue, showOwnerStructure]);

  const updateDataFormErrors = (key, data) => {
    dataFormErrors.current[key] = {
      ...dataFormErrors.current[key],
      ...data,
    };
  };

  const onSubmitData = useCallback(
    data => {
      Keyboard.dismiss();
      annualIncomeInput.current.blur();
      if (income?.id) {
        data = { ...data, id: income?.id };
      }
      submitData(data);
    },
    [income, submitData],
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

  const removeIncome = () => {
    onRemove(income);
  };

  return (
    <View style={styles.container}>
      <Condition display={!isDelete}>
        <KeyboardAwareScrollView
          ref={scrollRef}
          bounces={false}
          showsVerticalScrollIndicator={false}>
          <TextField type="heading-2" style={AppStyle.textCenter}>
            {t(`${i18nScope}.titleAdd`)}
          </TextField>
          <Question
            emotion="blink"
            content={t('forms.income.content')}
            style={[AppStyle.marginTop20, AppStyle.marginBottom5]}
          />
          <View style={styles.group} collapsable={false}>
            <View
              style={[AppStyle.marginTop5]}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors('incomeType', {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors('incomeType', {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={'incomeType'}
                render={({ onChange, value, ref: componentRef }) => (
                  <View style={AppStyle.width100}>
                    <DropDownForForm
                      ref={componentRef}
                      value={value}
                      options={incomeTypes}
                      label={t('forms.income.incomeType')}
                      // placeholder={t('forms.income.incomeTypePlaceholder')}
                      onSelect={index => {
                        onChange(incomeTypes[index]);
                        if (incomeTypes[index]?.value === AppConstants.IncomeType.Business) {
                          setShowOwnerStructure(true);
                        } else {
                          setShowOwnerStructure(false);
                        }
                      }}
                      required={true}
                      error={errors.incomeType?.message}
                    />
                  </View>
                )}
              />
            </View>
            <Condition display={showOwnerStructure}>
              <View
                style={[AppStyle.marginTop15]}
                onLayout={({ nativeEvent }) => {
                  updateDataFormErrors('ownershipStructure', {
                    offsetY: nativeEvent.layout.y,
                  });
                }}
                ref={element => {
                  updateDataFormErrors('ownershipStructure', {
                    componentRef: element,
                  });
                }}>
                <Controller
                  control={control}
                  name={'ownershipStructure'}
                  render={({ onChange, value, ref: componentRef }) => (
                    <View style={AppStyle.width100}>
                      <DropDownForForm
                        ref={componentRef}
                        value={value}
                        options={ownershipStructures}
                        label={t('forms.income.ownershipStructure')}
                        // placeholder={t('forms.income.ownershipStructurePlaceholder')}
                        onSelect={index => {
                          onChange(ownershipStructures[index]);
                        }}
                        required={true}
                        error={errors.ownershipStructure?.message}
                      />
                    </View>
                  )}
                />
              </View>
            </Condition>
            <View
              style={[AppStyle.marginTop15]}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors('ownership', {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors('ownership', {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={'ownership'}
                render={({ onChange, value, ref: componentRef }) => (
                  <View style={AppStyle.width100}>
                    <DropDownForForm
                      ref={componentRef}
                      value={value}
                      options={listOwner}
                      label={t('forms.income.ownership')}
                      // placeholder={t('forms.income.ownershipPlaceholder')}
                      onSelect={index => {
                        onChange(listOwner[index]);
                      }}
                      required={true}
                      error={errors.ownership?.message}
                    />
                  </View>
                )}
              />
            </View>
            <View
              collapsable={false}
              style={[AppStyle.marginTop15]}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors('annualIncome', {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors('annualIncome', {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={'annualIncome'}
                render={({ onChange, onBlur, value }) => (
                  <InputField
                    isNumericInput
                    isCurrency
                    ref={annualIncomeInput}
                    value={value}
                    label={t('forms.income.annualIncome')}
                    placeholder={t('forms.income.annualIncomePlaceholder')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    required={true}
                    error={errors.annualIncome?.message}
                    LeftComponent={p => (
                      <TextField {...p} style={[styles.inputIcon]}>
                        {'$'}
                      </TextField>
                    )}
                  />
                )}
              />
            </View>
            {income !== null && (
              <TouchableField style={styles.iconDelete} onPress={() => setIsDelete(true)}>
                <IconAntDesign name="close" size={20} />
              </TouchableField>
            )}
          </View>
          <OnboardingFooterControl
            onCancel={onCancel}
            onSubmit={handleSubmit(onSubmitData, onErrorData)}
            textButtonNext={t('global.save')}
          />
        </KeyboardAwareScrollView>
      </Condition>

      <Condition display={isDelete}>
        <View style={AppStyle.padY10}>
          <TextField type="heading-2" style={AppStyle.textCenter}>
            {t(`${i18nScope}.titleDelete`)}
          </TextField>
          <TextField style={[AppStyle.textCenter, AppStyle.marginTop20, AppStyle.marginBottom30]}>
            {t(`${i18nScope}.contentDelete`)}
          </TextField>
          <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
            <ButtonField type="secondary" text={t('global.no')} onPress={onCancel} />
            <ButtonField text={t('global.yes')} onPress={removeIncome} />
          </View>
        </View>
      </Condition>
    </View>
  );
}

export default compose(withTranslation())(AddEditIncome);
