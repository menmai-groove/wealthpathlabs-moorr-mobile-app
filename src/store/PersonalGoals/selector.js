import { formatDateTime } from 'libs/util';
import { groupBy, orderBy, set } from 'lodash';
import moment from 'moment';
import { createSelector } from 'reselect';

import { moduleName } from './module';
import { initialState } from './reducer';

const formatDateTimeString = 'YYYY-MM-DD';

export const makeSelectState = state => state[moduleName] || initialState;
export const selectListPersonalGoals = createSelector(
  makeSelectState,
  state => state.listPersonalGoals,
);
export const selectIsFetchedList = createSelector(makeSelectState, state => state.isFetchedList);

export const selectUpcomingGoal = createSelector(makeSelectState, state => state.upcomingGoal);
export const selectGoalDetail = createSelector(makeSelectState, state => state.goalDetail);

export const selectGroupGoals = createSelector(selectListPersonalGoals, listPersonalGoals => {
  const { data = [] } = listPersonalGoals;
  if (data.length === 0) {
    return [];
  }

  const sortedTimeData = data.map(item => ({
    ...item,
    formattedDueDate: moment(item.dueDate).format(formatDateTimeString),
  }));
  const groupData = groupBy(sortedTimeData, 'formattedDueDate');
  const formattedDueDateKeys = Object.keys(groupData);
  const groupDueDateKeys = groupBy(formattedDueDateKeys, i => moment(i).format('YYYY'));
  let listItems = [];
  const dueDateKeys = Object.keys(groupDueDateKeys).reverse();

  dueDateKeys.forEach(year => {
    listItems.push({ title: year, isYearTitle: true, year: Number(year), data: [] });
    const items = groupDueDateKeys[year].map(formattedDueDate => ({
      title: formattedDueDate,
      data: orderBy(groupData[formattedDueDate], i => new Date(i.dueDate), 'desc'),
      isYearTitle: false,
      year: Number(year),
    }));
    listItems.push(...items);
  });
  const today = formatDateTime(null, formatDateTimeString); // today
  const todayItemIndex = listItems.findIndex(item => item.title === today);
  if (todayItemIndex !== -1) {
    set(listItems, `${todayItemIndex}.isToday`, true);
  } else {
    // add section header
    const currentYear = new Date().getFullYear().toString();
    if (!dueDateKeys.find(year => year === currentYear)) {
      listItems.push({
        title: currentYear,
        isYearTitle: true,
        year: Number(currentYear),
        data: [],
      });
    }
    // add today seperator
    const todaySeperatorItem = {
      title: today,
      data: [],
      isYearTitle: false,
      year: new Date().getFullYear(),
      isToday: true,
    };
    listItems.push(todaySeperatorItem);
    listItems = orderBy(listItems, i => new Date(i.title), 'desc');
  }

  //
  const result = [];
  const sectionYearTitles = orderBy(
    listItems.filter(i => i.isYearTitle),
    i => i.year,
    'desc',
  );

  sectionYearTitles.forEach(item => {
    result.push(item);
    const items = listItems.filter(i => i.year === item.year && !i.isYearTitle);
    result.push(...items);
  });

  return result;
});

export const selectListYears = createSelector(makeSelectState, state => state.listYears);
export const selectListYearOptions = createSelector(selectListYears, years => {
  return years.map(i => ({ display: i.toString(), value: i.toString() }));
});
