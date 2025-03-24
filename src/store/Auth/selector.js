import i18n from 'bootstrap/i18n';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import _ from 'lodash';
import moment from 'moment';
import { createSelector } from 'reselect';
import { makeSelectPreferenceDomain } from 'store/Root/selector';

import { initialState } from './reducer';

export const makeSelectAuthDomain = state => state.auth || initialState;
export const makeSelectUserDomain = state => state?.auth?.user || initialState.user;

export const selectAccessToken = createSelector(makeSelectAuthDomain, state => state.accessToken);

export const selectRefreshToken = createSelector(makeSelectAuthDomain, state => state.refreshToken);
export const selectTask = createSelector(makeSelectAuthDomain, state => state.task);

export const selectPasswordToken = createSelector(
  makeSelectAuthDomain,
  state => state.passwordToken,
);

export const selectUser = createSelector(makeSelectUserDomain, user => {
  if (_.isNil(user) || _.isEmpty(user)) {
    return null;
  }
  const partnerUID = _.get(user, 'partnerUID');
  const hasPartnerAccount = _.get(user, 'hasPartnerAccount');
  const client1 = _.get(user, 'client.personalInfo.client1');
  const client2 = _.get(user, 'client.personalInfo.client2');
  const dependants = _.get(user, 'client.personalInfo.dependants') || [];
  const noOfKids = dependants.length;

  const _id = _.get(client1, '_id')?.trim();
  const firstName = _.get(client1, 'fName')?.trim();
  const lastName = _.get(client1, 'lName')?.trim();
  const dob = _.get(client1, 'dob')?.trim();
  const email = _.get(client1, 'email')?.trim();
  const mPhone = _.get(client1, 'mPhone')?.trim();
  const primaryUser = {
    _id,
    firstName,
    lastName,
    fullName: [firstName, lastName].join(' ').trim() || i18n.t('global.primaryUser'),
    dob,
    email,
    mPhone,
  };
  const income = _.get(user, 'client.income') || [];
  const borrowings = _.get(user, 'client.borrowings') || [];

  const partnerId = _.get(client2, '_id')?.trim();
  const partnerFirstName = _.get(client2, 'fName')?.trim();
  const partnerLastName = _.get(client2, 'lName')?.trim();
  const partnerDob = _.get(client2, 'dob')?.trim();
  const partnerEmail = _.get(client2, 'email')?.trim();
  const partnerMPhone = _.get(client2, 'mPhone')?.trim();
  const partner = {
    _id: partnerId,
    firstName: partnerFirstName,
    lastName: partnerLastName,
    fullName: [partnerFirstName, partnerLastName].join(' ').trim() || i18n.t('global.partner'),
    dob: partnerDob,
    email: partnerEmail,
    mPhone: partnerMPhone,
  };

  const currentUser = partnerUID ? partner : primaryUser;
  const currentPartner = partnerUID ? primaryUser : partner;

  const uid = _.get(user, '_id');

  let householdType;
  if (_.isEmpty(partnerId)) {
    householdType =
      noOfKids > 0 ? AppConstants.householdType.meKids : AppConstants.householdType.justMe;
  } else {
    householdType =
      noOfKids > 0 ? AppConstants.householdType.usKids : AppConstants.householdType.mePartner;
  }
  return {
    _id: currentUser._id,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    fullName: currentUser.fullName,
    email: currentUser.email,
    dob: currentUser.dob,
    mPhone: currentUser.mPhone,
    householdType,
    dependants,
    partner: currentPartner,
    noOfKids,
    unreadNotification: _.get(user, ['notification', 'unread']) || 0,
    income,
    partnerUID,
    hasPartnerAccount,
    client1,
    client2,
    uid,
    borrowings,
  };
});

export const selectLoginError = createSelector(makeSelectAuthDomain, state => state.error);

export const selectTermConditionContent = createSelector(
  makeSelectAuthDomain,
  state => state.termCondition,
);

