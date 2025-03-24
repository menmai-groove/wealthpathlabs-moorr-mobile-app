import { SET_MONEY_SMARTS } from 'store/MoneySmartsDashboard/constants';

export const initialState = {
  allLoaded: false,
  _id: null,
  essentialAmount: null,
  discretionaryAmount: null,
  totalMoneyIn: null,
  totalMoneyOut: null,
  moneyInBreakdown: null,
  moneyInBreakdownPartner: null,
  moneyOutBreakdown: null,
  totalTargetedSurplus: null,
  accumulatedActualSurplus: null,
  provisionsJar: {
    provisions: [],
    summary: {
      remainingAmount: 0,
      spentAmount: 0,
      totalAmount: 0,
    },
  },
};

export function moneySmartsDashboardReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_MONEY_SMARTS:
      const moneySmarts = payload.data;
      return {
        ...state,
        ...moneySmarts,
        allLoaded: true,
      };
    default:
      return state;
  }
}
