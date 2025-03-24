import i18n from 'bootstrap/i18n';
import { AppConstants } from 'constant';
import { AnalyticsLib, GlobalLib, SagaLib, UtilLib } from 'libs';
import { concat, filter, get, isArray, isEmpty, isNil, last, map, orderBy, uniqBy } from 'lodash';
import moment from 'moment';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import uuid from 'react-native-uuid';
import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import {
  getUpcomingGoal,
  setListGoals,
  setListGoalsYears,
  setPersonalGoal,
  setUpcomingGoal,
  uploadFilesFail,
  uploadFilesSuccess,
} from './action';
import {
  CREATE_PERSONAL_GOAL,
  GET_GOALS_UNTIL_YEAR,
  GET_LIST_GOALS,
  GET_PERSONAL_GOAL,
  GET_UPCOMING_GOAL,
  UPDATE_PERSONAL_GOAL,
  UPLOAD_FILES_START,
} from './constants';
import * as QUERY from './query';
import { selectListPersonalGoals } from './selector';

const isAndroid = Platform.OS === 'android';

async function uploadFileAfterGenerateLink(uploadFile) {
  let blob;
  if (isAndroid && uploadFile.isIcon) {
    const filename = uploadFile.filename;
    const assetImagesDir = 'images';
    const tempFilePath = RNFS.TemporaryDirectoryPath + '/' + filename;

    const assetFile = await RNFS.readFileAssets([assetImagesDir, filename].join('/'), 'base64');
    await RNFS.writeFile(tempFilePath, assetFile, 'base64');
    const resFetchImage = await fetch('file://' + tempFilePath);
    blob = await resFetchImage.blob();
  } else {
    const resFetchImage = await fetch(uploadFile.uri);
    blob = await resFetchImage.blob();
  }
  return fetch(uploadFile.link, {
    method: 'put',
    body: blob,
    headers: {
      'Content-Type': uploadFile.type,
      ...(uploadFile.sseKeyId
        ? { 'x-amz-server-side-encryption-aws-kms-key-id': uploadFile.sseKeyId }
        : {}),
      ...(uploadFile.sseMethod ? { 'x-amz-server-side-encryption': uploadFile.sseMethod } : {}),
    },
  });
}

function* getListYears() {
  try {
    const responseListYears = yield SagaLib.queryCall(QUERY.GET_LIST_PERSONAL_GOALS_YEARS);
    let listYearsData = get(responseListYears, ['data', 'me', 'personalGoalsYears']) || [];
    yield put(setListGoalsYears(listYearsData));
  } catch (error) {}
}

export function* getListPersonalGoals({ payload = {}, resolver }) {
  const { page = 1, limit = 1 } = payload;
  const variables = {
    filter: {
      dueDate: {
        ne: null,
      },
    },
    pagination: { page, limit },
    sort: { dueDate: -1 },
  };
  try {
    //Get list years
    yield getListYears();

    const res = yield SagaLib.queryCall(QUERY.LIST_PERSONAL_GOALS, variables);
    let resData = get(res, ['data', 'me', 'personalGoals']);
    const stateListPersonalGoals = yield select(selectListPersonalGoals);
    if (page > 1) {
      if (page === stateListPersonalGoals.page + 1) {
        const data = uniqBy(concat(stateListPersonalGoals.data, resData.data), '_id');
        resData = { ...resData, data };
      }
    }
    yield put(setListGoals(resData));
    typeof resolver?.resolve === 'function' && resolver?.resolve(resData);
  } catch (error) {
    typeof resolver?.reject === 'function' && resolver?.reject();
  }
}

