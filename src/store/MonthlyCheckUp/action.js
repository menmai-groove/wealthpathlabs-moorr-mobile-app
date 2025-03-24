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
  RESET_PREVIUS_MONTHLY_CHECKUP_DATA,
  ROLLOVER_MONTHLY_CHECKUP,
  SET_ACTIONS,
  SET_LAST_START_DATE,
  // GET_MONTHLY_CHECKUP_REPORT_DATA,
  SET_MONTHLY_CHECKUP_DATA,
  SET_MONTHLY_CHECKUP_REPORT_DATA,
  SET_PREVIOUS_CHECKUP_DATA,
  SET_PROVISION_REPORT_DATA,
  SET_REGULAR_REPORT_DATA,
  SET_START_DATE,
  START_NEW_MONTHLY_CHECKUP_DATA,
  TAKE_MONTHLY_CHECKUP,
  UPDATE_MONEY_SMARTS_TRACKING_CARDS,
} from 'store/MonthlyCheckUp/constants';

export const getMonthlyCheckUpData = isRefresh => ({
  type: GET_MONTHLY_CHECKUP_DATA,
  payload: {
    isRefresh,
  },
});

export const setMonthlyCheckUpData = data => ({
  type: SET_MONTHLY_CHECKUP_DATA,
  payload: {
    data,
  },
});

export const setProvisionReportData = data => ({
  type: SET_PROVISION_REPORT_DATA,
  payload: {
    data,
  },
});

export const setRegularReportData = data => ({
  type: SET_REGULAR_REPORT_DATA,
  payload: {
    data,
  },
});

export const startMonthlyCheckUp = data => ({
  type: START_NEW_MONTHLY_CHECKUP_DATA,
  payload: {
    data,
  },
});

export const setMonthlyCheckUpReportTableData = data => ({
  type: SET_MONTHLY_CHECKUP_REPORT_DATA,
  payload: {
    data,
  },
});

export const setLastStateDate = data => ({
  type: SET_LAST_START_DATE,
  payload: {
    data,
  },
});

export const setPreviousCheckUpData = data => ({
  type: SET_PREVIOUS_CHECKUP_DATA,
  payload: {
    data,
  },
});

export const addEditMonthlyCheckUp = data => ({
  type: ADD_EDIT_MONTHLY_CHECKUP_DATA,
  payload: {
    data,
  },
});

export const deleteAllMonthlyCheckUp = () => ({
  type: DELETE_ALL_MONTHLY_CHECKUP_DATA,
});

export const getPreviusMonthlyCheckUpData = data => ({
  type: GET_PREVIUS_MONTHLY_CHECKUP_DATA,
  payload: {
    page: data.page,
  },
});

export const resetPreviusCheckUpData = () => ({
  type: RESET_PREVIUS_MONTHLY_CHECKUP_DATA,
  payload: {},
});

export const rolloverCheckUp = () => ({
  type: ROLLOVER_MONTHLY_CHECKUP,
});

export const deleteCheckUp = data => ({
  type: DELETE_MONTHLY_CHECKUP_DATA,
  payload: {
    data,
  },
});

export const getBalancesAsAt = data => ({
  type: GET_BALANCES_AS_AT,
  payload: {
    data,
  },
});

export const historicalTrackingAddNumbers = data => ({
  type: HISTORICAL_TRACKING_ADD_NUMBERS,
  payload: {
    data,
  },
});

export const changeStartDate = data => ({
  type: CHANGE_START_DATE,
  payload: {
    data,
  },
});

export const getMoneySMARTSTrackingCards = data => ({
  type: GET_MONEY_SMARTS_TRACKING_CARDS,
  payload: {
    data,
  },
});

export const updateMoneySMARTSTrackingCards = data => ({
  type: UPDATE_MONEY_SMARTS_TRACKING_CARDS,
  payload: {
    data,
  },
});
export const findBankAccountAndCreditCard = data => ({
  type: FIND_BANK_CREDIT,
  payload: {
    data,
  },
});

export const setStartDate = data => ({
  type: SET_START_DATE,
  payload: {
    data,
  },
});

export const takeMonthlyCheckUp = data => ({
  type: TAKE_MONTHLY_CHECKUP,
  payload: {
    data,
  },
});

export const setActions = data => ({
  type: SET_ACTIONS,
  payload: {
    data,
  },
});
