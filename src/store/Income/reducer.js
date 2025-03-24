import { INCOME_RESET_DATA, INCOME_UPDATE_DATA } from 'store/Income/constants';

const initialState = {
  data: null,
};

function incomeReducer(state = initialState, action) {
  switch (action.type) {
    case INCOME_UPDATE_DATA:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload,
        },
      };
    case INCOME_RESET_DATA:
      return initialState;

    default:
      return state;
  }
}

export default incomeReducer;
