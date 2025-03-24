import { AppConstants } from 'constant';
import { get, map } from 'lodash';
import { createSelector } from 'reselect';
import { initialState } from 'store/Borrowing/reducer';

export const makeSelectDomain = state => state.borrowing || initialState;

export const selectBorrowingType = createSelector(makeSelectDomain, state => state.data?.type);

export const selectBorrowingName = createSelector(makeSelectDomain, state => state.data?.name);
export const selectBorrowingMortgageType = createSelector(
  makeSelectDomain,
  state => state.data?.mortgageType,
);
export const selectBorrowingOwnership = createSelector(
  makeSelectDomain,
  state => state.data?.ownership,
);

export const selectActiveAssets = createSelector(makeSelectDomain, state => {
  const properties = map(get(state, ['assets', 'properties']) ?? [], x => ({
    display: x.name,
    value: x._id,
    id: x._id,
    assetType: AppConstants.AssetType.Property,
  }));
  const investments = map(get(state, ['assets', 'investments']) ?? [], x => ({
    display: x.name,
    value: x._id,
    id: x._id,
    assetType: AppConstants.AssetType.Investments,
  }));
  const vehicles = map(get(state, ['assets', 'vehicles']) ?? [], x => ({
    display: x.name,
    value: x._id,
    id: x._id,
    assetType: AppConstants.AssetType.Vehicles,
  }));
  return [...properties, ...vehicles, ...investments];
});

export const selectBorrowingDetails = createSelector(
  makeSelectDomain,
  state => state.data?.details,
);
export const selectFetchedData = createSelector(makeSelectDomain, state => state.fetchedData);
