import {
  INCOME_FISNISH,
  INCOME_GET_DETAIL,
  INCOME_RESET_DATA,
  INCOME_SUBMIT_DATA,
  INCOME_UPDATE_DATA,
  UPDATE_INCOME_INVESTMENT,
  UPDATE_NEXT_PAY_DATE,
} from 'store/Income/constants';

export const updateData = data => ({
  type: INCOME_UPDATE_DATA,
  payload: data,
});

export const submitData = () => ({
  type: INCOME_SUBMIT_DATA,
  payload: {},
});

export const finishAddNewIncome = () => ({
  type: INCOME_FISNISH,
});
export const resetData = () => ({
  type: INCOME_RESET_DATA,
});

export const getIncomeDetail = data => ({
  type: INCOME_GET_DETAIL,
  payload: data,
});

export const updateIncomeInvestment = data => ({
  type: UPDATE_INCOME_INVESTMENT,
  payload: data,
});

export const updateNextPayDateStart = data => ({
  type: UPDATE_NEXT_PAY_DATE,
  payload: data,
});
