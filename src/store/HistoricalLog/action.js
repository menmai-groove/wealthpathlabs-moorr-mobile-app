import {
  ADD_HISTORICAL_LOG,
  DELETE_HISTORICAL_LOG,
  GET_HISTORICAL_LOG_DATA,
  SET_HISTORICAL_LOG_DATA,
} from 'store/HistoricalLog/constants';

export const getHistoricalLogData = data => ({
  type: GET_HISTORICAL_LOG_DATA,
  payload: {
    data,
  },
});

export const setHistoricalLogData = data => ({
  type: SET_HISTORICAL_LOG_DATA,
  payload: {
    data,
  },
});

export const addHistoricalLog = data => ({
  type: ADD_HISTORICAL_LOG,
  payload: {
    data,
  },
});

export const deleteHistoricalLog = data => ({
  type: DELETE_HISTORICAL_LOG,
  payload: {
    data,
  },
});
