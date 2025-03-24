/*
 *
 * Reset password reducer
 *
 */

import { UPDATE_RESET_PASSWORD_ERROR } from 'store/ResetPassword/constants';

export const initialState = {
  error: null,
};

function resetPasswordReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_RESET_PASSWORD_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

export default resetPasswordReducer;
