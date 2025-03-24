import { AppConstants } from 'constant';
import { GlobalLib, SagaLib, UtilLib } from 'libs';
import { cloneDeep, get, isEmpty, isNil, map } from 'lodash';
import { all, put, takeLatest } from 'redux-saga/effects';
import { getWealthSpeedSuccess, setWealthSpeedData } from 'store/Wealth/action';
import { GET_HISTORY_WEALTH_SPEED_DATA, GET_WEALTH_SPEED_DATA } from 'store/Wealth/constants';
import {
  getHistoryWealthSpeedQuery,
  GET_HISTORY_OF_WEALTH_CLOCK,
  UPDATE_CASHFLOW_SPEED_QUERY,
} from 'store/Wealth/query';

const wealthKeys = AppConstants.wealthKeys;

function formatValue(valueInput) {
  return typeof valueInput === 'object' && valueInput !== null && valueInput !== undefined
    ? Object.entries(valueInput)?.find(([key]) => key.includes('household'))?.[1]
    : valueInput;
}

function formatDefinitionsPath(path) {
  if (!path?.length) {
    return [];
  }
  let newPath = cloneDeep(path);
  newPath.splice(path.length > 1 ? 1 : 0, 0, 'definitions');
  return newPath;
}

function* mapDataForGauge(wealthSpeed, path) {
  const lastIndex = path.length - 1;
  const key = path[lastIndex];
  const label = key;
  const generatedDate = get(wealthSpeed, ['generatedDate']);
  const historicalData = get(wealthSpeed, ['historicalData']);
  const latestDate = Date.parse(generatedDate);
  const value = formatValue(get(wealthSpeed, path));
  const changeDiff = formatValue(get(historicalData, ['changesDiff', ...path]));
  const previousDate = formatValue(get(historicalData, ['previousDate', ...path]));
  const newPreviousDate = previousDate ? Date.parse(previousDate) : latestDate;
  const definition = get(wealthSpeed, formatDefinitionsPath(path));
  return {
    key,
    label,
    latestDate,
    value,
    changeDiff,
    previousDate: newPreviousDate,
    definition,
  };
}