export const makeSelectStaticValuesDomain = state => state.auth?.staticValues;

export const selectPrimaryPurpose = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let purposes = staticValues?.dropdown?.assets?.properties?.primaryPurpose;
  return UtilLib.mapDataForDropdown(purposes);
});

export const selectOwners = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let owners = _.get(staticValues, ['dropdown', 'general', 'owners']) || [];
  return owners.map((item, index) => {
    let ownershipType =
      item?.label === AppConstants.ownershipType.Joint
        ? AppConstants.ownershipType.Joint
        : AppConstants.ownershipType.Sole;
    const value = item?.value?.map((child, i) => ({
      _id: AppConstants.newObjectID.replace('1', `owner_${i + 1}`), // use for creating new data for ownership
      owner: child.owner,
      percentage: child.percentage,
    }));
    const label =
      item.label ||
      (index === 0
        ? i18n.t('global.primaryUser')
        : index === 1
        ? i18n.t('global.partner')
        : i18n.t('global.joint'));
    return {
      ownershipType: ownershipType,
      ownershipDesc: '',
      label: label,
      display: label,
      value: value?.map(v => v.owner)?.join('-') || value,
      owners: value,
    };
  });
});

export const selectOwnersWithOthers = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let owners = _.get(staticValues, ['dropdown', 'general', 'ownersWithOthers']) || [];
  return owners.map((item, index) => {
    let ownershipType =
      item?.label === AppConstants.ownershipType.Joint
        ? AppConstants.ownershipType.Joint
        : item?.label === AppConstants.ownershipType.Other
        ? AppConstants.ownershipType.Other
        : AppConstants.ownershipType.Sole;
    const value = item?.value?.map((child, i) => ({
      _id: AppConstants.newObjectID.replace('1', `owner_${i + 1}`), // use for creating new data for ownership
      owner: child.owner,
      percentage: child.percentage,
    }));
    const label =
      item.label ||
      (index === 0
        ? i18n.t('global.primaryUser')
        : index === 1
        ? i18n.t('global.partner')
        : i18n.t('global.joint'));
    return {
      ownershipType: ownershipType,
      ownershipDesc: '',
      label: label,
      display: label,
      value:
        item?.label === AppConstants.ownershipType.Other
          ? AppConstants.ownershipType.Other
          : value?.map(v => v.owner)?.join('-'),
      owners: value,
    };
  });
});

export const selectOwnersWithoutJoint = createSelector(selectOwners, owners =>
  owners.filter(o => o.owners.length <= 1),
);

export const selectFrequency = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let frequency = staticValues?.dropdown?.general?.frequency;
  return UtilLib.mapDataForDropdown(frequency);
});

export const selectDataIncomeType = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let incomeTypes = staticValues?.dropdown?.general?.incomeTypes;
  return UtilLib.mapDataForDropdown(incomeTypes);
});

export const selectDataAssetType = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let assetTypes = staticValues?.dropdown?.assets?.types;
  return UtilLib.mapDataForDropdown(assetTypes);
});

export const selectDataBillExpenseType = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let types = staticValues.dropdown?.expenses?.category?.bill;
    return UtilLib.mapDataForDropdown(types);
  },
);

export const selectDataSpendingExpenseType = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let types = staticValues.dropdown?.expenses?.category?.spending;
    return UtilLib.mapDataForDropdown(types);
  },
);
export const selectListExpenseTypes = createSelector(
  selectDataBillExpenseType,
  selectDataSpendingExpenseType,
  (bills, spendings) => [...bills, ...spendings],
);

export const selectDataAssetBankAccountType = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let accountTypes = staticValues?.dropdown?.assets?.bankAccounts?.type;
    return UtilLib.mapDataForDropdown(accountTypes);
  },
);

export const selectDataAssetVehicleType = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let vehicles = staticValues?.dropdown?.assets?.vehicles?.type;
    return UtilLib.mapDataForDropdown(vehicles);
  },
);

