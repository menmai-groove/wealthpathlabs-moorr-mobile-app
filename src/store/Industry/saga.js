import { GlobalLib, SagaLib } from 'libs';
import { get } from 'lodash';
import { put, select, takeLatest } from 'redux-saga/effects';
import {
  setIndustryClassesData,
  setIndustryDivisionsData,
  setIndustrySearchData,
} from 'store/Industry/action';
import {
  GET_INDUSTRY_CLASS_DATA,
  GET_INDUSTRY_DATA,
  GET_INDUSTRY_DIVISION_DATA,
} from 'store/Industry/constants';
import {
  GET_INDUSTRY_CLASSES,
  GET_INDUSTRY_DIVISIONS,
  SEARCH_INDUSTRY,
} from 'store/Industry/query';
import { selectListSearchIndustry } from 'store/Industry/selector';
// import { selectAppPreference } from 'store/Root/selector';

function* getIndustrySaga(action) {
  const {
    payload: { text = '', page = 1 },
    resolver = {},
  } = action;
  try {
    // const { pagination } = yield select(selectAppPreference);
    const response = yield SagaLib.queryCall(SEARCH_INDUSTRY, {
      search: text,
      // limit: pagination.industrySearchPageSize,
      limit: 1000000,
      page: page,
    });
    if (response) {
      const data =
        get(response, [
          'data',
          'me',
          'staticValues',
          'dropdown',
          'general',
          'industry',
          'search',
        ]) || {};
      if (page > 1) {
        const list = yield select(selectListSearchIndustry);
        yield put(
          setIndustrySearchData({
            ...data,
            list: [...list, ...data.list],
            // limit: pagination.industrySearchPageSize,
            limit: 1000000,
            page: page,
          }),
        );
      } else {
        yield put(
          setIndustrySearchData({
            ...data,
            // limit: pagination.industrySearchPageSize,
            limit: 1000000,
            page: page,
          }),
        );
      }
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.resolve === 'function' && resolver?.reject();
  }
}

function* getIndustryDivisionSaga() {
  try {
    const response = yield SagaLib.queryCall(GET_INDUSTRY_DIVISIONS);
    if (response) {
      const data =
        get(response, [
          'data',
          'me',
          'staticValues',
          'dropdown',
          'general',
          'industry',
          'divisions',
        ]) || {};

      yield put(setIndustryDivisionsData(data));
    }
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  }
}

function* getIndustryClassesSaga(action) {
  const {
    payload: { division },
    resolver = {},
  } = action;
  try {
    const response = yield SagaLib.queryCall(GET_INDUSTRY_CLASSES, {
      division,
    });
    if (response) {
      const data =
        get(response, [
          'data',
          'me',
          'staticValues',
          'dropdown',
          'general',
          'industry',
          'classes',
        ]) || {};

      yield put(setIndustryClassesData(data));
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.resolve === 'function' && resolver?.reject();
  }
}

export default function* defaultSaga() {
  yield takeLatest(GET_INDUSTRY_DATA, getIndustrySaga);
  yield takeLatest(GET_INDUSTRY_DIVISION_DATA, getIndustryDivisionSaga);
  yield takeLatest(GET_INDUSTRY_CLASS_DATA, getIndustryClassesSaga);
}
