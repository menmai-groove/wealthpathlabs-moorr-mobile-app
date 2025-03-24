/* eslint-disable quotes */
import i18n from 'bootstrap/i18n';
import Color from 'color';
import { AppConstants } from 'constant';
import {
  cloneDeep,
  concat,
  findLast,
  flowRight,
  get,
  includes,
  isArray,
  isDate,
  isEmpty,
  isFunction,
  isNaN,
  isNil,
  isNumber,
  isObject,
  isString,
  last,
  omit,
  sortBy,
  sumBy,
  toNumber,
  uniq,
} from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import React, { createElement, forwardRef } from 'react';
import { Animated, LayoutAnimation, Linking, Platform } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import semverGte from 'semver/functions/gte';

import GlobalLib from './global';

export const contrastColor = color => {
  const objColor = Color(color);
  return objColor.negate();
};

export const lightenBackgroundValue = (color, light) => {
  const newColor = Color(color).lighten(light);
  return newColor.hex();
};

export const darkenBackgroundValue = (color, light) => {
  const newColor = Color(color).darken(light);
  return newColor.hex();
};

export const lightenBackground = (classObject, light = 0.7) => {
  const newColor = Color(classObject.backgroundColor).lighten(light);
  return {
    backgroundColor: newColor.hex(),
  };
};

export const lightenText = (classObject, light = 0.7) => {
  const newColor = Color(classObject.color).lighten(light);
  return {
    color: newColor.hex(),
  };
};

export const darkenBackground = (classObject, light = 0.7) => {
  const newColor = Color(classObject.backgroundColor).darken(light);
  return {
    backgroundColor: newColor.hex(),
  };
};

export const darkenText = (classObject, light = 0.7) => {
  const newColor = Color(classObject.color).darken(light);
  return {
    color: newColor.hex(),
  };
};

export const darkenBorder = (classObject, light = 0.7, position) => {
  const newColor = Color(classObject.borderColor).darken(light);
  switch (position) {
    case 'top':
      return {
        borderTopColor: newColor.hex(),
      };
    case 'bottom': {
      return {
        borderBottomColor: newColor.hex(),
      };
    }
    case 'left': {
      return {
        borderLeftColor: newColor.hex(),
      };
    }
    case 'right': {
      return {
        borderRightColor: newColor.hex(),
      };
    }
    default: {
      return {
        borderColor: newColor.hex(),
      };
    }
  }
};

export const hexToRGBA = (color, alpha = 0.1) => {
  return Color(color).alpha(alpha).toString();
};

export const formatDateTime = (time, pattern = 'MM-DD-YYYY') => {
  return moment(time || new Date()).format(pattern);
};

export const formatCurrency = (number, symbol = '$', options = { decimal: 0 }) => {
  if (!isNumber(number)) {
    return number;
  }
  const formatScientificNotationNumber = Number(number).toFixed(8); // format for case number = 9.322320693172514e-12

  if (formatScientificNotationNumber.includes('e+')) {
    return Number(number).toLocaleString('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  let { decimal } = options;
  if (decimal > 0) {
    return numeral(formatScientificNotationNumber).format(
      symbol + `0,0.${Array.from('0'.repeat(decimal)).join('')}`,
    );
  }
  const currencyPattern =
    symbol +
    (numeral(formatScientificNotationNumber)._value > 1000000 ||
    numeral(formatScientificNotationNumber)._value < -1000000
      ? '0,0'
      : '0,0[.]00');

  return numeral(formatScientificNotationNumber).format(currencyPattern);
};

export const formatCurrencyWithCompact = number => {
  if (!isNumber(number)) {
    return number;
  }
  const formatScientificNotationNumber = Number(number).toFixed(8); // format for case number = 9.322320693172514e-12
  let formatter = Intl.NumberFormat('en-AU', {
    notation: 'compact',
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 1,
  });

  return formatter.format(formatScientificNotationNumber);
};

export const formatBracketsCurrency = number => {
  if (isNumber(number) && number < 0) {
    return '(' + formatCurrency(Math.abs(number), '$') + ')';
  }
  return formatCurrency(number);
};

export const formatNumber = (number, format = '0,0[.][00]') => {
  if (!isNumber(number)) {
    return number;
  }
  const formatScientificNotationNumber = Number(number).toFixed(8); // format for case number = 9.322320693172514e-12

  if (formatScientificNotationNumber.includes('e+')) {
    // var formatter = new Intl.NumberFormat('en-AU', {
    //   style: 'decimal',
    //   minimumFractionDigits: 0,
    //   maximumFractionDigits: 0,
    // });
    // return formatter.format(number);
    return Number(number).toLocaleString('en-AU', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  return numeral(number).format(format);
};

export const compareDate = (d1, d2) => {
  const date1 = moment(d1 || new Date()).format('YYYY-MM-DD');
  const date2 = moment(d2 || new Date()).format('YYYY-MM-DD');
  const isBefore = moment(date1).isBefore(date2);
  const isSame = moment(date1).isSame(date2);

  return isBefore ? -1 : isSame ? 0 : 1;
};

export const diffDate = (d1, d2, unit = 'timestamp') => {
  const def = new Date();
  return moment(d1 || def).diff(moment(d2 || def), unit) !== 0;
};

export const mergeArrayObjectIntoObject = arrObj => {
  return Array.isArray(arrObj) ? Object.assign({}, ...arrObj) : arrObj;
};

export const openInAppBrowserLink = async (urlStr, opts = {}) => {
  try {
    const url = urlStr;

    if (Platform.OS === 'ios' && (await InAppBrowser.isAvailable())) {
      InAppBrowser.close();
      const result = await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: 'close',
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,
        enableBarCollapsing: false,
        // Android Properties
        showTitle: true,
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right',
        },
        ...opts,
      });
      isFunction(opts.callback) && opts.callback(result);
    } else {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        GlobalLib.Toast.get().toastError(i18n.t('errorMsg.somethingWentWrong'));
      }
    }
  } catch (error) {
    GlobalLib.Toast.get().toastError(i18n.t('errorMsg.somethingWentWrong'));
  }
};

