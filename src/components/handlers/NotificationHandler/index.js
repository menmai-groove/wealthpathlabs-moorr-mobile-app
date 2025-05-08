import { AppConstants, AppScreenID } from 'constant';
import { AnalyticsLib, NavigationServiceLib, NotificationLib, PushNotificationLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { get, has, isEmpty, isNil, isNull } from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import { AppState, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, onRefreshDeviceAccessToken, onVerifyDevice } from 'store/Auth/action';
import { selectAccessToken, selectTask, selectUser } from 'store/Auth/selector';
import { selectHomeRendered } from 'store/Home/selector';
import { setMarkItAsRead, setNotifications, setTotalBadge } from 'store/Notification/action';
import { selectNotification, selectTotalBadge } from 'store/Notification/selector';
import { selectAppPermissions, selectNavReady } from 'store/Root/selector';

const NotificationTypes = {
  VERIFY_DEVICE: 'verify-device',
  REFRESH_TOKEN: 'refresh-token',
};

function NotificationHandler() {
  const isNavReady = useSelector(selectNavReady);
  const isHomeScreenReady = useSelector(selectHomeRendered);
  const isAppPermissions = useSelector(selectAppPermissions);
  const accessToken = useSelector(selectAccessToken);
  const task = useSelector(selectTask);
  const notifications = useSelector(selectNotification);
  const totalBadge = useSelector(selectTotalBadge);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();
  const notificationsRef = useRef([]);
  const appState = useRef(AppState.currentState);
  const timeoutRef = useRef();

  const onMessageReceived = useRef(() => {});
  const onLocalNotification = useRef(() => {});
  const onMessageReceivedInForeground = useRef(() => {});
  const onMessageOpened = useRef(() => {});

  const checkCorrectUser = useCallback(message => user?.uid === message?.data?.uid, [user]);

  const convertData = useCallback((notification, keys = []) => {
    Object.keys(notification).forEach(key => {
      const formatted = keys.some(e => e === key);
      if (formatted) {
        const value = notification[key];
        notification[key] = value === 'true' ? true : value === 'false' ? false : value;
      }
    });

    return notification;
  }, []);

  const handleSetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      const cloneNotifications = [...notificationsRef.current];
      notificationsRef.current = [];
      const oldNotifications = notifications;
      var ids = new Set(oldNotifications.map(d => d._id));
      const newNotifications = cloneNotifications.filter(d => !ids.has(d._id));
      const oldTotalBadge = totalBadge;
      if (newNotifications.length) {
        dispatch(setNotifications([...newNotifications, ...oldNotifications]));
        dispatch(setTotalBadge(oldTotalBadge + newNotifications.length));
      }
    }, 500);
  }, [dispatch, notifications, totalBadge]);

  const handleUpdateNotification = useCallback(
    message => {
      if (!isNull(accessToken) && isNavReady) {
        const data = convertData(message?.data, ['isRead']);
        if (Object.values(NotificationTypes).includes(data?.type)) {
          return;
        }
        if (notificationsRef.current.length === 0) {
          handleSetTimeout();
        }
        notificationsRef.current?.push({ ...data });
      }
    },
    [accessToken, isNavReady, convertData, handleSetTimeout],
  );

  const handleOpenNotification = useCallback(
    message => {
      if (!isNull(accessToken) && isNavReady) {
        if (!checkCorrectUser(message)) {
          dispatch(addTask(null));
          return;
        }

        const data = convertData(message?.data, ['isRead']);
        if (Object.values(NotificationTypes).includes(data?.type)) {
          return;
        }
        if (!data?.isRead) {
          dispatch(setMarkItAsRead(data));
        }

        if (isHomeScreenReady) {
          NavigationServiceLib.navigate(AppScreenID.Notification, { notification: data });
          dispatch(addTask(null));
        }
      } else {
        dispatch(addTask(message));
      }
    },
    [
      accessToken,
      isNavReady,
      checkCorrectUser,
      convertData,
      dispatch,
      dispatchResolve,
      isHomeScreenReady,
    ],
  );

  const handleTrackingNotification = useCallback((message, eventName) => {
    const isDataOnlyMessage = !has(message, 'notification');
    if (!isDataOnlyMessage) {
      AnalyticsLib.logEvent(eventName, {
        type: message?.data?.type,
        title: message?.notification?.title,
        body: message?.notification?.body,
      });
    }
  }, []);

  const handleBadgeIOS = useCallback(message => {
    const unreadNotificationCount = get(message, 'notification.ios.badge');
    if (unreadNotificationCount >= 0) {
      PushNotificationLib.setApplicationIconBadgeNumber(unreadNotificationCount);
    }
  }, []);

  const handleDataOnlyMessage = useCallback(
    message => {
      const { data = {} } = message;
      switch (data.type) {
        case NotificationTypes.VERIFY_DEVICE:
          dispatch(onVerifyDevice(message));
          break;
        case NotificationTypes.REFRESH_TOKEN:
          dispatch(onRefreshDeviceAccessToken(message));
          break;
        default:
          break;
      }
    },
    [dispatch],
  );

  const _handleAppStateChange = useCallback(
    async nextAppState => {
      if (nextAppState !== 'inactive' && appState.current !== nextAppState) {
        if (appState.current === 'background' && nextAppState === 'active') {
          handleSetTimeout();
        }
        appState.current = nextAppState;
      }
    },
    [handleSetTimeout],
  );

  useEffect(() => {
    onMessageReceived.current = async message => {
      if (isEmpty(message)) {
        return;
      }

      handleDataOnlyMessage(message);
      handleUpdateNotification(message);
      handleTrackingNotification(message, AppConstants.analytics.eventTypes.notificationReceived);
    };
  }, [handleUpdateNotification, handleTrackingNotification, handleDataOnlyMessage]);

  useEffect(() => {
    onLocalNotification.current = async message => {
      if (isEmpty(message?.notification) || isNil(message?.notification)) {
        return;
      }
      const { title, body } = message.notification;
      const { messageId, data } = message;
      PushNotificationLib.localNotification({
        id: messageId,
        title: title || '',
        message: body || '',
        data: data || {},
      });
    };
  }, []);

  useEffect(() => {
    onMessageReceivedInForeground.current = async message => {
      if (isEmpty(message)) {
        return;
      }
      onMessageReceived.current(message);
      onLocalNotification.current(message);
      handleBadgeIOS(message);
    };
  }, [dispatch]);

  useEffect(() => {
    onMessageOpened.current = async message => {
      if (isEmpty(message)) {
        return;
      }

      onMessageReceived.current(message);
      handleOpenNotification(message);
      handleTrackingNotification(message, AppConstants.analytics.eventTypes.notificationOpened);
    };
  }, [handleOpenNotification, handleTrackingNotification]);

  useEffect(() => {
    if (isEmpty(task) || !isHomeScreenReady) {
      return;
    }

    onMessageReceived.current(task);
    handleOpenNotification(task);
  }, [task, isHomeScreenReady, handleOpenNotification]);

  useEffect(() => {
    if (isNavReady && isAppPermissions) {
      NotificationLib.initialize().then(() => {
        NotificationLib.subscribeFromTopic(AppConstants.notificationTopic.Global);
      });
    }
  }, [isNavReady, isAppPermissions]);

  useEffect(() => {
    if (isNavReady) {
      // Foreground notification
      const onMessage = NotificationLib.onMessage(async message =>
        onMessageReceivedInForeground.current(message),
      );

      // Background notification
      NotificationLib.setBackgroundMessageHandler(async message =>
        onMessageReceived.current(message),
      );

      // Handles the event when the app is opened by clicking on a notification
      const onNotification = PushNotificationLib.onNotification(notification =>
        onMessageOpened.current({ data: notification.data }),
      );

      // Handles the event when the app is opened from a notification after a cold start
      PushNotificationLib.popInitialNotification(async message => {
        onMessageOpened.current(message);
      });

      return () => {
        onMessage();
        onNotification();
      };
    }
  }, [isNavReady]);

  useEffect(() => {
    const listener = AppState.addEventListener('change', _handleAppStateChange);
    return () => {
      listener.remove();
    };
  }, [_handleAppStateChange]);

  return <View />;
}

export default NotificationHandler;
