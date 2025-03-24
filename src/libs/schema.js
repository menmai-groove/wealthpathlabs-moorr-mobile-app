import i18n from 'bootstrap/i18n';
import { AppConfigs, AppConstants } from 'constant';
import { ValidatorLib } from 'libs';
import { formatNumber } from 'libs/util';
import { isEmpty, isNaN, isNumber } from 'lodash';
import { addMethod, array, boolean, date, number, object, ref, string } from 'yup';

addMethod(string, 'validatePassword', function (errorMessage) {
  return this.test('test-validate-password', errorMessage, function (value) {
    const { path, createError } = this;
    if (!ValidatorLib.checkPassword(value)) {
      return createError({ path, message: errorMessage });
    }
    return true;
  });
});

addMethod(string, 'decimalFormat', function (errorMessage) {
  return this.test('test-decimal-format', errorMessage, function (value) {
    const { path, createError } = this;
    if (!isEmpty(value) && !ValidatorLib.checkNumeric(value.trim())) {
      return createError({ path, message: errorMessage });
    }
    return true;
  });
});

addMethod(string, 'integerFormat', function (errorMessage) {
  return this.test('test-integer-format', errorMessage, function (value) {
    const { path, createError } = this;
    if (!ValidatorLib.checkInteger(value.trim())) {
      return createError({ path, message: errorMessage });
    }
    return true;
  });
});

addMethod(string, 'maxNumber', function (max, errorMessage) {
  return this.test('test-numeric-max', errorMessage, function (value) {
    const { path, createError } = this;
    if (Number(value) > max) {
      return createError({ path, message: errorMessage });
    }
    return true;
  });
});

addMethod(string, 'minNumber', function (min, errorMessage) {
  return this.test('test-numeric-min', errorMessage, function (value) {
    const { path, createError } = this;
    if (Number(value) < min) {
      return createError({ path, message: errorMessage });
    }
    return true;
  });
});

addMethod(string, 'lowerThan', function (max, errorMessage) {
  return this.test('test-numeric-lower-than', errorMessage, function (value) {
    const { path, createError } = this;
    if (Number(value) >= max) {
      return createError({ path, message: errorMessage });
    }
    return true;
  });
});

addMethod(string, 'greaterThan', function (min, errorMessage) {
  return this.test('test-numeric-greater-than', errorMessage, function (value) {
    const { path, createError } = this;
    if (Number(value) <= min) {
      return createError({ path, message: errorMessage });
    }
    return true;
  });
});

addMethod(object, 'requiredDropdown', function (errorMessage) {
  return this.test('test-required-dropdown', errorMessage, function (value) {
    const { path, createError } = this;
    if (value == null || value?.value == null || value?.value === '') {
      return createError({ path, message: errorMessage });
    }
    return true;
  });
});
addMethod(object, 'requiredAddress', function (errorMessage) {
  return this.test('test-required-address', errorMessage, function (value) {
    const { path, createError } = this;
    if (value == null || isEmpty(value?.formatted)) {
      return createError({ path, message: errorMessage });
    }
    return true;
  });
});

addMethod(object, 'validateAddress', function (errorMessage) {
  return this.test('test-valid-address', errorMessage, function (value) {
    const { path, createError } = this;
    if (value === null) {
      return true;
    }
    const { formatted, ...restValue } = value;
    if (!isEmpty(formatted) && isEmpty(restValue)) {
      return createError({ path, message: errorMessage });
    }
    return true;
  });
});

addMethod(string, 'checkEmail', function (errorMessage) {
  return this.test('test-validate-email', errorMessage, function (value) {
    const { path, createError } = this;
    if (!ValidatorLib.checkEmail(value)) {
      return createError({ path, message: errorMessage });
    }
    return true;
  });
});

