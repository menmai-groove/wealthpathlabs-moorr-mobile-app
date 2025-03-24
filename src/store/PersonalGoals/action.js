import {
  CREATE_PERSONAL_GOAL,
  GET_GOALS_UNTIL_YEAR,
  GET_LIST_GOALS,
  GET_PERSONAL_GOAL,
  GET_UPCOMING_GOAL,
  SET_LIST_GOALS,
  SET_LIST_GOALS_YEARS,
  SET_PERSONAL_GOAL,
  SET_UPCOMING_GOAL,
  UPDATE_PERSONAL_GOAL,
  UPLOAD_FILES_FAILURE,
  UPLOAD_FILES_START,
  UPLOAD_FILES_SUCCESS,
} from './constants';

export const getListGoals = payload => ({
  type: GET_LIST_GOALS,
  payload,
});
export const setListGoals = payload => ({
  type: SET_LIST_GOALS,
  payload,
});

export const getPersonalGoal = payload => ({
  type: GET_PERSONAL_GOAL,
  payload,
});
export const setPersonalGoal = payload => ({
  type: SET_PERSONAL_GOAL,
  payload,
});

export const getUpcomingGoal = isRefresh => ({
  type: GET_UPCOMING_GOAL,
  payload: {
    isRefresh,
  },
});
export const setUpcomingGoal = payload => ({
  type: SET_UPCOMING_GOAL,
  payload,
});

export const uploadFiles = payload => ({
  type: UPLOAD_FILES_START,
  payload,
});
export const uploadFilesSuccess = payload => ({
  type: UPLOAD_FILES_SUCCESS,
  payload,
});
export const uploadFilesFail = payload => ({
  type: UPLOAD_FILES_FAILURE,
  payload,
});

export const createPersonalGoal = payload => ({
  type: CREATE_PERSONAL_GOAL,
  payload,
});

export const updatePersonalGoal = payload => ({
  type: UPDATE_PERSONAL_GOAL,
  payload,
});
export const getGoalsUntilYear = payload => ({
  type: GET_GOALS_UNTIL_YEAR,
  payload,
});
export const setListGoalsYears = payload => ({
  type: SET_LIST_GOALS_YEARS,
  payload,
});
