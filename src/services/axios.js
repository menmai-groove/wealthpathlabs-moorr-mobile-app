import axios from 'axios';
import i18n from 'bootstrap/i18n';
import { AppError } from 'constant';
import LogServiceLib from 'libs/logService';
import PerformanceLib from 'libs/performance';

const axiosOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
  validateStatus: status => status >= 200 && status <= 500,
};
const reactAxios = axios.create(axiosOptions);

function parseResponseBody(response) {
  let error;

  if (response.status === 400) {
    error = new Error();
    error.code = AppError.badRequest;
  }

  if (response.status === 401) {
    error = new Error();
    error.code = AppError.unAuthenticated;
  }

  if (response.status === 404) {
    error = new Error();
    error.code = AppError.notFoundError;
  }

  if (response.status === 403) {
    error = new Error();
    error.code = AppError.notPermission;
  }

  if (response.status === 408) {
    error = new Error();
    error.code = AppError.requestTimeout;
  }

  if (response.status === 409) {
    error = new Error();
    error.code = AppError.requestConflict;
  }

  if (response.status >= 500) {
    error = new Error();
    error.code = AppError.internalServerError;
  }

  if (!error && response.status >= 400 && response.status < 500) {
    error = new Error();
    error.code = AppError.clientError;
  }

  if (error) {
    error.status = response.status;
    error.data = response.data;
    throw error;
  }

  if (response?.data?.data) {
    return { headers: response.headers, ...response.data };
  }
  return { headers: response.headers, data: response.data };
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
const request = async (url, options) => {
  let response = null;
  const httpTrace = await PerformanceLib.traceHttpRequest(
    url,
    options?.method?.toUpperCase() ?? 'GET',
  );

  try {
    response = await reactAxios({
      url: reactAxios.getUri({ url, ...options }),
      ...options,
    });
    LogServiceLib.debug('***** Network response', response);
  } catch (err) {
    LogServiceLib.debug('***** Network error', err, url);
    const isTimedOut = err?.code === 'ECONNABORTED';
    const error = {
      code: isTimedOut ? AppError.requestTimeout : err?.code,
      status: isTimedOut ? 408 : err?.response?.status,
      message: isTimedOut
        ? i18n.t('errorMsg.requestTimeout')
        : err?.message?.includes('Network Error')
        ? i18n.t('errorMsg.network-error')
        : i18n.t('errorMsg.somethingWentWrong'),
    };
    error.data = err?.response?.data;
    httpTrace.setHttpResponseCode(error.status);
    PerformanceLib.endTrace(httpTrace);
    throw error;
  }

  httpTrace.setHttpResponseCode(response.status);
  PerformanceLib.endTrace(httpTrace);

  return parseResponseBody(response);
};

export default request;
