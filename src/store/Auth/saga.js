import i18n from 'bootstrap/i18n';
import { AppConstants, AppScreenID } from 'constant';
import CryptoJS from 'crypto-js';
import { LocalStorageLib } from 'libs';
import AnalyticsLib from 'libs/analytics';
import DeviceInfoLib from 'libs/deviceInfo';
import GlobalLib from 'libs/global';
import NavigationServiceLib from 'libs/navigationService';
import NotificationLib, { DELAY_FCM_TIMEOUT } from 'libs/notification';
import SagaLib from 'libs/saga';
import { get, isEmpty, isNil } from 'lodash';
import moment from 'moment';
import { Platform } from 'react-native';
import {
  all,
  call,
  delay,
  fork,
  put,
  putResolve,
  race,
  select,
  take,
  takeEvery,
  takeLatest,
  takeLeading,
} from 'redux-saga/effects';
import { getBiometricInfo } from 'services/biometrics';
import Keychain from 'services/keychain';
import {
  addTrustedDevice,
  deleteFcmToken,
  expireToken,
  getAccessTokenSuccess,
  loginFail,
  resetAuth,
  setCurrentTime,
  setProfile,
  updateAccessToken,
  updateBiometrics,
  updatePasswordToken,
  updateRefreshToken,
  updateStaticValues,
  updateStaticValuesDefault,
  updateTenant,
  updateTermConditionContent,
} from 'store/Auth/action';
import {
  CHECK_USER_LOGIN,
  GET_CURRENT_TIME,
  GET_STATIC_VALUES,
  GET_STATIC_VALUES_DEFAULT,
  ON_ACCOUNT_IS_STRONG_AUTH,
  ON_REFRESH_DEVICE_ACCESS_TOKEN,
  ON_VERIFY_DEVICE,
  OPEN_MY_KNOWLEDGE,
  RESET_AUTH,
  SETUP_BIOMETRIC_IN_PROMPT,
  UPDATE_BIOMETRICS_DATA,
  UPDATE_BIOMETRICS_MANUAL,
  UPDATE_TENANT,
  USER_CHANGE_PASSWORD,
  USER_DELETION,
  USER_EXPIRE,
  USER_GET_PROFILE,
  USER_LOGIN_REQUEST,
  USER_LOGOUT,
  USER_UPDATE_TERM_CONDITION,
  USER_UPDATE_USER,
  USER_UPDATE_USER_HOUSEHOLD,
} from 'store/Auth/constants';
import {
  ADD_DEVICE_QUERY,
  CHANGE_PASSWORD_QUERY,
  DELETE_ACCOUNT,
  GET_CURRENT_TIME_QUERY,
  GET_ME,
  GET_MY_KNOWLEDGE_LINK,
  GET_STATIC_VALUES_DEFAULT_QUERY,
  GET_STATIC_VALUES_QUERY,
  LOGIN_QUERY,
  LOGOUT_QUERY,
  REFRESH_ACCESS_TOKEN_QUERY,
  REFRESH_DEVICE_ACCESS_TOKEN_QUERY,
  UPDATE_ME,
  UPDATE_ME1,
  VERIFY_DEVICE_QUERY,
} from 'store/Auth/query';
import { selectRefreshToken, selectUser } from 'store/Auth/selector';
import { selectAppPreference } from 'store/Root/selector';
import { getTwoFAMethods } from 'store/Verification/action';

import AppMeta from '../../../app.json';

const COMMON_NOTIFICATION_TOPIC = AppConstants.notificationTopic.Global;
const AUTH_NOTIFICATION_TOPIC = AppConstants.notificationTopic.Authorized;

export function* updateCredentialSaga({ refreshToken, accessToken, tenantId }) {
  yield all([
    tenantId && putResolve(updateTenant(tenantId)),
    putResolve(updateAccessToken(accessToken)),
    putResolve(updateRefreshToken(refreshToken)),
  ]);
}

