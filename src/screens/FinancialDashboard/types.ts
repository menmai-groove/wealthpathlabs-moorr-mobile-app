export interface IFinancialHistory {
  item: {
    id: string | Array<string>;
    name?: string;
    amount?: number;
    frequency?: string;
    jar?: string;
    type?: string;
    typeValue?: string;
    currentRepayments?: number;
    repaymentFrequency?: string;
    totalAssetIncome?: number;
    assetId?: string;
    annualAmount?: number;
  };
  cardType: 'income' | 'borrowings' | 'expense' | 'assets';
  disabledDelete: boolean;
}
