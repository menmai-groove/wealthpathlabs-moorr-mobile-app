import i18n from 'bootstrap/i18n';
import { AppScreenID } from 'constant';
import { DeviceInfoLib, GlobalLib, NavigationServiceLib, SagaLib } from 'libs';
import { get, isEmpty } from 'lodash';
import moment from 'moment';
import { all, call, fork, putResolve, takeLatest } from 'redux-saga/effects';
import { updateTermConditionContent } from 'store/Auth/action';
import {
  getProfileSaga,
  getStaticValuesSaga,
  handleNotificationWhenLogin,
  handleTermCondition,
  isShowPromptBiometricSetup,
  updateCredentialSaga,
} from 'store/Auth/saga';
import { setTwoFAMethods } from 'store/Verification/action';
import {
  GENERATE_EMAIL_CODE,
  GET_TWO_FA_METHODS,
  RESEND_SMS,
  VERIFY_AUTHENTICATOR,
  VERIFY_EMAIL_CODE,
  VERIFY_SMS,
  VERIFY_SUCCESS,
} from 'store/Verification/constants';
import {
  GENERATE_EMAIL_CODE_QUERY,
  RESEND_AUTHENTICATOR_QUERY,
  TWO_FA_SETTINGS_QUERY,
  VERIFY_AUTHENTICATOR_QUERY,
  VERIFY_EMAIL_CODE_QUERY,
  VERIFY_SMS_QUERY,
} from 'store/Verification/query';

import AppMeta from '../../../app.json';

export function* verifyAuthenticatorSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload = {}, resolver = {} } = action;
  try {
    const { pin } = payload;
    const deviceId = yield call(DeviceInfoLib.getUniqueId);
    const verifyAuthenticatorResponse = yield SagaLib.mutationCall(
      VERIFY_AUTHENTICATOR_QUERY,
      {
        pin,
        deviceId,
      },
      // {
      //   skipAuthorization: true,
      //   headers: {
      //     Authorization:
      //       'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWQiOiI2NDlkMWM0M2NmYTliZjJiNDVkMGVhZTAiLCJ1aWQiOiI2MWM4M2U4NWU1MzdmYmY4YWRjOGM0MWMiLCJlbWFpbCI6InR1eWVuLmx0cDAwMUBtYWlsaW5hdG9yLmNvbSIsInJvbGUiOiJ1c2VyIiwic3Ryb25nQXV0aCI6dHJ1ZSwiaWF0IjoxNjg4MDE3OTg3LCJleHAiOjE2ODgwMTk3ODd9.btMnmQ8yJkCy6PhGY7eQooVW4PqzhXugrzZPjUIhZzE',
      //   },
      // },
    );
    const verifyAuthenticator = verifyAuthenticatorResponse?.data?.verifyAuthenticator;
    if (verifyAuthenticator) {
      const isShowPrompt = yield call(isShowPromptBiometricSetup, { email: payload.email });
      typeof resolver?.resolve === 'function' &&
        resolver?.resolve({ ...verifyAuthenticator, isShowPrompt });
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    loadingView.hide();
  }
}

export function* verifySmsSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload = {}, resolver = {} } = action;
  try {
    const { pin } = payload;
    const verifySmsResponse = yield SagaLib.mutationCall(VERIFY_SMS_QUERY, {
      pin,
    });
    const verifySms = get(verifySmsResponse, ['data', 'verifySms']);
    if (verifySms) {
      const isShowPrompt = yield call(isShowPromptBiometricSetup, { email: payload.email });
      typeof resolver?.resolve === 'function' && resolver?.resolve({ ...verifySms, isShowPrompt });
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    loadingView.hide();
  }
}

export function* handleWhenVerifySuccessSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload } = action;
  try {
    yield call(updateCredentialSaga, {
      refreshToken: payload?.refresh?.token,
      accessToken: payload?.access?.token,
    });

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
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  } finally {
    loadingView.hide();
  }
}

export function* resendSmsSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { resolver = {} } = action;
  try {
    const resendSmsResponse = yield SagaLib.mutationCall(RESEND_AUTHENTICATOR_QUERY);
    const nextSendSMS = get(resendSmsResponse, ['data', 'resendSms', 'nextSendSMS']);
    if (nextSendSMS) {
      typeof resolver?.resolve === 'function' && resolver?.resolve({ nextSendSMS });
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    loadingView.hide();
  }
}

export function* getTwoFAMethodsSaga(action) {
  const { resolver = {} } = action;
  try {
    const twoFASettingsResponse = yield SagaLib.queryCall(TWO_FA_SETTINGS_QUERY);
    const twoFASettings = get(twoFASettingsResponse, ['data', 'twoFaSettings']);
    if (twoFASettings) {
      yield putResolve(setTwoFAMethods(twoFASettings));
      typeof resolver?.resolve === 'function' && resolver?.resolve();
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
  }
}

export function* generateEmailCodeSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { resolver = {} } = action;
  try {
    const generateEmailCodeResponse = yield SagaLib.mutationCall(GENERATE_EMAIL_CODE_QUERY);
    const generateEmailCode = get(generateEmailCodeResponse, ['data', 'generateEmailCode']);
    if (generateEmailCode) {
      typeof resolver?.resolve === 'function' && resolver?.resolve(true);
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    loadingView.hide();
  }
}

export function* verifyEmailCodeSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload = {}, resolver = {} } = action;
  try {
    const { verifyEmailCodePin } = payload;
    const verifyEmailCodeResponse = yield SagaLib.mutationCall(VERIFY_EMAIL_CODE_QUERY, {
      verifyEmailCodePin,
    });
    const verifyEmailCode = get(verifyEmailCodeResponse, ['data', 'verifyEmailCode']);
    if (verifyEmailCode) {
      const isShowPrompt = yield call(isShowPromptBiometricSetup, { email: payload.email });
      typeof resolver?.resolve === 'function' &&
        resolver?.resolve({ ...verifyEmailCode, isShowPrompt });
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    loadingView.hide();
  }
}

export default function* defaultSaga() {
  yield takeLatest(VERIFY_AUTHENTICATOR, verifyAuthenticatorSaga);
  yield takeLatest(VERIFY_SMS, verifySmsSaga);
  yield takeLatest(RESEND_SMS, resendSmsSaga);
  yield takeLatest(VERIFY_SUCCESS, handleWhenVerifySuccessSaga);
  yield takeLatest(GET_TWO_FA_METHODS, getTwoFAMethodsSaga);
  yield takeLatest(GENERATE_EMAIL_CODE, generateEmailCodeSaga);
  yield takeLatest(VERIFY_EMAIL_CODE, verifyEmailCodeSaga);
}