function* handleAddDeviceSaga(fcmToken) {
  try {
    const deviceId = yield call(DeviceInfoLib.getUniqueId);

    const deviceInfo = () => {
      switch (Platform.OS) {
        case 'android':
          return {
            name: `${Platform.constants.Brand} ${Platform.constants.Model}`,
            platform: 'ANDROID',
            token: fcmToken,
          };
        case 'ios':
          return {
            name: 'Apple Device',
            platform: 'IOS',
            token: fcmToken,
          };
        default:
          null;
      }
    };
    const addDeviceInput = {
      info: deviceInfo(),
      deviceId,
      ref: '',
    };

    const [addDeviceResponse, { message }] = yield all([
      SagaLib.mutationCall(ADD_DEVICE_QUERY, addDeviceInput),
      race({
        message: take(ON_VERIFY_DEVICE),
        timeout: delay(DELAY_FCM_TIMEOUT),
      }),
    ]);

    if (addDeviceResponse?.data?.me?.addDevice === 'ok') {
      if (message) {
        yield put(addTrustedDevice());

        const verifyDeviceInput = {
          pin: message?.payload?.data?.pin,
          deviceId,
          pushToken: fcmToken,
        };

        const verifyDeviceResponse = yield SagaLib.mutationCall(
          VERIFY_DEVICE_QUERY,
          verifyDeviceInput,
        );
        const verifyDevice = verifyDeviceResponse?.data?.me?.verifyDevice;

        if (verifyDevice) {
          yield call(updateCredentialSaga, {
            refreshToken: verifyDevice?.refresh?.token,
            accessToken: verifyDevice?.access?.token,
          });
        }
      }
    }
  } catch (error) {}
}

export function* handleNotificationWhenLogin() {
  try {
    yield call(NotificationLib.subscribeFromTopic, AUTH_NOTIFICATION_TOPIC);
    const fcmToken = yield call(NotificationLib.getToken);
    if (fcmToken) {
      yield delay(1000);
      yield fork(handleAddDeviceSaga, fcmToken);
    }
  } catch (error) {}
}

function* deleteFcmTokenSaga(fcmToken) {
  try {
    yield SagaLib.mutationCall(
      LOGOUT_QUERY,
      {
        pushToken: fcmToken,
      },
      {
        noWaitingNetwork: true,
      },
    );
    yield put(deleteFcmToken());
  } catch (error) {}
}

function* handleNotificationWhenSignOut() {
  try {
    const fcmToken = yield call(NotificationLib.getToken);
    yield call(deleteFcmTokenSaga, fcmToken);
  } catch (error) {}
}

export function* resetToLoginSaga() {
  yield put(expireToken());
  yield take(RESET_AUTH);
  yield NavigationServiceLib.reset(AppScreenID.Login);
}

function* handleRefreshDeviceAccessToken() {
  try {
    const fcmToken = yield call(NotificationLib.getToken);
    const refreshToken = yield select(selectRefreshToken);
    const [refreshTokenResponse, { message }] = yield all([
      SagaLib.mutationCall(REFRESH_DEVICE_ACCESS_TOKEN_QUERY, {
        token: fcmToken,
        refresh: refreshToken,
        ref: '',
      }),
      race({
        message: take(ON_REFRESH_DEVICE_ACCESS_TOKEN),
        timeout: delay(DELAY_FCM_TIMEOUT),
      }),
    ]);

    if (refreshTokenResponse?.data?.refreshDeviceAccessToken && message) {
      const access = {
        token: message?.accessToken,
        decoded: {
          ...(message?.accessIat ? { iat: parseInt(message?.accessIat, 10) } : {}),
          ...(message?.accessExp ? { exp: parseInt(message?.accessExp, 10) } : {}),
          strongAuth: message?.strongAuth,
        },
      };
      const refresh = {
        token: message?.token,
        decoded: {
          ...(message?.iat ? { iat: parseInt(message?.iat, 10) } : {}),
          ...(message?.exp ? { exp: parseInt(message?.exp, 10) } : {}),
        },
      };

      yield call(updateCredentialSaga, {
        refreshToken: refresh?.token,
        accessToken: access?.token,
      });
      yield put(getAccessTokenSuccess());
      return { refresh, access };
    }
    throw { message: i18n.t('errorMsg.expiredSession') };
  } catch (e) {
    throw { message: i18n.t('errorMsg.expiredSession') };
  }
}

