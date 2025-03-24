/* eslint-disable no-console */
const { replace } = require('./utils');

try {
  console.log('React native push notification fix...');

  const findValue =
    'PendingIntent pendingIntent = PendingIntent.getActivity(context, notificationID, intent,\n                    PendingIntent.FLAG_UPDATE_CURRENT);';
  const replaceValue =
    'PendingIntent pendingIntent = null;\n            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {\n                pendingIntent = PendingIntent.getActivity(context, notificationID, intent, PendingIntent.FLAG_MUTABLE);\n            }\n            else {\n                pendingIntent = PendingIntent.getActivity(context, notificationID, intent, PendingIntent.FLAG_UPDATE_CURRENT);\n            }\n';

  // NOTE: update RNPushNotificationHelper.java
  replace({
    path:
      'react-native-push-notification/android/src/main/java/com/dieam/reactnativepushnotification/modules/RNPushNotificationHelper.java',
    pairs: [[findValue, replaceValue]],
  });

  console.log('> Done');
} catch (error) {
  console.error(error);
}
