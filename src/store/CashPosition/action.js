import {
  GET_CASH_POSITION,
  SET_CASH_POSITION,
  SET_CHART_TIME,
  SET_FETCHING,
  SET_FINANCIAL_CARDS,
} from 'store/CashPosition/constants';

export const getCashPosition = isRefresh => ({
  type: GET_CASH_POSITION,
  payload: {
    isRefresh,
  },
});

export const setCashPosition = payload => ({
  type: SET_CASH_POSITION,
  payload,
});

export const setFinancialCards = payload => ({
  type: SET_FINANCIAL_CARDS,
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
