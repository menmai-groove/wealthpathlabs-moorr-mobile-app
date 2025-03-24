import { AppConstants } from 'constant';
import {
  CLOSE_ALL_MODALS,
  OPEN_UPDATE_APP_MODAL,
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
import themeDefault from 'theme/theme.json';

export const initialState = {
  appConnection: true,
  appPermissions: false,
  appState: 'active',
  appTheme: themeDefault,
  checkUserSuccess: false,
  checkUpdateApp: false,
  configLoaded: false,
  isNavReady: false,
  isDarkMode: false,
  preference: {},
  language: AppConstants.defaultLanguage,
  onBoarding: false,
  availableLanguages: AppConstants.availableLanguages,
  closeModalsRefreshId: null,
  withoutInternet: false,
};

export function rootReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_NAVIGATION_READY:
      return {
        ...state,
        isNavReady: action.payload.data,
      };
    case UPDATE_CHECK_USER_SUCCESS:
      return {
        ...state,
        checkUserSuccess: action.payload.data,
      };
    case OPEN_UPDATE_APP_MODAL:
      return {
        ...state,
        checkUpdateApp: action.payload.data,
      };
    case UPDATE_APP_REMOTE_CONFIG_STATUS:
      return {
        ...state,
        configLoaded: action.payload.data,
      };
    case UPDATE_APP_PREFERENCE:
      return {
        ...state,
        preference: action.payload.data,
      };
    case UPDATE_CLIENT_THEME:
      return {
        ...state,
        appTheme: action.payload.data,
      };
    case UPDATE_PHONE_UI_MODE_CHANGE:
      return {
        ...state,
        isDarkMode: action.payload.data,
      };
    case UPDATE_APP_CONNECTION:
      return {
        ...state,
        appConnection: action.payload.data,
      };
    case UPDATE_APP_PERMISSIONS:
      return {
        ...state,
        appPermissions: true,
      };
    case UPDATE_APP_STATE:
      return {
        ...state,
        appState: action.payload.data,
      };
    case UPDATE_APP_LOCALES:
      return {
        ...state,
        availableLanguages: action.payload.data,
      };
    case UPDATE_APP_LANGUAGE:
      return {
        ...state,
        language: action.payload.data,
      };
    case CLOSE_ALL_MODALS:
      return {
        ...state,
        closeModalsRefreshId: Date.now(),
      };
    case UPDATE_WITHOUT_INTERNET:
      return {
        ...state,
        withoutInternet: action.payload.data,
      };
    default:
      return state;
  }
}
