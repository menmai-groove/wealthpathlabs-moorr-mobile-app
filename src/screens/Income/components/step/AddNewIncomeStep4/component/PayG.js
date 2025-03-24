import DynamicForm from 'components/basics/DynamicForm';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import { cloneDeep, get, isEmpty, omit, sumBy, toNumber } from 'lodash';
import moment from 'moment';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { RECORD_TYPE } from 'screens/HistoricalLog';
import AddPreTax from 'screens/Income/components/AddPreTax';
import IndustryAutocomplete from 'screens/Income/components/IndustryAutocomplete';
import {
  selectAssessedTaxReturn,
  selectEmploymentBasis,
  selectFlags,
  selectFrequency,
  selectOwnershipStructure,
  selectOwnersWithoutJoint,
  selectUser,
} from 'store/Auth/selector';
import getModule from 'store/Income/module';
import {
  selectIncomeDetails,
  selectIncomeName,
  selectIncomeOwnership,
  selectIncomeType,
} from 'store/Income/selector';

const formatFormJson = require('assets/forms/layouts/create_payg_income.json');
function PayG({
  formRef,
  onSubmitForm,
  t,
  editIncome,
  onFirstTimeDataChange,
  onErrorForm,
  disabled,
  onSubmit,
  paymentFrequencyOnChange,
}) {
  const incomeType = useSelector(selectIncomeType);
  const user = useSelector(selectUser);
  const nameIncome = useSelector(selectIncomeName);
  const userOwnerships = useSelector(selectOwnersWithoutJoint);
  const frequencies = useSelector(selectFrequency);
  const employmentBasis = useSelector(selectEmploymentBasis);
  const assessedTaxReturn = useSelector(selectAssessedTaxReturn);
  const ownershipStructure = useSelector(selectOwnershipStructure);
  const incomeOwnership = useSelector(selectIncomeOwnership);
  const incomeDetails = useSelector(selectIncomeDetails);
  const { nextDates } = useSelector(selectFlags);

  const handledData = useCallback(
    field => {
      switch (field.id) {
        case 'ownership':
          field.options = userOwnerships;
          field.value = incomeOwnership;
          break;
        case 'ownershipStructure':
          field.options = ownershipStructure;
          break;
        case 'paymentFrequency':
          field.options = frequencies;
          if (nextDates) {
            field.onChange = paymentFrequencyOnChange;
          }
          if (!isEmpty(field.value)) {
            field.value = frequencies.find(type => type.value === field.value?.value);
          }
          break;
        case 'name':
          field.value = nameIncome || '';
          break;
        case 'basis':
          field.options = employmentBasis;
          break;

        case 'FY':
          field.options = assessedTaxReturn;
          field.value = get(assessedTaxReturn, 0);
          break;
        case 'moneySmarts':
          field.value =
            get(user, ['income', 0, 'moneySmarts']) || t('screens.income.primaryAccount');
          break;
        default:
          break;
      }
    },
    [
      assessedTaxReturn,
      employmentBasis,
      frequencies,
      incomeOwnership,
      nameIncome,
      ownershipStructure,
      t,
      user,
      userOwnerships,
      nextDates,
    ],
  );

  const dataForm = useMemo(() => {
    const jsonObject = cloneDeep(formatFormJson);

    let formLayout = jsonObject?.layout?.map(item => {
      item.fields.forEach(field => {
        if (field.fields) {
          field.fields.forEach(f => handledData(f));
        }
        handledData(field);
      });
      if (editIncome && item.component === 'collapse') {
        item.collapse = false;
      }
      return item;
    });
    const ownershipAsAtForm = UtilLib.getFieldFromFormJSON(formLayout, 'ownershipAsAt');
    ownershipAsAtForm.value = UtilLib.dateUTCAsAt(Date.now());
    if (nextDates) {
      const nextPayDateField = UtilLib.getFieldFromFormJSON(formLayout, 'nextPayDate');
      nextPayDateField.visible = true;
      nextPayDateField.minDate = UtilLib.dateUTCAsAt(Date.now());
    }
    if (editIncome) {
      const {
        amount,
        averageBonusPA,
        averageCommissionPA,
        averageOvertimeIncomePA,
        basis,
        employer,
        industry,
        name,
        notes,
        position,
        startDate,
        taxDeductions,
        ownership,
        paymentFrequency,
        amountAsAt,
        averageBonusPAAsAt,
        averageCommissionPAAsAt,
        averageOvertimeIncomePAAsAt,
        _id,
        nextPayDate,
      } = get(incomeDetails, [0]);

      const owner = UtilLib.getFieldFromFormJSON(formLayout, 'ownership');
      const indexOwnership = userOwnerships?.findIndex(
        item => item?.owners[0]?.owner === ownership?.owners[0]?.owner,
      );
      owner.value = userOwnerships[indexOwnership] || null;
      if (ownershipAsAtForm) {
        ownershipAsAtForm.lastDate = ownershipAsAtForm.value = ownership?.ownershipAsAt ?? null;
        ownershipAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'ownership',
          fieldName: 'Ownership',
          category: 'Income',
          type: incomeType,
          recordType: RECORD_TYPE.OWNERSHIP,
          withoutJoint: true,
        };
      }

      UtilLib.getFieldFromFormJSON(formLayout, 'name').value = name || '';

      const employment = UtilLib.getFieldFromFormJSON(formLayout, 'basis');
      const indexEmploment = employmentBasis.findIndex(item => item?.value === basis?.name);
      employment.value = employmentBasis[indexEmploment] || null;

      const indexPaymentFrequency = frequencies?.findIndex(
        item => item?.value === paymentFrequency,
      );

      UtilLib.getFieldFromFormJSON(formLayout, 'amount').value = `${amount ?? ''}`;
      const paymentFrequencies = UtilLib.getFieldFromFormJSON(formLayout, 'paymentFrequency');
      paymentFrequencies.value = frequencies[indexPaymentFrequency] || null;
      const sums = [amount, averageBonusPA, averageCommissionPA, averageOvertimeIncomePA];
      const checkEmpty = sums.some(i => !UtilLib.checkEmptyButNotZero(i));
      UtilLib.getFieldFromFormJSON(formLayout, 'totalAnnual').value = checkEmpty
        ? sumBy(sums, i => toNumber(i)).toString()
        : '';
      UtilLib.getFieldFromFormJSON(formLayout, 'averageBonusPA').value = `${averageBonusPA ?? ''}`;
      UtilLib.getFieldFromFormJSON(formLayout, 'averageCommissionPA').value = `${
        averageCommissionPA ?? ''
      }`;
      UtilLib.getFieldFromFormJSON(formLayout, 'averageOvertimeIncomePA').value = `${
        averageOvertimeIncomePA ?? ''
      }`;
      UtilLib.getFieldFromFormJSON(formLayout, 'notes').value = notes || '';

      UtilLib.getFieldFromFormJSON(formLayout, 'industry').value = {
        class: industry?.industryClass,
        division: industry?.industryDivision,
      };
      UtilLib.getFieldFromFormJSON(formLayout, 'position').value = position || '';
      UtilLib.getFieldFromFormJSON(formLayout, 'startDate').value = startDate;
      if (nextDates) {
        const nextPayDateField = UtilLib.getFieldFromFormJSON(formLayout, 'nextPayDate');
        nextPayDateField.value = nextPayDate ? moment(nextPayDate).toDate() : '';
      }
      UtilLib.getFieldFromFormJSON(formLayout, 'employer.name').value = `${employer?.name || ''}`;
      UtilLib.getFieldFromFormJSON(formLayout, 'taxDeductions').value =
        taxDeductions?.map(item => ({
          name: get(item, ['name']) || '',
          amount: get(item, ['amount']) || 0,
          frequency: get(item, ['frequency']) || '',
          amountAsAt: get(item, ['amountAsAt']) || null,
          _id: get(item, ['_id']),
        })) || [];

      const amountAsAtForm = UtilLib.getFieldFromFormJSON(formLayout, 'amountAsAt');
      if (amountAsAtForm) {
        amountAsAtForm.lastDate = amountAsAtForm.value = amountAsAt ?? null;
        amountAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'amount',
          category: 'Income',
          type: incomeType,
          recordType: RECORD_TYPE.NUMBER,
        };
      }
      const averageBonusPAAsAtForm = UtilLib.getFieldFromFormJSON(formLayout, 'averageBonusPAAsAt');
      if (averageBonusPAAsAtForm) {
        averageBonusPAAsAtForm.lastDate = averageBonusPAAsAtForm.value = averageBonusPAAsAt ?? null;
        averageBonusPAAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'averageBonusPA',
          category: 'Income',
          type: incomeType,
          recordType: RECORD_TYPE.NUMBER,
        };
      }
      const averageCommissionPAAsAtForm = UtilLib.getFieldFromFormJSON(
        formLayout,
        'averageCommissionPAAsAt',
      );
      if (averageCommissionPAAsAtForm) {
        averageCommissionPAAsAtForm.lastDate = averageCommissionPAAsAtForm.value =
          averageCommissionPAAsAt ?? null;
        averageCommissionPAAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'averageCommissionPA',
          category: 'Income',
          type: incomeType,
          recordType: RECORD_TYPE.NUMBER,
        };
      }
      const averageOvertimeIncomePAAsAtForm = UtilLib.getFieldFromFormJSON(
        formLayout,
        'averageOvertimeIncomePAAsAt',
      );
      if (averageOvertimeIncomePAAsAtForm) {
        averageOvertimeIncomePAAsAtForm.lastDate = averageOvertimeIncomePAAsAtForm.value =
          averageOvertimeIncomePAAsAt ?? null;
        averageOvertimeIncomePAAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'averageOvertimeIncomePA',
          category: 'Income',
          type: incomeType,
          recordType: RECORD_TYPE.NUMBER,
        };
      }
    }

    return { layout: formLayout };
  }, [
    editIncome,
    handledData,
    incomeDetails,
    userOwnerships,
    employmentBasis,
    frequencies,
    incomeType,
    nextDates,
  ]);
  const converKeyForm = data => {
    const ownership = editIncome
      ? UtilLib.handleEditOwnership(get(incomeDetails, [0, 'ownership']), data?.ownership)
      : data?.ownership;
    const mapDataOwners = ownership?.owners?.map(item => {
      const obj = omit(item, '__typename');
      return obj;
    });
    const dataConvert = {
      ownership: {
        ownershipDesc: ownership?.ownershipDesc,
        ownershipType: ownership?.ownershipType,
        owners: mapDataOwners,
        ownershipAsAt: data?.ownershipAsAt,
      },
      name: data?.name,
      employer: data?.employer,
      probationMonthsRemaining: 5,
      amount: !UtilLib.checkEmptyButNotZero(data?.amount) ? toNumber(data.amount) : null,
      frequency: AppConstants.defaultIncomeFrequency,
      paymentFrequency: data?.paymentFrequency?.value,
      averageBonusPA: !UtilLib.checkEmptyButNotZero(data?.averageBonusPA)
        ? toNumber(data.averageBonusPA)
        : null,
      averageCommissionPA: !UtilLib.checkEmptyButNotZero(data?.averageCommissionPA)
        ? toNumber(data.averageCommissionPA)
        : null,
      averageOvertimeIncomePA: !UtilLib.checkEmptyButNotZero(data?.averageOvertimeIncomePA)
        ? toNumber(data.averageOvertimeIncomePA)
        : null,
      basis: {
        name: data?.basis?.value,
      },
      industry: {
        industryDivision: data?.industry?.division,
        industryClass: data?.industry?.class,
      },
      notes: data?.notes,
      position: data?.position,
      taxDeductions: data?.taxDeductions,
      type: incomeType,
      startDate: data?.startDate,
      _id: editIncome ? get(incomeDetails, [0, '_id']) : AppConstants.newObjectID,
      amountAsAt: data?.amountAsAt || null,
      averageBonusPAAsAt: data?.averageBonusPAAsAt || null,
      averageCommissionPAAsAt: data?.averageCommissionPAAsAt || null,
      averageOvertimeIncomePAAsAt: data?.averageOvertimeIncomePAAsAt || null,
      nextPayDateStart: data?.nextPayDate ? UtilLib.dateUTCAsAt(data?.nextPayDate) : null,
    };
    if (!editIncome) {
      dataConvert.isCurrent = true;
    }
    return dataConvert;
  };
  const isCustomComponent = useCallback(componentName => {
    switch (componentName) {
      case 'pre-tax':
        return true;
      case 'industry-autocomplete':
        return true;
      default:
        return false;
    }
  }, []);

  const renderCustomComponent = useCallback(
    (control, field, _props = {}, options = {}) => {
      const { onChange, value, ref: componentRef } = _props;
      const { getErrorInfo = () => {}, updateDataFormErrors = () => {} } = options;

      switch (field.component) {
        case 'pre-tax':
          return (
            <View>
              <AddPreTax
                onChangeValue={onChange}
                error={getErrorInfo(field.id)?.message}
                value={value}
                disabled={disabled}
                income={get(incomeDetails, [0])}
                formParentRef={formRef.current}
              />
            </View>
          );
        case 'industry-autocomplete':
          return (
            <View>
              <IndustryAutocomplete
                value={value}
                onChangeValue={onChange}
                error={getErrorInfo(field.id)}
                ref={componentRef}
                edit={editIncome}
                control={control}
                updateDataFormErrors={updateDataFormErrors}
                disabled={disabled}
              />
            </View>
          );
        default:
          return null;
      }
    },
    [editIncome, disabled, incomeDetails, formRef],
  );
  return (
    <DynamicForm
      ref={formRef}
      data={dataForm}
      isCustomComponent={isCustomComponent}
      renderCustomComponent={renderCustomComponent}
      onSubmit={async (formData, callback) => {
        if (typeof onSubmit === 'function') {
          await onSubmit();
        }
        const dataNew = converKeyForm(formData);
        onSubmitForm(dataNew, callback);
      }}
      onFirstTimeDataChange={onFirstTimeDataChange}
      onError={onErrorForm}
      disabled={disabled}
    />
  );
}

export default compose(withTranslation(), withDynamicModuleLoader(getModule()))(PayG);
