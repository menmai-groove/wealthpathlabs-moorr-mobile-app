import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import { formatDateTime } from 'libs/util';
import { get, isArray, pick, concat } from 'lodash';

export function getSubmitExpenseData(submitData, _id, expenseInfo) {
  const {
    spendingCategories = [],
    billCategories = [],
    userOwnerships = [],
    prevDataExpense,
  } = expenseInfo || {};
  const spendingCategoryValues = spendingCategories.map(i => i.value);
  const billCategoryValues = billCategories.map(i => i.value);

  const frequency = get(submitData, ['frequency', 'value']) || null;
  const category = get(submitData, ['type', 'value']);
  const expenseType = spendingCategories.includes(category)
    ? AppConstants.ExpenseGroups.Spending
    : AppConstants.ExpenseGroups.Bills;

  let expenseGroup; // undefined
  if (spendingCategoryValues.includes(category)) {
    expenseGroup = AppConstants.ExpenseGroups.Spending;
  }
  if (billCategoryValues.includes(category)) {
    expenseGroup = AppConstants.ExpenseGroups.Bills;
  }

  // recreate ownership
  let ownership;
  let owners = [];
  if (prevDataExpense?.ownership) {
    const needRemoveOldOwners = get(prevDataExpense, ['ownership', 'owners']);
    if (needRemoveOldOwners && isArray(needRemoveOldOwners)) {
      owners = needRemoveOldOwners.map(own => ({
        ...pick(own, ['_id', 'percentage', 'owner']),
        _delete: true,
      }));
    }
  }
  if (submitData.isTaxDeductable && submitData.ownership) {
    ownership = {
      ownershipType: submitData.ownership.ownershipType,
      owners: concat(owners, submitData.ownership.owners),
    };
  } else {
    const jointOwner = userOwnerships.find(
      owner => owner.label === AppConstants.ownershipType.Joint,
    );
    if (jointOwner) {
      ownership = pick(jointOwner, ['ownershipType', 'owners']);
    }
  }

  const name = get(submitData, 'name', '');
  const discretionaryAmount = submitData.discretionaryAmount
    ? Number(submitData.discretionaryAmount)
    : null;
  const essentialAmount = submitData.essentialAmount ? Number(submitData.essentialAmount) : null;
  const billPaymentReminder = submitData.billPaymentReminder
    ? formatDateTime(submitData.billPaymentReminder)
    : null;
  const jar = get(submitData, ['jar', 'value'], null);
  const jarAsAt = get(submitData, ['jarAsAt'], null);

  return {
    _id,
    ownership: { ...ownership, ownershipAsAt: submitData.ownershipAsAt || null },
    category,
    name,
    discretionaryAmount,
    essentialAmount,
    frequency,
    billPaymentReminder,
    isTaxDeductable: submitData.isTaxDeductable,
    jar,
    jarAsAt,
    note: submitData.note,
    type: expenseType,
    expenseGroup,
    categoryAsAt: submitData.categoryAsAt ?? null,
    amountAsAt: submitData.amountAsAt ?? null,
    isTaxDeductableAsAt: submitData.isTaxDeductableAsAt ?? null,
    nextDueDateStart: submitData.nextDueDate ? UtilLib.dateUTCAsAt(submitData.nextDueDate) : null,
  };
}
