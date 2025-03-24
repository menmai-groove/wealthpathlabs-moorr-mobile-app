import i18n from 'bootstrap/i18n';
import { AppConfigs, AppConstants, AppScreenID } from 'constant';
import {
  AnalyticsLib,
  GlobalLib,
  LocalStorageLib,
  NavigationServiceLib,
  SagaLib,
  UtilLib,
} from 'libs';
import { first, get, includes, isArray, isEmpty, isNil, merge, toNumber } from 'lodash';
import moment from 'moment';
import { all, call, put, putResolve, select, takeLatest, takeLeading } from 'redux-saga/effects';
import { getDependants, getProfileSaga, getStaticValuesSaga } from 'store/Auth/saga';
import {
  selectAssessedTaxReturn,
  selectDefaultValueExpense,
  selectFlags,
  selectUser,
} from 'store/Auth/selector';
import { GET_MONTHLY_CHECKUP, UPDATE_MONTHLY_CHECKUP } from 'store/MonthlyCheckUp/query';
import { rolloverCheckUp } from 'store/MonthlyCheckUp/saga';
import {
  updateData,
  updateDataAskingName,
  updateDataAsset,
  updateDataBorrowing,
  updateDataHousehold,
  updateDataIncome,
  updateDataSpending,
  updateStep,
} from 'store/OnBoardingInterview/action';
import {
  OnboardingStep,
  ONBOARDING_FINISH,
  ONBOARDING_LOAD_DATA_LOCAL_STORAGE,
  ONBOARDING_NEXT_STEP,
  ONBOARDING_PREV_STEP,
  ONBOARDING_SET_EMPTY_INCOME,
  ONBOARDING_SUBMIT,
  ONBOARDING_UPDATE_ASSET_BANK_ACCOUNT,
  ONBOARDING_UPDATE_ASSET_INVESTMENT,
  ONBOARDING_UPDATE_ASSET_PROPERTY,
  ONBOARDING_UPDATE_BORROWING_LIABILITY,
  ONBOARDING_UPDATE_INCOME,
  ONBOARDING_UPDATE_LIST_SPENDING,
  ONBOARDING_UPDATE_SPENDING,
} from 'store/OnBoardingInterview/constants';
import { UPDATE_CLIENT } from 'store/OnBoardingInterview/query';
import {
  selectAssets,
  selectBorrowings,
  selectCurrentStep,
  selectHouseholdData,
  selectIncomes,
  selectOnboardingInterviewData,
  selectSpending,
} from 'store/OnBoardingInterview/selector';

function* getUserDataFromLocalStorage() {
  const listData = yield LocalStorageLib.OnBoardingInterview.get();
  if (isEmpty(listData) || !Array.isArray(listData)) {
    return {};
  } else {
    const user = yield select(selectUser);
    const userSaved = listData.find(d => d.email === user?.email);
    if (userSaved) {
      return userSaved.info;
    }
    return {};
  }
}

function* loadDataFromLocalStorageSaga() {
  try {
    const data = yield getUserDataFromLocalStorage();
    if (!isEmpty(data)) {
      yield put(updateData(data));

      const { type, partnerName, dependantKid } = data.household || {};
      switch (type) {
        case AppConstants.householdType.justMe:
          yield put(updateStep({ currentStep: OnboardingStep.Asset }));
          break;
        case AppConstants.householdType.mePartner:
          if (isEmpty(partnerName)) {
            yield put(updateStep({ currentStep: OnboardingStep.HouseholdPartner }));
          } else {
            yield put(updateStep({ currentStep: OnboardingStep.Asset }));
          }
          break;
        case AppConstants.householdType.meKids:
        case AppConstants.householdType.usKids:
          if (isEmpty(dependantKid)) {
            yield put(updateStep({ currentStep: OnboardingStep.HouseholdKid }));
          } else {
            yield put(updateStep({ currentStep: OnboardingStep.Asset }));
          }
          break;
        default:
          yield put(updateStep({ currentStep: OnboardingStep.GetStarted }));
          break;
      }
    } else {
      yield put(updateStep({ currentStep: OnboardingStep.GetStarted }));
    }
  } catch (error) {
  } finally {
  }
}