export function* getAccessTokenSaga({ refreshToken }) {
  try {
    const refreshTokenResponse = yield SagaLib.mutationCall(REFRESH_ACCESS_TOKEN_QUERY, {
      refresh: refreshToken,
    });
    const refreshAccessToken = refreshTokenResponse?.data?.refreshAccessToken;
    if (refreshAccessToken) {
      yield call(updateCredentialSaga, {
        accessToken: refreshAccessToken?.access?.token,
        refreshToken: refreshAccessToken?.refresh?.token,
      });
      // this put is only used for _handleTokenExpired in lib/saga
      yield put(getAccessTokenSuccess());
    }
    return refreshAccessToken;
  } catch (error) {
    const refreshExpired = error?.errors?.some(e => e.message === 'wrong-refresh-jwt');
    if (refreshExpired) {
      const refreshAccessToken = yield call(handleRefreshDeviceAccessToken);
      return refreshAccessToken;
    } else {
      throw error;
    }
  }
}

function* checkUserLoginSaga() {
  const hideOnBoarding = yield call(LocalStorageLib.SkipOnBoardingIntroduce.get);
  if (hideOnBoarding) {
    yield call(LocalStorageLib.EnableAppReview.set, true);
  }
  hideOnBoarding
    ? NavigationServiceLib.reset(AppScreenID.Login)
    : NavigationServiceLib.reset(AppScreenID.OnBoardingHome);
}

export function* handleTermCondition() {
  // handle load data remotely
  try {
    const { termConditionJsonLink } = yield select(selectAppPreference);
    const res = yield SagaLib.networkCall(termConditionJsonLink, {
      skipAuthorization: true,
      // headers: {
      //   'Content-Length': 0,
      //   'Content-Type': 'text/plain',
      // },
      // responseType: 'text',
    });
    let content;
    let publishedAt;
    const data = get(res, ['data']);
    if (typeof data === 'object') {
      content = data?.content;
      publishedAt = data?.publishedAt;
    }
    if (typeof data === 'string') {
      content = data.substring(data.indexOf('"content":') + 10);
      content = content.substring(content.indexOf('"') + 1, content.lastIndexOf('"'));
      content = content.trim();
      publishedAt = JSON.parse(data.replace(content, ''))?.publishedAt;
    }
    const termCondition = {
      publishedAt,
      content,
    };
    return termCondition;
  } catch (err) {
    return null;
  }
}

export function* getProfileSaga(action = {}) {
  const { resolver = {} } = action;
  const meResponse = yield SagaLib.queryCall(GET_ME);
  const me = meResponse?.data?.me;
  yield putResolve(setProfile(me));
  const id = me?._id;
  const email = me?.email;
  const name = me?.client?.personalInfo?.client1?.fName;
  AnalyticsLib.setUserProfile(id, email);
  AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.login, {
    id,
    email,
    name,
  });
  typeof resolver?.resolve === 'function' && resolver?.resolve();
  return me;
}

export function* getStaticValuesDefaultSaga() {
  yield delay(400);
  const staticValuesResponse = yield SagaLib.queryCall(GET_STATIC_VALUES_DEFAULT_QUERY);
  const staticValues = staticValuesResponse?.data?.me?.staticValues?.default;
  if (staticValues) {
    yield putResolve(updateStaticValuesDefault(staticValues));
  } else {
    yield putResolve(updateStaticValuesDefault(null));
  }
  return staticValues;
}

