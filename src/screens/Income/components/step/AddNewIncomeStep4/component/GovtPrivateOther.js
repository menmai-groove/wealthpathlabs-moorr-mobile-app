import DynamicForm from 'components/basics/DynamicForm';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import { cloneDeep, get, isEmpty, omit, toNumber } from 'lodash';
import moment from 'moment';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { RECORD_TYPE } from 'screens/HistoricalLog';
import {
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

const formatFormJson = require('assets/forms/layouts/create_govt_private_other.json');
function GovtPrivateOther({
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
  const ownershipStructure = useSelector(selectOwnershipStructure);
  const incomeOwnership = useSelector(selectIncomeOwnership);
  const incomeDetails = useSelector(selectIncomeDetails);
  const flags = useSelector(selectFlags);

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

        case 'moneySmarts':
          field.value =
            get(user, ['income', 0, 'moneySmarts']) || t('screens.income.primaryAccount');
          break;

        default:
          break;
      }
    },
    [
      employmentBasis,
      frequencies,
      incomeOwnership,
      nameIncome,
      ownershipStructure,
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
    const isTaxDeductibleAsAtForm = UtilLib.getFieldFromFormJSON(formLayout, 'isTaxDeductibleAsAt');
    if (flags.nextDates) {
      const nextPayDateField = UtilLib.getFieldFromFormJSON(formLayout, 'nextPayDate');
      nextPayDateField.visible = true;
      nextPayDateField.minDate = UtilLib.dateUTCAsAt(Date.now());
    }
    if (editIncome) {
      const {
        amount,
        amountAsAt,
        paymentFrequency,
        name,
        notes,
        ownership,
        isTaxDeductible,
        isTaxDeductibleAsAt,
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
      if (isTaxDeductibleAsAtForm) {
        isTaxDeductibleAsAtForm.lastDate = isTaxDeductibleAsAtForm.value =
          isTaxDeductibleAsAt ?? null;
        isTaxDeductibleAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'isTaxDeductible',
          category: 'Income',
          type: incomeType,
          recordType: RECORD_TYPE.NUMBER,
        };
      }

      UtilLib.getFieldFromFormJSON(formLayout, 'name').value = name || '';

      const paymentFrequencys = UtilLib.getFieldFromFormJSON(formLayout, 'paymentFrequency');
      const indexPaymentFrequency = frequencies?.findIndex(
        item => item?.value === paymentFrequency,
      );
      paymentFrequencys.value = frequencies[indexPaymentFrequency] || null;

      UtilLib.getFieldFromFormJSON(formLayout, 'amountGovt').value = `${amount ?? ''}`;
      const amountAsAtForm = UtilLib.getFieldFromFormJSON(formLayout, 'amountAsAt');
      amountAsAtForm.lastDate = amountAsAtForm.value = amountAsAt ?? null;
      amountAsAtForm.info = {
        cardId: _id,
        cardName: name,
        field: 'amount',
        category: 'Income',
        type: incomeType,
        recordType: RECORD_TYPE.NUMBER,
      };

      UtilLib.getFieldFromFormJSON(formLayout, 'totalAnnual').value = `${amount ?? ''}`;
      UtilLib.getFieldFromFormJSON(formLayout, 'notes').value = notes || '';
      UtilLib.getFieldFromFormJSON(formLayout, 'isTaxDeductible').value = isTaxDeductible || false;
      if (flags.nextDates) {
        const nextPayDateField = UtilLib.getFieldFromFormJSON(formLayout, 'nextPayDate');
        nextPayDateField.visible = true;
        nextPayDateField.value = nextPayDate ? moment(nextPayDate).toDate() : '';
      }
    }
    return { layout: formLayout };
  }, [editIncome, handledData, incomeDetails, userOwnerships, frequencies, incomeType]);

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
      probationMonthsRemaining: 5,
      notes: data?.notes,
      type: incomeType,
      frequency: AppConstants.defaultIncomeFrequency,

      paymentFrequency: data?.paymentFrequency?.value,
      amount: !UtilLib.checkEmptyButNotZero(data?.amountGovt) ? toNumber(data?.amountGovt) : null,
      amountAsAt: data.amountAsAt || null,
      isTaxDeductible: data?.isTaxDeductible,
      isTaxDeductibleAsAt: data?.isTaxDeductibleAsAt || null,
      _id: editIncome ? get(incomeDetails, [0, '_id']) : AppConstants.newObjectID,
      nextPayDateStart: data?.nextPayDate ? UtilLib.dateUTCAsAt(data?.nextPayDate) : null,
    };
    if (!editIncome) {
      dataConvert.isCurrent = true;
    }
    return dataConvert;
  };

  return (
    <DynamicForm
      ref={formRef}
      data={dataForm}
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

export default compose(withTranslation(), withDynamicModuleLoader(getModule()))(GovtPrivateOther);
