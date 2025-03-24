import { createSelector } from 'reselect';

import { initialState } from './reducer';

export const makeSelectDomain = state => state.resetpassword || initialState;

export const selectResetPasswordError = createSelector(makeSelectDomain, state => state.error);
