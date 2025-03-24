import { AppConstants } from 'constant';
import { GlobalLib, SagaLib } from 'libs';
import { get, isArray, isEmpty, isNil, isObject } from 'lodash';
import { all, put, putResolve, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { RECORD_TYPE } from 'screens/HistoricalLog';
import { selectOwnersWithOthers } from 'store/Auth/selector';
import * as expenseActions from 'store/ExpenseDashboard/action';
import * as financialActions from 'store/FinancialDashboard/action';
import { getHistoricalLogData, setHistoricalLogData } from 'store/HistoricalLog/action';
import {
  ADD_HISTORICAL_LOG,
  DELETE_HISTORICAL_LOG,
  GET_HISTORICAL_LOG_DATA,
} from 'store/HistoricalLog/constants';
import {
  ADD_HISTORICAL_LOG_NUMBER_FREQUENCY_MUTATION,
  ADD_HISTORICAL_LOG_NUMBER_MUTATION,
  ADD_HISTORICAL_LOG_OBJECT_IDS_MUTATION,
  ADD_HISTORICAL_LOG_OWNERSHIP_MUTATION,
  ADD_HISTORICAL_LOG_STRING_MUTATION,
  DELETE_HISTORICAL_LOG_QUERY,
  GET_HISTORICAL_LOG,
} from 'store/HistoricalLog/query';
import { syncFinancialData } from 'store/Home/action';
import { getWealthSpeedData } from 'store/Wealth/action';

export function* getHistoricalLogSaga(action = {}) {
  const { payload = {}, resolver = {} } = action;
  try {
    const cardId = get(payload, 'data.cardId');
    const childCardId = get(payload, 'data.childCardId');
    const field = get(payload, 'data.field');
    let values = [],
      archiveDates = [],
      ownershipDetails = [];
    if (isArray(field)) {
      for (let index = 0; index < field.length; index++) {
        const fieldName = field[index];
        const variables = {
          cardId,
          childCardId,
          field: fieldName,
          sortOrder: -1,
          excludeArchive: true,
        };
        const responses = yield SagaLib.queryCall(GET_HISTORICAL_LOG, variables);
        const historicalLogValues = get(responses, 'data.me.historicalTracking.getValues');
        values = values.concat(get(historicalLogValues, 'values'));
        ownershipDetails = ownershipDetails.concat(get(historicalLogValues, 'ownershipDetails'));
        const historicalLogArchiveDates = get(responses, 'data.me.historicalTracking.archiveDates');
        archiveDates = archiveDates.concat(get(historicalLogArchiveDates, 'values'));
      }
    } else {
      const variables = {
        cardId,
        childCardId,
        field,
        sortOrder: -1,
        excludeArchive: true,
      };
      const responses = yield SagaLib.queryCall(GET_HISTORICAL_LOG, variables);
      const historicalLogValues = get(responses, 'data.me.historicalTracking.getValues');
      values = get(historicalLogValues, 'values');
      ownershipDetails = get(historicalLogValues, 'ownershipDetails');
      const historicalLogArchiveDates = get(responses, 'data.me.historicalTracking.archiveDates');
      archiveDates = get(historicalLogArchiveDates, 'values');
    }
    const historicalLogData = {
      values,
      ownershipDetails,
      archiveDates,
    };
    yield all([putResolve(setHistoricalLogData(historicalLogData))]);
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
  }
}

function* addHistoricalLogSaga(action) {
  const { payload = {}, resolver = {} } = action;
  const loadingView = GlobalLib.Loading.get();
  try {
    loadingView.show();
    const recordType = get(payload, 'data.recordType');
    const cardId = get(payload, 'data.cardId');
    const field = get(payload, 'data.field');
    const childCardId = get(payload, 'data.childCardId');
    const fieldId = get(payload, 'data.fieldId');
    const asAt = get(payload, 'data.asAt');
    let variables;
    let response;
    switch (recordType) {
      case RECORD_TYPE.NUMBER: {
        if (isArray(field)) {
          const data = get(payload, 'data');
          let result = false;
          for (let index = 0; index < field.length; index++) {
            const fieldName = field[index];
            let value = data[fieldName] ? Number(data[fieldName]) : 0;
            // Interest rate
            if (data.interestRate) {
              value = data.interestRate[fieldName] ? Number(data.interestRate[fieldName]) : 0;
            }
            variables = {
              cardId,
              childCardId,
              field: fieldName,
              asAt,
              value,
            };
            const _response = yield SagaLib.mutationCall(
              ADD_HISTORICAL_LOG_NUMBER_MUTATION,
              variables,
            );
            if (!result) {
              result = get(_response, 'data.me.historicalTracking.addNumber.success');
            }
          }
          if (result) {
            yield put(getHistoricalLogData({ cardId, childCardId, field }));
          }
        } else {
          const amount = get(payload, 'data.amount');

          variables = {
            cardId,
            field,
            childCardId,
            asAt,
            value: isObject(amount) ? Number(amount.value) : Number(amount),
          };
          response = yield SagaLib.mutationCall(ADD_HISTORICAL_LOG_NUMBER_MUTATION, variables);
          const result = get(response, 'data.me.historicalTracking.addNumber.success');
          if (result) {
            const data = {
              cardId,
              childCardId,
              field,
            };
            yield put(getHistoricalLogData(data));
          }
        }
        break;
      }
      case RECORD_TYPE.NUMBER_WITH_FREQUENCY: {
        const amount = get(payload, 'data.amount');
        const frequency = get(payload, 'data.frequency.value');
        let result = false;
        if (isArray(field) && field[0] === 'essentialAmount') {
          const data = get(payload, 'data');
          for (let index = 0; index < field.length; index++) {
            const fieldName = field[index];
            let value = data[fieldName] ? Number(data[fieldName]) : 0;
            variables = {
              cardId,
              childCardId,
              field: fieldName,
              asAt,
              value,
              frequencyName: frequency,
            };
            const _response = yield SagaLib.mutationCall(
              ADD_HISTORICAL_LOG_NUMBER_MUTATION,
              variables,
            );
            if (!result) {
              result = get(_response, 'data.me.historicalTracking.addNumber.success');
            }
          }
        } else {
          variables = {
            cardId,
            field,
            childCardId,
            asAt,
            value: Number(amount),
            frequencyName: frequency,
          };
          response = yield SagaLib.mutationCall(
            ADD_HISTORICAL_LOG_NUMBER_FREQUENCY_MUTATION,
            variables,
          );
          result = get(response, 'data.me.historicalTracking.addNumber.success');
        }
        if (result) {
          const data = {
            cardId,
            field,
            childCardId,
          };
          yield put(getHistoricalLogData(data));
        }
        break;
      }
      case RECORD_TYPE.STRING: {
        const value = get(payload, 'data.value.value');
        variables = {
          cardId,
          field,
          childCardId,
          asAt,
          value: String(value),
        };
        response = yield SagaLib.mutationCall(ADD_HISTORICAL_LOG_STRING_MUTATION, variables);
        const result = get(response, 'data.me.historicalTracking.addString.success');
        if (result) {
          const data = {
            cardId,
            childCardId,
            field,
          };
          yield put(getHistoricalLogData(data));
        }
        break;
      }
      case RECORD_TYPE.OWNERSHIP: {
        const owners = yield select(selectOwnersWithOthers);
        const value = get(payload, 'data');
        const formOwner = value.ownership;
        if (
          formOwner.display === AppConstants.ownershipType.Joint ||
          formOwner.display === AppConstants.ownershipType.Other
        ) {
          formOwner.owners = formOwner.owners.map(owner => {
            if (owners[0]?.value === owner.owner) {
              owner.percentage = isNil(value.ownershipSplitPerson1)
                ? 0
                : parseFloat(value.ownershipSplitPerson1);
            } else if (owners[1]?.value === owner.owner) {
              owner.percentage = isNil(value.ownershipSplitPerson2)
                ? 0
                : parseFloat(value.ownershipSplitPerson2);
            }
            return owner;
          });
        }

        variables = {
          cardId,
          childCardId,
          field,
          asAt,
          value: {
            ownershipType: formOwner.ownershipType,
            owners: formOwner.owners,
          },
        };
        response = yield SagaLib.mutationCall(ADD_HISTORICAL_LOG_OWNERSHIP_MUTATION, variables);
        const result = get(response, 'data.me.historicalTracking.addOwnership.success');
        if (result) {
          const data = {
            cardId,
            childCardId,
            field,
          };
          yield put(getHistoricalLogData(data));
        }
        break;
      }
      case RECORD_TYPE.OBJECT_IDS: {
        const data = get(payload, 'data');

        if (isArray(field)) {
          let result = false;
          for (let index = 0; index < field.length; index++) {
            const fieldName = field[index];
            let values = [];
            if (data.securedAgainst) {
              values = data.securedAgainst.filter(x => {
                if (fieldName === 'securedAgainstVehicles') {
                  return x.assetType === AppConstants.AssetType.Vehicles;
                }
                if (fieldName === 'securedAgainstProperties') {
                  return x.assetType === AppConstants.AssetType.Property;
                }
                if (fieldName === 'securedAgainstInvestments') {
                  return x.assetType === AppConstants.AssetType.Investments;
                }
              });
            }
            if (data.properties) {
              values = data.properties.filter(x => {
                if (fieldName === 'vehicles') {
                  return x.assetType === AppConstants.AssetType.Vehicles;
                }
                if (fieldName === 'properties') {
                  return x.assetType === AppConstants.AssetType.Property;
                }
                if (fieldName === 'investments') {
                  return x.assetType === AppConstants.AssetType.Investments;
                }
              });
            }
            variables = {
              cardId,
              childCardId,
              field: fieldName,
              asAt,
              values: values?.map(x => x.value) ?? [],
            };
            const _response = yield SagaLib.mutationCall(
              ADD_HISTORICAL_LOG_OBJECT_IDS_MUTATION,
              variables,
            );
            if (!result) {
              result = get(_response, 'data.me.historicalTracking.addObjectIds.success');
            }
          }
          if (result) {
            yield put(getHistoricalLogData({ cardId, childCardId, field }));
          }
        } else {
          const values = data[fieldId]?.map(x => x.value) ?? [];
          variables = {
            cardId,
            childCardId,
            field,
            asAt,
            values,
          };
          const _response = yield SagaLib.mutationCall(
            ADD_HISTORICAL_LOG_OBJECT_IDS_MUTATION,
            variables,
          );
          const result = get(_response, 'data.me.historicalTracking.addObjectIds.success');
          if (result) {
            yield put(getHistoricalLogData({ cardId, childCardId, field }));
          }
        }
        break;
      }

      case RECORD_TYPE.DEPRECIATION: {
        const data = get(payload, 'data');

        if (isArray(field)) {
          let result = false;
          for (let index = 0; index < field.length; index++) {
            const fieldName = field[index];
            variables = {
              cardId,
              childCardId,
              field: fieldName,
              asAt,
              value: data[fieldName] ? Number(data[fieldName]) : 0,
            };
            const _response = yield SagaLib.mutationCall(
              ADD_HISTORICAL_LOG_NUMBER_MUTATION,
              variables,
            );
            if (!result) {
              result = get(_response, 'data.me.historicalTracking.addNumber.success');
            }
          }
          if (result) {
            yield put(getHistoricalLogData({ cardId, childCardId, field }));
          }
        }
        break;
      }

      default:
        break;
    }

    yield all([
      putResolve(syncFinancialData({ financialDashboard: { loading: true } })),
      putResolve(financialActions.refetchFinancialListData(true, true)),
      putResolve(expenseActions.refetchFinancialListData(true, true)),
      putResolve(getWealthSpeedData({ generate: false })),
    ]);

    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

function* deleteHistoricalLogSaga(action) {
  const { payload = {}, resolver = {} } = action;
  const loadingView = GlobalLib.Loading.get();
  try {
    loadingView.show();
    const cardId = get(payload, 'data.cardId');
    const childCardId = get(payload, 'data.childCardId');
    const field = get(payload, 'data.field');
    const asAt = get(payload, 'data.asAt');
    let result = false;
    if (isArray(field)) {
      for (let index = 0; index < field.length; index++) {
        const fieldName = field[index];
        const variables = {
          cardId,
          childCardId,
          field: fieldName,
          asAt,
        };
        const response = yield SagaLib.queryCall(DELETE_HISTORICAL_LOG_QUERY, variables);
        result = get(response, 'data.me.historicalTracking.delete.success');
      }
    } else {
      const variables = {
        cardId,
        childCardId,
        field,
        asAt,
      };
      const response = yield SagaLib.queryCall(DELETE_HISTORICAL_LOG_QUERY, variables);
      result = get(response, 'data.me.historicalTracking.delete.success');
    }
    if (result) {
      const data = {
        cardId,
        childCardId,
        field,
      };
      yield put(getHistoricalLogData(data));
      yield all([
        putResolve(syncFinancialData({ financialDashboard: { loading: true } })),
        putResolve(financialActions.refetchFinancialListData(true, true)),
        putResolve(expenseActions.refetchFinancialListData(true, true)),
        putResolve(getWealthSpeedData({ generate: false })),
      ]);
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve();
  } catch (error) {
    if (!isEmpty(error?.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

export default function* defaultSaga() {
  yield takeEvery(GET_HISTORICAL_LOG_DATA, getHistoricalLogSaga);
  yield takeLatest(ADD_HISTORICAL_LOG, addHistoricalLogSaga);
  yield takeLatest(DELETE_HISTORICAL_LOG, deleteHistoricalLogSaga);
}
