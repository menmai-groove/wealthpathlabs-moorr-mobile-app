import { SET_TWO_FA_METHODS } from 'store/Verification/constants';

export const initialState = {
  twoFAMethods: null,
};

export function verificationReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_TWO_FA_METHODS:
      return {
        ...state,
        twoFAMethods: payload,
      };
    default:
      return state;
  }
}
