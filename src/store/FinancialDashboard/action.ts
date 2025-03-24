/*
 * FinancialDashboard actions
 */

import {
  GET_FINANCIAL_LIST_DATA,
  GET_FINANCIAL_SUMMARY_DATA,
  SET_FINANCIAL_LIST_DATA,
  SET_FINANCIAL_SUMMARY_DATA,
  GET_STATIC_VALUES,
  SET_FINANCIAL_FILTER_FIELDS,
  DELETE_FINANCIAL_CARD_ITEM,
  SET_FETCH_PARAMS,
  REFETCH_FINANCIAL_LIST_DATA,
  RESET_FETCHING_FINANCIAL_LIST,
  ARCHIVE_FINANCIAL_CARD_ITEM,
  RESTORE_FINANCIAL_CARD_ITEM,
  SET_SELECTED_FILTER_BUTTON,
  SET_FETCH_PARAMS_IS_HANDLED,
  GET_LATEST_AS_AT,
  UPDATE_NEXT_PAY_DATE_START,
} from 'store/FinancialDashboard/constants';

import { DeleteFinancialCardPayload } from './types';

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

export const getFinancialSummary = (isRefresh?: boolean) => ({
  type: GET_FINANCIAL_SUMMARY_DATA,
  payload: {
    isRefresh,
  },
});

export const setFinancialSummary = payload => ({
  type: SET_FINANCIAL_SUMMARY_DATA,
  payload,
});

export const setFinancialList = payload => ({
  type: SET_FINANCIAL_LIST_DATA,
  payload,
});

export const getFinancialStaticValues = (isRefresh?: boolean, isAdded?: boolean) => ({
  type: GET_STATIC_VALUES,
  payload: {
    isRefresh,
    isAdded,
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

export const archiveFinancialCardItem = payload => ({
  type: ARCHIVE_FINANCIAL_CARD_ITEM,
  payload,
});

export const restoreFinancialCardItem = payload => ({
  type: RESTORE_FINANCIAL_CARD_ITEM,
  payload,
});

export const setSelectedFilterButton = payload => ({
  type: SET_SELECTED_FILTER_BUTTON,
  payload,
});

export const setFetchParamsIsHandled = () => ({
  type: SET_FETCH_PARAMS_IS_HANDLED,
});

export const getLatestAsAt = payload => ({
  type: GET_LATEST_AS_AT,
  payload,
});

export const updateNextPayDateStart = data => ({
  type: UPDATE_NEXT_PAY_DATE_START,
  payload: data,
});
