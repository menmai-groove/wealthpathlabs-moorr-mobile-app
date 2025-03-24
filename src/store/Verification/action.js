import {
  GENERATE_EMAIL_CODE,
  GET_TWO_FA_METHODS,
  RESEND_SMS,
  SET_TWO_FA_METHODS,
  VERIFY_AUTHENTICATOR,
  VERIFY_EMAIL_CODE,
  VERIFY_SMS,
  VERIFY_SUCCESS,
} from 'store/Verification/constants';

export const verifyAuthenticator = data => ({
  type: VERIFY_AUTHENTICATOR,
  payload: data,
});
export const verifySuccess = data => ({
  type: VERIFY_SUCCESS,
  payload: data,
});
export const verifySms = data => ({
  type: VERIFY_SMS,
  payload: data,
});
export const resendSms = data => ({
  type: RESEND_SMS,
  payload: data,
});
export const getTwoFAMethods = () => ({
  type: GET_TWO_FA_METHODS,
});
export const setTwoFAMethods = data => ({
  type: SET_TWO_FA_METHODS,
  payload: data,
});
export const generateEmailCode = () => ({
  type: GENERATE_EMAIL_CODE,
});
export const verifyEmailCode = data => ({
  type: VERIFY_EMAIL_CODE,
  payload: data,
});
