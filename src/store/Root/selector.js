import { AppConfigs } from 'constant';
import { get, isArray, isObject, merge } from 'lodash';
import { createSelector } from 'reselect';
import { initialState } from 'store/Root/reducer';

const getConfigValue = (preferences, key) => {
  const remoteConfig = get(preferences, [key]);
  if (remoteConfig && isObject(remoteConfig) && !isArray(remoteConfig)) {
    return merge({}, get(AppConfigs, [key]), remoteConfig);
  }
  return remoteConfig || get(AppConfigs, [key]);
};

export const makeSelectRootDomain = state => state.root || initialState;

export const makeSelectPreferenceDomain = state =>
  state?.root?.preference || initialState.preference;

export const selectNavReady = createSelector(makeSelectRootDomain, state => state.isNavReady);

export const selectCheckUserSuccess = createSelector(
  makeSelectRootDomain,
  state => state.checkUserSuccess,
);

export const selectCheckUpdateApp = createSelector(
  makeSelectRootDomain,
  state => state.checkUpdateApp,
);

export const selectConfigLoaded = createSelector(makeSelectRootDomain, state => state.configLoaded);

export const selectAppPreference = createSelector(makeSelectPreferenceDomain, preference => {
  return {
    googlePlaceApiKey: getConfigValue(preference, 'googlePlaceApiKey'),
    registerHelpLink: getConfigValue(preference, 'registerHelpLink'),
    feedbackInformingLink: getConfigValue(preference, 'feedbackInformingLink'),
    googleAuthenticationHelpLink: getConfigValue(preference, 'googleAuthenticationHelpLink'),
    termConditionJsonLink: getConfigValue(preference, 'termConditionJsonLink'),
    pagination: getConfigValue(preference, 'pagination'),
    verticalTimeline: getConfigValue(preference, 'verticalTimeline'),
    teasers: getConfigValue(preference, 'teasers'),
    maxBadge: getConfigValue(preference, 'maxBadge'),
    historicalCapitalGrowthMaxValue: getConfigValue(preference, 'historicalCapitalGrowthMaxValue'),
    historicalCapitalGrowthMinValue: getConfigValue(preference, 'historicalCapitalGrowthMinValue'),
    historicalCapitalGrowthMaxDisplayValue: getConfigValue(
      preference,
      'historicalCapitalGrowthMaxDisplayValue',
    ),
    webHomePage: getConfigValue(preference, 'webHomePage'),
    wealthDashboardLink: getConfigValue(preference, 'wealthDashboardLink'),
  };
});

export const selectDarkMode = createSelector(makeSelectRootDomain, state => state.isDarkMode);

export const selectAppTheme = createSelector(makeSelectRootDomain, state => state.appTheme);

export const selectAppConnection = createSelector(
  makeSelectRootDomain,
  state => state.appConnection,
);

export const selectAppPermissions = createSelector(
  makeSelectRootDomain,
  state => state.appPermissions,
);

export const selectAppState = createSelector(makeSelectRootDomain, state => state.appState);

export const selectCurrentLanguage = createSelector(makeSelectRootDomain, state => state.language);

export const selectAvailableLanguages = createSelector(
  makeSelectRootDomain,
  state => state.availableLanguages,
);

export const selectCloseModalsRefreshId = createSelector(
  makeSelectRootDomain,
  state => state.closeModalsRefreshId,
);

export const selectWithoutInternet = createSelector(
  makeSelectRootDomain,
  state => state.withoutInternet,
);