export function* getStaticValuesSaga() {
  const staticValuesResponse = yield SagaLib.queryCall(GET_STATIC_VALUES_QUERY);
  const staticValues = staticValuesResponse?.data?.me?.staticValues;
  if (staticValues) {
    yield putResolve(updateStaticValues(staticValues));
    yield fork(getStaticValuesDefaultSaga);
  } else {
    yield putResolve(updateStaticValues(null));
  }
  return staticValues;
}

export function* isShowPromptBiometricSetup(payload) {
  try {
    const { email } = payload;
    const isRegistered = yield Keychain.getAccountIfRegistered(email);
    if (isRegistered) {
      return false;
    }
    const checkBiometricAvailabel = yield call(getBiometricInfo);
    if (!checkBiometricAvailabel?.available) {
      return false;
    }
    const listBiometricSetup = yield call(LocalStorageLib.ListBiometricSetup.get);
    const account = listBiometricSetup.find(acc => acc.email === email);
    if (isEmpty(account)) {
      listBiometricSetup.push({ email, count: 2 });
      yield call(LocalStorageLib.ListBiometricSetup.set, listBiometricSetup);
      return true;
    } else {
      return account.count > 0;
    }
  } catch (error) {
    return false;
  }
}

function* handleLoginWhenAccountIsStrongAuthSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { resolver = {} } = action;
  try {
    const termCondition = yield call(handleTermCondition);
    const [user] = yield all([call(getProfileSaga), call(getStaticValuesSaga)]);
    if (!user) {
      throw Error(i18n.t('errorMsg.somethingWentWrong'));
    }

    const { client, tcAcceptedAt } = user || {};

    if (!client?.surveyComplete) {
      NavigationServiceLib.reset(AppScreenID.OnBoardingInterview);
    } else {
      NavigationServiceLib.reset(AppScreenID.Entry);
    }

    if (
      termCondition?.publishedAt &&
      (!tcAcceptedAt || moment(termCondition?.publishedAt).diff(moment(tcAcceptedAt)) > 0)
    ) {
      yield putResolve(updateTermConditionContent(termCondition));
      NavigationServiceLib.navigate(AppScreenID.TermCondition, {
        authorized: true,
      });
    }

    if (AppMeta.ENABLE_PUSH_NOTIFICATION) {
      yield fork(handleNotificationWhenLogin);
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
  } finally {
    loadingView.hide();
  }
}

