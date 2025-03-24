import AppConfigs from './configs';

const rootAPI = AppConfigs.rootAPI;

export default {
  getAccessToken: `${rootAPI}/token`,
  getReference: `${rootAPI}/reference`,
  getProfile: `${rootAPI}/me`,
  login: `${rootAPI}/login`,
  requestResetPassword: '',
  resetPassword: '',
};