export const selectDataAssetVehicleYear = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let year = staticValues?.dropdown?.assets?.vehicles?.year;
    return UtilLib.mapDataForDropdown(year);
  },
);

export const selectDataAssetBankAccountInstitutions = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let institutions = staticValues?.dropdown?.assets?.bankAccounts?.institutions;
    return UtilLib.mapDataForDropdown(institutions);
  },
);

export const selectDataAssetSuperFundProductType = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let product = staticValues?.dropdown?.assets?.superFunds?.product;
    return UtilLib.mapDataForDropdown(product);
  },
);

export const selectDataAssetSuperFundStrategyType = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let strategy = staticValues?.dropdown?.assets?.superFunds?.strategy;
    return UtilLib.mapDataForDropdown(strategy);
  },
);

export const selectDataAssetSuperFundProviderType = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let provider = staticValues?.dropdown?.assets?.superFunds?.provider;
    return UtilLib.mapDataForDropdown(provider);
  },
);

export const selectExpenseType = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let spendings = staticValues?.dropdown?.expenses?.category?.spending || [];
  let bills = staticValues?.dropdown?.expenses?.category?.bill || [];
  spendings = spendings.map(s => ({ ...s, type: AppConstants.ExpenseGroups.Spending }));
  bills = bills.map(s => ({ ...s, type: AppConstants.ExpenseGroups.Bills }));
  let listSpending = [...bills, ...spendings];
  return UtilLib.mapDataForDropdown(listSpending);
});

export const selectDefaultValueExpense = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let spendings = staticValues?.default?.expenses?.bills || [];
    let bills = staticValues?.default?.expenses?.spending || [];
    spendings = spendings.map(s => ({ ...s, type: AppConstants.ExpenseGroups.Spending }));
    bills = bills.map(s => ({ ...s, type: AppConstants.ExpenseGroups.Bills }));
    return [...bills, ...spendings];
  },
);

export const selectLoanType = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let loanType = staticValues?.dropdown?.borrowings?.loanType;
  return UtilLib.mapDataForDropdown(loanType);
});

export const selectOwnershipStructure = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let data = staticValues?.dropdown?.general?.ownershipStructure;
    return UtilLib.mapDataForDropdown(data);
  },
);

export const selectActiveBankAccount = createSelector(makeSelectUserDomain, user => {
  let bankAccounts = user?.client?.assets?.bankAccounts;
  return UtilLib.mapDataForDropdown(bankAccounts);
});

export const selectJarsType = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let jars = staticValues?.dropdown?.moneySMARTS?.jars;
  return UtilLib.mapDataForDropdown(jars);
});

export const selectPrimaryPurposeBorrowing = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let purposes = staticValues?.dropdown?.borrowings?.primaryPurpose;
    if (_.isEmpty(purposes)) {
      return [];
    }
    return UtilLib.mapDataForDropdown(purposes);
  },
);

export const selectProviderBorrowing = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let providers = staticValues?.dropdown?.borrowings?.provider;
    if (_.isEmpty(providers)) {
      return [];
    }
    return UtilLib.mapDataForDropdown(providers);
  },
);

export const selectRepaymentType = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let repaymentTypes = staticValues?.dropdown?.borrowings?.repaymentType;
  if (_.isEmpty(repaymentTypes)) {
    return [];
  }
  return UtilLib.mapDataForDropdown(repaymentTypes);
});

export const selectOffsetAccounts = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let offsetAccounts = staticValues?.dropdown?.borrowings?.offsetAccounts;
  if (_.isEmpty(offsetAccounts)) {
    return [];
  }
  return UtilLib.mapDataForDropdown(offsetAccounts).map(a => ({ ...a, id: a.value }));
});

