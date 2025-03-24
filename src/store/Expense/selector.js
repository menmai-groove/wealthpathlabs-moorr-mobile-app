import { AppConstants } from 'constant';
import { generateObjectForDropdown } from 'libs/util';
import { get, isNil, sumBy, toString } from 'lodash';
import { createSelector } from 'reselect';
import { selectOwnersWithOthers } from 'store/Auth/selector';
import { initialState } from 'store/Expense/reducer';

export const makeSelectDomain = state => state.expense || initialState;

export const selectExpenseDetail = createSelector(
  makeSelectDomain,
  expense => expense.expenseDetail,
);

export const selectGroupExpenses = createSelector(
  makeSelectDomain,
  expense => expense.groupExpenses,
);

export const selectRelatedAsset = createSelector(makeSelectDomain, expense => expense.relatedAsset);

export const selectRentExpenseData = createSelector(
  selectExpenseDetail,
  selectOwnersWithOthers,
  (expenseDetail, userOwnerships) => {
    if (!expenseDetail) {
      return null;
    }

    const ownership = userOwnerships.find(owner => {
      if (expenseDetail.ownership?.ownershipType === AppConstants.ownershipType.Joint) {
        return owner.label === expenseDetail.ownership.ownershipType;
      } else {
        // sole
        const ownerId = get(expenseDetail, ['ownership', 'owners', '0', 'owner']);
        const userOwnerId = get(owner, ['owners', '0', 'owner']);
        return ownerId === userOwnerId;
      }
    });
    return {
      ...expenseDetail,
      name: toString(expenseDetail.name),
      type: generateObjectForDropdown({ value: toString(expenseDetail.category) }),
      essentialAmount: !isNil(expenseDetail.essentialAmount)
        ? String(expenseDetail.essentialAmount)
        : '',
      discretionaryAmount: !isNil(expenseDetail.discretionaryAmount)
        ? String(expenseDetail.discretionaryAmount)
        : '',
      frequency: generateObjectForDropdown({ value: toString(expenseDetail.frequency) }),
      billPaymentReminder: expenseDetail.billPaymentReminder,
      isTaxDeductable: Boolean(expenseDetail.isTaxDeductable),
      jar: generateObjectForDropdown({ value: expenseDetail.jar }),
      ownership: { ...ownership, ownershipAsAt: expenseDetail?.ownership?.ownershipAsAt },
      note: isNil(expenseDetail.note) ? '' : String(expenseDetail.note),
      nextDueDateStart: expenseDetail.nextDueDateStart,
      nextDueDate: expenseDetail.nextDueDate,
    };
  },
);

export const selectInvestmentExpense = createSelector(
  selectGroupExpenses,
  selectRelatedAsset,
  selectOwnersWithOthers,
  (groupExpenses, relatedAsset, userOwnerships) => {
    if (groupExpenses?.length && relatedAsset) {
      const { name = '', note = '', isTaxDeductable, category } = groupExpenses[0];

      const annualAmount = sumBy(groupExpenses, item =>
        isNil(item.essentialAmount) ? 0 : item.essentialAmount,
      );

      const ownership = userOwnerships.find(owner => {
        const assetOwnerId = get(relatedAsset, ['data', 'ownership', 'owners', '0', 'owner']);
        const assetOwnershipType = get(relatedAsset, ['data', 'ownership', 'ownershipType']);

        if (
          assetOwnershipType === AppConstants.ownershipType.Joint ||
          assetOwnershipType === AppConstants.ownershipType.Other
        ) {
          return owner.label === assetOwnershipType;
        } else {
          // sole
          const userOwnerId = get(owner, ['owners', '0', 'owner']);
          return assetOwnerId === userOwnerId;
        }
      });

      const holdingCosts = groupExpenses.map(i => ({
        ...i,
        _id: i._id,
        jar: i.jar,
        holdingCostName: i.holdingCostName,
        essentialAmount: i.essentialAmount,
      }));

      return {
        name,
        ownership: { ...ownership, ownershipAsAt: groupExpenses[0]?.ownership?.ownershipAsAt },
        type: generateObjectForDropdown({ value: category }),
        holdingCosts,
        note: isNil(note) ? '' : String(note),
        investmentAssetName: relatedAsset.data?.name,
        relatedAsset,
        annualAmount: String(annualAmount),
        isTaxDeductable: Boolean(isTaxDeductable),
      };
    }
    return null;
  },
);
