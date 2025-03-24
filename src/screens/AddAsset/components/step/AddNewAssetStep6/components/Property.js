import DynamicForm from 'components/basics/DynamicForm';
import Constants from 'constant/constants';
import { UtilLib } from 'libs';
import { cloneDeep, isEmpty, isNil, omit } from 'lodash';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import getModule from 'store/Asset/module';
import { selectAssetOwnership, selectData } from 'store/Asset/selector';
import { selectFrequency } from 'store/Auth/selector';

const formatFormJson = require('assets/forms/layouts/property/asset-add-property2.json');
function Property({ formRef, handleNextStep, onErrorForm }) {
  const frequencyType = useSelector(selectFrequency);
  const assetDatas = useSelector(selectData);
  const assetOwnership = useSelector(selectAssetOwnership);
  const apiOwnerShip = omit(assetOwnership, ['label', 'display', 'value', 'ownershipAsAt']);

  const data = useMemo(() => {
    const { incomeValue, incomeFrequency, adHocIncomeValue, adIncomeFrequency } = assetDatas || {};
    const jsonObject = cloneDeep(formatFormJson);
    const layout = jsonObject.layout;
    const incomeFrequencyForm = UtilLib.getFieldFromFormJSON(layout, 'incomeFrequency');
    incomeFrequencyForm.options = frequencyType;
    if (!isEmpty(incomeFrequencyForm.value)) {
      incomeFrequencyForm.value = frequencyType.find(
        f => f.value === incomeFrequencyForm.value?.value,
      );
    }
    const adIncomeFrequencyForm = UtilLib.getFieldFromFormJSON(layout, 'adIncomeFrequency');
    adIncomeFrequencyForm.options = frequencyType;
    if (!isEmpty(adIncomeFrequencyForm.value)) {
      adIncomeFrequencyForm.value = frequencyType.find(
        f => f.value === adIncomeFrequencyForm.value?.value,
      );
    }
    // fill data when go back
    const incomeForm = UtilLib.getFieldFromFormJSON(layout, 'income');
    if (incomeValue) {
      incomeForm.value = incomeValue;
    }
    if (incomeFrequency) {
      incomeFrequencyForm.value = incomeFrequency;
    }
    const adHocIncomeForm = UtilLib.getFieldFromFormJSON(layout, 'adhocIncome');
    if (adHocIncomeValue) {
      adHocIncomeForm.value = adHocIncomeValue;
    }
    if (adIncomeFrequency) {
      adIncomeFrequencyForm.value = adIncomeFrequency;
    }
    return jsonObject;
  }, [assetDatas, frequencyType]);

  const onSubmit = useCallback(
    formData => {
      let returnValue = {};
      let incomes = [];
      const incomeData =
        formData.income === ''
          ? null
          : {
              _id: Constants.newObjectIDForTypes.Income,
              type: 'Investment Property',
              amount: formData.income === '' ? null : parseFloat(formData.income),
              frequency: isNil(formData.incomeFrequency) ? null : formData.incomeFrequency.value,
              isTaxDeductible: false,
              ownership: apiOwnerShip,
              property: Constants.newObjectIDForTypes.Property,
              name: assetDatas?.name || '',
              isCurrent: true,
            };
      if (incomeData) {
        incomes.push(incomeData);
      }
      const adIncomeData =
        formData.adhocIncome === ''
          ? null
          : {
              _id: Constants.newObjectIDForTypes.AdhocIncome,
              type: 'Investment Property',
              amount: formData.adhocIncome === '' ? null : parseFloat(formData.adhocIncome),
              frequency: isNil(formData.adIncomeFrequency)
                ? null
                : formData.adIncomeFrequency.value,
              ownership: apiOwnerShip,
              property: Constants.newObjectIDForTypes.Property,
              name: assetDatas?.name || '',
              isCurrent: true,
            };
      if (adIncomeData) {
        incomes.push(adIncomeData);
      }
      if (incomes.length === 0) {
        incomes = null;
      }
      if (!incomeData && !adIncomeData) {
        returnValue = {};
      } else {
        returnValue = {
          income: incomeData ? Constants.newObjectIDForTypes.Income : null,
          adhocIncome: adIncomeData ? Constants.newObjectIDForTypes.AdhocIncome : null,
          incomes: incomes,
        };
      }
      handleNextStep({
        ...formData,
        adIncomeFrequency: formData.adIncomeFrequency,
        incomeFrequency: formData.incomeFrequency,
        incomeValue: formData.income,
        adHocIncomeValue: formData.adhocIncome,
        ...returnValue,
      });
    },
    [apiOwnerShip, handleNextStep, assetDatas],
  );

  return (
    <DynamicForm
      ref={formRef}
      data={data}
      conditionLogics={formatFormJson.conditional}
      onSubmit={onSubmit}
      onError={onErrorForm}
    />
  );
}

export default compose(withDynamicModuleLoader(getModule()))(Property);
