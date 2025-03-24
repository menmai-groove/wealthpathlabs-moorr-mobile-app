/*
 *
 * Auth ui reducer
 *
 */

import {
  ADD_TASK,
  RESET_AUTH,
  SET_CURRENT_TIME,
  UPDATE_ACCESS_TOKEN,
  UPDATE_LOGIN_ERROR,
  UPDATE_PASSWORD_TOKEN,
  UPDATE_REFRESH_TOKEN,
  UPDATE_STATIC_VALUES,
  UPDATE_STATIC_VALUES_DEFAULT,
  UPDATE_TERM_CONDITION_CONTENT,
  USER_LOGIN_FAIL,
  USER_SET_PROFILE_DATA,
} from 'store/Auth/constants';

export const initialState = {
  accessToken: null,
  refreshToken: null,
  passwordToken: null,
  user: null,
  error: null,
  staticValues: null,
  termCondition: null,
  task: null,
  time: null,
};

function authReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: action.payload.token,
      };
    case UPDATE_REFRESH_TOKEN:
      return {
        ...state,
        refreshToken: action.payload.token,
      };
    case UPDATE_PASSWORD_TOKEN:
      return {
        ...state,
        passwordToken: action.payload.token,
      };
    case USER_SET_PROFILE_DATA:
      return {
        ...state,
        user: action.payload.user,
      };
    case UPDATE_LOGIN_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case UPDATE_STATIC_VALUES: {
      const staticValues = state.staticValues ?? {};
      return {
        ...state,
        staticValues: { ...staticValues, ...action.payload.staticValues },
      };
    }
    case UPDATE_STATIC_VALUES_DEFAULT: {
      const staticValues = state.staticValues ?? {};
      return {
        ...state,
        staticValues: { ...staticValues, default: action.payload },
      };
    }
    case UPDATE_TERM_CONDITION_CONTENT:
      return {
        ...state,
        termCondition: action.payload,
      };
    case USER_LOGIN_FAIL:
      return {
        ...state,
        accessToken: null,
        refreshToken: null,
        passwordToken: null,
        user: null,
        staticValues: null,
        termCondition: null,
      };
    case RESET_AUTH:
      return initialState;
    case ADD_TASK:
      return {
        ...state,
        task: action.payload,
      };
    case SET_CURRENT_TIME:
      return {
        ...state,
        time: action.payload,
      };
    default:
      return state;
  }
}

export default authReducer;
