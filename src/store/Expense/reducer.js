import * as constants from './constants';

const initialState = {
  data: null,
  expenseDetail: null,
  groupExpenses: [],
  relatedAsset: null,
};

function expenseReducer(state = initialState, action) {
  switch (action.type) {
    case constants.SET_EXPENSE_DETAIL:
      return { ...state, expenseDetail: action.payload };
    case constants.EXPENSE_SET_GROUP_DATA:
      return { ...state, groupExpenses: action.payload };
    case constants.EXPENSE_SET_RELATED_ASSET:
      return { ...state, relatedAsset: action.payload };
    default:
      return state;
  }
}

export default expenseReducer;
