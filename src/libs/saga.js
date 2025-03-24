import NetInfo from '@react-native-community/netinfo';
import i18n from 'bootstrap/i18n';
import { AppApi, AppConfigs } from 'constant';
import { isArray, isEmpty, isNil } from 'lodash';
import { call, delay, select, take } from 'redux-saga/effects';
import { mutate, query } from 'services/apolloGraphql';
import request from 'services/axios';
import { GET_ACCESS_TOKEN_SUCCESS } from 'store/Auth/constants';
import { getAccessTokenSaga, resetToLoginSaga } from 'store/Auth/saga';
import { selectAccessToken, selectRefreshToken } from 'store/Auth/selector';
import { INTERNET_RECONNECTED } from 'store/Root/constants';
import { selectAppPreference, selectWithoutInternet } from 'store/Root/selector';

import AnalyticsLib from './analytics';
import GlobalLib from './global';

function _handleError(error) {
  const status = error?.status;
  const errorData = error?.data?.error;
  const Toast = GlobalLib.Toast.get();

  if (!isEmpty(errorData)) {
    if (errorData.errors && errorData.errors.length && errorData.errors[0].Message) {
      errorData.message = errorData.errors.map(item => item.Message).join('\r\n');
    }
    throw errorData;
  }

  switch (status) {
    case 400:
      Toast.toastError(i18n.t('errorMsg.somethingWentWrong'));
      break;
    case 401:
      Toast.toastError(i18n.t('errorMsg.expiredSession'));
      break;
    case 403:
      Toast.toastError(i18n.t('errorMsg.notPermission'));
      break;
    case 404:
      Toast.toastError(i18n.t('errorMsg.contentNotFound'));
      break;
    case 408:
      Toast.toastError(i18n.t('errorMsg.requestTimeout'));
      break;
    case 409:
      Toast.toastError(i18n.t('errorMsg.requestConflict'));
      break;
    case 500:
      Toast.toastError(i18n.t('errorMsg.internalServerError'));
      break;
    default:
      break;
  }
  throw error;
}

function* generateNewOption(option) {
  const appPreference = yield select(selectAppPreference);
  const defaultNetworkCallOption = {
    skipAuthorization: false,
    headers: {
      Locale: appPreference.locale,
    },
    retry: AppConfigs.retryNetwork,
  };
  const newOption = Object.assign({}, defaultNetworkCallOption, option);

  if (!newOption.skipAuthorization) {
    const token = newOption.accessToken ? newOption.accessToken : yield select(selectAccessToken);
    if (!isEmpty(token)) {
      newOption.headers.Authorization = `Bearer ${token}`;
    }
  }
  return newOption;
}

let hasCheckGetAccessToken = false;

function* _handleTokenExpired(loading) {
  const loadingView = GlobalLib.Loading.get();
  try {
    const refreshToken = yield select(selectRefreshToken);
    if (!refreshToken) {
      return;
    }

    loading && loadingView.show();

    if (!hasCheckGetAccessToken) {
      hasCheckGetAccessToken = true;
      // use call for getAccessTokenSaga to catch error data
      yield call(getAccessTokenSaga, { refreshToken });
    } else {
      yield take(GET_ACCESS_TOKEN_SUCCESS);
    }
  } catch (error) {
    if (hasCheckGetAccessToken) {
      if (!isEmpty(error?.message)) {
        GlobalLib.Toast.get().toastError(error?.message);
      }
      yield resetToLoginSaga();
    }
    throw error;
  } finally {
    loading && loadingView.hide();
    hasCheckGetAccessToken = false;
  }
}

function* networkCall(url, option = {}, loading) {
  const newOption = yield generateNewOption(option);
  const loadingView = GlobalLib.Loading.get();
  let data;
  try {
    loading && loadingView.show();
    data = yield call(request, url, newOption);
    loading && loadingView.hide();
  } catch (error) {
    loading && loadingView.hide();

    /* retrying network for 10 times in 10 seconds */
    let netState = yield call(NetInfo.fetch);
    const withoutInternet = yield select(selectWithoutInternet);
    const isHttpGET = isEmpty(newOption?.method) || newOption?.method?.toUpperCase() === 'GET';
    if (
      isNil(error?.status) &&
      !newOption.noWaitingNetwork &&
      !netState.isInternetReachable &&
      (!withoutInternet || isHttpGET || url.includes(AppApi.getAccessToken)) &&
      newOption.retry > 0
    ) {
      yield delay(1000);
      netState = yield call(NetInfo.fetch);
      if (!netState.isInternetReachable) {
        yield take(INTERNET_RECONNECTED);
      }
      data = yield networkCall(
        url,
        {
          ...option,
          retry: newOption.retry - 1,
        },
        loading,
      );
      return data;
    }

    if (error?.status === 401 && url.includes(AppApi.getAccessToken)) {
      return _handleError(error);
    } else if (error?.status === 401) {
      yield call(_handleTokenExpired, loading);
      const newOption2 = yield generateNewOption(option);
      // call request again
      try {
        loading && loadingView.show();
        data = yield call(request, url, newOption2);
      } catch (err) {
        return _handleError(err);
      } finally {
        loading && loadingView.hide();
      }
    } else {
      return _handleError(error);
    }
  }
  return data;
}

