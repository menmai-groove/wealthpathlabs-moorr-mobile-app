import i18n from 'bootstrap/i18n';
import { AppConfigs, AppConstants, AppError } from 'constant';
import { AnalyticsLib, GlobalLib, SagaLib, UtilLib } from 'libs';
import { first, get, isEmpty, map } from 'lodash';
import moment from 'moment';
import { all, put, putResolve, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { selectFlags } from 'store/Auth/selector';
import { GET_FINANCIAL_LIST_QUERY } from 'store/FinancialDashboard/query';
import { ADD_HISTORICAL_LOG_NUMBER_MUTATION, GET_HISTORICAL_LOG } from 'store/HistoricalLog/query';
import { getMoneySmartsSaga } from 'store/MoneySmartsDashboard/saga';
import {
  getMonthlyCheckUpData,
  historicalTrackingAddNumbers,
  setLastStateDate,
  setMonthlyCheckUpData,
  setMonthlyCheckUpReportTableData,
  setPreviousCheckUpData,
  setProvisionReportData,
  setRegularReportData,
} from 'store/MonthlyCheckUp/action';
import {
  ADD_EDIT_MONTHLY_CHECKUP_DATA,
  CHANGE_START_DATE,
  DELETE_ALL_MONTHLY_CHECKUP_DATA,
  DELETE_MONTHLY_CHECKUP_DATA,
  FIND_BANK_CREDIT,
  GET_BALANCES_AS_AT,
  GET_MONEY_SMARTS_TRACKING_CARDS,
  GET_MONTHLY_CHECKUP_DATA,
  GET_PREVIUS_MONTHLY_CHECKUP_DATA,
  HISTORICAL_TRACKING_ADD_NUMBERS,
  ROLLOVER_MONTHLY_CHECKUP,
  SET_MONTHLY_CHECKUP_DATA,
  START_NEW_MONTHLY_CHECKUP_DATA,
  TAKE_MONTHLY_CHECKUP,
  UPDATE_MONEY_SMARTS_TRACKING_CARDS,
} from 'store/MonthlyCheckUp/constants';
import {
  GET_MONNEYSMART_TRACKED_CARDS,
  GET_MONTHLY_CHECKUP,
  HISTORICAL_TRACKING_ADD_NUMBERS_QUERY,
  MUTATION_CHANGE_START_DATE,
  MUTATION_ROLLOVER_CHECKUP,
  QUERY_GET_MONEY_SMARTS_TRACKING_CARDS,
  UPDATE_MONTHLY_CHECKUP,
} from 'store/MonthlyCheckUp/query';

import { selectCheckUpData, selectOpenedCheckup } from 'store/MonthlyCheckUp/selector';

const dateFormat = 'MMM YYYY';
const dateFormat3 = 'DD MMM ’YY';

function* getFormatChartData(startDate, monthlyReport, field, customLabel) {
  if (monthlyReport.length === 0) {
    return [];
  }

  return [...Array(monthlyReport.length).keys()].map((_, index) => ({
    label:
      typeof customLabel === 'function'
        ? customLabel(startDate, index)
        : moment(startDate).add(index, 'months').format(dateFormat3),
    value: get(monthlyReport, [index, field]) ?? null,
  }));
}

export function* getMonthlyCheckUpSaga(action = {}) {
  const { payload = {}, resolver = {} } = action;
  const { isRefresh } = payload;
  const loadingView = GlobalLib.Loading.get();
  !isRefresh && loadingView.show();
  try {
    const responses = yield all([
      SagaLib.queryCall(GET_MONTHLY_CHECKUP, {
        pagination: { page: 1, limit: 1 },
        sort: { startDate: -1 },
        filter: { state: AppConstants.documentState.OPEN },
      }),
      SagaLib.queryCall(GET_MONTHLY_CHECKUP, {
        pagination: { page: 1, limit: 1 },
        sort: { startDate: -1 },
        filter: { state: AppConstants.documentState.DONE },
      }),
    ]);

    const moneyRollovers = get(responses[0], ['data', 'me', 'moneyRollovers']) || {};
    const lastRollovers = get(responses[1], ['data', 'me', 'moneyRollovers']) || {};
    const checkupData = first(moneyRollovers?.documents);
    const lastStateDate = get(first(lastRollovers?.documents), ['startDate']);
    const monthlyReport = get(checkupData, ['checkupReporting', 'reports', 'monthly']) || [];
    // const monthlyTotalMoneyOut =
    //   get(checkupData, ['checkupReporting', 'totalMoneyOut', 'monthly']) || 0;
    // const yearlyTotalMoneyOut =
    //   get(checkupData, ['checkupReporting', 'totalMoneyOut', 'yearly']) || 0;
    // const totalProvisionAmount =
    //   get(checkupData, ['getProvisionsjar', 'summary', 'totalAmount']) || 0;
    const startDate = get(checkupData, ['startDate']) || new Date();
    const listTableDate = [];
    const monthlyProvisionSpent = map(
      get(checkupData, ['getProvisionsMonthlySpending']) || [],
      (item, index) => ({
        ...item,
        label:
          moment(startDate).add(index, 'months').format('DD MMM<br/>’YY') +
          ' - ' +
          moment(startDate)
            .add(index + 1, 'months')
            .subtract(1, 'day')
            .format('DD<br/>MMM ’YY'),
        value: item?.amount || 0,
      }),
    );
    const yearlyRemainingProvisions = map(
      get(checkupData, ['getYearlyRemainingProvisions']) || [],
      (item, index) => ({
        ...item,
        label: moment(startDate).add(index, 'months').format(dateFormat3),
        value: item?.amount || 0,
      }),
    );

    // Handle Data if available
    if (monthlyReport.length > 0) {
      // Get date for table title
      for (let index = 0; index < monthlyReport.length; index++) {
        const _startDate = moment(startDate).add(index, 'months');
        const _startDateFormatted = _startDate.format('DD MMM YYYY');
        const _endDate = moment(_startDate)
          .add(1, 'months')
          .subtract(1, 'day')
          .format('DD MMM YYYY');
        const title = `${_startDateFormatted}\nto\n${_endDate}`;
        listTableDate.push(title);
      }
    }
    const accumulatedActualSurplus = yield getFormatChartData(
      startDate,
      monthlyReport,
      'accumulatedActualSurplus',
    );
    const rollingTargetedSurplus = yield getFormatChartData(
      startDate,
      monthlyReport,
      'rollingTargetedSurplus',
    );
    const monthlyActualSurplus = yield getFormatChartData(
      startDate,
      monthlyReport,
      'monthlyActualSurplus',
      (_startDate, index) =>
        moment(_startDate).add(index, 'months').format('DD MMM<br/>’YY') +
        ' - ' +
        moment(_startDate)
          .add(index + 1, 'months')
          .subtract(1, 'day')
          .format('DD<br/>MMM ’YY'),
    );
    const targetedMonthlySurplus = yield getFormatChartData(
      startDate,
      monthlyReport,
      'targetedMonthlySurplus',
      (_startDate, index) =>
        moment(_startDate).add(index, 'months').format('DD MMM<br/>’YY') +
        ' - ' +
        moment(_startDate)
          .add(index + 1, 'months')
          .subtract(1, 'day')
          .format('DD<br/>MMM ’YY'),
    );
    const monthlyExcessSurplus = yield getFormatChartData(
      startDate,
      monthlyReport,
      'monthlyExcessSurplus',
      (_startDate, index) =>
        moment(_startDate).add(index, 'months').format('DD MMM<br/>’YY') +
        ' - ' +
        moment(_startDate)
          .add(index + 1, 'months')
          .subtract(1, 'day')
          .format('DD<br/>MMM ’YY'),
    );
    const accumulatedExcessSurplus = yield getFormatChartData(
      startDate,
      monthlyReport,
      'accumulatedExcessSurplus',
      (_startDate, index) =>
        moment(_startDate).add(index, 'months').format('DD MMM<br/>’YY') +
        ' - ' +
        moment(_startDate)
          .add(index + 1, 'months')
          .subtract(1, 'day')
          .format('DD<br/>MMM ’YY'),
    );
    // const savingsFlag = (yearlyTotalMoneyOut - totalProvisionAmount) / 12 || 0;
    // const spendingFlag = -(yearlyTotalMoneyOut - totalProvisionAmount) / 12 || 0;
    // const savingsFlag = get(first(monthlyReport), ['shiftedMonthlyOut']) || 0;
    // const spendingFlag = get(first(monthlyReport), ['shiftedMoneyOut']) || 0;
    const savingsFlag = yield getFormatChartData(startDate, monthlyReport, 'shiftedMonthlyOut');
    const spendingFlag = yield getFormatChartData(startDate, monthlyReport, 'shiftedMoneyOut');

    const { checkUpFlow } = yield select(selectFlags);
    let primaryAccountBalance = [];
    if (checkUpFlow) {
      primaryAccountBalance = checkupData?.balancesAsAt?.totalCheckupsBalances?.map((_, index) => ({
        label: moment(startDate).add(index, 'months').format(dateFormat3),
        value: _?.primary ?? null,
      }));
    } else {
      primaryAccountBalance = yield getFormatChartData(
        startDate,
        monthlyReport,
        'primaryAccountBalance',
      );
    }

    yield all([
      putResolve(setMonthlyCheckUpData(checkupData)),
      putResolve(setPreviousCheckUpData(lastRollovers)),
      putResolve(setLastStateDate(lastStateDate)),
      putResolve(setProvisionReportData({ monthlyProvisionSpent, yearlyRemainingProvisions })),
      putResolve(
        setRegularReportData({
          accumulatedActualSurplus,
          rollingTargetedSurplus,
          monthlyActualSurplus,
          targetedMonthlySurplus,
          monthlyExcessSurplus,
          accumulatedExcessSurplus,
          savingsFlag,
          spendingFlag,
          primaryAccountBalance,
        }),
      ),
      putResolve(
        setMonthlyCheckUpReportTableData({
          listTableData: monthlyReport,
          listTableDate: listTableDate,
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

export function* createNewOpenedDocument() {
  const document = yield select(selectOpenedCheckup);
  const data = {
    _id: AppConstants.newObjectID.replace('1', 'document_1'),
    state: AppConstants.documentState.OPEN,
  };
  if (document) {
    data.startDate = UtilLib.dateUTCAsAt(
      moment(document.startDate)
        .add(AppConfigs.circleMonthCheckUp - 1, 'months')
        .toDate(),
    );
  }
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDate = UtilLib.dateUTCAsAt(firstDayOfMonth);
    yield rolloverCheckUp(UtilLib.dateUTCAsAt(startDate), null);
    yield SagaLib.mutationCall(UPDATE_MONTHLY_CHECKUP, {
      data: data,
    });
  } catch (error) {}
  yield getMoneySmartsSaga();
  yield getMonthlyCheckUpSaga();
}

export function* rolloverCheckUp(startDate, endDate) {
  try {
    const variables = {
      startDate,
      endDate,
    };
    const response = yield SagaLib.mutationCall(MUTATION_ROLLOVER_CHECKUP, variables);

    return response;
  } catch (error) {
    if (!isEmpty(error?.message)) {
      if (error?.message === AppError.closedRollover) {
        GlobalLib.Toast.get().toastError(i18n.t('errorMsg.closedRollover'));
        yield createNewOpenedDocument();
      } else {
        GlobalLib.Toast.get().toastError(error?.message);
      }
    }
  } finally {
  }
}

function* startMonthlyCheckUpSaga(action) {
  const { payload = {} } = action;

  const { checkUpFlow } = yield select(selectFlags);
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const { data = {} } = payload;
    let _id = AppConstants.newObjectID;
    const currentCheckup = yield select(selectOpenedCheckup);
    if (currentCheckup) {
      _id = currentCheckup._id;
    }
    const response = yield SagaLib.mutationCall(UPDATE_MONTHLY_CHECKUP, {
      data: [
        {
          _id,
          startDate: UtilLib.dateUTCAsAt(data.startDate),
          balances: [
            {
              primary: Number(data.primaryAccount) || 0,
              credit: Number(data.creditCardAccount) || 0,
              _id: AppConstants.newObjectID.replace('1', 'balance_1'),
            },
          ],
          state: AppConstants.documentState.OPEN,
        },
      ],
    });
    if (response) {
      if (checkUpFlow) {
        yield rolloverCheckUp(UtilLib.dateUTCAsAt(data.startDate), null);
        const historicalDatas = [
          ...data?.accountBalance.map(x => ({
            cardId: x._id,
            field: 'balance',
            asAt: UtilLib.dateUTCAsAt(data.startDate).toISOString(),
            value: Number(x.amount ?? '0'),
          })),
          ...data?.creditCardBalance.map(x => ({
            cardId: x._id,
            field: 'outstanding',
            asAt: UtilLib.dateUTCAsAt(data.startDate).toISOString(),
            value: Number(x.amount ?? '0'),
          })),
        ];
        yield putResolve(
          historicalTrackingAddNumbers({ historicalNumberChangeInput: historicalDatas }),
        );
      } else {
        yield getMonthlyCheckUpSaga();
        yield getMoneySmartsSaga();
      }

      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.startCheckup, {
        document_id: _id,
        start_date: data.startDate,
        date: new Date().toUTCString(),
      });
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      if (error?.message === AppError.closedRollover) {
        GlobalLib.Toast.get().toastError(i18n.t('errorMsg.closedRollover'));
        yield createNewOpenedDocument();
      } else {
        GlobalLib.Toast.get().toastError(error?.message);
      }
    }
  } finally {
    loadingView.hide();
  }
}

function* addEditMonthlyCheckUpSaga(action) {
  const { payload = {} } = action;

  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const { data = {} } = payload;
    const currentCheckup = yield select(selectOpenedCheckup);
    let _id = data?.currentCheckupId ?? currentCheckup._id;
    if (data.isMoneySMARTSV2) {
      let historicalDatas = [];
      if (data?.isLegacyCard) {
        historicalDatas = [
          ...data?.balanceAsAt?.bankAccounts?.map(x => ({
            cardId: x._id,
            field: 'balance',
            asAt: UtilLib.dateUTCAsAt(data?.balanceAsAt?.checkupDate).toISOString(),
            value: data.primaryAccount ? Number(data.primaryAccount ?? '0') : null,
          })),
          ...data?.balanceAsAt?.creditCards.map(x => ({
            cardId: x._id,
            field: 'outstanding',
            asAt: UtilLib.dateUTCAsAt(data?.balanceAsAt?.checkupDate).toISOString(),
            value: data.creditCardAccount ? Number(data.creditCardAccount ?? '0') : null,
          })),
        ];
      } else {
        historicalDatas = [
          ...data?.accountBalance.map(x => ({
            cardId: x._id,
            field: 'balance',
            asAt: UtilLib.dateUTCAsAt(data.startDate).toISOString(),
            value: x.amount ? Number(x.amount ?? '0') : null,
          })),
          ...data?.creditCardBalance.map(x => ({
            cardId: x._id,
            field: 'outstanding',
            asAt: UtilLib.dateUTCAsAt(data.startDate).toISOString(),
            value: x.amount ? Number(x.amount ?? '0') : null,
          })),
        ];
      }
      yield putResolve(
        historicalTrackingAddNumbers({ historicalNumberChangeInput: historicalDatas }),
      );
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.addCheckup, {
        document_id: _id,
        date: new Date().toUTCString(),
      });
    } else {
      const response = yield SagaLib.mutationCall(UPDATE_MONTHLY_CHECKUP, {
        data: [
          {
            _id,
            balances: [
              {
                primary: Number(data.primaryAccount) || 0,
                credit: Number(data.creditCardAccount) || 0,
                _id: data.id || AppConstants.newObjectID.replace('1', 'balance_1'),
              },
            ],
          },
        ],
      });
      if (response) {
        yield getMonthlyCheckUpSaga();
        yield getMoneySmartsSaga();
        AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.addCheckup, {
          document_id: _id,
          date: new Date().toUTCString(),
        });
      }
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      if (error?.message === AppError.closedRollover) {
        GlobalLib.Toast.get().toastError(i18n.t('errorMsg.closedRollover'));
        yield createNewOpenedDocument();
      } else {
        GlobalLib.Toast.get().toastError(error?.message);
      }
    }
  } finally {
    loadingView.hide();
  }
}

function* deleteAllCheckUpSaga() {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const checkup = yield select(selectOpenedCheckup);
    const data = {
      _id: checkup._id,
      balances: checkup.balances.map(b => ({ _id: b._id, _delete: true })),
    };
    const response = yield SagaLib.mutationCall(UPDATE_MONTHLY_CHECKUP, { data });
    if (response) {
      yield getMonthlyCheckUpSaga();
      yield getMoneySmartsSaga();
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      if (error?.message === AppError.closedRollover) {
        GlobalLib.Toast.get().toastError(i18n.t('errorMsg.closedRollover'));
        yield createNewOpenedDocument();
      } else {
        GlobalLib.Toast.get().toastError(error?.message);
      }
    }
  } finally {
    loadingView.hide();
  }
}

function* getPreviusMonthlyCheckUpSaga(action) {
  const {
    payload: { page },
    resolver = {},
  } = action;
  try {
    const response = yield SagaLib.queryCall(GET_MONTHLY_CHECKUP, {
      pagination: { page: page, limit: 1 },
      sort: { startDate: -1 },
      filter: { state: AppConstants.documentState.DONE },
    });
    const moneyRollovers = get(response, ['data', 'me', 'moneyRollovers']) || {};
    yield put(setPreviousCheckUpData({ ...moneyRollovers, page }));
    if (page === 0) {
      const currentCheckup = yield select(selectOpenedCheckup);
      typeof resolver?.resolve === 'function' && resolver?.resolve(currentCheckup);
    }
    const checkupData = first(moneyRollovers?.documents);
    typeof resolver?.resolve === 'function' && resolver?.resolve(checkupData);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
  }
}

function* rolloverMonthlyCheckUpSaga() {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const currentCheckup = yield select(selectOpenedCheckup);
    const _id = currentCheckup._id;
    const response = yield SagaLib.mutationCall(UPDATE_MONTHLY_CHECKUP, {
      data: {
        _id,
        state: AppConstants.documentState.DONE,
      },
    });
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.rolloverCheckup, {
      document_id: _id,
      date: new Date().toUTCString(),
    });
    if (response) {
      yield createNewOpenedDocument();
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      if (error?.message === AppError.closedRollover) {
        GlobalLib.Toast.get().toastError(i18n.t('errorMsg.closedRollover'));
        yield createNewOpenedDocument();
      } else {
        GlobalLib.Toast.get().toastError(error?.message);
      }
    }
  } finally {
    loadingView.hide();
  }
}

