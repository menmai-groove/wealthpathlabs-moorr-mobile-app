import { createSelector } from 'reselect';
import { initialState } from 'store/Verification/reducer';

export const makeSelectDomain = state => state.verification || initialState;

export const selectTwoFAMethods = createSelector(makeSelectDomain, state => {
  return state.twoFAMethods;
});
