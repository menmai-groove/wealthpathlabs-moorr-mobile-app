import i18n from 'bootstrap/i18n';
import GlobalLib from 'libs/global';
import { Alert, Platform } from 'react-native';
import {
  openSettings,
  PERMISSIONS,
  request,
  requestNotifications as RNrequestNotifications,
  RESULTS,
} from 'react-native-permissions';

const i18nScope = 'permissionMsg';

const permissionType = {
  LOCATION: 'location',
  STORAGE: 'storage',
  CAMERA: 'camera',
  NOTIFICATION: 'notification',
  FACE_ID: 'faceID',
};

const customerAlert = (permission, leftAction = () => {}, rightAction = () => {}) =>
  new Promise(async (resolve, reject) => {
    try {
      let description, msg;
      switch (permission) {
        case permissionType.NOTIFICATION:
          description = i18n.t(`${i18nScope}.notificationSettings`);
          msg = i18n.t(`${i18nScope}.notificationsRequest`);
          break;
        case permissionType.LOCATION:
          description = i18n.t(`${i18nScope}.locationSettings`);
          msg = i18n.t(`${i18nScope}.locationPermissionRequest`);
          break;
        case permissionType.STORAGE:
          description = i18n.t(`${i18nScope}.storageSettings`);
          msg = i18n.t(`${i18nScope}.storagePermissionRequest`);
          break;
        case permissionType.CAMERA:
          description = i18n.t(`${i18nScope}.cameraSettings`);
          msg = i18n.t(`${i18nScope}.cameraPermissionRequest`);
          break;
        case permissionType.FACE_ID:
          description = i18n.t(`${i18nScope}.faceIDSettings`);
          msg = i18n.t(`${i18nScope}.faceIDPermissionRequest`);
          break;
        default:
          return reject();
      }
      Alert.alert(
        description,
        msg,
        [
          {
            text: i18n.t(`${i18nScope}.deny`),
            onPress: () => {
              leftAction();
              return reject();
            },
          },
          {
            text: i18n.t(`${i18nScope}.allow`),
            onPress: () => {
              rightAction();
              return resolve();
            },
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      return reject();
    }
  });

const statusProcessing = status =>
  new Promise((resolve, reject) => {
    switch (status) {
      case RESULTS.UNAVAILABLE:
      case RESULTS.DENIED:
      case RESULTS.LIMITED:
      case RESULTS.GRANTED:
        return resolve(true);
      case RESULTS.BLOCKED:
        return resolve(false);
      default:
        return reject();
    }
  });

const requestNotifications = () =>
  new Promise(async (resolve, reject) => {
    try {
      const { status } = await RNrequestNotifications(['alert', 'badge', 'sound']);
      let result = await statusProcessing(status);
      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  });

const requestNotificationPermission = async (forced = false) => {
  try {
    let result = await requestNotifications();
    if (!result) {
      const showWarning = () => {
        GlobalLib.Toast.get().toastWarning(i18n.t(`${i18nScope}.notificationsWarning`));
      };
      if (!forced) {
        showWarning();
        return result;
      }
      return customerAlert(permissionType.NOTIFICATION, showWarning, openSettings);
    }
    return result;
  } catch (err) {}
};

const requestPermission = permission =>
  new Promise(async (resolve, reject) => {
    try {
      const status = await request(permission);
      let result = await statusProcessing(status);
      return resolve(result);
    } catch (error) {
      return reject(error);
    }
  });

const requestLocationPermission = async (forced = false) => {
  try {
    if (Platform.OS === 'android') {
      await requestPermission(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
    }
    let result = await requestPermission(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      permissionType.LOCATION,
    );
    if (!result) {
      const showWarning = () => {
        GlobalLib.Toast.get().toastWarning(i18n.t(`${i18nScope}.locationPermissionWarning`));
      };
      if (!forced) {
        showWarning();
        return result;
      }
      return customerAlert(permissionType.LOCATION, showWarning, openSettings);
    }
    return result;
  } catch (error) {}
};

const requestStoragePermission = async (forced = false) => {
  try {
    let result = await requestPermission(
      Platform.OS === 'android'
        ? Platform.Version >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        : PERMISSIONS.IOS.PHOTO_LIBRARY,
      permissionType.STORAGE,
    );
    if (!result) {
      const showWarning = () => {
        GlobalLib.Toast.get().toastWarning(
          Platform.OS === 'android'
            ? i18n.t(`${i18nScope}.storagePermissionWarning`)
            : i18n.t(`${i18nScope}.photoPermissionWarning`),
        );
      };
      if (!forced) {
        showWarning();
        return result;
      }
      return customerAlert(permissionType.STORAGE, showWarning, openSettings);
    }
    return result;
  } catch (error) {}
};

const requestCameraPermission = async (forced = false) => {
  try {
    let result = await requestPermission(
      Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA,
      permissionType.CAMERA,
    );
    if (!result) {
      const showWarning = () => {
        GlobalLib.Toast.get().toastWarning(i18n.t(`${i18nScope}.cameraPermissionWarning`));
      };
      if (!forced) {
        showWarning();
        return result;
      }
      return customerAlert(permissionType.CAMERA, showWarning, openSettings);
    }
    return result;
  } catch (error) {}
};

const requestFaceIDPermission = async (forced = false) => {
  try {
    if (Platform.OS !== 'ios') {
      return;
    }
    // if from iOS 11+
    if (Platform.OS === 'ios' && parseInt(Platform.Version, 10) < 11) {
      return;
    }
    let result = await requestPermission(PERMISSIONS.IOS.FACE_ID);
    if (!result) {
      const showWarning = () => {
        GlobalLib.Toast.get().toastWarning(i18n.t(`${i18nScope}.faceIDPermissionWarning`));
      };
      if (!forced) {
        showWarning();
        return result;
      }
      return customerAlert(permissionType.FACE_ID, showWarning, openSettings);
    }
    return result;
  } catch (err) {}
};

export default {
  requestNotificationPermission,
  requestLocationPermission,
  requestStoragePermission,
  requestCameraPermission,
  requestFaceIDPermission,
};
