import i18n from 'bootstrap/i18n';
import { AppConstants } from 'constant';
import { AnalyticsLib, GlobalLib, SagaLib, UtilLib } from 'libs';
import { get, isArray, isEmpty, isNil, last, max, uniq } from 'lodash';
import moment from 'moment';
import { all, put, putResolve, select, takeEvery, takeLeading } from 'redux-saga/effects';
import { setAssets, updateData } from 'store/Borrowing/action';
import {
  BORROWING_CALL_API_SAVE_DATA,
  BORROWING_GET_ASSETS,
  BORROWING_GET_DETAIL,
  BORROWING_GET_LINKED_OFFSETS,
} from 'store/Borrowing/constants';
import {
  GET_ASSETS_QUERY,
  GET_DETAIL_BORROWING_QUERY,
  GET_LINKED_OFFSETS_QUERY,
  UPDATE_BORROWING_QUERY,
} from 'store/Borrowing/query';
import { selectBorrowingDetails } from 'store/Borrowing/selector';
import { getDebtPosition } from 'store/DebtPosition/action';
import * as expenseActions from 'store/ExpenseDashboard/action';
import * as financialActions from 'store/FinancialDashboard/action';
import {
  ADD_HISTORICAL_LOG_OBJECT_IDS_MUTATION,
  GET_HISTORICAL_LOG,
} from 'store/HistoricalLog/query';
import { syncFinancialData } from 'store/Home/action';
import { getNetWorth } from 'store/NetWorth/action';
import { getWealthSpeedData } from 'store/Wealth/action';

function* getAssetsSaga() {
  try {
    const response = yield SagaLib.queryCall(GET_ASSETS_QUERY);
    if (response) {
      const dataAssets = get(response, ['data', 'me', 'client', 'smartSearch', 'assets']) || {};
      yield put(setAssets(dataAssets));
    }
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  }
}

