import {
  CLEAR_INDUSTRY_SEARCH_DATA,
  SET_INDUSTRY_CLASS_DATA,
  SET_INDUSTRY_DIVISION_DATA,
  SET_INDUSTRY_SEARCH_DATA,
} from 'store/Industry/constants';

const initialState = {
  divisions: [],
  classes: [],
  search: {
    list: [],
    totalPages: 0,
    limit: 0,
    page: 0,
  },
};

function incomeReducer(state = initialState, action) {
  switch (action.type) {
    case SET_INDUSTRY_SEARCH_DATA:
      return {
        ...state,
        search: {
          ...state.search,
          ...action.payload?.data,
        },
      };
    case CLEAR_INDUSTRY_SEARCH_DATA:
      return {
        ...state,
        search: initialState.search,
        classes: [],
      };
    case SET_INDUSTRY_DIVISION_DATA:
      return {
        ...state,
        divisions: action.payload.data,
      };

    case SET_INDUSTRY_CLASS_DATA:
      return {
        ...state,
        classes: action.payload.data,
      };

    default:
      return state;
  }
}

export default incomeReducer;
