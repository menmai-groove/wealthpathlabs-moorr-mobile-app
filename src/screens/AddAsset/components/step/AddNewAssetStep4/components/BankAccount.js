import DynamicForm from 'components/basics/DynamicForm';
import { AppConstants } from 'constant';
import { NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { cloneDeep, isNil } from 'lodash';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { RECORD_TYPE, updateTime } from 'screens/HistoricalLog';
import { addBankAccount } from 'store/Asset/action';
import getModule from 'store/Asset/module';
import { selectAssetName, selectAssetOwnership, selectAssetType } from 'store/Asset/selector';
import {
  selectDataAssetBankAccountInstitutions,
  selectDataAssetBankAccountType,
  selectOwners,
} from 'store/Auth/selector';

const formatFormJson = require('assets/forms/layouts/asset-bank-account.json');
function BankAccount({
  formRef,
  editData,
  onFirstTimeDataChange,
  onErrorForm,
  disabled,
  onSubmit,
  startDate,
}) {
  const dispatch = useDispatchResolve();
  const assetName = useSelector(selectAssetName);

  const bankAccountTypes = useSelector(selectDataAssetBankAccountType);
  const bankAccountInstitutions = useSelector(selectDataAssetBankAccountInstitutions);
  const userOwnerships = useSelector(selectOwners);
  const assetOwnership = useSelector(selectAssetOwnership);
  const assetType = useSelector(selectAssetType);
  const data = useMemo(() => {
    const jsonObject = cloneDeep(formatFormJson);
    const layout = jsonObject.layout;
    const cardName = UtilLib.getFieldFromFormJSON(layout, 'name');
    cardName.value = assetName;
    const accountTypeForm = UtilLib.getFieldFromFormJSON(layout, 'accountType');
    accountTypeForm.options = bankAccountTypes;
    // accountTypeForm.value = bankAccountTypes?.length ? bankAccountTypes[0] : null;
    const owner = UtilLib.getFieldFromFormJSON(layout, 'ownership');
    owner.options = userOwnerships;
    owner.value = assetOwnership;
    const ownershipAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'ownershipAsAt');
    ownershipAsAtForm.value = startDate ?? UtilLib.dateUTCAsAt(Date.now());
    const institutionForm = UtilLib.getFieldFromFormJSON(layout, 'institution');
    institutionForm.options = bankAccountInstitutions;
    // institutionForm.value = bankAccountInstitutions?.length ? bankAccountInstitutions[0] : null;
    const isTrackedInMoneySmartsForm = UtilLib.getFieldFromFormJSON(
      layout,
      'isTrackedInMoneySmarts',
    );
    isTrackedInMoneySmartsForm.options = AppConstants.dropdownOptions;
    isTrackedInMoneySmartsForm.value = AppConstants.dropdownOptions[0];

    const isTrackedInMoneySmartsAsAtForm = UtilLib.getFieldFromFormJSON(
      layout,
      'isTrackedInMoneySmartsAsAt',
    );
    isTrackedInMoneySmartsAsAtForm.value = startDate ?? UtilLib.dateUTCAsAt(Date.now());

    if (editData) {
      const {
        _id,
        name,
        balance,
        notes,
        accountType,
        institution,
        interestRate,
        isPrimary,
        last4,
        otherType,
        ownership,
        balanceAsAt,
        interestRateAsAt,
        isTrackedInMoneySmarts,
        isTrackedInMoneySmartsAsAt,
      } = editData;
      if (!isNil(balance)) {
        const balanceForm = UtilLib.getFieldFromFormJSON(layout, 'balance');
        balanceForm.value = `${balance}`;
      }
      if (!isNil(notes)) {
        const notesForm = UtilLib.getFieldFromFormJSON(layout, 'notes');
        notesForm.value = notes;
      }
      if (!isNil(accountType)) {
        accountTypeForm.value = { value: accountType, display: accountType, label: accountType };
      }
      if (!isNil(institution)) {
        institutionForm.value = { value: institution, display: institution, label: institution };
      }
      if (!isNil(interestRate)) {
        const interestRateForm = UtilLib.getFieldFromFormJSON(layout, 'interestRate');
        interestRateForm.value = `${interestRate}`;
      }
      const isPrimaryForm = UtilLib.getFieldFromFormJSON(layout, 'isPrimary');
      isPrimaryForm.value = isPrimary;
      if (!isNil(last4)) {
        const last4Form = UtilLib.getFieldFromFormJSON(layout, 'last4');
        last4Form.value = last4;
      }
      if (!isNil(otherType)) {
        const otherTypeForm = UtilLib.getFieldFromFormJSON(layout, 'otherType');
        otherTypeForm.value = otherType;
      }

      if (ownershipAsAtForm) {
        ownershipAsAtForm.lastDate = ownershipAsAtForm.value = ownership?.ownershipAsAt ?? null;
        ownershipAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'ownership',
          fieldName: 'Ownership',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.OWNERSHIP,
        };
      }
      const balanceAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'balanceAsAt');
      balanceAsAtForm.lastDate = balanceAsAtForm.value = balanceAsAt ?? null;
      balanceAsAtForm.info = {
        cardId: _id,
        cardName: name,
        field: 'balance',
        category: 'Asset',
        type: assetType,
        recordType: RECORD_TYPE.NUMBER,
      };
      const interestRateAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'interestRateAsAt');
      interestRateAsAtForm.lastDate = interestRateAsAtForm.value = interestRateAsAt ?? null;
      interestRateAsAtForm.info = {
        cardId: _id,
        cardName: name,
        field: 'interestRate',
        category: 'Asset',
        type: assetType,
        recordType: RECORD_TYPE.NUMBER,
      };

      isTrackedInMoneySmartsAsAtForm.value =
        isTrackedInMoneySmartsAsAt ?? UtilLib.dateUTCAsAt(Date.now());
      isTrackedInMoneySmartsAsAtForm.info = {
        cardId: _id,
        cardName: name,
        field: 'isTrackedInMoneySmarts',
        category: 'Asset',
        type: assetType,
        recordType: RECORD_TYPE.NUMBER,
      };
      if (!isNil(isTrackedInMoneySmarts)) {
        isTrackedInMoneySmartsForm.value = AppConstants.dropdownOptions.find(
          o => o.value === isTrackedInMoneySmarts,
        );
      } else {
        isTrackedInMoneySmartsForm.value = null;
      }

      layout.forEach(group => {
        if (group.component === 'collapse') {
          group.collapse = false;
        }
      });

      UtilLib.handleConditionLogicDynamicForm(jsonObject, jsonObject.conditional);
    }
    return jsonObject;
  }, [
    assetName,
    bankAccountTypes,
    userOwnerships,
    assetOwnership,
    bankAccountInstitutions,
    editData,
    assetType,
  ]);

  const callAPIAddData = useCallback(
    (inputData, callback) => {
      const handledData = {
        ...inputData,
        ownership: UtilLib.handleEditOwnership(editData?.ownership, {
          ...inputData?.ownership,
          ownershipAsAt: inputData.ownershipAsAt,
        }),
      };
      dispatch(addBankAccount(handledData)).then(results => {
        if (results) {
          if (typeof callback === 'function') {
            updateTime();
            callback();
            return;
          }
          NavigationServiceLib.pop();
        }
      });
    },
    [dispatch, editData],
  );

  return (
    <DynamicForm
      ref={formRef}
      onFirstTimeDataChange={onFirstTimeDataChange}
      data={data}
      conditionLogics={formatFormJson.conditional}
      onSubmit={async (formData, callback) => {
        if (typeof onSubmit === 'function') {
          await onSubmit();
        }
        callAPIAddData({ ...formData, id: editData ? editData._id : null }, callback);
      }}
      onError={onErrorForm}
      disabled={disabled}
    />
  );
}

export default compose(withDynamicModuleLoader(getModule()))(BankAccount);
