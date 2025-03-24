// import i18n from 'bootstrap/i18n';
import store from 'bootstrap/store';
import { AppConstants } from 'constant';
import { GlobalLib, SagaLib, UtilLib } from 'libs';
import { get, isEmpty, map } from 'lodash';
// import { get, filter, find, isEmpty, map, omit } from 'lodash';
import { all, putResolve, select, takeEvery, takeLatest, takeLeading } from 'redux-saga/effects';
import { getNotificationWithType } from 'screens/Notification';
import { GET_ASSET_POSITION_QUERY } from 'store/AssetPosition/query';
import { GET_CASH_POSITION_QUERY } from 'store/CashPosition/query';
import { GET_DEBT_POSITION_QUERY } from 'store/DebtPosition/query';
// import { GET_FILTER_FIELDS_QUERY } from 'store/FinancialDashboard/query';
import { getFinancialSummary } from 'store/FinancialDashboard/action';
import {
  getHomeData,
  setAssetPosition,
  setCashPosition,
  setDebtPosition,
  setFeedbackReview,
  setHomeData,
  setNetWorth,
  setShowOnLoginOnce,
  setShowReviewPrompt,
} from 'store/Home/action';
import {
  GET_HOME_DATA,
  GET_REVIEW,
  GET_SHOW_ON_LOGIN,
  SET_ADD_FEEDBACK,
  SET_DO_FEEDBACK_LATER,
  SET_REVIEW_STATUS,
  SUBMIT_FEEDBACK,
  SUBMIT_FEEDBACK_SUGGESTION,
  SYNC_FINANCIAL_DATA,
} from 'store/Home/constants';
import {
  ADD_FEEDBACK,
  ADD_FEEDBACK_SUGGESTION,
  DO_FEEDBACK_LATER,
  GET_CLIENT_HOME_EXPENSES,
  GET_FEEDBACK_TYPES,
  GET_SHOW_REVIEW_PROMPT,
  SET_REVIEW_STATUS_MUTATION,
} from 'store/Home/query';
import { selectFeedbackReview, selectShowOnLoginOnce } from 'store/Home/selector';
import { getMoneySmarts } from 'store/MoneySmartsDashboard/action';
import { getMonthlyCheckUpData } from 'store/MonthlyCheckUp/action';
import { GET_NET_WORTH_QUERY } from 'store/NetWorth/query';
import { getCampaign, setMarkItAsRead } from 'store/Notification/action';
import { GET_NOTIFICATIONS } from 'store/Notification/query';

async function handleNotificationCallback(_item) {
  if (
    _item &&
    _item.type === AppConstants.notificationType.Campaign &&
    !isEmpty(_item.campaignId)
  ) {
    const storeDispatchResolve = action =>
      new Promise((resolve, reject) => {
        const newAction = { ...action, resolver: { resolve, reject } };
        store.dispatch(newAction);
      });
    const campaign = await storeDispatchResolve(getCampaign({ campaignId: _item.campaignId }));
    return campaign;
  }
  return null;
}

function* getExpenses() {
  const getClientHomeDashboardResponse = yield SagaLib.queryCall(GET_CLIENT_HOME_EXPENSES);
  const expenses = get(getClientHomeDashboardResponse, [
    'data',
    'me',
    'client',
    'homeDashboard',
    'expenses',
    'monthly',
  ]);
  return {
    monthly: {
      total: get(expenses, ['total']) || 0,
      breakdown:
        map(get(expenses, ['breakdown']), (item, index) => ({
          label: item?.key,
          value: item?.total,
          color: UtilLib.getColorByIndex(index),
        })) || [],
    },
  };
}

function* getReviewSaga(action) {
  const resolver = action.resolver || {};
  // const enableAppReview = yield call(LocalStorageLib.EnableAppReview.get);
  // if (!enableAppReview) {
  //   return;
  // }
  try {
    // const feedbackTypesResponses = yield SagaLib.queryCall(GET_FEEDBACK_TYPES);
    // const feedbackTypes = map(
    //   get(feedbackTypesResponses, ['data', 'me', 'feedbackTypes']) || [],
    //   item => omit(item, '__typename'),
    // );
    // const review =
    //   feedbackTypes.find(item => item.type === AppConstants.feedbackTypes.appReview) || null;
    // yield putResolve(setFeedbackReview(review));

    const showReviewPromptResponses = yield SagaLib.mutationCall(GET_SHOW_REVIEW_PROMPT);
    const showReviewPrompt = get(showReviewPromptResponses, ['data', 'me', 'showReviewPrompt']);
    yield putResolve(setShowReviewPrompt(showReviewPrompt));
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  }
}

