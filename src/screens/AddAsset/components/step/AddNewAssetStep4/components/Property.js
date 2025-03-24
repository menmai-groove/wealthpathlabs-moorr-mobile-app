import HistoryIcon from 'assets/svgs/historyIcon';
import CalendarIcon from 'assets/svgs/profile/calendar';
import Accordion from 'components/basics/Accordion';
import BreakdownCard from 'components/basics/BreakdownCard';
import CustomTooltip from 'components/basics/CustomTooltip';
import DynamicForm from 'components/basics/DynamicForm';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { AppConstants } from 'constant';
import Constants from 'constant/constants';
import { NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { formatDateTime } from 'libs/util';
import { cloneDeep, get, isEmpty, isNil, omit, omitBy, sortBy, toNumber } from 'lodash';
import { useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { RECORD_TYPE, updateTime } from 'screens/HistoricalLog';
import { addPropertyAsset } from 'store/Asset/action';
import { Purposes } from 'store/Asset/constants';
import getModule from 'store/Asset/module';
import {
  selectAssetId,
  selectAssetName,
  selectAssetOwnership,
  selectAssetType,
} from 'store/Asset/selector';
import {
  selectAssetLotUnits,
  selectAssetMaterialTypes,
  selectAssetPropertyTypes,
  selectAssetTitleTypes,
  selectConditionTypes,
  selectDefaultPropertyHoldingCosts,
  selectFlags,
  selectFrequency,
  selectOwnersWithOthers,
  selectPrimaryPurpose,
  selectServerDateInDate,
  selectUser,
} from 'store/Auth/selector';
import { selectAppPreference } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const formatFormJson = require('assets/forms/layouts/property/asset-edit-property.json');
const fieldForm = {
  id: '',
  component: 'input',
  visible: true,
  value: '',
  label: '',
  dataType: 'number',
  formatData: 'currency',
};

function Property({
  formRef,
  editData,
  onFirstTimeDataChange,
  onErrorForm,
  disabled,
  onSubmit,
  onReload,
}) {
  // const { t } = useTranslation();
  // const styles = useThemedStyle(themedStyles);
  const dispatch = useDispatchResolve();
  const currentTime = useSelector(selectServerDateInDate);
  const assetId = useSelector(selectAssetId);
  const assetName = useSelector(selectAssetName);
  const userOwnerships = useSelector(selectOwnersWithOthers);
  const defaultPropertyHoldingCosts = useSelector(selectDefaultPropertyHoldingCosts);
  const assetOwnership = useSelector(selectAssetOwnership);
  const purposeList = useSelector(selectPrimaryPurpose);
  const frequencyType = useSelector(selectFrequency);

  const { assetIncomeCards, assetExpenseCards, cardDepreciationMobile } = useSelector(selectFlags);

  const user = useSelector(selectUser);
  const hasPartner = user.partner?._id;

  const propertyTypeList = useSelector(selectAssetPropertyTypes);
  const titleTypeList = useSelector(selectAssetTitleTypes);
  const materialTypeList = useSelector(selectAssetMaterialTypes);
  const conditionTypeList = useSelector(selectConditionTypes);
  const LotUnitList = useSelector(selectAssetLotUnits);
  const {
    historicalCapitalGrowthMaxValue,
    historicalCapitalGrowthMaxDisplayValue,
    historicalCapitalGrowthMinValue,
  } = useSelector(selectAppPreference);
  const assetType = useSelector(selectAssetType);

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

  const onChangePurpose = useCallback(
    (field, value) => {
      dispatch(
        addPropertyAsset({ id: editData?._id, purpose: value, onlyChangePurpose: true }),
      ).then(results => {
        if (results) {
          updateTime();
          if (typeof onReload === 'function') {
            onReload();
          }
        }
      });
    },
    [dispatch, editData, onReload],
  );

  const data = useMemo(() => {
    const { client1, client2, joint } = getClient;
    let jsonObject = cloneDeep(formatFormJson);
    let layout = jsonObject.layout;
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
    const addressForm = UtilLib.getFieldFromFormJSON(layout, 'address');
    const incomeFrequencyForm = UtilLib.getFieldFromFormJSON(layout, 'incomeFrequency');
    incomeFrequencyForm.options = frequencyType;
    if (!isEmpty(incomeFrequencyForm.value)) {
      incomeFrequencyForm.value = frequencyType.find(
        f => f.value === incomeFrequencyForm.value?.value,
      );
    }
    const adIncomeFrequencyForm = UtilLib.getFieldFromFormJSON(layout, 'adIncomeFrequency');
    adIncomeFrequencyForm.options = frequencyType;
    if (!isEmpty(adIncomeFrequencyForm.value)) {
      adIncomeFrequencyForm.value = frequencyType.find(
        f => f.value === adIncomeFrequencyForm.value?.value,
      );
    }
    const propertyTypeForm = UtilLib.getFieldFromFormJSON(layout, 'propertyType');
    propertyTypeForm.options = propertyTypeList;
    const titleTypeForm = UtilLib.getFieldFromFormJSON(layout, 'titleType');
    titleTypeForm.options = titleTypeList;
    const materialTypeForm = UtilLib.getFieldFromFormJSON(layout, 'material');
    materialTypeForm.options = materialTypeList;
    const conditionTypeForm = UtilLib.getFieldFromFormJSON(layout, 'condition');
    conditionTypeForm.options = conditionTypeList;
    const landLotSizeForm = UtilLib.getFieldFromFormJSON(layout, 'landLotSize');
    landLotSizeForm.lotUnitOptions = LotUnitList;

    // fill data
    const {
      _id,
      name,
      currentValue,
      purpose,
      adhocIncomeData,
      incomeData,
      address,
      datePurchased,
      purchasePrice,
      settlementDate,
      expensesData,
      capitalGrowth,
      projectedCapitalGrowth,
      propertyType,
      titleType,
      material,
      condition,
      landSizeUnit,
      landSize,
      ownership,
      internalLivingSpaceSize,
      bedrooms,
      bathrooms,
      livingSpaces,
      carSpaces,
      isBrandNew,
      managingAgent,
      managingAgentContactName,
      managingAgentContactNo,
      addlInfo,
      purposeAsAt,
      currentValueAsAt,
      capitalGrowthAsAt,
      projectedCapitalGrowthAsAt,
      incomesData,
      annualDepreciation,
      depreciationMethod,
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

    // property value
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
    const purposeForm = UtilLib.getFieldFromFormJSON(layout, 'purpose');
    purposeForm.options = purposeList;
    purposeForm.onChange = onChangePurpose;
    const currentPurpose = purposeList.find(item => item.value === purpose);
    if (currentPurpose) {
      purposeForm.value = { ...currentPurpose, display: currentPurpose.label };
    }
    const purposeAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'purposeAsAt');
    if (purposeAsAtForm) {
      purposeAsAtForm.lastDate = purposeAsAtForm.value = purposeAsAt ?? null;
      if (editData) {
        purposeAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'purpose',
          fieldName: 'Primary Purpose',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.STRING,
        };
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

    addressForm.value = address;

    if (!isNil(purchasePrice)) {
      const purchasePriceForm = UtilLib.getFieldFromFormJSON(layout, 'purchasePrice');
      purchasePriceForm.value = `${purchasePrice}`;
    }
    if (datePurchased) {
      const datePurchasedForm = UtilLib.getFieldFromFormJSON(layout, 'datePurchased');
      datePurchasedForm.value = datePurchased;
    }
    if (settlementDate) {
      const settlementDateForm = UtilLib.getFieldFromFormJSON(layout, 'settlementDate');
      settlementDateForm.value = settlementDate;
    }

    if (assetIncomeCards) {
      layout.forEach(group => {
        if (group.id === 'incomeBreakdown') {
          group.fields = group.fields.filter(_f => _f.id === 'incomeBreakdownCard');
          group.fields?.forEach(_field => {
            if (_field.id === 'incomeBreakdownCard') {
              _field.visible = true;
              _field.ComponentNode = props => (
                <BreakdownCard {...props} assetFormRef={formRef.current} />
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
                typeValue: AppConstants.IncomeType.PropertyIncome,
              };
            }
          });
        }
      });
    } else {
      // income value
      const incomeForm = UtilLib.getFieldFromFormJSON(layout, 'income');
      if (incomeData) {
        // Archived cards should restore at $0 value
        const incomeAmount = !incomeData.isArchived ? incomeData.amount ?? '' : '';
        incomeForm.value = `${incomeAmount}`;
      }
      if (incomeData && incomeData.frequency) {
        const currentIncomeFre = frequencyType.find(item => item.value === incomeData.frequency);
        if (currentIncomeFre !== null) {
          incomeFrequencyForm.value = currentIncomeFre;
        }
      }

      const adHocIncomeForm = UtilLib.getFieldFromFormJSON(layout, 'adhocIncome');
      if (adhocIncomeData) {
        // Archived cards should restore at $0 value
        const adhocIncomeAmount = !adhocIncomeData.isArchived ? adhocIncomeData.amount ?? '' : '';
        adHocIncomeForm.value = `${adhocIncomeAmount}`;
      }
      if (adhocIncomeData && adhocIncomeData.frequency) {
        const currentIncomeFre = frequencyType.find(
          item => item.value === adhocIncomeData.frequency,
        );
        if (currentIncomeFre !== null) {
          adIncomeFrequencyForm.value = currentIncomeFre;
        }
      }
    }

    if (assetExpenseCards) {
      layout.forEach(group => {
        if (group.id === 'ongoingPropertyCost') {
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
                <BreakdownCard {...props} assetFormRef={formRef.current} />
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
      // expense value, show current data if added, else show default value
      if (defaultPropertyHoldingCosts) {
        const fields = [];
        defaultPropertyHoldingCosts.map(item => {
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
              // Archived cards should restore at $0 value
              const essentialAmount = !haveData[0].isArchived
                ? haveData[0].essentialAmount ?? ''
                : '';
              newField.value = `${essentialAmount}`;
            }
            fields.push(newField);
          } catch (error) {}
        });
        layout[3].fields = fields;
      }
    }

    layout.forEach(group => {
      if (group.id === 'depreciation') {
        if (cardDepreciationMobile) {
          let showDepreciation = false;
          const { purposeLog } = editData;
          if (
            purposeLog &&
            purposeLog.find(x => [Purposes.Investment, Purposes.Business].includes(x.stringValue))
          ) {
            showDepreciation = true;
          }
          const depreciationMethodForm = UtilLib.getFieldFromFormJSON(layout, 'depreciationMethod');
          depreciationMethodForm.options = AppConstants.depreciation.depreciationMethod;
          const depreciationMethodValue = AppConstants.depreciation.depreciationMethod.find(
            item => item.value === depreciationMethod,
          );
          depreciationMethodForm.value = depreciationMethodValue;
          group.visible = showDepreciation;
          group.shouldVisible = showDepreciation;
          group.fields?.forEach(_field => {
            if (_field.id === 'depreciationAmount') {
              _field.ComponentNode = () => (
                <AccordionAmount
                  {...{ _field, editData, assetName, assetType, formRef, annualDepreciation }}
                />
              );
            }
            _field.shouldVisible = showDepreciation;
          });
        }
      }
      if (group.id === 'incomeBreakdown') {
        group.fields = group.fields.filter(_f => _f.id === 'incomeBreakdownCard');
        group.fields?.forEach(_field => {
          if (_field.id === 'incomeBreakdownCard') {
            _field.visible = true;
            _field.ComponentNode = props => (
              <BreakdownCard {...props} assetFormRef={formRef.current} />
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
              typeValue: AppConstants.IncomeType.PropertyIncome,
            };
          }
        });
      }
    });

    // Performance details
    if (!isNil(capitalGrowth)) {
      const capitalGrowthForm = UtilLib.getFieldFromFormJSON(layout, 'capitalGrowth');
      capitalGrowthForm.value = `${capitalGrowth}`;
    }
    if (!isNil(projectedCapitalGrowth)) {
      const projectedCapitalGrowthForm = UtilLib.getFieldFromFormJSON(
        layout,
        'projectedCapitalGrowth',
      );
      projectedCapitalGrowthForm.value = `${projectedCapitalGrowth}`;
    }
    const capitalGrowthAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'capitalGrowthAsAt');
    if (capitalGrowthAsAtForm) {
      capitalGrowthAsAtForm.lastDate = capitalGrowthAsAtForm.value = capitalGrowthAsAt ?? null;
      if (editData) {
        capitalGrowthAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'capitalGrowth',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.NUMBER,
        };
      }
    }
    const projectedCapitalGrowthAsAtForm = UtilLib.getFieldFromFormJSON(
      layout,
      'projectedCapitalGrowthAsAt',
    );
    if (projectedCapitalGrowthAsAtForm) {
      projectedCapitalGrowthAsAtForm.lastDate = projectedCapitalGrowthAsAtForm.value =
        projectedCapitalGrowthAsAt ?? null;
      if (editData) {
        projectedCapitalGrowthAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'projectedCapitalGrowth',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.NUMBER,
        };
      }
    }
    // Property Attributes
    if (propertyType) {
      const currentPropertyType = propertyTypeList.find(item => item.value === propertyType);
      propertyTypeForm.value = currentPropertyType;
    }
    if (titleType) {
      const currentTitleType = titleTypeList.find(item => item.value === titleType);
      titleTypeForm.value = currentTitleType;
    }
    if (material) {
      const currentMaterial = materialTypeList.find(item => item.value === material);
      materialTypeForm.value = currentMaterial;
    }
    if (condition) {
      const currentCondition = conditionTypeList.find(item => item.value === condition);
      conditionTypeForm.value = currentCondition;
    }
    if (landSizeUnit || !isNil(landSize)) {
      landLotSizeForm.value = {
        landSize: landSize,
        landSizeUnit: LotUnitList.find(item => item.value === landSizeUnit),
      };
    }
    if (!isNil(internalLivingSpaceSize)) {
      const internalLivingSpaceSizeForm = UtilLib.getFieldFromFormJSON(
        layout,
        'internalLivingSpaceSize',
      );
      internalLivingSpaceSizeForm.value = `${internalLivingSpaceSize}`;
    }
    if (!isNil(bedrooms)) {
      const bedroomsForm = UtilLib.getFieldFromFormJSON(layout, 'bedrooms');
      bedroomsForm.value = bedrooms;
    }
    if (!isNil(bathrooms)) {
      const bathroomsForm = UtilLib.getFieldFromFormJSON(layout, 'bathrooms');
      bathroomsForm.value = bathrooms;
    }
    if (!isNil(livingSpaces)) {
      const livingSpacesForm = UtilLib.getFieldFromFormJSON(layout, 'livingSpaces');
      livingSpacesForm.value = livingSpaces;
    }
    if (!isNil(carSpaces)) {
      const carSpacesForm = UtilLib.getFieldFromFormJSON(layout, 'carSpaces');
      carSpacesForm.value = carSpaces;
    }
    if (!isNil(isBrandNew)) {
      const isBrandNewForm = UtilLib.getFieldFromFormJSON(layout, 'isBrandNew');
      isBrandNewForm.value = isBrandNew;
    }
    if (!isNil(managingAgent)) {
      const managingAgentForm = UtilLib.getFieldFromFormJSON(layout, 'managingAgent');
      managingAgentForm.value = managingAgent;
    }
    if (!isNil(managingAgentContactName)) {
      const managingAgentContactNameForm = UtilLib.getFieldFromFormJSON(
        layout,
        'managingAgentContactName',
      );
      managingAgentContactNameForm.value = managingAgentContactName;
    }
    if (!isNil(managingAgentContactNo)) {
      const managingAgentContactNoForm = UtilLib.getFieldFromFormJSON(
        layout,
        'managingAgentContactNo',
      );
      managingAgentContactNoForm.value = `${managingAgentContactNo}`;
    }
    if (!isNil(addlInfo)) {
      const addlInfoForm = UtilLib.getFieldFromFormJSON(layout, 'addlInfo');
      addlInfoForm.value = addlInfo;
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
    if (!cardDepreciationMobile) {
      jsonObject.layout = jsonObject.layout.filter(x => x.id !== 'depreciation');
    }
    return jsonObject;
  }, [
    getClient,
    assetName,
    userOwnerships,
    assetOwnership,
    frequencyType,
    propertyTypeList,
    titleTypeList,
    materialTypeList,
    conditionTypeList,
    LotUnitList,
    editData,
    purposeList,
    assetIncomeCards,
    assetExpenseCards,
    cardDepreciationMobile,
    currentTime,
    historicalCapitalGrowthMaxValue,
    historicalCapitalGrowthMinValue,
    historicalCapitalGrowthMaxDisplayValue,
    hasPartner,
    assetType,
    formRef,
    assetId,
    defaultPropertyHoldingCosts,
    onChangePurpose,
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
        const handledOwners = UtilLib.handleEditOwnership(editData?.ownership, {
          ...formOwner,
          ownershipAsAt: formData.ownershipAsAt,
        });
        const omitOwner = {
          ...omit(handledOwners, ['label', 'display', 'value']),
          ownershipAsAt: formData.ownershipAsAt || null,
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
                type: AppConstants.IncomeType.PropertyIncome,
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
                type: AppConstants.IncomeType.PropertyIncome,
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
            }
          }

          if (!isNil(formData.adhocIncome)) {
            const isAddNewAdhocIncome = isEmpty(editData?.adhocIncome);
            const isSkipAdhocIncome =
              isAddNewAdhocIncome && isEmpty(inputData.adhocIncome) && inputData.adhocIncome !== 0;

            if (isSkipAdhocIncome) {
              adhocIncomeID = null;
              adhocIncomeData = null;
            } else {
              adhocIncomeID = isAddNewAdhocIncome
                ? Constants.newObjectIDForTypes.AdhocIncome
                : editData?.adhocIncome;
              adhocIncomeData = {
                _id: adhocIncomeID,
                type: AppConstants.IncomeType.PropertyIncome,
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
            if (editData?.adhocIncome) {
              adhocIncomeID = editData?.adhocIncome;
            }
          }
        }

        const returnValue = {
          income: incomeID,
          adhocIncome: adhocIncomeID,
          incomes: incomes,
        };
        try {
          // handle expense data for API
          let listExpenseDatas = [];
          let expenseGroup = AppConstants.ExpenseGroups.Property;
          let category = AppConstants.AssetExpenseType.Property;
          if (inputData?.purpose?.value === Purposes.Personal) {
            expenseGroup = AppConstants.ExpenseGroups.PersonalUse;
            category = AppConstants.AssetExpenseType.PersonalUse;
          }
          const dataSubmit = {
            _id: '',
            holdingCostName: '',
            essentialAmount: 0,
            expenseGroup: expenseGroup,
            category: category,
            frequency: 'Yearly',
            ownership: omitOwner,
            property: editData._id,
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
                      property: item?.assetId,
                      jar: item?.jar,
                      billPaymentReminder: item?.billPaymentReminder,
                      note: item?.note,
                    },
                    isNil,
                  ),
                ) ?? null;
          } else {
            const shouldSkipSavingHoldingCost =
              inputData?.purpose?.value !== Purposes.Investment &&
              inputData?.purpose?.value !== Purposes.Business &&
              inputData?.purpose?.value !== Purposes.Personal;

            defaultPropertyHoldingCosts.map((item, index) => {
              const haveOldData = editData?.expensesData?.find(
                e => e.holdingCostName === item.value || e.holdingCostName === item.label,
              );
              const newData = cloneDeep(dataSubmit);
              if (haveOldData) {
                if (!shouldSkipSavingHoldingCost) {
                  newData._id = haveOldData._id;
                  newData.essentialAmount =
                    !isEmpty(inputData[item.id]) || inputData[item.id] === 0
                      ? Number(inputData[item.id])
                      : null;
                  newData.holdingCostName = item.value;
                  listExpenseDatas.push(newData);
                }
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
                !defaultPropertyHoldingCosts.some(
                  e => e.value === item.holdingCostName || e.label === item.holdingCostName,
                ),
            );
            if (additionalHoldingCosts?.length && !shouldSkipSavingHoldingCost) {
              listExpenseDatas.push(
                ...additionalHoldingCosts.map(i => ({
                  ...i,
                })),
              );
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
            projectedCapitalGrowth:
              isNil(inputData.projectedCapitalGrowth) || inputData.projectedCapitalGrowth === ''
                ? null
                : parseFloat(inputData.projectedCapitalGrowth),
            propertyType: isNil(inputData.propertyType) ? null : inputData.propertyType.value,
            titleType: isNil(inputData.titleType) ? null : inputData.titleType.value,
            material: isNil(inputData.material) ? null : inputData.material.value,
            condition: isNil(inputData.condition) ? null : inputData.condition.value,
            landSize: isNil(inputData.landLotSize?.landSize)
              ? null
              : Number(inputData.landLotSize.landSize),
            landSizeUnit: isNil(inputData.landLotSize?.landSizeUnit)
              ? null
              : inputData.landLotSize.landSizeUnit.value,
            internalLivingSpaceSize:
              isNil(inputData.internalLivingSpaceSize) || inputData.internalLivingSpaceSize === ''
                ? null
                : parseFloat(inputData.internalLivingSpaceSize),
            address: omit(inputData.address, '__typename'),
            capitalGrowth:
              isNil(inputData.capitalGrowth) || inputData.capitalGrowth === ''
                ? null
                : parseFloat(inputData.capitalGrowth),
            ownership: handledOwners,
            depreciationMethod: isNil(inputData?.depreciationMethod)
              ? null
              : inputData?.depreciationMethod?.value,
          };

          dispatch(addPropertyAsset(submitData)).then(results => {
            if (results) {
              if (typeof callback === 'function') {
                updateTime();
                callback();
                return;
              }
              NavigationServiceLib.pop();
            }
          });
        } catch (error) {}
      }
    },
    [
      editData,
      assetIncomeCards,
      getClient,
      assetName,
      assetExpenseCards,
      dispatch,
      defaultPropertyHoldingCosts,
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

export default compose(withDynamicModuleLoader(getModule()))(Property);

const AccordionAmount = ({
  _field,
  editData,
  assetName,
  assetType,
  formRef,
  annualDepreciation,
}) => {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles);
  const [expand, setExpand] = useState(false);
  const insets = useSafeAreaInsets();
  const [contentHeight, setContentHeight] = useState(0);

  const renderTooltipOnLabel = useCallback(
    field => {
      return (
        <View style={[AppStyle.flex1, AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
          <TextField style={styles.inputLabel}>
            {t(field.label, field.labelDynamic || field.label)}
          </TextField>
          <View style={[AppStyle.padLeft5]}>
            <CustomTooltip
              hideArrow
              placement="left"
              content={
                <TextField
                  style={styles.contentContainer}
                  type="captain"
                  onLayout={event => {
                    if (contentHeight === 0) {
                      setContentHeight(event.nativeEvent.layout.height);
                    }
                  }}>
                  {t(field.tooltip, field.tooltip)}
                </TextField>
              }
              displayInsets={{ top: 1 ? insets.top + contentHeight / 2 : 0 }}
            />
          </View>
        </View>
      );
    },
    [styles, t, insets, contentHeight],
  );

  return (
    <View style={[AppStyle.flex1, expand && AppStyle.marginTop10, expand && styles.asAtWrapper]}>
      <Accordion
        style={{
          accordionStyle: {
            paddingHorizontal: 0,
            paddingBottom: expand ? 10 : 0,
          },
          expandAccordionStyle: {
            paddingHorizontal: 10,
          },
        }}
        keepCollapsedContent
        title={() => (
          <View style={AppStyle.flex1}>
            <InputField
              value={annualDepreciation?.annualDepreciationAmount?.toString() || ''}
              label={() => renderTooltipOnLabel(_field)}
              placeholder={t(_field.placeholder, _field.placeholder)}
              required={_field.required}
              LeftComponent={<TextField style={[styles.inputIcon]}>{'$'}</TextField>}
              onFocus={() => {
                Keyboard.dismiss();
                _field.info = {
                  cardId: editData?._id,
                  field: ['annualDepreciationAmount', 'plantAndEquipment', 'capitalWorks'],
                  cardName: assetName,
                  category: 'Asset',
                  type: assetType,
                  recordType: RECORD_TYPE.DEPRECIATION,
                  tooltip: 'forms.asset.depreciationTooltip',
                };
                formRef.current?.navigationHistoricalLog(_field);
              }}
              disabled={!expand}
              style={{ readonlyInputWrapper: { backgroundColor: 'white' } }}
            />
          </View>
        )}
        value={expand}
        onChange={value => {
          setExpand(value);
        }}
        rightIcon={() => null}>
        <View style={AppStyle.marginTop5}>
          <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
            <TextField style={styles.inputLabel}>{t('components.dynamicForm.asAt')}</TextField>
            <HistoryIcon />
          </View>
          <View style={[AppStyle.marginTop5]}>
            <InputField
              value={
                annualDepreciation?.annualDepreciationAmountAsAt
                  ? formatDateTime(annualDepreciation?.annualDepreciationAmountAsAt, 'DD MMM YYYY')
                  : ''
              }
              placeholder="DD MMMM YYYY"
              editable={false}
              disabled
              RightComponent={() => <CalendarIcon />}
            />
          </View>
        </View>
      </Accordion>
    </View>
  );
};