function* deleteCheckUpSaga(action) {
  const { payload } = action;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const checkup = yield select(selectOpenedCheckup);
    const data = {
      _id: checkup._id,
      balances: [{ _id: payload?.data?._id, _delete: true }],
    };
    const response = yield SagaLib.mutationCall(UPDATE_MONTHLY_CHECKUP, { data });
    if (response) {
      yield put(getMonthlyCheckUpData());
      yield getMoneySmartsSaga();
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      if (error?.message === AppError.closedRollover) {
        GlobalLib.Toast.get().toastError(i18n.t('errorMsg.closedRollover'));
        yield createNewOpenedDocument();
      } else {
        GlobalLib.Toast.get().toastError(error?.message);
      }
    }
  } finally {
    loadingView.hide();
  }
}

function* getHistoricalLogBalance(payload = {}) {
  try {
    const cardId = get(payload, 'cardId');
    const childCardId = get(payload, 'childCardId');
    const field = get(payload, 'field');

    const variables = {
      cardId,
      childCardId,
      field,
      sortOrder: -1,
      excludeArchive: true,
    };
    const responses = yield SagaLib.queryCall(GET_HISTORICAL_LOG, variables);
    const historicalLogValues = get(responses, 'data.me.historicalTracking');
    const values = get(historicalLogValues, 'getValues.values');
    const archiveDates = get(historicalLogValues, 'archiveDates.values');
    return { values, archiveDates };
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    return null;
  } finally {
  }
}