function* getCashPositionSaga() {
  try {
    const response = yield SagaLib.mutationCall(GET_CASH_POSITION_QUERY, {
      query: {
        dataSets: [
          {
            type: 'net-worth',
            filter: {
              cardTypes: ['assets.bankAccounts'],
            },
          },
        ],
      },
    });

    const values = get(response, ['data', 'me', 'insights', 'graph', 'dataSets', 0, 'values']);
    yield putResolve(setCashPosition(values));
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  } finally {
  }
}

function* getAssetPositionSaga() {
  try {
    const response = yield SagaLib.mutationCall(GET_ASSET_POSITION_QUERY, {
      query: {
        dataSets: [
          {
            type: 'net-worth',
            filter: {
              cardTypes: [
                'assets.bankAccounts',
                'assets.properties',
                'assets.investments',
                'assets.vehicles',
                'assets.otherAssets',
                'assets.superFunds',
              ],
            },
          },
        ],
      },
    });

    const values = get(response, ['data', 'me', 'insights', 'graph', 'dataSets', 0, 'values']);
    yield putResolve(setAssetPosition(values));
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  } finally {
  }
}

function* getDebtPositionSaga() {
  try {
    const response = yield SagaLib.mutationCall(GET_DEBT_POSITION_QUERY, {
      query: {
        dataSets: [
          {
            type: 'net-worth',
            filter: {
              cardTypes: ['borrowings'],
            },
          },
        ],
      },
    });

    const values = get(response, ['data', 'me', 'insights', 'graph', 'dataSets', 0, 'values']);
    yield putResolve(setDebtPosition(values));
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  } finally {
  }
}

function* getNetWorthSaga() {
  try {
    const response = yield SagaLib.mutationCall(GET_NET_WORTH_QUERY, {
      query: {
        dataSets: [
          {
            type: 'net-worth',
            filter: {
              cardTypes: [
                'assets.bankAccounts',
                'assets.properties',
                'assets.investments',
                'assets.vehicles',
                'assets.otherAssets',
                'assets.superFunds',
                'borrowings',
              ],
            },
          },
        ],
      },
    });

    const values = get(response, ['data', 'me', 'insights', 'graph', 'dataSets', 0, 'values']);
    yield putResolve(setNetWorth(values));
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  } finally {
  }
}

function* getHomeDataSaga(action) {
  const { payload = {}, resolver = {} } = action;
  const { isRefresh } = payload;
  const loadingView = GlobalLib.Loading.get();
  !isRefresh && loadingView.show();

  try {
    // const filterValues = yield getFinancialFilters();
    yield all([
      getCashPositionSaga(),
      getAssetPositionSaga(),
      getDebtPositionSaga(),
      getNetWorthSaga(),
    ]);
    const [
      expenses,
      // income,
      // assets,
      // borrowings,
    ] = yield all([
      getExpenses(),
      // getIncome(filterValues.income),
      // getAssets(filterValues.assets),
      // getBorrowings(filterValues.borrowings),
    ]);
    yield all([
      putResolve(
        setHomeData({
          expenses,
          // income,
          // assets,
          // borrowings,
        }),
      ),
    ]);
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    !isRefresh && loadingView.hide();
  }
}

function* syncFinancialDataSaga(action) {
  const { payload = {} } = action;
  const { home, moneySmart, monthlyCheckup, financialDashboard } = payload;
  yield all([
    putResolve(getHomeData(!home?.loading)),
    putResolve(getFinancialSummary(!financialDashboard?.loading)),
    putResolve(getMoneySmarts(!moneySmart?.loading)),
    putResolve(getMonthlyCheckUpData(!monthlyCheckup?.loading)),
  ]);
}

function* doFeedbackLaterSaga(action) {
  const { resolver = {} } = action;
  try {
    const doFeedbackLaterResponse = yield SagaLib.mutationCall(DO_FEEDBACK_LATER);
    const doFeedbackLater = get(doFeedbackLaterResponse, ['data', 'me', 'doFeedbackLater']);
    if (doFeedbackLater) {
      typeof resolver?.resolve === 'function' && resolver?.resolve();
    }
  } catch (error) {
    // if (!isEmpty(error?.message)) {
    //   GlobalLib.Toast.get().toastError(error?.message);
    // }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    const feedbackReview = yield select(selectFeedbackReview);
    yield putResolve(
      setFeedbackReview({
        ...feedbackReview,
        canAsk: false,
      }),
    );
  }
}

