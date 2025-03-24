import {
  ASSET_ADD_BANK_ACCOUNT,
  ASSET_ADD_INVESTMENT,
  ASSET_ADD_LIFE_INSURANCE,
  ASSET_ADD_OTHER_ASSET,
  ASSET_ADD_PROPERTY,
  ASSET_ADD_SUPERFUND,
  ASSET_ADD_VEHICLE,
  ASSET_GET_DETAIL,
  ASSET_RESET_DATA,
  ASSET_SUBMIT_DATA,
  ASSET_UPDATE_DATA,
} from 'store/Asset/constants';

export const updateData = data => ({
  type: ASSET_UPDATE_DATA,
  payload: data,
});

export const submitData = () => ({
  type: ASSET_SUBMIT_DATA,
  payload: {},
});

export const resetData = () => ({
  type: ASSET_RESET_DATA,
});

export const addBankAccount = data => ({
  type: ASSET_ADD_BANK_ACCOUNT,
  payload: data,
});

export const addVehicle = data => ({
  type: ASSET_ADD_VEHICLE,
  payload: data,
});

export const addLifeInsurance = data => ({
  type: ASSET_ADD_LIFE_INSURANCE,
  payload: data,
});

export const addOtherAsset = data => ({
  type: ASSET_ADD_OTHER_ASSET,
  payload: data,
});

export const addSuperFundAsset = data => ({
  type: ASSET_ADD_SUPERFUND,
  payload: data,
});

export const getDetailAsset = data => ({
  type: ASSET_GET_DETAIL,
  payload: data,
});

export const addPropertyAsset = data => ({
  type: ASSET_ADD_PROPERTY,
  payload: data,
});

export const addInvestmentAsset = data => ({
  type: ASSET_ADD_INVESTMENT,
  payload: data,
});