export const isSupportedVersion = (versions, current) => {
  if (isArray(versions) && versions.length) {
    return !isNil(versions.find(v => semverGte(current, v)));
  }
  if (isString(versions)) {
    return semverGte(current, versions);
  }
  return false;
};

/**
 * This function follow the idea of redux's `compose` function
 * but allow passing ref like forwardRef.
 * @param funcs The functions to compose.
 * @returns Functional component obtained by composing forwardRef
 * with the argument functions from right to left.
 * Use the `ref` as the second parameter when declaring a Component,
 * (the first parameter is property object).
 */
export const composeWithRef =
  (...funcs) =>
  Component => {
    const RefComponent = forwardRef(Component);
    const _Component = flowRight([...funcs])(({ _forwardedRef, ...props }) => (
      <RefComponent {...props} ref={_forwardedRef} />
    ));
    return forwardRef(({ children, ...props }, ref) =>
      createElement(_Component, { ...props, _forwardedRef: ref }, children),
    );
  };

function formatOrdinalNumber(i) {
  if (!isNumber(i)) {
    return '';
  }
  var j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + 'st';
  }
  if (j === 2 && k !== 12) {
    return i + 'nd';
  }
  if (j === 3 && k !== 13) {
    return i + 'rd';
  }
  return i + 'th';
}

export function getFieldFromFormJSON(layout = [], id) {
  if (!isArray(layout)) {
    return null;
  }
  let field = null;
  layout.some(layoutItem => {
    layoutItem?.fields?.some(item => {
      if (item?.id === id) {
        field = item;
        return true;
      }
      if (item.fields) {
        let _field = item.fields.find(f => f.id === id);
        if (_field) {
          field = _field;
          return true;
        }
      }
    });
    if (field) {
      return true;
    }
  });
  return field;
}

export const getFieldFromLayout = (_layout, fieldId) => {
  let field;
  _layout.forEach(group => {
    group.fields.forEach(x => {
      if (x.id === fieldId) {
        field = x;
        return field;
      }
      if (x.fields) {
        let _field = x.fields.find(f => f.id === fieldId);
        if (_field) {
          field = _field;
          return field;
        }
      }
    });
  });
  return field;
};

