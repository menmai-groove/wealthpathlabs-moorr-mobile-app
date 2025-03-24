export type DropdownItemType = {
  label: string;
  display: string;
};

export type SubmitDataHoldingCostType = {
  _id?: string;
  name?: string;
  holdingCostName?: string;
  holdingCostLabel?: string;
  essentialAmount: number;
  discretionaryAmount: number;
  jar: any;
  isDefault?: boolean;
  isArchived?: boolean;
};

export interface IModalHoldingCost {
  onCancel: () => void;
  onSubmit: (e: SubmitDataHoldingCostType) => void;
  moneySMARTSJarsType: DropdownItemType[];
  typeModal?: 'EDIT' | 'ADD';
  itemData?: SubmitDataHoldingCostType;
  isDefaultName?: boolean;
}

export interface IHoldingCost {
  onChange: (e: SubmitDataHoldingCostType[]) => void;
  error: any;
  field: any;
  value: any[];
  disabled?: boolean;
  swipeDisabled?: boolean;
  assetFormRef?: any;
}
