import {
  SET_ASSET_POSITION,
  SET_CHART_TIME,
  SET_FETCHING,
  SET_FINANCIAL_CARDS,
} from 'store/AssetPosition/constants';

export const initialState = {
  assetPosition: null,
  financialCards: [],
  chartTime: 'Y',
  fetching: true,
};

export function reducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_ASSET_POSITION:
      return {
        ...state,
        assetPosition: payload,
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
