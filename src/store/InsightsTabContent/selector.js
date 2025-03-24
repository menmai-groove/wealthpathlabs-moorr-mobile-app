import { isEmpty, last } from 'lodash';
import { createSelector } from 'reselect';

import { initialState } from './reducer';

export const makeSelectDomain = state => state.insightsTabContent || initialState;

export const selectHistoricalValues = createSelector(makeSelectDomain, state => {
  return state.historicalValues;
});

export const selectFetching = createSelector(makeSelectDomain, state => {
  return state.fetching;
});

export const selectChartTime = createSelector(makeSelectDomain, state => {
  return state.chartTime;
});

export const selectHistoricalValuesTotalValue = createSelector(selectHistoricalValues, list => {
  return last(list)?.value || 0;
});

export const selectOffsetBenefitValues = createSelector(makeSelectDomain, state => {
  if (state.offsetBenefitValues != null && !isEmpty(state.offsetBenefitValues)) {
    const getValue = field => state.offsetBenefitValues.find(x => x.field === field);
    const data = {
      borrowing: {
        outstanding: getValue('offset_loan_outstanding')?.value,
        name: getValue('offset_loan_name')?.stringValue,
        id: getValue('offset_loan_id')?.stringValue,
        interestRate: getValue('offset_loan_interest_rate')?.value,
      },
      totalAmount: getValue('offset_total_amount')?.value,
      amount: getValue('offset_amount')?.value,
      benefit: getValue('offset_benefit')?.value,
      totalCount: getValue('offset_total_count')?.value,
    };
    return data;
  }
  return null;
});
