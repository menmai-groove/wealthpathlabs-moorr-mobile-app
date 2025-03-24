import { AppConstants } from 'constant';
import { AnalyticsLib, GlobalLib, SagaLib } from 'libs';
import { isEmpty } from 'lodash';
import { call, put, putResolve, takeLatest, takeLeading } from 'redux-saga/effects';
import { updateTermConditionContent } from 'store/Auth/action';
import { handleTermCondition } from 'store/Auth/saga';
import { REGISTER_WITH_DATA_QUERY } from 'store/SignUp/query';

import { signUpSuccess, updateSignUpError } from './action';
import { FETCH_TERM_CONDITION, SIGNUP } from './constants';

export function* signupSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload, resolver = {} } = action;
  let registerResponse;
  try {
    registerResponse = yield SagaLib.mutationCall(
      REGISTER_WITH_DATA_QUERY,
      {
        email: payload?.email,
        password: payload?.password,
        registerWithDataAgreedPoliciesAt2: payload?.agreedPoliciesAt,
      },
      {
        skipAuthorization: true,
      },
    );
    yield put(signUpSuccess(true));
    yield putResolve(updateTermConditionContent(null));
    if (registerResponse?.data?.registerWithData?.userId) {
      AnalyticsLib.setUserProfile(registerResponse?.data?.registerWithData?.userId, payload?.email);
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.signUp, {
        email: payload?.email,
      });
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    const userExistsError = error?.errors?.some(e => e.message === 'user-exists');
    const wrongPass = error?.errors?.some(e => e.message === 'wrong-password');
    if (userExistsError || (registerResponse?.data?.registerWithData?.userId && wrongPass)) {
      yield put(updateSignUpError(error));
      return;
    } else if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver.reject === 'function' && resolver.reject();
  } finally {
    loadingView.hide();
  }
}

function* fetchTermConditionSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  const { resolver = {} } = action;
  loadingView.show();
  try {
    const termCondition = yield call(handleTermCondition);
    typeof resolver?.resolve === 'function' && resolver?.resolve(termCondition);
  } catch (error) {
    typeof resolver?.resolve === 'function' && resolver?.resolve(null);
  } finally {
    loadingView.hide();
  }
}

export default function* defaultSaga() {
  yield takeLeading(SIGNUP, signupSaga);
  yield takeLatest(FETCH_TERM_CONDITION, fetchTermConditionSaga);
}
