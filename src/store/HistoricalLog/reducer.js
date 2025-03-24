import { SET_HISTORICAL_LOG_DATA } from 'store/HistoricalLog/constants';

export const initialState = {
  fetched: false,
  values: undefined,
  ownershipDetails: undefined,
  archiveDates: undefined,
};

export function historicalLogReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_HISTORICAL_LOG_DATA:
      return {
        ...state,
        values: payload.data.values,
        ownershipDetails: payload.data.ownershipDetails,
        archiveDates: payload.data.archiveDates,
        fetched: true,
      };
    default:
      return state;
  }
}
