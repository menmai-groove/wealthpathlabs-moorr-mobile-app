import i18n from 'bootstrap/i18n';
import { AppConstants } from 'constant';
import { AnalyticsLib, GlobalLib, SagaLib } from 'libs';
import { isEmpty } from 'lodash';
import {
  // put,
  takeLeading,
} from 'redux-saga/effects';
// import { updateResetPasswordError } from 'store/ResetPassword/action';
import { REQUEST_RESET_PASSWORD } from 'store/ResetPassword/constants';
import { FORGOT_PASSWORD_QUERY } from 'store/ResetPassword/query';

export function* requestResetPasswordSaga(action) {
  const { payload, resolver = {} } = action;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const response = yield SagaLib.mutationCall(
      FORGOT_PASSWORD_QUERY,
      {
        email: payload.email,
      },
      {
        skipAuthorization: true,
      },
    );
    if (response?.data?.getResetPasswordLink === 'ok') {
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.resetPassword, {
        email: payload?.email,
      });
      typeof resolver?.resolve === 'function' && resolver?.resolve();
    } else {
      throw Error(i18n.t('errorMsg.somethingWentWrong'));
    }
  } catch (error) {
    const noUserError = error?.errors?.some(e => e.message === 'no-user');
    if (noUserError) {
      typeof resolver?.resolve === 'function' && resolver?.resolve();
      // yield put(updateResetPasswordError(error));
    } else if (!isEmpty(error?.message)) {
      let message = error.message.trim().toLowerCase();
      if (
        message.includes(AppConstants.unexpectedError.receiveStatusCode.toLowerCase()) ||
        message.includes(AppConstants.unexpectedError.responseNotSuccess.toLowerCase())
      ) {
        error.message = i18n.t('errorMsg.unexpectedError');
      }
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export default function* defaultSaga() {
  yield takeLeading(REQUEST_RESET_PASSWORD, requestResetPasswordSaga);
}