addMethod(object, 'validateInterestRate', function (errorMessage) {
  return this.test('test-valid-interestRate', errorMessage, function (value) {
    const { path, createError } = this;
    if (value === null) {
      return createError({ path, message: { interestRate: errorMessage } });
    }
    const { interestRate, baseRate, discountRate } = value;
    const errors = {};
    let isValid = true;
    if (!isEmpty(interestRate)) {
      if (isNaN(Number(interestRate))) {
        errors.interestRate = i18n.t('forms.validation.number');
        isValid = false;
      } else if (Number(interestRate) > 100) {
        errors.interestRate = i18n.t('forms.validation.maximumRequired', { max: 100 });
        isValid = false;
      }
    }
    if (!isEmpty(baseRate) && isNaN(Number(baseRate))) {
      errors.baseRate = i18n.t('forms.validation.number');
      isValid = false;
    } else if (Number(baseRate) > 100) {
      errors.baseRate = i18n.t('forms.validation.maximumRequired', { max: 100 });
      isValid = false;
    }
    if (!isEmpty(discountRate) && isNaN(Number(discountRate))) {
      errors.discountRate = i18n.t('forms.validation.number');
      isValid = false;
    } else if (Number(discountRate) > 100) {
      errors.discountRate = i18n.t('forms.validation.maximumRequired', { max: 100 });
      isValid = false;
    }
    if (errorMessage && isEmpty(interestRate)) {
      errors.interestRate = errorMessage;
      isValid = false;
    }
    return isValid ? true : createError({ path, message: errors });
  });
});

const getSchemaField = field => {
  switch (field) {
    case 'email':
      return string()
        .checkEmail(i18n.t('screens.login.invalidEmail'))
        .required(i18n.t('screens.login.requiredEmail'));
    case 'password':
      return string().validatePassword(i18n.t('screens.login.invalidPassword'));
    case 'currentPassword':
      return string().required(i18n.t('screens.login.requiredPassword'));
    case 'confirmPassword':
      return string()
        .required(i18n.t('screens.signup.requiredConfirmPassword'))
        .oneOf([ref('password')], i18n.t('screens.signup.mismatchPassword'));
    case 'termCondition':
      return boolean().isTrue(i18n.t('screens.signup.requiredTermCondition'));
    case 'acknowledgePolicy':
      return boolean().isTrue(i18n.t('screens.signup.requiredAcknowledgePolicy'));
    case 'fName':
      return string()
        .required(i18n.t('screens.onBoardingInterview.requiredFirstName'))
        .max(50, i18n.t('screens.onBoardingInterview.askingName.fNameMaxLength', { number: 50 }));
    case 'dependantKid':
      return string()
        .trim()
        .required(i18n.t('forms.validation.number'))
        .integerFormat(i18n.t('forms.validation.integerNumber'))
        .minNumber(1, i18n.t('forms.validation.minimumRequired', { min: 1 }))
        .maxNumber(
          AppConfigs.maximumDependant,
          i18n.t('forms.validation.dependantKidMaximumRequired', {
            max: AppConfigs.maximumDependant,
          }),
        );
    case 'numberOfItem':
      return string()
        .trim()
        .integerFormat(i18n.t('forms.validation.integerNumber'))
        .minNumber(0, i18n.t('forms.validation.rangeRequired', { min: 0, max: 100 }))
        .maxNumber(100, i18n.t('forms.validation.rangeRequired', { min: 0, max: 100 }));
    case 'newPassword':
      return string()
        .notOneOf([ref('currentPassword')], i18n.t('screens.changePassword.matchCurrentPassword'))
        .validatePassword(i18n.t('screens.changePassword.invalidNewPassword'));
    case 'confirmNewPassword':
      return string()
        .required(i18n.t('screens.changePassword.requiredConfirmNewPassword'))
        .oneOf([ref('newPassword')], i18n.t('screens.changePassword.mismatchNewPassword'));
    case 'firstName':
      return string().required(i18n.t('screens.profile.requiredFirstName'));
    case 'lastName':
      return string().required(i18n.t('screens.profile.requiredLastName'));
    case 'dob':
      return date()
        .nullable()
        .transform(v => (v instanceof Date && !isNaN(v) ? v : null))
        .required(i18n.t('screens.profile.requiredDob'));
    case 'household':
      return number();
    case 'displayHouseholdDetails':
      return boolean();
    case 'partnerFirstName':
      return string().when(['household'], {
        is: household => [1, 3].some(hh => hh === household),
        then: string().required(i18n.t('screens.profile.requiredPartnerFirstName')),
      });
    case 'partnerLastName':
      return string().when(['household'], {
        is: household => [1, 3].some(hh => hh === household),
        then: string().required(i18n.t('screens.profile.requiredPartnerLastName')),
      });
    case 'partnerDob':
      return date()
        .nullable()
        .transform(v => (v instanceof Date && !isNaN(v) ? v : null))
        .when(['household'], {
          is: household => [1, 3].some(hh => hh === household),
          then: date()
            .nullable()
            .transform(v => (v instanceof Date && !isNaN(v) ? v : null))
            .required(i18n.t('screens.profile.requiredPartnerDob')),
        });
    case 'partnerEmail':
      return string().email(i18n.t('screens.householdDetail.requiredPartnerEmail'));
    case 'mPhone':
    case 'partnerMPhone':
      return string().max(30, i18n.t('screens.profile.requiredPartnerMPhone', { max: 30 }));
    case 'partnerNoOfKids':
      return string().when(['household'], {
        is: household => [2, 3].some(hh => hh === household),
        then: string()
          .required(i18n.t('screens.profile.requiredPartnerNoOfKids'))
          .minNumber(1, i18n.t('forms.validation.minimumRequired', { min: 1 })),
      });
    case 'annualIncome':
      return string()
        .required(i18n.t('forms.income.annualIncomeRequired'))
        .decimalFormat(i18n.t('forms.validation.number'))
        .minNumber(
          AppConstants.currencyValue.min,
          i18n.t('forms.validation.rangeRequired', {
            min: AppConstants.currencyValue.min,
            max: formatNumber(AppConstants.currencyValue.max),
          }),
        )
        .maxNumber(
          AppConstants.currencyValue.max,
          i18n.t('forms.validation.rangeRequired', {
            min: AppConstants.currencyValue.min,
            max: formatNumber(AppConstants.currencyValue.max),
          }),
        );
    case 'incomeType':
      return object().nullable().requiredDropdown(i18n.t('forms.income.incomeTypeRequired'));
    case 'ownership':
      return object().nullable().requiredDropdown(i18n.t('forms.income.ownershipRequired'));
    case 'ownershipStructure':
      return object()
        .nullable()
        .when(['incomeType'], {
          is: incomeType => incomeType?.value === AppConstants.IncomeType.Business,
          then: object()
            .nullable()
            .requiredDropdown(i18n.t('forms.income.ownershipStructureRequired')),
        });
    case 'cardName':
      return string().required(i18n.t('screens.income.requiredCardName'));
    default:
      return 'Schema not found';
  }
};

