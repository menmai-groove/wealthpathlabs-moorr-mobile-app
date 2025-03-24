import DynamicForm from 'components/basics/DynamicForm';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectJarsType, selectOwnersWithOthers } from 'store/Auth/selector';
import { useFormData } from 'screens/Expense/useSaveFormData';
import HoldingCost from 'screens/Expense/components/holdingCost';
import { cloneDeep, get, isNil } from 'lodash';
import { UtilLib } from 'libs';
import { useTranslation } from 'react-i18next';
import { AppConstants } from 'constant';

import ViewAssetLink from '../viewAssetLink';

// const i18nScope = 'screens.expense.addExpense';

export function ExpenseInvestmentForm({
  formRef,
  onSubmitForm,
  onFirstTimeDataChange,
  onErrorForm,
  disabled,
}) {
  const { t } = useTranslation();
  const userOwnerships = useSelector(selectOwnersWithOthers);
  const moneySMARTSJarsType = useSelector(selectJarsType);
  const formatFormJson = require('assets/forms/layouts/expense-investment.json');
  const conditionLogicJson = require('assets/forms/conditionLogics/cl-expense-investment.json');
  const { formData } = useFormData();

  const handledData = useCallback(
    field => {
      switch (field.id) {
        case 'type':
          field.value = get(formData.type, 'value');
          break;
        case 'annualAmount':
          field.value = field.value;
          break;
        case 'ownership':
          field.options = userOwnerships;
          break;
        case 'investmentAssetName':
          if (formData.relatedAsset?.type === AppConstants.AssetType.Property) {
            field.label = t('forms.expense.propertyAssetName');
          }
          if (formData.relatedAsset?.type === AppConstants.AssetType.Investments) {
            field.label = t('forms.expense.investmentAssetName');
          }
          field.value = formData.investmentAssetName || t('forms.expense.assetNameEmpty');
          break;
        case 'assetLink':
          field.ComponentNode = ViewAssetLink;
          field.value = formData.relatedAsset?.data._id;
          field.assetType = formData.relatedAsset?.type;
          field.assetName = formData.investmentAssetName;
          field.label =
            field.label ||
            t('forms.expense.viewAssetDetail', {
              type: formData.relatedAsset?.type,
            });
          break;
        case 'jar':
          field.options = moneySMARTSJarsType;
          break;
        case 'holdingCosts':
          field.ComponentNode = HoldingCost;
          field.related = {
            moneySMARTSJarsType,
            assetType: get(formData.type, 'value'),
          };
          field.value = formData.holdingCosts;
          break;
        default:
          break;
      }
    },
    [formData, moneySMARTSJarsType, t, userOwnerships],
  );

  const dataForm = useMemo(() => {
    const formatForm = cloneDeep(formatFormJson);
    const { layout = [] } = formatForm;
    const formLayout = layout.map(item => {
      const { fields = [] } = item;
      if (formData && item.component === 'collapse') {
        item.collapse = false;
      }
      return {
        ...item,
        fields: fields.map(field => {
          if (field.fields) {
            field.fields.forEach(_field => {
              _field.value = !isNil(formData[_field.id]) ? formData[_field.id] : _field.value;
              handledData(_field);
            });
          }
          field.value = !isNil(formData[field.id]) ? formData[field.id] : field.value;
          handledData(field);
          return field;
        }),
      };
    });

    let newFormmatForm = { layout: formLayout };
    UtilLib.handleConditionLogicDynamicForm(newFormmatForm, conditionLogicJson);

    return newFormmatForm;
  }, []);

  return (
    <DynamicForm
      ref={formRef}
      data={dataForm}
      onSubmit={onSubmitForm}
      conditionLogics={conditionLogicJson}
      onFirstTimeDataChange={onFirstTimeDataChange}
      onError={onErrorForm}
      disabled={disabled}
    />
  );
}
