import {
  CLEAR_INDUSTRY_SEARCH_DATA,
  GET_INDUSTRY_CLASS_DATA,
  GET_INDUSTRY_DATA,
  GET_INDUSTRY_DIVISION_DATA,
  SET_INDUSTRY_CLASS_DATA,
  SET_INDUSTRY_DIVISION_DATA,
  SET_INDUSTRY_SEARCH_DATA,
} from 'store/Industry/constants';

export const getIndustryData = data => ({
  type: GET_INDUSTRY_DATA,
  payload: data,
});

export const clearIndustrySearchData = () => ({
  type: CLEAR_INDUSTRY_SEARCH_DATA,
  payload: {},
});

export const setIndustrySearchData = data => ({
  type: SET_INDUSTRY_SEARCH_DATA,
  payload: { data },
});

export const getIndustryDivisionsData = () => ({
  type: GET_INDUSTRY_DIVISION_DATA,
});

export const setIndustryDivisionsData = data => ({
  type: SET_INDUSTRY_DIVISION_DATA,
  payload: { data },
});

export const getIndustryClassesData = data => ({
  type: GET_INDUSTRY_CLASS_DATA,
  payload: data,
});

export const setIndustryClassesData = data => ({
  type: SET_INDUSTRY_CLASS_DATA,
  payload: { data },
});