export const selectRepaymentAccounts = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let repaymentAccounts = staticValues?.dropdown?.borrowings?.repaymentAccounts;
    if (_.isEmpty(repaymentAccounts)) {
      return [];
    }
    return UtilLib.mapDataForDropdown(repaymentAccounts).map(a => ({ ...a, id: a.value }));
  },
);
export const selectEmploymentBasis = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let employmentBasis = staticValues?.dropdown?.general?.employmentBasis;
  if (_.isEmpty(employmentBasis)) {
    return [];
  }
  return UtilLib.mapDataForDropdown(employmentBasis);
});
export const selectAssessedTaxReturn = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let assessedTaxReturn = staticValues?.dropdown?.income?.assessedTaxReturn?.FY;
    if (_.isEmpty(assessedTaxReturn)) {
      return [];
    }
    return UtilLib.mapDataForDropdown(assessedTaxReturn);
  },
);

export const selectDefaultPropertyHoldingCosts = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let product = staticValues?.default?.defaultPropertyHoldingCosts;
    if (_.isEmpty(product)) {
      return [];
    }
    return [...product].map(item => {
      return {
        ...item,
        id: item?.value?.replaceAll('.', '') || '',
      };
    });
  },
);
export const selectDefaultInvestmentHoldingCosts = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let product = staticValues?.default?.defaultInvestmentHoldingCosts;
    if (_.isEmpty(product)) {
      return [];
    }
    return [...product].map(item => {
      return {
        ...item,
        id: item?.value?.replaceAll('.', '') || '',
      };
    });
  },
);

export const selectAssetPropertyTypes = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let purposes = staticValues?.dropdown?.assets?.properties?.propertyTypes;
    return UtilLib.mapDataForDropdown(purposes);
  },
);

export const selectAssetInvestmentTypes = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let type = staticValues?.dropdown?.assets?.investment?.type;
    return UtilLib.mapDataForDropdown(type);
  },
);

export const selectAssetTitleTypes = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let purposes = staticValues?.dropdown?.assets?.properties?.titleTypes;
  return UtilLib.mapDataForDropdown(purposes);
});

export const selectAssetMaterialTypes = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let purposes = staticValues?.dropdown?.assets?.properties?.materialTypes;
    return UtilLib.mapDataForDropdown(purposes);
  },
);

export const selectConditionTypes = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let conditionTypes = staticValues?.dropdown?.assets?.properties?.conditionTypes;
  return UtilLib.mapDataForDropdown(conditionTypes);
});

export const selectAssetLotUnits = createSelector(makeSelectStaticValuesDomain, staticValues => {
  let purposes = staticValues?.dropdown?.assets?.properties?.lotUnits;
  return UtilLib.mapDataForDropdown(purposes);
});

export const selectServerDate = createSelector(makeSelectAuthDomain, auth => {
  let time = auth?.time;
  return time;
});

export const selectServerDateInDate = createSelector(makeSelectAuthDomain, auth => {
  let time = auth?.time;
  try {
    return moment.utc(time).startOf('day').toISOString();
  } catch (error) {
    return time;
  }
});

export const selectServerDateInMinuteHour = createSelector(makeSelectAuthDomain, auth => {
  let time = auth?.time;
  try {
    return moment.utc(time).startOf('minute').toISOString();
  } catch (error) {
    return time;
  }
});

