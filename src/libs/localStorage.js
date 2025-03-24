import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConstants } from 'constant';
import { isEmpty, isNil } from 'lodash';
import themeDefault from 'theme/theme.json';

import Constants from './constants';
import GlobalLib from './global';

const TenantData = {
  get: async key => {
    try {
      const tenant = GlobalLib.Tenant.get();
      const tenantKey = `${key}/${tenant.id}`;
      const currentTenant = await AsyncStorage.getItem(tenantKey);
      return currentTenant;
    } catch (error) {
      return null;
    }
  },
  set: async (key, value) => {
    const tenant = GlobalLib.Tenant.get();
    const tenantKey = `${key}/${tenant.id}`;
    await AsyncStorage.setItem(tenantKey, value);
  },
  remove: async key => {
    const tenant = GlobalLib.Tenant.get();
    const tenantKey = `${key}/${tenant.id}`;
    await AsyncStorage.removeItem(tenantKey);
  },
};

const AppConfig = {
  set: async config => {
    await TenantData.set(Constants.asyncStorageKeys.appConfig, JSON.stringify(config));
  },
  get: async () => {
    try {
      const config = await TenantData.get(Constants.asyncStorageKeys.appConfig);
      if (!isNil(config)) {
        return JSON.parse(config);
      }
      return {};
    } catch (error) {
      return {};
    }
  },
  remove: async () => {
    await TenantData.remove(Constants.asyncStorageKeys.appConfig);
  },
};

const AppTheme = {
  set: async config => {
    await TenantData.set(Constants.asyncStorageKeys.appTheme, JSON.stringify(config));
  },
  get: async () => {
    try {
      const theme = await TenantData.get(Constants.asyncStorageKeys.appTheme);
      if (isNil(theme) || isEmpty(theme)) {
        return themeDefault;
      }
      return JSON.parse(theme);
    } catch (error) {
      return {};
    }
  },
  remove: async () => {
    await TenantData.remove(Constants.asyncStorageKeys.appTheme);
  },
};

const AppLanguage = {
  set: async lang => {
    await TenantData.set(Constants.asyncStorageKeys.appLanguage, lang);
  },
  get: async () => {
    try {
      const data = await TenantData.get(Constants.asyncStorageKeys.appLanguage);
      if (isNil(data) || isEmpty(data)) {
        return AppConstants.defaultLanguage;
      }
      return data;
    } catch (error) {
      return AppConstants.defaultLanguage;
    }
  },
  remove: async () => {
    await TenantData.remove(Constants.asyncStorageKeys.appLanguage);
  },
};

const RefreshToken = {
  set: async value => {
    await AsyncStorage.setItem(Constants.asyncStorageKeys.refreshToken, value);
  },
  get: async () => {
    try {
      const value = await AsyncStorage.getItem(Constants.asyncStorageKeys.refreshToken);
      if (!isNil(value)) {
        return value;
      }
      return '';
    } catch (error) {
      return '';
    }
  },
  remove: async () => {
    await AsyncStorage.removeItem(Constants.asyncStorageKeys.refreshToken);
  },
};

const OnBoardingInterview = {
  set: async value => {
    await TenantData.set(Constants.asyncStorageKeys.onBoardingInterview, JSON.stringify(value));
  },
  get: async () => {
    try {
      const data = await TenantData.get(Constants.asyncStorageKeys.onBoardingInterview);
      if (isNil(data) || isEmpty(data)) {
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  },
  remove: async () => {
    await TenantData.remove(Constants.asyncStorageKeys.onBoardingInterview);
  },
};

const SkipOnBoardingIntroduce = {
  set: async value => {
    await AsyncStorage.setItem(
      Constants.asyncStorageKeys.onBoardingIntroduce,
      JSON.stringify(value),
    );
  },
  get: async () => {
    try {
      const value = await AsyncStorage.getItem(Constants.asyncStorageKeys.onBoardingIntroduce);
      if (!isNil(value)) {
        return JSON.parse(value);
      }
      return false;
    } catch (error) {
      return false;
    }
  },
  remove: async () => {
    await AsyncStorage.removeItem(Constants.asyncStorageKeys.onBoardingIntroduce);
  },
};

const EnableAppReview = {
  set: async value => {
    await AsyncStorage.setItem(Constants.asyncStorageKeys.enableAppReview, JSON.stringify(value));
  },
  get: async () => {
    try {
      const value = await AsyncStorage.getItem(Constants.asyncStorageKeys.enableAppReview);
      if (!isNil(value)) {
        return JSON.parse(value);
      }
      return false;
    } catch (error) {
      return false;
    }
  },
  remove: async () => {
    await AsyncStorage.removeItem(Constants.asyncStorageKeys.enableAppReview);
  },
};

const RememberMe = {
  set: async email => {
    await AsyncStorage.setItem(Constants.asyncStorageKeys.rememberMe, email);
  },
  get: async () => {
    try {
      const email = await AsyncStorage.getItem(Constants.asyncStorageKeys.rememberMe);
      if (!isNil(email)) {
        return email;
      }
      return '';
    } catch (error) {
      return '';
    }
  },
  remove: async () => {
    await AsyncStorage.removeItem(Constants.asyncStorageKeys.rememberMe);
  },
};

// List biometric setup: store list email and count [{email, count}]
const ListBiometricSetup = {
  set: async value => {
    await TenantData.set(Constants.asyncStorageKeys.listBiometricSetup, JSON.stringify(value));
  },
  get: async () => {
    try {
      const data = await TenantData.get(Constants.asyncStorageKeys.listBiometricSetup);
      if (isNil(data) || isEmpty(data)) {
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  },
  remove: async () => {
    await TenantData.remove(Constants.asyncStorageKeys.listBiometricSetup);
  },
};

export default {
  AppConfig,
  AppTheme,
  AppLanguage,
  RefreshToken,
  OnBoardingInterview,
  SkipOnBoardingIntroduce,
  EnableAppReview,
  RememberMe,
  ListBiometricSetup,
};
