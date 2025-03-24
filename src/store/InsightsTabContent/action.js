/*
 *
 * Reset password actions
 *
 */

import {
  GET_HISTORICAL_VALUES,
  SET_CHART_TIME,
  SET_FETCHING,
  SET_HISTORICAL_VALUES,
  SET_OFFSET_BENEFIT_VALUES,
} from 'store/InsightsTabContent/constants';

export const getHistoricalValues = payload => ({
  type: GET_HISTORICAL_VALUES,
  payload,
});

export const setHistoricalValues = payload => ({
  type: SET_HISTORICAL_VALUES,
  payload,
});

export const setFetching = payload => ({
  type: SET_FETCHING,
  payload,
});

export const setChartTime = payload => ({
  type: SET_CHART_TIME,
  payload,
});

export const setOffsetBenefitValues = payload => ({
  type: SET_OFFSET_BENEFIT_VALUES,
  payload,
});
