import { cloneDeep, merge } from 'lodash';
import moment from 'moment';
import RNFS from 'react-native-fs';
import { consoleTransport, fileAsyncTransport, logger } from 'react-native-logs';

import AppMeta from '../../app.json';

const ENABLE_LOG_SAVE_TO_FILE = false;
const ENABLE_LOG_REMOTE = false;
const ENABLE_LOG_RESPONSE_API = true;

const defaultConfig = {
  severity: __DEV__ ? 'debug' : 'error',
  transport: props => {
    if (__DEV__) {
      consoleTransport(props);
    }
    /**
     * In mode fileTransport, file save in internal storage app.
     * Path file log:
     * Android: /data/user/0/[your_app_id]/files/<filename>
     * IOS: /var/mobile/Containers/Data/Application/A861B5EA-7108-481C-AF3B-D83C06DE1504/Documents/<filename>
     */
    ENABLE_LOG_SAVE_TO_FILE && fileAsyncTransport(props);
    ENABLE_LOG_REMOTE && remoteLoggingTransport(props);
  },
  transportOptions: {
    color: 'web',
    FS: RNFS,
  },
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  async: ENABLE_LOG_SAVE_TO_FILE || ENABLE_LOG_REMOTE,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  enabled: true,
};

const remoteLoggingTransport = () => {
  // Do here whatever you want with the log message, such as save log to cloud server, realtime database,...
  // message log: props.msg
};

function getFileName(type) {
  const time = moment().format('YYYY-DD-MM');
  const fileName = `${AppMeta.APP_NAME_REGISTRY}-${time}-log-${type}.txt`;
  return fileName;
}

const debug = (alias, value = '', options = {}) => {
  let config = merge(cloneDeep(defaultConfig), options);
  if (ENABLE_LOG_SAVE_TO_FILE) {
    config.transportOptions = {
      ...config.transportOptions,
      fileName: getFileName('debug'),
    };
  }
  const log = logger.createLogger(config);
  log.debug(alias, value);
};

const info = (alias, value = '', options = {}) => {
  let config = merge(cloneDeep(defaultConfig), options);
  if (ENABLE_LOG_SAVE_TO_FILE) {
    config.transportOptions = {
      ...config.transportOptions,
      fileName: getFileName('info'),
    };
  }
  const log = logger.createLogger(config);
  log.info(alias, value);
};

const warn = (alias, value = '', options = {}) => {
  let config = merge(cloneDeep(defaultConfig), options);
  if (ENABLE_LOG_SAVE_TO_FILE) {
    config.transportOptions = {
      ...config.transportOptions,
      fileName: getFileName('warn'),
    };
  }
  const log = logger.createLogger(config);
  log.warn(alias, value);
};

const error = (alias, value = '', options = {}) => {
  let config = merge(cloneDeep(defaultConfig), options);
  if (ENABLE_LOG_SAVE_TO_FILE) {
    config.transportOptions = {
      ...config.transportOptions,
      fileName: getFileName('error'),
    };
  }
  const log = logger.createLogger(config);
  log.error(alias, value);
};

const readLogFile = __DEV__
  ? async filename => {
      try {
        let path = RNFS.DocumentDirectoryPath + '/' + filename;
        if (await RNFS.exists(path)) {
          return await RNFS.readFile(path);
        } else {
          if (__DEV__) {
            console.info('Filename not exist');
          }
          return null;
        }
      } catch (err) {
        if (__DEV__) {
          console.error('ERROR Read log file: ', err);
        }
        return null;
      }
    }
  : () => {};

export default {
  debug,
  info,
  warn,
  error,
  readLogFile,
  ENABLE_LOG_RESPONSE_API,
};
