import { createSelector } from 'reselect';
import { initialState } from 'store/Income/reducer';

export const makeSelectDomain = state => state.income || initialState;

export const selectIncomeType = createSelector(makeSelectDomain, state => state.data?.type);

export const selectIncomeOwnershipStructure = createSelector(
  makeSelectDomain,
  state => state.data?.ownershipStructure,
);

export const selectIncomeName = createSelector(makeSelectDomain, state => state.data?.name);

export const selectIncomeOwnership = createSelector(
  makeSelectDomain,
  state => state.data?.ownership,
);

export const selectDataListPreTax = createSelector(
  makeSelectDomain,
  state => state.data?.listPreTax,
);

export const selectDataForms = createSelector(makeSelectDomain, state => state.data?.forms);

export const selectIncomeDetails = createSelector(makeSelectDomain, state => state.data?.details);
export const selectIncomeAssetDetails = createSelector(
  makeSelectDomain,
  state => state.data?.assetDetails,
);
export const selectLabelIncomeType = createSelector(
  makeSelectDomain,
  state => state.data?.nameType,
);
