/*
 *
 * Reset password actions
 *
 */

import { REQUEST_RESET_PASSWORD, UPDATE_RESET_PASSWORD_ERROR } from 'store/ResetPassword/constants';

export const requestResetPassword = data => ({
  type: REQUEST_RESET_PASSWORD,
  payload: data,
});

export const updateResetPasswordError = data => ({
  type: UPDATE_RESET_PASSWORD_ERROR,
  payload: data,
});