const getSchemaModal = items => {
  const shapeObj = {};
  for (let i in items) {
    shapeObj[items[i]] = getSchemaField(items[i]);
  }
  return object().shape(shapeObj);
};

const tranformNestedField = dataLayout => {
  const obj = {};
  let totalFields = [];
  dataLayout?.forEach(group => {
    group.fields.forEach(field =>
      field.component === 'asAt' ? totalFields.push(field.fields) : totalFields.push(field),
    );
  });
  totalFields = totalFields.flat();

  totalFields.forEach(item => {
    const nestedKeys = item.id.split('.');
    if (!obj.hasOwnProperty(nestedKeys[0])) {
      obj[nestedKeys[0]] = {};
    }
    let nestedObj = obj;
    nestedKeys.forEach((subKey, index) => {
      if (index === nestedKeys.length - 1) {
        nestedObj[subKey] = { ...item, id: subKey };
      } else if (!nestedObj.hasOwnProperty(subKey)) {
        nestedObj[subKey] = {};
      }
      nestedObj = nestedObj[subKey];
    });
  });
  return obj;
};

const getSchemaMinMaxValue = (schema, field) => {
  if (field?.formatData === 'currency') {
    const maxValue = isNumber(field?.maxValue) ? field.maxValue : AppConstants.currencyValue.max;
    const minValue = isNumber(field?.minValue) ? field.minValue : AppConstants.currencyValue.min;
    const message = i18n.t('forms.validation.rangeRequired', {
      max: formatNumber(maxValue),
      min: formatNumber(minValue),
    });
    return schema.maxNumber(maxValue, message).minNumber(minValue, message);
  }
  // Validation with min/max value
  if (isNumber(field?.maxValue) && isNumber(field?.minValue)) {
    const message = i18n.t('forms.validation.rangeRequired', {
      max: formatNumber(field.maxValue),
      min: formatNumber(field.minValue),
    });
    return schema.maxNumber(field.maxValue, message).minNumber(field.minValue, message);
  } else if (isNumber(field?.maxValue)) {
    const message = i18n.t('forms.validation.maximumRequired', {
      max: formatNumber(field.maxValue),
    });
    return schema.maxNumber(field.maxValue, message);
  } else if (isNumber(field?.minValue)) {
    const message = i18n.t('forms.validation.minimumRequired', {
      min: formatNumber(field.minValue),
    });
    return schema.minNumber(field.minValue, message);
  }
  // Validation with greaterThan/lowerThan value
  if (isNumber(field?.greaterThan) && isNumber(field?.lowerThan)) {
    const message = i18n.t('forms.validation.rangeLessMoreRequired', {
      max: formatNumber(field.lowerThan),
      min: formatNumber(field.greaterThan),
    });
    return schema.lowerThan(field.lowerThan, message).greaterThan(field.greaterThan, message);
  } else if (isNumber(field?.lowerThan)) {
    const message = i18n.t('forms.validation.lessThanRequired', {
      max: formatNumber(field.lowerThan),
    });
    return schema.lowerThan(field.lowerThan, message);
  } else if (isNumber(field?.greaterThan)) {
    const message = i18n.t('forms.validation.moreThanRequired', {
      min: formatNumber(field.greaterThan),
    });
    return schema.greaterThan(field.greaterThan, message);
  }
  return schema;
};

