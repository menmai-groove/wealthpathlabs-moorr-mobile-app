import React, { useState, createContext, useContext, useMemo, useCallback } from 'react';

import { SubmitDataHoldingCostType } from './types';

type InitValuesType = {
  formData: {
    type: any;
    selectBillType: any;
    selectSpendingType: any;
    expenseGroup: string;
    name: string;
    note: string;
    billPaymentReminder?: string;
    frequency?: any;
    jar?: any;
    ownership?: any;
    relatedAsset?: any;
    essentialAmount?: string;
    discretionaryAmount?: string;
    annualAmount?: string;
    isTaxDeductable?: boolean;
    investmentAssetName?: string;
    holdingCosts?: SubmitDataHoldingCostType[];
    categoryAsAt: any;
    amountAsAt: any;
    isTaxDeductableAsAt: any;
    ownershipAsAt: any;
    jarAsAt: any;
  };
  saveFormData: (e: any) => void;
};

const initValues: InitValuesType = {
  formData: {
    type: {},
    selectBillType: {},
    selectSpendingType: {},
    name: '',
    note: '',
    expenseGroup: '',
    billPaymentReminder: null,
    frequency: null,
    jar: null,
    ownership: null,
    relatedAsset: null,
    essentialAmount: '',
    discretionaryAmount: '',
    isTaxDeductable: false,
    categoryAsAt: null,
    amountAsAt: null,
    isTaxDeductableAsAt: null,
    ownershipAsAt: null,
    jarAsAt: null,
  },
  saveFormData: () => {},
};
export const FormDataContext = createContext(initValues);

export function useFormData() {
  const form = useContext(FormDataContext);
  const memorizedForm = useMemo(() => form, [form]);
  return memorizedForm;
}

export function FormDataProvider({ children }) {
  const [formData, setFormData] = useState(initValues.formData);

  const saveFormData = useCallback(newValues => {
    setFormData(preValues => ({ ...preValues, ...newValues }));
  }, []);
  const newContext = useMemo(() => ({ formData, saveFormData }), [formData, saveFormData]);

  return <FormDataContext.Provider value={newContext}>{children}</FormDataContext.Provider>;
}
