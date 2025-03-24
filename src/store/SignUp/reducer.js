/*
 *
 * Sign up reducer
 *
 */

import {
  SIGNUP,
  SIGNUP_FAIL,
  SIGNUP_RESET_DATA,
  SIGNUP_SUCCESS,
  UPDATE_SIGNUP_ERROR,
} from './constants';

export const initialState = {
  success: false,
  data: null,
  error: null,
};

function signUpReducer(state = initialState, action) {
  switch (action.type) {
    case SIGNUP:
    case SIGNUP_RESET_DATA:
      return {
        ...state,
        data: null,
        success: false,
        error: null,
      };
    case SIGNUP_SUCCESS:
      return {
        ...state,
        success: true,
        data: action.payload,
        error: null,
      };
    case SIGNUP_FAIL:
      return {
        ...state,
        success: false,
        data: null,
      };
    case UPDATE_SIGNUP_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

export default signUpReducer;
