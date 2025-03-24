import { AppConstants } from 'constant';
import { filter, find, get, groupBy, map, sumBy } from 'lodash';
import { createSelector } from 'reselect';
import { initialState } from 'store/MoneySmartsDashboard/reducer';
import { selectCheckUpReportTableData } from 'store/MonthlyCheckUp/selector';

export const makeSelectMoneySmartsDashboardDomain = state =>
  state.moneySmartsDashboard || initialState;

export const makeSelectProvisionJarDomain = state =>
  state.moneySmartsDashboard?.provisionsJar || initialState.provisionsJar;

function findLastNonNullAccumulatedActualSurplus(
  reportTableData,
  key = 'accumulatedActualSurplus',
) {
  const list = [...reportTableData].reverse();
  for (const r of list) {
    if (typeof r[key] === 'number') {
      return r[key];
    }
  }
  return null;
}

export const selectMoneySmarts = createSelector(
  makeSelectMoneySmartsDashboardDomain,
  selectCheckUpReportTableData,
  (moneySmarts, reportTableData) => {
    const allLoaded = get(moneySmarts, ['allLoaded']) || false;
    const essentialAmount = {
      monthly: get(moneySmarts, ['essentialAmount', 'monthly']) || 0,
      yearly: get(moneySmarts, ['essentialAmount', 'yearly']) || 0,
    };
    const discretionaryAmount = {
      monthly: get(moneySmarts, ['discretionaryAmount', 'monthly']) || 0,
      yearly: get(moneySmarts, ['discretionaryAmount', 'yearly']) || 0,
    };
    const expenseTotalAmount = {
      monthly: get(moneySmarts, ['expenseTotalAmount', 'monthly']) || 0,
      yearly: get(moneySmarts, ['expenseTotalAmount', 'yearly']) || 0,
    };
    const totalMoneyIn = {
      monthly: get(moneySmarts, ['totalMoneyIn', 'monthly']) || 0,
      yearly: get(moneySmarts, ['totalMoneyIn', 'yearly']) || 0,
    };
    const totalMoneyOut = {
      monthly: get(moneySmarts, ['totalMoneyOut', 'monthly']) || 0,
      yearly: get(moneySmarts, ['totalMoneyOut', 'yearly']) || 0,
    };
    const moneyInBreakdown = map(get(moneySmarts, ['moneyInBreakdown']), item => ({
      monthly: {
        total: get(item, ['monthly', 'total']) || 0,
        groups: filter(get(item, ['monthly', 'groups']), subItem => subItem.total !== 0) || [],
      },
      yearly: {
        total: get(item, ['yearly', 'total']) || 0,
        groups: filter(get(item, ['yearly', 'groups']), subItem => subItem.total !== 0) || [],
      },
    }));
    const moneyOutExpenseMonthlyBreakdown = {
      monthly: {
        total: sumBy(get(moneySmarts, ['moneyOutExpenseMonthlyBreakdown']), 'monthlyTotal') || 0,
        groups:
          map(
            get(moneySmarts, ['moneyOutExpenseMonthlyBreakdown']),
            ({ monthlyTotal, ...item }) => ({ ...item, key: item?.key, total: monthlyTotal || 0 }),
          ) || [],
      },
      yearly: {
        total: sumBy(get(moneySmarts, ['moneyOutExpenseMonthlyBreakdown']), 'yearlyTotal') || 0,
        groups:
          map(
            get(moneySmarts, ['moneyOutExpenseMonthlyBreakdown']),
            ({ yearlyTotal, ...item }) => ({ ...item, key: item?.key, total: yearlyTotal || 0 }),
          ) || [],
      },
    };
    const moneyOutBreakdown = {
      monthly: {
        total: get(moneySmarts, ['moneyOutBreakdown', 'monthly', 'total']) || 0,
        groups: get(moneySmarts, ['moneyOutBreakdown', 'monthly', 'groups']) || [],
      },
      yearly: {
        total: get(moneySmarts, ['moneyOutBreakdown', 'yearly', 'total']) || 0,
        groups: get(moneySmarts, ['moneyOutBreakdown', 'yearly', 'groups']) || [],
      },
    };
    const totalTargetedSurplus = {
      monthly: get(moneySmarts, ['totalTargetedSurplus', 'monthly']) || 0,
      yearly: get(moneySmarts, ['totalTargetedSurplus', 'yearly']) || 0,
    };
    const weekly7DayFloatAllocation = {
      weekly: {
        total: get(moneySmarts, ['weekly7DayFloatAllocation']) || 0,
        groups: [],
      },
      monthly: {
        total: get(moneySmarts, ['weekly7DayFloatAllocation', 'monthly', 'total']) || 0,
        groups: get(moneySmarts, ['weekly7DayFloatAllocation', 'monthly', 'groups']) || [],
      },
      yearly: {
        total: get(moneySmarts, ['weekly7DayFloatAllocation', 'yearly', 'total']) || 0,
        groups: get(moneySmarts, ['weekly7DayFloatAllocation', 'yearly', 'groups']) || [],
      },
    };
    // const accumulatedActualSurplus = {
    //   monthly: get(moneySmarts, ['accumulatedActualSurplus', 'monthly']) || 0,
    //   yearly: get(moneySmarts, ['accumulatedActualSurplus', 'yearly']) || 0,
    // };

    const accumulatedActualSurplus = {
      monthly:
        findLastNonNullAccumulatedActualSurplus(reportTableData, 'monthlyActualSurplus') ?? 0,
      yearly: findLastNonNullAccumulatedActualSurplus(reportTableData) ?? 0,
    };

    const moneyOutBorrowingsMonthlyBreakdown = {
      monthly: {
        total: sumBy(get(moneySmarts, ['moneyOutBorrowingsMonthlyBreakdown']), 'monthlyTotal') || 0,
        groups:
          map(
            get(moneySmarts, ['moneyOutBorrowingsMonthlyBreakdown']),
            ({ monthlyTotal, ...item }) => ({
              key: item?.key,
              total: monthlyTotal || 0,
            }),
          ) || [],
      },
      yearly: {
        total: sumBy(get(moneySmarts, ['moneyOutBorrowingsMonthlyBreakdown']), 'yearlyTotal') || 0,
        groups:
          map(
            get(moneySmarts, ['moneyOutBorrowingsMonthlyBreakdown']),
            ({ yearlyTotal, ...item }) => ({
              key: item?.key,
              total: yearlyTotal || 0,
            }),
          ) || [],
      },
    };
    return {
      allLoaded,
      essentialAmount,
      discretionaryAmount,
      expenseTotalAmount,
      totalMoneyIn,
      totalMoneyOut,
      moneyInBreakdown,
      moneyOutExpenseMonthlyBreakdown,
      moneyOutBreakdown,
      totalTargetedSurplus,
      accumulatedActualSurplus,
      weekly7DayFloatAllocation,
      moneyOutBorrowingsMonthlyBreakdown,
    };
  },
);

