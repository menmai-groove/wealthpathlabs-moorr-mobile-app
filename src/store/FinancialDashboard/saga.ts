import { AnalyticsLib, GlobalLib, SagaLib } from 'libs';
import { get, isEmpty, concat, uniqBy, isArray, find, last } from 'lodash';
import {
  all,
  select,
  takeEvery,
  takeLatest,
  putResolve,
  take,
  put,
  takeLeading,
} from 'redux-saga/effects';
import * as actions from 'store/FinancialDashboard/action';
import {
  GET_FINANCIAL_LIST_DATA,
  GET_FINANCIAL_SUMMARY_DATA,
  GET_STATIC_VALUES,
  DELETE_FINANCIAL_CARD_ITEM,
  REFETCH_FINANCIAL_LIST_DATA,
  ARCHIVE_FINANCIAL_CARD_ITEM,
  RESTORE_FINANCIAL_CARD_ITEM,
  SET_FETCH_PARAMS_IS_HANDLED,
  GET_LATEST_AS_AT,
  UPDATE_NEXT_PAY_DATE_START,
} from 'store/FinancialDashboard/constants';
import {
  GET_FINANCIAL_LIST_QUERY,
  GET_FINANCIAL_SUMMARY_QUERY,
  GET_FILTER_FIELDS_QUERY,
  DELETE_FINANCIAL_CARD_MUTATION,
  ARCHIVE_FINANCIAL_CARD_MUTATION,
  DELETE_FINANCIAL_CARD_2_MUTATION,
  RESTORE_FINANCIAL_CARD_MUTATION,
  GET_LATEST_AS_AT_QUERY,
  UPDATE_NEXT_PAY_DATE_START_MUTATION,
} from 'store/FinancialDashboard/query';
import {
  selectFinancialList,
  selectFetchParams,
  selectSelectedFilterButton,
} from 'store/FinancialDashboard/selector';
import { selectAppPreference } from 'store/Root/selector';
import { getStaticValues as getAuthStaticValues } from 'store/Auth/action';
import { syncFinancialData } from 'store/Home/action';
import { AppConstants } from 'constant';

import { selectExpenseType } from 'store/Auth/selector';
import { getWealthSpeedData } from 'store/Wealth/action';
import * as expenseActions from 'store/ExpenseDashboard/action';
import { FILTER_FIELDS, FINANCIAL_LIST_TYPE } from 'components/basics/FinancialList';

import { getNetWorth } from 'store/NetWorth/action';
import { getCashPosition } from 'store/CashPosition/action';
import { getAssetPosition } from 'store/AssetPosition/action';
import { getDebtPosition } from 'store/DebtPosition/action';
import i18n from 'bootstrap/i18n';

import { GET_DETAIL_BORROWING_QUERY, UPDATE_BORROWING_QUERY } from 'store/Borrowing/query';

import { DeleteFinancialCardPayload } from './types';

export function* refetchFinancialListSaga(action) {
  const { payload = {}, resolver = {} } = action;
  const { isRefresh, isAdded, amount = 1 } = payload;

  !isRefresh && GlobalLib.Loading.get().show();
  try {
    const { pagination } = yield select(selectAppPreference);
    const stateFinancialList = yield select(selectFinancialList);
    yield put(actions.getFinancialStaticValues(isRefresh, isAdded));
    if (isAdded) {
      yield take(SET_FETCH_PARAMS_IS_HANDLED);
    }
    const fetchParams = yield select(selectFetchParams);
    const { financialDashboardPageSize: LIMIT } = pagination;
    const totalItem = stateFinancialList.data.length;
    const params = {
      ...fetchParams,
      pagination: {
        page: 1,
        limit: isAdded && totalItem < LIMIT ? totalItem + amount : totalItem,
      },
    };
    const response = yield SagaLib.queryCall(GET_FINANCIAL_LIST_QUERY, params);
    const financialDashboard = get(response, ['data', 'me', 'financialDashboard']) || {};
    yield putResolve(
      actions.setFinancialList({
        ...stateFinancialList,
        data: financialDashboard.data,
        limit: LIMIT,
        page: financialDashboard.total > 0 ? Math.floor(financialDashboard.total / LIMIT) : 1,
        totalPages: Math.ceil(financialDashboard.total / LIMIT),
      }),
    );

    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    !isRefresh && GlobalLib.Loading.get().hide();
  }
}

