/*
 *
 * ExpenseDashboard reducer
 *
 */

import { FINANCIAL_LIST_TYPE } from 'components/basics/FinancialList';
import {
  RESET_FETCHING_FINANCIAL_LIST,
  SET_FETCH_PARAMS,
  SET_FINANCIAL_FILTER_FIELDS,
  SET_FINANCIAL_LIST_DATA,
  SET_GROUPING_AND_ITEMS,
  SET_IS_LOADING_EXPENSE_DASHBOARD,
  SET_SELECTED_FILTER_BUTTON,
  SORT_TYPE,
} from 'store/ExpenseDashboard/constants';

export const initialState = {
  fetchParams: {
    filter: null,
    searchKey: '',
    desc: true,
  },
  isFetchedList: false,
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
  selectedFilterButton: [FINANCIAL_LIST_TYPE.EXPENSE],
  targetedExpenses: {},
  grouping: {},
  items: {},
  sortType: SORT_TYPE.AMOUNT,
  desc: true,
  isFetchedGroupingAndItems: false,
};

function expenseDashboardReducer(state = initialState, action) {
  switch (action.type) {
    case SET_FETCH_PARAMS:
      return { ...state, fetchParams: { ...state.fetchParams, ...action.payload } };

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
    case SET_IS_LOADING_EXPENSE_DASHBOARD: {
      return {
        ...state,
        isFetchedGroupingAndItems: action.payload,
        isFetchedList: action.payload,
      };
    }
    case SET_GROUPING_AND_ITEMS: {
      return {
        ...state,
        targetedExpenses: action.payload.targetedExpenses,
        grouping: action.payload.grouping,
        items: action.payload.items,
        sortType: action.payload.sortType,
        desc: action.payload.desc,
        isFetchedGroupingAndItems: true,
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

export default expenseDashboardReducer;
