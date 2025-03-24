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
import { addLifeInsurance } from 'store/Asset/action';
import getModule from 'store/Asset/module';
import { selectAssetName, selectAssetOwnership, selectAssetType } from 'store/Asset/selector';
import { selectOwners } from 'store/Auth/selector';

const formatFormJson = require('assets/forms/layouts/asset-life-insurance.json');
function LifeInsurance({
  formRef,
  editData,
  onFirstTimeDataChange,
  onErrorForm,
  disabled,
  onSubmit,
}) {
  const dispatch = useDispatchResolve();
  const assetName = useSelector(selectAssetName);

  const userOwnerships = useSelector(selectOwners);
  const assetOwnership = useSelector(selectAssetOwnership);
  const assetType = useSelector(selectAssetType);

  const data = useMemo(() => {
    const jsonObject = cloneDeep(formatFormJson);
    const layout = jsonObject.layout;
    const cardName = UtilLib.getFieldFromFormJSON(layout, 'name');
    cardName.value = assetName;
    const owner = UtilLib.getFieldFromFormJSON(layout, 'ownership');
    owner.options = userOwnerships.filter(
      item => item.label !== AppConstants.ownershipType.Joint, // owner have only param label
    );
    owner.value = assetOwnership;
    const ownershipAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'ownershipAsAt');
    ownershipAsAtForm.value = UtilLib.dateUTCAsAt(Date.now());

    if (editData) {
      const {
        _id,
        name,
        notes,
        datePurchased,
        purchasePrice,
        value,
        policyProvider,
        ownership,
        valueAsAt,
      } = editData;
      if (!isNil(value)) {
        const valueForm = UtilLib.getFieldFromFormJSON(layout, 'value');
        valueForm.value = `${value}`;
      }
      if (!isNil(notes)) {
        const notesForm = UtilLib.getFieldFromFormJSON(layout, 'notes');
        notesForm.value = notes;
      }
      if (!isNil(datePurchased)) {
        const datePurchasedForm = UtilLib.getFieldFromFormJSON(layout, 'datePurchased');
        datePurchasedForm.value = datePurchased;
      }
      if (!isNil(purchasePrice)) {
        const purchasePriceForm = UtilLib.getFieldFromFormJSON(layout, 'purchasePrice');
        purchasePriceForm.value = `${purchasePrice}`;
      }
      if (!isNil(policyProvider)) {
        const policyProviderForm = UtilLib.getFieldFromFormJSON(layout, 'policyProvider');
        policyProviderForm.value = policyProvider;
      }
      if (ownershipAsAtForm) {
        ownershipAsAtForm.lastDate = ownershipAsAtForm.value = ownership?.ownershipAsAt ?? null;
        ownershipAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'ownership',
          fieldName: 'Policy Owner',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.OWNERSHIP,
        };
      }
      const valueAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'valueAsAt');
      if (valueAsAtForm) {
        valueAsAtForm.lastDate = valueAsAtForm.value = valueAsAt ?? null;
        valueAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'value',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.NUMBER,
        };
      }

      layout.forEach(group => {
        if (group.component === 'collapse') {
          group.collapse = false;
        }
      });
    }
    return jsonObject;
  }, [assetName, assetOwnership, editData, userOwnerships, assetType]);

  const callAPIAddData = useCallback(
    (inputData, callback) => {
      const handledData = {
        ...inputData,
        ownership: UtilLib.handleEditOwnership(editData?.ownership, {
          ...inputData?.ownership,
          ownershipAsAt: inputData.ownershipAsAt,
        }),
      };
      dispatch(addLifeInsurance(handledData)).then(results => {
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
      data={data}
      onFirstTimeDataChange={onFirstTimeDataChange}
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

export default compose(withDynamicModuleLoader(getModule()))(LifeInsurance);