export function* loginSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload, resolver = {} } = action;

  try {
    const deviceId = yield call(DeviceInfoLib.getUniqueId);
    const deviceToken = JSON.stringify({ deviceId: deviceId, timestamp: new Date() });

    const loginResponse = yield SagaLib.mutationCall(
      LOGIN_QUERY,
      {
        email: payload.email,
        password: payload.password,
        deviceToken: deviceToken,
        signature: null,
      },
      {
        skipAuthorization: true,
      },
    );
    const login = loginResponse?.data?.login;
    const accessToken = login?.access?.token;
    const strongAuth = login?.access?.decoded?.strongAuth;
    const refreshToken = login?.refresh?.token;

    yield call(updateCredentialSaga, {
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
    yield put(
      updateBiometrics({
        email: payload.email,
        password: payload.password,
      }),
    );
    yield call(LocalStorageLib.RememberMe.set, payload.email);

    if (strongAuth) {
      const isShowPrompt = yield isShowPromptBiometricSetup({ email: payload.email });
      typeof resolver?.resolve === 'function' && resolver?.resolve({ isShowPrompt, strongAuth });
    } else {
      yield putResolve(getTwoFAMethods());
      NavigationServiceLib.navigate(AppScreenID.TwoFA, {
        email: payload?.email,
      });
      // const authenticator = login?.authenticator;
      // const isSMS = authenticator === 'sms';
      // if (isSMS) {
      //   NavigationServiceLib.navigate(AppScreenID.SMSVerification, {
      //     email: payload?.email,
      //   });
      // } else {
      //   NavigationServiceLib.navigate(AppScreenID.Verification, {
      //     email: payload?.email,
      //   });
      // }
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    const noUserError = error?.errors?.some(e => e.message === 'no-user');
    if (noUserError) {
      GlobalLib.Toast.get().toastError(i18n.t('errorMsg.login.no-user'));
    } else if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    yield put(loginFail());
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    loadingView.hide();
  }
}

export function* handleSetupBiometricInPromptSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload = {}, resolver = {} } = action;
  const { email, password, isAccept } = payload;

  try {
    let listBiometricSetup = yield call(LocalStorageLib.ListBiometricSetup.get);
    let account = listBiometricSetup.find(acc => acc.email === email);
    if (isAccept) {
      yield put(
        updateBiometrics({
          email,
          password,
          isRegisterNewKey: isAccept,
        }),
      );
    }
    if (account) {
      if (isAccept) {
        account.count = 0;
      } else {
        let count = account.count - 1;
        account.count = count > 0 ? count : 0;
      }
    } else {
      listBiometricSetup.push({ email, count: isAccept ? 0 : 1 });
    }
    yield call(LocalStorageLib.ListBiometricSetup.set, listBiometricSetup);
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

function* logoutSaga() {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    if (AppMeta.ENABLE_PUSH_NOTIFICATION) {
      yield call(handleNotificationWhenSignOut);
    }
  } catch (err) {
    // do nothing
  }

  try {
    yield resetToLoginSaga();
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.signOut);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  } finally {
    loadingView.hide();
  }
}

export function* getDependants(action) {
  try {
    const { noOfKids } = action.payload;
    const user = yield select(selectUser);
    const dependants = user?.dependants ?? [];
    let newDependants = [];
    if (noOfKids > dependants.length) {
      const diff = noOfKids - dependants.length;
      const newChildList = [...Array(diff).keys()].map((_, idx) => ({
        _id: AppConstants.newObjectID.replace('1', ++idx),
        relationship: 'Child',
      }));
      newDependants.push(...newChildList);
    }
    newDependants.push(
      ...dependants.map((d, index) => {
        if (noOfKids < dependants.length && index + 1 > noOfKids) {
          return {
            _id: d._id,
            _delete: true,
          };
        }
        return {
          _id: d._id,
          relationship: d.relationship,
        };
      }),
    );
    return newDependants;
  } catch (error) {}
}

function* updateUserSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload, resolver } = action;
  const { firstName, lastName, email, dob, mPhone } = payload;
  try {
    const user = yield select(selectUser);

    const personalInfo = {
      client1: {
        _id: user?.client1?._id,
        fName: firstName,
        lName: lastName,
        dob,
        email,
        mPhone,
      },
    };
    const updateMeResponse = yield SagaLib.mutationCall(UPDATE_ME1, {
      data: {
        page: AppConstants.ClientHistoryQuery.PersonalInfo,
        personalInfo,
      },
    });
    const update = updateMeResponse?.data?.me?.client?.update;
    if (update) {
      yield all([call(getProfileSaga), call(getStaticValuesSaga)]);
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.updateProfile);
      typeof resolver?.resolve === 'function' && resolver?.resolve();
    } else {
      throw { message: i18n.t('errorMsg.update-user-fail') };
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

function* updateHouseholdSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload, resolver } = action;
  const {
    _id,
    partnerFirstName,
    partnerLastName,
    partnerDob,
    partnerEmail,
    partnerMPhone,
    dependants,
  } = payload;
  try {
    const user = yield select(selectUser);
    const currentDependants = user?.dependants ?? [];

    let newDependants = [];
    if (dependants) {
      newDependants = dependants?.map((dep, index) => {
        if (isEmpty(dep._id)) {
          dep._id = AppConstants.newObjectID.replace('1', `dependant${index}`);
        }
        dep.relationship = 'Child';
        return dep;
      });
    }

    currentDependants.forEach(deps => {
      let depDelete = newDependants?.find(nd => nd._id === deps._id);
      if (isEmpty(depDelete)) {
        newDependants.push({ ...deps, _delete: true });
      }
    });

    const personalInfo = {};
    personalInfo.dependants = newDependants;
    if (!isNil(_id)) {
      personalInfo.client2 = {
        _id: _id,
        fName: partnerFirstName,
        lName: partnerLastName,
        dob: partnerDob,
        email: partnerEmail,
        mPhone: partnerMPhone,
      };
    }
    const updateMeResponse = yield SagaLib.mutationCall(UPDATE_ME1, {
      data: {
        page: AppConstants.ClientHistoryQuery.PersonalInfo,
        personalInfo,
      },
    });
    const update = updateMeResponse?.data?.me?.client?.update;
    if (update) {
      yield all([call(getProfileSaga), call(getStaticValuesSaga)]);
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.updateProfile);
      typeof resolver?.resolve === 'function' && resolver?.resolve();
    } else {
      throw { message: i18n.t('errorMsg.update-user-fail') };
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

function* updateTenantSaga(action) {
  try {
    const { tenant } = action.payload;
    GlobalLib.Tenant.set({
      id: tenant,
    });
    AnalyticsLib.setUserTenant(tenant);
  } catch (error) {}
}

function* initializeNotification() {
  try {
    yield all([
      call(NotificationLib.unsubscribeFromTopic, COMMON_NOTIFICATION_TOPIC),
      call(NotificationLib.unsubscribeFromTopic, AUTH_NOTIFICATION_TOPIC),
    ]);
    yield call(NotificationLib.removeToken);
    yield call(NotificationLib.initialize);
    yield call(NotificationLib.subscribeFromTopic, COMMON_NOTIFICATION_TOPIC);
  } catch (error) {}
}

function* expireTokenSaga() {
  try {
    if (AppMeta.ENABLE_PUSH_NOTIFICATION) {
      yield fork(initializeNotification);
    }
    yield put(resetAuth());
  } catch (error) {}
}

function* updateBiometricsSaga(action) {
  const { payload, resolver = {} } = action;
  const email = payload?.email;
  const password = payload?.password;
  const isRegisterNewKey = payload?.isRegisterNewKey;
  if (isEmpty(email)) {
    return;
  }

  const passwordToken = CryptoJS.AES.encrypt(password, String(email).toLowerCase()).toString();
  // Only save account when user tab Login with Touch ID button or update for old data
  if (isRegisterNewKey) {
    yield Keychain.set(email, passwordToken);
  } else {
    const isRegistered = yield Keychain.getAccountIfRegistered(email);
    if (isRegistered) {
      yield Keychain.set(email, passwordToken);
    } else {
      // if don't register, save passwordToken for next time register
      yield putResolve(updatePasswordToken(passwordToken));
    }
  }
  typeof resolver?.resolve === 'function' && resolver?.resolve();
}

function* updateBiometricsManualSaga(action) {
  const { payload } = action;
  const email = payload?.email;
  let listBiometricSetup = yield call(LocalStorageLib.ListBiometricSetup.get);
  let account = listBiometricSetup.find(acc => acc.email === email);
  if (account) {
    account.count = 0;
  } else {
    listBiometricSetup.push({ email, count: 0 });
  }
  yield call(LocalStorageLib.ListBiometricSetup.set, listBiometricSetup);
}

function* changePasswordSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload, resolver = {} } = action;
  try {
    const { email } = yield select(selectUser);
    const { currentPassword, newPassword } = payload;
    yield SagaLib.mutationCall(
      CHANGE_PASSWORD_QUERY,
      {
        password: currentPassword,
        newPassword,
      },
      {
        i18nScope: 'errorMsg.changePassword',
      },
    );
    yield put(
      updateBiometrics({
        email: email,
        password: newPassword,
      }),
    );
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.changePassword);
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