export const selectMoneySmartMoneyOutBreakdown = createSelector(
  makeSelectMoneySmartsDashboardDomain,
  moneySmarts => {
    const mergedMoneyOut = []
      .concat(moneySmarts?.moneyOutExpenseMonthlyBreakdown || [])
      .concat(moneySmarts?.moneyOutBorrowingsMonthlyBreakdown || []);
    const moneyOutBreakdownGroups = map(groupBy(mergedMoneyOut, 'key'), (objs, key) => ({
      id: key,
      monthlyTotal: sumBy(objs, 'monthlyTotal'),
      yearlyTotal: sumBy(objs, 'yearlyTotal'),
    }));
    const moneyOutBreakdown =
      moneyOutBreakdownGroups?.length > 0
        ? {
            monthly: {
              total: moneyOutBreakdownGroups
                .map(({ monthlyTotal }) => monthlyTotal)
                .reduce((p, c) => p + c, 0),
              groups: moneyOutBreakdownGroups.map(({ id, monthlyTotal }) => ({
                key: id,
                total: monthlyTotal,
              })),
            },
            yearly: {
              total: moneyOutBreakdownGroups
                .map(({ yearlyTotal }) => yearlyTotal)
                .reduce((p, c) => p + c, 0),
              groups: moneyOutBreakdownGroups.map(({ id, yearlyTotal }) => ({
                key: id,
                total: yearlyTotal,
              })),
            },
          }
        : null;
    return moneyOutBreakdown;
  },
);

export const selectJarByKeyAndJar = (key = '', jar = '', frequency = 'monthly') =>
  createSelector(selectMoneySmarts, moneySmarts => {
    const allLoaded = moneySmarts.allLoaded;
    const monthlyInTotal = find(get(moneySmarts.moneyOutBreakdown, [frequency, 'groups']), {
      key,
    })?.total;
    // console.log(JSON.stringify(moneySmarts.moneyOutExpenseMonthlyBreakdown, null, 2));
    const moneyOutExpenseMonthlyBreakdown = get(moneySmarts.moneyOutExpenseMonthlyBreakdown, [
      frequency,
      'groups',
    ])?.filter(item => item.jar === jar);
    let monthlyOutGroups = map(groupBy(moneyOutExpenseMonthlyBreakdown, 'key'), objs => {
      return {
        ...get(objs, 0),
        total: sumBy(objs, 'total'),
      };
    });
    if (
      key === AppConstants.listTypeByJars.Loans &&
      jar === AppConstants.listTypeJarByMoneyOutExpense.Loans
    ) {
      const moneyOutBorrowingsMonthlyBreakdown = get(
        moneySmarts.moneyOutBorrowingsMonthlyBreakdown,
        [frequency, 'groups'],
      );
      monthlyOutGroups = map(groupBy(moneyOutBorrowingsMonthlyBreakdown, 'key'), objs => {
        return {
          ...get(objs, 0),
          total: sumBy(objs, 'total'),
        };
      });
    }
    return {
      allLoaded,
      monthlyInTotal,
      monthlyOutGroups,
    };
  });

export const selectDocumentID = createSelector(
  makeSelectMoneySmartsDashboardDomain,
  moneySmarts => moneySmarts._id,
);

export const selectAllLoaded = createSelector(
  makeSelectMoneySmartsDashboardDomain,
  moneySmarts => moneySmarts.allLoaded,
);

export const selectProvisionsJar = createSelector(makeSelectProvisionJarDomain, provisionsJar => {
  const provisions = get(provisionsJar, 'provisions') || [];
  const previousProvisions = get(provisionsJar, 'previousProvisions') || [];
  const summary = {
    remainingAmount: get(provisionsJar, ['summary', 'remainingAmount']) || 0,
    spentAmount: get(provisionsJar, ['summary', 'spentAmount']) || 0,
    totalAmount: get(provisionsJar, ['summary', 'totalAmount']) || 0,
  };
  return {
    provisions,
    previousProvisions,
    summary,
  };
});
