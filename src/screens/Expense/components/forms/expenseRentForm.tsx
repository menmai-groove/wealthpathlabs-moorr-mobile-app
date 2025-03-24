import DynamicForm from 'components/basics/DynamicForm';
import React, { useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  selectDataBillExpenseType,
  selectListExpenseTypes,
  selectFrequency,
  selectJarsType,
  selectDefaultValueExpense,
  selectInvestmentHoldingCostsType,
  selectPropertyHoldingCostsType,
  selectOwnersWithOthers,
  selectFlags,
} from 'store/Auth/selector';
import { useFormData } from 'screens/Expense/useSaveFormData';
import HoldingCost from 'screens/Expense/components/holdingCost';
import { cloneDeep, get, isDate, isEmpty, isNil, merge, toString } from 'lodash';
import { GlobalLib, UtilLib } from 'libs';
import { selectRentExpenseData, selectRelatedAsset } from 'store/Expense/selector';
import { RECORD_TYPE } from 'screens/HistoricalLog';
import { AppConstants } from 'constant';
import { generateObjectForDropdown } from 'libs/util';
import { useTranslation } from 'react-i18next';
import NextPayDateModal from 'components/basics/NextPayDateModal';
import { useDispatchResolve } from 'libs/hooks';
import { updateNextPayDateStart } from 'store/FinancialDashboard/action';
import moment from 'moment';

import viewAssetLink from '../viewAssetLink';
interface IExpenseRentForm {
  formRef: any;
  onSubmitForm: (submitData) => void;
  onFirstTimeDataChange?: (value: boolean) => void;
  onErrorForm?: (formErrors: object, dataFormErrors: object, firstKey: string) => void;
  disabled?: boolean;
  value?: any;
  assetFormRef?: any;
}

