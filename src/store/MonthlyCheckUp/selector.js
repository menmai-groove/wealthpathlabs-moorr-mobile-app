import { UtilLib } from 'libs';
import { first, get, last, omit } from 'lodash';
import moment from 'moment';
import { createSelector } from 'reselect';
import { selectFlags } from 'store/Auth/selector';

import { initialState } from './reducer';

const unexpectedReportTableVariables = ['shiftedMonthlyOut', 'shiftedMoneyOut'];

export const makeSelectCheckUpDomain = state => state.monthlyCheckUp || initialState;

export const selectTotalCheckUp = createSelector(makeSelectCheckUpDomain, state => state.total);

export const selectPageCheckUp = createSelector(makeSelectCheckUpDomain, state => state.page);

export const selectFetchedDataCheckUp = createSelector(
  makeSelectCheckUpDomain,
  state => state.fetchedData,
);

export const selectCheckUpReportTableData = createSelector(
  makeSelectCheckUpDomain,
  selectFlags,
  (state, flags) => {
    const { checkupAsAt } = flags;
    const listTableData = [];
    if (state.listTableData.length > 0) {
      state.listTableData.map(tableItem => {
        let standardData = { ...tableItem };
        if (checkupAsAt) {
          unexpectedReportTableVariables.push('cashPosition');
        } else {
          unexpectedReportTableVariables.push('cashPositionOpening');
          unexpectedReportTableVariables.push('cashPositionEnding');
        }
        unexpectedReportTableVariables.forEach(item => {
          delete standardData[item];
        });
        listTableData.push(standardData);
      });
    }
    return listTableData;
  },
);

export const selectCheckUpReportTableKey = createSelector(
  makeSelectCheckUpDomain,
  selectFlags,
  (state, flags) => {
    const { checkupAsAt } = flags;
    const listTableKey = [];
    if (state.listTableData.length > 0) {
      const standardData = { ...omit(state.listTableData[0], '__typename') };
      // Get text data for left column
      Object.keys(standardData).forEach(variable => {
        if (checkupAsAt) {
          unexpectedReportTableVariables.push('cashPosition');
        } else {
          unexpectedReportTableVariables.push('cashPositionOpening');
          unexpectedReportTableVariables.push('cashPositionEnding');
        }
        if (!unexpectedReportTableVariables.includes(variable)) {
          listTableKey.push(variable);
        }
      });
    }
    return listTableKey;
  },
);

export const selectCheckUpReportTableDate = createSelector(
  makeSelectCheckUpDomain,
  state => state.listTableDate,
);

export const selectPreviousCheckUps = createSelector(
  makeSelectCheckUpDomain,
  state => state.previousCheckups,
);

export const selectOpenedCheckup = createSelector(
  makeSelectCheckUpDomain,
  state => state.checkupData,
);

export const selectNextCheckupDate = createSelector(
  [selectOpenedCheckup, selectFlags],
  (currentCheckup, flags) => {
    const checkUpFlow = flags?.checkUpFlow;
    let nextCheckupDate;
    if (checkUpFlow) {
      const list =
        currentCheckup?.balancesAsAt?.totalCheckupsBalances?.filter(
          x => x.checkupDate <= UtilLib.dateUTCAsAt(Date.now()).toISOString(),
        ) ?? [];
      const currentCheckUpStartDate = get(currentCheckup, 'startDate');
      const isValidCheckUpStartDate = moment(new Date()).isSameOrAfter(
        moment(currentCheckUpStartDate),
      );
      if (isValidCheckUpStartDate) {
        nextCheckupDate = moment(get(last(list), 'checkupDate'))
          .add(1, 'M')
          .toISOString();
      } else {
        nextCheckupDate = get(
          first(currentCheckup?.balancesAsAt?.totalCheckupsBalances),
          'checkupDate',
        );
      }
    } else {
      nextCheckupDate = moment(currentCheckup?.startDate)
        .add(currentCheckup?.balances?.length, 'M')
        .toISOString();
    }
    return nextCheckupDate;
  },
);

export const selectMonthlyProvisionSpent = createSelector(
  makeSelectCheckUpDomain,
  state => state.monthlyProvisionSpent,
);

export const selectYearlyRemainingProvisions = createSelector(
  makeSelectCheckUpDomain,
  state => state.yearlyRemainingProvisions,
);

export const selectLastStartDate = createSelector(
  makeSelectCheckUpDomain,
  state => state.lastStartDate,
);

export const selectRegularReport = createSelector(
  makeSelectCheckUpDomain,
  state => state.regularSpendingData,
);

export const selectCheckUpData = createSelector(
  makeSelectCheckUpDomain,
  state => state?.checkupData,
);

export const selectStartDate = createSelector(makeSelectCheckUpDomain, state => state?.startDate);

export const selectActions = createSelector(makeSelectCheckUpDomain, state => state?.actions);
