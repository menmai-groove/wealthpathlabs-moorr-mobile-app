import i18n from 'bootstrap/i18n';
import { AppConstants, AppError } from 'constant';
import { AnalyticsLib, GlobalLib, SagaLib } from 'libs';
import { first, get, isEmpty, last } from 'lodash';
import { all, putResolve, takeEvery, takeLatest } from 'redux-saga/effects';
import { syncFinancialData } from 'store/Home/action';
import { setMoneySmarts } from 'store/MoneySmartsDashboard/action';
import {
  ADD_TRANSACTION,
  DELETE_TRANSACTION,
  EDIT_TRANSACTION,
  GET_MONEY_SMARTS,
} from 'store/MoneySmartsDashboard/constants';
import {
  ADD_EDIT_TRANSACTION_QUERY,
  DELETE_TRANSACTION_QUERY,
  GET_CHECKUP_REPORTING_QUERY,
  GET_CLIENT_QUERY,
} from 'store/MoneySmartsDashboard/query';
// import { UPDATE_MONTHLY_CHECKUP } from 'store/MonthlyCheckUp/query';
import { createNewOpenedDocument, getMonthlyCheckUpSaga } from 'store/MonthlyCheckUp/saga';

function* getOrCreateOpenedDocument() {
  let getCheckupReportingResponse = yield SagaLib.queryCall(GET_CHECKUP_REPORTING_QUERY, {
    pagination: { page: 1, limit: 1 },
    sort: { startDate: -1 },
    filter: { state: AppConstants.documentState.OPEN },
  });
  let document = first(
    get(getCheckupReportingResponse, ['data', 'me', 'moneyRollovers', 'documents']),
  );
  if (isEmpty(document) || document.state !== AppConstants.documentState.OPEN) {
    // const data = {
    //   _id: AppConstants.newObjectID.replace('1', 'document_1'),
    //   state: AppConstants.documentState.OPEN,
    // };
    // if (document) {
    //   data.startDate = moment(document.startDate)
    //     .add(AppConfigs.circleMonthCheckUp - 1, 'months')
    //     .toISOString();
    // }
    try {
      yield createNewOpenedDocument();
    } catch (error) {}
    getCheckupReportingResponse = yield SagaLib.queryCall(GET_CHECKUP_REPORTING_QUERY, {
      pagination: { page: 1, limit: 1 },
      sort: { startDate: -1 },
      filter: { state: AppConstants.documentState.OPEN },
    });
    document = first(
      get(getCheckupReportingResponse, ['data', 'me', 'moneyRollovers', 'documents']),
    );
    yield getMonthlyCheckUpSaga({ payload: { isRefresh: true } });
  }
  return document;
}

function* getExpenseEssentialDiscretionary() {
  const response = yield SagaLib.queryCall(GET_CLIENT_QUERY, {
    groups: [
      {
        key: 'expensesTotalEssentialMonthly',
        queries: [
          {
            paths: 'expenses.essentialAmount',
            frequencyColumn: 'frequency',
            frequency: 'Monthly',
          },
        ],
      },
      {
        key: 'expensesTotalEssentialYearly',
        queries: [
          {
            paths: 'expenses.essentialAmount',
            frequencyColumn: 'frequency',
            frequency: 'Yearly',
          },
        ],
      },
      {
        key: 'expensesTotalDiscretionaryMonthly',
        queries: [
          {
            paths: 'expenses.discretionaryAmount',
            frequencyColumn: 'frequency',
            frequency: 'Monthly',
          },
        ],
      },
      {
        key: 'expensesTotalDiscretionaryYearly',
        queries: [
          {
            paths: 'expenses.discretionaryAmount',
            frequencyColumn: 'frequency',
            frequency: 'Yearly',
          },
        ],
      },
    ],
  });
  const essentialAmount = {
    monthly: get(response, ['data', 'me', 'client', 'computeTotal', 'groups', 0, 'total']) || 0,
    yearly: get(response, ['data', 'me', 'client', 'computeTotal', 'groups', 1, 'total']) || 0,
  };
  const discretionaryAmount = {
    monthly: get(response, ['data', 'me', 'client', 'computeTotal', 'groups', 2, 'total']) || 0,
    yearly: get(response, ['data', 'me', 'client', 'computeTotal', 'groups', 3, 'total']) || 0,
  };
  return { essentialAmount, discretionaryAmount };
}