export function* getListGoalsUntilGetYear({ payload = {}, resolver }) {
  const { selectYear } = payload;
  const stateListPersonalGoals = yield select(selectListPersonalGoals);
  let { page, limit, total } = stateListPersonalGoals;
  if (page * limit >= total) {
    typeof resolver?.resolve === 'function' && resolver?.resolve({ page });
    return null;
  }

  try {
    GlobalLib.Loading.get().show();
    let count = 100;
    while (page * limit < total) {
      // yield call(getListPersonalGoals, { payload: { page: page + 1, limit } });
      count = count - 1;
      const nextListGoals = yield select(selectListPersonalGoals);
      const lastGoalItem = last(nextListGoals.data);
      if (selectYear >= moment(lastGoalItem?.dueDate).get('year') || count < 0) {
        break;
      }
      page = nextListGoals.page;
      limit = nextListGoals.limit;
      total = nextListGoals.total;
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve({ page });
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    GlobalLib.Loading.get().hide();
  }
}

// uri, type, filename, isIcon
export function* uploadFiles({ payload = {} }) {
  const { images = [] } = payload;
  const filenames = images.map(i => i.filename?.toLowerCase());
  let results = null;

  try {
    const generateRes = yield SagaLib.mutationCall(QUERY.GENERATE_URLS, { filenames });
    const uploadFilesInfo = get(generateRes, ['data', 'me', 'client', 'getFileUploadLink'], []); // newFilename, link, namespace, key
    const newUploadFilesInfo = uploadFilesInfo.map((uploadFile, index) => ({
      ...uploadFile,
      ...images[index],
    }));
    const uploadFileRequests = newUploadFilesInfo.map(uploadFile =>
      call(uploadFileAfterGenerateLink, uploadFile),
    );
    yield all(uploadFileRequests);
    yield put(uploadFilesSuccess(newUploadFilesInfo));
    results = newUploadFilesInfo;
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    yield put(uploadFilesFail());
    throw error;
  } finally {
    return results;
  }
}

/**
 *
 * @param {*} payload.photo
 * object: update image from local
 * empty string: remove image from goal
 */

export function* updatePersonalGoal({ payload = {}, resolver }) {
  const { photo, _delete } = payload;
  let results;
  let data = { _id: payload._id };
  let newListGoals;
  const loadingView = GlobalLib.Loading.get();
  try {
    loadingView.show();
    if (_delete) {
      data._delete = true;
    } else {
      data = payload;
      // change photo
      if (!isEmpty(photo) && !photo.isIcon) {
        const uploadedFiles = yield uploadFiles({
          payload: { images: [photo] },
        });
        if (isArray(uploadedFiles) && uploadedFiles.length > 0 && !isNil(uploadedFiles[0])) {
          data.photo = uploadedFiles[0].key;
        } else {
          data.photo = null;
        }
        data.icon = null;
      }
      if (photo?.isIcon) {
        data.icon = photo.filename;
        data.photo = null;
      }
      // remove photo
      if (isEmpty(photo)) {
        data.photo = photo;
        data.icon = photo;
      }
    }
    const res = yield SagaLib.mutationCall(QUERY.UPDATE_PERSONAL_GOAL, { data });
    results = get(res, ['data', 'me', 'personalGoals', 'update']) || {};
    const stateListPersonalGoals = yield select(selectListPersonalGoals);
    if (_delete) {
      newListGoals = filter(stateListPersonalGoals.data, item => item._id !== payload._id);
    } else {
      newListGoals = map(stateListPersonalGoals.data, item =>
        item._id === payload._id ? results : item,
      );
    }
    yield all([
      put(setPersonalGoal(results)),
      put(setListGoals({ ...stateListPersonalGoals, data: newListGoals })),
      put(getUpcomingGoal(true)),
      call(getListYears),
    ]);
    if (_delete && payload?._id && payload?.dueDate) {
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.deletePersonalGoal, {
        id: payload?._id,
        date: payload?.dueDate ? new Date(payload?.dueDate).toUTCString() : '',
      });
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(results);
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    loadingView.hide();
  }
}

export function* createMyPersonalGoal({ payload = {}, resolver }) {
  const { photo, dueDate } = payload;
  const _id = AppConstants.newObjectID.replace('1', uuid.v4().toString());
  const isAchieved = false;
  let keyPhoto;

  let results;
  try {
    GlobalLib.Loading.get().show();

    if (UtilLib.compareDate(dueDate, moment().toDate()) <= 0) {
      throw { message: i18n.t('screens.personalGoal.addPersonalGoal.dueDateMustBeAfterToday') };
    }

    if (photo && !photo.isIcon) {
      const uploadedFiles = yield uploadFiles({
        payload: { images: [photo] },
      });
      if (isArray(uploadedFiles) && uploadedFiles.length > 0 && !isNil(uploadedFiles[0])) {
        keyPhoto = uploadedFiles[0].key;
      } else {
        throw { message: i18n.t('screens.personalGoal.addPersonalGoal.uploadImageFailed') };
      }
    }
    const res = yield SagaLib.mutationCall(QUERY.UPDATE_PERSONAL_GOAL, {
      data: {
        ...payload,
        _id,
        isAchieved,
        photo: keyPhoto,
        icon: photo?.isIcon ? photo.filename : null,
      },
    });
    results = get(res, ['data', 'me', 'personalGoals', 'update']) || {};
    const stateListPersonalGoals = yield select(selectListPersonalGoals);
    const newListGoals = orderBy(
      [...stateListPersonalGoals.data, results],
      i => new Date(i.dueDate),
      'desc',
    );
    yield all([
      put(setListGoals({ ...stateListPersonalGoals, data: newListGoals })),
      put(getUpcomingGoal(true)),
      call(getListYears),
    ]);
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.addPersonalGoal, {
      date: payload?.dueDate ? new Date(payload?.dueDate).toUTCString() : '',
    });
    typeof resolver?.resolve === 'function' && resolver?.resolve(results);
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    GlobalLib.Loading.get().hide();
  }
}

