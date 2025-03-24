import {
  ONBOARDING_FINISH,
  ONBOARDING_LOAD_DATA_LOCAL_STORAGE,
  ONBOARDING_NEXT_STEP,
  ONBOARDING_PREV_STEP,
  ONBOARDING_RESET_DATA,
  ONBOARDING_SET_EMPTY_INCOME,
  ONBOARDING_SUBMIT,
  ONBOARDING_UPDATE_ASKING_NAME,
  ONBOARDING_UPDATE_ASSET,
  ONBOARDING_UPDATE_ASSET_BANK_ACCOUNT,
  ONBOARDING_UPDATE_ASSET_INVESTMENT,
  ONBOARDING_UPDATE_ASSET_PROPERTY,
  ONBOARDING_UPDATE_BORROWING,
  ONBOARDING_UPDATE_BORROWING_LIABILITY,
  ONBOARDING_UPDATE_DATA,
  ONBOARDING_UPDATE_DATA_INCOME,
  ONBOARDING_UPDATE_DATA_SPENDING,
  ONBOARDING_UPDATE_HOUSEHOLD,
  ONBOARDING_UPDATE_INCOME,
  ONBOARDING_UPDATE_LIST_SPENDING,
  ONBOARDING_UPDATE_SPENDING,
  ONBOARDING_UPDATE_STEP,
} from 'store/OnBoardingInterview/constants';

export const loadDataFromLocalStorage = () => ({
  type: ONBOARDING_LOAD_DATA_LOCAL_STORAGE,
  payload: {},
});

export const nextStep = data => ({
  type: ONBOARDING_NEXT_STEP,
  payload: { data },
});
export const previousStep = data => ({
  type: ONBOARDING_PREV_STEP,
  payload: data,
});

export const updateData = data => ({
  type: ONBOARDING_UPDATE_DATA,
  payload: data,
});

export const updateDataAskingName = data => ({
  type: ONBOARDING_UPDATE_ASKING_NAME,
  payload: data,
});

export const updateDataHousehold = data => ({
  type: ONBOARDING_UPDATE_HOUSEHOLD,
  payload: data,
});

export const updateDataAsset = data => ({
  type: ONBOARDING_UPDATE_ASSET,
  payload: data,
});

export const submitInterview = data => ({
  type: ONBOARDING_SUBMIT,
  payload: data,
});

export const updateStep = data => ({
  type: ONBOARDING_UPDATE_STEP,
  payload: {
    currentStep: data.currentStep,
  },
});

export const finishInterview = () => ({
  type: ONBOARDING_FINISH,
});

export const resetData = () => ({
  type: ONBOARDING_RESET_DATA,
});

export const updateDataProperty = data => ({
  type: ONBOARDING_UPDATE_ASSET_PROPERTY,
  payload: data,
});
export const updateDataBankAccount = data => ({
  type: ONBOARDING_UPDATE_ASSET_BANK_ACCOUNT,
  payload: data,
});
export const updateDataInvestment = data => ({
  type: ONBOARDING_UPDATE_ASSET_INVESTMENT,
  payload: data,
});

export const updateDataBorrowing = data => ({
  type: ONBOARDING_UPDATE_BORROWING,
  payload: data,
});

export const updateDataLiability = data => ({
  type: ONBOARDING_UPDATE_BORROWING_LIABILITY,
  payload: data,
});

export const updateIncome = data => ({
  type: ONBOARDING_UPDATE_INCOME,
  payload: data,
});
export const updateDataIncome = data => ({
  type: ONBOARDING_UPDATE_DATA_INCOME,
  payload: data,
});

export const updateSpending = data => ({
  type: ONBOARDING_UPDATE_SPENDING,
  payload: data,
});

export const updateDataSpending = data => ({
  type: ONBOARDING_UPDATE_DATA_SPENDING,
  payload: data,
});

export const updateListSpending = data => ({
  type: ONBOARDING_UPDATE_LIST_SPENDING,
  payload: data,
});

export const setEmptyIncome = () => ({
  type: ONBOARDING_SET_EMPTY_INCOME,
});