export const selectFlags = createSelector(
  makeSelectUserDomain,
  makeSelectPreferenceDomain,
  (user, preferences) => {
    let featureFlags = _.get(user, 'featureFlags') || [];
    if (preferences?.featureFlags) {
      featureFlags = [...featureFlags, ...preferences?.featureFlags];
    }
    const getFeatureFlagsById = identifier => {
      const found = featureFlags?.some(flag => flag?.identifier === identifier);
      return found;
    };
    const wealthSpeedMenuVisible = getFeatureFlagsById('mobile.wealthspeed.menu');
    const wealthSpeedHomeDashboardVisible = getFeatureFlagsById('mobile.wealthspeed.homedashboard');
    const expenseDashboardVisible = getFeatureFlagsById('mobile.expensedashboard');
    const inAppReviewVisible = getFeatureFlagsById('mobile.inappreview');
    const asAtDateVisible = getFeatureFlagsById('mobile.asat.date');
    const contributionsVisible = getFeatureFlagsById('asat.migration.contributions');
    const asAtMigrationIncome = getFeatureFlagsById('asat.migration.income');
    const assetExpenseCards = getFeatureFlagsById('mobile.asset.expensecards');
    const assetIncomeCards = getFeatureFlagsById('mobile.asset.incomecards');
    const wealthUpgradeNotification = getFeatureFlagsById(
      'mobile.wealthdashboard.upgradenotification',
    );
    const gnafVisible = getFeatureFlagsById('address.gnaf');
    const cashPosition = getFeatureFlagsById('insight.mobile.cashposition');
    const netWorth = getFeatureFlagsById('insight.mobile.networth');
    const assetPosition = getFeatureFlagsById('insight.mobile.assetposition');
    const debtPosition = getFeatureFlagsById('insight.mobile.debtposition');
    const checkUpFlow = getFeatureFlagsById('moneysmarts.mobile.checkupflow');
    const checkupAsAt = getFeatureFlagsById('moneysmarts.checkup.asat');
    const checkUpPage = getFeatureFlagsById('moneysmarts.mobile.checkuppage');
    const cardDepreciationMobile = getFeatureFlagsById('card.depreciation');
    const mobileCardTabs = getFeatureFlagsById('mobile.cardtabs');
    const mobileCardTabsInsights = getFeatureFlagsById('mobile.cardtabs.insights');
    const mobileCardTabsTransactions = getFeatureFlagsById('mobile.cardtabs.transactions');
    const trackInMoneySMARTS = getFeatureFlagsById('moneysmarts.checkup.trackinmoneysmarts');
    const deductibilityFields = getFeatureFlagsById('deductibility.fields');
    const deductibilityOwnerOccupied = getFeatureFlagsById('deductibility.owneroccupied');

    const myknowledgeMobile = getFeatureFlagsById('myknowledge.mobile');

    const nextDates = getFeatureFlagsById('cards.nextdates');

    const professionalServices = getFeatureFlagsById('professionalservices');
    const insightsMobileOvertimeChart = getFeatureFlagsById('insights.mobile.overtime.chart');

    const insightsMobileOffsetBenefit = getFeatureFlagsById('insights.mobile.offset.benefit');

    return {
      wealthSpeedMenuVisible,
      wealthSpeedHomeDashboardVisible,
      expenseDashboardVisible,
      inAppReviewVisible,
      asAtDateVisible,
      contributionsVisible,
      asAtMigrationIncome,
      assetIncomeCards,
      assetExpenseCards,
      wealthUpgradeNotification,
      gnafVisible,
      cashPosition,
      netWorth,
      assetPosition,
      debtPosition,
      checkUpFlow,
      checkUpPage,
      cardDepreciationMobile,
      mobileCardTabs,
      mobileCardTabsInsights,
      mobileCardTabsTransactions,
      checkupAsAt,
      trackInMoneySMARTS,
      deductibilityFields,
      deductibilityOwnerOccupied,
      nextDates,
      myknowledgeMobile,
      professionalServices,
      insightsMobileOvertimeChart,
      insightsMobileOffsetBenefit,
    };
  },
);

export const selectInvestmentHoldingCostsType = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let types = staticValues.dropdown?.expenses?.category?.investmentHoldingCosts;
    return UtilLib.mapDataForDropdown(types);
  },
);

export const selectPropertyHoldingCostsType = createSelector(
  makeSelectStaticValuesDomain,
  staticValues => {
    let types = staticValues.dropdown?.expenses?.category?.propertyHoldingCosts;
    return UtilLib.mapDataForDropdown(types);
  },
);
