import {
  SET_CHART_TIME,
  SET_DEBT_POSITION,
  SET_FETCHING,
  SET_FINANCIAL_CARDS,
} from 'store/DebtPosition/constants';

export const initialState = {
  debtPosition: null,
  financialCards: [],
  chartTime: 'Y',
  fetching: true,
};

export function reducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_DEBT_POSITION:
      return {
        ...state,
        debtPosition: payload,
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
