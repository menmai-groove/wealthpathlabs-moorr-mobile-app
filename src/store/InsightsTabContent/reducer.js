/*
 *
 * Reset password reducer
 *
 */

import {
  SET_CHART_TIME,
  SET_FETCHING,
  SET_HISTORICAL_VALUES,
  SET_OFFSET_BENEFIT_VALUES,
} from 'store/InsightsTabContent/constants';

export const initialState = {
  historicalValues: null,
  fetching: true,
  chartTime: 'Y',
  offsetBenefitValues: null,
};

function insightsTabContentReducer(state = initialState, action) {
  switch (action.type) {
    case SET_HISTORICAL_VALUES:
      return {
        ...state,
        historicalValues: action.payload,
        fetching: false,
      };
    case SET_OFFSET_BENEFIT_VALUES:
      return {
        ...state,
        offsetBenefitValues: action.payload,
      };
    case SET_FETCHING:
      return {
        ...state,
        fetching: action.payload,
      };
    case SET_CHART_TIME:
      return {
        ...state,
        chartTime: action.payload,
      };
    default:
      return state;
  }
}

export default insightsTabContentReducer;