function _handleGraphQLError(error, i18nScope = 'errorMsg', type, queryString) {
  const messages = [];
  const errors = [];
  if (isArray(error)) {
    error.forEach(({ message, extensions }) => {
      // if (!isEmpty(extensions)) {
      //   let err = extensions?.exception?.errors;
      //   if (err) {
      //     for (const key in err) {
      //       if (err[key]?.name === AppError.validatorError) {
      //         message = `${i18n.t('errorMsg.validationError') + message;
      //       }
      //     }
      //   }
      // }
      errors.push({
        message: message,
        messageContent: i18n.t(`${i18nScope}.${message}`, message),
        extensions: !isEmpty(extensions)
          ? { code: extensions.code, exception: extensions.exception }
          : extensions,
      });
      messages.push(i18n.t(`${i18nScope}.${message}`, message));
    });
  }

  const formatError = messages.length
    ? {
        errors: errors,
        message: messages.join('\r\n'),
      }
    : error;

  if (!__DEV__) {
    AnalyticsLib.logEvent('Graphql_Error', {
      queryString: queryString,
      type: type,
      message: formatError?.message,
    });
  }
  throw formatError;
}

function* makeRequestGraphQL(type = 'query', queryEndpoint, variables, option = {}, loading) {
  const newOption = yield generateNewOption(option);
  const loadingView = GlobalLib.Loading.get();
  const queryString = queryEndpoint.query ? queryEndpoint.query : queryEndpoint;
  let data;
  try {
    loading && loadingView.show();
    if (type === 'query') {
      data = yield call(query, queryString, variables, newOption.headers);
    } else {
      data = yield call(mutate, queryString, variables, newOption.headers);
    }
    loading && loadingView.hide();
  } catch (error) {
    loading && loadingView.hide();

    /* retrying network for 10 times in 10 seconds */
    let netState = yield call(NetInfo.fetch);
    const withoutInternet = yield select(selectWithoutInternet);
    const isHttpGET = type === 'query';
    const isRefreshTokenQuery = [
      'Auth/ADD_DEVICE_QUERY',
      'Auth/REFRESH_DEVICE_ACCESS_TOKEN_QUERY',
    ].includes(queryEndpoint?.label);

    if (
      !newOption.noWaitingNetwork &&
      !netState.isInternetReachable &&
      (!withoutInternet || isHttpGET || isRefreshTokenQuery) &&
      newOption.retry > 0
    ) {
      yield delay(1000);
      netState = yield call(NetInfo.fetch);
      if (!netState.isInternetReachable) {
        yield take(INTERNET_RECONNECTED);
      }
      data = yield makeRequestGraphQL(
        type,
        queryEndpoint,
        variables,
        {
          ...option,
          retry: newOption.retry - 1,
        },
        loading,
      );
      return data;
    }

    const wrongAccessJWT = error?.find(e => e.message.includes('wrong-access-jwt'));
    const notWeakAccessJWT = error?.find(e => e.message.includes('not-weak-access-jwt'));

    if (wrongAccessJWT) {
      // call request again
      yield call(_handleTokenExpired, loading);
      const newOption2 = yield generateNewOption(option);
      try {
        loading && loadingView.show();
        if (type === 'query') {
          data = yield call(query, queryString, variables, newOption2.headers);
        } else {
          data = yield call(mutate, queryString, variables, newOption2.headers);
        }
      } catch (err) {
        const nestedNotWeakAccessJWT = err?.find(e => e.message.includes('not-weak-access-jwt'));
        if (nestedNotWeakAccessJWT) {
          const Toast = GlobalLib.Toast.get();
          Toast.toastError(i18n.t('errorMsg.expiredSession'));
          yield resetToLoginSaga();
          return;
        }
        return _handleGraphQLError(err, newOption2.i18nScope, type, queryEndpoint?.label);
      } finally {
        loading && loadingView.hide();
      }
    } else if (notWeakAccessJWT) {
      const Toast = GlobalLib.Toast.get();
      Toast.toastError(i18n.t('errorMsg.expiredSession'));
      yield resetToLoginSaga();
    } else {
      return _handleGraphQLError(error, newOption.i18nScope, type, queryEndpoint?.label);
    }
  }
  return data;
}

function* mutationCall(queryEndpoint, variables, option = {}, loading) {
  return yield makeRequestGraphQL('mutation', queryEndpoint, variables, option, loading);
}

function* queryCall(queryEndpoint, variables, option = {}, loading) {
  return yield makeRequestGraphQL('query', queryEndpoint, variables, option, loading);
}

export default {
  networkCall,
  mutationCall,
  queryCall,
};
