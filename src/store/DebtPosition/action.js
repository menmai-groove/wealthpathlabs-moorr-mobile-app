import {
  GET_DEBT_POSITION,
  SET_CHART_TIME,
  SET_DEBT_POSITION,
  SET_FETCHING,
  SET_FINANCIAL_CARDS,
  SUBMIT_FEEDBACK,
} from 'store/DebtPosition/constants';

export const getDebtPosition = isRefresh => ({
  type: GET_DEBT_POSITION,
  payload: {
    isRefresh,
  },
});

export const setDebtPosition = payload => ({
  type: SET_DEBT_POSITION,
  payload,
});

export const setFinancialCards = payload => ({
  type: SET_FINANCIAL_CARDS,
  payload,
});

export const submitFeedback = payload => ({
  type: SUBMIT_FEEDBACK,
  payload,
});
export const setChartTime = payload => ({
  type: SET_CHART_TIME,
  payload,
});
export const setFetching = payload => ({
  type: SET_FETCHING,
  payload,
});
