import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import { cloneDeep, findLast, last } from 'lodash';
import moment from 'moment';
import { createSelector } from 'reselect';
import { initialState } from 'store/DebtPosition/reducer';

export const makeSelectDomain = state => state.debtPosition || initialState;

export const selectFetching = createSelector(makeSelectDomain, state => {
  return state.fetching;
});

export const selectChartTime = createSelector(makeSelectDomain, state => {
  return state.chartTime;
});

export const selectDebtPosition = createSelector(makeSelectDomain, state => {
  return state.debtPosition?.map(item => ({
    ...item,
    value: Math.abs(item.value),
  }));
});

export const selectFinancialCards = createSelector(makeSelectDomain, state => {
  return state.financialCards?.filter(financialCard => !financialCard.isArchived) || [];
});

export const selectArchivedFinancialCards = createSelector(makeSelectDomain, state => {
  return state.financialCards?.filter(financialCard => financialCard.isArchived) || [];
});

export const selectDebtPositionValue = createSelector(selectDebtPosition, list => {
  return last(list)?.value || 0;
});

const getLineChartGraph = (chartTime, chartData) => {
  let cloneChartData = cloneDeep(chartData || []);

  // Check if cloneChartData has data
  if (cloneChartData.length > 0) {
    // Constants for time calculations
    const timePerDay = 1000 * 60 * 60 * 24;

    // Calculate the time difference in days between the last and first data points
    const diff =
      new Date(cloneChartData[cloneChartData.length - 1].date).getTime() -
      new Date(cloneChartData[0].date).getTime();
    const diffInDays = diff / timePerDay;

    // Initialize variables for chart range and change in value calculations
    let minX = '';
    let maxX = '';
    let changeInValue = 0;
    let changeInValuePercent = '0%';
    let changeInValueVisible = true;
    let firstPoint;
    let lastPoint;

    // Adjust changeInValueVisible if there are less than 2 data points
    if (cloneChartData.length < 2) {
      changeInValueVisible = false;
    }

    // Duplicate the single data point to create a dummy point for better chart display
    if (cloneChartData.length === 1) {
      cloneChartData = [
        cloneChartData[0],
        {
          ...cloneChartData[0],
          date: moment(cloneChartData[0].date).add(5, 'days').toISOString(),
          _type: 'dummy',
        },
      ];
    }

    // Find the selected chart filter based on chartTime
    const chartFilter = AppConstants.listFilterChart.find(x => x.value === chartTime);

    // Check if the time difference is greater than the selected chart filter duration
    const greaterThanFilter = diffInDays > chartFilter?.totalDay;

    // Set minX and maxX based on the chart filter and data range
    if (greaterThanFilter) {
      minX = moment(cloneChartData[cloneChartData.length - 1].date)
        .subtract(chartFilter?.months, 'months')
        .toISOString();
      maxX = cloneChartData[cloneChartData.length - 1].date;
    } else {
      minX = cloneChartData[0].date;
      maxX = moment(cloneChartData[0].date).add(chartFilter?.months, 'months').toISOString();
    }

    // Set the initial range values
    let rangeStart = minX,
      rangeEnd = maxX;

    // Adjust rangeStart and rangeEnd if greaterThanFilter is true and the filter value is 'M'
    if (greaterThanFilter) {
      rangeEnd = cloneChartData[cloneChartData.length - 1].date;
      rangeStart = moment(rangeEnd).subtract(chartFilter?.months, 'months').toISOString();
      // }
    }

    // Ensure that rangeStart is in the cloneChartData array
    if (!cloneChartData.some(e => e.date === rangeStart)) {
      // get nearest value
      const previousRangeStart = findLast(cloneChartData, point =>
        moment(point.date).isBefore(rangeStart),
      );
      if (previousRangeStart) {
        cloneChartData.unshift({ ...previousRangeStart, date: rangeStart });
      }
    }

    // Filter the data points within the specified range
    cloneChartData = cloneChartData.filter(
      point => moment(point.date).isSameOrAfter(minX) && moment(point.date).isSameOrBefore(maxX),
    );

    // Calculate change in value if there are at least 2 data points in the range
    if (cloneChartData.length >= 2) {
      firstPoint = cloneChartData.find(point => moment(point.date).isSameOrAfter(minX));
      lastPoint = findLast(cloneChartData, point => moment(point.date).isSameOrBefore(maxX));
      if (firstPoint && lastPoint) {
        changeInValue = lastPoint.value - firstPoint.value;
        if (firstPoint.value !== 0) {
          changeInValuePercent = ((changeInValue / firstPoint.value) * 100).toFixed(2) + '%';
        }
      }
    }

    // Format data for rangeChartNetworthData using UtilLib
    const rangeChartNetworthData = UtilLib.formatRangeChartDataV2({
      data: cloneChartData.map(item => ({
        label: '',
        value: item?.value,
        generatedDate: item?.date,
      })),
      rangeStart,
      rangeEnd,
      chartFilterValue: chartFilter.value,
    });

    // Assemble the final lineChartGraph object
    const lineChartGraph = {
      minX,
      maxX,
      data: cloneChartData,
      changeInValueVisible,
      changeInValue,
      changeInValuePercent,
      rangeChartNetworthData,
      reference:
        chartFilter?.value !== 'M' && chartFilter?.value !== '3M'
          ? chartFilter.reference
          : `${moment(firstPoint?.date).format('Do MMM YYYY')} - ${moment(lastPoint?.date).format(
              'Do MMM YYYY',
            )}`,
    };

    // Return the generated chart data
    return lineChartGraph;
  }

  // Return null if cloneChartData is empty
  return null;
};

export const selectChartData = createSelector(makeSelectDomain, state => {
  const chartTime = state.chartTime;
  return getLineChartGraph(chartTime, state.debtPosition);
});

export const selectChartDataHomeScreen = createSelector(makeSelectDomain, state => {
  return getLineChartGraph('Y', state.debtPosition);
});
