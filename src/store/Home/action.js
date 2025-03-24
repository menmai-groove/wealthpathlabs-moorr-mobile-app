import {
  GET_HOME_DATA,
  GET_REVIEW,
  GET_SHOW_ON_LOGIN,
  SET_ADD_FEEDBACK,
  SET_ASSET_POSITION,
  SET_CASH_POSITION,
  SET_DEBT_POSITION,
  SET_DO_FEEDBACK_LATER,
  SET_FEEDBACK_REVIEW,
  SET_HOME_DATA,
  SET_NET_WORTH,
  SET_REVIEW_STATUS,
  SET_SHOW_ON_LOGIN,
  SET_SHOW_REVIEW_PROMPT,
  SUBMIT_FEEDBACK,
  SUBMIT_FEEDBACK_SUGGESTION,
  SYNC_FINANCIAL_DATA,
} from 'store/Home/constants';

export const getHomeData = isRefresh => ({
  type: GET_HOME_DATA,
  payload: {
    isRefresh,
  },
});

export const setHomeData = data => ({
  type: SET_HOME_DATA,
  payload: {
    data,
  },
});

export const getReview = data => ({
  type: GET_REVIEW,
  payload: {
    data,
  },
});

export const syncFinancialData = data => ({
  type: SYNC_FINANCIAL_DATA,
  payload: data,
});

export const setDoFeedbackLater = () => ({
  type: SET_DO_FEEDBACK_LATER,
});

export const setAddFeedback = data => ({
  type: SET_ADD_FEEDBACK,
  payload: { data },
});

export const setFeedbackReview = data => ({
  type: SET_FEEDBACK_REVIEW,
  payload: {
    data,
  },
});

export const setShowReviewPrompt = data => ({
  type: SET_SHOW_REVIEW_PROMPT,
  payload: {
    data,
  },
});

export const setReviewStatus = () => ({
  type: SET_REVIEW_STATUS,
});

export const setShowOnLoginOnce = data => ({
  type: SET_SHOW_ON_LOGIN,
  payload: {
    data,
  },
});

export const getShowOnLogin = data => ({
  type: GET_SHOW_ON_LOGIN,
  payload: {
    data,
  },
});

export const setCashPosition = payload => ({
  type: SET_CASH_POSITION,
  payload,
});
export const setAssetPosition = payload => ({
  type: SET_ASSET_POSITION,
  payload,
});
export const setNetWorth = payload => ({
  type: SET_NET_WORTH,
  payload,
});
export const setDebtPosition = payload => ({
  type: SET_DEBT_POSITION,
  payload,
});

export const submitFeedback = payload => ({
  type: SUBMIT_FEEDBACK,
  payload,
});

export const submitFeedbackSuggestion = payload => ({
  type: SUBMIT_FEEDBACK_SUGGESTION,
  payload,
});
