import { createSelector } from 'reselect';
import { initialState } from 'store/OnBoardingInterview/reducer';

export const makeSelectDomain = state => state.onBoardingInterview || initialState;

export const selectProgress = createSelector(makeSelectDomain, state => state.progress);

export const selectCurrentStep = createSelector(makeSelectDomain, state => state.currentStep);

export const selectTotalStep = createSelector(makeSelectDomain, state => state.totalStep);

export const selectOnboardingInterviewData = createSelector(makeSelectDomain, state => state.data);

export const selectAskingNameData = createSelector(
  makeSelectDomain,
  state => state.data?.askingName,
);

export const selectHouseholdData = createSelector(makeSelectDomain, state => state.data?.household);

export const selectAssets = createSelector(makeSelectDomain, state => state.data?.assets);

export const selectBorrowings = createSelector(makeSelectDomain, state => state.data?.borrowings);

export const selectIncomes = createSelector(makeSelectDomain, state => state.data?.incomes);

export const selectSpending = createSelector(makeSelectDomain, state => state.data?.spendings);