export function* getMoneySmartsSaga(action = {}) {
  const { payload = {}, resolver = {} } = action;
  const { isRefresh } = payload;
  const loadingView = GlobalLib.Loading.get();
  !isRefresh && loadingView.show();

  try {
    const [document, { essentialAmount, discretionaryAmount }] = yield all([
      getOrCreateOpenedDocument(),
      getExpenseEssentialDiscretionary(),
    ]);
    const { reports, ...checkupReporting } = document?.checkupReporting || {};
    const formatData = {
      ...checkupReporting,
      _id: document?._id,
      essentialAmount,
      discretionaryAmount,
      expenseTotalAmount: {
        monthly: essentialAmount.monthly + discretionaryAmount.monthly,
        yearly: essentialAmount.yearly + discretionaryAmount.yearly,
      },
      accumulatedActualSurplus: {
        monthly: get(last(get(reports, ['monthly'])), ['accumulatedActualSurplus']) || 0,
        yearly: get(last(get(reports, ['yearly'])), ['accumulatedActualSurplus']) || 0,
      },
      provisionsJar: get(document, ['getProvisionsjar']),
    };
    yield putResolve(setMoneySmarts(formatData));
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

export function* deleteTransactionSaga(action) {
  const resolver = action.resolver || {};
  const { documentID, id, expenseId } = action?.payload;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    yield SagaLib.mutationCall(DELETE_TRANSACTION_QUERY, {
      documentID: documentID,
      id: id,
      expenseId,
    });
    yield putResolve(syncFinancialData({ moneySmart: { loading: true } }));
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.deleteTransaction, {
      transaction_id: id,
      date: new Date().toUTCString(),
    });
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      if (error?.message === AppError.closedRollover) {
        GlobalLib.Toast.get().toastError(i18n.t('errorMsg.closedRollover'));
        yield getMoneySmartsSaga();
      } else {
        GlobalLib.Toast.get().toastError(error?.message);
      }
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export function* addTransactionSaga(action) {
  const resolver = action.resolver || {};
  const { documentID, name, expenseId, date, amount } = action?.payload;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    yield SagaLib.mutationCall(ADD_EDIT_TRANSACTION_QUERY, {
      id: AppConstants.newObjectID,
      documentID: documentID,
      name: name,
      expenseId,
      date: date,
      amount: amount,
    });
    yield putResolve(syncFinancialData({ moneySmart: { loading: true } }));
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.addTransaction, {
      date: new Date().toUTCString(),
      amount,
    });
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      if (error?.message === AppError.closedRollover) {
        GlobalLib.Toast.get().toastError(i18n.t('errorMsg.closedRollover'));
        yield getMoneySmartsSaga();
      } else {
        GlobalLib.Toast.get().toastError(error?.message);
      }
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export function* editTransactionSaga(action) {
  const resolver = action.resolver || {};
  const { documentID, name, date, expenseId, amount, id } = action?.payload;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    yield SagaLib.mutationCall(ADD_EDIT_TRANSACTION_QUERY, {
      id: id,
      documentID: documentID,
      name: name,
      expenseId,
      date: date,
      amount: amount,
    });
    yield putResolve(syncFinancialData({ moneySmart: { loading: true } }));
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      if (error?.message === AppError.closedRollover) {
        GlobalLib.Toast.get().toastError(i18n.t('errorMsg.closedRollover'));
        yield getMoneySmartsSaga();
      } else {
        GlobalLib.Toast.get().toastError(error?.message);
      }
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export default function* defaultSaga() {
  yield takeEvery(GET_MONEY_SMARTS, getMoneySmartsSaga);
  yield takeLatest(DELETE_TRANSACTION, deleteTransactionSaga);
  yield takeLatest(ADD_TRANSACTION, addTransactionSaga);
  yield takeLatest(EDIT_TRANSACTION, editTransactionSaga);
}