const getSchemaFieldRecursive = (nestedObj, customValidations, keys = []) => {
  const shapeObj = {};
  for (let key in nestedObj) {
    const field = nestedObj[key];
    if (!field.component) {
      shapeObj[key] = getSchemaFieldRecursive(field, customValidations, keys.concat(key));
    } else if (field.visible || field.shouldVisible) {
      let schema = null;
      switch (field.dataType) {
        case 'boolean':
          schema = boolean();
          break;
        case 'string':
          schema = string();
          break;
        case 'date':
          schema = date()
            .nullable()
            .transform(v => (v instanceof Date && !isNaN(v) ? v : null));
          break;
        case 'number':
          if (field.readonly) {
            schema = string().nullable();
          } else {
            schema = string().decimalFormat(i18n.t('forms.validation.number'));
            schema = getSchemaMinMaxValue(schema, field);
          }
          break;
        case 'landSize':
          schema = object()
            .nullable()
            .shape({
              landSize: string()
                .nullable()
                .decimalFormat(i18n.t('forms.validation.number'))
                .minNumber(0, i18n.t('forms.validation.rangeRequired', { min: 0, max: 1000000 }))
                .maxNumber(
                  1000000,
                  i18n.t('forms.validation.rangeRequired', { min: 0, max: 1000000 }),
                ),
            });
          break;
        case 'integer':
          if (field.readonly) {
            schema = string().nullable();
          } else {
            schema = string().integerFormat(i18n.t('forms.validation.integerNumber'));
            schema = getSchemaMinMaxValue(schema, field);
          }
          break;
        default:
          break;
      }
      if (field.component === 'dropdown') {
        if (field.multiple) {
          schema = array();
        } else {
          schema = object().nullable();
        }
      }
      if (field.component === 'address-autocomplete') {
        schema = object().nullable().validateAddress(i18n.t('forms.validation.invalidAddress'));
      }
      if (field.component === 'industry-autocomplete') {
        schema = object()
          .nullable()
          .shape({
            searchText: string()
              .nullable()
              .max(100, i18n.t('forms.payg.industryMaxCharacters', { number: formatNumber(100) })),
            division: string().nullable(),
            class: string().nullable(),
          });
      }
      if (field.component === 'interestRate') {
        schema = object().nullable().validateInterestRate();
      }
      if (field.component === 'pre-tax') {
        schema = array().nullable();
      }
      if (field.component === 'assessedTaxReturn') {
        schema = array()
          .nullable()
          .of(
            object().shape({
              salary: string()
                .nullable()
                .decimalFormat(i18n.t('forms.validation.number'))
                .minNumber(
                  AppConstants.currencyValue.min,
                  i18n.t('forms.validation.rangeRequired', {
                    min: AppConstants.currencyValue.min,
                    max: formatNumber(AppConstants.currencyValue.max),
                  }),
                )
                .maxNumber(
                  AppConstants.currencyValue.max,
                  i18n.t('forms.validation.rangeRequired', {
                    min: AppConstants.currencyValue.min,
                    max: formatNumber(AppConstants.currencyValue.max),
                  }),
                ),
            }),
          );
      }
      if (!isEmpty(schema)) {
        field?.validation?.map(validate => {
          switch (validate.type) {
            case 'required':
              if (field.component === 'dropdown') {
                if (field.multiple) {
                  schema = schema.min(1, i18n.t(validate.message));
                } else {
                  schema = schema.requiredDropdown(i18n.t(validate.message));
                }
                break;
              }
              if (field.component === 'address-autocomplete') {
                schema = schema.requiredAddress(i18n.t(validate.message));
                break;
              }
              if (field.dataType === 'boolean') {
                schema = schema.isTrue(i18n.t(validate.message));
                break;
              }
              schema = schema.required(i18n.t(validate.message));
              break;
            case 'email':
              schema = schema.email(i18n.t(validate.message));
              break;
            case 'match':
              schema = schema.oneOf([ref(validate.field)], i18n.t(validate.message));
              break;
            case 'maxChar':
              schema = schema.max(
                validate.number,
                i18n.t(validate.message, { number: formatNumber(validate.number) }),
              );
              break;
            case 'maximumRequired':
              schema = schema.maxNumber(
                validate.max,
                i18n.t(validate.message, { max: formatNumber(validate.max) }),
              );
              break;
            case 'minimumRequired':
              schema = schema.minNumber(
                validate.min,
                i18n.t(validate.message, { min: formatNumber(validate.min) }),
              );
              break;
            case 'rangeRequired':
              const message = i18n.t(validate.message, {
                min: formatNumber(validate.min),
                max: formatNumber(validate.max),
              });
              schema = schema.maxNumber(validate.max, message).minNumber(validate.min, message);
              break;
            case 'typeValue':
              if (field.component === 'address-autocomplete') {
                schema = schema.validateAddress(i18n.t(validate.message));
                break;
              }
              if (field.component === 'interestRate') {
                schema = schema.validateInterestRate(i18n.t(validate.message));
                break;
              }
              break;
            default:
              break;
          }
        });
        let customValFn = customValidations[keys.concat(field.id).join('.')];
        if (typeof customValFn === 'function') {
          schema = customValFn(schema);
        }
        shapeObj[field.id] = schema;
      }
    }
  }
  return object().shape(shapeObj);
};

