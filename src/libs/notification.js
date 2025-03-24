import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

import LogServiceLib from './logService';

const FCM = messaging();

const initialize = async () => {
  try {
    const fcmToken = await FCM.getToken();
    if (fcmToken) {
      await AsyncStorage.setItem('fcmToken', fcmToken);
    }
  } catch (err) {}
};

const getToken = async () => {
  let fcmToken = await AsyncStorage.getItem('fcmToken');
  return fcmToken;
};

const removeToken = async () => {
  try {
    await FCM.deleteToken();
    await AsyncStorage.removeItem('fcmToken');
  } catch (err) {}
};

const registerRemoteMessages = async () => {
  try {
    if (!FCM.isDeviceRegisteredForRemoteMessages) {
      await FCM.registerDeviceForRemoteMessages();
    }
  } catch (err) {
    LogServiceLib.debug('Register remote messages failed', err);
  }
};

const subscribeFromTopic = async topic => {
  try {
    const fcmToken = await getToken();
    if (fcmToken) {
      await FCM.subscribeToTopic(topic);
    }
  } catch (err) {
    LogServiceLib.debug('Subscribe topic failed', err);
  }
};

const unsubscribeFromTopic = async topic => {
  try {
    const fcmToken = await getToken();
    if (fcmToken) {
      await FCM.unsubscribeFromTopic(topic);
    }
  } catch (err) {
    LogServiceLib.debug('Unsubscribe topic failed', err);
  }
};

const onMessage = callback => FCM.onMessage(callback);

const onNotificationOpenedApp = callback => FCM.onNotificationOpenedApp(callback);

const getInitialNotification = callback => {
  FCM.getInitialNotification().then(callback);
};

const setBackgroundMessageHandler = callback => {
  FCM.setBackgroundMessageHandler(async message => {
    if (typeof callback === 'function') {
      callback(message);
    }
  });
};

export const DELAY_FCM_TIMEOUT = 15000;

export default {
  initialize,
  setBackgroundMessageHandler,
  registerRemoteMessages,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  subscribeFromTopic,
  unsubscribeFromTopic,
  getToken,
  removeToken,
};
