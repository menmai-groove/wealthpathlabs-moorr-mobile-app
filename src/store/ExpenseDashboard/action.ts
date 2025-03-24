/*
 * ExpenseDashboard actions
 */

import {
  DELETE_FINANCIAL_CARD_ITEM,
  GET_BREAKDOWN_ITEMS,
  GET_FINANCIAL_LIST_DATA,
  GET_GROUPING_AND_ITEMS,
  GET_STATIC_VALUES,
  REFETCH_FINANCIAL_LIST_DATA,
  RESET_FETCHING_FINANCIAL_LIST,
  SET_FETCH_PARAMS,
  SET_FINANCIAL_FILTER_FIELDS,
  SET_FINANCIAL_LIST_DATA,
  SET_GROUPING_AND_ITEMS,
  SET_IS_LOADING_EXPENSE_DASHBOARD,
  SET_SELECTED_FILTER_BUTTON,
} from 'store/ExpenseDashboard/constants';
import { DeleteFinancialCardPayload } from 'store/FinancialDashboard/types';

export const setFetchParams = payload => ({
  type: SET_FETCH_PARAMS,
  payload,
});

export const getFinancialList = (isRefresh?: boolean, isLoadMore?: boolean, payload?: object) => ({
  type: GET_FINANCIAL_LIST_DATA,
  payload: {
    ...payload,
    isRefresh,
    isLoadMore,
  },
});

export const refetchFinancialListData = (
  isRefresh?: boolean,
  isAdded?: boolean,
  amount?: number,
) => ({
  type: REFETCH_FINANCIAL_LIST_DATA,
  payload: {
    isRefresh,
    isAdded,
    amount,
  },
});

export const setFinancialList = payload => ({
  type: SET_FINANCIAL_LIST_DATA,
  payload,
});

export const getFinancialStaticValues = (isRefresh?: boolean) => ({
  type: GET_STATIC_VALUES,
  payload: {
    isRefresh,
  },
});

export const setFinancialFilterFields = payload => ({
  type: SET_FINANCIAL_FILTER_FIELDS,
  payload,
});

export const deleteFinancialCardItem = (payload: DeleteFinancialCardPayload) => ({
  type: DELETE_FINANCIAL_CARD_ITEM,
  payload,
});

export const resetFetchingFinancialList = () => ({
  type: RESET_FETCHING_FINANCIAL_LIST,
  payload: {},
});

export const getGroupingAndItems = payload => ({
  type: GET_GROUPING_AND_ITEMS,
  payload,
});

export const setGroupingAndItems = payload => ({
  type: SET_GROUPING_AND_ITEMS,
  payload,
});

export const getBreakdownItems = payload => ({
  type: GET_BREAKDOWN_ITEMS,
  payload,
});

export const setIsLoading = payload => ({
  type: SET_IS_LOADING_EXPENSE_DASHBOARD,
  payload,
});

export const setSelectedFilterButton = payload => ({
  type: SET_SELECTED_FILTER_BUTTON,
  payload,
});
