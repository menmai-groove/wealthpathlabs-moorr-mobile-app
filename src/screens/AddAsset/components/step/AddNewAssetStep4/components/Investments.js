import BreakdownCard from 'components/basics/BreakdownCard';
import DynamicForm from 'components/basics/DynamicForm';
import NextPayDateModal from 'components/basics/NextPayDateModal';
import { AppConstants } from 'constant';
import Constants from 'constant/constants';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { cloneDeep, get, isDate, isEmpty, isNil, omit, omitBy, sortBy, toNumber } from 'lodash';
import moment from 'moment';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { RECORD_TYPE, updateTime } from 'screens/HistoricalLog';
import { addInvestmentAsset } from 'store/Asset/action';
import getModule from 'store/Asset/module';
import {
  selectAssetId,
  selectAssetName,
  selectAssetOwnership,
  selectAssetType,
} from 'store/Asset/selector';
import {
  selectAssetInvestmentTypes,
  selectDefaultInvestmentHoldingCosts,
  selectFlags,
  selectFrequency,
  selectOwnersWithOthers,
  selectServerDateInDate,
  selectUser,
} from 'store/Auth/selector';
import { updateNextPayDateStart } from 'store/FinancialDashboard/action';
import { selectAppPreference } from 'store/Root/selector';

const formatFormJsonDeprecated = require('assets/forms/layouts/investments/asset-edit-investment-deprecated.json');
const formatFormJson = require('assets/forms/layouts/investments/asset-edit-investment.json');
const fieldForm = {
  id: '',
  component: 'input',
  visible: true,
  value: '',
  label: '',
  dataType: 'number',
  formatData: 'currency',
};

