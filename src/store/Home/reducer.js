import {
  SET_ASSET_POSITION,
  SET_CASH_POSITION,
  SET_DEBT_POSITION,
  SET_FEEDBACK_REVIEW,
  SET_HOME_DATA,
  SET_NET_WORTH,
  SET_SHOW_ON_LOGIN,
  SET_SHOW_REVIEW_PROMPT,
} from 'store/Home/constants';

export const initialState = {
  allLoaded: false,
  expenses: null,
  income: null,
  assets: null,
  borrowings: null,
  clientHistory: {
    allLoaded: false,
    propertyPortfolio: null,
  },
  feedbackReview: null,
  showReviewPrompt: false,
  showOnLoginOnce: false,
  cashPosition: [],
  assetPosition: [],
  netWorth: [],
  debtPosition: [],
};

export function homeReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_HOME_DATA:
      return {
        ...state,
        ...payload.data,
        allLoaded: true,
      };
    case SET_FEEDBACK_REVIEW:
      return {
        ...state,
        feedbackReview: payload.data,
      };
    case SET_SHOW_REVIEW_PROMPT:
      return {
        ...state,
        showReviewPrompt: payload.data,
      };
    case SET_SHOW_ON_LOGIN:
      return {
        ...state,
        showOnLoginOnce: payload.data,
      };
    case SET_CASH_POSITION:
      return {
        ...state,
        cashPosition: payload,
      };
    case SET_ASSET_POSITION:
      return {
        ...state,
        assetPosition: payload,
      };
    case SET_NET_WORTH:
      return {
        ...state,
        netWorth: payload,
      };
    case SET_DEBT_POSITION:
      return {
        ...state,
        debtPosition: payload,
      };
    default:
      return state;
  }
}
