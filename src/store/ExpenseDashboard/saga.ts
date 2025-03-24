import { GlobalLib, SagaLib } from 'libs';
import { cloneDeep, concat, get, isArray, isEmpty, lowerCase, uniqBy } from 'lodash';
import { putResolve, select, takeEvery, takeLatest } from 'redux-saga/effects';
import * as actions from 'store/ExpenseDashboard/action';
import {
  GET_BREAKDOWN_ITEMS,
  GET_FINANCIAL_LIST_DATA,
  GET_GROUPING_AND_ITEMS,
  GET_STATIC_VALUES,
  REFETCH_FINANCIAL_LIST_DATA,
  SORT_TYPE,
} from 'store/ExpenseDashboard/constants';
import {
  GET_BREAKDƠN_ITEMS_QUERY,
  GET_FILTER_FIELDS_QUERY,
  GET_FINANCIAL_LIST_QUERY,
  GET_GROUPING_AND_ITEMS_QUERY,
} from 'store/ExpenseDashboard/query';

import {
  makeSelectDomain,
  selectFetchParams,
  selectFinancialList,
  selectSortType,
} from 'store/ExpenseDashboard/selector';
import { selectAppPreference } from 'store/Root/selector';

export function* refetchFinancialListSaga(action) {
  const { payload = {}, resolver = {} } = action;
  const { isRefresh, isAdded, amount = 1 } = payload;

  !isRefresh && GlobalLib.Loading.get().show();
  try {
    // reload fetch params
    yield putResolve(actions.getFinancialStaticValues(isRefresh));
    if (isAdded) {
      yield putResolve(actions.setIsLoading(false));
    }
    const { pagination } = yield select(selectAppPreference);
    const stateFinancialList = yield select(selectFinancialList);
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

    //reload data grouping and items
    yield putResolve(actions.getGroupingAndItems({ isRefresh }));

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

export function* getStaticValuesSaga(action) {
  const { payload = {}, resolver = {} } = action;
  const { isRefresh } = payload;

  !isRefresh && GlobalLib.Loading.get().show();
  try {
    const response = yield SagaLib.queryCall(GET_FILTER_FIELDS_QUERY);
    const filterFieldsRes = get(response, ['data', 'me', 'financialDashboardFilters']);
    const { expenses, income, assets, borrowings, archived } = filterFieldsRes || {};
    yield putResolve(
      actions.setFinancialFilterFields({ expenses, income, assets, borrowings, archived }),
    );

    const filter = {
      expense: expenses.map(x => x.value),
      income: [''],
      assets: [''],
      borrowings: [''],
      archived: [''],
    };
    const params = { searchKey: '', filter: filter };
    yield putResolve(actions.setFetchParams(params));
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

export function* getGroupingAndItemSaga(action) {
  const { payload = {}, resolver = {} } = action;
  let sortType = yield select(selectSortType);
  const { isRefresh, desc = true } = payload;
  if (payload.sortType) {
    sortType = payload.sortType;
  }
  !isRefresh && GlobalLib.Loading.get().show();
  try {
    const monthlyVariables = {
      frequency: 'MONTHLY',
      sortType,
      desc: sortType === SORT_TYPE.AMOUNT ? desc : !desc,
    };
    const yearlyVariables = {
      frequency: 'YEARLY',
      sortType,
      desc: sortType === SORT_TYPE.AMOUNT ? desc : !desc,
    };
    const monthlyResponse = yield SagaLib.queryCall(GET_GROUPING_AND_ITEMS_QUERY, monthlyVariables);
    const yearlyResponse = yield SagaLib.queryCall(GET_GROUPING_AND_ITEMS_QUERY, yearlyVariables);
    const monthlyExpensesDashboard = get(monthlyResponse, ['data', 'me', 'expensesDashboard']);
    const yearlyExpensesDashboard = get(yearlyResponse, ['data', 'me', 'expensesDashboard']);

    const monthlyTargetedExpenses = get(monthlyExpensesDashboard, ['targetedExpenses']);
    const yearlyTargetedExpenses = get(yearlyExpensesDashboard, ['targetedExpenses']);

    const monthlyGrouping = get(monthlyExpensesDashboard, ['grouping', 'breakdown']);
    const yearlyGrouping = get(yearlyExpensesDashboard, ['grouping', 'breakdown']);

    const monthlyItems = get(monthlyExpensesDashboard, ['items', 'breakdown']);
    const yearlyItems = get(yearlyExpensesDashboard, ['items', 'breakdown']);

    const groupingAndItems = {
      targetedExpenses: {
        monthly: monthlyTargetedExpenses,
        yearly: yearlyTargetedExpenses,
      },
      grouping: {
        monthly: monthlyGrouping,
        yearly: yearlyGrouping,
      },
      items: {
        monthly: monthlyItems,
        yearly: yearlyItems,
      },
      sortType,
      desc,
    };
    yield putResolve(actions.setGroupingAndItems(groupingAndItems));
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

function* getBreakdownItemsSaga(action) {
  const { payload = {}, resolver = {} } = action;
  const { frequency, sortType = SORT_TYPE.AMOUNT, desc = true, type, typeQuery, key } = payload;

  try {
    const variables = {
      frequency,
      sortType,
      desc,
      type: typeQuery,
      key,
    };
    const breakdownItemsResponse = yield SagaLib.queryCall(
      GET_BREAKDƠN_ITEMS_QUERY,
      variables,
      {},
      false,
    );
    const breakdownItemsData = get(breakdownItemsResponse, [
      'data',
      'me',
      'expensesDashboardItems',
      'data',
    ]);

    const groupingAndItems = yield select(makeSelectDomain);
    const { targetedExpenses, grouping, items } = groupingAndItems;
    const dataClone = cloneDeep({
      targetedExpenses,
      grouping,
      items,
      sortType,
      desc,
    });
    let breakdowns = get(dataClone, [type, lowerCase(frequency)], []);
    breakdowns.forEach(breakdown => {
      if (breakdown.key === key) {
        breakdown.items = breakdownItemsData ?? [];
      }
    });

    yield putResolve(actions.setGroupingAndItems(dataClone));
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
  yield takeEvery(GET_STATIC_VALUES, getStaticValuesSaga);

  yield takeLatest(GET_FINANCIAL_LIST_DATA, getFinancialListSaga);
  yield takeLatest(REFETCH_FINANCIAL_LIST_DATA, refetchFinancialListSaga);
  yield takeLatest(GET_GROUPING_AND_ITEMS, getGroupingAndItemSaga);
  yield takeLatest(GET_BREAKDOWN_ITEMS, getBreakdownItemsSaga);
}
