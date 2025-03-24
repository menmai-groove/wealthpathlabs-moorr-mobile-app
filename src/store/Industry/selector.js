import { isEmpty, sortBy } from 'lodash';
import { createSelector } from 'reselect';
import { initialState } from 'store/Income/reducer';

export const makeSelectDomain = state => state.industry || initialState;

export const selectTotalPageIndustry = createSelector(
  makeSelectDomain,
  state => state?.search?.totalPages || 0,
);

export const selectPageIndustry = createSelector(
  makeSelectDomain,
  state => state?.search?.page || 0,
);
export const selectListSearchIndustry = createSelector(makeSelectDomain, state => {
  let data = state?.search?.list;
  if (isEmpty(data)) {
    return [];
  }
  return [...data].map(x => ({ ...x, title: x.label }));
});

export const selectIndustryDivisions = createSelector(makeSelectDomain, state => {
  let data = state?.divisions;
  if (isEmpty(data)) {
    return [];
  }
  return sortBy(
    [...data].map(x => ({ ...x, display: x.label })),
    ['display'],
  );
});

export const selectIndustryClasses = createSelector(makeSelectDomain, state => {
  let data = state?.classes;
  if (isEmpty(data)) {
    return [];
  }
  return sortBy(
    [...data].map(x => ({ ...x, display: x.label })),
    ['display'],
  );
});
