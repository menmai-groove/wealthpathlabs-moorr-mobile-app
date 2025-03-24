import DynamicForm from 'components/basics/DynamicForm';
import AppConstants from 'constant/constants';
import { cloneDeep, isNil, omit } from 'lodash';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import getModule from 'store/Asset/module';
import { selectAssetOwnership, selectData } from 'store/Asset/selector';
import { selectDefaultInvestmentHoldingCosts } from 'store/Auth/selector';

const formatFormJson = require('assets/forms/layouts/investments/asset-add-investment3.json');
const fieldForm = {
  id: '',
  component: 'input',
  visible: true,
  value: '',
  label: '',
  dataType: 'number',
  formatData: 'currency',
};
function Investments({ formRef, handleNextStep, onErrorForm }) {
  const assetDatas = useSelector(selectData);
  const defaultPropertyHoldingCosts = useSelector(selectDefaultInvestmentHoldingCosts);
  const assetOwnership = useSelector(selectAssetOwnership);
  const apiOwnerShip = omit(assetOwnership, ['label', 'display', 'value', 'ownershipAsAt']);

  const data = useMemo(() => {
    const { expenses } = assetDatas || {};
    const jsonObject = cloneDeep(formatFormJson);
    const layout = jsonObject.layout[0];
    const fields = [];
    defaultPropertyHoldingCosts.map(item => {
      try {
        const newField = cloneDeep(fieldForm);
        newField.id = item.id;
        newField.label = item.label;
        const haveData = expenses
          ? expenses.filter(
              e => e.holdingCostName === item.value || e.holdingCostName === item.label,
            )
          : [];
        if (haveData.length > 0) {
          newField.value = `${haveData[0].essentialAmount}`;
        }
        fields.push(newField);
      } catch (error) {}
    });

    layout.fields = fields;
    return jsonObject;
  }, [assetDatas, defaultPropertyHoldingCosts]);

  const onSubmit = useCallback(
    formData => {
      const listReturnDatas = [];
      const dataSubmit = {
        _id: '',
        holdingCostName: '',
        name: assetDatas?.name || '',
        essentialAmount: 0,
        expenseGroup: AppConstants.ExpenseGroups.Investment,
        category: AppConstants.AssetExpenseType.Investment,
        frequency: 'Yearly',
        ownership: apiOwnerShip,
        investmentAssetBills: AppConstants.newObjectIDForTypes.Investment,
      };
      defaultPropertyHoldingCosts.map((item, index) => {
        if (!isNil(formData[item.id]) && formData[item.id] !== '') {
          const newData = cloneDeep(dataSubmit);
          newData._id = AppConstants.newObjectIDForTypes.Expense + index;
          newData.essentialAmount = formData[item.id] === '' ? null : parseFloat(formData[item.id]);
          newData.holdingCostName = item.value;
          newData.isTaxDeductable = true;
          listReturnDatas.push(newData);
        }
      });
      handleNextStep({
        expenses: listReturnDatas,
        expensesID: listReturnDatas.map(item => item._id),
      });
    },
    [apiOwnerShip, defaultPropertyHoldingCosts, handleNextStep, assetDatas],
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

export default compose(withDynamicModuleLoader(getModule()))(Investments);
