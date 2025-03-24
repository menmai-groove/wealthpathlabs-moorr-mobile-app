import { yupResolver } from '@hookform/resolvers/yup';
import HistoryIcon from 'assets/svgs/historyIcon';
import CalendarIcon from 'assets/svgs/profile/calendar';
import Accordion from 'components/basics/Accordion';
import Autocomplete from 'components/basics/Autocomplete';
import ButtonField from 'components/basics/ButtonField';
import CalendarModal from 'components/basics/CalendarModal';
import CheckBox from 'components/basics/CheckBox';
import DropDownForForm from 'components/basics/DropDownForForm';
import { CALENDAR_TYPES } from 'components/basics/FullCalendar';
import IncreaseNumber from 'components/basics/IncreaseNumber';
import InputAddressAutocomplete from 'components/basics/InputAddressAutocomplete';
import InputField from 'components/basics/InputField';
import InputPasswordField from 'components/basics/InputPasswordField';
import InterestRate from 'components/basics/InterestRate';
import LandLotSize from 'components/basics/LandLotSize';
import RadioButtonGroup from 'components/basics/RadioButtonGroup';
import Switch from 'components/basics/Switch';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants, AppScreenID } from 'constant';
import { GlobalLib, NavigationServiceLib, SchemaLib, UtilLib } from 'libs';
import {
  formatDateTime,
  formatNumber,
  getFieldFromFormJSON,
  getFieldFromLayout,
  mergeArrayObjectIntoObject,
} from 'libs/util';
import {
  cloneDeep,
  debounce,
  get,
  includes,
  isEmpty,
  isNaN,
  isNil,
  isNumber,
  isObject,
  sumBy,
  toNumber,
} from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, Keyboard, View } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import { selectFlags } from 'store/Auth/selector';
import { selectAppPreference } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

