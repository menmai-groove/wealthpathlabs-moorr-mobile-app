import { GlobalLib, SagaLib } from 'libs';
import { get, isEmpty } from 'lodash';
import { all, put, takeEvery, takeLeading } from 'redux-saga/effects';
import { GET_FINANCIAL_LIST_QUERY } from 'store/FinancialDashboard/query';
import { ADD_FEEDBACK } from 'store/Home/query';
import { setFetching, setFinancialCards, setNetWorth } from 'store/NetWorth/action';
import { GET_NET_WORTH, SUBMIT_FEEDBACK } from 'store/NetWorth/constants';
import { GET_NET_WORTH_QUERY } from 'store/NetWorth/query';

export function* getNetWorthSaga(action) {
  const { payload, resolver = {} } = action;
  const { isRefresh } = payload;
  const loadingView = GlobalLib.Loading.get();
  !isRefresh && loadingView.show();
  if (isRefresh) {
    yield put(setFetching(true));
  }
  try {
    const response = yield all([
      SagaLib.mutationCall(GET_NET_WORTH_QUERY, {
        query: {
          dataSets: [
            {
              type: 'net-worth',
              filter: {
                cardTypes: [
                  'assets.bankAccounts',
                  'assets.properties',
                  'assets.investments',
                  'assets.vehicles',
                  'assets.otherAssets',
                  'assets.superFunds',
                  'borrowings',
                ],
              },
            },
          ],
        },
      }),
      SagaLib.mutationCall(GET_FINANCIAL_LIST_QUERY, {
        filter: {
          assets: [
            'Bank Accounts',
            'Property',
            'Investments',
            'Vehicles',
            'Other Assets',
            'Superannuation',
          ],
          expense: [''],
          income: [''],
          borrowings: [],
          archived: [],
        },
        searchKey: '',
        desc: true,
        pagination: {
          limit: 99999,
          page: 1,
        },
      }),
    ]);
    const values = get(response[0], ['data', 'me', 'insights', 'graph', 'dataSets', 0, 'values']);
    let cardList = get(response[1], ['data', 'me', 'financialDashboard', 'data']) || [];
    if (cardList) {
      cardList = cardList.map(card => {
        const item = get(card, 'item', {});
        const cardType = get(card, 'type', '');
        return {
          ...item,
          cardType,
        };
      });
    }
    // yield delay(2000);
    yield put(setNetWorth(values));
    yield put(setFinancialCards(cardList));
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

export function* submitFeedbackSaga(action) {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  const { payload = {}, resolver = {} } = action;
  try {
    const variables = {
      data: {
        type: 'insight-feedback',
        rate: 10,
        notes: payload?.review,
      },
    };
    yield SagaLib.mutationCall(ADD_FEEDBACK, variables);
    typeof resolver?.resolve === 'function' && resolver?.resolve({});
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject(error);
  } finally {
    loadingView.hide();
  }
}

export default function* defaultSaga() {
  yield takeEvery(GET_NET_WORTH, getNetWorthSaga);
  yield takeLeading(SUBMIT_FEEDBACK, submitFeedbackSaga);
}