function* getPersonalGoal({ payload, resolver }) {
  const { _id } = payload;
  const variables = {
    filter: { _id },
  };
  try {
    GlobalLib.Loading.get().show();
    const res = yield SagaLib.queryCall(QUERY.LIST_PERSONAL_GOALS, variables);
    const resData = get(res, ['data', 'me', 'personalGoals', 'data', '0']);
    if (resData) {
      yield put(setPersonalGoal(resData));
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(resData);
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    if (_id) {
      GlobalLib.Loading.get().hide();
    }
  }
}

export function* getUpcomingGoalSaga(action) {
  const { payload = {}, resolver = {} } = action;
  const { isRefresh } = payload;
  !isRefresh && GlobalLib.Loading.get().show();
  try {
    //Check upcoming
    const variables = {
      filter: {
        isAchieved: false,
        dueDate: {
          gte: new Date().toISOString(),
        },
      },
      sort: { dueDate: 1 },
      pagination: { limit: 1 },
    };
    const upcomingGoalInFuture = yield SagaLib.queryCall(QUERY.LIST_PERSONAL_GOALS, variables);
    let upcomingGoalResponse = upcomingGoalInFuture;
    //Check goals oldest in the past unachieved
    if (isEmpty(get(upcomingGoalResponse, ['data', 'me', 'personalGoals', 'data']))) {
      const variable = {
        filter: {
          isAchieved: false,
          dueDate: {
            lte: new Date().toISOString(),
          },
        },
        sort: { dueDate: 1 },
        pagination: { limit: 1 },
      };
      const goalsOldestUnachieved = yield SagaLib.queryCall(QUERY.LIST_PERSONAL_GOALS, variable);
      upcomingGoalResponse = goalsOldestUnachieved;
    }
    const upcomingGoal = get(upcomingGoalResponse, ['data', 'me', 'personalGoals', 'data']);
    if (upcomingGoal?.length > 0) {
      yield put(
        setUpcomingGoal({
          ...get(upcomingGoal, 0),
          date: get(upcomingGoal, [0, 'dueDate']),
          description: get(upcomingGoal, [0, 'description']),
        }),
      );
    } else {
      yield put(setUpcomingGoal(null));
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    !isRefresh && GlobalLib.Loading.get().hide();
  }
}

export default function* defaultSaga() {
  yield takeLatest(GET_LIST_GOALS, getListPersonalGoals);
  yield takeLatest(GET_PERSONAL_GOAL, getPersonalGoal);
  yield takeLatest(UPLOAD_FILES_START, uploadFiles);
  yield takeLatest(CREATE_PERSONAL_GOAL, createMyPersonalGoal);
  yield takeLatest(UPDATE_PERSONAL_GOAL, updatePersonalGoal);
  yield takeLatest(GET_GOALS_UNTIL_YEAR, getListGoalsUntilGetYear);

  yield takeEvery(GET_UPCOMING_GOAL, getUpcomingGoalSaga);
}