function DynamicForm(props, ref) {
  const {
    data,
    customValidations,
    onSubmit,
    onError,
    style,
    clType,
    conditionLogics,
    onRadioValueChange,
    onDropdownValueChange,
    renderCustomComponent,
    isCustomComponent,
    onFirstTimeDataChange,
    // updatedDates,
    // onUpdateDates,
    disabled,
    handleBeforeNavigateHistoricalLog,
  } = props;
  const { t } = useTranslation();
  const dataFormErrors = useRef({});
  const calendarModal = useRef(null);
  const {
    googlePlaceApiKey,
    historicalCapitalGrowthMaxValue,
    // historicalCapitalGrowthMinValue,
    historicalCapitalGrowthMaxDisplayValue,
  } = useSelector(selectAppPreference);
  const flags = useSelector(selectFlags);
  const [layout, setLayout] = useState(data);
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle(
    {
      ...themedStyles,
      container: {
        ...themedStyles.container,
        ...convertedStyle,
      },
    },
    'components.dynamicForm',
  );

  const getGroupCollapse = useMemo(() => {
    let groupCollapse = {};
    layout.layout?.map(group => {
      if (group.component === 'collapse') {
        groupCollapse[group.id] = group.collapse;
      }
    });
    return groupCollapse;
  }, [layout]);

  const [groupCollapse, setGroupCollapse] = useState(getGroupCollapse);

  const defaultValues = useMemo(() => {
    if (!isEmpty(layout)) {
      let defaultValue = {};
      layout.layout.map(group => {
        !isEmpty(group) &&
          group.fields?.map(field => {
            defaultValue[field.id] = field.value;
            if (
              field.component === 'dropdown' &&
              (field.id.includes('borrower') || field.id.includes('ownership')) &&
              !isEmpty(field.value)
            ) {
              defaultValue[field.id] = {
                ...field.value,
                value:
                  field.value?.ownershipType === AppConstants.ownershipType.Other
                    ? AppConstants.ownershipType.Other
                    : field.value?.owners?.map(v => v.owner)?.join('-'),
              };
            }
            if (field.fields) {
              field.fields.map(_field => {
                defaultValue[_field.id] = _field.value;
                if (
                  field.component === 'dropdown' &&
                  (field.id.includes('borrower') || field.id.includes('ownership')) &&
                  !isEmpty(_field.value)
                ) {
                  defaultValue[_field.id] = {
                    ..._field.value,
                    value:
                      _field.value?.ownershipType === AppConstants.ownershipType.Other
                        ? AppConstants.ownershipType.Other
                        : _field.value?.owners?.map(v => v.owner)?.join('-'),
                  };
                }
              });
            }
          });
      });
      return defaultValue;
    }
  }, [layout]);

  const methods = useForm({
    defaultValues,
    resolver: yupResolver(SchemaLib.getSchemaDynamicForm(layout, customValidations)),
    shouldFocusError: false,
  });
  const {
    handleSubmit,
    control,
    errors,
    reset,
    getValues,
    setValue,
    formState,
    trigger,
    setError,
    clearErrors,
  } = methods;
  const { isDirty } = formState;

  useEffect(() => {
    // Call only the first time user input data to form
    if (isDirty && onFirstTimeDataChange) {
      if (typeof onFirstTimeDataChange === 'function') {
        onFirstTimeDataChange();
      }
    }
  }, [isDirty, onFirstTimeDataChange]);

  const condition = useMemo(() => {
    if (conditionLogics != null) {
      return conditionLogics;
    }
    switch (clType) {
      case 'asset-property':
        return require('assets/forms/conditionLogics/cl-asset-property.json');

      default:
        return {};
    }
  }, [clType, conditionLogics]);

  const updateDataFormErrors = useCallback((key, formData) => {
    dataFormErrors.current[key] = {
      ...dataFormErrors.current[key],
      ...formData,
    };
  }, []);

  const submit = useCallback(
    callback => {
      const loading = GlobalLib.Loading.get();
      loading.show();
      handleSubmit(
        formData => {
          loading.hide();
          Keyboard.dismiss();
          layout.layout.forEach(e => {
            e.fields?.forEach(f => {
              if (!f.visible && !f.shouldVisible) {
                formData[f.id] = null;
              }
            });
          });
          typeof onSubmit === 'function' && onSubmit(formData, callback);
        },
        formError => {
          loading.hide();
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
          typeof onError === 'function' && onError(formError, dataFormErrors.current, firstKey);
        },
      )();
    },
    [handleSubmit, layout, onError, onSubmit],
  );

  useImperativeHandle(ref, () => ({
    getFormValue: fieldName => getValues(fieldName),
    setFormValue: (fieldName, value, options = { shouldValidate: true }) => {
      setValue(fieldName, value, options);
      if (typeof onFirstTimeDataChange === 'function') {
        onFirstTimeDataChange();
      }
    },
    reset: () => reset(defaultValues),
    errors: () => errors,
    setErrorMessage: (field, message) => {
      setError(field, { message });
    },
    submit,
    navigationHistoricalLog: field => handleNavigationHistoricalLog(field),
  }));

  const checkConditionLogic = useCallback(
    (fieldCheck = {}) => {
      // Condition for As AT Component
      if (fieldCheck.groupId) {
        setValue(fieldCheck.groupId, UtilLib.dateUTCAsAt(Date.now()));
      }

      function checkGroupVisibleLogic(list, newLayout, operator) {
        // Move code checkConditionLogic to this function and add recursive
        let set = new Set();
        list.forEach(c => {
          if ('operator' in c) {
            const returnSet = checkGroupVisibleLogic(c.condition, newLayout, c.operator);
            set.add(returnSet);
          } else {
            let field = getFieldFromFormJSON(newLayout.layout, c.field);
            if (field) {
              let value = getValues(field.id);
              if (c.type === '=') {
                let valueCheck = !isEmpty(c.key) ? (value ? value[c.key] : value) : value;
                set.add(c.value === valueCheck);
              }
              if (c.type === 'visible') {
                set.add(c.value === field.visible);
              }
              if (c.type === 'include') {
                let check = !isEmpty(c.key)
                  ? includes(value ? value[c.key] : value, c.value)
                  : includes(value, c.value);
                set.add(check);
              }
            }
          }
        });
        // operator = AND => all field is valid || no field invalid
        // operator = OR => the least one field is valid
        let valid = operator === 'AND' ? !set.has(false) && set.size > 0 : set.has(true);
        return valid;
      }

      let logics = cloneDeep(condition?.logics || []);
      let renderNewLayout = false;
      if (logics.length > 0) {
        logics.forEach(l => {
          if (
            includes(l.fields, fieldCheck.id) ||
            l.condition?.condition?.some(cond => cond.field === fieldCheck.id)
          ) {
            renderNewLayout = true;
          }
        });
        if (!renderNewLayout) {
          return;
        }

        let newLayout = cloneDeep(layout);
        logics.forEach(logic => {
          switch (logic.type) {
            case 'visible':
              let valid = checkGroupVisibleLogic(
                logic.condition?.condition,
                newLayout,
                logic.condition?.operator,
              );
              let __field = getFieldFromLayout(newLayout.layout, logic.field);
              if (__field != null) {
                __field.visible = valid ? logic.value : !logic.value;
              }
              break;

            case 'totalPercent':
              if (
                logic.fields.length > 0 &&
                (includes(logic.fields, fieldCheck.id) ||
                  fieldCheck.id.includes('ownership') ||
                  fieldCheck.id.includes('borrower'))
              ) {
                if (fieldCheck.component === 'dropdown') {
                  let formId = '';
                  if (fieldCheck.id.includes('-')) {
                    const arr = fieldCheck.id.split('-');
                    formId = arr[0];
                  }
                  setTimeout(() => {
                    logic.fields.forEach(field => {
                      if (formId === '' || (formId && field.includes(formId))) {
                        setValue(field, '');
                      }
                    });
                  }, 200);
                }
                let fieldCheckValue = getValues(fieldCheck.id);
                let valueSet =
                  logic.value * 100 -
                  (isObject(fieldCheckValue) ? 0 : toNumber(fieldCheckValue)) * 100;

                logic.fields = logic.fields.filter(_field => {
                  let fieldCond = getFieldFromLayout(newLayout.layout, _field);
                  return fieldCond?.visible;
                });

                const isLast =
                  logic.fields.findIndex(x => x === fieldCheck.id) === logic.fields.length - 1;
                logic.fields.forEach((id, idx) => {
                  if (id !== fieldCheck.id) {
                    if (isLast) {
                      if (idx !== 0) {
                        valueSet = valueSet - toNumber(getValues(id) ?? '0') * 100;
                      }
                    } else {
                      if (idx !== logic.fields.length - 1) {
                        valueSet = valueSet - toNumber(getValues(id) ?? '0') * 100;
                      }
                    }
                  }
                });
                logic.fields.forEach((id, idx) => {
                  let formId = '';
                  if (fieldCheck.id.includes('-')) {
                    const arr = fieldCheck.id.split('-');
                    formId = arr[0];
                  }
                  if (formId === '' || (formId && id.includes(formId))) {
                    if (!isNaN(valueSet)) {
                      if (isLast) {
                        if (idx === 0) {
                          setValue(id, (valueSet / 100).toString());
                        }
                      } else {
                        if (idx === logic.fields.length - 1) {
                          setValue(id, (valueSet / 100).toString());
                        }
                      }
                    }
                  }
                });
                logic.fields.forEach(x => trigger(x));

                const totalValue = logic.fields.reduce((prev, field) => {
                  return prev + toNumber(getValues(field) || '0');
                }, 0);
                logic.fields.forEach(field => {
                  if (totalValue !== logic.value) {
                    setError(field, {
                      message: t('components.dynamicForm.totalPercentValidate'),
                    });
                  } else {
                    clearErrors(field);
                  }
                });
              }
              break;

            case 'setValue':
              switch (logic.format) {
                case 'datetime':
                  if (logic.condition?.operator === 'ADD') {
                    let conditions = get(logic, ['condition', 'condition']);
                    let inputField = conditions.find(c => c.type === 'input');
                    if (inputField) {
                      let value = getValues(inputField.field);
                      if (value) {
                        conditions.forEach(c => {
                          if (c.type === 'amount') {
                            if (c.component === 'dropdown') {
                              let amountValue = getValues(c.field)?.value;
                              value = moment(value).add(Number(amountValue), c.unit);
                            }
                            if (c.component === 'input') {
                              let amountValue = getValues(c.field);
                              value = moment(value).add(Number(amountValue), c.unit);
                            }
                          }
                        });
                        setValue(logic.field, value);
                      }
                    }
                  }
                  break;
                case 'number':
                  if (logic.condition?.operator === 'SUM') {
                    let conditions = get(logic, ['condition', 'condition']) || [];
                    if (conditions) {
                      let sum = 0;
                      conditions.forEach(c => {
                        let currentValue = Number(getValues(c.field) ?? 0);
                        if (currentValue && c.type === 'negative') {
                          currentValue = Number(currentValue) * -1;
                        }
                        sum += currentValue;
                      });
                      setValue(logic.field, sum?.toString());
                    }
                  }
                  if (logic.condition?.operator === 'SUMBY') {
                    let conditions = get(logic, ['condition', 'condition']) || [];
                    if (conditions) {
                      let sum = 0;
                      conditions.forEach(c => {
                        let currentValue = getValues(c.field) ?? [];
                        if (currentValue) {
                          sum = sumBy(currentValue, c.key);
                        }
                      });
                      setValue(logic.field, sum?.toString());
                    }
                  }
                  break;
                case 'currentYield':
                  let yieldConditions = get(logic, ['condition', 'condition']) || [];
                  const yieldValue = Number(
                    getValues(yieldConditions.find(item => item.id === 'currentValue').field) ?? 0,
                  );

                  let currentYieldField = getFieldFromLayout(newLayout.layout, logic.field);
                  if (currentYieldField != null) {
                    if (yieldValue === 0) {
                      setValue(logic.field, 0);
                      currentYieldField.displayValue = t('global.invalid');
                    } else {
                      const incomeBreakdownCards = getValues('incomeBreakdownCard');
                      const annualIncome = (incomeBreakdownCards || [])
                        .filter(x => !x.isArchived)
                        .reduce((total, current) => {
                          return (
                            total +
                            current.amount *
                              (AppConstants.frequencyMultiplier.find(
                                x => x.value === current.frequency,
                              )?.multiplier ?? 0)
                          );
                        }, 0);

                      const currentValue = annualIncome / yieldValue;
                      setValue(logic.field, currentValue);
                      currentYieldField.displayValue = formatNumber(
                        currentValue * 100,
                        '0,0[.][00]',
                      );
                    }
                    setValue(logic.field + 'AsAt', Date.now());
                  }
                  break;
                case 'historicalCapital':
                  let conditions = get(logic, ['condition', 'condition']) || [];
                  const currentValue = Number(
                    getValues(conditions.find(item => item.id === 'currentValue').field) ?? 0,
                  );
                  const purchasePrice = Number(
                    getValues(conditions.find(item => item.id === 'purchasePrice').field) ?? 0,
                  );
                  const datePurchased = getValues(
                    conditions.find(item => item.id === 'datePurchased').field,
                  );

                  const ratio = purchasePrice === 0 ? 0 : currentValue / purchasePrice;
                  const currentDate = new Date();
                  currentDate.setHours(0, 0, 0, 0);
                  const purchasedDate = new Date(datePurchased);

                  const yearfrac =
                    Number(
                      !datePurchased
                        ? 0
                        : (currentDate.getTime() - purchasedDate.getTime()) /
                            (60 * 60 * 24 * 365 * 1000),
                    ) ?? 0;
                  const yearDifference = Math.max(0, yearfrac);

                  let _historicalCapitalField = getFieldFromLayout(newLayout.layout, logic.field);
                  if (_historicalCapitalField != null) {
                    if (purchasePrice === 0 || yearDifference === 0) {
                      setValue(logic.field, 0);
                      _historicalCapitalField.displayValue = t('global.invalid');
                    } else {
                      let hisCapitalGrowth = ratio ** (1 / yearDifference) - 1;
                      if (isNumber(historicalCapitalGrowthMaxValue)) {
                        hisCapitalGrowth = Math.min(
                          hisCapitalGrowth,
                          historicalCapitalGrowthMaxValue,
                        );
                      }
                      setValue(logic.field, hisCapitalGrowth);
                      const hisCapitalGrowthPA = hisCapitalGrowth * 100;
                      if (isNumber(historicalCapitalGrowthMaxDisplayValue)) {
                        _historicalCapitalField.displayValue =
                          hisCapitalGrowthPA > historicalCapitalGrowthMaxDisplayValue
                            ? t('global.invalid')
                            : formatNumber(hisCapitalGrowthPA, '0,0[.][00]');
                      } else {
                        _historicalCapitalField.displayValue = formatNumber(
                          hisCapitalGrowthPA,
                          '0,0[.][00]',
                        );
                      }
                    }
                    setValue(logic.field + 'AsAt', Date.now());
                  }

                  break;

                case 'annualIncome':
                  if (logic.condition) {
                    let _conditions = get(logic, ['condition', 'condition']) || [];
                    if (_conditions) {
                      let regularIncomeFrequenceMultiplier = 0,
                        adhocIncomeFrequenceMultiplier = 0;
                      let regularIncomeCond = _conditions.find(x => x.id === 'regularIncome');
                      let regularIncome = Number(getValues(regularIncomeCond?.field) ?? 0);
                      let regularIncomeFrequenceCond = _conditions.find(
                        x => x.id === 'regularIncomeFrequence',
                      );
                      let regularIncomeFrequence = getValues(regularIncomeFrequenceCond?.field);
                      if (!isNil(regularIncomeFrequence)) {
                        regularIncomeFrequenceMultiplier =
                          AppConstants.frequencyMultiplier.find(
                            x => x.value === regularIncomeFrequence.value,
                          )?.multiplier ?? 0;
                      }

                      let adhocIncomeCond = _conditions.find(x => x.id === 'adhocIncome');
                      let adhocIncome = Number(getValues(adhocIncomeCond?.field) ?? 0);
                      let adhocIncomeFrequenceCond = _conditions.find(
                        x => x.id === 'adhocIncomeFrequence',
                      );
                      let adhocIncomeFrequence = getValues(adhocIncomeFrequenceCond?.field);
                      if (!isNil(adhocIncomeFrequence)) {
                        adhocIncomeFrequenceMultiplier =
                          AppConstants.frequencyMultiplier.find(
                            x => x.value === adhocIncomeFrequence.value,
                          )?.multiplier ?? 0;
                      }

                      const annualIncome =
                        regularIncome * regularIncomeFrequenceMultiplier +
                        adhocIncome * adhocIncomeFrequenceMultiplier;
                      setValue(logic.field, annualIncome?.toString());
                    }
                  }

                  break;
                case 'self_employed':
                  if (logic.condition) {
                    let _conditions = get(logic, ['condition', 'condition']) || [];
                    if (_conditions) {
                      let amountCond = _conditions.find(x => x.id === 'amount');
                      let amount = Number(getValues(amountCond?.field) ?? 0);
                      const annualIncome = amount;
                      setValue(logic.field, annualIncome?.toString());
                    }
                  }

                  break;
                default:
                  break;
              }
              break;

            case 'exclude_option_value': // remove option key with correct condition
              // check condition
              let willExclude = checkGroupVisibleLogic(
                logic.condition?.condition,
                newLayout,
                logic.condition?.operator,
              );

              // get original data
              let originalOptions = [];
              let fieldExcludeOptions = getFieldFromLayout(data.layout, logic.field);
              if (fieldExcludeOptions != null) {
                originalOptions = fieldExcludeOptions.originalOptions;
              }
              if (willExclude) {
                // remove key
                let _field = getFieldFromLayout(newLayout.layout, logic.field);
                if (_field != null) {
                  const newOptions = cloneDeep(originalOptions);
                  _field.options = newOptions.filter(
                    item => !logic.value.includes(item[logic.key]),
                  );
                }
              } else {
                // restore key
                let _field = getFieldFromLayout(newLayout.layout, logic.field);
                if (_field != null) {
                  const newOptions = cloneDeep(originalOptions);
                  _field.options = newOptions;
                }
              }
              break;
            case 'group-visible': // used for hide/show group
              let valid1 = checkGroupVisibleLogic(
                logic.condition?.condition,
                newLayout,
                logic.condition?.operator,
              );

              if (valid1) {
                newLayout.layout.some(group => {
                  if (group.id === logic.field) {
                    group.isHide = !logic.value;
                    group.fields.map(field => {
                      field.visible = logic.value;
                      if (field.fields) {
                        field.fields.map(_f => {
                          _f.visible = logic.value;
                        });
                      }
                    });
                  }
                });
              } else {
                newLayout.layout.forEach(group => {
                  if (group.id === logic.field) {
                    group.isHide = logic.value;
                    group.fields.map(field => {
                      field.visible = !logic.value;
                      if (field.fields) {
                        field.fields.map(_f => {
                          _f.visible = !logic.value;
                        });
                      }
                    });
                  }
                });
              }
              break;
            default:
              break;
          }
        });
        if (renderNewLayout) {
          setLayout(newLayout);
        }
      }
    },
    [
      condition,
      setValue,
      getValues,
      layout,
      data,
      trigger,
      setError,
      t,
      clearErrors,
      historicalCapitalGrowthMaxValue,
      historicalCapitalGrowthMaxDisplayValue,
    ],
  );

  const getTotalAnual = useCallback(
    (fieldCheck = {}) => {
      if (flags.asAtMigrationIncome && data.layout && data.layout[0]?.id === 'self_employed') {
        return;
      }
      let totalAnnual = 0;

      switch (fieldCheck.id) {
        case 'amount':
        case 'averageOvertimeIncomePA':
        case 'averageCommissionPA':
        case 'averageBonusPA':
          const listAmounts = [
            getValues('amount'),
            getValues('averageOvertimeIncomePA'),
            getValues('averageCommissionPA'),
            getValues('averageBonusPA'),
          ];
          if (listAmounts.some(i => !UtilLib.checkEmptyButNotZero(i))) {
            totalAnnual = sumBy(listAmounts, i => toNumber(i));
          } else {
            totalAnnual = '';
          }
          setValue('totalAnnual', totalAnnual?.toString());
          break;
        case 'assessedTaxReturn':
          const salary = get(getValues('assessedTaxReturn'), [0, 'salary']);
          totalAnnual = !UtilLib.checkEmptyButNotZero(salary) ? toNumber(salary) : '';
          setValue('totalAnnual', totalAnnual?.toString());
          break;
        case 'amountGovt':
          const amountGovt = getValues('amountGovt');
          totalAnnual = !UtilLib.checkEmptyButNotZero(amountGovt) ? toNumber(amountGovt) : '';
          setValue('totalAnnual', totalAnnual?.toString());
          break;
        case 'annualDepreciationAmount': {
          const annualDepreciationAmount = getValues('annualDepreciationAmount') ?? '0';
          const plantAndEquipment = getValues('plantAndEquipment') ?? '0';
          const capitalWorks = getValues('capitalWorks') ?? '0';
          setValue('annualDepreciationAmount', annualDepreciationAmount?.toString() ?? '0');
          if (toNumber(plantAndEquipment ?? '0') !== 0 && toNumber(capitalWorks ?? '0') !== 0) {
            const value = toNumber(annualDepreciationAmount) - toNumber(plantAndEquipment);
            setValue('capitalWorks', isNaN(value) ? '0' : String(value), {
              shouldValidate: true,
            });
          }
          break;
        }
        case 'plantAndEquipment': {
          const plantAndEquipment = getValues('plantAndEquipment') ?? '0';
          const capitalWorks = getValues('capitalWorks') ?? '0';
          const value = toNumber(capitalWorks) + toNumber(plantAndEquipment);
          setValue('annualDepreciationAmount', isNaN(value) ? '0' : String(value), {
            shouldValidate: true,
          });
          break;
        }
        case 'capitalWorks': {
          const plantAndEquipment = getValues('plantAndEquipment') ?? '0';
          const capitalWorks = getValues('capitalWorks') ?? '0';
          const value = toNumber(capitalWorks) + toNumber(plantAndEquipment);
          setValue('annualDepreciationAmount', isNaN(value) ? '0' : String(value), {
            shouldValidate: true,
          });
          break;
        }
        default:
          break;
      }
    },
    [data, flags, getValues, setValue],
  );
  const getLeftComponentInput = useCallback(
    (p, field) => {
      switch (field.formatData) {
        case 'currency':
        case 'currencyWithNegative':
          return (
            <TextField {...p} style={[styles.inputIcon]}>
              {'$'}
            </TextField>
          );
        case 'percent':
          return (
            <TextField {...p} style={[styles.inputIcon]}>
              {'%'}
            </TextField>
          );
        default:
          return null;
      }
    },
    [styles],
  );
  const getRightComponentInput = useCallback(
    field => {
      switch (field.iconRight) {
        case 'employer':
          return <Image source={require('assets/images/user.png')} />;
        case 'percent':
          return <TextField style={[styles.inputIcon]}>{'%'}</TextField>;
        case 'sqm':
          return <TextField style={[styles.inputIcon]}>{'sqm'}</TextField>;
        case 'building':
          return <FontAwesome5 name="building" size={16} color={styles.rightComponentIcon.color} />;
        case 'phone':
          return <FontAwesome5 name="phone" size={16} color={styles.rightComponentIcon.color} />;
        default:
          return null;
      }
    },
    [styles],
  );
  const showDynamicFormModal = useCallback(
    (modalRef, field, onChange) => {
      GlobalLib.CustomModal.get().show({
        body: (
          <View>
            <DynamicForm
              ref={modalRef}
              data={field}
              onSubmit={dataModal => {
                onChange(dataModal);
                GlobalLib.CustomModal.get().hide();
              }}
            />
            <ButtonField
              style={styles.formBlock}
              text={t('global.continue')}
              onPress={() => modalRef.current.submit()}
            />
          </View>
        ),
        onRequestClose: () => GlobalLib.CustomModal.get().hide(),
      });
    },
    [styles, t],
  );

  const getErrorInfo = useCallback(
    key => {
      const errorMessage = get(errors, key?.split('.'));
      return errorMessage;
    },
    [errors],
  );

  const handleNavigationHistoricalLog = useCallback(
    async field => {
      const callback = () => {
        const params = {
          ...field,
        };
        NavigationServiceLib.navigate(AppScreenID.HistoricalLog, params);
      };
      if (typeof handleBeforeNavigateHistoricalLog === 'function') {
        const result = handleBeforeNavigateHistoricalLog(field);
        if (!result) {
          return;
        }
      }
      const isEdited = isDirty && onFirstTimeDataChange;
      if (!isEdited) {
        callback();
        return;
      }
      GlobalLib.ConfirmModal.get().show({
        title: t('components.dynamicForm.unsavedTitle'),
        content: t('components.dynamicForm.unsavedContent'),
        onConfirm: () => callback(),
        onCancel: () => submit(callback),
      });
    },
    [handleBeforeNavigateHistoricalLog, isDirty, onFirstTimeDataChange, submit, t],
  );

  const renderComponent = useCallback(
    (field, index, group = null) => {
      const isFirst = field?.isFirst;
      switch (field.component) {
        case 'input':
          const isNumericInput =
            field.dataType === 'number' ||
            field.formatData === 'percent' ||
            field.formatData === 'currency';
          const isCurrency = field.formatData === 'currency';
          return (
            <View
              style={[!isFirst && styles.formBlock]}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors(field.id, {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors(field.id, {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, onBlur, value, ref: componentRef }) => {
                  return (
                    <View>
                      <InputField
                        ref={componentRef}
                        value={
                          field.displayValue ||
                          (field.readonly && isNumericInput && isNaN(value)
                            ? t('global.invalid')
                            : value)
                        }
                        returnKeyType={field.returnKeyType || 'default'}
                        keyboardType={field.keyboardType}
                        label={t(field.label, field.labelDynamic || field.label)}
                        placeholder={t(field.placeholder, field.placeholder)}
                        onBlur={onBlur}
                        onChangeText={text => {
                          onChange(text);
                          checkConditionLogic(field);
                          getTotalAnual(field);
                        }}
                        multiline={field.multiline}
                        numberOfLines={field.numberOfLines}
                        required={field.required}
                        error={getErrorInfo(field.id)?.message}
                        LeftComponent={
                          field.formatData ? p => getLeftComponentInput(p, field) : null
                        }
                        RightComponent={
                          field.iconRight ? () => getRightComponentInput(field) : null
                        }
                        isNumericInput={isNumericInput}
                        maxLength={field.maxLength}
                        isCurrency={isCurrency}
                        isPercent={field.formatData === 'percent' || field.iconRight === 'percent'}
                        style={
                          field.asAt &&
                          field.collapse &&
                          !field.readonly && {
                            readonlyInputWrapper: { backgroundColor: '#FFFFFF' },
                          }
                        }
                        readonly={field.asAt && field.collapse ? true : field.readonly}
                        disabled={disabled || field.disabled}
                      />
                    </View>
                  );
                }}
              />
            </View>
          );
        case 'password':
          return (
            <View
              style={[styles.formBlock]}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors(field.id, {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors(field.id, {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, onBlur, value, ref: componentRef }) => (
                  <InputPasswordField
                    ref={componentRef}
                    value={value}
                    keyboardType={field.keyboardType}
                    label={t(field.label, field.label)}
                    placeholder={t(field.placeholder, field.placeholder)}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    required={field.required}
                    error={getErrorInfo(field.id)?.message}
                  />
                )}
              />
            </View>
          );
        case 'checkbox':
          return (
            <View
              style={[styles.formBlock]}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors(field.id, {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors(field.id, {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, value, ref: componentRef }) => (
                  <CheckBox
                    ref={componentRef}
                    value={value}
                    onChange={state => {
                      onChange(state);
                      checkConditionLogic(field);
                    }}
                    required={field.required}
                    label={t(field.label, field.label)}
                    error={getErrorInfo(field.id)?.message}
                  />
                )}
              />
            </View>
          );
        case 'address-autocomplete':
          return (
            <View
              style={[styles.formBlock]}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors(field.id, {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors(field.id, {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, onBlur, value, ref: componentRef }) => (
                  <InputAddressAutocomplete
                    apiKey={googlePlaceApiKey}
                    ref={componentRef}
                    value={value}
                    keyboardType={field.keyboardType}
                    label={t(field.label, field.label)}
                    placeholder={t(field.placeholder, field.placeholder)}
                    onBlur={onBlur}
                    required={field.required}
                    error={getErrorInfo(field.id)?.message}
                    onChangeText={_ => onChange(_)}
                    getDetail={detail => onChange(detail)}
                    defaultValue={field.value}
                    leftAddressIcon={field.leftAddressIcon}
                    listKey={`${field.id}-${index}`}
                    trim={field.trim}
                    disabled={disabled}
                  />
                )}
              />
            </View>
          );
        case 'dropdown':
          return (
            <View
              style={[!isFirst && styles.formBlock]}
              onLayout={({ nativeEvent }) => {
                if (field?.id !== AppConstants.idTaxDeductions) {
                  updateDataFormErrors(field.id, {
                    offsetY: nativeEvent.layout.y,
                  });
                }
              }}
              ref={element => {
                if (field?.id !== AppConstants.idTaxDeductions) {
                  updateDataFormErrors(field.id, {
                    componentRef: element,
                  });
                }
              }}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, value, ref: componentRef }) => (
                  <View style={AppStyle.width100}>
                    <DropDownForForm
                      ref={componentRef}
                      value={value}
                      options={field.options}
                      saveScrollPosition={!field.disableAutoScroll}
                      placeholder={
                        !isNil(field.placeholder)
                          ? t(field.placeholder, field.placeholder)
                          : undefined
                      }
                      emptyPlaceholder={
                        !isNil(field.emptyPlaceholder)
                          ? t(field.emptyPlaceholder, field.emptyPlaceholder)
                          : undefined
                      }
                      label={
                        typeof field.label === 'function'
                          ? field.label
                          : t(field.label, field.labelDynamic || field.label)
                      }
                      onSelect={selectValue => {
                        if (onDropdownValueChange) {
                          onDropdownValueChange(
                            field,
                            field.multiple ? selectValue : field.options[selectValue],
                            () => {
                              onChange(field.multiple ? selectValue : field.options[selectValue]);
                              checkConditionLogic(field);
                            },
                          );
                        }
                        if (typeof field.onChange === 'function') {
                          field.onChange(
                            field,
                            field.multiple ? selectValue : field.options[selectValue],
                          );
                        }

                        onChange(field.multiple ? selectValue : field.options[selectValue]);
                        checkConditionLogic(field);
                      }}
                      required={field.required}
                      error={getErrorInfo(field.id)?.message}
                      multipleSelect={field.multiple}
                      readonly={field.asAt && field.collapse ? true : field.readonly}
                      disabled={disabled || field.disabled}
                      shouldUpdateWidth={field.asAt}
                    />
                  </View>
                )}
              />
            </View>
          );
        case 'datepicker':
          return (
            <View
              style={[styles.formBlock]}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors(field.id, {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors(field.id, {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, value }) => (
                  <InputField
                    value={value ? formatDateTime(value, field.formatData) : null}
                    error={getErrorInfo(field.id)?.message}
                    label={t(field.label, field.label)}
                    placeholder={t(field.placeholder, field.placeholder)}
                    required={field.required}
                    editable={false}
                    onPress={() => {
                      calendarModal.current?.show({
                        current: value || new Date(),
                        minDate: field.minDate,
                        maxDate: field.maxDate,
                        onConfirm: date => {
                          onChange(date);
                          checkConditionLogic(field);
                        },
                        type:
                          field.formatData === 'YYYY'
                            ? CALENDAR_TYPES.YEARLY
                            : CALENDAR_TYPES.DAILY,
                      });
                    }}
                    RightComponent={() => <CalendarIcon />}
                    readonly={field.disable || disabled}
                  />
                )}
              />
            </View>
          );
        case 'autocomplete':
          return (
            <View
              style={[styles.formBlock, styles]}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors(field.id, {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors(field.id, {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, value }) => (
                  <View>
                    <TextField>{t(field.label, field.label)}</TextField>
                    <Autocomplete
                      key={field.id}
                      value={value}
                      data={field.value}
                      onChangeText={onChange}
                      type="expand"
                      listKey={`${field.id}-${index}`}
                    />
                  </View>
                )}
              />
            </View>
          );
        case 'modal':
          return (
            <View
              style={[styles.formBlock]}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors(field.id, {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors(field.id, {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, value, ref: modalRef }) => (
                  <View>
                    <TextField>{t(field.label, field.label)}</TextField>
                    <ButtonField
                      type="secondary"
                      text={value[field.display]?.toString() || t(field.placeholder)}
                      onPress={() => showDynamicFormModal(modalRef, field, onChange)}
                    />
                  </View>
                )}
              />
            </View>
          );
        case 'switch':
          return (
            <View
              style={[styles.formBlock]}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors(field.id, {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors(field.id, {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, value, ref: componentRef }) => (
                  <View
                    style={[
                      AppStyle.rowFlex,
                      AppStyle.alignStart,
                      AppStyle.spaceBetweenContent,
                      AppStyle.marginBottom5,
                    ]}>
                    <TextField style={AppStyle.flex1} type="heading-4">
                      {t(field.label, field.label)}
                    </TextField>
                    <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                      <TextField style={AppStyle.marginRight5}>
                        {value ? t('global.yes') : t('global.no')}
                      </TextField>
                      <Switch
                        ref={componentRef}
                        onValueChange={state => {
                          onChange(state.value);
                          checkConditionLogic(field);
                        }}
                        value={value}
                        required={field.required}
                        error={getErrorInfo(field.id)?.message}
                        disabled={disabled}
                      />
                    </View>
                  </View>
                )}
              />
            </View>
          );
        case 'label':
          return (
            <View style={[styles.formBlock]}>
              <InputField
                value={field.value}
                label={t(field.label, field.label)}
                placeholder={t(field.placeholder, field.placeholder)}
                required={field.required}
                LeftComponent={field.formatData ? p => getLeftComponentInput(p, field) : null}
                readonly
              />
            </View>
          );
        case 'radio':
          return (
            <View
              style={[!isFirst && styles.formBlock]}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors(field.id, {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors(field.id, {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, value }) => (
                  <View>
                    <TextField type="heading-4">{t(field.label, field.label)}</TextField>
                    <RadioButtonGroup
                      layout="row"
                      readonly={(field.asAt && field.collapse) || disabled ? true : field.readonly}
                      style={[AppStyle.rowFlex, AppStyle.marginTop20]}
                      radioStyle={[AppStyle.flex1]}
                      options={[
                        { display: t('global.yes'), value: true },
                        { display: t('global.no'), value: false },
                      ]}
                      selectedValue={value}
                      onSelect={val => {
                        if (onRadioValueChange) {
                          onRadioValueChange(field, val.value, () => {
                            onChange(val.value);
                            checkConditionLogic(field);
                          });
                        } else {
                          onChange(val.value);
                          checkConditionLogic(field);
                        }
                      }}
                      disabled={disabled}
                    />
                  </View>
                )}
              />
            </View>
          );
        case 'interestRate':
          return (
            <View style={[!isFirst && styles.formBlock]}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, value }) => (
                  <InterestRate
                    value={value}
                    onChangeValue={val => {
                      onChange(val);
                      checkConditionLogic(field);
                    }}
                    updateDataFormErrors={updateDataFormErrors}
                    field={field}
                    loanTypeId={field.loanTypeId}
                    loanTypeValue={field.loanTypeValue}
                    required={field.required}
                    readonly={field.asAt && field.collapse ? true : field.readonly}
                    style={
                      field.asAt &&
                      field.collapse &&
                      !field.readonly && {
                        readonlyInputWrapper: { backgroundColor: '#FFFFFF' },
                      }
                    }
                    isFirst={isFirst}
                    disabled={disabled}
                  />
                )}
              />
            </View>
          );

        case 'custom-component':
          const ComponentNode = field.ComponentNode ?? View;
          return (
            <View style={[styles.formBlock]}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, ref: componentRef, value }) => (
                  <ComponentNode
                    ref={componentRef}
                    onChange={values => {
                      onChange(values);
                      checkConditionLogic(field);
                    }}
                    error={getErrorInfo(field.id)}
                    field={field}
                    value={value}
                    disabled={disabled}
                  />
                )}
              />
            </View>
          );
        case 'navigation':
          return (
            <TouchableField
              style={[AppStyle.rowFlex, AppStyle.flexEndContent, AppStyle.marginTop10]}
              onPress={() => NavigationServiceLib.navigate(field.screen, field.params)}>
              <TextField type="captain" style={[AppStyle.alignEnd, styles.seeDetailsText]}>
                {t(field.label, field.label)}
              </TextField>
              <IonIcon
                style={AppStyle.marginLeft5}
                name="arrow-forward-circle"
                size={14}
                color={styles.seeDetailsIcon.color}
              />
            </TouchableField>
          );
        case 'increaseNumber':
          return (
            <View
              style={AppStyle.marginTop15}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors(field.id, {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors(field.id, {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, value }) => (
                  <View>
                    <IncreaseNumber
                      label={t(field.label, field.label)}
                      value={value}
                      minimum={field.minimum}
                      maximum={field.maximum}
                      onChange={val => {
                        onChange(val);
                        checkConditionLogic(field);
                      }}
                      error={getErrorInfo(field.id)?.message}
                      disabled={disabled}
                    />
                  </View>
                )}
              />
            </View>
          );
        case 'landLotSize':
          return (
            <View
              style={AppStyle.marginTop15}
              onLayout={({ nativeEvent }) => {
                updateDataFormErrors(field.id, {
                  offsetY: nativeEvent.layout.y,
                });
              }}
              ref={element => {
                updateDataFormErrors(field.id, {
                  componentRef: element,
                });
              }}>
              <Controller
                control={control}
                name={field.id}
                render={({ onChange, value }) => (
                  <LandLotSize
                    control={control}
                    label={t(field.label, field.label)}
                    landSize={value?.landSize}
                    landSizeUnit={value?.landSizeUnit}
                    lotUnitOptions={field.lotUnitOptions}
                    required={field.required}
                    onChange={val => {
                      onChange(val);
                      checkConditionLogic(field);
                    }}
                    error={getErrorInfo(field.id)}
                    updateDataFormErrors={updateDataFormErrors}
                    readonly={disabled}
                  />
                )}
              />
            </View>
          );
        case 'asAt':
          if (!field.visible) {
            return null;
          }
          if (!flags.asAtDateVisible) {
            return (
              <View style={AppStyle.flex1}>
                {field.fields?.map((_field, fi) => {
                  if (!_field.visible) {
                    return null;
                  }
                  const _isFirst = fi === 0;
                  return (
                    <View key={_field.id} style={AppStyle.marginTop10}>
                      {renderComponent(
                        {
                          ..._field,
                          isFirst: _isFirst,
                          groupId: field?.id,
                          readonly: disabled || _field.readonly,
                          disabled: disabled || _field.disabled,
                        },
                        index,
                      )}
                    </View>
                  );
                })}
              </View>
            );
          }
          return (
            <View
              key={field.id}
              style={[
                groupCollapse[field.id] && AppStyle.marginTop10,
                groupCollapse[field.id] && styles.asAtWrapper,
              ]}>
              <Accordion
                style={{
                  accordionStyle: {
                    backgroundColor:
                      groupCollapse[field.id] || group.component === 'collapse'
                        ? '#F6F6F8'
                        : '#FFFFFF',
                    paddingHorizontal: 0,
                    paddingBottom: groupCollapse[field.id] ? 10 : 0,
                  },
                  expandAccordionStyle: {
                    paddingHorizontal: 10,
                  },
                }}
                keepCollapsedContent
                title={() => (
                  <View style={AppStyle.flex1}>
                    {field.fields?.map((_field, fi) => {
                      if (!_field.visible) {
                        return null;
                      }
                      const _isFirst = fi === 0;
                      return (
                        <View key={_field.id}>
                          {renderComponent(
                            {
                              ..._field,
                              isFirst: _isFirst,
                              groupId: field?.id,
                              asAt: true,
                              collapse: !groupCollapse[field.id],
                              readonly: disabled || _field.readonly,
                              disabled: disabled || _field.disabled,
                            },
                            index,
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
                value={groupCollapse[field.id]}
                onChange={value => {
                  groupCollapse[field.id] = value;
                  setGroupCollapse(cloneDeep(groupCollapse));
                }}
                rightIcon={() => null}
                disabled={field.disabled}>
                <View style={AppStyle.marginTop5}>
                  <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
                    <TextField style={styles.inputLabel}>
                      {t('components.dynamicForm.asAt')}
                    </TextField>
                    {get(field, 'info') ? (
                      <TouchableField
                        onPress={debounce(
                          () => {
                            handleNavigationHistoricalLog(field);
                          },
                          250,
                          { leading: true, trailing: false },
                        )}>
                        <HistoryIcon />
                      </TouchableField>
                    ) : null}
                  </View>
                  <View
                    style={[AppStyle.marginTop5]}
                    onLayout={({ nativeEvent }) => {
                      updateDataFormErrors(field.id, {
                        offsetY: nativeEvent.layout.y,
                      });
                    }}
                    ref={element => {
                      updateDataFormErrors(field.id, {
                        componentRef: element,
                      });
                    }}>
                    <Controller
                      control={control}
                      name={field.id}
                      render={({ onChange, value }) => (
                        <InputField
                          value={value ? formatDateTime(value, 'DD MMM YYYY') : null}
                          placeholder="DD MMMM YYYY"
                          editable={false}
                          onPress={() =>
                            calendarModal.current?.show({
                              current: value || new Date(),
                              minDate: field.lastDate
                                ? moment(field.lastDate).format('YYYY-MM-DD')
                                : null,
                              maxDate: moment(new Date()).format('YYYY-MM-DD'),
                              onConfirm: date => {
                                onChange(UtilLib.dateUTCAsAt(date));
                              },
                            })
                          }
                          RightComponent={() => <CalendarIcon />}
                          readonly={field.readonly || disabled}
                        />
                      )}
                    />
                  </View>
                </View>
              </Accordion>
            </View>
          );
        default:
          if (
            typeof renderCustomComponent === 'function' &&
            typeof isCustomComponent === 'function' &&
            isCustomComponent(field.component)
          ) {
            return (
              <View style={[styles.formBlock]}>
                <Controller
                  control={control}
                  name={field.id}
                  render={_props =>
                    renderCustomComponent(control, field, _props, {
                      getErrorInfo,
                      getTotalAnual,
                      updateDataFormErrors,
                    })
                  }
                />
              </View>
            );
          }
          return null;
      }
    },
    [
      styles,
      control,
      t,
      groupCollapse,
      renderCustomComponent,
      isCustomComponent,
      updateDataFormErrors,
      getErrorInfo,
      checkConditionLogic,
      getTotalAnual,
      getLeftComponentInput,
      getRightComponentInput,
      googlePlaceApiKey,
      showDynamicFormModal,
      onRadioValueChange,
      flags,
      disabled,
      handleNavigationHistoricalLog,
      onDropdownValueChange,
    ],
  );

  useEffect(() => {
    if (!isEmpty(layout) && layout.layout) {
      layout.layout.map(group => {
        if (!group.isHide && group.component === 'collapse') {
          if (group.fields?.some(field => errors[field.id])) {
            setGroupCollapse(groupColl => {
              groupColl[group.id] = true;
              return cloneDeep(groupColl);
            });
          }
        }
      });
    }
  }, [errors, layout]);

  const handleData = () => {
    if (!isEmpty(layout) && layout.layout) {
      return layout.layout.map((group, index) => {
        const visibleFields = group.fields?.filter(x => x.visible) || [];
        if ((group.isHide || visibleFields.length === 0) && !group.shouldVisible) {
          return null;
        }
        if (group.component === 'collapse') {
          return (
            <View key={group.id} style={AppStyle.marginY10}>
              <Accordion
                keepCollapsedContent
                title={t(group.label, group.label)}
                value={groupCollapse[group.id]}
                onChange={value => {
                  groupCollapse[group.id] = value;
                  setGroupCollapse(cloneDeep(groupCollapse));
                }}>
                {group != null &&
                  group.fields?.map(field => {
                    if (!field.visible && !group.shouldVisible) {
                      return null;
                    }
                    return <View key={field.id}>{renderComponent(field, index, group)}</View>;
                  })}
              </Accordion>
            </View>
          );
        }
        return (
          <View key={group.id} {...(group.style && { style: group.style })}>
            {group.component === 'group' && !isEmpty(group.label) && (
              <TextField type="paragraph-1" style={styles.label}>
                {group.label}
              </TextField>
            )}
            {group.component === 'question' && (
              <Question
                key={group.id}
                emotion={group.emotion}
                content={t(group.label, group.label)}
                style={[AppStyle.marginTop30, AppStyle.marginBottom5]}
              />
            )}
            {group != null &&
              group.fields?.map(field => {
                if (!field.visible) {
                  return null;
                }
                return <View key={field.id}>{renderComponent(field, index, group)}</View>;
              })}
          </View>
        );
      });
    }
    return <View />;
  };

  return (
    <View style={styles.container}>
      <FormProvider {...methods}>
        {handleData()}
        <CalendarModal ref={calendarModal} />
      </FormProvider>
    </View>
  );
}

export default React.forwardRef(DynamicForm);
