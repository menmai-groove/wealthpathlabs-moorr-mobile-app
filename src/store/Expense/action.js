import {
  EXPENSE_FISNISH,
  EXPENSE_GET_GROUP_DATA,
  EXPENSE_SET_GROUP_DATA,
  EXPENSE_SET_RELATED_ASSET,
  EXPENSE_SUBMIT_DATA,
  EXPENSE_SUBMIT_GROUP_DATA,
  GET_EXPENSE_DETAIL,
  SET_EXPENSE_DETAIL,
} from 'store/Expense/constants';

export const submitData = payload => ({
  type: EXPENSE_SUBMIT_DATA,
  payload,
});

export const getExpenseDetail = payload => ({
  type: GET_EXPENSE_DETAIL,
  payload,
});
export const setExpenseDetail = payload => ({
  type: SET_EXPENSE_DETAIL,
  payload,
});

export const finishAddNewDraft = () => ({
  type: EXPENSE_FISNISH,
});

export const getGroupExpensesData = payload => ({
  type: EXPENSE_GET_GROUP_DATA,
  payload,
});

export const setGroupExpensesData = payload => ({
  type: EXPENSE_SET_GROUP_DATA,
  payload,
});

export const setRelatedAsset = payload => ({
  type: EXPENSE_SET_RELATED_ASSET,
  payload,
});

export const submitGroupExpenses = payload => ({
  type: EXPENSE_SUBMIT_GROUP_DATA,
  payload,
});
