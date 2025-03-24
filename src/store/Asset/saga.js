import i18n from 'bootstrap/i18n';
import { AppConstants } from 'constant';
import Constants from 'constant/constants';
import { AnalyticsLib, GlobalLib, SagaLib, UtilLib } from 'libs';
import { get, includes, isEmpty, isNil, isNumber, omit } from 'lodash';
import { all, putResolve, select, takeEvery, takeLeading } from 'redux-saga/effects';
import { updateData } from 'store/Asset/action';
import {
  ASSET_ADD_BANK_ACCOUNT,
  ASSET_ADD_INVESTMENT,
  ASSET_ADD_LIFE_INSURANCE,
  ASSET_ADD_OTHER_ASSET,
  ASSET_ADD_PROPERTY,
  ASSET_ADD_SUPERFUND,
  ASSET_ADD_VEHICLE,
  ASSET_GET_DETAIL,
  Purposes,
} from 'store/Asset/constants';
import {
  ADD_NEW_ASSET_QUERY,
  GET_BANK_ACCOUNT_QUERY,
  GET_INVESTMENT_QUERY,
  GET_INVESTMENT_QUERY_DEPRECATED,
  GET_LIFE_INSURANCE_QUERY,
  GET_OTHER_ASSET_QUERY,
  GET_PROPERTY_EXTRA_EXPENSE_QUERY,
  GET_PROPERTY_EXTRA_EXPENSE_QUERY_2,
  GET_PROPERTY_EXTRA_INCOME_QUERY,
  GET_PROPERTY_QUERY,
  GET_SUPER_FUND_QUERY,
  GET_VEHICLE_QUERY,
} from 'store/Asset/query';
import { getAssetPosition } from 'store/AssetPosition/action';
import * as authActions from 'store/Auth/action';
import { selectFlags, selectOwnersWithOthers } from 'store/Auth/selector';
import { getCashPosition } from 'store/CashPosition/action';
import * as expenseActions from 'store/ExpenseDashboard/action';
import * as financialActions from 'store/FinancialDashboard/action';
import * as homeActions from 'store/Home/action';
import { getNetWorth } from 'store/NetWorth/action';
import { getWealthSpeedData } from 'store/Wealth/action';

import { selectData } from './selector';

