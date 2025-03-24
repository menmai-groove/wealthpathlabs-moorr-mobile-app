import i18n from 'bootstrap/i18n';
import { AppConstants } from 'constant';
import { AnalyticsLib, GlobalLib, NavigationServiceLib, SagaLib, UtilLib } from 'libs';
import { get, isEmpty, last } from 'lodash';
import { all, call, put, putResolve, select, takeLatest, takeLeading } from 'redux-saga/effects';
import { selectFlags } from 'store/Auth/selector';
import * as expenseActions from 'store/ExpenseDashboard/action';
import * as financialActions from 'store/FinancialDashboard/action';
import { syncFinancialData } from 'store/Home/action';
import { updateData } from 'store/Income/action';
import {
  INCOME_FISNISH,
  INCOME_GET_DETAIL,
  INCOME_SUBMIT_DATA,
  UPDATE_INCOME_INVESTMENT,
  UPDATE_NEXT_PAY_DATE,
} from 'store/Income/constants';
import {
  GET_DETAIL_INCOME_QUERY,
  GET_DETAIL_INVESTMENT_QUERY,
  GET_DETAIL_PROPERTY_QUERY,
  SUBMIT_INCOME,
} from 'store/Income/query';
import { selectDataForms } from 'store/Income/selector';
import { getWealthSpeedData } from 'store/Wealth/action';

function* finishAddNewIncomeSaga() {
  try {
    // yield put(resetData());
    NavigationServiceLib.pop();
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  }
}

