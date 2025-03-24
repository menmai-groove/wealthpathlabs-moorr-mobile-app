import { AppConstants } from 'constant';
import { isArray, isEmpty } from 'lodash';
import Keychain from 'react-native-keychain';

import AppMeta from '../../app.json';

const set = async (key, value) => {
  if (key && value) {
    const oldValue = await getAccountIfRegistered(key);
    if (!oldValue) {
      // incase add new account -> remove oldest account if more than 10 items
      const listAccount = await getAllRegisteredAccounts();
      if (listAccount.length === AppConstants.biometric.maximumNumberOfAccounts) {
        removeAccounts(listAccount[AppConstants.biometric.maximumNumberOfAccounts - 1].username);
      }
    } else {
      // renew old service to sort latest logged in user show on the top
      removeAccounts(oldValue.username);
    }

    await Keychain.setGenericPassword(key, JSON.stringify(value), {
      service: `${AppMeta.APP_NAME_REGISTRY}_${Date.now()}`,
    });
  }
};

const removeAccounts = async username => {
  if (username) {
    const accountToRemove = await getAccountIfRegistered(username);
    if (accountToRemove) {
      await Keychain.resetGenericPassword({ service: accountToRemove.service });
    }
  }
};

const reset = async () => {
  const listServices = await getAllServicesRegistered();
  // clear all service contains APP_NAME_REGISTRY
  await listServices.forEach(async element => {
    await Keychain.resetGenericPassword({ service: element });
  });
};

const get = async () => {
  const { username, password } = await Keychain.getGenericPassword({
    service: AppMeta.APP_NAME_REGISTRY,
  });
  return {
    key: username,
    value: password ? JSON.parse(password) : password,
  };
};

const getAllRegisteredAccounts = async () => {
  const listServices = await getAllServicesRegistered();
  const listAccount = [];
  for (const service of listServices) {
    const { username, password } = await Keychain.getGenericPassword({
      service,
    });
    listAccount.push({
      username,
      service,
      password: password ? JSON.parse(password) : password,
    });
  }
  return listAccount.sort((a, b) => b.service.localeCompare(a.service));
};

const getAllServicesRegistered = async () => {
  const data = await Keychain.getAllGenericPasswordServices();
  if (data && isArray(data)) {
    return data.filter(item => item.includes(AppMeta.APP_NAME_REGISTRY));
  }
  return [];
};

const getAccountIfRegistered = async username => {
  if (username) {
    const listAccount = await getAllRegisteredAccounts();
    const listFilter = listAccount.filter(item => {
      return item.username === username;
    });
    return isEmpty(listFilter) ? false : listFilter[0];
  }
  return false;
};

export default {
  get,
  set,
  reset,
  getAllRegisteredAccounts,
  getAccountIfRegistered,
  removeAccounts,
};
