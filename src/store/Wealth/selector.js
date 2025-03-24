import { AppConstants } from 'constant';
import { get } from 'lodash';
import { createSelector } from 'reselect';
import { initialState } from 'store/Wealth/reducer';

const convertData = data => {
  return {
    key: data.key,
    latest: data.latestDate,
    previous: data.previousDate,
    money: data.value,
    percent: data.changeDiff,
    definition: data.definition,
    info: AppConstants.listWealthType.find(x => x.key === data.key) || {},
  };
};

export const makeSelectWealth = state => state.wealth || initialState;

export const selectIndex = createSelector(
  makeSelectWealth,
  state => state.index || initialState.index,
);
const selectWealthSpeedData = createSelector(
  makeSelectWealth,
  state => state.wealthSpeedData || initialState.wealthSpeedData,
);

export const selectWealthData = createSelector(selectWealthSpeedData, wealthSpeedData => {
  function getDefaultValue(key) {
    return {
      key: key,
      info: AppConstants.listWealthType.find(x => x.key === key),
    };
  }

  const wealthCLOCK = get(
    wealthSpeedData,
    ['wealthCLOCK'],
    getDefaultValue(AppConstants.wealthKeys.wealthCLOCK),
  );
  const wealthSPEED = get(
    wealthSpeedData,
    ['wealthSPEED'],
    getDefaultValue(AppConstants.wealthKeys.wealthSPEED),
  );
  const assetSpeed = get(
    wealthSpeedData,
    ['assetSpeed'],
    getDefaultValue(AppConstants.wealthKeys.assetSpeed),
  );
  const incomeSpeed = get(
    wealthSpeedData,
    ['incomeSpeed'],
    getDefaultValue(AppConstants.wealthKeys.incomeSpeed),
  );
  const savingSpeed = get(
    wealthSpeedData,
    ['savingSpeed'],
    getDefaultValue(AppConstants.wealthKeys.savingSpeed),
  );
  const spendingSpeed = get(
    wealthSpeedData,
    ['spendingSpeed'],
    getDefaultValue(AppConstants.wealthKeys.spendingSpeed),
  );
  const debtReductionSpeed = get(
    wealthSpeedData,
    ['debtReductionSpeed'],
    getDefaultValue(AppConstants.wealthKeys.debtReductionSpeed),
  );

  const personalPropertyValueSpeed = get(
    wealthSpeedData,
    ['personalPropertyValueSpeed'],
    getDefaultValue(AppConstants.wealthKeys.personalPropertyValueSpeed),
  );
  const investmentPropertyValueSpeed = get(
    wealthSpeedData,
    ['investmentPropertyValueSpeed'],
    getDefaultValue(AppConstants.wealthKeys.investmentPropertyValueSpeed),
  );
  const otherInvestmentValueSpeed = get(
    wealthSpeedData,
    ['otherInvestmentValueSpeed'],
    getDefaultValue(AppConstants.wealthKeys.otherInvestmentValueSpeed),
  );
  const superannuationSpeed = get(
    wealthSpeedData,
    ['superannuationSpeed'],
    getDefaultValue(AppConstants.wealthKeys.superannuationSpeed),
  );

  const passiveIncomeSpeed = get(
    wealthSpeedData,
    ['passiveIncomeSpeed'],
    getDefaultValue(AppConstants.wealthKeys.passiveIncomeSpeed),
  );
  const rentalIncomeSpeed = get(
    wealthSpeedData,
    ['rentalIncomeSpeed'],
    getDefaultValue(AppConstants.wealthKeys.rentalIncomeSpeed),
  );
  const investmentIncomeSpeed = get(
    wealthSpeedData,
    ['investmentIncomeSpeed'],
    getDefaultValue(AppConstants.wealthKeys.investmentIncomeSpeed),
  );
  const workingIncomeSpeed = get(
    wealthSpeedData,
    ['workingIncomeSpeed'],
    getDefaultValue(AppConstants.wealthKeys.workingIncomeSpeed),
  );

  const wealthPositionDetails = get(wealthSpeedData, ['wealthPositionDetails']) || {};
  const annualSurplusCashflow = get(wealthPositionDetails, ['annualSurplusCashflow']) || 0;
  const loanValuationRatio = get(wealthPositionDetails, ['loanValuationRatio']) || 0;
  const availableEquity = get(wealthPositionDetails, ['availableEquity']) || 0;
  const netWorthPosition = get(wealthSpeedData, ['netWorthPosition']);
  return {
    wealthCLOCK: convertData(wealthCLOCK),
    wealthSPEED: convertData(wealthSPEED),
    assetSpeed: convertData(assetSpeed),
    incomeSpeed: convertData(incomeSpeed),
    savingSpeed: convertData(savingSpeed),
    spendingSpeed: convertData(spendingSpeed),
    debtReductionSpeed: convertData(debtReductionSpeed),

    personalPropertyValueSpeed: convertData(personalPropertyValueSpeed),
    investmentPropertyValueSpeed: convertData(investmentPropertyValueSpeed),
    otherInvestmentValueSpeed: convertData(otherInvestmentValueSpeed),
    superannuationSpeed: convertData(superannuationSpeed),
    passiveIncomeSpeed: convertData(passiveIncomeSpeed),
    rentalIncomeSpeed: convertData(rentalIncomeSpeed),
    investmentIncomeSpeed: convertData(investmentIncomeSpeed),
    workingIncomeSpeed: convertData(workingIncomeSpeed),

    annualSurplusCashflow,
    loanValuationRatio,
    availableEquity,
    netWorthPosition,
  };
});

export const selectWeathLoading = createSelector(makeSelectWealth, state => state.loading);