export function* getWealthSpeedSaga(action) {
  const resolver = action.resolver || {};
  // const loadingView = GlobalLib.Loading.get();
  // loadingView.show();
  try {
    const generate = action?.payload?.data?.generate || false;
    const cashflowSpeedResponse = yield SagaLib.mutationCall(UPDATE_CASHFLOW_SPEED_QUERY, {
      generate,
    });
    const wealthSpeedData = get(cashflowSpeedResponse, ['data', 'me', 'client', 'wealthSpeed']);
    const netWorthPosition = get(wealthSpeedData, ['netWorthPosition']);
    const wealthPositionDetails = get(wealthSpeedData, ['wealthPositionDetails']);

    const [
      wealthCLOCK,
      wealthSPEED,
      assetSpeed,
      incomeSpeed,
      savingSpeed,
      spendingSpeed,
      debtReductionSpeed,

      personalPropertyValueSpeed,
      investmentPropertyValueSpeed,
      otherInvestmentValueSpeed,
      superannuationSpeed,

      passiveIncomeSpeed,
      rentalIncomeSpeed,
      investmentIncomeSpeed,
      workingIncomeSpeed,

      nestEggSPEED,
    ] = yield all([
      mapDataForGauge(wealthSpeedData, [wealthKeys.wealthCLOCK]),
      mapDataForGauge(wealthSpeedData, [wealthKeys.wealthSPEED]),
      mapDataForGauge(wealthSpeedData, ['investmentSpeed', wealthKeys.assetSpeed]),
      mapDataForGauge(wealthSpeedData, ['cashflowSpeed', wealthKeys.incomeSpeed]),
      mapDataForGauge(wealthSpeedData, ['cashflowSpeed', wealthKeys.savingSpeed]),
      mapDataForGauge(wealthSpeedData, ['cashflowSpeed', wealthKeys.spendingSpeed]),
      mapDataForGauge(wealthSpeedData, ['investmentSpeed', wealthKeys.debtReductionSpeed]),

      mapDataForGauge(wealthSpeedData, ['investmentSpeed', wealthKeys.personalPropertyValueSpeed]),
      mapDataForGauge(wealthSpeedData, [
        'investmentSpeed',
        wealthKeys.investmentPropertyValueSpeed,
      ]),
      mapDataForGauge(wealthSpeedData, ['investmentSpeed', wealthKeys.otherInvestmentValueSpeed]),
      mapDataForGauge(wealthSpeedData, ['investmentSpeed', wealthKeys.superannuationSpeed]),

      mapDataForGauge(wealthSpeedData, ['cashflowSpeed', wealthKeys.passiveIncomeSpeed]),
      mapDataForGauge(wealthSpeedData, ['cashflowSpeed', wealthKeys.rentalIncomeSpeed]),
      mapDataForGauge(wealthSpeedData, ['cashflowSpeed', wealthKeys.investmentIncomeSpeed]),
      mapDataForGauge(wealthSpeedData, ['cashflowSpeed', wealthKeys.workingIncomeSpeed]),

      mapDataForGauge(wealthSpeedData, [wealthKeys.nestEggSPEED]),
    ]);
    const data = {
      wealthCLOCK,
      wealthSPEED,
      assetSpeed,
      incomeSpeed,
      savingSpeed,
      spendingSpeed,
      debtReductionSpeed,

      personalPropertyValueSpeed,
      investmentPropertyValueSpeed,
      otherInvestmentValueSpeed,
      superannuationSpeed,

      passiveIncomeSpeed,
      rentalIncomeSpeed,
      investmentIncomeSpeed,
      workingIncomeSpeed,

      nestEggSPEED,

      netWorthPosition,

      wealthPositionDetails,
    };
    yield put(setWealthSpeedData(data));
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    yield put(getWealthSpeedSuccess());
  }
}

