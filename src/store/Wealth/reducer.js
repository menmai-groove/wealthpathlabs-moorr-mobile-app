import { GET_WEALTH_SPEED_SUCCESS, SET_INDEX, SET_WEALTH_SPEED_DATA } from 'store/Wealth/constants';

export const initialState = {
  wealthSpeedData: null,
  loading: true,
  index: 0,
};

function wealthReducer(state = initialState, action) {
  switch (action.type) {
    case SET_WEALTH_SPEED_DATA:
      return {
        ...state,
        wealthSpeedData: action.payload.wealthSpeedData,
        loading: false,
      };
    case GET_WEALTH_SPEED_SUCCESS:
      return {
        ...state,
        loading: false,
      };
    case SET_INDEX:
      return {
        ...state,
        index: action.payload.index,
      };

    default:
      return state;
  }
}

export default wealthReducer;
