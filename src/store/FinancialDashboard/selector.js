import Color from 'color';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import { concat, get, groupBy, map, sortBy, sum } from 'lodash';
import { getI18n } from 'react-i18next';
import { createSelector } from 'reselect';
import { makeSelectStaticValuesDomain } from 'store/Auth/selector';

import { initialState } from './reducer';

const { keyColors } = AppConstants;

export const makeSelectDomain = state => state.financialDashboard || initialState;

export const selectFinancialSummary = createSelector(makeSelectDomain, ({ summary }) => {
  const expenses = {
    total: get(summary, ['expenses', 'total']) || 0,
    breakdown:
      map(get(summary, ['expenses', 'breakdown']), (item, index) => ({
        label: item?.key,
        value: item?.amount,
        color: UtilLib.getColorByIndex(index),
      })) || [],
  };
  const income = {
    total: get(summary, ['income', 'total']) || 0,
    breakdown:
      map(get(summary, ['income', 'breakdown']), (item, index) => ({
        label: item?.key,
        value: item?.amount,
        color: UtilLib.getColorByIndex(index),
      })) || [],
  };
  const assets = {
    total: get(summary, ['assets', 'total']) || 0,
    breakdown:
      map(get(summary, ['assets', 'breakdown']), (item, index) => ({
        label: item?.key,
        value: item?.amount,
        color: UtilLib.getColorByIndex(index),
      })) || [],
  };
  const borrowings = {
    total: get(summary, ['borrowings', 'total']) || 0,
    breakdown:
      map(get(summary, ['borrowings', 'breakdown']), (item, index) => ({
        label: item?.key,
        value: item?.amount,
        color: UtilLib.getColorByIndex(index),
      })) || [],
  };
  const netWorths = {
    total: assets.total - borrowings.total || 0,
    breakdown: concat(assets.breakdown, borrowings.breakdown) || [],
  };

  return {
    expenses,
    income,
    netWorths,
    assets,
    borrowings,
  };
});

export const selectFinancialList = createSelector(makeSelectDomain, state => state.financialList);
export const selectSummary = createSelector(makeSelectDomain, state => state.summary);
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

export const selectIsFetchedFinancialSummary = createSelector(
  makeSelectDomain,
  state => state.isFetchedSummary,
);

export const selectFinancialSummaryGroupData = createSelector(
  selectSummary,
  makeSelectStaticValuesDomain,
  (summary, staticValues) => {
    const i18n = getI18n();
    function getBreakdown(name) {
      let rawBreakdown = summary[name]?.breakdown || [];
      if (name === 'expenses') {
        const expenseCategories = get(staticValues, ['dropdown', 'expenses', 'category']);
        if (expenseCategories) {
          const { bill, spending } = expenseCategories;
          const billsCategories = bill.map(i => i.label);
          const spendingCategories = spending.map(i => i.label);

          function getGroupBreakdown(data) {
            const groupBreakdown = groupBy(
              map(data, i => {
                const group = billsCategories.includes(i.key)
                  ? AppConstants.ExpenseGroups.Bills
                  : spendingCategories.includes(i.key)
                  ? AppConstants.ExpenseGroups.Spending
                  : i.key;
                return { ...i, group };
              }),
              item => item.group,
            );
            return Object.keys(groupBreakdown).map(key => ({
              key,
              amount: sum(groupBreakdown[key].map(i => i.amount)),
            }));
          }
          rawBreakdown = getGroupBreakdown(rawBreakdown);
        }
      }

      const lastKeyColorsIndex = keyColors.length - 1;
      const breakdown = rawBreakdown.map((i, idx) => {
        const breakdownIndex = idx % keyColors.length;
        const alpha = Math.floor(idx / keyColors.length);
        const colors = keyColors[breakdownIndex].color.map(colorItem =>
          idx > lastKeyColorsIndex
            ? Color(colorItem)
                .darken(Math.min(alpha * 0.2, 1))
                .hex()
            : colorItem,
        );
        return {
          id: i.key,
          color: colors,
          label: i.key,
          value: i.amount,
        };
      });
      // return orderBy(breakdown, i => i.value, ['desc']);
      return breakdown;
    }

    return {
      income: {
        label: i18n.t('screens.financialDashboard.income'),
        breakdown: getBreakdown('income'),
        total: summary.income?.total || 0,
      },
      expenses: {
        label: i18n.t('screens.financialDashboard.expenses'),
        breakdown: getBreakdown('expenses'),
        total: summary.expenses?.total || 0,
      },
      assets: {
        label: i18n.t('screens.financialDashboard.assets'),
        breakdown: getBreakdown('assets'),
        total: summary.assets?.total || 0,
      },
      borrowings: {
        label: i18n.t('screens.financialDashboard.borrowings'),
        breakdown: getBreakdown('borrowings'),
        total: summary.borrowings?.total || 0,
      },
      propertyPortfolio: {
        label: i18n.t('screens.financialDashboard.propertyPortfolio'),
        breakdown: getBreakdown('propertyPortfolio'),
        total: summary.propertyPortfolio?.total || 0,
      },
    };
  },
);

export const mapFinancialCard = card => {
  const item = get(card, 'item', {});
  const cardType = get(card, 'type', '');
  const cards = get(card, 'cards', []);
  const mappingFinancialCards = cards?.map(c => ({
    ...mapFinancialCard(c),
    disabledDelete: false,
  }));
  return {
    ...item,
    cardType,
    cards: sortBy(mappingFinancialCards, ['name']),
  };
};

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

export const selectSelectedFilterButton = createSelector(
  makeSelectDomain,
  state => state.selectedFilterButton,
);