function* addFeedbackSaga(action) {
  const { payload = {}, resolver = {} } = action;
  GlobalLib.Loading.get().show();
  try {
    const variables = {
      data: {
        type: AppConstants.feedbackTypes.appReview,
        rate: payload?.data?.rating,
        notes: payload?.data?.review,
      },
    };
    const addFeedbackResponse = yield SagaLib.mutationCall(ADD_FEEDBACK, variables);
    const feedbackTypesResponses = yield SagaLib.queryCall(GET_FEEDBACK_TYPES);
    yield putResolve(
      setFeedbackReview(get(feedbackTypesResponses, ['data', 'me', 'feedbackTypes'])),
    );
    const addFeedback = get(addFeedbackResponse, ['data', 'me', 'addFeedback']);
    addFeedback && typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    GlobalLib.Loading.get().hide();
  }
}

function* setReviewStatusSaga(action) {
  const { resolver = {} } = action;
  // GlobalLib.Loading.get().show();
  try {
    const variables = {
      status: 'displayed',
    };
    const setReviewStatusResponse = yield SagaLib.mutationCall(
      SET_REVIEW_STATUS_MUTATION,
      variables,
    );
    const setReviewStatus = get(setReviewStatusResponse, ['data', 'me', 'setReviewStatus']);
    if (setReviewStatus) {
      const showReviewPromptResponses = yield SagaLib.mutationCall(GET_SHOW_REVIEW_PROMPT);
      const showReviewPrompt = get(showReviewPromptResponses, ['data', 'me', 'showReviewPrompt']);
      yield putResolve(setShowReviewPrompt(showReviewPrompt));
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    // GlobalLib.Loading.get().hide();
  }
}

function* getShowOnLoginSaga(action) {
  const resolver = action.resolver || {};
  try {
    const showOnLoginOnce = yield select(selectShowOnLoginOnce);
    if (!showOnLoginOnce) {
      const variables = {
        showOnLogin: true,
      };
      const notificationOnLoginResponses = yield SagaLib.queryCall(GET_NOTIFICATIONS, variables);
      const notificationItems =
        get(notificationOnLoginResponses, 'data.me.notifications.paginated.documents') || [];
      const notificationOnLogin = notificationItems.find(item => !item?.isRead);
      const showOnLogin = get(notificationOnLogin, 'showOnLogin');
      if (notificationOnLogin && showOnLogin && !showOnLoginOnce) {
        if (!notificationOnLogin?.isRead) {
          yield putResolve(setMarkItAsRead(notificationOnLogin));
        }
        getNotificationWithType(
          { ...notificationOnLogin, backButtonHidden: true },
          handleNotificationCallback,
        ).onPress();
        yield putResolve(setShowOnLoginOnce(true));
      }
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  }
}

export function* submitFeedbackSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload = {}, resolver = {} } = action;
  try {
    const variables = {
      data: {
        type: 'insight-feedback',
        // rate: 10,
        notes: payload?.review,
      },
    };
    yield SagaLib.mutationCall(ADD_FEEDBACK, variables);
    typeof resolver?.resolve === 'function' && resolver?.resolve({});
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    loadingView.hide();
  }
}

export function* submitFeedbackSuggestionSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload = {}, resolver = {} } = action;
  try {
    const variables = {
      data: {
        type: 'insightFeedback',
        notes: payload?.review,
        location: payload?.location,
      },
    };
    yield SagaLib.mutationCall(ADD_FEEDBACK_SUGGESTION, variables);
    typeof resolver?.resolve === 'function' && resolver?.resolve({});
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
  yield takeEvery(GET_HOME_DATA, getHomeDataSaga);
  yield takeLatest(GET_REVIEW, getReviewSaga);
  yield takeLatest(SET_DO_FEEDBACK_LATER, doFeedbackLaterSaga);
  yield takeLatest(SET_ADD_FEEDBACK, addFeedbackSaga);
  yield takeLatest(SYNC_FINANCIAL_DATA, syncFinancialDataSaga);
  yield takeLatest(SET_REVIEW_STATUS, setReviewStatusSaga);
  yield takeLatest(GET_SHOW_ON_LOGIN, getShowOnLoginSaga);
  yield takeLeading(SUBMIT_FEEDBACK, submitFeedbackSaga);
  yield takeLeading(SUBMIT_FEEDBACK_SUGGESTION, submitFeedbackSuggestionSaga);
}
