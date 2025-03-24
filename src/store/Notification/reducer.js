/*
 *
 * Notification reducer
 *
 */

import {
  SET_IS_FULL_DATA,
  SET_NOTIFICATION,
  SET_RESET_PAGE_INDEX,
  SET_TOTAL_BADGE,
  UPDATE_NOTIFICATIONS,
} from 'store/Notification/constants';

export const initialState = {
  notifications: [],
  pageIndex: 1,
  fetchedData: false,
  isFullData: false,
  totalBadge: 0,
};

function notificationReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_NOTIFICATION:
      return {
        ...state,
        fetchedData: true,
        notifications: payload.data,
        pageIndex: state.pageIndex + 1,
      };
    case SET_IS_FULL_DATA:
      return {
        ...state,
        fetchedData: true,
        isFullData: true,
      };
    case SET_TOTAL_BADGE:
      return {
        ...state,
        totalBadge: payload.data,
      };
    case UPDATE_NOTIFICATIONS:
      return {
        ...state,
        notifications: payload.data,
      };
    case SET_RESET_PAGE_INDEX:
      return initialState;
    default:
      return state;
  }
}

export default notificationReducer;
