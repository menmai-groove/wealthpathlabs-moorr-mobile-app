import remoteConfig from '@react-native-firebase/remote-config';
import AppConfigs from 'constant/configs';

import DeviceInfoLib from './deviceInfo';

const remoteConfigInstance = remoteConfig();

const initialize = async () => {
  await remoteConfigInstance.setConfigSettings({
    minimumFetchIntervalMillis: AppConfigs.remoteConfigCachingTime * 1000,
  });
  await remoteConfigInstance.fetchAndActivate();
};

const getValue = key => remoteConfigInstance.getValue(key);

const getAll = () => remoteConfigInstance.getAll();

const getAppLocales = async langs => {
  try {
    const appLocales = langs.reduce((locales, lang) => {
      const locale = getValue(lang).asString();

      return { ...locales, [lang]: JSON.parse(locale) };
    }, {});

    return appLocales;
  } catch (err) {
    return {};
  }
};

const getAvailableLanguages = async () => {
  try {
    const availableLanguages = getValue('app_languages').asString();
    return JSON.parse(availableLanguages);
  } catch (err) {
    return {};
  }
};

const getAppSettings = async () => {
  try {
    const appSettings = getValue('app_settings').asString();
    return JSON.parse(appSettings);
  } catch (err) {
    return {};
  }
};

const getAppThemes = async () => {
  try {
    const appThemes = getValue('app_themes').asString();
    return JSON.parse(appThemes);
  } catch (err) {
    return {};
  }
};

const getActiveAppTheme = async theme => {
  try {
    if (theme) {
      const activeTheme = getValue(theme).asString();
      return JSON.parse(activeTheme);
    }
    return {};
  } catch (err) {
    return {};
  }
};

const getAppVersion = async () => {
  const currentVersion = await DeviceInfoLib.getVersion();
  try {
    const appVersionAsString = getValue('app_version').asString();
    return JSON.parse(appVersionAsString);
  } catch (err) {
    return [currentVersion];
  }
};

const getIsSystemMaintenance = () => {
  try {
    const isSystemMaintenance = getValue('is_system_maintenance').asBoolean();
    return isSystemMaintenance;
  } catch (err) {
    return false;
  }
};

export default {
  initialize,
  getValue,
  getAll,
  getAppLocales,
  getAvailableLanguages,
  getAppThemes,
  getActiveAppTheme,
  getAppSettings,
  getAppVersion,
  getIsSystemMaintenance,
};