export function* addBankAccountSaga(action) {
  const resolver = action.resolver || {};
  const {
    id,
    name,
    balance,
    accountType,
    otherType,
    isPrimary,
    ownership,
    institution,
    interestRate,
    last4,
    notes,
    balanceAsAt,
    interestRateAsAt,
    isTrackedInMoneySmarts,
    isTrackedInMoneySmartsAsAt,
  } = action?.payload;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const response = yield SagaLib.mutationCall(ADD_NEW_ASSET_QUERY, {
      data: {
        page: AppConstants.ClientHistoryQuery.NonPropertyAssets,
        assets: {
          bankAccounts: [
            {
              _id: id ? id : AppConstants.newObjectID,
              name: name || '',
              balance: !UtilLib.checkEmptyButNotZero(balance) ? parseFloat(balance) : null,
              accountType: isNil(accountType) ? null : accountType.value,
              otherType: otherType || '',
              isPrimary: isPrimary,
              ownership: omit(ownership, ['label', 'display', 'value']),
              institution: isNil(institution) ? null : institution.value,
              interestRate: !UtilLib.checkEmptyButNotZero(interestRate)
                ? parseFloat(interestRate)
                : null,
              last4: isNil(last4) ? '' : `${last4}`,
              notes: notes || '',
              balanceAsAt: balanceAsAt ? balanceAsAt : null,
              interestRateAsAt: interestRateAsAt ? interestRateAsAt : null,
              isTrackedInMoneySmarts: isNil(isTrackedInMoneySmarts)
                ? null
                : isTrackedInMoneySmarts.value,
              isTrackedInMoneySmartsAsAt,
            },
          ],
        },
      },
    });
    yield all([
      putResolve(homeActions.syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(financialActions.refetchFinancialListData(true, true)),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
      putResolve(authActions.getStaticValues()),
      putResolve(getWealthSpeedData({ generate: false })),
    ]);
    yield all([
      putResolve(getNetWorth(true)),
      putResolve(getCashPosition(true)),
      putResolve(getAssetPosition(true)),
    ]);
    const type = i18n.t('cardType.asset');
    let message = i18n.t(isNil(id) ? 'successMsg.addCard' : 'successMsg.editCard', {
      cardType: type,
      name: name || '',
    });
    GlobalLib.Toast.get().toastSuccess(message);

    if (isEmpty(id)) {
      const parameters = {
        category: AppConstants.cardCategory.Asset,
        item_type: AppConstants.AssetType.BankAccounts,
        name,
        card_id: response.data.me.client.update._id,
      };
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardCreate, parameters);
    }

    typeof resolver?.resolve === 'function' && resolver?.resolve(response);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export function* addVehicleSaga(action) {
  const resolver = action.resolver || {};
  const {
    id,
    name,
    ownership,
    notes,
    datePurchased,
    manufacturer,
    purchasePrice,
    value,
    vehicleType,
    year,
    valueAsAt,
  } = action?.payload;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const response = yield SagaLib.mutationCall(ADD_NEW_ASSET_QUERY, {
      data: {
        page: AppConstants.ClientHistoryQuery.NonPropertyAssets,
        assets: {
          vehicles: [
            {
              _id: id ? id : AppConstants.newObjectID,
              name: name || '',
              ownership: omit(ownership, ['label', 'display', 'value']),
              notes: notes || '',
              vehicleType: isNil(vehicleType) ? null : vehicleType.value,
              datePurchased: datePurchased || null,
              manufacturer: manufacturer || null,
              purchasePrice:
                isNil(purchasePrice) || purchasePrice === '' ? null : parseFloat(purchasePrice),
              value: isNil(value) || value === '' ? null : parseFloat(value),
              year: year ? parseInt(`${year.value}`, 10) : null,
              valueAsAt: valueAsAt ? valueAsAt : null,
            },
          ],
        },
      },
    });
    yield all([
      putResolve(homeActions.syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(financialActions.refetchFinancialListData(true, true)),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
      putResolve(getWealthSpeedData({ generate: false })),
    ]);
    yield all([
      putResolve(getNetWorth(true)),
      putResolve(getCashPosition(true)),
      putResolve(getAssetPosition(true)),
    ]);
    const type = i18n.t('cardType.asset');
    let message = i18n.t(isNil(id) ? 'successMsg.addCard' : 'successMsg.editCard', {
      cardType: type,
      name: name || '',
    });
    GlobalLib.Toast.get().toastSuccess(message);
    if (isEmpty(id)) {
      const parameters = {
        category: AppConstants.cardCategory.Asset,
        item_type: AppConstants.AssetType.Vehicles,
        name,
        card_id: response.data.me.client.update._id,
      };
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardCreate, parameters);
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(response);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export function* addLifeInsuranceSaga(action) {
  const resolver = action.resolver || {};
  const {
    id,
    name,
    ownership,
    notes,
    datePurchased,
    purchasePrice,
    value,
    policyProvider,
    valueAsAt,
  } = action?.payload;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const response = yield SagaLib.mutationCall(ADD_NEW_ASSET_QUERY, {
      data: {
        page: AppConstants.ClientHistoryQuery.NonPropertyAssets,
        assets: {
          lifeInsurance: [
            {
              _id: id ? id : AppConstants.newObjectID,
              name: name || '',
              ownership: omit(ownership, ['label', 'display', 'value']),
              notes: notes || '',
              policyProvider: policyProvider || '',
              datePurchased: datePurchased || null,
              purchasePrice:
                isNil(purchasePrice) || purchasePrice === '' ? null : parseFloat(purchasePrice),
              value: isNil(value) || value === '' ? null : parseFloat(value),
              valueAsAt: valueAsAt ? valueAsAt : null,
            },
          ],
        },
      },
    });
    yield all([
      putResolve(homeActions.syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(financialActions.refetchFinancialListData(true, true)),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
      putResolve(getWealthSpeedData({ generate: false })),
    ]);

    const type = i18n.t('cardType.asset');
    let message = i18n.t(isNil(id) ? 'successMsg.addCard' : 'successMsg.editCard', {
      cardType: type,
      name: name || '',
    });
    GlobalLib.Toast.get().toastSuccess(message);
    if (isEmpty(id)) {
      const parameters = {
        category: AppConstants.cardCategory.Asset,
        item_type: AppConstants.AssetType.LifeInsurance,
        name,
        card_id: response.data.me.client.update._id,
      };
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardCreate, parameters);
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(response);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export function* addOtherAssetSaga(action) {
  const resolver = action.resolver || {};
  const { id, name, ownership, notes, datePurchased, purchasePrice, value, valueAsAt } =
    action?.payload;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const response = yield SagaLib.mutationCall(ADD_NEW_ASSET_QUERY, {
      data: {
        page: AppConstants.ClientHistoryQuery.NonPropertyAssets,
        assets: {
          otherAssets: [
            {
              _id: id ? id : AppConstants.newObjectID,
              name: name || '',
              ownership: omit(ownership, ['label', 'display', 'value']),
              notes: notes || '',
              datePurchased: datePurchased || null,
              purchasePrice:
                isNil(purchasePrice) || purchasePrice === '' ? null : parseFloat(purchasePrice),
              value: isNil(value) || value === '' ? null : parseFloat(value),
              valueAsAt: valueAsAt ? valueAsAt : null,
            },
          ],
        },
      },
    });
    yield all([
      putResolve(homeActions.syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(financialActions.refetchFinancialListData(true, true)),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
      putResolve(getWealthSpeedData({ generate: false })),
    ]);
    yield all([
      putResolve(getNetWorth(true)),
      putResolve(getCashPosition(true)),
      putResolve(getAssetPosition(true)),
    ]);

    const type = i18n.t('cardType.asset');
    let message = i18n.t(isNil(id) ? 'successMsg.addCard' : 'successMsg.editCard', {
      cardType: type,
      name: name || '',
    });
    GlobalLib.Toast.get().toastSuccess(message);
    if (isEmpty(id)) {
      const parameters = {
        category: AppConstants.cardCategory.Asset,
        item_type: AppConstants.AssetType.OtherAssets,
        name,
        card_id: response.data.me.client.update._id,
      };
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardCreate, parameters);
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(response);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export function* addSuperannuationSaga(action) {
  const resolver = action.resolver || {};
  const {
    id,
    name,
    ownership,
    notes,
    value,
    isSmsf,
    provider,
    product,
    strategy,
    salarySacrificeBool,
    salarySacrificeClient1,
    salarySacrificeClient1Frequency,
    salarySacrificeClient2,
    salarySacrificeClient2Frequency,
    personalContributionsBool,
    personalContributionsClient1,
    personalContributionsClient1Frequency,
    personalContributionsClient2,
    personalContributionsClient2Frequency,
    salarySacrificeClient1AsAt,
    salarySacrificeClient2AsAt,
    personalContributionsClient1AsAt,
    personalContributionsClient2AsAt,
    valueAsAt,
    nextContributionClient1Date,
    nextContributionClient2Date,
  } = action?.payload;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const handledData = {
      _id: id ? id : AppConstants.newObjectID,
      name: name || '',
      ownership: omit(ownership, ['label', 'display', 'value']),
      notes: notes || '',
      value: isNil(value) || value === '' ? null : parseFloat(value),
      valueAsAt: valueAsAt ? valueAsAt : null,
      isSmsf: isSmsf,
      provider: isNil(provider) ? null : provider.value,
      product: isNil(product) ? null : product.value,
      strategy: isNil(strategy) ? null : strategy.value,
      salarySacrificeBool: salarySacrificeBool,
      salarySacrificeClient1:
        isNil(salarySacrificeClient1) || salarySacrificeClient1 === ''
          ? null
          : parseFloat(salarySacrificeClient1),
      salarySacrificeClient1Frequency: isNil(salarySacrificeClient1Frequency)
        ? null
        : salarySacrificeClient1Frequency.value,
      salarySacrificeClient1AsAt: salarySacrificeClient1AsAt ? salarySacrificeClient1AsAt : null,
      salarySacrificeClient2:
        isNil(salarySacrificeClient2) || salarySacrificeClient2 === ''
          ? null
          : parseFloat(salarySacrificeClient2),
      salarySacrificeClient2Frequency: isNil(salarySacrificeClient2Frequency)
        ? null
        : salarySacrificeClient2Frequency.value,
      salarySacrificeClient2AsAt: salarySacrificeClient2AsAt ? salarySacrificeClient2AsAt : null,
      personalContributionsBool: personalContributionsBool,
      personalContributionsClient1:
        isNil(personalContributionsClient1) || personalContributionsClient1 === ''
          ? null
          : parseFloat(personalContributionsClient1),
      personalContributionsClient1Frequency: isNil(personalContributionsClient1Frequency)
        ? null
        : personalContributionsClient1Frequency.value,
      personalContributionsClient1AsAt: personalContributionsClient1AsAt
        ? personalContributionsClient1AsAt
        : null,
      personalContributionsClient2:
        isNil(personalContributionsClient2) || personalContributionsClient2 === ''
          ? null
          : parseFloat(personalContributionsClient2),
      personalContributionsClient2Frequency: isNil(personalContributionsClient2Frequency)
        ? null
        : personalContributionsClient2Frequency.value,
      personalContributionsClient2AsAt: personalContributionsClient2AsAt
        ? personalContributionsClient2AsAt
        : null,
      nextContributionClient1DateStart: nextContributionClient1Date
        ? UtilLib.dateUTCAsAt(nextContributionClient1Date)
        : null,
      nextContributionClient2DateStart: nextContributionClient2Date
        ? UtilLib.dateUTCAsAt(nextContributionClient2Date)
        : null,
    };
    const response = yield SagaLib.mutationCall(ADD_NEW_ASSET_QUERY, {
      data: {
        page: AppConstants.ClientHistoryQuery.NonPropertyAssets,
        assets: {
          superFunds: [handledData],
        },
      },
    });
    yield all([
      putResolve(homeActions.syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(financialActions.refetchFinancialListData(true, true)),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
      putResolve(getWealthSpeedData({ generate: false })),
    ]);
    yield all([
      putResolve(getNetWorth(true)),
      putResolve(getCashPosition(true)),
      putResolve(getAssetPosition(true)),
    ]);

    const type = i18n.t('cardType.asset');
    let message = i18n.t(isNil(id) ? 'successMsg.addCard' : 'successMsg.editCard', {
      cardType: type,
      name: name || '',
    });
    GlobalLib.Toast.get().toastSuccess(message);
    if (isEmpty(id)) {
      const parameters = {
        category: AppConstants.cardCategory.Asset,
        item_type: AppConstants.AssetType.Superannuation,
        name,
        card_id: response.data.me.client.update._id,
      };
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardCreate, parameters);
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(response);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export function* getAssetDetailSaga(action) {
  const resolver = action.resolver || {};
  const { id, typeValue, name } = action?.payload;
  const userOwnerships = yield select(selectOwnersWithOthers);
  const { contributionsVisible, assetIncomeCards, assetExpenseCards } = yield select(selectFlags);
  try {
    const {
      Vehicles,
      BankAccounts,
      LifeInsurance,
      OtherAssets,
      Superannuation,
      Property,
      Investments,
    } = AppConstants.AssetType;
    let query;
    let assetTypeName = '';
    let callExtraQuery = false;
    switch (typeValue) {
      case BankAccounts:
        query = GET_BANK_ACCOUNT_QUERY;
        assetTypeName = 'bankAccounts';
        break;
      case Vehicles:
        query = GET_VEHICLE_QUERY;
        assetTypeName = 'vehicles';
        break;
      case LifeInsurance:
        query = GET_LIFE_INSURANCE_QUERY;
        assetTypeName = 'lifeInsurance';
        break;
      case OtherAssets:
        query = GET_OTHER_ASSET_QUERY;
        assetTypeName = 'otherAssets';
        break;
      case Superannuation:
        query = GET_SUPER_FUND_QUERY;
        assetTypeName = 'superFunds';
        break;
      case Property:
        query = GET_PROPERTY_QUERY;
        assetTypeName = 'properties';
        callExtraQuery = true;
        break;
      case Investments:
        query = contributionsVisible ? GET_INVESTMENT_QUERY : GET_INVESTMENT_QUERY_DEPRECATED;
        assetTypeName = 'investments';
        callExtraQuery = true;
        break;
      default:
        throw Error(i18n.t('errorMsg.unexpectedError'));
    }

    const response = yield SagaLib.queryCall(query, {
      id: id,
      assetIds: id,
      propertyId: id[0],
    });
    const data = get(response, ['data', 'me', 'client', 'assets', assetTypeName, 0]);
    const annualDepreciation = get(response, ['data', 'me', 'annualDepreciation']);
    const purposeLog = get(response, 'data.me.historicalTracking.getValues.values');
    let display = '';
    let ownershipValue = '';
    if (data?.ownership?.ownershipType === AppConstants.ownershipType.Joint) {
      display = AppConstants.ownershipType.Joint;
      ownershipValue = userOwnerships.find(
        x => x.ownershipType === AppConstants.ownershipType.Joint,
      )?.value;
    } else if (data?.ownership?.ownershipType === AppConstants.ownershipType.Other) {
      display = ownershipValue = AppConstants.ownershipType.Other;
    } else {
      userOwnerships.map(owner => {
        if (
          owner?.owners[0]?.owner === data?.ownership?.owners[0]?.owner &&
          owner?.display !== AppConstants.ownershipType.Joint &&
          owner?.display !== AppConstants.ownershipType.Other
        ) {
          display = owner?.display;
          ownershipValue = owner?.owners[0]?.owner;
        }
      });
    }
    let extraData = {};
    if (callExtraQuery) {
      const { income, adhocIncome, adHocIncome, expenses } = data || {};
      const _adhocIncome = adhocIncome || adHocIncome;
      const incomeIds = [];
      let extraIncomeResponse = null;
      let extraExpenseResponse = null;
      if (income) {
        incomeIds.push(income);
      }
      if (_adhocIncome) {
        incomeIds.push(_adhocIncome);
      }
      if (incomeIds.length > 0) {
        extraIncomeResponse = yield SagaLib.queryCall(GET_PROPERTY_EXTRA_INCOME_QUERY, {
          incomeIds: incomeIds,
        });
      }
      if (expenses && expenses.length > 0) {
        extraExpenseResponse = yield SagaLib.queryCall(
          assetExpenseCards ? GET_PROPERTY_EXTRA_EXPENSE_QUERY_2 : GET_PROPERTY_EXTRA_EXPENSE_QUERY,
          {
            expenseIds: expenses,
          },
        );
      }

      const incomeItems =
        (assetIncomeCards
          ? get(response, ['data', 'me', 'client', 'income'])
          : get(extraIncomeResponse, ['data', 'me', 'client', 'income'])) || [];
      const incomeData = incomeItems.find(item => item._id === income);
      const adhocIncomeData = incomeItems.find(item => item._id === _adhocIncome);
      const expensesData = get(extraExpenseResponse, ['data', 'me', 'client', 'expenses']);
      extraData = {
        incomeData: incomeData,
        adhocIncomeData: adhocIncomeData,
        expensesData: expensesData?.map(expenseItem => ({
          ...expenseItem,
          ownership: {
            ...expenseItem.ownership,
            display: display,
            label: display,
            owners: expenseItem?.ownership?.owners?.map(item => ({
              _id: item._id,
              owner: item.owner,
              percentage: isNumber(item.percentage) ? item.percentage : 100,
            })),
            ownershipDesc: expenseItem?.ownership?.ownershipDesc,
            ownershipType: expenseItem?.ownership?.ownershipType,
            value: ownershipValue,
          },
        })),
        expensesID: data.expenses,
        adhocIncome: _adhocIncome,
        adHocIncome: _adhocIncome,
        incomesData: incomeItems,
      };
    }
    const newReceivedData = {
      ...data,
      annualDepreciation,
      purposeLog,
      type: typeValue,
      investmentType: data?.type,
      ownership: {
        ...data.ownership,
        display: display,
        label: display,
        owners: data?.ownership?.owners?.map(item => ({
          _id: item._id,
          owner: item.owner,
          percentage: isNumber(item.percentage) ? item.percentage : 100,
        })),
        ownershipDesc: data?.ownership?.ownershipDesc,
        ownershipType: data?.ownership?.ownershipType,
        value: ownershipValue,
      },
      name: name ?? '',
      ...extraData,
    };
    yield putResolve(updateData(newReceivedData));
    typeof resolver?.resolve === 'function' && resolver?.resolve(newReceivedData);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  }
}

export function* addPropertySaga(action) {
  const resolver = action.resolver || {};
  const loadingView = GlobalLib.Loading.get();
  const assetDatas = action.payload;
  const {
    id,
    name,
    currentValue,
    purpose,
    ownership,
    address,
    purchasePrice,
    datePurchased,
    settlementDate,
    adhocIncome,
    income,
    incomes,
    expenses,
    expensesID,
    borrowings,
    projectedCapitalGrowth,
    propertyType,
    titleType,
    material,
    condition,
    landSize,
    landSizeUnit,
    internalLivingSpaceSize,
    bedrooms,
    bathrooms,
    livingSpaces,
    carSpaces,
    isBrandNew,
    managingAgent,
    managingAgentContactName,
    managingAgentContactNo,
    addlInfo,
    capitalGrowth,
    purposeAsAt,
    currentValueAsAt,
    capitalGrowthAsAt,
    projectedCapitalGrowthAsAt,
    ownershipAsAt,
    depreciationMethod,
    onlyChangePurpose,
  } = assetDatas || {};
  try {
    loadingView.show();
    const prevAssetData = yield select(selectData);
    const prevExpenses = get(prevAssetData, ['expensesID']) || [];

    const isEmptyExpenses =
      ![Purposes.Investment, Purposes.Business, Purposes.Personal].includes(purpose?.value) ||
      isNil(expenses);
    // const isEmptyIncomes =
    //   ![Purposes.Investment, Purposes.Business].includes(purpose?.value) || isNil(incomes);

    const expenseData = expenses ? [...expenses] : [];

    let incomeData = incomes ? [...incomes] : [];

    const inputData = onlyChangePurpose
      ? {
          data: {
            page: AppConstants.ClientHistoryQuery.Properties,
            assets: {
              properties: [
                {
                  _id: id ? id : Constants.newObjectIDForTypes.Property,
                  purpose: purpose?.value,
                },
              ],
            },
          },
        }
      : {
          data: {
            page: AppConstants.ClientHistoryQuery.Properties,
            assets: {
              properties: [
                {
                  _id: id ? id : Constants.newObjectIDForTypes.Property,
                  name: name || null,
                  purpose: purpose?.value,
                  datePurchased: datePurchased ? datePurchased : null,
                  settlementDate: settlementDate ? settlementDate : null,
                  purchasePrice: purchasePrice,
                  currentValue: currentValue,
                  address: address || null,
                  expenses: isEmptyExpenses ? prevExpenses.map(() => null) : expensesID,
                  income: income || null, // not allow empty anymmore
                  adhocIncome: adhocIncome || null, // not allow empty anymmore
                  ownership: {
                    ...omit(ownership, ['label', 'display', 'value']),
                    ownershipAsAt: ownershipAsAt || null,
                  },

                  capitalGrowth: UtilLib.checkEmptyButNotZero(capitalGrowth) ? null : capitalGrowth,
                  projectedCapitalGrowth: UtilLib.checkEmptyButNotZero(projectedCapitalGrowth)
                    ? null
                    : projectedCapitalGrowth,
                  propertyType: isNil(propertyType) ? null : propertyType,
                  titleType: isNil(titleType) ? null : titleType,
                  material: isNil(material) ? null : material,
                  condition: isNil(condition) ? null : condition,
                  landSize: UtilLib.checkEmptyButNotZero(landSize) ? null : landSize,
                  landSizeUnit: isNil(landSizeUnit) ? null : landSizeUnit,
                  internalLivingSpaceSize: UtilLib.checkEmptyButNotZero(internalLivingSpaceSize)
                    ? null
                    : internalLivingSpaceSize,
                  bedrooms: UtilLib.checkEmptyButNotZero(bedrooms) ? null : bedrooms,
                  bathrooms: UtilLib.checkEmptyButNotZero(bathrooms) ? null : bathrooms,
                  livingSpaces: UtilLib.checkEmptyButNotZero(livingSpaces) ? null : livingSpaces,
                  carSpaces: UtilLib.checkEmptyButNotZero(carSpaces) ? null : carSpaces,
                  isBrandNew: isNil(isBrandNew) ? false : isBrandNew,
                  managingAgent: isNil(managingAgent) ? '' : managingAgent,
                  managingAgentContactName: isNil(managingAgentContactName)
                    ? ''
                    : managingAgentContactName,
                  managingAgentContactNo: isNil(managingAgentContactNo)
                    ? ''
                    : managingAgentContactNo,
                  addlInfo: addlInfo || '',
                  purposeAsAt: purposeAsAt ? purposeAsAt : null,
                  currentValueAsAt: currentValueAsAt ? currentValueAsAt : null,
                  capitalGrowthAsAt: capitalGrowthAsAt ? capitalGrowthAsAt : null,
                  projectedCapitalGrowthAsAt: projectedCapitalGrowthAsAt
                    ? projectedCapitalGrowthAsAt
                    : null,
                  depreciationMethod: depreciationMethod ? depreciationMethod : null,
                },
              ],
            },
          },
        };
    if (!isEmpty(expenseData)) {
      inputData.data.expenses = expenseData;
    }
    if (!isEmpty(incomeData)) {
      inputData.data.income = incomeData;
    }
    if (!isEmpty(borrowings)) {
      borrowings.forEach(borrowing => {
        if (borrowing.otherBorrowerPercentage) {
          borrowing.otherBorrowerPercentage = parseFloat(borrowing.otherBorrowerPercentage ?? 0);
        }
        if (
          includes(borrowing?.type, 'Credit Card') ||
          includes(borrowing?.type, 'Line of Credit')
        ) {
          borrowing.isTrackedInMoneySmarts = includes(borrowing?.type, 'Line of Credit')
            ? false
            : true;
          borrowing.isTrackedInMoneySmartsAsAt = UtilLib.dateUTCAsAt(Date.now());
        }
      });
      inputData.data.borrowings = borrowings;
    }
    const response = yield SagaLib.mutationCall(ADD_NEW_ASSET_QUERY, inputData);
    const totalNewItem =
      1 +
      (isEmptyExpenses ? 0 : 1) +
      (isEmpty(incomeData) ? 0 : incomeData.length) +
      (borrowings?.length || 0);
    yield all([
      putResolve(homeActions.syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(financialActions.refetchFinancialListData(true, true, totalNewItem)),
      putResolve(expenseActions.refetchFinancialListData(true, true, totalNewItem)),
      putResolve(getWealthSpeedData({ generate: false })),
    ]);
    yield all([
      putResolve(getNetWorth(true)),
      putResolve(getCashPosition(true)),
      putResolve(getAssetPosition(true)),
    ]);
    if (!isEmpty(id)) {
      const type = i18n.t('cardType.asset');
      let message = i18n.t('successMsg.editCard', {
        cardType: type,
        name: name ?? '',
      });
      GlobalLib.Toast.get().toastSuccess(message);
    }
    if (isEmpty(id)) {
      const parameters = {
        category: AppConstants.cardCategory.Asset,
        item_type: AppConstants.AssetType.Property,
        name,
        card_id: response.data.me.client.update._id,
      };
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardCreate, parameters);
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(response);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export function* addInvestmentSaga(action) {
  const resolver = action.resolver || {};
  const loadingView = GlobalLib.Loading.get();
  const assetDatas = action.payload;
  const {
    id,
    name,
    currentValue,
    ownership,
    purchasePrice,
    settlementDate,
    adhocIncome,
    income,
    incomes,
    expenses,
    expensesID,
    borrowings,
    investmentType,
    purchaseDate,
    projectsCapitalGrowth,
    providerName,
    contributions,
    addlInfo,
    currentValueAsAt,
    projectsCapitalGrowthAsAt,
    ownershipAsAt,
    nextContributionDateStart,
  } = assetDatas || {};
  try {
    loadingView.show();
    const prevAssetData = yield select(selectData);
    const { contributionsVisible, assetExpenseCards, assetIncomeCards } = yield select(selectFlags);
    const prevExpenses = get(prevAssetData, ['expensesID']) || [];
    const prevIncomeId = get(prevAssetData, ['income']);
    const prevAdhocIncomeId = get(prevAssetData, ['adhocIncome']);

    const prevIncomeIds = [prevIncomeId, prevAdhocIncomeId].filter(Boolean); // []
    const isEmptyExpenses = isNil(expenses);
    const isEmptyIncomes = isNil(incomes);

    const expenseData = expenses ? [...expenses] : [];
    if (!assetExpenseCards) {
      prevExpenses?.forEach(_id => {
        if (!expenseData.map(i => i._id).includes(_id)) {
          expenseData.push({ _id: _id, _delete: true });
        }
      });
    }
    let incomeData = incomes ? [...incomes] : [];
    if (!assetIncomeCards) {
      prevIncomeIds?.forEach(_id => {
        if (!incomeData.map(i => i._id).includes(_id)) {
          incomeData.push({ _id, _delete: true });
        }
      });
    }

    const inputData = {
      data: {
        page: AppConstants.ClientHistoryQuery.NonPropertyAssets,
        assets: {
          investments: [
            {
              _id: id ? id : Constants.newObjectIDForTypes.Investment,
              name: name || null,
              ownership: {
                ownershipAsAt: ownershipAsAt || null,
                ...omit(ownership, ['label', 'display', 'value']),
              },
              type: isNil(investmentType) ? null : investmentType.value,
              purchaseDate: purchaseDate ? purchaseDate : null,
              purchasePrice: purchasePrice,
              currentValue: currentValue,
              expenses: isEmptyExpenses ? prevExpenses.map(() => null) : expensesID,
              income: income || null, // not allow empty anymmore
              adHocIncome: adhocIncome || null, // not allow empty anymmore

              yearlyGrowthRate: UtilLib.checkEmptyButNotZero(projectsCapitalGrowth)
                ? null
                : projectsCapitalGrowth,
              projectsCapitalGrowth: UtilLib.checkEmptyButNotZero(projectsCapitalGrowth)
                ? null
                : projectsCapitalGrowth,
              addlInfo: addlInfo || '',
              providerName: providerName || '',
              settlementDate: settlementDate ? settlementDate : null,
              ...(contributionsVisible ? contributions : { contributions }),
              currentValueAsAt: currentValueAsAt || null,
              projectsCapitalGrowthAsAt: projectsCapitalGrowthAsAt || null,
              nextContributionDateStart: nextContributionDateStart || null,
            },
          ],
        },
        expenses: expenseData,
        income: incomeData,
      },
    };

    if (!isEmpty(borrowings)) {
      borrowings.forEach(borrowing => {
        if (borrowing.otherBorrowerPercentage) {
          borrowing.otherBorrowerPercentage = parseFloat(borrowing.otherBorrowerPercentage ?? 0);
        }
        if (
          includes(borrowing?.type, 'Credit Card') ||
          includes(borrowing?.type, 'Line of Credit')
        ) {
          borrowing.isTrackedInMoneySmarts = includes(borrowing?.type, 'Line of Credit')
            ? false
            : true;
          borrowing.isTrackedInMoneySmartsAsAt = UtilLib.dateUTCAsAt(Date.now());
        }
      });
      inputData.data.borrowings = borrowings;
    }

    const response = yield SagaLib.mutationCall(ADD_NEW_ASSET_QUERY, inputData);
    const totalNewItem =
      1 + (isEmptyExpenses ? 0 : 1) + (isEmptyIncomes ? 0 : 1) + (borrowings?.length || 0);
    yield all([
      putResolve(homeActions.syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(financialActions.refetchFinancialListData(true, true, totalNewItem)),
      putResolve(expenseActions.refetchFinancialListData(true, true, totalNewItem)),
      putResolve(getWealthSpeedData({ generate: false })),
    ]);
    yield all([
      putResolve(getNetWorth(true)),
      putResolve(getCashPosition(true)),
      putResolve(getAssetPosition(true)),
    ]);
    if (!isEmpty(id)) {
      const type = i18n.t('cardType.asset');
      let message = i18n.t('successMsg.editCard', {
        cardType: type,
        name: name,
      });
      GlobalLib.Toast.get().toastSuccess(message);
    }
    if (isEmpty(id)) {
      const parameters = {
        category: AppConstants.cardCategory.Asset,
        item_type: AppConstants.AssetType.Investments,
        name,
        card_id: response.data.me.client.update._id,
      };
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardCreate, parameters);
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(response);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export default function* defaultSaga() {
  yield takeEvery(ASSET_GET_DETAIL, getAssetDetailSaga);
  yield takeLeading(ASSET_ADD_BANK_ACCOUNT, addBankAccountSaga);
  yield takeLeading(ASSET_ADD_VEHICLE, addVehicleSaga);
  yield takeLeading(ASSET_ADD_LIFE_INSURANCE, addLifeInsuranceSaga);
  yield takeLeading(ASSET_ADD_OTHER_ASSET, addOtherAssetSaga);
  yield takeLeading(ASSET_ADD_SUPERFUND, addSuperannuationSaga);
  yield takeLeading(ASSET_ADD_PROPERTY, addPropertySaga);
  yield takeLeading(ASSET_ADD_INVESTMENT, addInvestmentSaga);
}
