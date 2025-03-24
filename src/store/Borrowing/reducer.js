import { BORROWING_SET_ASSETS, BORROWING_UPDATE_DATA } from 'store/Borrowing/constants';

const initialState = {
  data: {
    type: '',
    mortgageType: '',
    name: '',
    ownership: [],
    details: null,
  },
  assets: {},
  fetchedData: false,
};

function incomeReducer(state = initialState, action) {
  switch (action.type) {
    case BORROWING_UPDATE_DATA:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload,
        },
      };
    case BORROWING_SET_ASSETS:
      return {
        ...state,
        assets: action.payload,
        fetchedData: true,
      };
    default:
      return state;
  }
}

export default incomeReducer;
