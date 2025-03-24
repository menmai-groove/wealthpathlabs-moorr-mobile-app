import {
  SET_LIST_GOALS,
  SET_LIST_GOALS_YEARS,
  SET_PERSONAL_GOAL,
  SET_UPCOMING_GOAL,
  UPLOAD_FILES_FAILURE,
  UPLOAD_FILES_START,
  UPLOAD_FILES_SUCCESS,
} from './constants';

export const initialState = {
  isFetchedList: false,
  listPersonalGoals: {
    data: [],
    total: 0,
    page: 1,
    limit: 1,
  },
  upcomingGoal: null,
  goalDetail: null,
  uploadFile: {
    loading: false,
    data: null,
  },
  listYears: [],
};

export function personalGoalReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_LIST_GOALS: {
      return { ...state, listPersonalGoals: payload, isFetchedList: true };
    }
    case SET_PERSONAL_GOAL: {
      return { ...state, goalDetail: payload };
    }
    case SET_UPCOMING_GOAL: {
      return { ...state, upcomingGoal: payload };
    }
    case UPLOAD_FILES_START: {
      const uploadFile = { ...state.uploadFile, loading: true };
      return { ...state, uploadFile };
    }
    case UPLOAD_FILES_SUCCESS: {
      const uploadFile = { ...state.uploadFile, loading: false, data: payload };
      return { ...state, uploadFile };
    }
    case UPLOAD_FILES_FAILURE: {
      const uploadFile = { ...state.uploadFile, loading: false };
      return { ...state, uploadFile };
    }
    case SET_LIST_GOALS_YEARS: {
      return { ...state, listYears: payload };
    }

    default:
      return state;
  }
}
