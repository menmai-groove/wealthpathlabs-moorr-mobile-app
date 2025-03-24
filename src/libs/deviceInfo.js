import _ from 'lodash';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const localData = {
  version: '',
  buildNumber: '',
  uniqueId: '',
};

const getVersion = async () => {
  if (!_.isNil(localData.version) && !_.isEmpty(localData.version)) {
    return localData.version;
  }
  const data = await DeviceInfo.getVersion();
  localData.version = data;
  return data;
};

const getBuildNumber = async () => {
  if (!_.isNil(localData.buildNumber) && !_.isEmpty(localData.buildNumber)) {
    return localData.buildNumber;
  }
  const data = await DeviceInfo.getBuildNumber();
  localData.buildNumber = data;
  return data;
};

const getUniqueId = async () => {
  if (!_.isNil(localData.uniqueId) && !_.isEmpty(localData.uniqueId)) {
    return localData.uniqueId;
  }
  const data = await DeviceInfo.getUniqueId();
  localData.uniqueId = data;
  return data;
};

const isTablet = () => {
  return Platform.isPad || DeviceInfo.isTablet();
};

export default {
  getVersion,
  getBuildNumber,
  getUniqueId,
  isTablet,
};