const getSchemaDynamicForm = (data, customValidations = {}) => {
  if (!isEmpty(data)) {
    const nestedObj = tranformNestedField(data.layout);
    return getSchemaFieldRecursive(nestedObj, customValidations);
  }
  return object().shape({});
};

const loginSchema = getSchemaModal(['email', 'currentPassword']);
const registerSchema = getSchemaModal([
  'email',
  'password',
  'confirmPassword',
  'termCondition',
  // 'acknowledgePolicy',
]);
const requestPassword = getSchemaModal(['email']);
const changePassword = getSchemaModal(['currentPassword', 'newPassword', 'confirmNewPassword']);
const onBoardingInterviewSchema = {
  askingName: getSchemaModal(['fName']),
  householdKid: getSchemaModal(['dependantKid']),
  householdPartner: getSchemaModal(['fName']),
  numberOfItem: getSchemaModal(['numberOfItem']),
};
const updateProfileSchema = getSchemaModal(['firstName', 'lastName', 'dob', 'household', 'mPhone']);
const updateHouseholdSchema = getSchemaModal(['partnerEmail', 'partnerMPhone']);
const addEditIncome = getSchemaModal([
  'annualIncome',
  'incomeType',
  'ownership',
  'ownershipStructure',
]);

const setupExpense = object().shape({
  essential: string()
    .notRequired()
    .decimalFormat(i18n.t('forms.validation.number'))
    .minNumber(
      AppConstants.currencyValue.min,
      i18n.t('forms.validation.rangeRequired', {
        min: AppConstants.currencyValue.min,
        max: formatNumber(AppConstants.currencyValue.max),
      }),
    )
    .maxNumber(
      AppConstants.currencyValue.max,
      i18n.t('forms.validation.rangeRequired', {
        min: AppConstants.currencyValue.min,
        max: formatNumber(AppConstants.currencyValue.max),
      }),
    ),
  discretionary: string()
    .notRequired()
    .decimalFormat(i18n.t('forms.validation.number'))
    .minNumber(
      AppConstants.currencyValue.min,
      i18n.t('forms.validation.rangeRequired', {
        min: AppConstants.currencyValue.min,
        max: formatNumber(AppConstants.currencyValue.max),
      }),
    )
    .maxNumber(
      AppConstants.currencyValue.max,
      i18n.t('forms.validation.rangeRequired', {
        min: AppConstants.currencyValue.min,
        max: formatNumber(AppConstants.currencyValue.max),
      }),
    ),
  frequency: object()
    .nullable()
    .requiredDropdown(i18n.t('forms.spending-telling.frequencyRequired')),
});

