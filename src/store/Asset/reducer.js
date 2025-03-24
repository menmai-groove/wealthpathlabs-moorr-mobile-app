import { ASSET_RESET_DATA, ASSET_UPDATE_DATA } from 'store/Asset/constants';

const initialState = {
  data: null,
};

function assetReducer(state = initialState, action) {
  switch (action.type) {
    case ASSET_UPDATE_DATA:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload,
        },
      };
    case ASSET_RESET_DATA:
      return initialState;

    default:
      return state;
  }
}

export default assetReducer;