function* getBorrower(payload) {
  try {
    const { ownership, ownershipSplitPerson1, ownershipSplitPerson2, borrowerAsAt } = payload;
    const borrowingDetails = yield select(selectBorrowingDetails);
    if (ownership) {
      let newBorrowers = [];
      if (borrowingDetails) {
        const currentOwners = borrowingDetails?.borrower?.owners ?? [];
        ownership.owners?.forEach((x, index) => {
          let percentage = 100;
          if (ownershipSplitPerson1 || ownershipSplitPerson2) {
            percentage =
              index === 0 ? Number(ownershipSplitPerson1) : Number(ownershipSplitPerson2);
          }
          newBorrowers.push({
            _id: AppConstants.newObjectID.replace('1', `owner${index}`),
            owner: x.owner,
            percentage: percentage,
          });
        });
        //Delete owners don't select
        currentOwners.forEach(owner => {
          if (!ownership?.owners?.some(o => o._id === owner._id)) {
            newBorrowers.push({
              _id: owner._id,
              owner: owner.owner,
              percentage: owner.percentage,
              _delete: true,
            });
          }
        });
      } else {
        ownership.owners?.forEach((x, index) => {
          let percentage = 100;
          if (ownershipSplitPerson1 || ownershipSplitPerson2) {
            percentage =
              index === 0 ? Number(ownershipSplitPerson1) : Number(ownershipSplitPerson2);
          }
          newBorrowers.push({
            _id: AppConstants.newObjectID.replace('1', `owner${index}`),
            owner: x.owner,
            percentage: percentage,
          });
        });
      }
      return {
        ownershipType: ownership.ownershipType,
        ownershipDesc: '',
        owners: newBorrowers,
        ownershipAsAt: borrowerAsAt,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

function* getPurposeOfLoan(items) {
  if (!isArray(items)) {
    return {
      properties: null,
      vehicles: null,
      investments: null,
    };
  }

  const borrowingDetails = yield select(selectBorrowingDetails);

  const properties =
    items.filter(p => p.assetType === AppConstants.AssetType.Property).map(p => p.value) ?? [];
  const investments =
    items.filter(p => p.assetType === AppConstants.AssetType.Investments).map(p => p.value) ?? [];
  const vehicles =
    items.filter(p => p.assetType === AppConstants.AssetType.Vehicles).map(p => p.value) ?? [];

  let newProperties = [];
  const currentProperties = borrowingDetails?.properties ?? [];
  currentProperties.forEach(property => {
    if (!properties.some(o => o === property)) {
      newProperties.push(null);
    } else {
      newProperties.push(property);
    }
  });
  properties.forEach(property => {
    if (!currentProperties.some(o => o === property)) {
      newProperties.push(property);
    }
  });

  let newInvestments = [];
  const currentInvestments = borrowingDetails?.investments ?? [];
  currentInvestments.forEach(invest => {
    if (!investments.some(o => o === invest)) {
      newInvestments.push(null);
    } else {
      newInvestments.push(invest);
    }
  });
  investments.forEach(invest => {
    if (!currentInvestments.some(o => o === invest)) {
      newInvestments.push(invest);
    }
  });

  let newVehicles = [];
  const currentVehicles = borrowingDetails?.vehicles ?? [];
  currentVehicles.forEach(vehicle => {
    if (!vehicles.some(o => o === vehicle)) {
      newVehicles.push(null);
    } else {
      newVehicles.push(vehicle);
    }
  });
  vehicles.forEach(invest => {
    if (!currentVehicles.some(o => o === invest)) {
      newVehicles.push(invest);
    }
  });

  return {
    properties: !isEmpty(newProperties) ? newProperties : null,
    vehicles: !isEmpty(newVehicles) ? newVehicles : null,
    investments: !isEmpty(newInvestments) ? newInvestments : null,
  };
}

function* getSecuredAgainst(items = []) {
  if (!isArray(items)) {
    return {
      securedAgainstProperties: null,
      securedAgainstInvestments: null,
      securedAgainstVehicles: null,
    };
  }
  const securedProperties =
    items.filter(p => p.assetType === AppConstants.AssetType.Property).map(p => p.value) ?? [];
  const securedInvestments =
    items.filter(p => p.assetType === AppConstants.AssetType.Investments).map(p => p.value) ?? [];
  const securedVehicles =
    items.filter(p => p.assetType === AppConstants.AssetType.Vehicles).map(p => p.value) ?? [];

  const borrowingDetails = yield select(selectBorrowingDetails);

  let newProperties = [];
  const currentProperties = borrowingDetails?.securedAgainstProperties ?? [];
  currentProperties.forEach(property => {
    if (!securedProperties.some(o => o === property)) {
      newProperties.push(null);
    } else {
      newProperties.push(property);
    }
  });
  securedProperties.forEach(property => {
    if (!currentProperties.some(o => o === property)) {
      newProperties.push(property);
    }
  });

  let newInvestments = [];
  const currentInvestments = borrowingDetails?.securedAgainstInvestments ?? [];
  currentInvestments.forEach(invest => {
    if (!securedInvestments.some(o => o === invest)) {
      newInvestments.push(null);
    } else {
      newInvestments.push(invest);
    }
  });
  securedInvestments.forEach(invest => {
    if (!currentInvestments.some(o => o === invest)) {
      newInvestments.push(invest);
    }
  });

  let newVehicles = [];
  const currentVehicles = borrowingDetails?.securedAgainstVehicles ?? [];
  currentVehicles.forEach(vehicle => {
    if (!securedVehicles.some(o => o === vehicle)) {
      newVehicles.push(null);
    } else {
      newVehicles.push(vehicle);
    }
  });
  securedVehicles.forEach(invest => {
    if (!currentVehicles.some(o => o === invest)) {
      newVehicles.push(invest);
    }
  });

  return {
    securedAgainstProperties: !isEmpty(newProperties) ? newProperties : null,
    securedAgainstInvestments: !isEmpty(newInvestments) ? newInvestments : null,
    securedAgainstVehicles: !isEmpty(newVehicles) ? newVehicles : null,
  };
}

function* getOffsets(items = []) {
  if (!isArray(items)) {
    return [];
  }
  let newOffsets = [];
  const borrowingDetails = yield select(selectBorrowingDetails);

  const currentOffsets = borrowingDetails?.offsets ?? [];
  items.forEach((x, index) => {
    let offset = currentOffsets.find(o => o.offset === x.value);
    if (offset) {
      newOffsets.push({
        _id: offset._id,
        offset: x.value,
      });
    } else {
      newOffsets.push({
        _id: AppConstants.newObjectID.replace('1', `offset_${index}`),
        offset: x.value,
      });
    }
  });
  //Delete offset don't select
  currentOffsets.forEach(offset => {
    if (!items.some(o => o.value === offset.offset)) {
      newOffsets.push({
        _id: offset._id,
        _delete: true,
      });
    }
  });

  return newOffsets;
}

function* saveDataSaga(action) {
  const { payload } = action;
  const resolver = action.resolver || {};
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const borrowingDetails = yield select(selectBorrowingDetails);
    const borrower = yield getBorrower(payload);
    const purposeOfLoanData = yield getPurposeOfLoan(payload.properties);
    const securedAgainstData = yield getSecuredAgainst(payload.securedAgainst);
    let offsets = yield getOffsets(payload.offsetAccount ?? []);
    const isOffset = true;
    if (
      ['Investment Loan - Fixed Rate', 'Home Loan - Fixed Rate'].includes(
        payload.loanType?.value,
      ) &&
      borrowingDetails?.offsets?.length > 0
    ) {
      offsets = yield getOffsets([]);
      payload.offsetsAsAt = UtilLib.dateUTCAsAt(Date.now());
    }
    const listRemoveOffsets = payload?.removeOffset?.filter(x => x.update === true) ?? [];

    if (listRemoveOffsets.length > 0) {
      const removeOffset = {
        page: AppConstants.ClientHistoryQuery.Borrowings,
        borrowings: listRemoveOffsets,
      };
      // Modify historical tracking
      for (let index = 0; index < removeOffset.borrowings.length; index++) {
        const b = removeOffset.borrowings[index];
        // get list historical
        const variables = {
          cardId: b._id,
          field: 'offsets',
          childCardId: null,
          sortOrder: -1,
          excludeArchive: true,
        };
        const responses = yield SagaLib.queryCall(GET_HISTORICAL_LOG, variables);

        // Get the offsets before this asat date
        const historicalLogValues = get(responses, 'data.me.historicalTracking.getValues');
        const values = get(historicalLogValues, 'values');
        let minDate = b.offsetsAsAt;
        const list = values.filter(
          x =>
            moment(x.asAt).isSameOrBefore(b.offsetsAsAt) &&
            x.updateType !== 'archive' &&
            x.updateType !== 'restore',
        );
        if (list.length > 0) {
          minDate = max(list.map(x => x.asAt));
        }
        const valueFiltered = values.filter(x => x.asAt === minDate).map(x => x.stringValue);
        valueFiltered.push(b.offsets[0].offset);
        const historical = {
          cardId: b._id,
          field: 'offsets',
          childCardId: null,
          asAt: b.offsetsAsAt,
          values: uniq(valueFiltered),
        };
        yield SagaLib.mutationCall(ADD_HISTORICAL_LOG_OBJECT_IDS_MUTATION, historical);

        //Handle add record at current date
        const historicalForCurrentDate = {
          cardId: b._id,
          field: 'offsets',
          childCardId: null,
          asAt: moment(b.offsetsAsAt).add(1, 'day').toDate().toISOString(),
          values: uniq(valueFiltered).filter(x => x !== b.offsets[0].offset),
        };
        yield SagaLib.mutationCall(
          ADD_HISTORICAL_LOG_OBJECT_IDS_MUTATION,
          historicalForCurrentDate,
        );

        const listAfterAsAt = values.filter(
          x =>
            moment(x.asAt).isAfter(b.offsetsAsAt) &&
            x.updateType !== 'archire' &&
            x.updateType !== 'restore',
        );
        if (listAfterAsAt.length > 0) {
          const listDate = {};
          listAfterAsAt.forEach(x => {
            if (listDate[x.asAt] == null) {
              listDate[x.asAt] = [];
            }
            if (x.stringValue != null) {
              listDate[x.asAt].push(x.stringValue);
            }
          });
          for (let record = 0; record < Object.keys(listDate).length; record++) {
            const key = Object.keys(listDate)[record];
            const _v = listDate[key].filter(x => x !== b.offsets[0].offset) ?? [];
            // Remove offset on historical from asat date to latest
            const _historical = {
              cardId: b._id,
              field: 'offsets',
              childCardId: null,
              asAt: key,
              values: _v,
            };
            yield SagaLib.mutationCall(ADD_HISTORICAL_LOG_OBJECT_IDS_MUTATION, _historical);
          }
        }
      }
    } else {
    }
    if (payload?.removeOffset?.length > 0) {
      const listOffsetsNotUpdate = payload?.removeOffset?.filter(x => x.update === false) ?? [];
      if (listOffsetsNotUpdate.length > 0) {
        offsets = offsets?.filter(x => !listOffsetsNotUpdate.some(o => o.offsetId === x.offset));
      }
    }

    const data = {
      page: AppConstants.ClientHistoryQuery.Borrowings,
      borrowings: [
        {
          _id: borrowingDetails ? borrowingDetails._id : AppConstants.newObjectID,
          name: payload.cardName,
          outstanding: !UtilLib.checkEmptyButNotZero(payload.outstandingBalance)
            ? Number(payload.outstandingBalance)
            : null,
          borrower: borrower,
          primaryPurpose: payload.primaryPurpose?.value,
          type: payload.loanType?.value,
          provider: payload.provider?.value,
          otherProvider: payload.otherProvider,
          accountNumber: payload.accountNumber,
          // isOffset: isNil(payload.isOffsetAccount) ? null : payload.isOffsetAccount,
          isOffset,
          offsets: isOffset ? offsets : null,
          originalAmount: !UtilLib.checkEmptyButNotZero(payload.originalAmount)
            ? Number(payload.originalAmount)
            : null,
          startDate: payload.loanStartDate,
          term: !isNil(payload.term) ? Number(payload.term.value) : null,
          expiryDate: payload.loanExpiryDate,
          fixedTerm: !isNil(payload.fixedTerm) ? Number(payload.fixedTerm.value) : null,
          fixedRateEndDate: payload.fixedRateEndDate,
          limit: !UtilLib.checkEmptyButNotZero(payload.limit) ? Number(payload.limit) : null,
          upfrontFees: !UtilLib.checkEmptyButNotZero(payload.upfrontFees)
            ? Number(payload.upfrontFees)
            : null,
          LMIBool: isNil(payload.isLMI) ? null : payload.isLMI,
          LMI: payload.isLMI ? (!isNil(payload.LMI) ? Number(payload.LMI) : null) : null,
          interestRate: !UtilLib.checkEmptyButNotZero(payload.interestRate?.interestRate)
            ? Number(payload.interestRate?.interestRate)
            : null,
          baseRate: !UtilLib.checkEmptyButNotZero(payload.interestRate?.baseRate)
            ? Number(payload.interestRate?.baseRate)
            : null,
          discountRate: !UtilLib.checkEmptyButNotZero(payload.interestRate?.discountRate)
            ? Number(payload.interestRate?.discountRate)
            : null,
          interestOnlyExpiryDate: payload.interestOnlyExpiryDate,
          repaymentType: payload.repaymentType?.value,
          repayment: !UtilLib.checkEmptyButNotZero(payload.repaymentAmount)
            ? Number(payload.repaymentAmount)
            : null,
          repaymentFreq: payload.frequency?.value,
          paymentAccount: payload.paymentAccount?.value,
          isAutoPaymentSweep: payload.autosweep || null,
          loanFees: !UtilLib.checkEmptyButNotZero(payload.loanFees)
            ? Number(payload.loanFees)
            : null,
          loanFeesFrequency: payload.loanFeesFrequency?.value,
          ongoingPaymentAccount: payload.paymentAccountOngoingCost?.value,
          addlInfo: payload.note,
          ...purposeOfLoanData,
          ...securedAgainstData,

          // borrowerAsAt: payload.borrowerAsAt || null,
          interestRateAsAt: payload.interestRateAsAt || null,
          loanFeesAsAt: payload.loanFeesAsAt || null,
          outstandingAsAt: payload.outstandingAsAt || null,
          repaymentAsAt: payload.repaymentAsAt || null,
          repaymentTypeAsAt: payload.repaymentTypeAsAt || null,
          securedAgainstAsAt: payload.securedAgainstAsAt || null,
          limitAsAt: payload.limitAsAt || null,
          offsetsAsAt: payload.offsetsAsAt || null,
          purposeAsAt: payload.purposeAsAt || null,
          typeAsAt: payload.typeAsAt || null,
          otherBorrowerPercentage: !UtilLib.checkEmptyButNotZero(payload.otherBorrowerPercentage)
            ? Number(payload.otherBorrowerPercentage)
            : null,
          isTrackedInMoneySmarts: payload.isTrackedInMoneySmarts?.value ?? null,
          isTrackedInMoneySmartsAsAt: payload.isTrackedInMoneySmartsAsAt ?? null,
          nextRepaymentDateStart: payload.nextRepaymentDate
            ? UtilLib.dateUTCAsAt(payload.nextRepaymentDate)
            : null,
        },
      ],
    };
    const response = yield SagaLib.mutationCall(UPDATE_BORROWING_QUERY, {
      data,
    });
    if (response) {
      const cardId = borrowingDetails
        ? borrowingDetails._id
        : last(get(response, ['data', 'me', 'client', 'update', 'borrowings']))?._id;
      const _listRemoveOffsets = payload?.removeOffset?.filter(x => x.update === true) ?? [];
      if (_listRemoveOffsets?.length > 0) {
        for (let index = 0; index < _listRemoveOffsets.length; index++) {
          const b = payload.removeOffset[index];
          const newAsAtDate = moment(b.offsetsAsAt).add(1, 'day').toDate();
          // Modify historical tracking for current borrowing
          const variables = {
            cardId: cardId,
            field: 'offsets',
            childCardId: null,
            sortOrder: -1,
            excludeArchive: true,
          };
          const responseHistorical = yield SagaLib.queryCall(GET_HISTORICAL_LOG, variables);
          const historicalLogValues = get(
            responseHistorical,
            'data.me.historicalTracking.getValues',
          );
          const _values = get(historicalLogValues, 'values');
          let valueFiltered = _values
            .filter(x => moment(x.asAt).isSame(moment(newAsAtDate)))
            .map(x => x.stringValue);
          valueFiltered.push(b.offsets[0].offset);
          const historical = {
            cardId: cardId,
            field: 'offsets',
            childCardId: null,
            asAt: newAsAtDate.toISOString(),
            values: uniq(valueFiltered),
          };
          yield SagaLib.mutationCall(ADD_HISTORICAL_LOG_OBJECT_IDS_MUTATION, historical);
        }
      }

      //reload data financial dashboard
      yield all([
        putResolve(syncFinancialData({ financialDashboard: { loading: true } })),
        putResolve(financialActions.refetchFinancialListData(true, true)),
        putResolve(expenseActions.refetchFinancialListData(true, true)),
        putResolve(getWealthSpeedData({ generate: false })),
      ]);
      yield all([putResolve(getNetWorth(true)), putResolve(getDebtPosition(true))]);
      const type = i18n.t('cardType.borrowing');
      let message = i18n.t(
        isEmpty(borrowingDetails) ? 'successMsg.addCard' : 'successMsg.editCard',
        {
          cardType: type,
          name: payload.cardName || '',
        },
      );
      GlobalLib.Toast.get().toastSuccess(message);
      if (isEmpty(borrowingDetails)) {
        const parameters = {
          category: AppConstants.cardCategory.Borrowing,
          item_type: payload.loanType?.value,
          name: payload.cardName,
          card_id: cardId,
        };
        AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.userCardCreate, parameters);
      }
      typeof resolver?.resolve === 'function' && resolver?.resolve(response);
    }
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } finally {
    loadingView.hide();
  }
}

function* getDetails(action) {
  const { payload, resolver = {} } = action;
  try {
    const response = yield SagaLib.queryCall(GET_DETAIL_BORROWING_QUERY, { ids: payload.id });
    if (response) {
      const data = get(response, ['data', 'me', 'client', 'borrowings']) || [];
      if (data.length > 0) {
        yield put(updateData({ details: data[0] }));
      }
    }
    typeof resolver?.resolve === 'function' && resolver?.resolve(response);
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  }
}

function* getLinkedOffsets(action) {
  const { resolver = {} } = action;
  try {
    const response = yield SagaLib.queryCall(GET_LINKED_OFFSETS_QUERY);
    if (response) {
      typeof resolver?.resolve === 'function' && resolver?.resolve(response);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
    typeof resolver?.reject === 'function' && resolver?.reject();
  }
}

export default function* defaultSaga() {
  yield takeEvery(BORROWING_GET_ASSETS, getAssetsSaga);
  yield takeLeading(BORROWING_CALL_API_SAVE_DATA, saveDataSaga);
  yield takeEvery(BORROWING_GET_DETAIL, getDetails);
  yield takeEvery(BORROWING_GET_LINKED_OFFSETS, getLinkedOffsets);
}