function* updateTermConditionSaga() {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const acceptedDate = new Date().toISOString();
    const updateMeResponse = yield SagaLib.mutationCall(UPDATE_ME, {
      data: {
        tcAcceptedAt: acceptedDate,
        pcAcceptedAt: acceptedDate,
      },
    });
    const update = updateMeResponse?.data?.me?.update;
    if (!update) {
      throw { message: i18n.t('errorMsg.update-term-condition-fail') };
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  } finally {
    loadingView.hide();
  }
}

function* deleteAccountSaga(action) {
  const { payload, resolver = {} } = action;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const slug = payload?.slug;
    const response = yield SagaLib.mutationCall(DELETE_ACCOUNT, { slug });
    const data = response?.data?.me?.doAction;
    if (data?.ui === 'toast') {
      yield put(expireToken());
      const user = yield select(selectUser);
      const email = user?.email;
      const account = yield Keychain.getAccountIfRegistered(email);
      if (account) {
        yield Keychain.removeAccounts(email);
      }
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(data);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  } finally {
    loadingView.hide();
  }
}
function* getCurrentTimeSaga(action) {
  try {
    const { resolver = {} } = action;
    const currentTime = yield SagaLib.queryCall(GET_CURRENT_TIME_QUERY);
    const time = currentTime?.data?.time;
    yield putResolve(setCurrentTime(`${time}`));
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  }
}

function* openMyKnowledgeSaga(action) {
  const {} = action;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const response = yield SagaLib.mutationCall(GET_MY_KNOWLEDGE_LINK, {});
    const url = get(response, ['data', 'me', 'knowledgeBase', 'link', 'url'], '');
    if (url) {
      // UtilLib.openInAppBrowserLink(url);
      NavigationServiceLib.navigate(AppScreenID.Webview, { url });
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  } finally {
    loadingView.hide();
  }
}

export default function* defaultSaga() {
  yield takeLatest(CHECK_USER_LOGIN, checkUserLoginSaga);
  yield takeLatest(UPDATE_TENANT, updateTenantSaga);
  yield takeLeading(USER_LOGIN_REQUEST, loginSaga);
  yield takeLatest(USER_LOGOUT, logoutSaga);
  yield takeLatest(USER_EXPIRE, expireTokenSaga);
  yield takeLatest(UPDATE_BIOMETRICS_DATA, updateBiometricsSaga);
  yield takeLeading(USER_CHANGE_PASSWORD, changePasswordSaga);
  yield takeLatest(USER_UPDATE_TERM_CONDITION, updateTermConditionSaga);
  yield takeLeading(USER_UPDATE_USER, updateUserSaga);
  yield takeLeading(USER_UPDATE_USER_HOUSEHOLD, updateHouseholdSaga);

  yield takeEvery(USER_GET_PROFILE, getProfileSaga);
  yield takeEvery(GET_STATIC_VALUES, getStaticValuesSaga);
  yield takeEvery(GET_STATIC_VALUES_DEFAULT, getStaticValuesDefaultSaga);
  yield takeEvery(GET_CURRENT_TIME, getCurrentTimeSaga);
  yield takeEvery(SETUP_BIOMETRIC_IN_PROMPT, handleSetupBiometricInPromptSaga);
  yield takeEvery(ON_ACCOUNT_IS_STRONG_AUTH, handleLoginWhenAccountIsStrongAuthSaga);
  yield takeEvery(UPDATE_BIOMETRICS_MANUAL, updateBiometricsManualSaga);
  yield takeLatest(USER_DELETION, deleteAccountSaga);
  // yield takeLeading(UPDATE_USER_EMAIL, updateUserEmailSaga);
  yield takeLeading(OPEN_MY_KNOWLEDGE, openMyKnowledgeSaga);
}
