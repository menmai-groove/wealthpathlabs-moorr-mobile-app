import { ApolloProvider } from '@apollo/client';
import crashlytics from '@react-native-firebase/crashlytics';
import i18next from 'bootstrap/i18n';
import store, { persistor } from 'bootstrap/store';
import { AppConstants } from 'constant';
import { AnalyticsLib, NotificationLib, PushNotificationLib } from 'libs';
import { has } from 'lodash';
import AppRoute from 'navigation';
import { AppThemeProvider, OrientationProvider } from 'providers';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Platform, UIManager, View } from 'react-native';
import { ClickOutsideProvider } from 'react-native-click-outside';
import { Settings } from 'react-native-fbsdk-next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MenuProvider } from 'react-native-popup-menu';
import { RootSiblingParent } from 'react-native-root-siblings';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import Root from 'screens/Root';
import { client } from 'services/apolloGraphql';
import { initialize as initBiometric } from 'services/biometrics';
import { AppStyle } from 'theme';

import AppMeta from '../app.json';

if (__DEV__) {
  crashlytics().setCrashlyticsCollectionEnabled(false);
}

if (AppMeta.ENABLE_PUSH_NOTIFICATION) {
  NotificationLib.registerRemoteMessages();
  NotificationLib.setBackgroundMessageHandler(async remoteMessage => {
    const isDataOnlyMessage = !has(remoteMessage, 'notification');
    if (!isDataOnlyMessage) {
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.notificationReceived, {
        type: remoteMessage?.data?.type,
        title: remoteMessage?.notification?.title,
        body: remoteMessage?.notification?.body,
      });
    }
  });
  PushNotificationLib.initialize();
}

initBiometric();

Settings.initializeSDK();

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Wrap App in Redux provider (makes Redux available to all sub-components)
export default function AppContainer() {
  return (
    <GestureHandlerRootView style={AppStyle.flex1}>
      <RootSiblingParent>
        <SafeAreaProvider>
          <I18nextProvider i18n={i18next}>
            <Provider store={store}>
              <PersistGate loading={<View />} persistor={persistor}>
                <ApolloProvider client={client}>
                  <AppThemeProvider>
                    <OrientationProvider>
                      <Root>
                        <ClickOutsideProvider>
                          <MenuProvider>
                            <AppRoute />
                          </MenuProvider>
                        </ClickOutsideProvider>
                      </Root>
                    </OrientationProvider>
                  </AppThemeProvider>
                </ApolloProvider>
              </PersistGate>
            </Provider>
          </I18nextProvider>
        </SafeAreaProvider>
      </RootSiblingParent>
    </GestureHandlerRootView>
  );
}
