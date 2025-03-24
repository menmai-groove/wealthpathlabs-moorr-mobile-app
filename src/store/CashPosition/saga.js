import { GlobalLib, SagaLib } from 'libs';
import { get, isEmpty } from 'lodash';
import { all, put, takeEvery } from 'redux-saga/effects';
import { setCashPosition, setFetching, setFinancialCards } from 'store/CashPosition/action';
import { GET_CASH_POSITION } from 'store/CashPosition/constants';
import { GET_CASH_POSITION_QUERY } from 'store/CashPosition/query';
import { GET_FINANCIAL_LIST_QUERY } from 'store/FinancialDashboard/query';

export function* getCashPositionSaga(action) {
  const { payload, resolver = {} } = action;
  const { isRefresh } = payload;
  const loadingView = GlobalLib.Loading.get();
  !isRefresh && loadingView.show();
  if (isRefresh) {
    yield put(setFetching(true));
  }
  try {
    const response = yield all([
      SagaLib.mutationCall(GET_CASH_POSITION_QUERY, {
        query: {
          dataSets: [
            {
              type: 'net-worth',
              filter: {
                cardTypes: ['assets.bankAccounts'],
              },
            },
          ],
        },
      }),
      SagaLib.mutationCall(GET_FINANCIAL_LIST_QUERY, {
        filter: {
          assets: ['Bank Accounts'],
          expense: [''],
          income: [''],
          borrowings: [''],
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
    yield put(setCashPosition(values));
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

export default function* defaultSaga() {
  yield takeEvery(GET_CASH_POSITION, getCashPositionSaga);
}