export function ExpenseRentForm({
  formRef,
  onSubmitForm,
  onFirstTimeDataChange,
  onErrorForm,
  disabled,
  value,
  assetFormRef,
}: IExpenseRentForm) {
  const { t } = useTranslation();
  const dispatchResolve = useDispatchResolve();

  const dataBillExpenseType = useSelector(selectDataBillExpenseType);
  const dataListExpenseTypes = useSelector(selectListExpenseTypes);
  const propertyHoldingCostsTypes = useSelector(selectPropertyHoldingCostsType);
  const investmentHoldingCostsTypes = useSelector(selectInvestmentHoldingCostsType);
  const userOwnerships = useSelector(selectOwnersWithOthers);
  const frequencies = useSelector(selectFrequency);
  const moneySMARTSJarsType = useSelector(selectJarsType);
  const defaultValueExpenses = useSelector(selectDefaultValueExpense);
  const formatFormJson = require('assets/forms/layouts/expense-rent.json');
  const propertyAndInvestmentsFormatFormJson = require('assets/forms/layouts/property-and-investments-expense-rent.json');
  const conditionLogicJson = require('assets/forms/conditionLogics/cl-expense-rent.json');
  const { formData: originalFormData } = useFormData();
  const relatedAsset = useSelector(selectRelatedAsset);
  const assetType = get(relatedAsset, 'type', '');
  const flags = useSelector(selectFlags);
  const nextDueDateStartRef = useRef(null);

  const relatedAssetName = get(relatedAsset, 'data.name', '');
  const relatedAssetOwnership = userOwnerships.find(
    x =>
      get(relatedAsset, ['data', 'ownership', 'owners', 0, 'owner']) ===
        get(x, ['owners', 0, 'owner']) &&
      x.ownershipType === get(relatedAsset, 'data.ownership')?.ownershipType,
  );
  const rentExpenseData = useSelector(selectRentExpenseData);

  const isProperty = assetType === AppConstants.AssetType.Property;
  const isInvestments = assetType === AppConstants.AssetType.Investments;
  const isPropertyInvestmentCard = isProperty || isInvestments;
  const formatDataListExpenseTypes = isProperty
    ? propertyHoldingCostsTypes
    : isInvestments
    ? investmentHoldingCostsTypes
    : dataListExpenseTypes;
  const assetValue = assetFormRef?.getFormValue();
  const assetName = get(assetValue, 'name');
  const assetOwnership = get(assetValue, 'ownership');
  const formData = merge(originalFormData, {
    ...(value?.name ? { name: value?.name } : {}),
    ...(value?.holdingCostName ? { holdingCostName: value?.holdingCostName } : {}),
    ...(value?.essentialAmount ? { essentialAmount: String(value?.essentialAmount) } : {}),
    ...(value?.discretionaryAmount
      ? { discretionaryAmount: String(value?.discretionaryAmount) }
      : {}),
    ...{ ownership: assetOwnership ?? relatedAssetOwnership },
    ...(value?.frequency
      ? { frequency: frequencies?.find(type => type.value === value?.frequency) }
      : {}),
    ...(value?.expenseGroup ? { expenseGroup: value?.expenseGroup } : {}),
    ...(value?.category ? { category: value?.category } : {}),
    ...(value?.note ? { note: value?.note } : {}),
    // ...(value?.billPaymentReminder ? { billPaymentReminder: value?.billPaymentReminder } : {}),
    ...(!isNil(value?.isTaxDeductable)
      ? { isTaxDeductable: value?.isTaxDeductable }
      : { isTaxDeductable: isPropertyInvestmentCard }),
    ...(value?.jar ? { jar: moneySMARTSJarsType.find(jar => jar.value === value?.jar) } : {}),
    ...(value?.category
      ? { type: generateObjectForDropdown({ value: toString(value?.category) }) }
      : {}),
    ...(value?.categoryAsAt ? { categoryAsAt: value?.categoryAsAt } : {}),
    ...(value?.amountAsAt ? { amountAsAt: value?.amountAsAt } : {}),
    ...(value?.isTaxDeductableAsAt ? { isTaxDeductableAsAt: value?.isTaxDeductableAsAt } : {}),
    ...(value?.nextDueDate ? { nextDueDate: value?.nextDueDate } : {}),
    ...(value?.nextDueDateStart ? { nextDueDateStart: value?.nextDueDateStart } : {}),
  });
  const billExpenseType = [
    ...propertyHoldingCostsTypes,
    ...investmentHoldingCostsTypes,
    ...dataBillExpenseType,
  ];

  const paymentFrequencyOnChange = useCallback((_field, value) => {
    const nextDueDateField = formRef.current?.getFormValue('nextDueDate');
    if (!isDate(nextDueDateField)) {
      return;
    }
    const { nextDueDate } = rentExpenseData;
    nextDueDateStartRef.current = nextDueDateField ?? nextDueDate;
    GlobalLib.CustomModal.get().show({
      onBackdropPress: () => GlobalLib.CustomModal.get().hide(),
      body: (
        <NextPayDateModal
          date={nextDueDateStartRef.current}
          title={'Does this change your next Expense Due Date?'}
          content={
            'You have updated your payment frequency, does this change your next expense due date?'
          }
          dateLabelText={'Next Expense Due Date'}
          onCancel={() => GlobalLib.CustomModal.get().hide()}
          onSubmit={data => {
            const _id = get(rentExpenseData, ['_id']);
            const nextPayDateStartValue = get(data, ['date']);
            const frequencyValue = get(value, ['value']);
            const assetsData = {
              cardType: 'expenses',
              _id,
              nextPayDateStart: nextPayDateStartValue,
              nextPayDateStartField: 'nextDueDateStart',
              frequency: frequencyValue,
              frequencyField: 'frequency',
            };
            GlobalLib.CustomModal.get().hide();
            dispatchResolve(updateNextPayDateStart(assetsData)).then(response => {
              const nextDueDate = get(response, 'nextDueDate');
              if (nextDueDate) {
                formRef.current?.setFormValue('nextDueDate', moment(nextDueDate).toDate());
                nextDueDateStartRef.current = nextPayDateStartValue;
              }
            });
          }}
        />
      ),
    });
  }, []);

  const handledData = useCallback(
    field => {
      switch (field.id) {
        case 'type':
          field.options = formatDataListExpenseTypes;
          if (formatDataListExpenseTypes?.find(x => x.value === field.value?.value) == null) {
            field.value = null;
          }
          break;
        case 'ownership':
          field.options = userOwnerships;
          break;
        case 'frequency':
          field.options = frequencies;
          if (isEmpty(formData[field.id]) && !isEmpty(field.value)) {
            field.value = frequencies.find(type => type.value === field.value?.value);
          }
          if (flags.nextDates && rentExpenseData) {
            field.onChange = paymentFrequencyOnChange;
          }
          break;
        case 'jar':
          field.options = moneySMARTSJarsType;
          if (isEmpty(field.value)) {
            const defaultValue = defaultValueExpenses.find(
              e => get(formData.type, 'value') === e.category,
            );
            if (defaultValue !== null && !isNil(defaultValue?.jar)) {
              const jarDefault = moneySMARTSJarsType.find(jar => jar.value === defaultValue.jar);
              if (jarDefault !== null) {
                field.value = jarDefault;
              }
            }
          }
          break;
        case 'billPaymentReminder':
          if (!isEmpty(formData.type)) {
            const isBillExpense = billExpenseType.map(i => i.value).includes(formData.type?.value);
            field.visible = isBillExpense;
          }
          if (flags.nextDates) {
            field.visible = false;
          }
          break;
        case 'nextDueDate': {
          if (flags.nextDates) {
            field.visible = true;
            field.value = formData.nextDueDate ? moment(formData.nextDueDate).toDate() : null;
            field.minDate = UtilLib.dateUTCAsAt(Date.now());
          }
          break;
        }
        case 'holdingCost':
          field.ComponentNode = HoldingCost;
          field.related = { moneySMARTSJarsType };
          break;
        case 'totalAmount':
          field.value = Number(formData.essentialAmount) + Number(formData.discretionaryAmount);
          break;
        case 'categoryAsAt':
          // if (formData.categoryAsAt) {
          // field.lastDate = field.value = formData.categoryAsAt ?? UtilLib.dateUTCAsAt(Date.now());
          field.lastDate = field.value = formData.categoryAsAt ?? null;
          if (rentExpenseData) {
            const { _id, name, type: expenseType } = rentExpenseData;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'category',
              category: 'Expense',
              type: expenseType?.value,
              recordType: RECORD_TYPE.STRING,
            };
          }
          // } else {
          //   field.value = UtilLib.dateUTCAsAt(Date.now());
          // }
          break;
        case 'amountAsAt':
          // if (formData.amountAsAt) {
          field.lastDate = field.value = formData.amountAsAt ?? null;
          if (rentExpenseData) {
            const { _id, name, type: expenseType } = rentExpenseData;
            field.info = {
              cardId: _id,
              cardName: name,
              field: ['essentialAmount', 'discretionaryAmount'],
              category: 'Expense',
              type: expenseType?.value,
              recordType: RECORD_TYPE.NUMBER_WITH_FREQUENCY,
            };
          }
          // }
          break;
        case 'isTaxDeductableAsAt':
          // if (formData.isTaxDeductableAsAt) {
          field.lastDate = field.value = formData.isTaxDeductableAsAt ?? null;
          if (rentExpenseData) {
            const { _id, name, type: expenseType } = rentExpenseData;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'isTaxDeductable',
              category: 'Expense',
              type: expenseType?.value,
              recordType: RECORD_TYPE.NUMBER,
            };
          }
          // }
          break;
        case 'ownershipAsAt':
          // if (formData?.ownershipAsAt || formData.ownership?.ownershipAsAt) {
          field.lastDate = field.value =
            formData?.ownershipAsAt ?? formData.ownership?.ownershipAsAt ?? null;
          if (rentExpenseData) {
            const { _id, name, type: expenseType } = rentExpenseData;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'ownership',
              category: 'Expense',
              type: expenseType?.value,
              recordType: RECORD_TYPE.OWNERSHIP,
            };
          }
          // }
          break;
        case 'jarAsAt':
          // if (formData?.jarAsAt) {
          // field.lastDate = field.value = formData?.jarAsAt ?? UtilLib.dateUTCAsAt(Date.now());
          field.lastDate = field.value = formData?.jarAsAt ?? null;
          if (rentExpenseData) {
            const { _id, name, type: expenseType } = rentExpenseData;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'jar',
              category: 'Expense',
              type: expenseType?.value,
              recordType: RECORD_TYPE.STRING,
            };
          }
          // }
          break;
        case 'assetName':
          field.value = assetName ?? relatedAssetName;
          break;
        case 'assetLink':
          field.ComponentNode = viewAssetLink;
          field.value = relatedAsset?.data._id;
          field.assetType = relatedAsset?.type;
          field.assetName = assetName ?? relatedAssetName;
          field.label =
            field.label ||
            t('forms.expense.viewAssetDetail', {
              type: relatedAsset?.type,
            });
          break;
        default:
          break;
      }
    },
    [
      formatDataListExpenseTypes,
      userOwnerships,
      frequencies,
      formData,
      moneySMARTSJarsType,
      rentExpenseData,
      assetName,
      relatedAssetName,
      relatedAsset,
      t,
      defaultValueExpenses,
      billExpenseType,
    ],
  );

  const { dataForm, conditionLogics } = useMemo(() => {
    const formatForm = cloneDeep(
      isPropertyInvestmentCard ? propertyAndInvestmentsFormatFormJson : formatFormJson,
    );
    const conditionLogicForm = cloneDeep(conditionLogicJson);
    let { logics = [] } = conditionLogicForm;
    if (flags.nextDates) {
      logics = logics.filter((x: any) => x.field !== 'billPaymentReminder');
    }
    const conLogics = {
      logics: logics.map(item => {
        if (item.field === 'billPaymentReminder') {
          const condition = billExpenseType.map(i => ({
            type: 'include',
            field: 'type',
            key: 'value',
            value: i.value,
          }));
          return { ...item, condition: { ...item.condition, condition } };
        }
        return item;
      }),
    };

    const formLayout = formatForm.layout.map(item => {
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

    UtilLib.handleConditionLogicDynamicForm(newFormmatForm, conLogics);
    return { dataForm: newFormmatForm, conditionLogics: conLogics };
  }, []);

  return (
    <DynamicForm
      ref={formRef}
      data={dataForm}
      onSubmit={onSubmitForm}
      conditionLogics={conditionLogics}
      onFirstTimeDataChange={onFirstTimeDataChange}
      onError={onErrorForm}
      disabled={disabled}
    />
  );
}
