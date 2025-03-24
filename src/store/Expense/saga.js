import i18n from 'bootstrap/i18n';
import { AppConstants } from 'constant';
import { AnalyticsLib, GlobalLib, SagaLib, UtilLib } from 'libs';
import { get, isEmpty, last, omit, uniq } from 'lodash';
import { all, put, putResolve, select, takeLatest, takeLeading } from 'redux-saga/effects';
import { selectDefaultValueExpense, selectExpenseType } from 'store/Auth/selector';
//
import * as action from 'store/Expense/action';
import * as constants from 'store/Expense/constants';
import * as query from 'store/Expense/query';
import * as selector from 'store/Expense/selector';
import * as expenseActions from 'store/ExpenseDashboard/action';
import * as financialActions from 'store/FinancialDashboard/action';
import * as homeActions from 'store/Home/action';
import { getWealthSpeedData } from 'store/Wealth/action';

function* submitAddNewExpenseSaga({ payload, resolver }) {
  const loadingView = GlobalLib.Loading.get();
  try {
    loadingView.show();
    const listExpense = yield select(selectExpenseType);
    const defaultValueExpense = yield select(selectDefaultValueExpense);

    const expenseType = listExpense.find(e => e.value === payload?.category);
    const defaultOptions = defaultValueExpense.find(e => e.category === payload?.category);
    const defaultValues = UtilLib.getCardItemDefaultValuesFromAPI(defaultOptions);
    let variables = {};
    if (payload?.relatedAsset) {
      const assetType = payload?.relatedAsset?.type;
      const assetId = payload?.relatedAsset?.data?._id;

      const assetTypeItem = AppConstants.financialAssetTypes.find(i => i.value === assetType);
      const relatedAssetField = AppConstants.belongToAssetKeys.find(i => i.category === assetType);

      const relatedAsset = yield select(selector.selectRelatedAsset);
      const prevExpenseIds = get(relatedAsset, ['data', 'expenses'], []) ?? [];
      let expenseIds = uniq([
        ...prevExpenseIds,
        ...[payload?._id ? payload._id : AppConstants.newObjectID],
      ]);

      delete payload.relatedAsset;
      variables = {
        data: {
          page: AppConstants.ClientHistoryQuery.BillPayments,
          assets: {
            [assetTypeItem.key]: {
              _id: assetId,
              expenses: expenseIds,
            },
          },
          expenses: [
            {
              ...defaultValues,
              ...payload,
              categoryAsAt: payload.categoryAsAt || null,
              amountAsAt: payload.amountAsAt || null,
              isTaxDeductableAsAt: payload.isTaxDeductableAsAt || null,
              jar: !isEmpty(payload?.jar) ? payload?.jar : undefined,
              jarAsAt: payload.jarAsAt || null,
              _id: payload._id ? payload._id : AppConstants.newObjectID,
              [relatedAssetField.value]: assetId,
              ownership: omit(payload.ownership, ['ownershipAsAt']),
            },
          ],
        },
      };
    } else {
      delete payload.relatedAsset;
      variables = {
        data: {
          page:
            expenseType?.type === AppConstants.ExpenseGroups.Spending
              ? AppConstants.ClientHistoryQuery.Expenses
              : AppConstants.ClientHistoryQuery.BillPayments,
          expenses: [
            {
              ...defaultValues,
              ...payload,
              categoryAsAt: payload.categoryAsAt || null,
              amountAsAt: payload.amountAsAt || null,
              isTaxDeductableAsAt: payload.isTaxDeductableAsAt || null,
              jar: !isEmpty(payload?.jar) ? payload?.jar : undefined,
              jarAsAt: payload.jarAsAt || null,
              _id: payload._id ? payload._id : AppConstants.newObjectID,
            },
          ],
        },
      };
    }

    const response = yield SagaLib.mutationCall(query.SUBMIT_NEW_EXPENSE_MUTATION, variables);

    const _expenses = get(response, ['data', 'me', 'client', 'update', 'expenses']);

    yield all([
      putResolve(homeActions.syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(financialActions.refetchFinancialListData(true, true)),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
      putResolve(getWealthSpeedData({ generate: false })),
    ]);

    const type = i18n.t('cardType.expense');
    let message = i18n.t(isEmpty(payload._id) ? 'successMsg.addCard' : 'successMsg.editCard', {
      cardType: type,
      name: payload?.name || '',
    });
    GlobalLib.Toast.get().toastSuccess(message);

    if (isEmpty(payload._id)) {
      const parameters = {
        category: AppConstants.cardCategory.Expense,
        item_type: payload.category,
        name: payload.name,
        card_id: last(_expenses)?._id,
      };
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardCreate, parameters);
    }

    typeof resolver?.resolve === 'function' && resolver.resolve(last(_expenses));
  } catch (error) {
    UtilLib.toastErrorMsg(error);
    typeof resolver?.reject === 'function' && resolver.reject();
  } finally {
    loadingView.hide();
  }
}

