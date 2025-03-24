import { all, put } from '@redux-saga/core/effects';
import { AppConstants } from 'constant';
import { GlobalLib, SagaLib } from 'libs';
import { get, isEmpty } from 'lodash';
import { takeLatest } from 'redux-saga/effects';
import {
  setFetching,
  setHistoricalValues,
  setOffsetBenefitValues,
} from 'store/InsightsTabContent/action';
import { GET_HISTORICAL_VALUES } from 'store/InsightsTabContent/constants';
import { GET_HISTORICAL_VALUES_QUERY } from 'store/InsightsTabContent/query';

export function* getHistoricalValuesSaga(action) {
  const { payload, resolver = {} } = action;
  const { cardId, getOffsetBenefit, isRefresh, type } = payload;
  // console.log('🚀 ~ function*getHistoricalValuesSaga ~ id:', id);
  const loadingView = GlobalLib.Loading.get();
  !isRefresh && loadingView.show();
  if (isRefresh) {
    yield put(setFetching(true));
  }
  var dataSets = [];
  if (type === AppConstants.cardCategory.Asset) {
    dataSets = [
      {
        fields: ['balance', 'value', 'currentValue'],
        type: 'historical-value',
        filter: {
          cardIds: [cardId],
          cardTypes: [
            'assets.bankAccounts',
            'assets.properties',
            'assets.investments',
            'assets.vehicles',
            'assets.otherAssets',
            'assets.superFunds',
          ],
        },
      },
    ];
  }
  if (type === AppConstants.cardCategory.Borrowing) {
    dataSets = [
      {
        fields: ['outstanding'],
        type: 'historical-value',
        filter: {
          cardIds: [cardId],
          cardTypes: ['borrowings'],
        },
      },
    ];
  }
  try {
    const historicalValuesResponse = yield all([
      SagaLib.mutationCall(GET_HISTORICAL_VALUES_QUERY, {
        query: {
          dataSets,
        },
      }),
    ]);
    const historicalValues = get(historicalValuesResponse[0], [
      'data',
      'me',
      'insights',
      'graph',
      'dataSets',
      0,
      'values',
    ]);
    // console.log('🚀 ~ function*getHistoricalValuesSaga ~ values:', values);
    yield put(setHistoricalValues(historicalValues));

    if (getOffsetBenefit) {
      const offsetBenefitResponse = yield all([
        SagaLib.mutationCall(GET_HISTORICAL_VALUES_QUERY, {
          query: {
            dataSets: [
              {
                type: 'calculated-value',
                fields: ['offset_benefit'],
                filter: {
                  cardIds: [cardId],
                  cardTypes: ['assets.bankAccounts'],
                },
              },
            ],
          },
        }),
      ]);
      const offsetBenefitValues = get(offsetBenefitResponse[0], [
        'data',
        'me',
        'insights',
        'graph',
        'dataSets',
        0,
        'values',
      ]);
      // console.log(
      //   '🚀 ~ function*getHistoricalValuesSaga ~ values:',
      //   JSON.stringify(offsetBenefitValues, null, 2),
      // );
      yield put(setOffsetBenefitValues(offsetBenefitValues));
    }

    typeof resolver?.resolve === 'function' && resolver?.resolve({});
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    !isRefresh && loadingView.hide();
    if (isRefresh) {
      yield put(setFetching(false));
    }
  }
}

export default function* defaultSaga() {
  yield takeLatest(GET_HISTORICAL_VALUES, getHistoricalValuesSaga);
}
