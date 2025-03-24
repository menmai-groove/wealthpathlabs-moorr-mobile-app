import { UtilLib } from 'libs';
import { get, map, sortBy } from 'lodash';
import { createSelector } from 'reselect';
import { SORT_TYPE } from 'store/ExpenseDashboard/constants';
import { mapFinancialCard } from 'store/FinancialDashboard/selector';

import { initialState } from './reducer';

export const makeSelectDomain = state => state.expenseDashboard || initialState;

export const selectFinancialList = createSelector(makeSelectDomain, state => state.financialList);
export const selectFetchParams = createSelector(makeSelectDomain, state => state.fetchParams);

export const selectIsAllLoadedFinancialList = createSelector(
  selectFinancialList,
  financialList => financialList.allLoaded,
);

export const selectCurrentPageFinancialList = createSelector(
  selectFinancialList,
  financialList => financialList.page,
);

export const selectIsFetchedFinancialDashboard = createSelector(
  makeSelectDomain,
  state => state.isFetchedList,
);

export const selectFinancialCardData = createSelector(selectFinancialList, financialList => {
  return financialList?.data?.map(mapFinancialCard);
  // return financialList?.data?.map(({ item, type, cards }) => ({
  //   ...item,
  //   cardType: type,
  //   disabledDelete: !isEmpty(item.assetId),
  //   cards: cards?.length
  //     ? cards?.map(card => ({
  //         ...card.item,
  //         cardType: card?.type,
  //         disabledDelete: !isEmpty(card.assetId),
  //       }))
  //     : [],
  // }));
});

export const selectFilterFields = createSelector(makeSelectDomain, state => ({
  income: UtilLib.mapDataForDropdown(state.filterFields.income),
  expense: UtilLib.mapDataForDropdown(state.filterFields.expenses),
  assets: UtilLib.mapDataForDropdown(state.filterFields.assets),
  borrowings: UtilLib.mapDataForDropdown(state.filterFields.borrowings),
  archived: UtilLib.mapDataForDropdown(state.filterFields.archived),
}));

export const selectGrouping = createSelector(makeSelectDomain, state => state.grouping);
export const selectItems = createSelector(makeSelectDomain, state => state.items);
export const selectTargetedExpenses = createSelector(
  makeSelectDomain,
  state => state.targetedExpenses,
);

export const selectGroupingAndItems = createSelector(
  selectGrouping,
  selectItems,
  selectTargetedExpenses,
  (_grouping, _items, _targetExpenses) => {
    const groupsColor = {};
    const itemsColor = {};

    let listGroups = get(_grouping, ['monthly'], []);
    if (listGroups?.length > 0) {
      listGroups = sortBy(listGroups, 'key');
      listGroups.forEach((group, index) => {
        groupsColor[group.key] = UtilLib.getColorByIndex(index);
      });
    }
    let listItems = get(_items, ['monthly'], []);
    if (listItems?.length > 0) {
      listItems = sortBy(listItems, 'key');
      listItems.forEach((item, index) => {
        itemsColor[item.key] = UtilLib.getColorByIndex(index);
      });
    }

    const grouping = {
      monthly:
        map(get(_grouping, ['monthly']), (item, index) => ({
          ...item,
          label: item?.key,
          value: item?.amount,
          color: groupsColor[item?.key] ?? UtilLib.getColorByIndex(index),
        })) || [],
      yearly:
        map(get(_grouping, ['yearly']), (item, index) => ({
          ...item,
          label: item?.key,
          value: item?.amount,
          color: groupsColor[item?.key] ?? UtilLib.getColorByIndex(index),
        })) || [],
    };
    const items = {
      monthly:
        map(get(_items, ['monthly']), (item, index) => ({
          ...item,
          label: item?.key,
          value: item?.amount,
          color: itemsColor[item?.key] ?? UtilLib.getColorByIndex(index),
        })) || [],
      yearly:
        map(get(_items, ['yearly']), (item, index) => ({
          ...item,
          label: item?.key,
          value: item?.amount,
          color: itemsColor[item?.key] ?? UtilLib.getColorByIndex(index),
        })) || [],
    };
    return {
      targetedExpenses: _targetExpenses,
      grouping,
      items,
    };
  },
);
export const selectSortType = createSelector(
  makeSelectDomain,
  state => state.sortType || SORT_TYPE.AMOUNT,
);
export const selectDesc = createSelector(makeSelectDomain, state => state.desc);
export const selectIsFetchedGroupingAndItems = createSelector(
  makeSelectDomain,
  state => state.isFetchedGroupingAndItems,
);

export const selectSelectedFilterButton = createSelector(
  makeSelectDomain,
  state => state.selectedFilterButton,
);
