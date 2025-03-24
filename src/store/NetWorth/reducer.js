import {
  SET_CHART_TIME,
  SET_FETCHING,
  SET_FINANCIAL_CARDS,
  SET_NET_WORTH,
} from 'store/NetWorth/constants';

export const initialState = {
  netWorth: null,
  financialCards: [],
  chartTime: 'Y',
  fetching: true,
};

export function reducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_NET_WORTH:
      return {
        ...state,
        netWorth: payload,
        fetching: false,
      };
    case SET_FINANCIAL_CARDS:
      return {
        ...state,
        financialCards: payload,
        fetching: false,
      };
    case SET_CHART_TIME:
      return {
        ...state,
        chartTime: payload,
      };
    case SET_FETCHING:
      return {
        ...state,
        fetching: payload,
      };
    default:
      return state;
  }
}
