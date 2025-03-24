import {
  GET_NET_WORTH,
  SET_CHART_TIME,
  SET_FETCHING,
  SET_FINANCIAL_CARDS,
  SET_NET_WORTH,
  SUBMIT_FEEDBACK,
} from 'store/NetWorth/constants';

export const getNetWorth = isRefresh => ({
  type: GET_NET_WORTH,
  payload: {
    isRefresh,
  },
});

export const setNetWorth = payload => ({
  type: SET_NET_WORTH,
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
