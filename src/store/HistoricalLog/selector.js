import { orderBy } from 'lodash';
import moment from 'moment';
import { createSelector } from 'reselect';

import { initialState } from './reducer';

export const makeSelectHistoricalLogDomain = state => state.historicalLog || initialState;

export const selectHistoricalLogFetched = createSelector(
  makeSelectHistoricalLogDomain,
  state => state.fetched,
);
export const selectOwnershipDetails = createSelector(
  makeSelectHistoricalLogDomain,
  state => state.ownershipDetails,
);
export const selectValues = createSelector(makeSelectHistoricalLogDomain, state => {
  let result = state.values?.reduce((arr, item) => {
    let itemExisted = arr.find(x => x.asAt === item.asAt);
    if (!itemExisted) {
      let data = { ...item, values: item.stringValue ? [item.stringValue] : [] };
      data.numberValues = {};
      data.numberValues[item.field] = item.numberValue ?? 0;
      arr.push(data);
    } else {
      if (item.stringValue) {
        itemExisted.values.push(item.stringValue);
        itemExisted.values.sort();
      }
      itemExisted.numberValues[item.field] = item.numberValue ?? 0;
    }
    return arr;
  }, []);
  let data = result?.map(value => {
    return {
      ...value,
      stringValues: value.values,
      ownershipDetail: state.ownershipDetails?.find(x => x._id === value.ownershipId),
    };
  });
  if (state?.archiveDates) {
    let result2 = state.archiveDates
      .reduce((arr, item) => {
        let itemExisted = arr.find(x => x.asAt === item.asAt && item.actionType === x.actionType);
        if (!itemExisted) {
          arr.push({ ...item, values: [], numberValues: {} });
        }
        return arr;
      }, [])
      .map(value => {
        return {
          ...value,
          stringValues: value.values,
          ownershipDetail: state.ownershipDetails?.find(x => x._id === value.ownershipId),
        };
      });
    data = [...data, ...result2];
  }
  data = orderBy(data, ['asAt', 'index'], 'desc');
  if (data.some(f => f.field === 'annualDepreciationAmount')) {
    data = data.map(item => {
      if (item.actionType !== 'archive' && item.actionType !== 'restore') {
        item.asAt = moment(item.asAt).add(1, 'y').toDate();
      }
      return item;
    });
  }
  return data;
});

export const selectOriginValues = createSelector(
  makeSelectHistoricalLogDomain,
  state => state.values,
);
