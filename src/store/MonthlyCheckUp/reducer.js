import {
  RESET_PREVIUS_MONTHLY_CHECKUP_DATA,
  SET_ACTIONS,
  SET_LAST_START_DATE,
  SET_MONTHLY_CHECKUP_DATA,
  SET_MONTHLY_CHECKUP_REPORT_DATA,
  SET_PREVIOUS_CHECKUP_DATA,
  SET_PROVISION_REPORT_DATA,
  SET_REGULAR_REPORT_DATA,
  SET_START_DATE,
} from 'store/MonthlyCheckUp/constants';

export const initialState = {
  fetchedData: false,
  checkupData: undefined,
  previousCheckups: {
    documents: [],
    total: 0,
    page: 0,
    limit: 0,
  },
  lastStartDate: undefined,
  listTableData: [],
  listTableDate: [],
  monthlyProvisionSpent: [],
  yearlyRemainingProvisions: [],

  regularSpendingData: {
    accumulatedActualSurplus: [],
    rollingTargetedSurplus: [],
    monthlyActualSurplus: [],
    targetedMonthlySurplus: [],
    monthlyExcessSurplus: [],
    accumulatedExcessSurplus: [],
    savingsFlag: 0,
    spendingFlag: 0,
    primaryAccountBalance: [],
  },

  startDate: undefined,

  actions: [],
};

export function monthlyCheckUpReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_MONTHLY_CHECKUP_DATA:
      return {
        ...state,
        checkupData: payload.data,
        fetchedData: true,
      };
    case SET_MONTHLY_CHECKUP_REPORT_DATA:
      return {
        ...state,
        ...payload.data,
      };
    case SET_PREVIOUS_CHECKUP_DATA:
      return {
        ...state,
        previousCheckups: payload.data,
      };
    case RESET_PREVIUS_MONTHLY_CHECKUP_DATA:
      return {
        ...state,
        previousCheckups: {
          documents: [],
          total: 0,
          page: 0,
          limit: 0,
        },
      };
    case SET_LAST_START_DATE:
      return {
        ...state,
        lastStartDate: payload.data,
      };
    case SET_PROVISION_REPORT_DATA:
      return {
        ...state,
        monthlyProvisionSpent: payload.data.monthlyProvisionSpent,
        yearlyRemainingProvisions: payload.data.yearlyRemainingProvisions,
      };
    case SET_REGULAR_REPORT_DATA:
      return {
        ...state,
        regularSpendingData: payload.data,
      };
    case SET_START_DATE:
      return {
        ...state,
        startDate: payload.data,
      };
    case SET_ACTIONS: {
      const ADD = payload.data.key && payload.data.action;
      const REMOVE = payload.data.key;
      const FOUND = state.actions.find(actionItem => actionItem.key === payload.data.key);
      return {
        ...state,
        actions: ADD
          ? !FOUND
            ? [...state.actions, payload.data.action]
            : state.actions.map(actionItem => ({
                ...actionItem,
                ...(actionItem.key === payload.data.key ? { ...payload.data.action } : {}),
              }))
          : REMOVE
          ? FOUND
            ? state.actions.filter(actionItem => actionItem.key !== payload.data.key)
            : state.actions
          : state.actions,
      };
    }

    default:
      return state;
  }
}
