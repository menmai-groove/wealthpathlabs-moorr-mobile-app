import { Platform } from 'react-native';

const defaultColor = ['#888888', '#888888'];
const imagesDirPath = Platform.OS === 'ios' ? '' : 'asset:/images/';
const wealthKeys = {
  wealthCLOCK: 'wealthCLOCK',
  wealthSPEED: 'wealthSPEED',
  incomeSpeed: 'incomeSpeed',
  assetSpeed: 'assetSpeed',
  savingSpeed: 'savingSpeed',
  spendingSpeed: 'spendingSpeed',
  debtReductionSpeed: 'debtReductionSpeed',

  personalPropertyValueSpeed: 'personalPropertyValueSpeed',
  investmentPropertyValueSpeed: 'investmentPropertyValueSpeed',
  otherInvestmentValueSpeed: 'otherInvestmentValueSpeed',
  superannuationSpeed: 'superannuationSpeed',

  passiveIncomeSpeed: 'passiveIncomeSpeed',
  rentalIncomeSpeed: 'rentalIncomeSpeed',
  investmentIncomeSpeed: 'investmentIncomeSpeed',
  workingIncomeSpeed: 'workingIncomeSpeed',

  nestEggSPEED: 'nestEggSPEED',
};

export default {
  feedbackTypes: {
    appReview: 'app-review',
  },
  sharedElementPrefixId: {
    animatedItem: 'animated-item',
  },
  analytics: {
    eventTypes: {
      screenView: 'screen_view',
      signUp: 'signup',
      resetPassword: 'reset_password',
      login: 'user_login',
      id: 'id',
      username: 'user_name',
      signOut: 'user_signOut',
      switchLanguage: 'switch_language',
      skipOnboarding: 'skip_onboarding',
      completeOnboarding: 'complete_onboarding',
      changePassword: 'change_password',
      updateProfile: 'update_profile',
      enableBiometric: 'enable_biometric',
      disableBiometric: 'disable_biometric',
      addTransaction: 'add_transaction',
      deleteTransaction: 'delete_transaction',
      startCheckup: 'start_checkup',
      addCheckup: 'add_checkup',
      rolloverCheckup: 'rollover_checkup',
      addPersonalGoal: 'add_personal_goal',
      deletePersonalGoal: 'delete_personal_goal',
      notificationReceived: 'notification_received',
      notificationOpened: 'notification_opened',
      wealthDashboardShowDetails: 'wealth_dashboard_show_details',
      wealthDashboardChangeChartRange: 'wealth_dashboard_change_chart_range',
      wealthDashboardChangeChartType: 'wealth_dashboard_change_chart_type',
      wealthDashboardLoad: 'wealth_dashboard_load',

      userCardCreate: 'user_card_create',
      userCardStatusChange: 'user_card_status_change',
      userCardDelete: 'user_card_delete',

      historicalLogOpen: 'historical_log_open',
      historicalLogClose: 'historical_log_close',
      historicalLogAdd: 'historical_log_add',
      historicalLogDelete: 'historical_log_delete',
      historicalLogEdit: 'historical_log_edit',

      moneySMARTSTrackingSetupStart: 'moneysmarts_tracking_setup_start',
      moneySMARTSTrackingSetupComplete: 'moneysmarts_tracking_setup_complete',
    },
    userProperties: {
      name: 'user_name',
      tenant: 'user_tenant',
    },
    params: {
      chartType: {
        netWorthBreakdown: 'net_worth_breakdown',
        wealthTracker: 'wealth_tracker',
        speedGauge: 'speed_gauge',
      },
    },
  },
  notificationType: {
    MoneySmartsReminder: 'MoneySmartsReminder',
    MoneySmartsTargetedSurplus: 'MoneySmartsTargetedSurplus',
    PersonalGoals: 'PersonalGoals',
    Wealth: 'Wealth',
    Campaign: 'Campaign',
    Link: 'Link',
    UI: 'UI',
  },
  notificationTopic: {
    Global: 'global',
    Authorized: 'authorized',
  },
  defaultLanguage: 'en',
  defaultLanguageNamespace: 'translation',
  availableLanguages: [{ value: 'en', label: 'English' }],
  householdType: {
    justMe: 0,
    mePartner: 1,
    meKids: 2,
    usKids: 3,
  },
  householdName: {
    0: 'Just me',
    1: 'Me & Partner',
    2: 'Me & Kids',
    3: 'Us & Kids',
  },
  documentState: {
    OPEN: 'OPEN',
    DONE: 'DONE',
  },
  unexpectedError: {
    responseNotSuccess: 'Response not successful',
    receiveStatusCode: 'Received status code',
  },
  biometric: {
    maximumNumberOfAccounts: 10,
  },
  layout: {
    menu: {
      buttonSize: 56,
      floatingBottom: 20,
    },
  },
  listTypeByJars: {
    Provision: 'Provision Jar',
    Living_LifeStyle: 'L & L JAR',
    Credit: 'Credit Card JAR',
    Direct: 'Direct Payments JAR',
    Loans: 'Loans Jar',
    Primary_Saving: 'Primary Account - Savings',
  },
  listTypeJarByMoneyOutExpense: {
    Provision: 'Provision',
    Living_LifeStyle: 'Living & Lifestyle',
    Credit: 'Credit Card',
    Direct: 'Primary Direct',
    Loans: 'Loans',
    Primary_Saving: 'Primary Account - Savings',
  },
  newObjectID: '__ObjectId__1',
  newObjectIDForTypes: {
    Borrowing: '__ObjectId__loan',
    Property: '__ObjectId__property',
    Investment: '__ObjectId__investment',
    Expense: '__ObjectId__expense',
    Income: '__ObjectId__income',
    AdhocIncome: '__ObjectId__adhocincome',
  },
  Borrowing: {
    Mortgage: 'Mortgage',
    LoanType: {
      Other: 'Other',
    },
    Jar: 'Loans Jar',
  },
  ownershipType: {
    Joint: 'Joint',
    Sole: 'Sole',
    Other: 'Other',
  },
  AssetType: {
    Property: 'Property',
    Investments: 'Investments',
    Vehicles: 'Vehicles',
    BankAccounts: 'Bank Accounts',
    Superannuation: 'Superannuation',
    LifeInsurance: 'Life Insurance',
    OtherAssets: 'Other Assets',
  },
  IncomeType: {
    PayG: 'PAYG',
    SelfEmployed: 'Self Employed',
    Business: 'Business',
    GovtFamily: 'Govt - Family Allowance',
    GovtUnemploued: 'Govt - Unemployed',
    GovtWindowed: 'Govt - Widowed Allowance',
    PrivatePension: 'Private Pension',
    Other: 'Other',
    InvestmentIncome: 'Investment',
    PropertyIncome: 'Investment Property',
  },
  ExpenseGroups: {
    Investment: 'InvestmentAsset',
    Property: 'InvestmentProperties',
    Bills: 'Bills',
    Spending: 'Spending',
    PersonalUse: 'PersonalUse',
  },
  AssetExpenseType: {
    Investment: 'Investment Assets',
    Property: 'Investment Properties',
    PersonalUse: 'Personal Use',
  },
  defaultColor,
  keyColors: [
    // 2
    {
      color: ['#B178FC', '#8E57FC'],
    },
    {
      color: ['#FD8F65', '#FD8152'],
    },
    {
      color: ['#5EC9FD', '#40BFFD'],
    },
    {
      color: ['#44E7B6', '#19D59B'],
    },
    {
      color: ['#E941CA', '#B812F2'],
    },
    {
      color: ['#517CFC', '#5B59FA'],
    },
    {
      color: ['#FD4B6B', '#FD5170'],
    },
    {
      color: ['#FFB022', '#DB9B2C'],
    },
    {
      color: ['#6BD0E8', '#1BA2C3'],
    },
    {
      color: ['#D1EB00', '#A1DD00'],
    },
    {
      color: ['#00FE6D', '#00D85D'],
    },

    // 3
    {
      color: ['#9B61EA', '#5E40C3'],
    },
    {
      color: ['#E28452', '#B4492E'],
    },
    {
      color: ['#3085BA', '#14679B'],
    },
    {
      color: ['#14B686', '#06966C'],
    },
    {
      color: ['#B81FC3', '#91019B'],
    },
    {
      color: ['#5B5AFA', '#3548D8'],
    },
    {
      color: ['#D6405D', '#C7314E'],
    },
    {
      color: ['#C08721', '#B17100'],
    },
    {
      color: ['#148BA8', '#016A83'],
    },
    {
      color: ['#79B805', '#659905'],
    },
    {
      color: ['#00D059', '#00AD4B'],
    },

    // 4
    {
      color: ['#5130DE', '#3C1CC6'],
    },
    {
      color: ['#943A2A', '#812B1B'],
    },
    {
      color: ['#266399', '#004888'],
    },
    {
      color: ['#0F9871', '#007E5A'],
    },
    {
      color: ['#641A89', '#460069'],
    },
    {
      color: ['#4143A9', '#292C93'],
    },
    {
      color: ['#AE3049', '#930F29'],
    },
    {
      color: ['#A57416', '#88450A'],
    },
    {
      color: ['#0E758C', '#0A5262'],
    },
    {
      color: ['#51930A', '#3C7400'],
    },
    {
      color: ['#00B24C', '#008337'],
    },

    // 5
    {
      color: ['#2301CB', '#120166'],
    },
    {
      color: ['#712920', '#5F0B00'],
    },
    {
      color: ['#1C497F', '#002F67'],
    },
    {
      color: ['#0A795C', '#00654B'],
    },
    {
      color: ['#401276', '#2C0067'],
    },
    {
      color: ['#202783', '#271F84FC'],
    },
    {
      color: ['#871F36', '#600014'],
    },
    {
      color: ['#895D00', '#653F02'],
    },
    {
      color: ['#075E71', '#004D5D'],
    },
    {
      color: ['#248800', '#1E4600'],
    },
    {
      color: ['#008037', '#00622A'],
    },

    // 1
    {
      color: ['#D4B6FC', '#AD7AF0'],
    },
    {
      color: ['#FCC6B1', '#FFA584'],
    },
    {
      color: ['#97DBFC', '#72CEFC'],
    },
    {
      color: ['#A4F2DB', '#76D6B8'],
    },
    {
      color: ['#FFA6EF', '#DA73FF'],
    },
    {
      color: ['#8CA9FF', '#7573FF'],
    },
    {
      color: ['#FF8CA1', '#FF738C'],
    },
    {
      color: ['#FFE08C', '#DBAF63'],
    },
    {
      color: ['#97D8E8', '#6BB0C2'],
    },
    {
      color: ['#E1EB98', '#BDDE64'],
    },
    {
      color: ['#8CFF8C', '#57D984'],
    },
  ],
  financialAssetTypes: [
    { value: 'Investments', key: 'investments' },
    { value: 'Property', key: 'properties' },
    { value: 'Vehicles', key: 'vehicles' },
    { value: 'Bank Accounts', key: 'bankAccounts' },
    { value: 'Superannuation', key: 'superFunds' },
    { value: 'Other Assets', key: 'otherAssets' },
    { value: 'Life Insurance', key: 'lifeInsurance' },
  ],
  belongToAssetKeys: [
    { category: 'Property', value: 'property' },
    { category: 'Investments', value: 'investmentAssetBills' },
  ],
  ClientHistoryQuery: {
    ClientSurvey: 'Client Survey',
    PersonalInfo: 'Personal Info',
    Income: 'Income',
    BillPayments: 'Bill Payments',
    Expenses: 'Expenses',
    Properties: 'Properties',
    NonPropertyAssets: 'Non-Property Assets',
    Borrowings: 'Loans/Borrowings',
    LiteFactFind: 'Lite Fact Find',
  },
  currencyValue: {
    max: 100000000,
    min: 0,
  },
  idTaxDeductions: 'taxDeductions',
  defaultIncomeFrequency: 'Yearly',
  keyExcludeNetMonthlyIncome: ['Total Gross Income', 'Taxable Income', 'Total Net Income'],
  listIconGoal: [
    {
      uuidFileName: 'home.png',
      type: 'image/png',
      source: imagesDirPath + 'home.png',
    },
    {
      uuidFileName: 'home-money.png',
      type: 'image/png',
      source: imagesDirPath + 'home-money.png',
    },
    {
      uuidFileName: 'tree.png',
      type: 'image/png',
      source: imagesDirPath + 'tree.png',
    },
    {
      uuidFileName: 'car.png',
      type: 'image/png',
      source: imagesDirPath + 'car.png',
    },
    {
      uuidFileName: 'saving.png',
      type: 'image/png',
      source: imagesDirPath + 'saving.png',
    },
    {
      uuidFileName: 'plane.png',
      type: 'image/png',
      source: imagesDirPath + 'plane.png',
    },
    {
      uuidFileName: 'coconut.png',
      type: 'image/png',
      source: imagesDirPath + 'coconut.png',
    },
    {
      uuidFileName: 'firework.png',
      type: 'image/png',
      source: imagesDirPath + 'firework.png',
    },
    {
      uuidFileName: 'speed.png',
      type: 'image/png',
      source: imagesDirPath + 'speed.png',
    },
    {
      uuidFileName: 'family.png',
      type: 'image/png',
      source: imagesDirPath + 'family.png',
    },
    {
      uuidFileName: 'feet.png',
      type: 'image/png',
      source: imagesDirPath + 'feet.png',
    },
    {
      uuidFileName: 'run.png',
      type: 'image/png',
      source: imagesDirPath + 'run.png',
    },
  ],
  wealthKeys,
  wealthTreeData: [
    {
      key: wealthKeys.savingSpeed,
      primary: true,
      color: '#66E84B',
      children: [
        {
          key: wealthKeys.incomeSpeed,
          primary: true,
          color: '#27AE60',
        },
        {
          key: wealthKeys.spendingSpeed,
          color: '#FFA850',
        },
      ],
    },
    {
      key: wealthKeys.assetSpeed,
      color: '#0086FF',
      children: [
        {
          key: wealthKeys.personalPropertyValueSpeed,
          secondary: true,
          color: '#008FEB',
        },
        {
          key: wealthKeys.investmentPropertyValueSpeed,
          secondary: true,
          color: '#008FEB',
        },
        {
          key: wealthKeys.otherInvestmentValueSpeed,
          secondary: true,
          color: '#008FEB',
        },
        {
          key: wealthKeys.superannuationSpeed,
          secondary: true,
          color: '#008FEB',
        },
      ],
    },
    {
      key: wealthKeys.incomeSpeed,
      primary: true,
      color: '#27AE60',
      children: [
        {
          key: wealthKeys.workingIncomeSpeed,
          secondary: true,
          color: '#38C976',
        },
        {
          key: wealthKeys.passiveIncomeSpeed,
          secondary: true,
          color: '#38C976',
        },
        {
          key: wealthKeys.rentalIncomeSpeed,
          secondary: true,
          color: '#38C976',
        },
        {
          key: wealthKeys.investmentIncomeSpeed,
          secondary: true,
          color: '#38C976',
        },
      ],
    },
    {
      key: wealthKeys.wealthSPEED,
      color: '#72228D',
      children: [
        {
          key: wealthKeys.assetSpeed,
          color: '#0086FF',
        },
        {
          key: wealthKeys.savingSpeed,
          primary: true,
          color: '#66E84B',
        },
        {
          key: wealthKeys.debtReductionSpeed,
          color: '#E34242',
        },
      ],
    },
    {
      key: wealthKeys.debtReductionSpeed,
      color: '#E34242',
    },
    {
      key: wealthKeys.nestEggSPEED,
      secondary: true,
      color: '#008FEB',
    },
  ],
  listWealthType: [
    {
      key: wealthKeys.wealthSPEED,
      label: 'WealthSPEED',
      trademark: 'registered',
      color: '#72228D',
    },
    {
      key: wealthKeys.assetSpeed,
      label: 'AssetSPEED',
      trademark: 'trademark',
      color: '#0086FF',
    },
    {
      key: wealthKeys.debtReductionSpeed,
      label: 'Debt ReductionSPEED',
      trademark: 'trademark',
      color: '#E34242',
    },
    {
      key: wealthKeys.savingSpeed,
      label: 'SavingSPEED',
      trademark: 'trademark',
      color: '#66E84B',
    },
    {
      key: wealthKeys.incomeSpeed,
      label: 'NetIncomeSPEED',
      trademark: 'trademark',
      color: '#27AE60',
    },
    {
      key: wealthKeys.spendingSpeed,
      label: 'SpendingSPEED',
      trademark: 'trademark',
      color: '#FFA850',
    },
    {
      key: wealthKeys.wealthCLOCK,
      label: 'WealthCLOCK',
      trademark: 'registered',
      color: '#72228D',
    },

    {
      key: wealthKeys.personalPropertyValueSpeed,
      label: 'PersonalPropertyValueSPEED',
      color: '#008FEB',
    },
    {
      key: wealthKeys.investmentPropertyValueSpeed,
      label: 'InvestmentPropertyValueSPEED',
      color: '#008FEB',
    },
    {
      key: wealthKeys.otherInvestmentValueSpeed,
      label: 'OtherInvestmentValueSPEED',
      color: '#008FEB',
    },
    {
      key: wealthKeys.superannuationSpeed,
      label: 'SuperannuationSPEED',
      color: '#008FEB',
    },

    {
      key: wealthKeys.passiveIncomeSpeed,
      label: 'PassiveIncomeSPEED',
      color: '#38C976',
    },
    {
      key: wealthKeys.rentalIncomeSpeed,
      label: 'RentalIncomeSpeed',
      color: '#38C976',
    },
    {
      key: wealthKeys.investmentIncomeSpeed,
      label: 'InvestmentIncomeSPEED',
      color: '#38C976',
    },
    {
      key: wealthKeys.workingIncomeSpeed,
      label: 'WorkingIncomeSPEED',
      color: '#38C976',
    },
  ],
  dropdownDataFilterChart: [
    { value: '1M', display: '1M' },
    { value: '3M', display: '3M' },
    { value: '6M', display: '6M' },
    { value: '12M', display: '12M' },
    { value: '2Y', display: '2Y' },
    { value: '3Y', display: '3Y' },
    { value: 'MAX', display: 'ALL' },
  ],
  listFilterChart: [
    {
      value: 'M',
      label: 'M',
      months: 1,
      totalDay: 31,
    },
    {
      value: '3M',
      label: '3M',
      months: 3,
      totalDay: 90,
    },
    {
      value: '6M',
      label: '6M',
      months: 6,
      totalDay: 186,
      reference: '6 Months',
    },
    {
      value: 'Y',
      label: 'Y',
      months: 12,
      totalDay: 365,
      reference: '1 YEAR',
    },
    {
      value: '2Y',
      label: '2Y',
      months: 24,
      totalDay: 730,
      reference: '2 Years',
      // changeValue: 434.32,
    },
    {
      value: 'ALL',
      label: 'ALL',
      reference: 'ALL',
      // changeValue: -434.32,
    },
  ],
  wealthKeyQueryDataChart: {
    wealthCLOCK: 'wealthCLOCK',
    wealthSPEED: 'wealthSPEED',
    incomeSpeed: 'cashflowSpeed{incomeSpeed{householdIncomeSpeed}}',
    assetSpeed: 'investmentSpeed{assetSpeed}',
    savingSpeed: 'cashflowSpeed{savingSpeed}',
    spendingSpeed: 'cashflowSpeed{spendingSpeed}',
    debtReductionSpeed: 'investmentSpeed{debtReductionSpeed}',

    personalPropertyValueSpeed:
      'investmentSpeed{personalPropertyValueSpeed{householdPersonalPropertyValueSpeed}}',
    investmentPropertyValueSpeed:
      'investmentSpeed{investmentPropertyValueSpeed{householdInvestmentPropertyValueSpeed}}',
    otherInvestmentValueSpeed:
      'investmentSpeed{otherInvestmentValueSpeed{householdOtherInvestmentValueSpeed}}',
    superannuationSpeed: 'investmentSpeed{superannuationSpeed{householdSuperannuationSpeed}}',

    passiveIncomeSpeed: 'cashflowSpeed{passiveIncomeSpeed{householdPassiveIncomeSpeed}}',
    rentalIncomeSpeed: 'cashflowSpeed{rentalIncomeSpeed{householdRentalIncomeSpeed}}',
    investmentIncomeSpeed: 'cashflowSpeed{investmentIncomeSpeed{householdInvestmentIncomeSpeed}}',
    workingIncomeSpeed: 'cashflowSpeed{workingIncomeSpeed{householdWorkingIncomeSpeed}}',

    nestEggSPEED: 'nestEggSPEED',
    netWorthPosition: `netWorthPosition {
      liabilities {
        breakdown {
          personalPropertyLoans
          investmentPropertyLoans
          otherLoans
        }
        totalLiabilities
      }
      assets {
        breakdown {
          superannuation
          properties
          bankAccounts
          vehicles
          investments
          otherAssets
        }
        totalAssets
      }
      netWorth
    }`,
  },
  graphWidth: 600,
  frequencyMultiplier: [
    {
      value: 'Weekly',
      multiplier: 52,
    },
    {
      value: 'Fortnightly',
      multiplier: 26,
    },
    {
      value: 'Monthly',
      multiplier: 12,
    },
    {
      value: 'Every 2 months',
      multiplier: 6,
    },
    {
      value: 'Every 3 months',
      multiplier: 4,
    },
    {
      value: 'Every 6 months',
      multiplier: 2,
    },
    {
      value: 'Yearly',
      multiplier: 1,
    },
  ],
  cardCategory: {
    Asset: 'Asset',
    Income: 'Income',
    Expense: 'Expense',
    Borrowing: 'Borrowing',
  },
  depreciation: {
    header: 'Annual Depreciation Amount',
    depreciationMethod: [
      { label: 'Prime Cost', display: 'Prime Cost', value: 'Prime Cost' },
      { label: 'Diminishing Value', display: 'Diminishing Value', value: 'Diminishing Value' },
    ],
  },
  dropdownOptions: [
    { label: 'Yes', display: 'Yes', value: true },
    { label: 'No', display: 'No', value: false },
  ],
};