function* saveDataToLocalStorage(data) {
  try {
    const listData = yield LocalStorageLib.OnBoardingInterview.get();
    const user = yield select(selectUser);
    if (isEmpty(listData) || !Array.isArray(listData)) {
      yield LocalStorageLib.OnBoardingInterview.set([{ email: user?.email, info: data }]);
    } else {
      const userSaved = listData.find(d => d.email === user?.email);
      if (userSaved) {
        if (data.incomes) {
          userSaved.info.incomes = data.incomes;
        } else if (data.spendings) {
          userSaved.info.spendings = data.spendings;
        } else {
          userSaved.info = merge(userSaved.info, data);
        }
      } else {
        listData.push({ email: user?.email, info: data });
      }
      yield LocalStorageLib.OnBoardingInterview.set(listData);
    }
  } catch (error) {}
}

function* updateNameAndHousehold() {
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const user = yield select(selectUser);
    const data = yield select(selectOnboardingInterviewData);
    const noOfKids = !isEmpty(data.household?.dependantKid)
      ? toNumber(data.household?.dependantKid)
      : 0;
    const dependants = yield call(getDependants, {
      payload: {
        noOfKids: noOfKids,
      },
    });
    const input = {
      page: AppConstants.ClientHistoryQuery.PersonalInfo,
      personalInfo: {},
    };

    input.personalInfo.dependants = dependants;
    input.personalInfo.client1 = {
      _id: !isEmpty(user?.client1?._id)
        ? user?.client1?._id
        : AppConstants.newObjectID.replace('1', 'client1'),
      fName: '',
    };
    if (isEmpty(data.household?.partnerName)) {
      input.personalInfo.client2 = null;
    } else {
      input.personalInfo.client2 = {
        _id: !isEmpty(user?.client2?._id)
          ? user?.client2?._id
          : AppConstants.newObjectID.replace('1', 'client2'),
        fName: data.household?.partnerName,
      };
    }

    const response = yield SagaLib.mutationCall(UPDATE_CLIENT, {
      data: input,
    });

    if (response.data?.me) {
      yield all([call(getStaticValuesSaga), call(getProfileSaga)]);
    } else {
      throw Error(i18n.t('errorMsg.somethingWentWrong'));
    }
  } catch (error) {
    if (!isEmpty(error.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  } finally {
    loadingView.hide();
  }
}

function* updatePropertySaga(action) {
  const {
    payload: { properties },
  } = action;
  yield put(updateDataAsset({ properties }));
  yield saveDataToLocalStorage({ assets: { properties } });
}

function* updateBankAccountSaga(action) {
  const {
    payload: { bankAccounts },
  } = action;
  yield put(updateDataAsset({ bankAccounts }));
  const assets = yield select(selectAssets);
  yield saveDataToLocalStorage({ assets });
}

function* updateInvestmentSaga(action) {
  const {
    payload: { investments },
  } = action;
  yield putResolve(updateDataAsset({ investments }));
  const assets = yield select(selectAssets);
  yield saveDataToLocalStorage({ assets });
}

function* updateLiabilitySaga(action) {
  const {
    payload: { liabilities },
  } = action;
  yield putResolve(updateDataBorrowing({ liabilities }));
  const borrowings = yield select(selectBorrowings);
  yield saveDataToLocalStorage({ borrowings });
}

function* resetAllData() {
  // clear assets
  yield updatePropertySaga({ payload: { properties: null } });
  yield updateBankAccountSaga({ payload: { bankAccounts: null } });
  yield updateInvestmentSaga({ payload: { investments: null } });

  // clear liabilities
  yield updateLiabilitySaga({ payload: { liabilities: null } });
  // clear income
  yield putResolve(updateDataIncome(null));
  // clear spending
  yield putResolve(updateDataSpending(null));
  // clear household
  yield putResolve(
    updateDataHousehold({
      dependantKid: '',
      partnerName: '',
    }),
  );
  yield saveDataToLocalStorage({ incomes: null });
  yield saveDataToLocalStorage({ spendings: null });
}

function* nextStepSaga(action) {
  const { payload } = action;
  try {
    const currentStep = yield select(selectCurrentStep);
    const currentData = yield select(selectOnboardingInterviewData);

    switch (currentStep) {
      case OnboardingStep.GetStarted:
        yield put(updateStep({ currentStep: OnboardingStep.AskingName }));
        break;
      case OnboardingStep.AskingName:
        yield put(updateDataAskingName(payload.data));
        yield put(updateStep({ currentStep: OnboardingStep.Household }));
        yield saveDataToLocalStorage({ askingName: payload.data });
        break;

      case OnboardingStep.Household:
        if (payload.data.type !== currentData?.household?.type) {
          yield resetAllData();
        }

        switch (payload.data.type) {
          case AppConstants.householdType.justMe:
            const data = {
              ...payload.data,
              dependantKid: '',
              partnerName: '',
            };
            yield saveDataToLocalStorage({ household: data });
            yield putResolve(updateDataHousehold(data));
            //Check user turn back and change type household
            yield call(updateNameAndHousehold);
            yield put(updateStep({ currentStep: OnboardingStep.Asset }));
            break;

          case AppConstants.householdType.mePartner:
          case AppConstants.householdType.usKids:
            yield putResolve(updateDataHousehold(payload.data));
            yield saveDataToLocalStorage({ household: payload.data });
            yield put(
              updateStep({
                currentStep: OnboardingStep.HouseholdPartner,
              }),
            );
            break;

          case AppConstants.householdType.meKids:
            yield putResolve(updateDataHousehold(payload.data));
            yield saveDataToLocalStorage({ household: payload.data });
            yield put(
              updateStep({
                currentStep: OnboardingStep.HouseholdKid,
              }),
            );
            break;
          default:
            break;
        }
        break;

      case OnboardingStep.HouseholdPartner:
        if (currentData?.household?.type === AppConstants.householdType.usKids) {
          yield putResolve(updateDataHousehold(payload.data));
          yield saveDataToLocalStorage({ household: payload.data });
          yield put(
            updateStep({
              currentStep: OnboardingStep.HouseholdKid,
            }),
          );
        } else {
          const data = { ...payload.data, dependantKid: '' };
          yield putResolve(updateDataHousehold(data));
          yield saveDataToLocalStorage({ household: data });
          //Check user turn back and change partnerName
          yield call(updateNameAndHousehold);
          yield put(updateStep({ currentStep: OnboardingStep.Asset }));
        }
        break;

      case OnboardingStep.HouseholdKid:
        const data = payload.data;
        if (currentData?.household?.type === AppConstants.householdType.meKids) {
          data.partnerName = '';
        }
        yield putResolve(updateDataHousehold(data));
        yield saveDataToLocalStorage({ household: data });
        //Check user turn back and change dependantKid
        yield call(updateNameAndHousehold);
        yield put(updateStep({ currentStep: OnboardingStep.Asset }));
        break;

      case OnboardingStep.Asset:
        yield put(updateStep({ currentStep: payload.data.step }));
        break;

      case OnboardingStep.AssetStoryTelling:
      case OnboardingStep.BorrowingTelling:
      case OnboardingStep.IncomeTelling:
      case OnboardingStep.SpendingTelling:
        yield put(updateStep({ currentStep: OnboardingStep.Asset }));
        break;

      default:
        break;
    }
  } catch (error) {
  } finally {
  }
}

function* previousStepSaga() {
  try {
    const currentStep = yield select(selectCurrentStep);
    switch (currentStep) {
      case OnboardingStep.AskingName:
        yield put(updateStep({ currentStep: OnboardingStep.GetStarted }));
        break;

      case OnboardingStep.Household:
        yield put(updateStep({ currentStep: OnboardingStep.AskingName }));
        break;

      case OnboardingStep.HouseholdPartner:
        yield put(updateStep({ currentStep: OnboardingStep.Household }));
        break;

      case OnboardingStep.HouseholdKid:
        const household = yield select(selectHouseholdData);
        if (household.type === AppConstants.householdType.usKids) {
          yield put(
            updateStep({
              currentStep: OnboardingStep.HouseholdPartner,
            }),
          );
        } else {
          yield put(
            updateStep({
              currentStep: OnboardingStep.Household,
            }),
          );
        }
        break;

      case OnboardingStep.Asset:
        const householdData = yield select(selectHouseholdData);
        switch (householdData.type) {
          case AppConstants.householdType.mePartner:
            yield put(
              updateStep({
                currentStep: OnboardingStep.HouseholdPartner,
              }),
            );
            break;
          case AppConstants.householdType.meKids:
          case AppConstants.householdType.usKids:
            yield put(
              updateStep({
                currentStep: OnboardingStep.HouseholdKid,
              }),
            );
            break;
          case AppConstants.householdType.justMe:
          default:
            yield put(
              updateStep({
                currentStep: OnboardingStep.Household,
              }),
            );
            break;
        }
        break;
      case OnboardingStep.AssetStoryTelling:
      case OnboardingStep.BorrowingTelling:
      case OnboardingStep.IncomeTelling:
      case OnboardingStep.SpendingTelling:
        yield put(updateStep({ currentStep: OnboardingStep.Asset }));
        break;
      default:
        break;
    }
  } catch (error) {
  } finally {
  }
}

function* removeDataInLocalStorage() {
  const listData = yield LocalStorageLib.OnBoardingInterview.get();
  if (!isEmpty(listData) && Array.isArray(listData)) {
    const user = yield select(selectUser);
    const newList = listData.filter(d => d.email !== user?.email);
    yield LocalStorageLib.OnBoardingInterview.set(newList);
  }
}

function getOwnershipType(ownership) {
  switch (ownership?.label) {
    case AppConstants.ownershipType.Joint:
      return AppConstants.ownershipType.Joint;
    case AppConstants.ownershipType.Other:
      return AppConstants.ownershipType.Other;
    default:
      return AppConstants.ownershipType.Sole;
  }
}

function* getPropertiesForSubmit(newObjectId) {
  const assets = yield select(selectAssets);
  const properties = assets?.properties;
  const listProperty = [];
  const listIncome = [];
  if (properties) {
    let count = 0;
    while (count < toNumber(properties.numberOfProperties)) {
      const name = properties[`form${count}-name`];
      const idIncome = newObjectId.get('income');
      const ownershipSplitPerson1 = properties[`form${count}-ownershipSplitPerson1`];
      const ownershipSplitPerson2 = properties[`form${count}-ownershipSplitPerson2`];
      const ownership = properties[`form${count}-ownership`];
      const ownershipType = getOwnershipType(ownership);

      const createOwnershipData = () => ({
        ownershipType: ownershipType,
        ownershipDesc: '',
        owners: ownership?.owners.map((x, index) => {
          let percentage = x.percentage;
          if (!isEmpty(ownershipSplitPerson1) && !isEmpty(ownershipSplitPerson1)) {
            percentage =
              index === 0 ? toNumber(ownershipSplitPerson1) : toNumber(ownershipSplitPerson2);
          }

          return {
            _id: newObjectId.get(),
            owner: x.owner,
            percentage: percentage,
          };
        }),
      });

      const obj = {};
      obj._id = newObjectId.get();
      obj.name = name;
      obj.address = properties[`form${count}-address`];
      obj.purpose = properties[`form${count}-primaryPurpose`]?.value;
      obj.ownership = createOwnershipData();
      obj.currentValue = toNumber(properties[`form${count}-currentValue`]);

      if (!isNil(properties[`form${count}-grossRent`])) {
        obj.income = idIncome;

        const income = {};
        income._id = idIncome;
        income.frequency = AppConstants.defaultIncomeFrequency;
        income.type = AppConstants.IncomeType.PropertyIncome;
        income.isTaxDeductible = false;
        income.name = name; // set default name is asset name
        income.amount = toNumber(properties[`form${count}-grossRent`]);
        income.ownership = createOwnershipData();
        income.property = obj._id;
        income.isCurrent = true;
        listIncome.push(income);
      }
      listProperty.push(obj);
      count++;
    }
  }
  return { listProperty, listIncome };
}

function* getInvestmentForSubmit(newObjectId) {
  const assets = yield select(selectAssets);
  const investments = assets?.investments;
  const listInvestment = [];
  const listIncome = [];
  if (investments) {
    let count = 0;
    while (count < toNumber(investments.numberOfInvestments)) {
      const idIncome = newObjectId.get('income');
      const name = investments[`investment${count}-name`];
      const ownership = investments[`investment${count}-ownership`];
      const ownershipSplitPerson1 = investments[`investment${count}-ownershipSplitPerson1`];
      const ownershipSplitPerson2 = investments[`investment${count}-ownershipSplitPerson2`];
      const ownershipType = getOwnershipType(ownership);

      const createOwnershipData = () => ({
        ownershipType: ownershipType,
        ownershipDesc: '',
        owners: ownership?.owners.map((x, index) => {
          let percentage = x.percentage;
          if (!isEmpty(ownershipSplitPerson1) && !isEmpty(ownershipSplitPerson1)) {
            percentage =
              index === 0 ? toNumber(ownershipSplitPerson1) : toNumber(ownershipSplitPerson2);
          }
          return {
            _id: newObjectId.get(),
            owner: x.owner,
            percentage: percentage,
          };
        }),
      });

      const obj = {};
      obj._id = newObjectId.get();
      obj.income = idIncome;
      obj.currentValue = toNumber(investments[`investment${count}-investment`]);
      obj.name = name;
      obj.ownership = createOwnershipData();

      const income = {};
      income._id = idIncome;
      income.frequency = AppConstants.defaultIncomeFrequency;
      income.type = AppConstants.IncomeType.InvestmentIncome;
      income.isTaxDeductible = false;
      income.amount = toNumber(investments[`investment${count}-investmentIncome`]);
      income.name = name; // set default name is asset name
      income.ownership = createOwnershipData();
      income.property = obj._id;
      income.isCurrent = true;
      listInvestment.push(obj);
      listIncome.push(income);
      count++;
    }
  }
  return { listInvestment, listIncome };
}

export function* getBankAccountsForSubmit(newObjectId) {
  const assets = yield select(selectAssets);
  // const bankAccountInstitutions = yield select(selectDataAssetBankAccountInstitutions);
  const bankAccounts = assets?.bankAccounts;
  const newBanks = [];
  if (bankAccounts) {
    let count = 0;
    while (count < toNumber(bankAccounts.numberOfAccounts)) {
      const balance = toNumber(bankAccounts[`bank${count}-balance`]);
      const name = bankAccounts[`bank${count}-name`];
      const ownership = bankAccounts[`bank${count}-ownership`];
      const ownershipType = getOwnershipType(ownership);

      newBanks.push({
        _id: newObjectId.get(),
        balance: balance,
        name: name,
        ownership: {
          ownershipType: ownershipType,
          ownershipDesc: '',
          owners: ownership?.owners.map(x => {
            return {
              _id: newObjectId.get(),
              owner: x.owner,
              percentage: x.percentage,
            };
          }),
        },
        institution: null,
        isTrackedInMoneySmarts: true,
        isTrackedInMoneySmartsAsAt: UtilLib.dateUTCAsAt(Date.now()),
      });
      count++;
    }
  }
  return newBanks;
}

function* getLiabilitiesForSubmit(newObjectId) {
  const borrowings = yield select(selectBorrowings);
  const liabilities = borrowings?.liabilities;
  const listLiability = [];
  if (liabilities) {
    let count = 0;
    while (count < toNumber(liabilities.numberOfLiabilities)) {
      const obj = {};
      obj._id = newObjectId.get();
      obj.name = liabilities[`liability${count}-name`];
      const loanType = liabilities[`liability${count}-loanType`];
      obj.type = loanType?.value;
      obj.outstanding = toNumber(liabilities[`liability${count}-outstandingAmount`]);
      obj.repayment = toNumber(liabilities[`liability${count}-repaymentAmount`]);
      obj.repaymentFreq = liabilities[`liability${count}-frequency`]?.value;
      obj.repayment = toNumber(liabilities[`liability${count}-repaymentAmount`]);
      const ownershipSplitPerson1 = liabilities[`liability${count}-ownershipSplitPerson1`];
      const ownershipSplitPerson2 = liabilities[`liability${count}-ownershipSplitPerson2`];
      const otherBorrowerPercentage = liabilities[`liability${count}-otherBorrowerPercentage`];
      const ownership = liabilities[`liability${count}-ownership`];

      const ownershipType = getOwnershipType(ownership);
      obj.borrower = {
        ownershipType: ownershipType,
        ownershipDesc: '',
        owners: ownership?.owners.map((x, index) => {
          let percentage = x.percentage;
          if (!isEmpty(ownershipSplitPerson1) && !isEmpty(ownershipSplitPerson1)) {
            percentage =
              index === 0 ? toNumber(ownershipSplitPerson1) : toNumber(ownershipSplitPerson2);
          }
          return {
            _id: newObjectId.get(),
            owner: x.owner,
            percentage: percentage,
          };
        }),
      };
      obj.otherBorrowerPercentage = isNil(otherBorrowerPercentage)
        ? null
        : toNumber(otherBorrowerPercentage);

      const interestRate = liabilities[`liability${count}-interestRate`];
      obj.interestRate = isNil(interestRate) ? null : toNumber(interestRate.interestRate);
      obj.baseRate = isNil(interestRate?.baseRate) ? null : toNumber(interestRate.baseRate);
      obj.discountRate = isNil(interestRate?.discountRate)
        ? null
        : toNumber(interestRate.discountRate);

      if (includes(loanType?.value, 'Credit Card') || includes(loanType?.value, 'Line of Credit')) {
        obj.isTrackedInMoneySmarts = includes(loanType?.value, 'Line of Credit') ? false : true;
        obj.isTrackedInMoneySmartsAsAt = UtilLib.dateUTCAsAt(Date.now());
      }

      listLiability.push(obj);
      count++;
    }
  }
  return listLiability;
}

function* getIncomesForSubmit(newObjectId) {
  const incomes = yield select(selectIncomes);
  const AssessedTaxReturn = yield select(selectAssessedTaxReturn);
  const features = yield select(selectFlags);
  if (isArray(incomes)) {
    const listIncome = incomes.map(income => {
      const isJoint = income?.ownership?.label === AppConstants.ownershipType.Joint;
      let dataTaxReturn = null;
      let amount = toNumber(income.annualIncome || null);

      if (!features.asAtMigrationIncome) {
        if (
          income?.incomeType?.value === AppConstants.IncomeType.Business ||
          income?.incomeType?.value === AppConstants.IncomeType.SelfEmployed
        ) {
          const dataNew =
            UtilLib.handleDataTaxReturnByAmount(AssessedTaxReturn, income?.annualIncome) || [];
          dataTaxReturn = dataNew;
          amount = null;
        }
      }

      return {
        _id: newObjectId.get(),
        type: income.incomeType.value,
        amount: amount,
        frequency: AppConstants.defaultIncomeFrequency,
        ownership: {
          ownershipType: isJoint
            ? AppConstants.ownershipType.Joint
            : AppConstants.ownershipType.Sole,
          ownershipDesc: '',
          owners: income?.ownership?.owners.map(x => {
            return {
              _id: newObjectId.get(),
              owner: x.owner,
              percentage: x.percentage,
            };
          }),
        },
        name: income.incomeType.label,
        assessedTaxReturn: dataTaxReturn,
        basis: {
          details: {
            ownershipStructure: income?.ownershipStructure?.value,
          },
        },
        isCurrent: true,
      };
    });
    let namesSet = new Set(listIncome.map(item => item.name));
    namesSet.forEach(item => {
      let count = 0;
      listIncome.map(income => {
        if (income.name === item) {
          if (count > 0) {
            income.name = `${income.name} (${count})`;
          }
          count++;
        }
      });
      count = 0;
    });
    return listIncome;
  }
  return [];
}

function* getSpendingForSubmit(newObjectId) {
  const spendings = yield select(selectSpending);
  const defaultValueExpense = yield select(selectDefaultValueExpense);

  if (isArray(spendings)) {
    return spendings.map(spending => {
      const defaultOptions = defaultValueExpense.find(e => e.category === spending.category);
      const defaultValues = UtilLib.getCardItemDefaultValuesFromAPI(defaultOptions);
      return merge({}, defaultValues, {
        _id: newObjectId.get(),
        category: spending.category,
        essentialAmount: toNumber(spending.essentialAmount),
        discretionaryAmount: toNumber(spending.discretionaryAmount),
        frequency: spending.frequency,
        type: spending.type,
        expenseGroup: spending.type,
        name: spending.category,
      });
    });
  }
  return [];
}

function* createNewOpenDocument() {
  try {
    const response = yield SagaLib.queryCall(GET_MONTHLY_CHECKUP, {
      pagination: { page: 1, limit: 1 },
      sort: { startDate: -1 },
    });
    let document = first(get(response, ['data', 'me', 'moneyRollovers', 'documents']));
    if (isEmpty(document) || document.state !== AppConstants.documentState.OPEN) {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startDate = UtilLib.dateUTCAsAt(firstDayOfMonth);
      const _id = AppConstants.newObjectID.replace('1', 'document_1');
      const data = {
        _id,
        startDate,
        state: AppConstants.documentState.OPEN,
      };
      if (document) {
        data.startDate = UtilLib.dateUTCAsAt(
          moment(document.startDate)
            .add(AppConfigs.circleMonthCheckUp - 1, 'months')
            .toDate(),
        );
      }
      yield SagaLib.mutationCall(UPDATE_MONTHLY_CHECKUP, {
        data: data,
      });
      yield rolloverCheckUp(startDate, null);
    }
  } catch (error) {}
}

function* submitInterviewSaga(action) {
  const { payload = {} } = action;
  const { skip = false } = payload;
  const loadingView = GlobalLib.Loading.get();
  loadingView.show();
  try {
    const data = yield select(selectOnboardingInterviewData);
    let id = 0;
    const newObjectId = {
      get: (postfix = '') => {
        return AppConstants.newObjectID.replace(
          '1',
          postfix?.length ? `${postfix}__${++id}` : ++id,
        );
      },
    };
    const noOfKids = !isEmpty(data.household?.dependantKid)
      ? toNumber(data.household?.dependantKid)
      : 0;
    const dependants = yield call(getDependants, {
      payload: {
        noOfKids: noOfKids,
      },
    });

    const { listProperty, listIncome: listIncomeProperty } = yield call(
      getPropertiesForSubmit,
      newObjectId,
    );
    const { listInvestment, listIncome } = yield call(getInvestmentForSubmit, newObjectId);
    const bankAccounts = yield call(getBankAccountsForSubmit, newObjectId);
    const liabilities = yield call(getLiabilitiesForSubmit, newObjectId);
    const incomes = yield call(getIncomesForSubmit, newObjectId);
    const spendings = yield call(getSpendingForSubmit, newObjectId);

    const user = yield select(selectUser);

    const personalInfoInput = {
      page: AppConstants.ClientHistoryQuery.PersonalInfo,
      personalInfo: {
        client1: {
          _id: user?.client1?._id,
          fName: data.askingName?.name,
        },
        client2: isEmpty(data.household?.partnerName)
          ? null
          : {
              _id: user?.client2?._id,
              fName: data.household?.partnerName,
            },
        dependants: dependants,
      },
    };

    const liteFaceFindInput = {
      page: AppConstants.ClientHistoryQuery.LiteFactFind,
      assets: {
        properties: listProperty,
        investments: listInvestment,
        bankAccounts: bankAccounts,
      },
      borrowings: liabilities,
      income: [...listIncomeProperty, ...listIncome, ...incomes],
      expenses: spendings,
      surveyComplete: true,
    };

    const [personalInfoResponse, liteFaceFindInputResponse] = yield all([
      SagaLib.mutationCall(UPDATE_CLIENT, {
        data: personalInfoInput,
      }),
      SagaLib.mutationCall(UPDATE_CLIENT, {
        data: liteFaceFindInput,
      }),
      call(createNewOpenDocument),
    ]);

    if (personalInfoResponse?.data?.me && liteFaceFindInputResponse?.data?.me) {
      yield all([call(getProfileSaga), call(getStaticValuesSaga)]);
      yield removeDataInLocalStorage();
      yield put(updateStep({ currentStep: OnboardingStep.Success }));
      AnalyticsLib.logEvent(
        skip
          ? AppConstants.analytics.eventTypes.skipOnboarding
          : AppConstants.analytics.eventTypes.completeOnboarding,
      );
    } else {
      throw Error(i18n.t('errorMsg.somethingWentWrong'));
    }
  } catch (error) {
    if (!isEmpty(error.message)) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  } finally {
    loadingView.hide();
  }
}

function* updateIncomeSaga(action) {
  const { payload } = action;
  const incomes = yield select(selectIncomes);
  const listIncome = isArray(incomes) ? [...incomes] : [];
  if (!payload.delete) {
    if (payload?.id) {
      listIncome.forEach(income => {
        if (income.id === payload.id) {
          income.incomeType = payload.incomeType;
          income.ownership = payload.ownership;
          income.annualIncome = payload.annualIncome;
          income.ownershipStructure = payload.ownershipStructure;
        }
      });
    } else {
      const randomId = Date.now();
      const newIncome = { ...payload, id: randomId };
      listIncome.push(newIncome);
    }
    yield putResolve(updateDataIncome(listIncome));
    yield saveDataToLocalStorage({ incomes: listIncome });
  } else {
    const newList = [];
    listIncome.forEach(i => {
      if (i.id !== payload.id) {
        newList.push(i);
      }
    });
    yield putResolve(updateDataIncome(newList));
    yield saveDataToLocalStorage({ incomes: newList });
  }
}

function* updateListSpendingSaga(action) {
  const { payload, resolver } = action;
  const listSpending = yield select(selectSpending);

  let newList = [];
  if (listSpending?.length > 0) {
    payload?.forEach(item => {
      const spending = listSpending?.find(x => x.category === item.category);
      if (spending) {
        newList.push(merge(spending, item));
      } else {
        newList.push({
          ...item,
          category: item.category,
          type: item.type,
        });
      }
    });
  } else {
    newList = [...payload];
  }
  yield putResolve(updateDataSpending(newList));
  yield saveDataToLocalStorage({ spendings: newList });
  typeof resolver?.resolve === 'function' && resolver?.resolve();
}

function* updateSpendingSaga(action) {
  const { payload } = action;
  const listSpending = yield select(selectSpending);

  const newList = [...listSpending];
  if (payload?.category) {
    newList.forEach(spending => {
      if (spending.category === payload.category) {
        spending = merge(spending, payload);
      }
    });
  } else {
    newList.push(payload);
  }
  yield putResolve(updateDataSpending(newList));
  yield saveDataToLocalStorage({ spendings: newList });
}

function* setEmptyIncomeSaga() {
  yield putResolve(updateDataIncome([]));
  yield saveDataToLocalStorage({ incomes: [] });
}

function* finishInterviewSaga() {
  try {
    // yield put(resetData());
    NavigationServiceLib.reset(AppScreenID.Entry);
  } catch (error) {
    if (error?.message) {
      GlobalLib.Toast.get().toastError(error?.message);
    }
  }
}

export default function* defaultSaga() {
  yield takeLatest(ONBOARDING_LOAD_DATA_LOCAL_STORAGE, loadDataFromLocalStorageSaga);
  yield takeLatest(ONBOARDING_NEXT_STEP, nextStepSaga);
  yield takeLatest(ONBOARDING_PREV_STEP, previousStepSaga);
  yield takeLeading(ONBOARDING_SUBMIT, submitInterviewSaga);
  yield takeLatest(ONBOARDING_FINISH, finishInterviewSaga);
  yield takeLatest(ONBOARDING_UPDATE_ASSET_PROPERTY, updatePropertySaga);
  yield takeLatest(ONBOARDING_UPDATE_ASSET_BANK_ACCOUNT, updateBankAccountSaga);
  yield takeLatest(ONBOARDING_UPDATE_ASSET_INVESTMENT, updateInvestmentSaga);
  yield takeLatest(ONBOARDING_UPDATE_BORROWING_LIABILITY, updateLiabilitySaga);
  yield takeLatest(ONBOARDING_UPDATE_INCOME, updateIncomeSaga);
  yield takeLatest(ONBOARDING_UPDATE_SPENDING, updateSpendingSaga);
  yield takeLatest(ONBOARDING_UPDATE_LIST_SPENDING, updateListSpendingSaga);
  yield takeLatest(ONBOARDING_SET_EMPTY_INCOME, setEmptyIncomeSaga);
}
