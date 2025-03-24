import perf from '@react-native-firebase/perf';

import LogServiceLib from './logService';

const PerformanceInstance = perf();

const startTrace = async traceName => {
  try {
    let trace = PerformanceInstance.newTrace(traceName);
    // Add something attribute
    await trace.start();
    return trace;
  } catch (error) {
    LogServiceLib.debug('Error newTrace: ', error);
  }
};

const endTrace = trace => {
  try {
    trace && trace.stop();
  } catch (error) {
    LogServiceLib.debug('Error endTrace: ', error);
  }
};

const traceHttpRequest = async (url, method) => {
  try {
    let trace = PerformanceInstance.newHttpMetric(url, method);
    await trace.start();
    return trace;
  } catch (error) {
    LogServiceLib.debug('Error traceHttpRequest: ', error);
  }
};

export default {
  startTrace,
  endTrace,
  traceHttpRequest,
};
