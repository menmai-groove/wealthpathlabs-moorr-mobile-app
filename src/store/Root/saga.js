import NetInfo from '@react-native-community/netinfo';
import i18n, { runTimeTranslations } from 'bootstrap/i18n';
import { AppConfigs, AppConstants } from 'constant';
import {
  AnalyticsLib,
  DeviceInfoLib,
  GlobalLib,
  // LocalStorageLib,
  RemoteConfigLib,
  UtilLib,
} from 'libs';
import _ from 'lodash';
import { Platform } from 'react-native';
import { all, call, cancelled, delay, put, select, take, takeLatest } from 'redux-saga/effects';
import {
  openUpdateAppModal,
  updateAppLocales,
  updateAppPreference,
  updateAppRemoteConfigStatus,
  updateAppTheme,
  updateLanguage,
} from 'store/Root/action';
import { GET_APP_CONFIG, INTERNET_RECONNECTED, UPDATE_APP_LANGUAGE } from 'store/Root/constants';
import { selectAppTheme } from 'store/Root/selector';

function* getAppConfigSaga(action) {
  const { retry = AppConfigs.retryNetwork } = action.payload;
  const appInfo = yield all([call(DeviceInfoLib.getVersion), call(DeviceInfoLib.getBuildNumber)]);

  try {
    yield call(RemoteConfigLib.initialize);
    // Other app settings
    const initialTheme = yield select(selectAppTheme);
    const availableLanguages = yield call(RemoteConfigLib.getAvailableLanguages);
    const appSettings = yield call(RemoteConfigLib.getAppSettings);
    const appThemes = yield call(RemoteConfigLib.getAppThemes);
    const appVersion = yield call(RemoteConfigLib.getAppVersion);
    let themeApp = yield call(RemoteConfigLib.getActiveAppTheme, _.get(appThemes, [0, 'value']));
    let preference = _.get(appSettings, ['preferences']);

    if (availableLanguages.length) {
      yield put(updateAppLocales(availableLanguages));
      const appLanguage = _.get(availableLanguages, [0, 'value']);
      // const appLanguage = yield call(LocalStorageLib.AppLanguage.get);
      yield put(updateLanguage(appLanguage));
    }

    themeApp = _.merge({}, initialTheme, themeApp);
    yield call(GlobalLib.Palette.set, _.get(themeApp, ['palette']));
    yield put(updateAppTheme(themeApp));
    yield put(updateAppPreference(preference));

    const currentVersion = appInfo[0];
    if (
      _.isArray(appVersion) &&
      appVersion.length &&
      !UtilLib.isSupportedVersion(appVersion, currentVersion)
    ) {
      yield put(openUpdateAppModal(true));
    } else if (_.isPlainObject(appVersion)) {
      let targetAppVersion = appVersion.default;
      let platformVersion = parseInt(Platform.Version, 10);
      let checkedVersion = null;
      if (appVersion.versions) {
        for (let v in appVersion.versions) {
          const ver = parseInt(v, 10);
          if (platformVersion >= ver && (!checkedVersion || checkedVersion <= ver)) {
            targetAppVersion = appVersion.versions[v];
            checkedVersion = ver;
          }
        }
      }
      if (
        _.isArray(targetAppVersion) &&
        targetAppVersion.length &&
        !UtilLib.isSupportedVersion(targetAppVersion, currentVersion)
      ) {
        yield put(openUpdateAppModal(true));
      }
    }

    yield put(updateAppRemoteConfigStatus(true));
  } catch (e) {
    yield cancelled();
    yield put(updateAppRemoteConfigStatus(true));

    let netState = yield call(NetInfo.fetch);
    if (!netState.isInternetReachable && retry > 0) {
      yield delay(1000);
      netState = yield call(NetInfo.fetch);
      if (!netState.isInternetReachable) {
        yield take(INTERNET_RECONNECTED);
      }
      yield getAppConfigSaga({
        ...action,
        payload: {
          ...action.payload,
          retry: retry - 1,
        },
      });
    }
  }
}

function* changeLanguageSaga(action) {
  try {
    const { data: lang } = action.payload || {};
    if (!lang) {
      return;
    }

    const appLocales = yield call(RemoteConfigLib.getAppLocales, [lang]);
    const language = i18n.getResourceBundle(lang, AppConstants.defaultLanguageNamespace);

    if ((_.isNil(appLocales[lang]) || _.isEmpty(appLocales[lang])) && !_.isEmpty(language)) {
      appLocales[lang] =
        i18n?.default?.options?.compatibilityJSON === 'v1' ? language.data : language;
    }

    if (Object.keys(appLocales).length) {
      // Load languages
      Object.keys(appLocales).map(lng => {
        i18n.loadLanguages([lng]).then(() => {
          runTimeTranslations(appLocales[lng], lng);
        });
      });

      i18n.changeLanguage(lang);
      // LocalStorageLib.AppLanguage.set(lang);
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.switchLanguage, {
        language: lang,
      });
    }
  } catch (error) {}
}

export default function* defaultSaga() {
  yield takeLatest(GET_APP_CONFIG, getAppConfigSaga);
  yield takeLatest(UPDATE_APP_LANGUAGE, changeLanguageSaga);
}
