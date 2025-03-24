import { createSelector } from 'reselect';

import { initialState } from './reducer';

export const makeSelectDomain = state => state.notification || initialState;

export const selectNotification = createSelector(makeSelectDomain, state => state.notifications);

export const selectFetchedDataNotification = createSelector(
  makeSelectDomain,
  state => state.fetchedData,
);
export const selectNotificationPage = createSelector(makeSelectDomain, state => state.pageIndex);
export const selectIsFullData = createSelector(makeSelectDomain, state => state.isFullData);

export const selectTotalBadge = createSelector(makeSelectDomain, state => state.totalBadge);
