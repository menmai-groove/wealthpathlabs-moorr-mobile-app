// import { UtilLib } from 'libs';
import { get, isNil, last } from 'lodash';
import { createSelector } from 'reselect';
import { initialState } from 'store/Home/reducer';

export const makeSelectHomeDomain = state => state.home || initialState;

export const selectHomeRendered = state => !isNil(state.home);

export const selectFeedbackReview = createSelector(
  makeSelectHomeDomain,
  state => state.feedbackReview,
);

export const selectShowReviewPrompt = createSelector(
  makeSelectHomeDomain,
  state => state.showReviewPrompt,
);

export const selectHomeDashboard = createSelector(makeSelectHomeDomain, home => {
  const allLoaded = get(home, ['allLoaded']) || false;
  const expenses = {
    monthly: get(home, ['expenses', 'monthly']) || { total: 0, breakdown: [] },
  };
  // const income = {
  //   monthly: get(home, ['income', 'monthly']) || { total: 0, breakdown: [] },
  // };
  // const assets = {
  //   monthly: get(home, ['assets', 'monthly']) || { total: 0, breakdown: [] },
  // };
  // const borrowings = {
  //   monthly: get(home, ['borrowings', 'monthly']) || { total: 0, breakdown: [] },
  // };
  // const netWorths = {
  //   monthly: {
  //     total: get(assets, ['monthly', 'total']) - get(borrowings, ['monthly', 'total']),
  //     breakdown: [
  //       {
  //         label: 'Assets',
  //         value: get(assets, ['monthly', 'total']),
  //         color: UtilLib.getColorByIndex(0),
  //       },
  //       {
  //         label: 'Borrowings',
  //         value: get(borrowings, ['monthly', 'total']),
  //         color: UtilLib.getColorByIndex(1),
  //       },
  //     ],
  //   },
  // };
  // const cashflowIncome = {
  //   monthly: get(income, ['monthly', 'total']) || 0,
  // };
  // const cashflowExpense = {
  //   monthly: get(expenses, ['monthly', 'total']) || 0,
  // };
  return {
    allLoaded,
    expenses,
    // cashflowIncome,
    // cashflowExpense,
    // income,
    // assets,
    // borrowings,
    // netWorths,
  };
});

export const selectShowOnLoginOnce = createSelector(
  makeSelectHomeDomain,
  state => state.showOnLoginOnce,
);

export const selectCashPosition = createSelector(makeSelectHomeDomain, state => {
  return state.cashPosition;
});
export const selectCashPositionValue = createSelector(selectCashPosition, list => {
  return last(list)?.value || 0;
});

export const selectAssetPosition = createSelector(makeSelectHomeDomain, state => {
  return state.assetPosition;
});
export const selectAssetPositionValue = createSelector(selectAssetPosition, list => {
  return last(list)?.value || 0;
});

export const selectDebtPosition = createSelector(makeSelectHomeDomain, state => {
  return state.debtPosition?.map(item => ({
    ...item,
    value: Math.abs(item.value),
  }));
});
export const selectDebtPositionValue = createSelector(selectDebtPosition, list => {
  return last(list)?.value || 0;
});

export const selectNetWorth = createSelector(makeSelectHomeDomain, state => {
  return state.netWorth;
});
export const selectNetWorthValue = createSelector(selectNetWorth, list => {
  return last(list)?.value || 0;
});
