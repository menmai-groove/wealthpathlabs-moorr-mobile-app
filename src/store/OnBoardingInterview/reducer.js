import {
  ONBOARDING_RESET_DATA,
  ONBOARDING_UPDATE_ASKING_NAME,
  ONBOARDING_UPDATE_ASSET,
  ONBOARDING_UPDATE_BORROWING,
  ONBOARDING_UPDATE_DATA,
  ONBOARDING_UPDATE_DATA_INCOME,
  ONBOARDING_UPDATE_DATA_SPENDING,
  ONBOARDING_UPDATE_HOUSEHOLD,
  ONBOARDING_UPDATE_STEP,
} from 'store/OnBoardingInterview/constants';

const initialState = {
  currentStep: '',
  totalStep: 6,
  data: {
    askingName: {},
    household: {},
    assets: {},
    borrowings: {},
    incomes: null,
    spendings: null,
  },
};

function onBoardingInterviewReducer(state = initialState, action) {
  switch (action.type) {
    case ONBOARDING_UPDATE_STEP:
      return {
        ...state,
        currentStep: action.payload.currentStep || state.currentStep,
      };

    case ONBOARDING_UPDATE_DATA:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload,
        },
      };

    case ONBOARDING_UPDATE_ASKING_NAME:
      return {
        ...state,
        data: {
          ...state.data,
          askingName: {
            ...state.data.askingName,
            ...action.payload,
          },
        },
      };

    case ONBOARDING_UPDATE_HOUSEHOLD:
      return {
        ...state,
        data: {
          ...state.data,
          household: {
            ...state.data.household,
            ...action.payload,
          },
        },
      };

    case ONBOARDING_UPDATE_ASSET:
      return {
        ...state,
        data: {
          ...state.data,
          assets: {
            ...state.data.assets,
            ...action.payload,
          },
        },
      };
    case ONBOARDING_UPDATE_BORROWING:
      return {
        ...state,
        data: {
          ...state.data,
          borrowings: {
            ...state.data.borrowings,
            ...action.payload,
          },
        },
      };
    case ONBOARDING_UPDATE_DATA_INCOME:
      return {
        ...state,
        data: {
          ...state.data,
          incomes: action.payload,
        },
      };

    case ONBOARDING_UPDATE_DATA_SPENDING:
      return {
        ...state,
        data: {
          ...state.data,
          spendings: action.payload,
        },
      };

    case ONBOARDING_RESET_DATA:
      return initialState;

    default:
      return state;
  }
}

export default onBoardingInterviewReducer;