function handleConditionLogicDynamicForm(layoutFormat, conditionLogics, appPreferences = {}) {
  try {
    function checkGroupVisibleLogic(conditions) {
      let set = new Set();
      conditions.condition.forEach(condition => {
        if ('operator' in condition) {
          const returnSet = checkGroupVisibleLogic(condition);
          set.add(returnSet);
        } else {
          // let conditonField;
          // layoutFormat.layout.some(l => {
          //   conditonField = l.fields.find(x => x.id === condition.field);
          //   if (conditonField) {
          //     return true;
          //   }
          // });
          let conditonField = getFieldFromLayout(layoutFormat.layout, condition.field);
          if (conditonField && conditonField.value != null) {
            if (condition.type === '=') {
              let valueCheck = !isEmpty(condition.key)
                ? conditonField.value[condition.key]
                : conditonField.value;
              set.add(condition.value === valueCheck);
            }
            if (condition.type === 'visible') {
              set.add(condition.value === conditonField.visible);
            }
            if (condition.type === 'include') {
              let check = !isEmpty(condition.key)
                ? includes(conditonField.value[condition.key], condition.value)
                : includes(conditonField.value, condition.value);
              set.add(check);
            }
          }
        }
      });
      let valid = conditions.operator === 'AND' ? !set.has(false) && set.size > 0 : set.has(true);
      return valid;
    }
    conditionLogics?.logics?.forEach(logic => {
      if (logic.type === 'group-visible') {
        // used for hide/show group
        let valid = checkGroupVisibleLogic(logic.condition);

        if (valid) {
          layoutFormat.layout.some(group => {
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
          layoutFormat.layout.forEach(group => {
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
      } else {
        // let field;
        // layoutFormat.layout.some(l => {
        //   field = l.fields.find(x => x.id === logic.field);
        //   if (field) {
        //     return true;
        //   }
        // });
        let field = getFieldFromLayout(layoutFormat.layout, logic.field);
        if (field) {
          switch (logic.type) {
            case 'visible':
              let valid = checkGroupVisibleLogic(logic.condition);
              if (valid) {
                field.visible = logic.value;
              } else {
                field.visible = !logic.value;
              }
              break;
            case 'exclude_option_value': // remove option key with correct condition
              // get original data
              let originalOptions = field.originalOptions;
              // check condition
              let willExclude = checkGroupVisibleLogic(logic.condition);
              if (willExclude) {
                // remove key
                const newOptions = cloneDeep(originalOptions);
                field.options = newOptions.filter(item => !logic.value.includes(item[logic.key]));
              }
              break;
            case 'setValue':
              switch (logic.format) {
                case 'datetime':
                  if (logic.condition?.operator === 'ADD') {
                    let conditions = get(logic, ['condition', 'condition']);
                    let inputField = conditions.find(c => c.type === 'input');
                    if (inputField) {
                      let value = getFieldFromFormJSON(
                        layoutFormat.layout,
                        inputField.field,
                      )?.value;
                      if (value) {
                        conditions.forEach(c => {
                          if (c.type === 'amount') {
                            if (c.component === 'dropdown') {
                              let amountValue = getFieldFromFormJSON(layoutFormat.layout, c.field)
                                ?.value?.value;
                              value = moment(value).add(Number(amountValue), c.unit);
                            }
                            if (c.component === 'input') {
                              let amountValue = getFieldFromFormJSON(
                                layoutFormat.layout,
                                c.field,
                              )?.value;
                              value = moment(value).add(Number(amountValue), c.unit);
                            }
                          }
                        });
                        field.value = value;
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
                        let currentValue = Number(
                          getFieldFromFormJSON(layoutFormat.layout, c.field)?.value ?? 0,
                        );
                        if (currentValue && c.type === 'negative') {
                          currentValue = Number(currentValue) * -1;
                        }
                        sum += currentValue;
                      });
                      field.value = sum.toString();
                    }
                  }
                  if (logic.condition?.operator === 'SUMBY') {
                    let conditions = get(logic, ['condition', 'condition']) || [];
                    if (conditions) {
                      let sum = 0;
                      conditions.forEach(c => {
                        let currentValue =
                          getFieldFromFormJSON(layoutFormat.layout, c.field)?.value ?? [];

                        if (currentValue) {
                          sum = sumBy(currentValue, c.key);
                        }
                      });
                      field.value = sum.toString();
                    }
                  }
                  break;
                case 'currentYield':
                  let yieldConditions = get(logic, ['condition', 'condition']) || [];
                  if (yieldConditions) {
                  }
                  const yieldValue = Number(
                    getFieldFromFormJSON(
                      layoutFormat.layout,
                      yieldConditions.find(item => item.id === 'currentValue').field,
                    )?.value ?? 0,
                  );
                  if (yieldValue === 0) {
                    field.value = 0;
                    field.displayValue = i18n.t('global.invalid');
                  } else {
                    const incomeBreakdownCards = getFieldFromFormJSON(
                      layoutFormat.layout,
                      'incomeBreakdownCard',
                    );
                    const annualIncome = (incomeBreakdownCards?.value || [])
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
                    field.value = currentValue;
                    field.displayValue = formatNumber(currentValue * 100, '0,0[.][00]');
                  }
                  break;
                case 'historicalCapital':
                  const historicalCapitalGrowthMaxValue =
                    appPreferences?.historicalCapitalGrowthMaxValue;
                  const historicalCapitalGrowthMinValue =
                    appPreferences?.historicalCapitalGrowthMinValue;
                  const historicalCapitalGrowthMaxDisplayValue =
                    appPreferences?.historicalCapitalGrowthMaxDisplayValue;

                  let conditions = get(logic, ['condition', 'condition']) || [];
                  const currentValue = Number(
                    getFieldFromFormJSON(
                      layoutFormat.layout,
                      conditions.find(item => item.id === 'currentValue').field,
                    )?.value ?? 0,
                  );
                  const purchasePrice = Number(
                    getFieldFromFormJSON(
                      layoutFormat.layout,
                      conditions.find(item => item.id === 'purchasePrice').field,
                    )?.value ?? 0,
                  );
                  const datePurchased = getFieldFromFormJSON(
                    layoutFormat.layout,
                    conditions.find(item => item.id === 'datePurchased').field,
                  )?.value;
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
                  if (purchasePrice === 0 || yearDifference === 0) {
                    field.value = 0;
                    field.displayValue = i18n.t('global.invalid');
                  } else {
                    let hisCapitalGrowth = Math.pow(ratio, 1 / yearDifference) - 1;
                    if (isNumber(historicalCapitalGrowthMaxValue)) {
                      hisCapitalGrowth = Math.min(
                        hisCapitalGrowth,
                        historicalCapitalGrowthMaxValue,
                      );
                    }
                    field.value = hisCapitalGrowth;
                    const hisCapitalGrowthPA = hisCapitalGrowth * 100;
                    if (isNumber(historicalCapitalGrowthMaxDisplayValue)) {
                      field.displayValue =
                        hisCapitalGrowthPA > historicalCapitalGrowthMaxDisplayValue
                          ? i18n.t('global.invalid')
                          : formatNumber(hisCapitalGrowthPA, '0,0[.][00]');
                    } else {
                      field.displayValue = formatNumber(hisCapitalGrowthPA, '0,0[.][00]');
                    }
                  }

                  break;
                case 'annualIncome':
                  let _conditions = get(logic, ['condition', 'condition']) || [];
                  if (_conditions) {
                    let regularIncome = 0,
                      adhocIncome = 0,
                      regularIncomeFrequenceMultiplier = 0,
                      adhocIncomeFrequenceMultiplier = 0;
                    let regularIncomeCond = _conditions.find(x => x.id === 'regularIncome');
                    if (!isNil(regularIncomeCond)) {
                      regularIncome =
                        getFieldFromFormJSON(layoutFormat.layout, regularIncomeCond.field)?.value ??
                        0;
                    }
                    let regularIncomeFrequenceCond = _conditions.find(
                      x => x.id === 'regularIncomeFrequence',
                    );
                    if (!isNil(regularIncomeFrequenceCond)) {
                      let regularIncomeFrequence = getFieldFromFormJSON(
                        layoutFormat.layout,
                        regularIncomeFrequenceCond.field,
                      )?.value;
                      regularIncomeFrequenceMultiplier =
                        AppConstants.frequencyMultiplier.find(
                          x => x.value === regularIncomeFrequence?.value,
                        )?.multiplier ?? 0;
                    }
                    let adhocIncomeCond = _conditions.find(x => x.id === 'adhocIncome');
                    if (!isNil(adhocIncomeCond)) {
                      adhocIncome =
                        getFieldFromFormJSON(layoutFormat.layout, adhocIncomeCond.field)?.value ??
                        0;
                    }
                    let adhocIncomeFrequenceCond = _conditions.find(
                      x => x.id === 'adhocIncomeFrequence',
                    );
                    if (!isNil(adhocIncomeFrequenceCond)) {
                      let adhocIncomeFrequence = getFieldFromFormJSON(
                        layoutFormat.layout,
                        adhocIncomeFrequenceCond.field,
                      )?.value;
                      adhocIncomeFrequenceMultiplier =
                        AppConstants.frequencyMultiplier.find(
                          x => x.value === adhocIncomeFrequence?.value,
                        )?.multiplier ?? 0;
                    }
                    field.value =
                      regularIncome * regularIncomeFrequenceMultiplier +
                      adhocIncome * adhocIncomeFrequenceMultiplier;
                  }

                  break;

                case 'self_employed':
                  let __conditions = get(logic, ['condition', 'condition']) || [];
                  if (__conditions) {
                    let regularIncome = 0;
                    let regularIncomeCond = _conditions.find(x => x.id === 'amount');
                    if (!isNil(regularIncomeCond)) {
                      regularIncome =
                        getFieldFromFormJSON(layoutFormat.layout, regularIncomeCond.field)?.value ??
                        0;
                    }
                    field.value = regularIncome;
                  }
                  break;

                default:
                  break;
              }
              break;
            default:
              break;
          }
        }
      }
    });
  } catch (error) {}
}

function mapDataForDropdown(data) {
  if (isEmpty(data)) {
    return [];
  }
  return [...data].map(x => {
    const item = omit(x, '__typename');
    let value = item.value;
    if (isArray(item.value)) {
      value = item.value.map(y => (isObject(y) ? omit(y, '__typename') : y));
    } else if (isObject(item.value)) {
      value = omit(item.value, '__typename');
    }
    return {
      ...item,
      value,
      label: item.label || (isString(item.value) ? item.value : ''),
      display: item.label || (isString(item.value) ? item.value : ''),
    };
  });
}
export function generateObjectForDropdown(item) {
  return {
    ...item,
    label: item.label || item.value,
    display: item.label || item.value,
  };
}

const getColorByIndex = (index = 0) =>
  AppConstants.keyColors.find((_, ci) => ci === index)?.color || AppConstants.defaultColor;

function getConditionObjectFromJSON(logics, field) {
  if (!isArray(logics)) {
    return null;
  }
  let object = null;
  logics.some(logicItem => {
    if (logicItem?.field === field) {
      object = logicItem;
      return true;
    }
  });
  return object;
}

export function renameKeys(obj, newKeys) {
  const keyValues = Object.keys(obj).map(key => {
    const newKey = newKeys[key] || key;
    return { [newKey]: obj[key] };
  });
  return Object.assign({}, ...keyValues);
}

function toastErrorMsg(error) {
  if (!isEmpty(error?.message)) {
    GlobalLib.Toast.get().toastError(error?.message);
  } else {
    GlobalLib.Toast.get().toastError(i18n.t('errorMsg.somethingWentWrong'));
  }
}
const sortDataTaxReturn = data => {
  let value1 = data[0]?.FY?.split('/'); // ["2021","2022" ]
  let value2 = data[1]?.FY?.split('/');
  let listYears = sortBy(uniq(concat(value1, value2)));
  const currentYear = `${listYears[1]}/${listYears[2]}`;
  const lastYear = `${listYears[0]}/${listYears[1]}`;
  const dataCurrentYear = data?.filter(item => item?.FY === currentYear);
  const dataLastYear = data?.filter(item => item?.FY === lastYear);

  return { dataCurrentYear: dataCurrentYear[0], dataLastYear: dataLastYear[0] };
};

function handleEditOwnership(oldOwnership, newOwnership) {
  try {
    const oldOwner = cloneDeep(oldOwnership.owners);
    const newOwners = cloneDeep(newOwnership);
    // handle case dynamicform ownership dropdown unchange: update id to newID
    newOwners.owners.map((item, i) => {
      item._id = AppConstants.newObjectID.replace('1', `owner_${i + 1}`);
    });
    oldOwner.map(item => {
      item._delete = true;
    });
    newOwners.owners = [...newOwners.owners, ...oldOwner];
    return newOwners;
  } catch (error) {
    return newOwnership;
  }
}

const getFYTaxReturnByValue = (AssessedTaxReturn = [], value = '') => {
  if (!isArray(AssessedTaxReturn)) {
    return null;
  }
  const indexFY = AssessedTaxReturn?.findIndex(item => item?.value === value);
  if (indexFY < 0) {
    return null;
  }
  return AssessedTaxReturn[indexFY];
};

const generateTaxReturnData = ({ FY, dataFormAssessedTaxReturn }) => {
  if (dataFormAssessedTaxReturn && dataFormAssessedTaxReturn.length) {
    let dataTaxReturn = cloneDeep(dataFormAssessedTaxReturn);
    return dataTaxReturn.map(item => ({
      salary: !checkEmptyButNotZero(item?.salary) ? toNumber(item?.salary) : null,
      FY: item?.FY,
      _id: item?._id,
    }));
  }
  const yearCurrent = FY?.value?.split('/') || [];
  const FYLastYear =
    yearCurrent.length > 1 ? `${toNumber(yearCurrent[0] - 1)}/${toNumber(yearCurrent[1] - 1)}` : '';

  let dataCurrentYear = {
    FY: FY?.value || '',
    salary: null,
    _id: '__ObjectId__1',
  };
  let dataLastYear = {
    FY: FYLastYear,
    salary: null,
    _id: '__ObjectId__2',
  };
  return [dataCurrentYear, dataLastYear];
};

const handleDataTaxReturnByAmount = (AssessedTaxReturn, amount, lastAmount) => {
  const yearCurrent = AssessedTaxReturn[0]?.value?.split('/') || [];
  const FYCurrentYear = yearCurrent.length > 1 ? `${yearCurrent[0]}/${yearCurrent[1]}` : '';
  const FYLastYear =
    yearCurrent.length > 1 ? `${toNumber(yearCurrent[0] - 1)}/${toNumber(yearCurrent[1] - 1)}` : '';
  return [
    {
      FY: FYCurrentYear,
      salary: !isNil(amount) ? toNumber(amount) : null,
      _id: '__ObjectId__1',
    },
    {
      FY: FYLastYear,
      salary: !isNil(lastAmount) ? toNumber(lastAmount) : null,
      _id: '__ObjectId__2',
    },
  ];
};

const handleCheckValueStep2 = value => {
  if (isEmpty(value)) {
    return true;
  }
  const textTrim = value?.trim();
  if (textTrim?.length < 1) {
    return true;
  }
  return false;
};

const handleConfigureNextLayoutAnimation = () => {
  LayoutAnimation.configureNext({
    duration: 250,
    update: { type: LayoutAnimation.Types.easeInEaseOut, springDamping: 0.7 },
  });
};

export const getCardItemDefaultValuesFromAPI = defaultOptions => {
  const defaultValues = {};
  if (!isEmpty(defaultOptions)) {
    for (let key in defaultOptions) {
      if (!isEmpty(defaultOptions[key])) {
        defaultValues[key] = defaultOptions[key];
      }
    }
  }
  return defaultValues;
};

const checkEmptyButNotZero = text => isEmpty(text) && text !== 0 && typeof text !== 'number';

const formatWealthChartLabel = (date, range) =>
  moment(date).format(['2Y', '3Y', 'MAX'].includes(range) ? "MMM'YY" : 'MMM Do');

const formatLineChartPoints = ({
  graphWidth = 500,
  field = 'wealthSPEED',
  records,
  rangeStart = new Date(),
  rangeEnd = new Date(),
  removeLastPoint = false,
}) => {
  if (records.length === 0) {
    return records;
  }

  records = records.sort((a, b) => a.generatedDate - b.generatedDate);
  // const rangeStart = new Date('2022-12-18');
  // const rangeEnd = new Date('2023-01-18');
  const points = [];
  // const graphWidth = 500;
  // const field = 'wealthSPEED';

  // Microseconds in a day
  const dayMS = 24 * 60 * 60 * 1000;

  // Width of each day in the graph
  const dayInterval = graphWidth / ((rangeEnd - rangeStart) / dayMS);

  // Determine if intercept point is needed
  if (records[0] && records[0].generatedDate < rangeStart) {
    // Single point - straight line
    if (!records[1]) {
      points.push({ x: 0, y: records[0][field], date: records[0].generatedDate });
    }

    // Multiple points
    else {
      // Linear calculation: y = mx + c
      const deltaDays = (records[0].generatedDate - records[1].generatedDate) / dayMS;
      const m = (records[1][field] - records[0][field]) / deltaDays;
      const x = (records[0].generatedDate - rangeStart) / dayMS;
      const c = records[0][field];
      const y = m * x + c;
      points.push({ x: 0, y: y, date: records[0].generatedDate });
    }
  }

  // Determine points within graph
  for (var i = 0; i < records.length; i++) {
    const r = records[i];

    // Skip leading point
    if (r.generatedDate < rangeStart) {
      continue;
    }

    // Points within graph
    const deltaDays = (r.generatedDate - rangeStart) / dayMS;
    points.push({ x: deltaDays * dayInterval, y: r[field], date: r.generatedDate });
  }

  // Add trailing point to the end of the graph (i.e. take last point to the end of the graph)
  if (!removeLastPoint) {
    points.push({ x: graphWidth, y: points[points.length - 1]?.y ?? 0, date: rangeEnd });
  }
  return points;
};

const formatLineChartIntervals = ({
  graphWidth = 500,
  rangeStart = new Date(),
  rangeEnd = new Date(),
  minIntervalDefault = 70,
}) => {
  // Microseconds in a day
  const dayMS = 24 * 60 * 60 * 1000;
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const addDay = function (date) {
    return new Date(date.getTime() + dayMS);
  };

  const addInterval = function (intervals, x, date, useDayIntervals) {
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear() - 2000;

    // Start of Axis
    if (useDayIntervals) {
      intervals.push({ x: x, label: `${date.getDate()} ${month}` });
    } else {
      intervals.push({
        x: x,
        label: `${month}'${year}`,
      });
    }
  };

  // Initialize data
  const rangeDays = (rangeEnd - rangeStart) / dayMS;

  const minInterval = minIntervalDefault;
  const dayInterval = graphWidth / ((rangeEnd - rangeStart) / dayMS);
  const intervals = [];

  const useDayIntervals = rangeDays <= 31 ? true : false;

  // Add interval label at start of the graph
  addInterval(intervals, 0, rangeStart, useDayIntervals);

  // Count forward in days to determine intervals
  let currentDay = rangeStart;
  while (currentDay < rangeEnd) {
    currentDay = addDay(currentDay);

    // Add an interval at the first day of each month (or daily if useDayIntervals)
    if (currentDay.getDate() === 1 || useDayIntervals) {
      const deltaDays = (currentDay - rangeStart) / dayMS;

      // Skip interval if < minInterval
      // const nextX = deltaDays * dayInterval;
      const nextX = deltaDays * dayInterval;
      const lastX = intervals[intervals.length - 1] ? intervals[intervals.length - 1].x : 0;
      if (nextX - lastX >= minInterval && graphWidth - nextX >= minInterval) {
        addInterval(intervals, nextX, currentDay, useDayIntervals);
      }
    }
  }

  // Add interval label at end of the graph
  addInterval(intervals, graphWidth, rangeEnd, useDayIntervals);
  return intervals;
};

const formatRangeChartData = ({ data = [], rangeStart = new Date(), rangeEnd = new Date() }) => {
  // NOTE: data = [{ label: "", value: 0, generatedDate: new Date() }]
  const lineChartPoints = formatLineChartPoints({
    graphWidth: AppConstants.graphWidth,
    field: 'value',
    records: data.map(item => ({
      ...item,
      generatedDate: new Date(item.generatedDate) ?? new Date(),
    })),
    rangeStart: new Date(rangeStart) ?? new Date(),
    rangeEnd: new Date(rangeEnd) ?? new Date(),
  });
  const lineChartIntervals = formatLineChartIntervals({
    graphWidth: AppConstants.graphWidth,
    rangeStart: new Date(rangeStart) ?? new Date(),
    rangeEnd: new Date(rangeEnd) ?? new Date(),
  });
  const _pointData = lineChartPoints.map(item => ({
    type: 'point',
    x: item?.x,
    value: item?.y,
  }));
  const _intervalData = lineChartIntervals.map(item => ({
    type: 'interval',
    ...item,
    value: 0,
  }));
  const rangeChartNetworthData = concat(_pointData, _intervalData);
  return rangeChartNetworthData;
};

function removeConsecutiveDuplicates(arr) {
  const result = [];

  for (let i = 0; i < arr.length; i++) {
    if (i === 0 || i === arr.length - 1) {
      result.push(arr[i]);
      continue;
    }

    const previous = arr[i - 1];
    const previousMonth = String(previous.date).slice(0, 7);
    const current = arr[i];
    const currentMonth = String(current.date).slice(0, 7);
    const next = arr[i + 1];
    const nextMonth = String(next.date).slice(0, 7);
    const sameMonth = previousMonth === currentMonth && currentMonth === nextMonth;
    const sameValue = previous.value === current.value && current.value === next.value;
    if (!(sameMonth && sameValue)) {
      result.push(arr[i]);
    }
  }

  return result;
}

const getChartGraph = (viewportWidth, chartTime, chartData) => {
  // Remove duplicate date
  let removeDuplicateDateChartDataObject = {};
  let removeDuplicateDateChartData = [];
  for (var i = 0; i < chartData?.length; i++) {
    const chartDateItem = chartData[i];
    const chartDateItemDate = String(chartDateItem.date).slice(0, 10);
    removeDuplicateDateChartDataObject[chartDateItemDate] = chartDateItem.value;
  }
  removeDuplicateDateChartData = Object.entries(removeDuplicateDateChartDataObject).map(
    ([key, value]) => ({
      date: key + 'T00:00:00.000Z',
      value,
    }),
  );

  // Remove duplicate value
  let removeDuplicateValueChartData = removeConsecutiveDuplicates(removeDuplicateDateChartData);

  let cloneChartData = cloneDeep(removeDuplicateValueChartData || []);
  cloneChartData = sortBy(cloneChartData, 'date');

  // Check if cloneChartData has data
  if (cloneChartData.length > 0) {
    // Constants for time calculations
    const timePerDay = 1000 * 60 * 60 * 24;

    // Calculate the time difference in days between the last and first data points
    const diff =
      new Date(cloneChartData[cloneChartData.length - 1].date).getTime() -
      new Date(cloneChartData[0].date).getTime();
    const diffInDays = diff / timePerDay;

    // Initialize variables for chart range and change in value calculations
    let minX = '';
    let maxX = '';

    // Duplicate the single data point to create a dummy point for better chart display
    if (cloneChartData.length === 1) {
      cloneChartData = [
        cloneChartData[0],
        {
          ...cloneChartData[0],
          date: moment(cloneChartData[0].date).add(5, 'days').toISOString(),
          _type: 'dummy',
        },
      ];
    }

    // Find the selected chart filter based on chartTime
    const chartFilter = AppConstants.listFilterChart.find(x => x.value === chartTime);

    // Check if the time difference is greater than the selected chart filter duration
    const greaterThanFilter = diffInDays > chartFilter?.totalDay || chartFilter.value === 'ALL';

    // Set minX and maxX based on the chart filter and data range
    minX = cloneChartData[0].date;
    if (greaterThanFilter) {
      maxX = cloneChartData[cloneChartData.length - 1].date;
    } else {
      maxX = moment(cloneChartData[0].date).add(chartFilter?.months, 'months').toISOString();
    }

    // Set the initial range values
    let rangeStart = minX,
      rangeEnd = maxX;

    // Ensure that rangeStart is in the cloneChartData array
    if (!cloneChartData.some(e => e.date === rangeStart)) {
      // get nearest value
      const previousRangeStart = findLast(cloneChartData, point =>
        moment(point.date).isBefore(rangeStart),
      );
      if (previousRangeStart) {
        cloneChartData.unshift({ ...previousRangeStart, date: rangeStart });
      }
    }

    // Format data for rangeChartNetworthData using UtilLib
    const rangeChartNetworthData = formatRangeChartDataV2({
      data: cloneChartData.map(item => ({
        label: '',
        value: item?.value,
        generatedDate: item?.date,
      })),
      rangeStart,
      rangeEnd,
      chartFilterValue: chartFilter.value,
      viewport: viewportWidth,
    });

    const lastPointX = last(rangeChartNetworthData.filter(x => x.type === 'point')).x;
    const lastIntervalX = last(rangeChartNetworthData.filter(x => x.type === 'interval')).x;

    // Assemble the final lineChartGraph object
    const lineChartGraph = {
      minX,
      maxX,
      data: cloneChartData,
      rangeChartNetworthData,
      chartFilter: chartFilter,
      graphWidth: Math.max(lastPointX, lastIntervalX),
    };

    // Return the generated chart data
    return lineChartGraph;
  }

  // Return null if cloneChartData is empty
  return null;
};

const getChartGraphV2 = (viewportWidth, chartTime, chartData) => {
  // Remove duplicate date
  let removeDuplicateDateChartDataObject = {};
  let removeDuplicateDateChartData = [];
  for (var i = 0; i < chartData?.length; i++) {
    const chartDateItem = chartData[i];
    const chartDateItemDate = String(chartDateItem.date).slice(0, 10);
    removeDuplicateDateChartDataObject[chartDateItemDate] = chartDateItem.value;
  }
  removeDuplicateDateChartData = Object.entries(removeDuplicateDateChartDataObject).map(
    ([key, value]) => ({
      date: key + 'T00:00:00.000Z',
      value,
    }),
  );

  // Remove duplicate value
  let removeDuplicateValueChartData = removeConsecutiveDuplicates(removeDuplicateDateChartData);

  let cloneChartData = cloneDeep(removeDuplicateValueChartData || []);
  cloneChartData = sortBy(cloneChartData, 'date');

  // Check if cloneChartData has data
  if (cloneChartData.length > 0) {
    // Constants for time calculations
    const timePerDay = 1000 * 60 * 60 * 24;

    // Calculate the time difference in days between the last and first data points
    const diff =
      new Date(cloneChartData[cloneChartData.length - 1].date).getTime() -
      new Date(cloneChartData[0].date).getTime();
    const diffInDays = diff / timePerDay;

    // Initialize variables for chart range and change in value calculations
    let minX = '';
    let maxX = '';

    // Duplicate the single data point to create a dummy point for better chart display
    if (cloneChartData.length === 1) {
      cloneChartData = [
        cloneChartData[0],
        {
          ...cloneChartData[0],
          date: moment(cloneChartData[0].date).add(5, 'days').toISOString(),
          _type: 'dummy',
        },
      ];
    }

    // Find the selected chart filter based on chartTime
    const chartFilter = AppConstants.listFilterChart.find(x => x.value === chartTime);

    // Check if the time difference is greater than the selected chart filter duration
    const greaterThanFilter = diffInDays > chartFilter?.totalDay || chartFilter.value === 'ALL';

    // Set minX and maxX based on the chart filter and data range
    minX = cloneChartData[0].date;

    // Get the last date in the data
    const today = dateUTCAsAt(new Date());

    if (greaterThanFilter) {
      maxX = cloneChartData[cloneChartData.length - 1].date;
    } else {
      maxX = moment(cloneChartData[0].date).add(chartFilter?.months, 'months').toISOString();
    }

    if (new Date(maxX) < new Date(today)) {
      maxX = today;
    }
    // Set the initial range values
    let rangeStart = minX,
      rangeEnd = maxX;

    // Ensure that rangeStart is in the cloneChartData array
    if (!cloneChartData.some(e => e.date === rangeStart)) {
      // get nearest value
      const previousRangeStart = findLast(cloneChartData, point =>
        moment(point.date).isBefore(rangeStart),
      );
      if (previousRangeStart) {
        cloneChartData.unshift({ ...previousRangeStart, date: rangeStart });
      }
    }

    // Ensure that today is in the cloneChartData array
    if (
      last(cloneChartData) &&
      moment(last(cloneChartData)?.date).isBefore(moment(dateUTCAsAt(today)))
    ) {
      cloneChartData.push({ ...last(cloneChartData), date: dateUTCAsAt(today) });
    }

    // Format data for rangeChartNetworthData using UtilLib
    const rangeChartNetworthData = formatRangeChartDataV2({
      data: cloneChartData.map(item => ({
        label: '',
        value: item?.value,
        generatedDate: item?.date,
      })),
      rangeStart,
      rangeEnd,
      chartFilterValue: chartFilter.value,
      viewport: viewportWidth,
    });

    const lastPointX = last(rangeChartNetworthData.filter(x => x.type === 'point')).x;
    const lastIntervalX = last(rangeChartNetworthData.filter(x => x.type === 'interval')).x;

    // Assemble the final lineChartGraph object
    const lineChartGraph = {
      minX,
      maxX,
      data: cloneChartData,
      rangeChartNetworthData,
      chartFilter: chartFilter,
      graphWidth: Math.max(lastPointX, lastIntervalX),
    };

    // Return the generated chart data
    return lineChartGraph;
  }

  // Return null if cloneChartData is empty
  return null;
};

const formatRangeChartDataV2 = ({
  data = [],
  rangeStart = new Date(),
  rangeEnd = new Date(),
  chartFilterValue = 'Y',
  viewport = 0,
}) => {
  let graphWidth = AppConstants.graphWidth;
  let _intervalData = [];
  let deltaInterval = 0;

  const filterValues = ['M', '3M', '6M', 'Y', '2Y'];
  if (filterValues.includes(chartFilterValue)) {
    let daysDiff = moment(rangeEnd).diff(moment(rangeStart), 'days');
    const rangeValues = [30, 90, 183, 365, 365 * 2];
    const index = filterValues.indexOf(chartFilterValue);
    const totalDay = rangeValues[index];
    deltaInterval = viewport / totalDay;
    graphWidth = deltaInterval * daysDiff;

    const formatIntervalLabel = (chartFilterValueProp, dayProp) => {
      let label;
      switch (chartFilterValueProp) {
        case '2Y':
        case 'Y': {
          let newMonth = dayProp;
          const newMonthIndex = newMonth.month();
          const isJanOrDec = newMonthIndex === 0 || newMonthIndex === 11;
          label = [
            newMonth.format('MMM')?.[0],
            ...(isJanOrDec ? [newMonth.format('YY')] : []),
          ].join('');
          break;
        }
        case '6M':
        case '3M':
        case 'M': {
          label = dayProp.format('D MMM');
          break;
        }

        default:
          break;
      }
      return label;
    };

    _intervalData = [...Array(daysDiff).keys()].map(dayIndex => {
      let newDay = moment(rangeStart).add(dayIndex, 'days');

      return {
        type: 'interval',
        label: formatIntervalLabel(chartFilterValue, newDay),
        x: deltaInterval * dayIndex,
        value: 0,
        date: newDay.toDate(),
      };
    });
    let indexes = ['6M', 'Y', '2Y'].includes(chartFilterValue) ? [0] : [];
    let idx = 0;
    if (['M', '3M'].includes(chartFilterValue)) {
      while (idx < _intervalData.length) {
        indexes.push(idx);
        if (chartFilterValue === 'M') {
          idx += 7; // 31 / 4
        }
        if (chartFilterValue === '3M') {
          idx += 15; // 90 / 6
        }
      }
    }
    if (['6M', 'Y', '2Y'].includes(chartFilterValue)) {
      _intervalData = _intervalData.filter(item => item.date?.getDate() === 1);
      if (['2Y'].includes(chartFilterValue)) {
        _intervalData = _intervalData.filter((_, _idx) => _idx % 2 === 0);
      }
    } else {
      _intervalData = _intervalData.filter((_, index) => indexes.includes(index));
    }
    _intervalData.push({
      type: 'interval',
      label: '',
      x: graphWidth,
      value: 0,
      date: rangeEnd,
    });
  }

  if (chartFilterValue === 'ALL') {
    let monthsDiff = Math.ceil(
      moment(rangeEnd).startOf('month').diff(moment(rangeStart).startOf('month'), 'months'),
    );

    if (monthsDiff >= 6) {
      deltaInterval = viewport / monthsDiff;
      graphWidth = viewport;

      _intervalData = [...Array(monthsDiff + 1).keys()].map(monthIndex => {
        let newMonth = moment(rangeStart).add(monthIndex, 'M');
        const newMonthIndex = newMonth.month();
        const isJanOrDec = newMonthIndex === 0 || newMonthIndex === 11;
        let label = [
          newMonth.format('MMM')?.[0],
          ...(isJanOrDec ? [newMonth.format('YY')] : []),
        ].join('');
        return {
          type: 'interval',
          label: label,
          x: deltaInterval * monthIndex,
          value: 0,
          date: newMonth.toDate(),
        };
      });

      const yearCount = Math.round(monthsDiff / 12);
      _intervalData = _intervalData.filter((_, index) => index % yearCount === 0);
    } else {
      let daysDiff = moment(rangeEnd).diff(moment(rangeStart), 'days');
      deltaInterval = viewport / daysDiff;

      graphWidth = viewport;
      _intervalData = [...Array(daysDiff).keys()].map(dayIndex => {
        let newDay = moment(rangeStart).add(dayIndex, 'days');

        let label = newDay.format('D MMM');
        return {
          type: 'interval',
          label: label,
          x: deltaInterval * dayIndex,
          value: 0,
          date: newDay.toDate(),
        };
      });
      let indexes = [];
      let idx = 0;
      while (idx < _intervalData.length) {
        indexes.push(idx);
        idx += Math.round(daysDiff / 5);
      }
      _intervalData = _intervalData.filter((x, index) => indexes.includes(index));
      const _interval = (deltaInterval * daysDiff) / 5;
      if (_interval / 2 > graphWidth - (last(_intervalData)?.x || 0)) {
        _intervalData = _intervalData.filter((_, _idx) => _idx !== _intervalData.length - 1);
      }
    }
    _intervalData.push({
      type: 'interval',
      label: chartFilterValue === 'ALL' ? '' : moment(rangeEnd).format('D MMM'),
      x: graphWidth,
      value: 0,
      date: rangeEnd,
    });
  }

  // NOTE: data = [{ label: "", value: 0, generatedDate: new Date() }]
  const lineChartPoints = formatLineChartPoints({
    graphWidth: graphWidth,
    field: 'value',
    records: data.map(item => ({
      ...item,
      generatedDate: new Date(item.generatedDate) ?? new Date(),
    })),
    rangeStart: new Date(rangeStart) ?? new Date(),
    rangeEnd: new Date(rangeEnd) ?? new Date(),
    removeLastPoint: true,
  });
  const _pointData = lineChartPoints.map(item => ({
    type: 'point',
    x: item?.x,
    value: item?.y,
    date: item?.date,
  }));

  const rangeChartNetworthData = concat(_pointData, _intervalData);
  return rangeChartNetworthData;
};

const generateDataForStackedBarChart = ({
  records = [],
  rangeStart = new Date(),
  rangeEnd = new Date(),
  range,
}) => {
  if (isEmpty(records)) {
    return [];
  }
  const addMonth = date => {
    if (date) {
      const d = new Date(date.getTime());
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);
      return d;
    }
    return date;
  };

  const monthMax = {};

  for (const r of records) {
    const yyyymm = moment(new Date(r.label)).format('yyyy-MM');
    if (!monthMax[yyyymm] || new Date(r.label) > new Date(monthMax[yyyymm].label)) {
      monthMax[yyyymm] = r;
    }
  }

  const compareMonthYear = (first, second) => {
    if (isDate(first) && isDate(second)) {
      return moment(first).format('yyyy-MM-DD') <= moment(second).format('yyyy-MM-DD');
    }
    return false;
  };

  let currentMonth = compareMonthYear(addMonth(rangeStart), rangeEnd)
    ? addMonth(rangeStart)
    : rangeStart;
  let lastValue = compareMonthYear(new Date(records[0]?.label), rangeStart)
    ? records[0]
    : undefined;

  if (range === 'MAX') {
    currentMonth = rangeStart;
  }
  if (range === '1M' && records.length > 0 && isNil(lastValue)) {
    let previousYYYYMM = records[0]?.label?.substr(0, 7);
    lastValue = monthMax[previousYYYYMM];
  }

  const values = [];
  while (compareMonthYear(currentMonth, rangeEnd)) {
    const _yyyymm = moment(currentMonth).format('yyyy-MM');
    lastValue = monthMax[_yyyymm] || lastValue;
    if (lastValue) {
      values.push({ ...lastValue, label: currentMonth });
    }

    currentMonth = addMonth(currentMonth);
  }

  return values;
};

const dateUTCAsAt = _date => {
  let date = _date;
  if (typeof _date === 'number' || typeof _date === 'string') {
    date = new Date(_date);
  }
  if (!isDate(date)) {
    date = new Date();
  }
  return new Date(
    `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
      .getDate()
      .toString()
      .padStart(2, '0')}T00:00:00.000Z`,
  );
};

const animateTopBar = (
  topBarHeight,
  heightValue,
  animatedHeight,
  animatedHeightValue,
  onAnimationEnd,
) => {
  Animated.parallel([
    Animated.timing(topBarHeight, {
      toValue: heightValue,
      duration: 100,
      useNativeDriver: false,
    }),
    Animated.timing(animatedHeight, {
      toValue: animatedHeightValue,
      duration: 100,
      useNativeDriver: false,
    }),
  ]).start(onAnimationEnd);
};

const safePositiveValue = value => (isNaN(value) ? 0 : value > 0 ? value : 0);

export default {
  contrastColor,
  lightenBackground,
  lightenText,
  darkenBackground,
  darkenText,
  darkenBorder,
  lightenBackgroundValue,
  darkenBackgroundValue,
  formatDateTime,
  formatCurrency,
  formatNumber,
  compareDate,
  diffDate,
  mergeArrayObjectIntoObject,
  openInAppBrowserLink,
  isSupportedVersion,
  composeWithRef,
  formatOrdinalNumber,
  hexToRGBA,
  handleConditionLogicDynamicForm,
  mapDataForDropdown,
  getColorByIndex,
  getFieldFromFormJSON,
  getConditionObjectFromJSON,
  generateObjectForDropdown,
  renameKeys,
  toastErrorMsg,
  sortDataTaxReturn,
  handleEditOwnership,
  getFYTaxReturnByValue,
  generateTaxReturnData,
  handleDataTaxReturnByAmount,
  handleCheckValueStep2,
  handleConfigureNextLayoutAnimation,
  getCardItemDefaultValuesFromAPI,
  formatBracketsCurrency,
  checkEmptyButNotZero,
  formatWealthChartLabel,
  formatCurrencyWithCompact,

  formatLineChartPoints,
  formatLineChartIntervals,
  formatRangeChartData,
  formatRangeChartDataV2,
  getChartGraph,
  getChartGraphV2,

  generateDataForStackedBarChart,
  dateUTCAsAt,

  animateTopBar,
  safePositiveValue,
};
