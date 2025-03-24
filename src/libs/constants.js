import meta from '../../app.json';

export const asyncStoragelabelsRoot = meta.APP_NAME_REGISTRY;

export default {
  asyncStorageKeys: {
    appConfig: `${asyncStoragelabelsRoot}/appConfig`,
    refreshToken: `${asyncStoragelabelsRoot}/refreshToken`,
    appTheme: `${asyncStoragelabelsRoot}/appTheme`,
    appLanguage: `${asyncStoragelabelsRoot}/appLanguage`,
    onBoardingIntroduce: `${asyncStoragelabelsRoot}/onBoarding`,
    onBoardingInterview: `${asyncStoragelabelsRoot}/onBoardingInterview`,
    enableAppReview: `${asyncStoragelabelsRoot}/enableAppReview`,
    rememberMe: `${asyncStoragelabelsRoot}/rememberMe`,
    listBiometricSetup: `${asyncStoragelabelsRoot}/listBiometricSetup`,
  },
};