const addEditPersonalGoal = object().shape({
  description: string()
    .trim()
    .required(i18n.t('screens.personalGoal.addPersonalGoal.requiredGoal')),
  dueDate: date()
    .nullable()
    .transform(v => (v instanceof Date && !isNaN(v) ? v : null))
    .required(i18n.t('screens.personalGoal.addPersonalGoal.requiredDate')),
  colour: string().required(i18n.t('screens.personalGoal.addPersonalGoal.requiredColor')),
  value: string()
    .trim()
    .decimalFormat(i18n.t('forms.validation.number'))
    .minNumber(0, i18n.t('forms.validation.minimumRequired', { min: 0 }))
    .maxNumber(
      100000000,
      i18n.t('forms.validation.maximumRequired', {
        max: formatNumber(100000000),
      }),
    ),
});

const getFormErrorFieldIds = (obj = {}, path = '') => {
  const output = [];
  for (let k in obj) {
    const objK = obj[k];
    if (objK.message && objK.message instanceof Object) {
      output.push(...getFormErrorFieldIds(objK.message, `${path}.${k}`));
    } else if (objK.message) {
      output.push(`${path}.${k}`.substring(1));
    } else if (typeof objK === 'string') {
      output.push(`${path}.${k}`.substring(1));
    } else if (objK instanceof Array) {
      for (let i in objK) {
        output.push(...getFormErrorFieldIds(objK[i], `${path}.${k}[${i}]`));
      }
    } else if (objK instanceof Object) {
      output.push(...getFormErrorFieldIds(objK, `${path}.${k}`));
    }
  }
  return output;
};

const addNewIncome = object().shape({
  name: string(),
});
const addNewAsset = object().shape({
  name: string(),
});
const addNewBorrowing = object().shape({
  name: string(),
});

const addNewExpense = object().shape({
  name: string(),
});

export default {
  loginSchema,
  getSchemaDynamicForm,
  registerSchema,
  requestPassword,
  changePassword,
  onBoardingInterviewSchema,
  updateProfileSchema,
  updateHouseholdSchema,
  addEditIncome,
  setupExpense,
  addEditPersonalGoal,
  addNewIncome,
  addNewAsset,
  getFormErrorFieldIds,
  addNewBorrowing,
  addNewExpense,
};
