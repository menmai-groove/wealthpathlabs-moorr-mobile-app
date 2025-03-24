import {
  BORROWING_CALL_API_SAVE_DATA,
  BORROWING_GET_ASSETS,
  BORROWING_GET_DETAIL,
  BORROWING_GET_LINKED_OFFSETS,
  BORROWING_RESET_DATA,
  BORROWING_SET_ASSETS,
  BORROWING_SUBMIT_DATA,
  BORROWING_UPDATE_DATA,
} from 'store/Borrowing/constants';

export const updateData = data => ({
  type: BORROWING_UPDATE_DATA,
  payload: data,
});

export const submitData = () => ({
  type: BORROWING_SUBMIT_DATA,
  payload: {},
});

export const resetData = () => ({
  type: BORROWING_RESET_DATA,
});

export const getAssets = () => ({
  type: BORROWING_GET_ASSETS,
});

export const setAssets = data => ({
  type: BORROWING_SET_ASSETS,
  payload: data,
});

export const callAPISaveData = data => ({
  type: BORROWING_CALL_API_SAVE_DATA,
  payload: data,
});

export const getBorrowingDetail = data => ({
  type: BORROWING_GET_DETAIL,
  payload: data,
});

export const getLinkedOffsets = () => ({
  type: BORROWING_GET_LINKED_OFFSETS,
});