function* submitAddNewIncomeSaga(action) {
  const resolver = action.resolver || {};
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const dataForm = yield select(selectDataForms);
    const variables = {
      data: {
        page: AppConstants.ClientHistoryQuery.Income,
        income: [dataForm],
      },
    };
    const response = yield SagaLib.mutationCall(SUBMIT_INCOME, variables);
    yield all([
      putResolve(syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(financialActions.refetchFinancialListData(true, true)),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
      putResolve(getWealthSpeedData({ generate: false })),
    ]);
    const type = i18n.t('cardType.income');
    let message = i18n.t(
      dataForm._id === AppConstants.newObjectID ? 'successMsg.addCard' : 'successMsg.editCard',
      {
        cardType: type,
        name: dataForm.name || '',
      },
    );
    GlobalLib.Toast.get().toastSuccess(message);
    if (dataForm._id === AppConstants.newObjectID) {
      const parameters = {
        category: AppConstants.cardCategory.Income,
        item_type: dataForm.type,
        name: dataForm.name,
        card_id: last(response.data.me.client.update.income)?._id,
      };
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardCreate, parameters);
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(response);
  } catch (error) {
    if (!isEmpty(error.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

function* getDetailsAsset(income) {
  if (income?.typeValue === AppConstants.IncomeType.InvestmentIncome && income?.assetId) {
    const responseAsset = yield SagaLib.queryCall(GET_DETAIL_INVESTMENT_QUERY, {
      ids: income?.assetId,
    });
    if (responseAsset) {
      const investment = get(responseAsset, ['data', 'me', 'client', 'assets', 'investments', 0]);
      return investment ? { ...investment, type: AppConstants.AssetType.Investments } : null;
    }
  }
  if (income?.typeValue === AppConstants.IncomeType.PropertyIncome && income?.assetId) {
    const responseAsset = yield SagaLib.queryCall(GET_DETAIL_PROPERTY_QUERY, {
      ids: income?.assetId,
    });
    if (responseAsset) {
      const property = get(responseAsset, ['data', 'me', 'client', 'assets', 'properties', 0]);
      return property ? { ...property, type: AppConstants.AssetType.Property } : null;
    }
  }
  return null;
}

function* getDetails(action) {
  const { payload, resolver = {} } = action;
  const { assetIncomeCards } = yield select(selectFlags);
  try {
    const isAdd = payload?.income?._id === '__ObjectId__income';
    if (assetIncomeCards && payload?.income?.assetId && payload.asset) {
      yield put(
        updateData({
          assetDetails: payload.asset,
        }),
      );
      if (isAdd) {
        yield put(
          updateData({
            details: payload.income,
            type: payload.income.type,
          }),
        );
        typeof resolver?.resolve === 'function' && resolver?.resolve();
        return;
      }
    } else {
      const detailsAssetResponse = yield call(getDetailsAsset, payload?.income);
      if (detailsAssetResponse) {
        yield put(updateData({ assetDetails: detailsAssetResponse }));
      }
    }
    const detailIncomeResponse = yield SagaLib.queryCall(GET_DETAIL_INCOME_QUERY, {
      ids: payload?.income?.id,
    });
    const data = get(detailIncomeResponse, ['data', 'me', 'client', 'income']) || [];
    if (data.length > 0) {
      yield put(updateData({ details: data, type: data.length > 0 ? data[0].type : undefined }));
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(data);
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  }
}

function* updateIncomeInvestmentSaga(action) {
  const { payload, resolver = {} } = action;
  const loadingView = GlobalLib.Loading.get();

  const { assetIncomeCards } = yield select(selectFlags);
  loadingView.show();
  try {
    const incomes = [];
    const assetKey =
      payload?.assetType === AppConstants.AssetType.Property ? 'properties' : 'investments';
    const adhocIncomeKey =
      payload?.assetType === AppConstants.AssetType.Property ? 'adhocIncome' : 'adHocIncome';
    const assets = {};
    const incomeType =
      payload?.assetType === AppConstants.AssetType.Property
        ? AppConstants.IncomeType.PropertyIncome
        : AppConstants.IncomeType.InvestmentIncome;
    if (assetIncomeCards) {
      incomes.push({
        _id: payload?._id,
        name: payload.name,
        notes: payload.notes,
        amount: UtilLib.checkEmptyButNotZero(payload.regularIncome)
          ? null
          : Number(payload.regularIncome),
        amountAsAt: payload.amountAsAt || null,
        frequency: payload.frequency?.value,
        isTaxDeductible: false,
        property: payload.assetLink,
        type: incomeType,
        nextPayDateStart: payload?.nextPayDate ? UtilLib.dateUTCAsAt(payload?.nextPayDate) : null,
        paymentFrequency: payload?.paymentFrequency?.value,
      });
    } else {
      assets[assetKey] = {
        _id: payload?.assetLink,
      };
      const regularIncomeID = payload?.regularIncomeID;
      const adhocIncomeID = payload?.adhocIncomeID;

      if (regularIncomeID) {
        incomes.push({
          _id: regularIncomeID,
          // name: payload.name,
          // notes: payload.notes,
          amount: UtilLib.checkEmptyButNotZero(payload.regularIncome)
            ? null
            : Number(payload.regularIncome),
          amountAsAt: payload.amountAsAt || null,
          frequency: payload.frequency?.value,
          property: payload.assetLink,
          type: incomeType,
          isTaxDeductible: false,
          paymentFrequency: payload?.paymentFrequency?.value,
        });
        assets[assetKey].income = regularIncomeID;
      }

      if (adhocIncomeID) {
        incomes.push({
          _id: adhocIncomeID,
          // name: payload.name,
          // notes: payload.notes,
          amount: UtilLib.checkEmptyButNotZero(payload.regularIncome)
            ? null
            : Number(payload.regularIncome),
          amountAsAt: payload.amountAsAt || null,
          frequency: payload.adhocFrequency?.value,
          property: payload.assetLink,
          type: incomeType,
          isTaxDeductible: false,
          paymentFrequency: payload?.paymentFrequency?.value,
        });
        assets[assetKey][adhocIncomeKey] = adhocIncomeID;
      }
    }
    const variables = {
      data: {
        page: AppConstants.ClientHistoryQuery.Income,
        income: incomes,
        assets,
      },
    };

    const response = yield SagaLib.mutationCall(SUBMIT_INCOME, variables);
    const _incomes = get(response, ['data', 'me', 'client', 'update', 'income']);

    yield all([
      putResolve(syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(financialActions.refetchFinancialListData(true, true)),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
      putResolve(getWealthSpeedData({ generate: false })),
    ]);

    const type = i18n.t('cardType.income');
    let message = i18n.t('successMsg.editCard', {
      cardType: type,
      name: payload.name,
    });
    GlobalLib.Toast.get().toastSuccess(message);

    // NavigationServiceLib.pop();
    typeof resolver?.resolve === 'function' && resolver?.resolve(_incomes);
  } catch (error) {
    if (!isEmpty(error.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.resolve === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

function* updateNextPayDateStartSaga(action) {
  const { payload, resolver = {} } = action;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const variables = {
      data: {
        page: AppConstants.ClientHistoryQuery.Income,
        income: [
          {
            _id: payload?._id,
            nextPayDateStart: payload?.date,
            paymentFrequency: payload?.paymentFrequency,
          },
        ],
      },
    };
    const response = yield SagaLib.mutationCall(SUBMIT_INCOME, variables);
    const incomes = get(response, ['data', 'me', 'client', 'update', 'income']) || [];
    const income = incomes.find(x => x._id === payload?._id);
    typeof resolver?.resolve === 'function' && resolver?.resolve(income);
  } catch (error) {
    if (!isEmpty(error.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.resolve === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export default function* defaultSaga() {
  yield takeLeading(INCOME_SUBMIT_DATA, submitAddNewIncomeSaga);

  yield takeLatest(INCOME_FISNISH, finishAddNewIncomeSaga);
  yield takeLatest(INCOME_GET_DETAIL, getDetails);
  yield takeLeading(UPDATE_INCOME_INVESTMENT, updateIncomeInvestmentSaga);
  yield takeLeading(UPDATE_NEXT_PAY_DATE, updateNextPayDateStartSaga);
}
