import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { AppConfigs } from 'constant';
import { cloneDeep, isFunction } from 'lodash';
import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';

const eventHandlers = {};

const localNotification = notification => {
  try {
    if (Platform.OS === 'android') {
      PushNotification.localNotification({
        title: notification.title,
        message: notification.message,
        userInfo: cloneDeep(notification.data),
        channelId: AppConfigs.notificationChannelId,

        playSound: false,
        soundName: null,
        vibrate: false,
        vibration: 0,
      });
    } else {
      PushNotification.localNotification({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        userInfo: cloneDeep(notification.data),

        playSound: false,
        soundName: null,
        vibrate: false,
        vibration: 0,
      });
    }
  } catch (error) {}
};

const initialize = async () => {
  if (Platform.OS === 'android') {
    PushNotification.createChannel({
      channelId: AppConfigs.notificationChannelId,
      channelName: AppConfigs.notificationChannelName,
      soundName: 'default',
    });
  }

  PushNotification.configure({
    onNotification: function (notification) {
      if (isFunction(eventHandlers.onNotification)) {
        eventHandlers.onNotification(notification);
      }
      if (Platform.OS === 'ios') {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
  });
};

const onNotification = handler => {
  eventHandlers.onNotification = handler;
  return () => {
    eventHandlers.onNotification = undefined;
  };
};

const popInitialNotification = callback => {
  PushNotification.popInitialNotification(notification => {
    callback(notification);
  });
};

const removeAllDeliveredNotifications = () => {
  PushNotification.removeAllDeliveredNotifications();
  PushNotification.setApplicationIconBadgeNumber(0);
};

const setApplicationIconBadgeNumber = badgeCount => {
  PushNotification.setApplicationIconBadgeNumber(badgeCount);
};

export default {
  initialize,
  localNotification,
  onNotification,
  popInitialNotification,
  removeAllDeliveredNotifications,
  setApplicationIconBadgeNumber,
};
