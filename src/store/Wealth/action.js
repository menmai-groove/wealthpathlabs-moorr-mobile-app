import {
  GET_HISTORY_WEALTH_SPEED_DATA,
  GET_WEALTH_SPEED_DATA,
  GET_WEALTH_SPEED_SUCCESS,
  SET_INDEX,
  SET_WEALTH_SPEED_DATA,
} from 'store/Wealth/constants';

export const getWealthSpeedData = data => ({
  type: GET_WEALTH_SPEED_DATA,
  payload: {
    data,
  },
});

export const setWealthSpeedData = wealthSpeedData => ({
  type: SET_WEALTH_SPEED_DATA,
  payload: {
    wealthSpeedData,
  },
});

export const getHistoryWealthSpeedData = data => ({
  type: GET_HISTORY_WEALTH_SPEED_DATA,
  payload: {
    data,
  },
});

export const setIndex = index => ({
  type: SET_INDEX,
  payload: {
    index,
  },
});

export const getWealthSpeedSuccess = () => ({
  type: GET_WEALTH_SPEED_SUCCESS,
});
