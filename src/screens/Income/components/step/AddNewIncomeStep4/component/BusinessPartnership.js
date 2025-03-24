import DynamicForm from 'components/basics/DynamicForm';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import { cloneDeep, get, isEmpty, merge, omit, toNumber } from 'lodash';
import moment from 'moment';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { RECORD_TYPE } from 'screens/HistoricalLog';
import AssessedTaxReturn from 'screens/Income/components/AssessedTaxReturn';
import {
  selectAssessedTaxReturn,
  selectEmploymentBasis,
  selectFlags,
  selectFrequency,
  selectOwnersWithoutJoint,
  selectUser,
} from 'store/Auth/selector';
import getModule from 'store/Income/module';
import {
  selectIncomeDetails,
  selectIncomeName,
  selectIncomeOwnership,
  selectIncomeOwnershipStructure,
  selectIncomeType,
} from 'store/Income/selector';

const formatFormJson = require('assets/forms/layouts/create_business_partnership.json');
function BusinessPartnership({
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
  const dataAssessedTaxReturn = useSelector(selectAssessedTaxReturn);
  const incomeOwnership = useSelector(selectIncomeOwnership);
  const incomeOwnershipStructure = useSelector(selectIncomeOwnershipStructure);
  const incomeDetails = useSelector(selectIncomeDetails);
  const flags = useSelector(selectFlags);
  const dataTaxReturn = editIncome
    ? UtilLib.sortDataTaxReturn(get(incomeDetails, [0, 'assessedTaxReturn']))
    : [];

  const handledData = useCallback(
    field => {
      switch (field.id) {
        case 'ownership':
          field.options = userOwnerships;
          field.value = incomeOwnership;
          break;

        case 'paymentFrequency':
          field.options = frequencies;
          if (flags.nextDates) {
            field.onChange = paymentFrequencyOnChange;
          }
          if (!isEmpty(field.value)) {
            field.value = frequencies.find(type => type.value === field.value?.value);
          }
          break;
        case 'basis':
          field.options = employmentBasis;
          break;
        case 'name':
          field.value = nameIncome || '';
          break;
        case 'assessedTaxReturn':
          field.value = UtilLib.generateTaxReturnData({ FY: get(dataAssessedTaxReturn, 0) });
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
      dataAssessedTaxReturn,
      employmentBasis,
      frequencies,
      incomeOwnership,
      nameIncome,
      t,
      user,
      userOwnerships,
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
    if (flags.nextDates) {
      const nextPayDateField = UtilLib.getFieldFromFormJSON(formLayout, 'nextPayDate');
      nextPayDateField.visible = true;
      nextPayDateField.minDate = UtilLib.dateUTCAsAt(Date.now());
    }
    if (editIncome) {
      const {
        _id,
        paymentFrequency,
        name,
        notes,
        startDate,
        ownership,
        business,
        amount,
        amountAsAt,
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

      const paymentFrequencys = UtilLib.getFieldFromFormJSON(formLayout, 'paymentFrequency');
      const indexPaymentFrequency = frequencies?.findIndex(
        item => item?.value === paymentFrequency,
      );
      paymentFrequencys.value = frequencies[indexPaymentFrequency] || null;

      UtilLib.getFieldFromFormJSON(formLayout, 'name').value = name || '';
      UtilLib.getFieldFromFormJSON(formLayout, 'notes').value = notes || '';
      UtilLib.getFieldFromFormJSON(formLayout, 'startDate').value = startDate;
      UtilLib.getFieldFromFormJSON(formLayout, 'natureOfBusiness').value = `${
        business?.nature || ''
      }`;
      if (flags.nextDates) {
        const nextPayDateField = UtilLib.getFieldFromFormJSON(formLayout, 'nextPayDate');
        nextPayDateField.visible = true;
        nextPayDateField.value = nextPayDate ? moment(nextPayDate).toDate() : '';
      }
      if (flags.asAtMigrationIncome) {
        const amountForm = UtilLib.getFieldFromFormJSON(formLayout, 'amount');
        amountForm.value = amount || '';
        const amountAsAtForm = UtilLib.getFieldFromFormJSON(formLayout, 'amountAsAt');
        amountAsAtForm.lastDate = amountAsAtForm.value = amountAsAt || null;
        amountAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'amount',
          category: 'Income',
          type: incomeType,
          recordType: RECORD_TYPE.NUMBER,
        };
        const totalAnnual = UtilLib.getFieldFromFormJSON(formLayout, 'totalAnnual');
        if (totalAnnual) {
          totalAnnual.value = parseFloat(amount).toString();
        }
      } else {
        const assessedTax = UtilLib.getFieldFromFormJSON(formLayout, 'assessedTaxReturn');
        assessedTax.value = [dataTaxReturn?.dataCurrentYear, dataTaxReturn?.dataLastYear];
        UtilLib.getFieldFromFormJSON(formLayout, 'totalAnnual').value = `${
          dataTaxReturn?.dataCurrentYear?.salary ?? ''
        }`;
      }
    }
    if (flags.asAtMigrationIncome) {
      const assessedTax = UtilLib.getFieldFromFormJSON(formLayout, 'assessedTaxReturn');
      assessedTax.visible = false;
      UtilLib.handleConditionLogicDynamicForm(formLayout, jsonObject.conditional);
      return { layout: formLayout, conditional: jsonObject.conditional };
    } else {
      const amountAsAtForm = UtilLib.getFieldFromFormJSON(formLayout, 'amountAsAt');
      amountAsAtForm.visible = false;
    }
    return { layout: formLayout };
  }, [
    editIncome,
    flags,
    handledData,
    incomeDetails,
    userOwnerships,
    frequencies,
    incomeType,
    dataTaxReturn,
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
      basis: editIncome
        ? merge({}, get(incomeDetails, [0, 'basis']), {
            details: {
              ownershipStructure: incomeOwnershipStructure?.value,
            },
          })
        : {
            details: {
              ownershipStructure: incomeOwnershipStructure?.value,
            },
          },
      name: data?.name,
      probationMonthsRemaining: 5,
      notes: data?.notes,
      type: incomeType,
      startDate: data?.startDate,
      business: editIncome
        ? merge({}, get(incomeDetails, [0, 'business']), {
            nature: data?.natureOfBusiness,
          })
        : {
            nature: data?.natureOfBusiness,
          },
      assessedTaxReturn: UtilLib.generateTaxReturnData({
        dataFormAssessedTaxReturn: data?.assessedTaxReturn,
      }),
      frequency: AppConstants.defaultIncomeFrequency,

      paymentFrequency: data?.paymentFrequency?.value,

      _id: editIncome ? get(incomeDetails, [0, '_id']) : AppConstants.newObjectID,
      nextPayDateStart: data?.nextPayDate ? UtilLib.dateUTCAsAt(data?.nextPayDate) : null,
    };
    if (!editIncome) {
      dataConvert.isCurrent = true;
    }
    if (flags.asAtMigrationIncome) {
      dataConvert.assessedTaxReturn = [];
      dataConvert.amount = UtilLib.checkEmptyButNotZero(data.amount) ? null : toNumber(data.amount);
      dataConvert.amountAsAt = data.amountAsAt || null;
    }
    return dataConvert;
  };
  const isCustomComponent = useCallback(componentName => {
    switch (componentName) {
      case 'assessedTaxReturn':
        return true;

      default:
        return false;
    }
  }, []);
  const renderCustomComponent = useCallback(
    (control, field, _props = {}, options = {}) => {
      const { onChange, value } = _props;
      const { getErrorInfo = () => {}, getTotalAnual = () => {}, updateDataFormErrors } = options;
      switch (field.component) {
        case 'assessedTaxReturn':
          return (
            <AssessedTaxReturn
              onChangeValue={onChange}
              error={getErrorInfo(field?.id)}
              getTotalAnual={getTotalAnual}
              valueProps={value}
              control={control}
              lableType={field?.lableType}
              updateDataFormErrors={updateDataFormErrors}
              field={field}
              disabled={disabled}
            />
          );

        default:
          return null;
      }
    },
    [disabled],
  );
  return (
    <DynamicForm
      ref={formRef}
      data={dataForm}
      conditionLogics={formatFormJson.conditional}
      onSubmit={async (formData, callback) => {
        if (typeof onSubmit === 'function') {
          await onSubmit();
        }
        const dataNew = converKeyForm(formData);
        onSubmitForm(dataNew, callback);
      }}
      onFirstTimeDataChange={onFirstTimeDataChange}
      isCustomComponent={isCustomComponent}
      renderCustomComponent={renderCustomComponent}
      onError={onErrorForm}
      disabled={disabled}
    />
  );
}

export default compose(
  withTranslation(),
  withDynamicModuleLoader(getModule()),
)(BusinessPartnership);