function* getHistoryWealthSpeedSaga(action) {
  const resolver = action.resolver || {};
  const payload = action.payload || {};
  const data = payload?.data;
  try {
    if (data.key === AppConstants.wealthKeys.wealthCLOCK) {
      const response = yield SagaLib.mutationCall(GET_HISTORY_OF_WEALTH_CLOCK, {
        range: data.range,
      });
      const wealthSPEEDData = get(
        response,
        ['data', 'me', 'client', 'wealthSpeed', 'historicalData', 'wealthSpeedData'],
        [],
      );

      const wealthCLOCKData = [];
      const netWorthData = [];

      wealthSPEEDData.forEach(item => {
        const netWorth = get(item, 'netWorthPosition.netWorth');
        if (!isNil(netWorth)) {
          netWorthData.push({
            label: item.generatedDate,
            value: Number.parseFloat(netWorth ?? 0),
          });
        }

        const wealthCLOCK = get(item, 'wealthCLOCK');
        if (!isNil(wealthCLOCK)) {
          wealthCLOCKData.push({
            label: item.generatedDate,
            value: Number.parseFloat(wealthCLOCK ?? 0),
          });
        }
      });
      wealthCLOCKData.sort((a, b) => Date.parse(a.label) - Date.parse(b.label));
      netWorthData.sort((a, b) => Date.parse(a.label) - Date.parse(b.label));

      const resultData = {
        projection: wealthCLOCKData,
        actual: netWorthData,
      };

      typeof resolver?.resolve === 'function' && resolver?.resolve(resultData);
      return;
    }

    if (data.key === 'netWorthPosition') {
      const key = get(AppConstants.wealthKeyQueryDataChart, data.key);
      const response = yield SagaLib.mutationCall(getHistoryWealthSpeedQuery(key), {
        range: data.range,
      });
      const historicalData = get(response, [
        'data',
        'me',
        'client',
        'wealthSpeed',
        'historicalData',
      ]);
      const rangeStart = get(historicalData, ['rangeStart']);
      const rangeEnd = get(historicalData, ['rangeEnd']);

      const netWorthData = map(get(historicalData, 'wealthSpeedData'), item => ({
        label: get(item, ['generatedDate']) || new Date().toISOString(),
        value: get(item, ['netWorthPosition', 'netWorth']) || 0,
        generatedDate: new Date(get(item, ['generatedDate'])) || new Date(),
      }));

      let rangeChartNetworthData;
      let netWorthBreakdownData = map(get(historicalData, ['wealthSpeedData']) || [], item => {
        return {
          label: get(item, ['generatedDate']) || new Date().toISOString(),
          value:
            {
              superannuation:
                get(item, ['netWorthPosition', 'assets', 'breakdown', 'superannuation']) || 0,
              savings: get(item, ['netWorthPosition', 'assets', 'breakdown', 'bankAccounts']) || 0,
              personal: get(item, ['netWorthPosition', 'assets', 'breakdown', 'properties']) || 0,
              investments:
                get(item, ['netWorthPosition', 'assets', 'breakdown', 'investments']) || 0,
              liabilities: get(item, ['netWorthPosition', 'liabilities', 'totalLiabilities']) || 0,
            } || {},
        };
      });

      if (rangeStart && rangeEnd) {
        netWorthData.sort((a, b) => Date.parse(a.label) - Date.parse(b.label));
        netWorthBreakdownData.sort((a, b) => Date.parse(a.label) - Date.parse(b.label));

        rangeChartNetworthData = UtilLib.formatRangeChartData({
          data: netWorthData,
          rangeStart: new Date(rangeStart),
          rangeEnd: new Date(rangeEnd),
        });

        netWorthBreakdownData = UtilLib.generateDataForStackedBarChart({
          records: netWorthBreakdownData,
          rangeStart: new Date(rangeStart),
          rangeEnd: new Date(rangeEnd),
          range: data.range,
        });
      }

      typeof resolver?.resolve === 'function' &&
        resolver?.resolve({
          rangeChartNetworthData,
          netWorthBreakdownData,
        });
      return;
    }

    const key = get(AppConstants.wealthKeyQueryDataChart, data.key);
    const response = yield SagaLib.mutationCall(getHistoryWealthSpeedQuery(key), {
      range: data.range,
    });

    const result = get(
      response,
      ['data', 'me', 'client', 'wealthSpeed', 'historicalData', 'wealthSpeedData'],
      [],
    );

    const path = AppConstants.wealthKeyQueryDataChart[data.key]
      .replaceAll(/\{|\}/g, ' ')
      .trim()
      .split(' ')
      .join('.');
    const resultData = [];
    result.map(item => {
      const value = get(item, `${path}`);
      if (!isNil(value)) {
        resultData.push({
          label: get(item, ['generatedDate']) || new Date().toISOString(),
          value: Number.parseFloat(value ?? 0),
          generatedDate: new Date(get(item, ['generatedDate'])) || new Date(),
        });
      }
    });
    const historicalData = get(response, ['data', 'me', 'client', 'wealthSpeed', 'historicalData']);
    const rangeStart = get(historicalData, ['rangeStart']);
    const rangeEnd = get(historicalData, ['rangeEnd']);
    resultData.sort((a, b) => Date.parse(a.label) - Date.parse(b.label));
    const newResultData = UtilLib.formatRangeChartData({
      data: resultData,
      rangeStart: new Date(rangeStart),
      rangeEnd: new Date(rangeEnd),
    });

    typeof resolver?.resolve === 'function' && resolver?.resolve(newResultData);
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
  }
}

export default function* defaultSaga() {
  yield takeLatest(GET_WEALTH_SPEED_DATA, getWealthSpeedSaga);
  yield takeLatest(GET_HISTORY_WEALTH_SPEED_DATA, getHistoryWealthSpeedSaga);
}
