/*
 *
 * Notification actions
 *
 */

import {
  GET_CAMPAIGN,
  GET_NOTIFICATION,
  MARK_ALL_READ,
  SET_IS_FULL_DATA,
  SET_MARK_IT_AS_READ,
  SET_NOTIFICATION,
  SET_RESET_PAGE_INDEX,
  SET_TOTAL_BADGE,
  TRIGGER_BUTTON_CAMPAIGN,
  UPDATE_NOTIFICATIONS,
} from 'store/Notification/constants';

export const getNotifications = data => ({
  type: GET_NOTIFICATION,
  payload: data,
});

export const setNotifications = data => ({
  type: SET_NOTIFICATION,
  payload: {
    data,
  },
});

export const setNotificationsFull = data => ({
  type: SET_IS_FULL_DATA,
  payload: {
    data,
  },
});

export const setTotalBadge = data => ({
  type: SET_TOTAL_BADGE,
  payload: {
    data,
  },
});

export const setResetPageIndex = () => ({
  type: SET_RESET_PAGE_INDEX,
  payload: {},
});

export const setMarkItAsRead = data => ({
  type: SET_MARK_IT_AS_READ,
  payload: {
    data,
  },
});

export const markAllAsRead = data => ({
  type: MARK_ALL_READ,
  payload: data,
});
export const updateListNotifications = data => ({
  type: UPDATE_NOTIFICATIONS,
  payload: { data },
});

export const getCampaign = data => ({
  type: GET_CAMPAIGN,
  payload: data,
});

export const triggerButtonCampaign = data => ({
  type: TRIGGER_BUTTON_CAMPAIGN,
  payload: data,
});