function* getExpenseDetailSaga({ payload, resolver }) {
  const { ids, assetId } = payload;
  try {
    if (Array.isArray(ids) && ids?.length) {
      const response = yield SagaLib.queryCall(query.GET_EXPENSES_DATA_QUERY, { ids });
      const resData = get(response, ['data', 'me', 'client', 'expenses', '0']);
      yield put(action.setExpenseDetail(resData));
    }

    if (assetId) {
      const groupExpensesResponse = yield SagaLib.queryCall(query.GET_GROUP_EXPENSES_DATA_QUERY, {
        ids,
        assetIds: [assetId],
      });
      const resInvestmentAsset = get(groupExpensesResponse, [
        'data',
        'me',
        'client',
        'assets',
        'investments',
        '0',
      ]);
      const resPropertyAsset = get(groupExpensesResponse, [
        'data',
        'me',
        'client',
        'assets',
        'properties',
        '0',
      ]);
      const assetType = resInvestmentAsset
        ? AppConstants.AssetType.Investments
        : resPropertyAsset
        ? AppConstants.AssetType.Property
        : null;
      if (assetType) {
        yield put(
          action.setRelatedAsset({ type: assetType, data: resPropertyAsset ?? resInvestmentAsset }),
        );
      }
    }

    typeof resolver?.resolve === 'function' && resolver.resolve();
  } catch (error) {
    UtilLib.toastErrorMsg(error);
    typeof resolver?.reject === 'function' && resolver.reject();
  } finally {
  }
}

function* getGroupExpensesSaga({ payload, resolver }) {
  const { ids, assetId } = payload;
  if (ids.length === 0 || !assetId) {
    return null;
  }
  try {
    const response = yield SagaLib.queryCall(query.GET_GROUP_EXPENSES_DATA_QUERY, {
      ids,
      assetIds: [assetId],
    });
    const resExpenses = get(response, ['data', 'me', 'client', 'expenses'], []);
    const resPropertyAsset = get(response, ['data', 'me', 'client', 'assets', 'properties', '0']);
    const resInvestmentAsset = get(response, [
      'data',
      'me',
      'client',
      'assets',
      'investments',
      '0',
    ]);

    const assetType = resInvestmentAsset
      ? AppConstants.AssetType.Investments
      : resPropertyAsset
      ? AppConstants.AssetType.Property
      : null;

    yield put(action.setGroupExpensesData(resExpenses));
    if (assetType) {
      yield put(
        action.setRelatedAsset({ type: assetType, data: resPropertyAsset ?? resInvestmentAsset }),
      );
    }
    typeof resolver?.resolve === 'function' && resolver.resolve();
  } catch (error) {
    UtilLib.toastErrorMsg(error);
    typeof resolver?.reject === 'function' && resolver.reject();
  } finally {
    //
  }
}

function* submitGroupExpensesSaga({ payload, resolver }) {
  const { groupExpenses = [], assetId, assetType, deleteExpenseIds, name } = payload;
  const groupExpenseIds = groupExpenses.map(i => i._id);
  const relatedAsset = yield select(selector.selectRelatedAsset);
  const assetTypeItem = AppConstants.financialAssetTypes.find(i => i.value === assetType);
  const relatedAssetField = AppConstants.belongToAssetKeys.find(i => i.category === assetType);
  const prevExpenseIds = get(relatedAsset, ['data', 'expenses'], []);

  let expenseIds = uniq([...prevExpenseIds, ...groupExpenseIds]).map(_id =>
    groupExpenseIds.includes(_id) ? _id : null,
  );

  const loadingView = GlobalLib.Loading.get();
  try {
    // validate
    // at least 1 expenses
    if (!assetId || !assetType) {
      throw new Error(i18n.t('errorMsg.unexpectedError'));
    }
    if (assetType !== relatedAsset?.type || !assetTypeItem || !relatedAssetField) {
      throw new Error(i18n.t('errorMsg.unexpectedError'));
    }
    loadingView.show();
    const deletedExpenses = deleteExpenseIds.map(_id => ({ _id, _delete: true }));
    yield SagaLib.mutationCall(query.SUBMIT_UPDATE_GROUP_EXPENSES_MUTATION(assetTypeItem.key), {
      data: {
        page: AppConstants.ClientHistoryQuery.BillPayments,
        assets: {
          [assetTypeItem.key]: {
            _id: assetId,
            expenses: expenseIds,
          },
        },
        expenses: groupExpenses
          .map(expense => ({
            ...expense,
            [relatedAssetField.value]: assetId,
          }))
          .concat(deletedExpenses),
      },
      assetIds: [assetId],
    });

    yield all([
      putResolve(homeActions.syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(financialActions.refetchFinancialListData(true, true)),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
      putResolve(getWealthSpeedData({ generate: false })),
    ]);

    const type = i18n.t('cardType.expense');
    let message = i18n.t('successMsg.editCard', {
      cardType: type,
      name: name || '',
    });
    GlobalLib.Toast.get().toastSuccess(message);

    typeof resolver?.resolve === 'function' && resolver.resolve();
  } catch (error) {
    UtilLib.toastErrorMsg(error);
    typeof resolver?.reject === 'function' && resolver.reject();
  } finally {
    //
    loadingView.hide();
  }
}

export default function* defaultSaga() {
  yield takeLeading(constants.EXPENSE_SUBMIT_DATA, submitAddNewExpenseSaga);
  yield takeLatest(constants.GET_EXPENSE_DETAIL, getExpenseDetailSaga);
  yield takeLatest(constants.EXPENSE_GET_GROUP_DATA, getGroupExpensesSaga);
  yield takeLeading(constants.EXPENSE_SUBMIT_GROUP_DATA, submitGroupExpensesSaga);
}
