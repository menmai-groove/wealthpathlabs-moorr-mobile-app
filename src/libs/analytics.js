import analytics from '@react-native-firebase/analytics';
import { AppConstants } from 'constant';

import LogServiceLib from './logService';

const AnalyticsInstance = analytics();

const logEvent = (event, params) => {
  if (!event) {
    return;
  }
  try {
    LogServiceLib.debug('[Log event]: ' + event, params);
    AnalyticsInstance.logEvent(event, params);
  } catch (error) {
    LogServiceLib.debug('Error logEvent: ', error);
  }
};

const setUserProfile = (id, username) => {
  try {
    LogServiceLib.debug('Track user info: ', { id, username });
    if (id) {
      AnalyticsInstance.setUserId(`${id}`);
    }
    if (username) {
      AnalyticsInstance.setUserProperty(AppConstants.analytics.userProperties.name, username);
    }
  } catch (error) {
    LogServiceLib.debug('Error: setUserProfile', error);
  }
};

const trackScreen = routeName => {
  if (!routeName) {
    return;
  }
  try {
    LogServiceLib.debug('[screen view log]: ' + routeName);

    AnalyticsInstance.logScreenView({
      screen_name: routeName,
      screen_class: routeName,
    });
  } catch (error) {
    LogServiceLib.debug('Error trackScreen: ', error);
  }
};

const setUserTenant = tenant => {
  if (!tenant) {
    return;
  }
  try {
    LogServiceLib.debug('[tenant log]: ' + tenant);
    AnalyticsInstance.setUserProperty(AppConstants.analytics.userProperties.tenant, tenant);
  } catch (error) {
    LogServiceLib.debug('Error setUserTenant: ', error);
  }
};

export default {
  logEvent,
  setUserProfile,
  setUserTenant,
  trackScreen,
};
