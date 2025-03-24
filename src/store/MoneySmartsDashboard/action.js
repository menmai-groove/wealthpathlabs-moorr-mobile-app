import {
  ADD_TRANSACTION,
  DELETE_TRANSACTION,
  EDIT_TRANSACTION,
  GET_MONEY_SMARTS,
  SET_MONEY_SMARTS,
} from 'store/MoneySmartsDashboard/constants';

export const getMoneySmarts = isRefresh => ({
  type: GET_MONEY_SMARTS,
  payload: {
    isRefresh,
  },
});

export const setMoneySmarts = data => ({
  type: SET_MONEY_SMARTS,
  payload: {
    data,
  },
});

export const deleteTransaction = data => ({
  type: DELETE_TRANSACTION,
  payload: data,
});

export const addTransaction = data => ({
  type: ADD_TRANSACTION,
  payload: data,
});

export const editTransaction = data => ({
  type: EDIT_TRANSACTION,
  payload: data,
});
