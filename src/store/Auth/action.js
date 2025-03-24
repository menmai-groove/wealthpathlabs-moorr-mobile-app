/*
 *
 * Auth actions
 *
 */

import {
  ADD_TASK,
  ADD_TRUSTED_DEVICE,
  CHECK_USER_LOGIN,
  DELETE_FCM_TOKEN,
  GET_ACCESS_TOKEN_SUCCESS,
  GET_CURRENT_TIME,
  GET_STATIC_VALUES,
  GET_STATIC_VALUES_DEFAULT,
  ON_ACCOUNT_IS_STRONG_AUTH,
  ON_REFRESH_DEVICE_ACCESS_TOKEN,
  ON_VERIFY_DEVICE,
  OPEN_MY_KNOWLEDGE,
  RESET_AUTH,
  SETUP_BIOMETRIC_IN_PROMPT,
  SET_CURRENT_TIME,
  UPDATE_ACCESS_TOKEN,
  UPDATE_BIOMETRICS_DATA,
  UPDATE_BIOMETRICS_MANUAL,
  UPDATE_LOGIN_ERROR,
  UPDATE_PASSWORD_TOKEN,
  UPDATE_REFRESH_TOKEN,
  UPDATE_STATIC_VALUES,
  UPDATE_STATIC_VALUES_DEFAULT,
  UPDATE_TENANT,
  UPDATE_TERM_CONDITION_CONTENT,
  UPDATE_USER_EMAIL,
  USER_CHANGE_PASSWORD,
  USER_DELETION,
  USER_EXPIRE,
  USER_GET_PROFILE,
  USER_LOGIN_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGOUT,
  USER_SET_PROFILE_DATA,
  USER_UPDATE_TERM_CONDITION,
  USER_UPDATE_USER,
  USER_UPDATE_USER_HOUSEHOLD,
} from 'store/Auth/constants';

export const getAccessTokenSuccess = () => ({
  type: GET_ACCESS_TOKEN_SUCCESS,
  payload: {},
});

export const updateAccessToken = token => ({
  type: UPDATE_ACCESS_TOKEN,
  payload: {
    token,
  },
});

export const updateRefreshToken = token => ({
  type: UPDATE_REFRESH_TOKEN,
  payload: {
    token,
  },
});

export const updatePasswordToken = token => ({
  type: UPDATE_PASSWORD_TOKEN,
  payload: {
    token,
  },
});

export const updateTenant = tenant => ({
  type: UPDATE_TENANT,
  payload: {
    tenant,
  },
});

export const checkUserLogin = () => ({
  type: CHECK_USER_LOGIN,
  payload: {},
});

export const loginRequest = data => ({
  type: USER_LOGIN_REQUEST,
  payload: data,
});

export const loginFail = () => ({
  type: USER_LOGIN_FAIL,
});

export const updateLoginError = data => ({
  type: UPDATE_LOGIN_ERROR,
  payload: data,
});

export const logout = () => ({
  type: USER_LOGOUT,
  payload: {},
});

export const expireToken = () => ({
  type: USER_EXPIRE,
  payload: {},
});

export const addTrustedDevice = () => ({
  type: ADD_TRUSTED_DEVICE,
});

export const deleteFcmToken = () => ({
  type: DELETE_FCM_TOKEN,
});

export const resetAuth = () => ({
  type: RESET_AUTH,
});

export const getProfile = data => ({
  type: USER_GET_PROFILE,
  payload: data,
});

export const setProfile = user => ({
  type: USER_SET_PROFILE_DATA,
  payload: {
    user,
  },
});

export const changePassword = data => ({
  type: USER_CHANGE_PASSWORD,
  payload: data,
});

export const updateTermCondition = () => ({
  type: USER_UPDATE_TERM_CONDITION,
});

export const onVerifyDevice = message => ({
  type: ON_VERIFY_DEVICE,
  payload: message,
});

export const onRefreshDeviceAccessToken = message => ({
  type: ON_REFRESH_DEVICE_ACCESS_TOKEN,
  payload: message,
});

export const getStaticValues = () => ({
  type: GET_STATIC_VALUES,
});

export const updateStaticValues = staticValues => ({
  type: UPDATE_STATIC_VALUES,
  payload: {
    staticValues,
  },
});

export const getStaticValuesDefault = () => ({
  type: GET_STATIC_VALUES_DEFAULT,
});

export const updateStaticValuesDefault = payload => ({
  type: UPDATE_STATIC_VALUES_DEFAULT,
  payload,
});
export const updateBiometrics = data => ({
  type: UPDATE_BIOMETRICS_DATA,
  payload: data,
});

export const updateTermConditionContent = data => ({
  type: UPDATE_TERM_CONDITION_CONTENT,
  payload: data,
});

export const updateUser = data => ({
  type: USER_UPDATE_USER,
  payload: data,
});
export const updateUserHousehold = data => ({
  type: USER_UPDATE_USER_HOUSEHOLD,
  payload: data,
});

export const addTask = data => ({
  type: ADD_TASK,
  payload: data,
});

export const getCurrentTime = () => ({
  type: GET_CURRENT_TIME,
  payload: {},
});

export const setCurrentTime = data => ({
  type: SET_CURRENT_TIME,
  payload: data,
});

export const setupBiometricInPrompt = data => ({
  type: SETUP_BIOMETRIC_IN_PROMPT,
  payload: data,
});

export const onAccountIsStrongAuth = () => ({
  type: ON_ACCOUNT_IS_STRONG_AUTH,
  payload: {},
});

export const updateBiometricsManual = () => ({
  type: UPDATE_BIOMETRICS_MANUAL,
  payload: {},
});

export const deleteUser = data => ({
  type: USER_DELETION,
  payload: data,
});

export const updateUserEmail = data => ({
  type: UPDATE_USER_EMAIL,
  payload: data,
});

export const openMyKnowledge = () => ({
  type: OPEN_MY_KNOWLEDGE,
});
