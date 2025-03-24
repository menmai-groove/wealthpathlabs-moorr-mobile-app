import DynamicForm from 'components/basics/DynamicForm';
import { NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { cloneDeep, isNil } from 'lodash';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { RECORD_TYPE, updateTime } from 'screens/HistoricalLog';
import { addVehicle } from 'store/Asset/action';
import getModule from 'store/Asset/module';
import { selectAssetName, selectAssetOwnership, selectAssetType } from 'store/Asset/selector';
import {
  selectDataAssetVehicleType,
  selectDataAssetVehicleYear,
  selectOwners,
} from 'store/Auth/selector';

const formatFormJson = require('assets/forms/layouts/asset-vehicle.json');

function Vehicle({ formRef, editData, onFirstTimeDataChange, onErrorForm, disabled, onSubmit }) {
  const dispatch = useDispatchResolve();
  const assetName = useSelector(selectAssetName);
  const listYears = useSelector(selectDataAssetVehicleYear);

  const userOwnerships = useSelector(selectOwners);
  const assetOwnership = useSelector(selectAssetOwnership);
  const vehicleTypeData = useSelector(selectDataAssetVehicleType);
  const assetType = useSelector(selectAssetType);

  const data = useMemo(() => {
    const jsonObject = cloneDeep(formatFormJson);
    const layout = jsonObject.layout;
    const cardName = UtilLib.getFieldFromFormJSON(layout, 'name');
    cardName.value = assetName;
    const owner = UtilLib.getFieldFromFormJSON(layout, 'ownership');
    owner.options = userOwnerships;
    owner.value = assetOwnership;
    const ownershipAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'ownershipAsAt');
    ownershipAsAtForm.value = UtilLib.dateUTCAsAt(Date.now());
    const vehicleTypeForm = UtilLib.getFieldFromFormJSON(layout, 'vehicleType');
    vehicleTypeForm.options = vehicleTypeData;
    const yearForm = UtilLib.getFieldFromFormJSON(layout, 'year');
    yearForm.options = listYears;
    if (editData) {
      const {
        _id,
        name,
        notes,
        datePurchased,
        manufacturer,
        purchasePrice,
        value,
        vehicleType,
        year,
        ownership,
        valueAsAt,
      } = editData;
      if (!isNil(notes)) {
        const notesForm = UtilLib.getFieldFromFormJSON(layout, 'notes');
        notesForm.value = notes;
      }
      if (!isNil(manufacturer)) {
        const manufacturerForm = UtilLib.getFieldFromFormJSON(layout, 'manufacturer');
        manufacturerForm.value = manufacturer;
      }
      if (!isNil(purchasePrice)) {
        const purchasePriceForm = UtilLib.getFieldFromFormJSON(layout, 'purchasePrice');
        purchasePriceForm.value = `${purchasePrice}`;
      }
      if (!isNil(value)) {
        const valueForm = UtilLib.getFieldFromFormJSON(layout, 'value');
        valueForm.value = `${value}`;
      }
      if (!isNil(datePurchased)) {
        const datePurchasedForm = UtilLib.getFieldFromFormJSON(layout, 'datePurchased');
        datePurchasedForm.value = datePurchased;
      }
      if (!isNil(year)) {
        yearForm.value = { label: `${year}`, display: `${year}`, value: year };
      }
      vehicleTypeForm.value = { value: vehicleType, display: vehicleType, label: vehicleType };
      if (ownershipAsAtForm) {
        ownershipAsAtForm.lastDate = ownershipAsAtForm.value = ownership?.ownershipAsAt ?? null;
        ownershipAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'ownership',
          fieldName: 'Owner',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.OWNERSHIP,
        };
      }
      const valueAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'valueAsAt');
      valueAsAtForm.lastDate = valueAsAtForm.value = valueAsAt ?? null;
      valueAsAtForm.info = {
        cardId: _id,
        cardName: name,
        field: 'value',
        category: 'Asset',
        type: assetType,
        recordType: RECORD_TYPE.NUMBER,
      };

      layout.forEach(group => {
        if (group.component === 'collapse') {
          group.collapse = false;
        }
      });
      UtilLib.handleConditionLogicDynamicForm(jsonObject, jsonObject.conditional);
    }
    return jsonObject;
  }, [assetName, assetOwnership, editData, userOwnerships, vehicleTypeData, listYears, assetType]);

  const callAPIAddData = useCallback(
    (inputData, callback) => {
      const handledData = {
        ...inputData,
        ownership: UtilLib.handleEditOwnership(editData?.ownership, {
          ...inputData?.ownership,
          ownershipAsAt: inputData?.ownershipAsAt,
        }),
      };
      dispatch(addVehicle(handledData)).then(results => {
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

export default compose(withDynamicModuleLoader(getModule()))(Vehicle);
