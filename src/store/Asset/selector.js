import { createSelector } from 'reselect';
import { initialState } from 'store/Asset/reducer';

export const makeSelectDomain = state => state.asset || initialState;

export const selectAssetId = createSelector(makeSelectDomain, state => state.data?._id);

export const selectAssetType = createSelector(makeSelectDomain, state => state.data?.type);

export const selectAssetOwnershipStructure = createSelector(
  makeSelectDomain,
  state => state.data?.ownershipStructure,
);

export const selectAssetName = createSelector(makeSelectDomain, state => state.data?.name);

export const selectAssetOwnership = createSelector(
  makeSelectDomain,
  state => state.data?.ownership,
);

export const selectAssetPurpose = createSelector(
  makeSelectDomain,
  state => state.data?.purpose?.value,
);

export const selectData = createSelector(makeSelectDomain, state => state.data);