export function* getFinancialListSaga(action) {
  const { payload = {}, resolver = {} } = action;
  const { isRefresh, isLoadMore, page } = payload;
  !isRefresh && !isLoadMore && GlobalLib.Loading.get().show();

  try {
    const { pagination } = yield select(selectAppPreference);
    const stateFinancialList = yield select(selectFinancialList);
    const fetchParams = yield select(selectFetchParams);
    const newPayload = { ...fetchParams };
    const { financialDashboardPageSize: LIMIT } = pagination;

    newPayload.pagination = { limit: LIMIT, page: !isRefresh && page ? page : 1 };
    const response = yield SagaLib.queryCall(GET_FINANCIAL_LIST_QUERY, newPayload);
    const resData = get(response, ['data', 'me', 'financialDashboard']) || {};
    if (newPayload.pagination.page === 1) {
      yield putResolve(actions.setFinancialList(resData));
    } else {
      const data = uniqBy(concat(stateFinancialList.data, resData.data), i => {
        const id = i.item?.id;
        return isArray(id) ? id.join('.') : id;
      });
      yield putResolve(actions.setFinancialList({ ...resData, data }));
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    !isRefresh && !isLoadMore && GlobalLib.Loading.get().hide();
  }
}

export function* getFinancialSummarySaga(action) {
  const { payload = {}, resolver = {} } = action;
  const { isRefresh } = payload;

  !isRefresh && GlobalLib.Loading.get().show();
  try {
    const response = yield SagaLib.queryCall(GET_FINANCIAL_SUMMARY_QUERY);
    const financialSummary = get(response, ['data', 'me', 'financialDashboard']);
    const properties = get(response, ['data', 'me', 'client', 'assets', 'properties']);
    const { expenses, income, assets, borrowings } = financialSummary || {};
    const propertyPortfolio = {
      total:
        get(
          find(
            get(financialSummary, ['assets', 'breakdown']) || [],
            item => item.key === 'Property',
          ),
          ['amount'],
        ) || 0,
      breakdown: properties.map(property => {
        const name = String(get(property, ['name'])).trim();
        const address = get(property, ['address']) || {};
        const unit = String(get(address, ['unit'])).trim() || '';
        const number = String(get(address, ['number'])).trim() || '';
        const street = String(get(address, ['street'])).trim() || '';
        let formattedAddress = '';
        const requiredKeys = ['unit', 'number'];
        const checkAllKeys = requiredKeys.every(
          i =>
            address.hasOwnProperty(i) &&
            (typeof address[i] === 'string' ? String(address[i]).trim() : address[i]) !== '' &&
            address[i] !== null,
        );
        const values = Object.values(address)
          .filter(x => (typeof x === 'string' ? String(x).trim() : x) !== '' && x !== null)
          .map(x => String(x).trim());
        if (checkAllKeys) {
          const length = values.length;
          if (length === 3) {
            formattedAddress = `${unit}/${number} ${street}`;
          }
          if (length === 2) {
            formattedAddress = `${unit}/${number}`;
          }
        } else {
          formattedAddress = values.join(' ');
        }
        return {
          key: formattedAddress || name || '',
          amount: get(property, ['currentValue']) || 0,
        };
      }),
    };
    yield putResolve(
      actions.setFinancialSummary({ expenses, income, assets, borrowings, propertyPortfolio }),
    );
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    !isRefresh && GlobalLib.Loading.get().hide();
  }
}

export function* getStaticValuesSaga(action) {
  const { payload = {}, resolver = {} } = action;
  const { isRefresh, isAdded } = payload;

  !isRefresh && GlobalLib.Loading.get().show();
  try {
    const response = yield SagaLib.queryCall(GET_FILTER_FIELDS_QUERY);
    const filterFieldsRes = get(response, ['data', 'me', 'financialDashboardFilters']);
    const { expenses, income, assets, borrowings, archived } = filterFieldsRes || {};
    yield putResolve(
      actions.setFinancialFilterFields({ expenses, income, assets, borrowings, archived }),
    );
    if (isAdded) {
      const selectedFilterButton = yield select(selectSelectedFilterButton);
      if (selectedFilterButton.length > 0) {
        const isAll = selectedFilterButton.includes(FINANCIAL_LIST_TYPE.ALL);
        const isIncome = selectedFilterButton.includes(FINANCIAL_LIST_TYPE.INCOME);
        const isExpense = selectedFilterButton.includes(FINANCIAL_LIST_TYPE.EXPENSE);
        const isAssets = selectedFilterButton.includes(FINANCIAL_LIST_TYPE.ASSETS);
        const isBorrowings = selectedFilterButton.includes(FINANCIAL_LIST_TYPE.BORROWINGS);
        const isArchived = selectedFilterButton.includes(FINANCIAL_LIST_TYPE.ARCHIVED);
        const allFilter = {
          [FILTER_FIELDS.ASSETS]: [],
          [FILTER_FIELDS.EXPENSE]: [],
          [FILTER_FIELDS.INCOME]: [],
          [FILTER_FIELDS.BORROWINGS]: [],
          [FILTER_FIELDS.ARCHIVED]: [''],
        };
        const archivedFilter = {
          [FILTER_FIELDS.ARCHIVED]: ['Archived Cards'],
        };
        const params = {
          filter: isAll
            ? allFilter
            : isArchived
            ? archivedFilter
            : {
                [FILTER_FIELDS.ASSETS]: isAssets ? assets?.map(item => item.value) : [''],
                [FILTER_FIELDS.EXPENSE]: isExpense ? expenses?.map(item => item.value) : [''],
                [FILTER_FIELDS.INCOME]: isIncome ? income?.map(item => item.value) : [''],
                [FILTER_FIELDS.BORROWINGS]: isBorrowings
                  ? borrowings?.map(item => item.value)
                  : [''],
                [FILTER_FIELDS.ARCHIVED]: [''],
              },
        };
        yield putResolve(actions.setFetchParams(params));
      }
      yield put(actions.setFetchParamsIsHandled());
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    !isRefresh && GlobalLib.Loading.get().hide();
  }
}

export function* deleteFinancialCardSaga(action: DeleteFinancialCardSagaParams) {
  const { payload = {}, resolver = {} } = action;
  const { type: cardType, item } = payload;
  const { id: _id, typeValue: itemType } = item;
  const _delete = true;

  try {
    GlobalLib.Loading.get().show();
    if (cardType === 'assets') {
      const assetType = AppConstants.financialAssetTypes.find(type => type.value === itemType);
      if (assetType) {
        const itemTypeKey = assetType.key;
        const page =
          itemType === AppConstants.AssetType.Property
            ? AppConstants.ClientHistoryQuery.Properties
            : AppConstants.ClientHistoryQuery.NonPropertyAssets;

        const variables = {
          data: {
            page,
            assets: { [itemTypeKey]: [{ _id: _id[0], _delete }] },
          },
        };
        yield SagaLib.mutationCall(DELETE_FINANCIAL_CARD_MUTATION, variables);
      }
    } else {
      let page = '';
      switch (cardType) {
        case 'income':
          page = AppConstants.ClientHistoryQuery.Income;
          break;
        case 'borrowings':
          page = AppConstants.ClientHistoryQuery.Borrowings;
          break;
        case 'expenses':
          const listExpense = yield select(selectExpenseType);
          const expenseType = listExpense.find(e => e.value === item?.typeValue);
          page =
            expenseType?.type === AppConstants.ExpenseGroups.Spending
              ? AppConstants.ClientHistoryQuery.Expenses
              : AppConstants.ClientHistoryQuery.BillPayments;
          break;

        default:
          break;
      }
      const variables = { data: { page, [cardType]: [{ _id: _id[0], _delete }] } };
      yield SagaLib.mutationCall(DELETE_FINANCIAL_CARD_MUTATION, variables);
    }
    yield all([
      putResolve(syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(actions.refetchFinancialListData(true)),
      putResolve(getWealthSpeedData({ generate: false })),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
    ]);
    switch (cardType) {
      case 'borrowings':
      case 'borrowing':
        yield all([putResolve(getNetWorth(true)), putResolve(getDebtPosition(true))]);
        break;
      case 'assets':
      case 'asset':
        yield all([
          putResolve(getCashPosition(true)),
          putResolve(getAssetPosition(true)),
          putResolve(getNetWorth(true)),
        ]);
        break;

      default:
        break;
    }
    // refetch static value
    if (itemType === 'Bank Accounts') {
      yield putResolve(getAuthStaticValues());
    }

    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    GlobalLib.Loading.get().hide();
  }
}

export function* deleteFinancialCard2Saga(action: DeleteFinancialCardSagaParams) {
  const { payload = {}, resolver = {} } = action;
  const { item } = payload;
  const { id: _id, typeValue: itemType, name, cardType } = item;

  try {
    GlobalLib.Loading.get().show();
    const variables = { cardId: _id[0] };
    yield SagaLib.mutationCall(DELETE_FINANCIAL_CARD_2_MUTATION, variables);
    yield all([
      putResolve(syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(actions.refetchFinancialListData(true)),
      putResolve(getWealthSpeedData({ generate: false })),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
    ]);
    // refetch static value
    if (itemType === 'Bank Accounts') {
      yield putResolve(getAuthStaticValues());
    }
    let category = '';
    switch (cardType) {
      case 'income':
        category = AppConstants.cardCategory.Income;
        break;
      case 'borrowings':
      case 'borrowing':
        category = AppConstants.cardCategory.Borrowing;
        break;
      case 'expenses':
      case 'expense':
        category = AppConstants.cardCategory.Expense;
        break;
      case 'assets':
      case 'asset':
        category = AppConstants.cardCategory.Asset;
        break;

      default:
        break;
    }
    switch (cardType) {
      case 'borrowings':
      case 'borrowing':
        yield all([putResolve(getNetWorth(true)), putResolve(getDebtPosition(true))]);
        break;
      case 'assets':
      case 'asset':
        yield all([
          putResolve(getCashPosition(true)),
          putResolve(getAssetPosition(true)),
          putResolve(getNetWorth(true)),
        ]);
        break;

      default:
        break;
    }

    const parameters = {
      category: category,
      item_type: itemType,
      name,
      card_id: _id[0],
    };
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardDelete, parameters);
    let message = i18n.t('successMsg.deleteCard', {
      cardType: category.toLowerCase(),
      name: name || '',
    });
    GlobalLib.Toast.get().toastSuccess(message);
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    GlobalLib.Loading.get().hide();
  }
}

export function* archiveFinancialCardSaga(action) {
  const { payload = {}, resolver = {} } = action;
  const { item, asAt } = payload;
  const { id: _id, name, itemType, cardType } = item;
  try {
    GlobalLib.Loading.get().show();
    const variables = { cardId: _id[0], asAt };

    if (cardType === 'borrowings' || cardType === 'borrowing') {
      // get borrowing detail
      const borrowingResponse = yield SagaLib.queryCall(GET_DETAIL_BORROWING_QUERY, { ids: _id });
      const borrowing = get(borrowingResponse, ['data', 'me', 'client', 'borrowings', 0]) || [];
      // if offest existed, remove it and update the offesetAsAt
      if (borrowing.offsets) {
        const offsets: any = [];
        const currentOffsets = borrowing.offsets ?? [];
        currentOffsets.forEach((offset: any) => {
          offsets.push({
            _id: offset._id,
            _delete: true,
          });
        });
        const removeOffset = {
          page: AppConstants.ClientHistoryQuery.Borrowings,
          borrowings: [
            {
              _id: borrowing._id,
              offsets: offsets,
              offsetsAsAt: asAt,
            },
          ],
        };
        yield SagaLib.mutationCall(UPDATE_BORROWING_QUERY, {
          data: removeOffset,
        });
      }
    }
    yield SagaLib.mutationCall(ARCHIVE_FINANCIAL_CARD_MUTATION, variables);
    yield all([
      putResolve(syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(actions.refetchFinancialListData(true)),
      putResolve(getWealthSpeedData({ generate: false })),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
    ]);
    let category = '';
    switch (cardType) {
      case 'income':
        category = AppConstants.cardCategory.Income;
        break;
      case 'borrowings':
      case 'borrowing':
        category = AppConstants.cardCategory.Borrowing;
        break;
      case 'expenses':
      case 'expense':
        category = AppConstants.cardCategory.Expense;
        break;
      case 'assets':
      case 'asset':
        category = AppConstants.cardCategory.Asset;
        break;

      default:
        break;
    }
    switch (cardType) {
      case 'borrowings':
      case 'borrowing':
        yield all([putResolve(getNetWorth(true)), putResolve(getDebtPosition(true))]);
        break;
      case 'assets':
      case 'asset':
        yield all([
          putResolve(getCashPosition(true)),
          putResolve(getAssetPosition(true)),
          putResolve(getNetWorth(true)),
        ]);
        break;

      default:
        break;
    }

    const parameters = {
      category: category,
      item_type: itemType,
      name,
      card_id: _id[0],
      action: 'Archive',
    };
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardStatusChange, parameters);
    let message = i18n.t('successMsg.archiveCard', {
      cardType: category.toLowerCase(),
      name: name || '',
    });
    GlobalLib.Toast.get().toastSuccess(message);
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    GlobalLib.Loading.get().hide();
  }
}

export function* restoreFinancialCardSaga(action) {
  const { payload = {}, resolver = {} } = action;
  const { item, asAt } = payload;
  const { id: _id, cardType, name, itemType } = item;

  try {
    GlobalLib.Loading.get().show();
    const variables = { cardId: _id[0], asAt };
    yield SagaLib.mutationCall(RESTORE_FINANCIAL_CARD_MUTATION, variables);

    let category = '';
    switch (cardType) {
      case 'income':
        category = AppConstants.cardCategory.Income;
        break;
      case 'borrowings':
      case 'borrowing':
        category = AppConstants.cardCategory.Borrowing;
        break;
      case 'expenses':
      case 'expense':
        category = AppConstants.cardCategory.Expense;
        break;
      case 'assets':
      case 'asset':
        category = AppConstants.cardCategory.Asset;
        break;

      default:
        break;
    }
    const parameters = {
      category: category,
      item_type: itemType,
      name,
      card_id: _id[0],
      action: 'Restore',
    };
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardStatusChange, parameters);

    yield all([
      putResolve(syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(actions.refetchFinancialListData(true)),
      putResolve(getWealthSpeedData({ generate: false })),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
    ]);

    switch (cardType) {
      case 'borrowings':
      case 'borrowing':
        yield all([putResolve(getNetWorth(true)), putResolve(getDebtPosition(true))]);
        break;
      case 'assets':
      case 'asset':
        yield all([
          putResolve(getCashPosition(true)),
          putResolve(getAssetPosition(true)),
          putResolve(getNetWorth(true)),
        ]);
        break;

      default:
        break;
    }
    let message = i18n.t('successMsg.restoreCard', {
      cardType: category.toLowerCase(),
      name: name || '',
    });
    GlobalLib.Toast.get().toastSuccess(message);
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    GlobalLib.Loading.get().hide();
  }
}

function* getLatestAsAtSaga(action) {
  const { payload, resolver = {} } = action;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const cardId = payload?.cardId;
    const response = yield SagaLib.mutationCall(GET_LATEST_AS_AT_QUERY, { cardId });
    const latestAsAt = get(response, [
      'data',
      'me',
      'historicalTracking',
      'latestAsAt',
      'latestAsAt',
    ]);
    const latestAsAtDate = latestAsAt ? new Date(latestAsAt) : undefined;

    typeof resolver?.resolve === 'function' && resolver?.resolve(latestAsAtDate);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  } finally {
    loadingView.hide();
  }
}

function* updateNextPayDateStartSaga(action) {
  const { payload, resolver = {} } = action;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const cardType = get(payload, ['cardType']);
  const _id = get(payload, ['_id']);
  const nextPayDateStart = get(payload, ['nextPayDateStart']);
  const nextPayDateStartField = get(payload, ['nextPayDateStartField']);
  const frequencyField = get(payload, ['frequencyField']);
  const frequency = get(payload, ['frequency']);
  const assetType = get(payload, ['assetType']);
  const includeIncome = cardType === 'income';
  const includeExpenses = cardType === 'expenses';
  const includeAssets = cardType === 'assets';
  const includeBorrowings = cardType === 'borrowings';
  const page = includeIncome
    ? AppConstants.ClientHistoryQuery.Income
    : includeExpenses
    ? AppConstants.ClientHistoryQuery.Expenses
    : includeAssets
    ? AppConstants.ClientHistoryQuery.NonPropertyAssets
    : includeBorrowings
    ? AppConstants.ClientHistoryQuery.Borrowings
    : AppConstants.ClientHistoryQuery.Income;

  let data;
  if (includeIncome) {
    data = {
      page,
      income: [
        {
          _id,
          nextPayDateStart,
          [frequencyField]: frequency,
        },
      ],
    };
  }
  if (includeAssets) {
    if (assetType === 'superFunds') {
      data = {
        page,
        assets: {
          superFunds: {
            _id,
            [nextPayDateStartField]: nextPayDateStart,
            [frequencyField]: frequency,
          },
        },
      };
    } else {
      data = {
        page,
        assets: {
          investments: {
            _id,
            nextContributionDateStart: nextPayDateStart,
            [frequencyField]: frequency,
          },
        },
      };
    }
  }
  if (includeBorrowings) {
    data = {
      page,
      borrowings: [
        {
          _id,
          [nextPayDateStartField]: nextPayDateStart,
          [frequencyField]: frequency,
        },
      ],
    };
  }
  if (includeExpenses) {
    data = {
      page,
      expenses: [
        {
          _id,
          [nextPayDateStartField]: nextPayDateStart,
          [frequencyField]: frequency,
        },
      ],
    };
  }
  try {
    const variables = {
      data,
      includeIncome,
      includeExpenses,
      includeAssets,
      includeBorrowings,
    };

    const response = yield SagaLib.mutationCall(UPDATE_NEXT_PAY_DATE_START_MUTATION, variables);

    const cards =
      cardType === 'assets'
        ? get(response, [
            'data',
            'me',
            'client',
            'update',
            cardType,
            assetType === 'superFunds' ? 'superFunds' : 'investments',
          ])
        : get(response, ['data', 'me', 'client', 'update', cardType]) || [];
    const card = cards.find(x => x?._id === _id);
    typeof resolver?.resolve === 'function' && resolver?.resolve(card);
  } catch (error) {
    if (!isEmpty(error.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.resolve === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export default function* defaultSaga() {
  yield takeEvery(GET_FINANCIAL_SUMMARY_DATA, getFinancialSummarySaga);
  yield takeEvery(GET_STATIC_VALUES, getStaticValuesSaga);

  yield takeLatest(GET_FINANCIAL_LIST_DATA, getFinancialListSaga);
  yield takeLatest(DELETE_FINANCIAL_CARD_ITEM, deleteFinancialCard2Saga);
  yield takeLatest(REFETCH_FINANCIAL_LIST_DATA, refetchFinancialListSaga);
  yield takeLatest(ARCHIVE_FINANCIAL_CARD_ITEM, archiveFinancialCardSaga);
  yield takeLatest(RESTORE_FINANCIAL_CARD_ITEM, restoreFinancialCardSaga);
  yield takeLatest(GET_LATEST_AS_AT, getLatestAsAtSaga);
  yield takeLeading(UPDATE_NEXT_PAY_DATE_START, updateNextPayDateStartSaga);
}

type DeleteFinancialCardSagaParams = {
  type: string;
  payload: DeleteFinancialCardPayload | any;
  resolver?: any;
};
