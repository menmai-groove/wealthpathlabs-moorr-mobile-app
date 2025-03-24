/*
 *
 * FinancialDashboard reducer
 *
 */

import { FINANCIAL_LIST_TYPE } from 'components/basics/FinancialList';
import {
  RESET_FETCHING_FINANCIAL_LIST,
  SET_FETCH_PARAMS,
  SET_FINANCIAL_FILTER_FIELDS,
  SET_FINANCIAL_LIST_DATA,
  SET_FINANCIAL_SUMMARY_DATA,
  SET_SELECTED_FILTER_BUTTON,
} from 'store/FinancialDashboard/constants';

export const initialState = {
  fetchParams: {
    filter: null,
    searchKey: '',
    desc: true,
  },
  isFetchedList: false,
  isFetchedSummary: false,
  summary: {
    income: null,
    borrowings: null,
    expenses: null,
    assets: null,
  },
  financialList: {
    data: [],
    allLoaded: false,
    total: 0,
    page: 0,
    pageSize: 0,
    totalPages: 0,
  },
  filterFields: {
    expenses: [],
    assets: [],
    income: [],
    borrowings: [],
    archived: [],
  },
  selectedFilterButton: [FINANCIAL_LIST_TYPE.ALL],
};

function incomeDashboardReducer(state = initialState, action) {
  switch (action.type) {
    case SET_FETCH_PARAMS:
      return { ...state, fetchParams: { ...state.fetchParams, ...action.payload } };

    case SET_FINANCIAL_SUMMARY_DATA:
      return {
        ...state,
        isFetchedSummary: true,
        summary: action.payload,
      };
    case SET_FINANCIAL_LIST_DATA: {
      const { totalPages, page } = action.payload;
      const allLoaded = page >= totalPages;

      return {
        ...state,
        isFetchedList: true,
        financialList: {
          ...action.payload,
          allLoaded,
        },
      };
    }
    case SET_FINANCIAL_FILTER_FIELDS: {
      return {
        ...state,
        filterFields: action.payload,
      };
    }
    case RESET_FETCHING_FINANCIAL_LIST: {
      return {
        ...state,
        isFetchedList: false,
      };
    }
    case SET_SELECTED_FILTER_BUTTON: {
      return {
        ...state,
        selectedFilterButton: action.payload,
      };
    }
    default:
      return state;
  }
}

export default incomeDashboardReducer;
