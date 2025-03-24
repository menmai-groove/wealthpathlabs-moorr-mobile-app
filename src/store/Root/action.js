import {
  CLOSE_ALL_MODALS,
  GET_APP_CONFIG,
  INTERNET_RECONNECTED,
  OPEN_UPDATE_APP_MODAL,
  REDUX_ROOT_SAGA_ACTION,
  UPDATE_APP_CONNECTION,
  UPDATE_APP_LANGUAGE,
  UPDATE_APP_LOCALES,
  UPDATE_APP_PERMISSIONS,
  UPDATE_APP_PREFERENCE,
  UPDATE_APP_REMOTE_CONFIG_STATUS,
  UPDATE_APP_STATE,
  UPDATE_CHECK_USER_SUCCESS,
  UPDATE_CLIENT_THEME,
  UPDATE_NAVIGATION_READY,
  UPDATE_PHONE_UI_MODE_CHANGE,
  UPDATE_WITHOUT_INTERNET,
} from 'store/Root/constants';

export const rootSagaAction = () => ({
  type: REDUX_ROOT_SAGA_ACTION,
});

export const updateUIMode = data => ({
  type: UPDATE_PHONE_UI_MODE_CHANGE,
  payload: { data },
});

export const updateAppTheme = data => ({
  type: UPDATE_CLIENT_THEME,
  payload: { data },
});

export const updateAppPreference = data => ({
  type: UPDATE_APP_PREFERENCE,
  payload: {
    data,
  },
});

export const updateNavigationReady = data => ({
  type: UPDATE_NAVIGATION_READY,
  payload: {
    data,
  },
});

export const getAppConfig = appInfo => ({
  type: GET_APP_CONFIG,
  payload: appInfo,
});

export const updateAppState = data => ({
  type: UPDATE_APP_STATE,
  payload: {
    data,
  },
});

export const updateConnection = data => ({
  type: UPDATE_APP_CONNECTION,
  payload: {
    data,
  },
});

export const requestPermissionsSuccess = () => ({
  type: UPDATE_APP_PERMISSIONS,
  payload: {},
});

export const updateCheckUserSuccess = data => ({
  type: UPDATE_CHECK_USER_SUCCESS,
  payload: {
    data,
  },
});

export const openUpdateAppModal = data => ({
  type: OPEN_UPDATE_APP_MODAL,
  payload: {
    data,
  },
});

export const updateAppRemoteConfigStatus = data => ({
  type: UPDATE_APP_REMOTE_CONFIG_STATUS,
  payload: {
    data,
  },
});

export const updateAppLocales = data => ({
  type: UPDATE_APP_LOCALES,
  payload: {
    data,
  },
});

export const updateLanguage = data => ({
  type: UPDATE_APP_LANGUAGE,
  payload: {
    data,
  },
});

export const internetReconnected = () => ({
  type: INTERNET_RECONNECTED,
  payload: {},
});

export const closeAllModals = () => ({
  type: CLOSE_ALL_MODALS,
  payload: {},
});

export const updateWithoutInternet = data => ({
  type: UPDATE_WITHOUT_INTERNET,
  payload: { data },
});
