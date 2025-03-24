import DynamicForm from 'components/basics/DynamicForm';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import { cloneDeep, get, isNil, toNumber } from 'lodash';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import getModule from 'store/Asset/module';
import { selectData } from 'store/Asset/selector';
import {
  selectAssetInvestmentTypes,
  selectOwnersWithOthers,
  selectUser,
} from 'store/Auth/selector';
import { selectAppPreference } from 'store/Root/selector';

const formatFormJson = require('assets/forms/layouts/investments/asset-add-investment1.json');
function Investments({ formRef, handleNextStep, onErrorForm }) {
  const userOwnerships = useSelector(selectOwnersWithOthers);
  const assetDatas = useSelector(selectData);
  const investmentTypeList = useSelector(selectAssetInvestmentTypes);
  const {
    historicalCapitalGrowthMaxValue,
    historicalCapitalGrowthMaxDisplayValue,
    historicalCapitalGrowthMinValue,
  } = useSelector(selectAppPreference);

  const user = useSelector(selectUser);
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

  const data = useMemo(() => {
    const { client1, client2, joint } = getClient;
    const {
      name,
      currentValue,
      purchaseDate,
      ownership,
      purchasePrice,
      investmentType,
      ownershipSplitPerson1,
      ownershipSplitPerson2,
      ownershipAsAt,
      currentValueAsAt,
    } = assetDatas || {};
    const jsonObject = cloneDeep(formatFormJson);
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

    const owner = UtilLib.getFieldFromFormJSON(layout, 'ownership');
    owner.options = cloneDeep(userOwnerships);
    owner.value = userOwnerships[0];
    const investmentTypeForm = UtilLib.getFieldFromFormJSON(layout, 'investmentType');
    investmentTypeForm.options = investmentTypeList;

    // owner ship value
    const ownershipSplitPerson1Form = UtilLib.getFieldFromFormJSON(layout, 'ownershipSplitPerson1');
    const ownershipSplitPerson2Form = UtilLib.getFieldFromFormJSON(layout, 'ownershipSplitPerson2');
    const otherBorrowerPercentage = UtilLib.getFieldFromFormJSON(layout, 'otherBorrowerPercentage');

    if (ownershipSplitPerson1Form?.labelDynamic?.person) {
      ownershipSplitPerson1Form.labelDynamic.person = client1.label;
    }
    if (client2) {
      if (ownershipSplitPerson2Form?.labelDynamic?.person) {
        ownershipSplitPerson2Form.labelDynamic.person = client2.label;
      }
    }

    // fill data when go back
    const nameForm = UtilLib.getFieldFromFormJSON(layout, 'name');
    if (name) {
      nameForm.value = name;
    }
    if (investmentType) {
      investmentTypeForm.value = investmentTypeList.find(
        item => item.value === investmentType.value,
      );
    }
    if (ownership) {
      owner.value = ownership;
    }
    const ownershipAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'ownershipAsAt');
    if (ownershipAsAtForm) {
      ownershipAsAtForm.value =
        ownership?.ownershipAsAt ?? ownershipAsAt ?? UtilLib.dateUTCAsAt(Date.now());
    }
    const currentValueForm = UtilLib.getFieldFromFormJSON(layout, 'currentValue');
    if (currentValue) {
      currentValueForm.value = `${currentValue}`;
    }
    const purchasePriceForm = UtilLib.getFieldFromFormJSON(layout, 'purchasePrice');
    if (purchasePrice) {
      purchasePriceForm.value = `${purchasePrice}`;
    }
    const purchaseDateForm = UtilLib.getFieldFromFormJSON(layout, 'purchaseDate');
    if (purchaseDate) {
      purchaseDateForm.value = purchaseDate;
    }
    if (!isNil(ownershipSplitPerson1)) {
      ownershipSplitPerson1Form.value = `${ownershipSplitPerson1 ?? ''}`;
    } else {
      ownershipSplitPerson1Form.value = `${joint?.owners[0]?.percentage ?? ''}`;
    }
    if (ownershipSplitPerson2Form) {
      if (!isNil(ownershipSplitPerson2)) {
        ownershipSplitPerson2Form.value = `${ownershipSplitPerson2 ?? ''}`;
      } else {
        ownershipSplitPerson2Form.value = `${joint?.owners[1]?.percentage ?? ''}`;
      }
    }

    if (otherBorrowerPercentage) {
      otherBorrowerPercentage.value = (
        100 -
        toNumber(ownershipSplitPerson1Form?.value ?? 0) -
        toNumber(ownershipSplitPerson2Form?.value ?? 0)
      ).toString();
    }

    const currentValueAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'currentValueAsAt');
    currentValueAsAtForm.lastDate = currentValueAsAtForm.value = currentValueAsAt ?? null;

    // add handle conditional logic when open
    UtilLib.handleConditionLogicDynamicForm(jsonObject, formatFormJson.conditional, {
      historicalCapitalGrowthMaxValue,
      historicalCapitalGrowthMinValue,
      historicalCapitalGrowthMaxDisplayValue,
    });
    return jsonObject;
  }, [
    assetDatas,
    investmentTypeList,
    userOwnerships,
    getClient,
    historicalCapitalGrowthMaxValue,
    historicalCapitalGrowthMinValue,
    historicalCapitalGrowthMaxDisplayValue,
    hasPartner,
  ]);

  const onSubmit = useCallback(
    formData => {
      // update percentage when ownership = Joint
      const formOwner = formData.ownership;
      if (
        formOwner.display === AppConstants.ownershipType.Joint ||
        formOwner.display === AppConstants.ownershipType.Other
      ) {
        formOwner.owners.map(owner => {
          if (getClient.client1.owners[0]?.owner === owner.owner) {
            owner.percentage = isNil(formData.ownershipSplitPerson1)
              ? 0
              : parseFloat(formData.ownershipSplitPerson1);
          } else if (getClient.client2.owners[0]?.owner === owner.owner) {
            owner.percentage = isNil(formData.ownershipSplitPerson2)
              ? 0
              : parseFloat(formData.ownershipSplitPerson2);
          }
        });
      }
      formOwner.ownershipAsAt = formData.ownershipAsAt ?? null;
      handleNextStep({
        ...formData,
        currentValue:
          isNil(formData.currentValue) || formData.currentValue === ''
            ? null
            : parseFloat(formData.currentValue),
        purchasePrice:
          isNil(formData.purchasePrice) || formData.purchasePrice === ''
            ? null
            : parseFloat(formData.purchasePrice),
      });
    },
    [getClient, handleNextStep],
  );

  return (
    <DynamicForm
      ref={formRef}
      data={data}
      conditionLogics={formatFormJson.conditional}
      onSubmit={onSubmit}
      onError={onErrorForm}
    />
  );
}

export default compose(withDynamicModuleLoader(getModule()))(Investments);
