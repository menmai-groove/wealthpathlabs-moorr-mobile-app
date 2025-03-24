/*
 *
 * Signup actions
 *
 */

import {
  FETCH_TERM_CONDITION,
  SIGNUP,
  SIGNUP_FAIL,
  SIGNUP_RESET_DATA,
  SIGNUP_SUCCESS,
  UPDATE_SIGNUP_ERROR,
} from './constants';

export const signUpRequest = data => ({
  type: SIGNUP,
  payload: data,
});

export const signUpSuccess = data => ({
  type: SIGNUP_SUCCESS,
  payload: data,
});

export const signUpFail = () => ({
  type: SIGNUP_FAIL,
});

export const updateSignUpError = data => ({
  type: UPDATE_SIGNUP_ERROR,
  payload: data,
});

export const resetSignUpData = () => ({
  type: SIGNUP_RESET_DATA,
});

export const fetchTermCondition = data => ({
  type: FETCH_TERM_CONDITION,
  payload: data,
});