function* getBalancesAsAtSaga(action) {
  const {
    payload: { data },
    resolver = {},
  } = action;
  // const loadingView = GlobalLib.Loading.get();
  // loadingView.show();
  try {
    const checkupData = yield select(selectCheckUpData);
    const response = yield SagaLib.queryCall(GET_MONNEYSMART_TRACKED_CARDS, {
      filter: { _id: checkupData?._id },
      date: data?.date,
    });

    const documents = get(
      response,
      ['data', 'me', 'moneyRollovers', 'documents', '0', 'getMoneySmartsTrackedCards'],
      [],
    );
    let result = [];
    for (let index = 0; index < documents.length; index++) {
      let card = documents[index];
      const historicalResponse = yield getHistoricalLogBalance({
        cardId: card._id,
        field: card.type === 'borrowings' ? 'outstanding' : 'balance',
      });
      const historicalDatas = historicalResponse?.values;
      const historicalArchived = historicalResponse?.archiveDates;
      const balance = historicalDatas?.find(x => x.asAt === data?.date);

      result.push({
        ...card,
        amount: balance?.numberValue,
        isArchived: first(historicalArchived)?.actionType === 'archive',
        archiveDate: first(historicalArchived)?.asAt,
      });
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(result);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    // loadingView.hide();
  }
}

function* historicalTrackingAddNumbersSaga(action) {
  const {
    payload: { data },
    resolver = {},
  } = action;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const response = yield SagaLib.mutationCall(HISTORICAL_TRACKING_ADD_NUMBERS_QUERY, {
      historicalNumberChangeInput: data.historicalNumberChangeInput,
    });
    const success = get(response, ['data', 'me', 'historicalTracking', 'addNumbers', 'success']);
    if (success) {
      yield getMonthlyCheckUpSaga();
      yield getMoneySmartsSaga();
      typeof resolver?.resolve === 'function' && resolver?.resolve(true);
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

function* changeStartDateSaga(action) {
  const { payload } = action;
  const resolver = action.resolver || {};
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const startDate = payload.data;
    const currentCheckup = yield select(selectOpenedCheckup);
    const variables = {
      data: {
        _id: currentCheckup._id,
        startDate: UtilLib.dateUTCAsAt(startDate),
      },
    };
    const response = yield SagaLib.mutationCall(MUTATION_CHANGE_START_DATE, variables);
    if (response) {
      yield rolloverCheckUp(UtilLib.dateUTCAsAt(startDate), null);
      yield put(getMonthlyCheckUpData());
      yield getMoneySmartsSaga();
      GlobalLib.Toast.get().toastSuccess(i18n.t('screens.monthlyCheckUp.changeStartDateSuccess'));
      typeof resolver?.resolve === 'function' && resolver?.resolve(response);
    }
  } catch (error) {
    if (!isEmpty(error?.message)) {
      if (error?.message === AppError.closedRollover) {
        GlobalLib.Toast.get().toastError(i18n.t('errorMsg.closedRollover'));
        yield createNewOpenedDocument();
      } else {
        if (error?.message === AppError.startDateExisted) {
          GlobalLib.Toast.get().toastError(i18n.t('errorMsg.startDateExisted'));
          return;
        }
        GlobalLib.Toast.get().toastError(error?.message);
      }
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

function* getMoneySMARTSTrackingCardsSaga(action) {
  const resolver = action.resolver || {};
  // const loadingView = GlobalLib.Loading.get();
  // loadingView.show();
  try {
    const response = yield SagaLib.queryCall(QUERY_GET_MONEY_SMARTS_TRACKING_CARDS);
    if (response) {
      const bankAccounts = get(response, 'data.me.client.assets.bankAccounts', []);
      const borrowings = get(response, 'data.me.client.borrowings', []);
      const data = {
        bankAccounts,
        borrowings,
      };
      typeof resolver?.resolve === 'function' && resolver?.resolve(data);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    // loadingView.hide();
  }
}

function* updateMoneySMARTSTrackingCardsSaga(action) {
  const {
    payload: { data },
    resolver = {},
  } = action;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const bankAccounts = get(data, 'bankAccounts', []);
    const borrowings = get(data, 'borrowings', []);
    for (let index = 0; index < bankAccounts.length; index++) {
      const card = bankAccounts[index];
      if (card?.isTrackedInMoneySmarts != null) {
        const variables = {
          cardId: card?._id,
          childCardId: null,
          field: 'isTrackedInMoneySmarts',
          asAt: card?.isTrackedInMoneySmartsAsAt,
          value: Number(card?.isTrackedInMoneySmarts),
        };
        yield SagaLib.mutationCall(ADD_HISTORICAL_LOG_NUMBER_MUTATION, variables);
      }
    }
    for (let index = 0; index < borrowings.length; index++) {
      const card = borrowings[index];
      if (card?.isTrackedInMoneySmarts != null) {
        const variables = {
          cardId: card?._id,
          childCardId: null,
          field: 'isTrackedInMoneySmarts',
          asAt: card?.isTrackedInMoneySmartsAsAt,
          value: Number(card?.isTrackedInMoneySmarts),
        };
        yield SagaLib.mutationCall(ADD_HISTORICAL_LOG_NUMBER_MUTATION, variables);
      }
    }

    if (bankAccounts.length > 0 || borrowings.length > 0) {
      GlobalLib.Toast.get().toastSuccess(
        i18n.t('screens.monthlyCheckUp.updateMoneySMARTSTrackingCardsSuccess'),
      );
      yield getMonthlyCheckUpSaga();
      yield getMoneySmartsSaga();
      typeof resolver?.resolve === 'function' && resolver?.resolve(true);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

function* findBankAccountAndCreditCardSaga({ payload, resolver }) {
  try {
    const params = {
      filter: {
        archived: [''],
        assets: ['Bank Accounts'],
        borrowings: [
          'Credit Card',
          'Home Loan - Line of Credit (Personal Use)',
          'Investment Loan - Line of Credit (Investment Use)',
        ],
        expense: [''],
        income: [''],
      },
      pagination: {
        page: 1,
        limit: 9999,
      },
    };
    const response = yield SagaLib.queryCall(GET_FINANCIAL_LIST_QUERY, params);
    const financialDashboard = get(response, ['data', 'me', 'financialDashboard']) || {};
    typeof resolver?.resolve === 'function' && resolver.resolve(financialDashboard);
  } catch (error) {
    UtilLib.toastErrorMsg(error);
    typeof resolver?.reject === 'function' && resolver.reject();
  } finally {
  }
}

function* takeMonthlyCheckUpSaga(action) {
  const resolver = action.resolver || {};
  try {
    yield take(SET_MONTHLY_CHECKUP_DATA);
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
  }
}

export default function* defaultSaga() {
  yield takeEvery(GET_MONTHLY_CHECKUP_DATA, getMonthlyCheckUpSaga);
  yield takeLatest(START_NEW_MONTHLY_CHECKUP_DATA, startMonthlyCheckUpSaga);
  yield takeLatest(DELETE_ALL_MONTHLY_CHECKUP_DATA, deleteAllCheckUpSaga);
  yield takeLatest(ADD_EDIT_MONTHLY_CHECKUP_DATA, addEditMonthlyCheckUpSaga);
  yield takeLatest(GET_PREVIUS_MONTHLY_CHECKUP_DATA, getPreviusMonthlyCheckUpSaga);
  yield takeLatest(ROLLOVER_MONTHLY_CHECKUP, rolloverMonthlyCheckUpSaga);
  yield takeLatest(DELETE_MONTHLY_CHECKUP_DATA, deleteCheckUpSaga);
  yield takeLatest(GET_BALANCES_AS_AT, getBalancesAsAtSaga);
  yield takeLatest(HISTORICAL_TRACKING_ADD_NUMBERS, historicalTrackingAddNumbersSaga);
  yield takeLatest(CHANGE_START_DATE, changeStartDateSaga);
  yield takeLatest(GET_MONEY_SMARTS_TRACKING_CARDS, getMoneySMARTSTrackingCardsSaga);
  yield takeLatest(UPDATE_MONEY_SMARTS_TRACKING_CARDS, updateMoneySMARTSTrackingCardsSaga);
  yield takeLatest(FIND_BANK_CREDIT, findBankAccountAndCreditCardSaga);
  yield takeLatest(TAKE_MONTHLY_CHECKUP, takeMonthlyCheckUpSaga);
}
