import { GlobalLib, PushNotificationLib, SagaLib } from 'libs';
import { get, isArray, isEmpty } from 'lodash';
import { putResolve, select, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  setNotifications,
  setNotificationsFull,
  setResetPageIndex,
  setTotalBadge,
  updateListNotifications,
} from 'store/Notification/action';
import {
  GET_CAMPAIGN,
  GET_NOTIFICATION,
  MARK_ALL_READ,
  SET_MARK_IT_AS_READ,
  TRIGGER_BUTTON_CAMPAIGN,
} from 'store/Notification/constants';
import {
  CAMPAIGN_TRIGGER_BUTTON,
  GET_NOTIFICATIONS,
  MARK_ALL_AS_READ,
  MARK_IT_AS_READ,
  VIEW_CAMPAIGN,
} from 'store/Notification/query';
import {
  selectNotification,
  selectNotificationPage,
  selectTotalBadge,
} from 'store/Notification/selector';
import { selectAppPreference } from 'store/Root/selector';

export function* getNotificationSaga(action) {
  const resolver = action.resolver || {};
  const page = action?.payload?.page;
  try {
    const { pagination } = yield select(selectAppPreference);
    const { notificationPageSize: LIMIT } = pagination;
    if (page === 1) {
      const variables = {
        pagination: {
          page,
          limit: LIMIT,
        },
      };
      const notificationsResponse = yield SagaLib.queryCall(GET_NOTIFICATIONS, variables);
      const documents = notificationsResponse?.data?.me?.notifications?.paginated?.documents || [];
      const totalBadge = notificationsResponse?.data?.me?.notifications?.paginated?.totalBadge || 0;
      const smallestTotalBadge = Math.max(totalBadge, 0);
      yield putResolve(setResetPageIndex());
      yield putResolve(setTotalBadge(smallestTotalBadge));
      yield putResolve(setNotifications(documents));
      const unreadNotificationCount = totalBadge;
      if (unreadNotificationCount >= 0) {
        PushNotificationLib.setApplicationIconBadgeNumber(unreadNotificationCount);
      }
    } else {
      const pageIndex = yield select(selectNotificationPage);
      const variables = {
        pagination: {
          page: pageIndex,
          limit: LIMIT,
        },
      };
      const notificationsResponse = yield SagaLib.queryCall(GET_NOTIFICATIONS, variables);
      const documents = notificationsResponse?.data?.me?.notifications?.paginated?.documents || [];
      if (isArray(documents) && documents.length > 0) {
        const oldNotifications = yield select(selectNotification);
        yield putResolve(setNotifications(oldNotifications.concat(documents)));
      } else {
        yield putResolve(setNotificationsFull());
      }
    }

    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  }
}

export function* markAllAsReadSaga(action) {
  const loading = GlobalLib.Loading.get();
  loading.show();
  const resolver = action.resolver || {};
  try {
    const variables = {
      pagination: {
        page: 1,
        limit: 1,
      },
    };
    const notificationsResponse = yield SagaLib.mutationCall(MARK_ALL_AS_READ, variables);
    const totalBadge =
      notificationsResponse?.data?.me?.notifications?.markAllAsRead?.paginated?.totalBadge;
    if (totalBadge === 0) {
      const notifications = yield select(selectNotification);
      const newNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true,
      }));
      yield putResolve(updateListNotifications(newNotifications));
      yield putResolve(setTotalBadge(totalBadge));
    }

    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loading.hide();
  }
}

export function* setMarkItAsReadSaga(action) {
  const resolver = action.resolver || {};
  try {
    const data = action.payload.data;
    const _id = data._id;
    const variables = {
      data: {
        id: _id,
        isRead: true,
      },
    };
    const notificationResponse = yield SagaLib.mutationCall(MARK_IT_AS_READ, variables);
    const updatedNotification = notificationResponse?.data?.me?.notifications?.update;
    if (updatedNotification) {
      const oldNotifications = yield select(selectNotification);
      const oldTotalBadge = yield select(selectTotalBadge);
      const updateNotifications = oldNotifications.map(notification => ({
        ...notification,
        isRead: notification._id === _id ? true : notification.isRead,
      }));
      const smallestTotalBadge = Math.max(oldTotalBadge - 1, 0);
      yield putResolve(setNotifications(updateNotifications));
      yield putResolve(setTotalBadge(smallestTotalBadge));
      typeof resolver?.resolve === 'function' && resolver?.resolve();
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } catch (error) {
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
  }
}

export function* getCampaignSaga(action) {
  const loading = GlobalLib.Loading.get();
  loading.show();
  const resolver = action.resolver || {};
  const payload = action.payload || {};
  try {
    const variables = {
      campaignId: payload.campaignId,
    };
    const campaignResponse = yield SagaLib.mutationCall(VIEW_CAMPAIGN, variables);
    const campaign = get(campaignResponse, ['data', 'me', 'campaign', 'get']);

    typeof resolver?.resolve === 'function' && resolver?.resolve(campaign);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loading.hide();
  }
}

export function* triggerButtonCampaignSaga(action) {
  const resolver = action.resolver || {};
  const payload = action.payload || {};
  try {
    const variables = {
      buttonId: payload.buttonId,
      dialogId: payload.dialogId,
      campaignId: payload.campaignId,
      action: 'button',
    };
    yield SagaLib.mutationCall(CAMPAIGN_TRIGGER_BUTTON, variables);

    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
  }
}

export default function* defaultSaga() {
  yield takeLatest(GET_NOTIFICATION, getNotificationSaga);
  yield takeEvery(SET_MARK_IT_AS_READ, setMarkItAsReadSaga);
  yield takeLatest(MARK_ALL_READ, markAllAsReadSaga);
  yield takeLatest(GET_CAMPAIGN, getCampaignSaga);
  yield takeLatest(TRIGGER_BUTTON_CAMPAIGN, triggerButtonCampaignSaga);
}
