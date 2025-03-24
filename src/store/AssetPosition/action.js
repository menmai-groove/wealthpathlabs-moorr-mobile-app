import {
  GET_ASSET_POSITION,
  SET_ASSET_POSITION,
  SET_CHART_TIME,
  SET_FETCHING,
  SET_FINANCIAL_CARDS,
  SUBMIT_FEEDBACK,
} from 'store/AssetPosition/constants';

export const getAssetPosition = isRefresh => ({
  type: GET_ASSET_POSITION,
  payload: {
    isRefresh,
  },
});

export const setAssetPosition = payload => ({
  type: SET_ASSET_POSITION,
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
