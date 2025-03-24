import { createSelector } from 'reselect';

import { initialState } from './reducer';

export const makeSelectDomain = state => state.signUp || initialState;

export const selectSignUpData = createSelector(makeSelectDomain, state => state.data);

export const selectSignUpExistedStatus = createSelector(makeSelectDomain, state => {
  return state.error;
});