function Investments({
  formRef,
  editData,
  onFirstTimeDataChange,
  onErrorForm,
  disabled,
  onSubmit,
}) {
  const dispatchResolve = useDispatchResolve();
  const currentTime = useSelector(selectServerDateInDate);
  const assetName = useSelector(selectAssetName);
  const assetId = useSelector(selectAssetId);
  const userOwnerships = useSelector(selectOwnersWithOthers);
  const defaultInvestmentHoldingCosts = useSelector(selectDefaultInvestmentHoldingCosts);
  const assetOwnership = useSelector(selectAssetOwnership);
  const frequencyType = useSelector(selectFrequency);
  const investmentTypeList = useSelector(selectAssetInvestmentTypes);
  const {
    historicalCapitalGrowthMaxValue,
    historicalCapitalGrowthMaxDisplayValue,
    historicalCapitalGrowthMinValue,
  } = useSelector(selectAppPreference);
  const { contributionsVisible, assetIncomeCards, assetExpenseCards, nextDates } =
    useSelector(selectFlags);

  const user = useSelector(selectUser);
  const assetType = useSelector(selectAssetType);
  const nextContributionDateStartRef = useRef(null);
  const hasPartner = user.partner?._id;

  const getClient = useMemo(() => {
    return {
      client1: get(userOwnerships, [0]),
      client2: get(userOwnerships, [1]),
      joint: get(
        userOwnerships.filter(item => item.label === AppConstants.ownershipType.Joint),
        [0],
      ),
    };
  }, [userOwnerships]);

  const paymentFrequencyOnChange = useCallback((_field, value) => {
    const assetDetail = editData;
    const nextContributionDateField = formRef.current?.getFormValue('nextContributionDate');
    if (!isDate(nextContributionDateField)) {
      return;
    }
    const { nextContributionDate } = assetDetail;
    nextContributionDateStartRef.current = nextContributionDateField ?? nextContributionDate;
    GlobalLib.CustomModal.get().show({
      onBackdropPress: () => GlobalLib.CustomModal.get().hide(),
      body: (
        <NextPayDateModal
          date={nextContributionDateStartRef.current}
          title={'Does this change your next contribution date?'}
          content={
            'You have updated your payment frequency, does this change your next contribution date?'
          }
          dateLabelText={'Next Contribution Date'}
          onCancel={() => GlobalLib.CustomModal.get().hide()}
          onSubmit={data => {
            const _id = get(assetDetail, ['_id']);
            const nextPayDateStartValue = get(data, ['date']);
            const frequencyValue = get(value, ['value']);
            const assetsData = {
              cardType: 'assets',
              _id,
              nextPayDateStart: nextPayDateStartValue,
              frequency: frequencyValue,
              frequencyField: 'contributionFrequency',
            };
            GlobalLib.CustomModal.get().hide();
            dispatchResolve(updateNextPayDateStart(assetsData)).then(response => {
              const _nextContributionDate = get(response, 'nextContributionDate');
              if (_nextContributionDate) {
                formRef.current?.setFormValue(
                  'nextContributionDate',
                  moment(_nextContributionDate).toDate(),
                );
                nextContributionDateStartRef.current = nextPayDateStartValue;
              }
            });
          }}
        />
      ),
    });
  }, []);

  const data = useMemo(() => {
    const { client1, client2, joint } = getClient;
    const jsonObject = cloneDeep(contributionsVisible ? formatFormJson : formatFormJsonDeprecated);
    const layout = jsonObject.layout;
    layout.forEach(group => {
      group.fields = group.fields?.filter(x =>
        !hasPartner ? x.id !== 'ownershipSplitPerson2' : true,
      );
      group.fields.forEach(field => {
        if (field?.fields) {
          field.fields = field?.fields.filter(x =>
            !hasPartner ? x.id !== 'ownershipSplitPerson2' : true,
          );
        }
      });
    });

    const cardName = UtilLib.getFieldFromFormJSON(layout, 'name');
    cardName.value = assetName;
    const owner = UtilLib.getFieldFromFormJSON(layout, 'ownership');
    owner.options = cloneDeep(userOwnerships);
    owner.value = assetOwnership;
    const ownershipAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'ownershipAsAt');
    ownershipAsAtForm.value = UtilLib.dateUTCAsAt(Date.now());
    const incomeFrequencyForm = UtilLib.getFieldFromFormJSON(layout, 'incomeFrequency');
    if (incomeFrequencyForm) {
      incomeFrequencyForm.options = frequencyType;
      if (!isEmpty(incomeFrequencyForm.value)) {
        incomeFrequencyForm.value = frequencyType.find(
          f => f.value === incomeFrequencyForm.value?.value,
        );
      }
    }
    const adIncomeFrequencyForm = UtilLib.getFieldFromFormJSON(layout, 'adIncomeFrequency');
    if (adIncomeFrequencyForm) {
      adIncomeFrequencyForm.options = frequencyType;
      if (!isEmpty(adIncomeFrequencyForm.value)) {
        adIncomeFrequencyForm.value = frequencyType.find(
          f => f.value === adIncomeFrequencyForm.value?.value,
        );
      }
    }
    const investmentTypeForm = UtilLib.getFieldFromFormJSON(layout, 'investmentType');
    if (investmentTypeForm) {
      investmentTypeForm.options = investmentTypeList;
    }
    const contributionsFrequencyForm = UtilLib.getFieldFromFormJSON(
      layout,
      contributionsVisible ? 'contributionFrequency' : 'contributionsFrequency',
    );
    if (contributionsFrequencyForm) {
      contributionsFrequencyForm.options = frequencyType;
      if (!isEmpty(contributionsFrequencyForm.value)) {
        contributionsFrequencyForm.value = frequencyType.find(
          f => f.value === contributionsFrequencyForm.value?.value,
        );
      }
    }
    if (nextDates) {
      const nextContributionDateField = UtilLib.getFieldFromFormJSON(
        layout,
        'nextContributionDate',
      );
      nextContributionDateField.visible = true;
      nextContributionDateField.minDate = UtilLib.dateUTCAsAt(Date.now());
    }
    // fill data
    const {
      _id,
      name,
      investmentType,
      currentValue,
      ownership,
      providerName,
      purchaseDate,
      purchasePrice,
      settlementDate,
      adhocIncomeData,
      incomeData,
      expensesData,
      projectsCapitalGrowth,
      contributions,
      addlInfo,
      currentValueAsAt,
      projectsCapitalGrowthAsAt,
      contributionAmount,
      contributionAmountAsAt,
      contributionFrequency,
      incomesData,
      nextContributionDate,
    } = editData;

    // owner ship value
    const ownershipSplitPerson1 = UtilLib.getFieldFromFormJSON(layout, 'ownershipSplitPerson1');
    const ownershipSplitPerson2 = UtilLib.getFieldFromFormJSON(layout, 'ownershipSplitPerson2');
    const otherBorrowerPercentage = UtilLib.getFieldFromFormJSON(layout, 'otherBorrowerPercentage');

    ownershipSplitPerson1.value = `${joint?.owners[0]?.percentage ?? ''}`;
    if (ownershipSplitPerson2) {
      ownershipSplitPerson2.value = `${joint?.owners[1]?.percentage ?? ''}`;
    }
    if (ownership?.ownershipType === AppConstants.ownershipType.Joint) {
      ownership?.owners.map(ownerM => {
        if (getClient.client1.owners[0]?.owner === ownerM.owner) {
          ownershipSplitPerson1.value = `${ownerM.percentage ?? ''}`;
        } else if (getClient.client2.owners[0]?.owner === ownerM.owner && ownershipSplitPerson2) {
          ownershipSplitPerson2.value = `${ownerM.percentage ?? ''}`;
        }
      });
    }
    if (ownership?.ownershipType === AppConstants.ownershipType.Other) {
      ownership?.owners.map(ownerM => {
        if (getClient.client1.owners[0]?.owner === ownerM.owner) {
          ownershipSplitPerson1.value = `${ownerM.percentage ?? ''}`;
        } else if (getClient.client2.owners[0]?.owner === ownerM.owner && ownershipSplitPerson2) {
          ownershipSplitPerson2.value = `${ownerM.percentage ?? ''}`;
        }
      });
      if (otherBorrowerPercentage) {
        otherBorrowerPercentage.value = (
          100 -
          toNumber(ownershipSplitPerson1?.value ?? 0) -
          toNumber(ownershipSplitPerson2?.value ?? 0)
        ).toString();
      }
    }
    if (ownershipAsAtForm) {
      ownershipAsAtForm.lastDate = ownershipAsAtForm.value = ownership?.ownershipAsAt ?? null;
      if (editData) {
        ownershipAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'ownership',
          fieldName: 'Ownership',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.OWNERSHIP,
        };
      }
    }

    // rewrite client1 value to user name
    if (ownershipSplitPerson1?.labelDynamic?.person) {
      ownershipSplitPerson1.labelDynamic.person = client1.label;
    }
    // rewrite client2 value to partner name
    if (client2 && ownershipSplitPerson2) {
      if (ownershipSplitPerson2?.labelDynamic?.person) {
        ownershipSplitPerson2.labelDynamic.person = client2.label;
      }
    }

    // investment value
    if (!isNil(currentValue)) {
      const currentValueForm = UtilLib.getFieldFromFormJSON(layout, 'currentValue');
      currentValueForm.value = `${currentValue}`;
    }
    const currentValueAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'currentValueAsAt');
    if (currentValueAsAtForm) {
      currentValueAsAtForm.lastDate = currentValueAsAtForm.value = currentValueAsAt ?? null;
      if (editData) {
        currentValueAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'currentValue',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.NUMBER,
        };
      }
    }

    if (investmentType) {
      if (investmentTypeForm) {
        investmentTypeForm.value = investmentTypeList.find(item => item.value === investmentType);
      }
    }
    if (!isNil(providerName)) {
      const providerNameForm = UtilLib.getFieldFromFormJSON(layout, 'providerName');
      if (providerNameForm) {
        providerNameForm.value = providerName;
      }
    }

    // purchase value
    if (assetIncomeCards) {
      //remove conditional logic
      formatFormJson.conditional.logics = formatFormJson.conditional.logics.filter(
        x => !(x.type === 'setValue' && x.field === 'annualIncome' && x.format === 'annualIncome'),
      );
      const annualIncomeForm = UtilLib.getFieldFromFormJSON(layout, 'annualIncome');
      annualIncomeForm.value = incomesData
        .filter(x => !x.isArchived)
        .reduce((total, current) => {
          return (
            total +
            current.amount *
              (AppConstants.frequencyMultiplier.find(x => x.value === current.frequency)
                ?.multiplier ?? 0)
          );
        }, 0)
        .toString();
    } else {
      if (adhocIncomeData || incomeData) {
        const annualIncomeForm = UtilLib.getFieldFromFormJSON(layout, 'annualIncome');
        annualIncomeForm.value = `${(adhocIncomeData?.amount || 0) + (incomeData?.amount || 0)}`;
      }
    }

    if (!isNil(purchasePrice)) {
      const purchasePriceForm = UtilLib.getFieldFromFormJSON(layout, 'purchasePrice');
      if (purchasePriceForm) {
        purchasePriceForm.value = `${purchasePrice}`;
      }
    }
    if (purchaseDate) {
      const purchaseDateForm = UtilLib.getFieldFromFormJSON(layout, 'purchaseDate');
      if (purchaseDateForm) {
        purchaseDateForm.value = purchaseDate;
      }
    }
    if (settlementDate) {
      const settlementDateForm = UtilLib.getFieldFromFormJSON(layout, 'settlementDate');
      if (settlementDateForm) {
        settlementDateForm.value = settlementDate;
      }
    }

    if (assetIncomeCards) {
      layout.forEach(group => {
        if (group.id === 'incomeBreakdown') {
          group.fields = group.fields.filter(_f => _f.id === 'incomeBreakdownCard');
          group.fields?.forEach(_field => {
            if (_field.id === 'incomeBreakdownCard') {
              _field.visible = true;
              _field.ComponentNode = props => (
                <BreakdownCard assetFormRef={formRef.current} {...props} />
              );
              let _incomes = sortBy(
                incomesData?.map(income => ({
                  ...income,
                  label: income.name,
                  value: income.amount,
                  id: [income?._id],
                  frequency: income?.frequency ?? '',
                  cardType: 'income',
                  amount: income.amount,
                  assetId,
                })),
                ['name'],
              );
              _field.value = _incomes;
              _field.related = {
                type: 'income',
                asset: editData,
                typeValue: AppConstants.IncomeType.InvestmentIncome,
              };
            }
          });
        }
      });
    } else {
      // income value
      const incomeForm = UtilLib.getFieldFromFormJSON(layout, 'income');
      if (incomeData && incomeForm && !isNil(incomeData.amount)) {
        incomeForm.value = `${incomeData.amount}`;
      }
      if (incomeData && incomeData.frequency) {
        const currentIncomeFre = frequencyType.find(item => item.value === incomeData.frequency);
        if (incomeFrequencyForm) {
          incomeFrequencyForm.value = currentIncomeFre;
        }
      }
      const adHocIncomeForm = UtilLib.getFieldFromFormJSON(layout, 'adhocIncome');
      if (adhocIncomeData && adHocIncomeForm && !isNil(adhocIncomeData.amount)) {
        adHocIncomeForm.value = `${adhocIncomeData.amount}`;
      }
      if (adhocIncomeData && adhocIncomeData.frequency) {
        const currentIncomeFre = frequencyType.find(
          item => item.value === adhocIncomeData.frequency,
        );
        if (adIncomeFrequencyForm) {
          adIncomeFrequencyForm.value = currentIncomeFre;
        }
      }
    }

    // expense value, show current data if added, else show default value
    if (assetExpenseCards) {
      layout.forEach(group => {
        if (group.id === 'ongoingInvestmentCost') {
          group.fields = [
            {
              id: 'expensesBreakdownCard',
              component: 'custom-component',
              value: '',
              required: false,
              visible: true,
            },
          ];
          group.fields?.forEach(_field => {
            if (_field.id === 'expensesBreakdownCard') {
              _field.ComponentNode = props => (
                <BreakdownCard assetFormRef={formRef.current} {...props} />
              );
              _field.value = sortBy(
                expensesData?.map(expensesItem => ({
                  ...expensesItem,
                  id: [expensesItem?._id],
                  frequency: expensesItem?.frequency ?? '',
                  cardType: 'expense',
                  amount: expensesItem?.essentialAmount + expensesItem?.discretionaryAmount,
                  assetId,
                })),
                ['name'],
              );
              _field.related = {
                type: 'expenses',
                assetId,
                asset: editData,
              };
            }
          });
        }
      });
    } else {
      if (defaultInvestmentHoldingCosts) {
        const fields = [];
        defaultInvestmentHoldingCosts.map(item => {
          try {
            const newField = cloneDeep(fieldForm);
            newField.id = item.id;
            newField.label = item.label;
            const haveData =
              expensesData && expensesData.length > 0
                ? expensesData.filter(
                    e => e.holdingCostName === item.value || e.holdingCostName === item.label,
                  )
                : [];
            if (haveData.length > 0) {
              newField.value = `${haveData[0].essentialAmount ?? ''}`;
            }
            fields.push(newField);
          } catch (error) {}
        });
        layout[4].fields = fields;
      }
    }

    // Performance details
    if (!isNil(projectsCapitalGrowth)) {
      const projectsCapitalGrowthForm = UtilLib.getFieldFromFormJSON(
        layout,
        'projectsCapitalGrowth',
      );
      projectsCapitalGrowthForm.value = `${projectsCapitalGrowth}`;
    }
    const projectsCapitalGrowthAsAtForm = UtilLib.getFieldFromFormJSON(
      layout,
      'projectsCapitalGrowthAsAt',
    );
    if (projectsCapitalGrowthAsAtForm) {
      projectsCapitalGrowthAsAtForm.lastDate = projectsCapitalGrowthAsAtForm.value =
        projectsCapitalGrowthAsAt ?? null;
      if (editData) {
        projectsCapitalGrowthAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'projectsCapitalGrowth',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.NUMBER,
        };
      }
    }

    // Contributions Attributes
    if (contributionsVisible) {
      const contributionsAmountForm = UtilLib.getFieldFromFormJSON(layout, 'contributionAmount');
      if (!isNil(contributionAmount)) {
        contributionsAmountForm.value = `${contributionAmount}`;
      }
      if (contributionFrequency) {
        const contributionsFrequencyData = frequencyType.find(
          item => item.value === contributionFrequency,
        );
        contributionsFrequencyForm.value = contributionsFrequencyData;
      }
      const amountAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'contributionAmountAsAt');
      if (amountAsAtForm) {
        amountAsAtForm.lastDate = amountAsAtForm.value = contributionAmountAsAt ?? null;
        if (editData) {
          amountAsAtForm.info = {
            cardId: _id,
            cardName: name,
            field: 'contributionAmount',
            category: 'Asset',
            type: assetType,
            recordType: RECORD_TYPE.NUMBER_WITH_FREQUENCY,
          };
        }
      }
    } else {
      const contributionsBoolForm = UtilLib.getFieldFromFormJSON(layout, 'contributionsBool');
      if (!isNil(contributions) && contributions.length > 0) {
        const contributionValue = get(contributions, [0], {}) || {};
        contributionsBoolForm.value = true;
        const contributionsAmountForm = UtilLib.getFieldFromFormJSON(layout, 'contributionsAmount');
        if (contributionValue.startDate) {
          const contributionsStartDateForm = UtilLib.getFieldFromFormJSON(
            layout,
            'contributionsStartDate',
          );
          contributionsStartDateForm.value = contributionValue.startDate;
        }
        if (contributionValue.endDate) {
          const contributionsEndDateForm = UtilLib.getFieldFromFormJSON(
            layout,
            'contributionsEndDate',
          );
          contributionsEndDateForm.value = contributionValue.endDate;
        }
        if (!isNil(contributionValue.amount)) {
          contributionsAmountForm.value = `${contributionValue.amount}`;
        }
        if (contributionValue.frequency) {
          const contributionsFrequencyData = frequencyType.find(
            item => item.value === contributionValue.frequency,
          );
          contributionsFrequencyForm.value = contributionsFrequencyData;
        }
        const amountAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'amountAsAt');
        if (amountAsAtForm) {
          amountAsAtForm.lastDate = amountAsAtForm.value = contributionValue.amountAsAt ?? null;
          if (editData) {
            amountAsAtForm.info = {
              cardId: _id,
              cardName: name,
              field: 'amount',
              category: 'Asset',
              type: assetType,
              recordType: RECORD_TYPE.NUMBER_WITH_FREQUENCY,
            };
          }
        }
      } else {
        contributionsBoolForm.value = false;
      }
    }

    if (editData && nextDates) {
      contributionsFrequencyForm.onChange = paymentFrequencyOnChange;
      const nextContributionDateForm = UtilLib.getFieldFromFormJSON(layout, 'nextContributionDate');
      if (nextContributionDateForm) {
        nextContributionDateForm.value = nextContributionDate
          ? moment(nextContributionDate).toDate()
          : '';
      }
    }

    if (!isNil(addlInfo)) {
      const addlInfoForm = UtilLib.getFieldFromFormJSON(layout, 'addlInfo');
      if (addlInfoForm) {
        addlInfoForm.value = addlInfo;
      }
    }
    if (editData) {
      layout.forEach(group => {
        if (group.component === 'collapse') {
          group.collapse = false;
        }
      });
    }
    jsonObject.currentTime = currentTime;
    UtilLib.handleConditionLogicDynamicForm(jsonObject, formatFormJson.conditional, {
      historicalCapitalGrowthMaxValue,
      historicalCapitalGrowthMinValue,
      historicalCapitalGrowthMaxDisplayValue,
    });

    return jsonObject;
  }, [
    getClient,
    contributionsVisible,
    assetName,
    userOwnerships,
    assetOwnership,
    editData,
    assetIncomeCards,
    defaultInvestmentHoldingCosts,
    currentTime,
    historicalCapitalGrowthMaxValue,
    historicalCapitalGrowthMinValue,
    historicalCapitalGrowthMaxDisplayValue,
    hasPartner,
    assetType,
    frequencyType,
    investmentTypeList,
    formRef,
    assetId,
    assetExpenseCards,
  ]);

  const callAPIAddData = useCallback(
    (formData, callback) => {
      const inputData = cloneDeep(formData);
      if (inputData) {
        // update percentage when ownership = Joint
        const formOwner = inputData.ownership;
        if (
          formOwner.display === AppConstants.ownershipType.Joint ||
          formOwner.display === AppConstants.ownershipType.Other
        ) {
          formOwner.owners.map(owner => {
            if (getClient.client1.owners[0]?.owner === owner.owner) {
              owner.percentage = isNil(inputData.ownershipSplitPerson1)
                ? 0
                : parseFloat(inputData.ownershipSplitPerson1);
            } else if (getClient.client2.owners[0]?.owner === owner.owner) {
              owner.percentage = isNil(inputData.ownershipSplitPerson2)
                ? 0
                : parseFloat(inputData.ownershipSplitPerson2);
            }
          });
        }
        const handledOwners = UtilLib.handleEditOwnership(editData?.ownership, formOwner);
        const omitOwner = {
          ...omit(handledOwners, ['label', 'display', 'value']),
          ownershipAsAt: inputData.ownershipAsAt || null,
        };

        // handle income data for API
        let incomes = [];

        let incomeData = null;
        let incomeID = null;
        let adhocIncomeData = null;
        let adhocIncomeID = null;
        if (assetIncomeCards) {
          formData?.incomeBreakdownCard?.forEach(_income => {
            if (editData?.ownership?.value !== handledOwners?.value) {
              incomes.push({
                _id: _income._id,
                type: AppConstants.IncomeType.InvestmentIncome,
                amount: UtilLib.checkEmptyButNotZero(_income.amount) ? null : _income.amount,
                frequency: isNil(_income.frequency) ? null : _income.frequency,
                isTaxDeductible: false,
                ownership: omitOwner,
                property: editData._id,
                name: _income.name,
                notes: _income.notes,
              });
            }
          });
          delete inputData.incomeBreakdownCard;
        } else {
          if (!isNil(formData.income)) {
            const isAddNewIncome = isEmpty(editData?.income);
            const isSkipIncome =
              isAddNewIncome && isEmpty(inputData.income) && inputData.income !== 0;
            if (isSkipIncome) {
              incomeID = null;
              incomeData = null;
            } else {
              incomeID = isAddNewIncome ? Constants.newObjectIDForTypes.Income : editData?.income;
              incomeData = {
                _id: incomeID,
                type: AppConstants.IncomeType.InvestmentIncome,
                amount:
                  !isEmpty(inputData.income) || inputData.income === 0
                    ? Number(inputData.income)
                    : null,
                frequency: isNil(inputData.incomeFrequency)
                  ? null
                  : inputData.incomeFrequency.value,
                isTaxDeductible: false,
                ownership: omitOwner,
                property: editData._id,
              };
              if (isAddNewIncome) {
                incomeData.name = assetName || '';
              }
              incomes.push(incomeData);
            }
          } else {
            if (editData?.income) {
              incomeID = editData?.income;
              incomeData = {
                _id: incomeID,
                amount: null,
              };
              incomes.push(incomeData);
            }
          }

          if (!isNil(formData.adhocIncome)) {
            const isAddNewAdhocIncome = isEmpty(editData?.adHocIncome);
            const isSkipAdhocIncome =
              isAddNewAdhocIncome && isEmpty(inputData.adhocIncome) && inputData.adhocIncome !== 0;
            if (isSkipAdhocIncome) {
              adhocIncomeID = null;
              adhocIncomeData = null;
            } else {
              adhocIncomeID = isAddNewAdhocIncome
                ? Constants.newObjectIDForTypes.AdhocIncome
                : editData?.adHocIncome;
              adhocIncomeData = {
                _id: adhocIncomeID,
                type: AppConstants.IncomeType.InvestmentIncome,
                amount:
                  !isEmpty(inputData.adhocIncome) || inputData.adhocIncome === 0
                    ? Number(inputData.adhocIncome)
                    : null,
                frequency: isNil(inputData.adIncomeFrequency)
                  ? null
                  : inputData.adIncomeFrequency.value,
                ownership: omitOwner,
                property: editData._id,
              };
              if (isAddNewAdhocIncome) {
                adhocIncomeData.name = assetName || '';
              }
              incomes.push(adhocIncomeData);
            }
          } else {
            if (editData?.adHocIncome) {
              adhocIncomeID = editData?.adHocIncome;
              adhocIncomeData = {
                _id: adhocIncomeID,
                amount: null,
              };
              incomes.push(adhocIncomeData);
            }
          }
        }

        const returnValue = {
          income: incomeID,
          adhocIncome: adhocIncomeID,
          incomes: incomes,
        };

        // handle expense data for API
        let listExpenseDatas = [];
        const dataSubmit = {
          _id: '',
          holdingCostName: '',
          essentialAmount: 0,
          expenseGroup: AppConstants.ExpenseGroups.Investment,
          category: AppConstants.AssetExpenseType.Investment,
          frequency: 'Yearly',
          ownership: omitOwner,
          investmentAssetBills: editData._id,
        };
        if (assetExpenseCards) {
          if (editData?.ownership?.value !== handledOwners?.value) {
            inputData?.expensesBreakdownCard?.forEach(x => (x.modified = true));
          }
          listExpenseDatas =
            inputData?.expensesBreakdownCard
              ?.filter(x => x?.modified)
              ?.map(item =>
                omitBy(
                  {
                    _id: item?._id,
                    name: item?.name,
                    holdingCostName: item?.holdingCostName,
                    essentialAmount: item?.essentialAmount,
                    discretionaryAmount: item?.discretionaryAmount,
                    expenseGroup: item?.expenseGroup,
                    category: item?.category,
                    frequency: item?.frequency,
                    ownership: omitOwner,
                    investmentAssetBills: item?.assetId,
                    jar: item?.jar,
                    billPaymentReminder: item?.billPaymentReminder,
                    note: item?.note,
                  },
                  isNil,
                ),
              ) ?? null;
        } else {
          defaultInvestmentHoldingCosts.map((item, index) => {
            const haveOldData = editData?.expensesData?.find(
              e => e.holdingCostName === item.value || e.holdingCostName === item.label,
            );
            const newData = cloneDeep(dataSubmit);
            if (haveOldData) {
              newData._id = haveOldData._id;
              newData.essentialAmount =
                !isEmpty(inputData[item.id]) || inputData[item.id] === 0
                  ? Number(inputData[item.id])
                  : null;
              newData.holdingCostName = item.value;
              listExpenseDatas.push(newData);
            } else {
              // only add when user input data
              if (inputData[item.id]) {
                newData._id = Constants.newObjectIDForTypes.Expense + index;
                newData.name = assetName || '';
                newData.essentialAmount =
                  !isEmpty(inputData[item.id]) || inputData[item.id] === 0
                    ? Number(inputData[item.id])
                    : null;
                newData.holdingCostName = item.value;
                listExpenseDatas.push(newData);
              }
            }
          });

          const additionalHoldingCosts = editData?.expensesData?.filter(
            item =>
              !defaultInvestmentHoldingCosts.some(
                e => e.value === item.holdingCostName || e.label === item.holdingCostName,
              ),
          );
          if (additionalHoldingCosts?.length) {
            listExpenseDatas.push(...additionalHoldingCosts);
          }

          // Remove isArchived flag from Expenses (non-mutatable field)
          for (const expense of listExpenseDatas) {
            delete expense.isArchived;
          }
        }

        const submitData = {
          ...inputData,
          id: editData?._id,
          currentValue:
            isNil(inputData.currentValue) || inputData.currentValue === ''
              ? null
              : parseFloat(inputData.currentValue),
          purchasePrice:
            isNil(inputData.purchasePrice) || inputData.purchasePrice === ''
              ? null
              : parseFloat(inputData.purchasePrice),
          ...returnValue,
          expenses:
            listExpenseDatas === null || listExpenseDatas.length === 0 ? null : listExpenseDatas,
          expensesID:
            listExpenseDatas === null || listExpenseDatas.length === 0
              ? null
              : listExpenseDatas.map(i => i._id),
          projectsCapitalGrowth:
            isNil(inputData.projectsCapitalGrowth) || inputData.projectsCapitalGrowth === ''
              ? null
              : parseFloat(inputData.projectsCapitalGrowth),
          investmentType: isNil(inputData.investmentType) ? null : inputData.investmentType,
          yearlyGrowthRate:
            isNil(inputData.yearlyGrowthRate) || inputData.yearlyGrowthRate === ''
              ? null
              : parseFloat(inputData.yearlyGrowthRate),
          contributions: contributionsVisible
            ? {
                contributions: {
                  _id: get(editData, ['contributions', 0, '_id'], null) || Constants.newObjectID, // add contribution ID
                },
                contributionAmount:
                  isNil(inputData.contributionAmount) || inputData.contributionAmount === ''
                    ? null
                    : parseFloat(inputData.contributionAmount),
                contributionFrequency: isNil(inputData.contributionFrequency)
                  ? null
                  : inputData.contributionFrequency.value,
                contributionAmountAsAt: inputData.contributionAmountAsAt || null,
              }
            : {
                _id: get(editData, ['contributions', 0, '_id'], null) || Constants.newObjectID, // add contribution ID
                startDate: inputData.contributionsStartDate
                  ? inputData.contributionsStartDate
                  : null,
                endDate: inputData.contributionsEndDate ? inputData.contributionsEndDate : null,
                amount:
                  isNil(inputData.contributionsAmount) || inputData.contributionsAmount === ''
                    ? null
                    : parseFloat(inputData.contributionsAmount),
                frequency: isNil(inputData.contributionsFrequency)
                  ? null
                  : inputData.contributionsFrequency.value,
                amountAsAt: inputData.amountAsAt || null,
                _delete: !inputData.contributionsBool, // remove contribution if user unselect contribution
              },
          ownership: omitOwner,
          nextContributionDateStart: inputData?.nextContributionDate
            ? UtilLib.dateUTCAsAt(inputData?.nextContributionDate)
            : null,
        };
        dispatchResolve(addInvestmentAsset(submitData)).then(results => {
          if (results) {
            if (typeof callback === 'function') {
              updateTime();
              callback();
              return;
            }
            NavigationServiceLib.pop();
          }
        });
      }
    },
    [
      editData,
      assetIncomeCards,
      defaultInvestmentHoldingCosts,
      contributionsVisible,
      dispatchResolve,
      getClient,
      assetName,
      assetExpenseCards,
    ],
  );

  return (
    <DynamicForm
      ref={formRef}
      data={data}
      onFirstTimeDataChange={onFirstTimeDataChange}
      conditionLogics={formatFormJson.conditional}
      onSubmit={async (formData, callback) => {
        if (typeof onSubmit === 'function') {
          await onSubmit();
        }
        callAPIAddData({ ...formData, id: editData ? editData._id : null }, callback);
      }}
      onError={onErrorForm}
      disabled={disabled}
    />
  );
}

export default compose(withDynamicModuleLoader(getModule()))(Investments);
