import DynamicForm from 'components/basics/DynamicForm';
import NextPayDateModal from 'components/basics/NextPayDateModal';
import { AppConstants } from 'constant';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { cloneDeep, get, isDate, isEmpty, isNil, toNumber } from 'lodash';
import moment from 'moment';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { RECORD_TYPE, updateTime } from 'screens/HistoricalLog';
import { addSuperFundAsset } from 'store/Asset/action';
import getModule from 'store/Asset/module';
import { selectAssetName, selectAssetOwnership, selectAssetType } from 'store/Asset/selector';
import {
  selectDataAssetSuperFundProductType,
  selectDataAssetSuperFundProviderType,
  selectDataAssetSuperFundStrategyType,
  selectFlags,
  selectFrequency,
  selectOwners,
  selectOwnersWithOthers,
  selectUser,
} from 'store/Auth/selector';
import { updateNextPayDateStart } from 'store/FinancialDashboard/action';

const formatFormJson = require('assets/forms/layouts/asset-superannuation.json');
function Superannuation({
  formRef,
  editData,
  onFirstTimeDataChange,
  onErrorForm,
  disabled,
  onSubmit,
}) {
  const dispatch = useDispatchResolve();
  const assetName = useSelector(selectAssetName);
  const userOwnerships = useSelector(selectOwners);
  const userOwnershipsWithOthers = useSelector(selectOwnersWithOthers);
  const assetOwnership = useSelector(selectAssetOwnership);
  const productType = useSelector(selectDataAssetSuperFundProductType);
  const strategyType = useSelector(selectDataAssetSuperFundStrategyType);
  const providerType = useSelector(selectDataAssetSuperFundProviderType);
  const frequencyType = useSelector(selectFrequency);
  const assetType = useSelector(selectAssetType);
  const flags = useSelector(selectFlags);
  const nextContributionDateStart1Ref = useRef(null);
  const nextContributionDateStart2Ref = useRef(null);

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

  const paymentFrequencyOnChange = useCallback((_field, value) => {
    const assetDetail = editData;
    const nextPayDateField = formRef.current?.getFormValue(
      _field.id === 'personalContributionsClient1Frequency'
        ? 'nextContributionClient1Date'
        : 'nextContributionClient2Date',
    );
    if (!isDate(nextPayDateField)) {
      return;
    }
    const { nextContributionClient1Date, nextContributionClient2Date } = assetDetail;
    if (_field.id === 'personalContributionsClient1Frequency') {
      nextContributionDateStart1Ref.current = nextPayDateField ?? nextContributionClient1Date;
    } else {
      nextContributionDateStart2Ref.current = nextPayDateField ?? nextContributionClient2Date;
    }
    GlobalLib.CustomModal.get().show({
      onBackdropPress: () => GlobalLib.CustomModal.get().hide(),
      body: (
        <NextPayDateModal
          date={
            _field.id === 'personalContributionsClient1Frequency'
              ? nextContributionDateStart1Ref.current
              : nextContributionDateStart2Ref.current
          }
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
              assetType: 'superFunds',
              _id,
              nextPayDateStart: nextPayDateStartValue,
              nextPayDateStartField:
                _field.id === 'personalContributionsClient1Frequency'
                  ? 'nextContributionClient1DateStart'
                  : 'nextContributionClient2DateStart',
              frequency: frequencyValue,
              frequencyField: _field.id,
            };
            GlobalLib.CustomModal.get().hide();
            dispatch(updateNextPayDateStart(assetsData)).then(response => {
              const contributionField =
                _field.id === 'personalContributionsClient1Frequency'
                  ? 'nextContributionClient1Date'
                  : 'nextContributionClient2Date';
              const _nextContributionDate = get(response, contributionField);
              if (_nextContributionDate) {
                formRef.current?.setFormValue(
                  contributionField,
                  moment(_nextContributionDate).toDate(),
                );
                if (_field.id === 'personalContributionsClient1Frequency') {
                  nextContributionDateStart1Ref.current = nextPayDateStartValue;
                } else {
                  nextContributionDateStart2Ref.current = nextPayDateStartValue;
                }
              }
            });
          }}
        />
      ),
    });
  }, []);

  const conditional = useMemo(() => {
    const jsonObject = cloneDeep(formatFormJson);
    const conditionals = jsonObject.conditional;
    const { client1, client2 } = getClient;

    // rewrite client1 value to user name
    const salarySacrificeClient1 = UtilLib.getConditionObjectFromJSON(
      conditionals.logics,
      'salarySacrificeClient1',
    );
    if (salarySacrificeClient1?.condition?.condition[1]?.condition[1]) {
      salarySacrificeClient1.condition.condition[1].condition[1].value = client1.label;
    }
    const salarySacrificeClient1Frequency = UtilLib.getConditionObjectFromJSON(
      conditionals.logics,
      'salarySacrificeClient1Frequency',
    );
    if (salarySacrificeClient1Frequency?.condition?.condition[1]?.condition[1]) {
      salarySacrificeClient1Frequency.condition.condition[1].condition[1].value = client1.label;
    }
    const personalContributionsClient1 = UtilLib.getConditionObjectFromJSON(
      conditionals.logics,
      'personalContributionsClient1',
    );
    if (personalContributionsClient1?.condition?.condition[1]?.condition[1]) {
      personalContributionsClient1.condition.condition[1].condition[1].value = client1.label;
    }
    const personalContributionsClient1Frequency = UtilLib.getConditionObjectFromJSON(
      conditionals.logics,
      'personalContributionsClient1Frequency',
    );
    if (personalContributionsClient1Frequency?.condition?.condition[1]?.condition[1]) {
      personalContributionsClient1Frequency.condition.condition[1].condition[1].value =
        client1.label;
    }
    const salarySacrificeClient1AsAt = UtilLib.getConditionObjectFromJSON(
      conditionals.logics,
      'salarySacrificeClient1AsAt',
    );
    if (salarySacrificeClient1AsAt?.condition?.condition[1]?.condition[1]) {
      salarySacrificeClient1AsAt.condition.condition[1].condition[1].value = client1.label;
    }
    const personalContributionsClient1AsAt = UtilLib.getConditionObjectFromJSON(
      conditionals.logics,
      'personalContributionsClient1AsAt',
    );
    if (personalContributionsClient1AsAt?.condition?.condition[1]?.condition[1]) {
      personalContributionsClient1AsAt.condition.condition[1].condition[1].value = client1.label;
    }
    // rewrite client2 value to partner name
    if (client2) {
      const salarySacrificeClient2 = UtilLib.getConditionObjectFromJSON(
        conditionals.logics,
        'salarySacrificeClient2',
      );
      if (salarySacrificeClient2?.condition?.condition[1]?.condition[1]) {
        salarySacrificeClient2.condition.condition[1].condition[1].value = client2.label;
      }
      const salarySacrificeClient2Frequency = UtilLib.getConditionObjectFromJSON(
        conditionals.logics,
        'salarySacrificeClient2Frequency',
      );
      if (salarySacrificeClient2Frequency?.condition?.condition[1]?.condition[1]) {
        salarySacrificeClient2Frequency.condition.condition[1].condition[1].value = client2.label;
      }
      const personalContributionsClient2 = UtilLib.getConditionObjectFromJSON(
        conditionals.logics,
        'personalContributionsClient2',
      );
      if (personalContributionsClient2?.condition?.condition[1]?.condition[1]) {
        personalContributionsClient2.condition.condition[1].condition[1].value = client2.label;
      }
      const personalContributionsClient2Frequency = UtilLib.getConditionObjectFromJSON(
        conditionals.logics,
        'personalContributionsClient2Frequency',
      );
      if (personalContributionsClient2Frequency?.condition?.condition[1]?.condition[1]) {
        personalContributionsClient2Frequency.condition.condition[1].condition[1].value =
          client2.label;
      }
      const salarySacrificeClient2AsAt = UtilLib.getConditionObjectFromJSON(
        conditionals.logics,
        'salarySacrificeClient2AsAt',
      );
      if (salarySacrificeClient2AsAt?.condition?.condition[1]?.condition[1]) {
        salarySacrificeClient2AsAt.condition.condition[1].condition[1].value = client2.label;
      }
      const personalContributionsClient2AsAt = UtilLib.getConditionObjectFromJSON(
        conditionals.logics,
        'personalContributionsClient2AsAt',
      );
      if (personalContributionsClient2AsAt?.condition?.condition[1]?.condition[1]) {
        personalContributionsClient2AsAt.condition.condition[1].condition[1].value = client2.label;
      }
    }

    if (flags.nextDates) {
      conditionals.logics.push({
        type: 'visible',
        field: 'nextContributionClient1Date',
        value: true,
        condition: {
          operator: 'OR',
          condition: [
            {
              type: '=',
              field: 'ownership',
              value: 'Joint',
              key: 'display',
            },
            {
              type: '=',
              field: 'ownership',
              value: client1.label,
              key: 'display',
            },
            {
              type: '=',
              field: 'ownership',
              value: 'Other',
              key: 'display',
            },
          ],
        },
      });
      if (client2) {
        conditionals.logics.push({
          type: 'visible',
          field: 'nextContributionClient2Date',
          value: true,
          condition: {
            operator: 'OR',
            condition: [
              {
                type: 'visible',
                field: 'ownershipSplitPerson2',
                value: true,
              },
              {
                type: '=',
                field: 'ownership',
                value: client2.label,
                key: 'display',
              },
            ],
          },
        });
      }
    }
    return conditionals;
  }, [getClient]);

  const data = useMemo(() => {
    const jsonObject = cloneDeep(formatFormJson);
    const { client1, client2, joint } = getClient;
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
    owner.options = cloneDeep(userOwnershipsWithOthers);
    owner.originalOptions = cloneDeep(userOwnershipsWithOthers);
    owner.value = assetOwnership;
    const ownershipAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'ownershipAsAt');
    ownershipAsAtForm.value = UtilLib.dateUTCAsAt(Date.now());
    const productForm = UtilLib.getFieldFromFormJSON(layout, 'product');
    productForm.options = productType;
    const providerForm = UtilLib.getFieldFromFormJSON(layout, 'provider');
    providerForm.options = providerType;
    const strategyForm = UtilLib.getFieldFromFormJSON(layout, 'strategy');
    strategyForm.options = strategyType;
    const ownershipSplitPerson1 = UtilLib.getFieldFromFormJSON(layout, 'ownershipSplitPerson1');
    const salarySacrificeClient1Form = UtilLib.getFieldFromFormJSON(
      layout,
      'salarySacrificeClient1',
    );
    const personalContributionsClient1Form = UtilLib.getFieldFromFormJSON(
      layout,
      'personalContributionsClient1',
    );
    const salarySacrificeClient1FrequencyForm = UtilLib.getFieldFromFormJSON(
      layout,
      'salarySacrificeClient1Frequency',
    );
    salarySacrificeClient1FrequencyForm.options = frequencyType;
    if (!isEmpty(salarySacrificeClient1FrequencyForm.value)) {
      salarySacrificeClient1FrequencyForm.value = frequencyType.find(
        f => f.value === salarySacrificeClient1FrequencyForm.value?.value,
      );
    }
    const personalContributionsClient1FrequencyForm = UtilLib.getFieldFromFormJSON(
      layout,
      'personalContributionsClient1Frequency',
    );
    personalContributionsClient1FrequencyForm.options = frequencyType;
    if (!isEmpty(personalContributionsClient1FrequencyForm.value)) {
      personalContributionsClient1FrequencyForm.value = frequencyType.find(
        f => f.value === personalContributionsClient1FrequencyForm.value?.value,
      );
    }

    // rewirite client name with user name
    if (ownershipSplitPerson1?.labelDynamic?.person) {
      ownershipSplitPerson1.labelDynamic.person = client1.label;
    }
    if (salarySacrificeClient1Form?.labelDynamic?.person) {
      salarySacrificeClient1Form.labelDynamic.person = client1.label;
    }
    if (salarySacrificeClient1FrequencyForm?.labelDynamic?.person) {
      salarySacrificeClient1FrequencyForm.labelDynamic.person = client1.label;
    }
    if (personalContributionsClient1Form?.labelDynamic?.person) {
      personalContributionsClient1Form.labelDynamic.person = client1.label;
    }
    if (personalContributionsClient1FrequencyForm?.labelDynamic?.person) {
      personalContributionsClient1FrequencyForm.labelDynamic.person = client1.label;
    }

    const ownershipSplitPerson2 = UtilLib.getFieldFromFormJSON(layout, 'ownershipSplitPerson2');
    const personalContributionsClient2Form = UtilLib.getFieldFromFormJSON(
      layout,
      'personalContributionsClient2',
    );
    const personalContributionsClient2FrequencyForm = UtilLib.getFieldFromFormJSON(
      layout,
      'personalContributionsClient2Frequency',
    );
    const salarySacrificeClient2Form = UtilLib.getFieldFromFormJSON(
      layout,
      'salarySacrificeClient2',
    );
    const salarySacrificeClient2FrequencyForm = UtilLib.getFieldFromFormJSON(
      layout,
      'salarySacrificeClient2Frequency',
    );
    const isSmsfForm = UtilLib.getFieldFromFormJSON(layout, 'isSmsf');
    // rewirite client2 name with partner name
    if (client2) {
      if (ownershipSplitPerson2?.labelDynamic?.person) {
        ownershipSplitPerson2.labelDynamic.person = client2.label;
      }
      if (personalContributionsClient2Form?.labelDynamic?.person) {
        personalContributionsClient2Form.labelDynamic.person = client2.label;
      }
      personalContributionsClient2FrequencyForm.options = frequencyType;
      if (!isEmpty(personalContributionsClient2FrequencyForm.value)) {
        personalContributionsClient2FrequencyForm.value = frequencyType.find(
          f => f.value === personalContributionsClient2FrequencyForm.value?.value,
        );
      }
      if (personalContributionsClient2FrequencyForm?.labelDynamic?.person) {
        personalContributionsClient2FrequencyForm.labelDynamic.person = client2.label;
      }
      if (salarySacrificeClient2Form?.labelDynamic?.person) {
        salarySacrificeClient2Form.labelDynamic.person = client2.label;
      }
      salarySacrificeClient2FrequencyForm.options = frequencyType;
      if (!isEmpty(salarySacrificeClient2FrequencyForm.value)) {
        salarySacrificeClient2FrequencyForm.value = frequencyType.find(
          f => f.value === salarySacrificeClient2FrequencyForm.value?.value,
        );
      }
      if (salarySacrificeClient2FrequencyForm?.labelDynamic?.person) {
        salarySacrificeClient2FrequencyForm.labelDynamic.person = client2.label;
      }

      // rewrite JSON visible value depend on owner selected before
      if (assetOwnership.display === client2.label) {
        // show client2
        personalContributionsClient2Form.visible = true;
        personalContributionsClient2FrequencyForm.visible = true;
        salarySacrificeClient2Form.visible = true;
        salarySacrificeClient2FrequencyForm.visible = true;

        //hide client1
        personalContributionsClient1Form.visible = false;
        personalContributionsClient1FrequencyForm.visible = false;
        salarySacrificeClient1Form.visible = false;
        salarySacrificeClient1FrequencyForm.visible = false;
      }
      if (joint && assetOwnership.display === joint.label) {
        // show all client
        personalContributionsClient2Form.visible = true;
        personalContributionsClient2FrequencyForm.visible = true;
        salarySacrificeClient2Form.visible = true;
        salarySacrificeClient2FrequencyForm.visible = true;

        ownershipSplitPerson1.visible = true;
        if (ownershipSplitPerson2) {
          ownershipSplitPerson2.visible = true;
        }
      }
    }

    if (isEmpty(`${ownershipSplitPerson1.value}`)) {
      ownershipSplitPerson1.value = `${joint?.owners[0]?.percentage ?? ''}`;
    }
    if (ownershipSplitPerson2) {
      if (isEmpty(`${ownershipSplitPerson2?.value}`)) {
        ownershipSplitPerson2.value = `${joint?.owners[1]?.percentage ?? ''}`;
      }
    }

    const nextContributionClient1DateForm = UtilLib.getFieldFromFormJSON(
      layout,
      'nextContributionClient1Date',
    );
    if (nextContributionClient1DateForm) {
      nextContributionClient1DateForm.minDate = UtilLib.dateUTCAsAt(Date.now());
      nextContributionClient1DateForm.label = 'Next Contribution Date - ' + client1.label;
    }

    const nextContributionClient2DateForm = UtilLib.getFieldFromFormJSON(
      layout,
      'nextContributionClient2Date',
    );
    if (nextContributionClient2DateForm && client2) {
      nextContributionClient2DateForm.minDate = UtilLib.dateUTCAsAt(Date.now());
      nextContributionClient2DateForm.label = 'Next Contribution Date - ' + client2.label;
    }

    if (editData) {
      const {
        _id,
        name,
        notes,
        value,
        isSmsf,
        provider,
        product,
        strategy,
        salarySacrificeClient1,
        salarySacrificeClient1Frequency,
        salarySacrificeClient2,
        salarySacrificeClient2Frequency,
        personalContributionsClient1,
        personalContributionsClient1Frequency,
        personalContributionsClient2,
        personalContributionsClient2Frequency,
        salarySacrificeClient1AsAt,
        salarySacrificeClient2AsAt,
        personalContributionsClient1AsAt,
        personalContributionsClient2AsAt,
        ownership,
        valueAsAt,
        nextContributionClient1Date,
        nextContributionClient2Date,
      } = editData;
      if (!isNil(value)) {
        const valueForm = UtilLib.getFieldFromFormJSON(layout, 'value');
        valueForm.value = `${value}`;
      }
      if (!isNil(notes)) {
        const notesForm = UtilLib.getFieldFromFormJSON(layout, 'notes');
        notesForm.value = notes;
      }
      isSmsfForm.value = isSmsf;

      if (!isNil(provider)) {
        providerForm.value = { value: provider, display: provider, label: provider };
      }
      if (!isNil(product)) {
        productForm.value = { value: product, display: product, label: product };
      }
      if (!isNil(strategy)) {
        strategyForm.value = { value: strategy, display: strategy, label: strategy };
      }

      // const salarySacrificeBoolForm = UtilLib.getFieldFromFormJSON(layout, 'salarySacrificeBool');
      // salarySacrificeBoolForm.value = salarySacrificeBool;
      if (!isNil(salarySacrificeClient1)) {
        salarySacrificeClient1Form.value = `${salarySacrificeClient1}`;
      }
      if (!isNil(salarySacrificeClient1Frequency)) {
        salarySacrificeClient1FrequencyForm.value = {
          value: salarySacrificeClient1Frequency,
          display: salarySacrificeClient1Frequency,
          label: salarySacrificeClient1Frequency,
        };
      }
      if (!isNil(salarySacrificeClient2)) {
        salarySacrificeClient2Form.value = `${salarySacrificeClient2}`;
      }
      if (!isNil(salarySacrificeClient2Frequency)) {
        salarySacrificeClient2FrequencyForm.value = {
          value: salarySacrificeClient2Frequency,
          display: salarySacrificeClient2Frequency,
          label: salarySacrificeClient2Frequency,
        };
      }

      // const personalContributionsBoolForm = UtilLib.getFieldFromFormJSON(
      //   layout,
      //   'personalContributionsBool',
      // );
      // personalContributionsBoolForm.value = personalContributionsBool;
      if (!isNil(personalContributionsClient1)) {
        personalContributionsClient1Form.value = `${personalContributionsClient1}`;
      }
      if (!isNil(personalContributionsClient1Frequency)) {
        personalContributionsClient1FrequencyForm.value = {
          value: personalContributionsClient1Frequency,
          display: personalContributionsClient1Frequency,
          label: personalContributionsClient1Frequency,
        };
        if (flags.nextDates) {
          personalContributionsClient1FrequencyForm.onChange = paymentFrequencyOnChange;
        }
      }
      if (!isNil(personalContributionsClient2)) {
        personalContributionsClient2Form.value = `${personalContributionsClient2}`;
      }
      if (!isNil(personalContributionsClient2Frequency)) {
        personalContributionsClient2FrequencyForm.value = {
          value: personalContributionsClient2Frequency,
          display: personalContributionsClient2Frequency,
          label: personalContributionsClient2Frequency,
        };
        if (flags.nextDates) {
          personalContributionsClient2FrequencyForm.onChange = paymentFrequencyOnChange;
        }
      }
      const otherBorrowerPercentage = UtilLib.getFieldFromFormJSON(
        layout,
        'otherBorrowerPercentage',
      );
      if (
        ownership?.ownershipType === AppConstants.ownershipType.Other ||
        ownership?.ownershipType === AppConstants.ownershipType.Joint
      ) {
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
      const valueAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'valueAsAt');
      if (valueAsAtForm) {
        valueAsAtForm.lastDate = valueAsAtForm.value = valueAsAt ?? null;
        valueAsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'value',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.NUMBER,
        };
      }
      const salarySacrificeClient1AsAtForm = UtilLib.getFieldFromFormJSON(
        layout,
        'salarySacrificeClient1AsAt',
      );
      if (salarySacrificeClient1AsAtForm) {
        salarySacrificeClient1AsAtForm.lastDate = salarySacrificeClient1AsAtForm.value =
          salarySacrificeClient1AsAt ?? null;
        salarySacrificeClient1AsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'salarySacrificeClient1',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.NUMBER_WITH_FREQUENCY,
          // TODO: EM-3965 api update incorrect frequency
        };
      }
      const salarySacrificeClient2AsAtForm = UtilLib.getFieldFromFormJSON(
        layout,
        'salarySacrificeClient2AsAt',
      );
      if (salarySacrificeClient2AsAtForm) {
        salarySacrificeClient2AsAtForm.lastDate = salarySacrificeClient2AsAtForm.value =
          salarySacrificeClient2AsAt ?? null;
        salarySacrificeClient2AsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'salarySacrificeClient2',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.NUMBER_WITH_FREQUENCY,
          // TODO: EM-3965 api update incorrect frequency
        };
      }
      const personalContributionsClient1AsAtForm = UtilLib.getFieldFromFormJSON(
        layout,
        'personalContributionsClient1AsAt',
      );
      if (personalContributionsClient1AsAtForm) {
        personalContributionsClient1AsAtForm.lastDate = personalContributionsClient1AsAtForm.value =
          personalContributionsClient1AsAt ?? null;
        personalContributionsClient1AsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'personalContributionsClient1',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.NUMBER_WITH_FREQUENCY,
        };
      }
      const personalContributionsClient2AsAtForm = UtilLib.getFieldFromFormJSON(
        layout,
        'personalContributionsClient2AsAt',
      );
      if (personalContributionsClient2AsAtForm) {
        personalContributionsClient2AsAtForm.lastDate = personalContributionsClient2AsAtForm.value =
          personalContributionsClient2AsAt ?? null;
        personalContributionsClient2AsAtForm.info = {
          cardId: _id,
          cardName: name,
          field: 'personalContributionsClient2',
          category: 'Asset',
          type: assetType,
          recordType: RECORD_TYPE.NUMBER_WITH_FREQUENCY,
        };
      }
      if (flags.nextDates) {
        if (nextContributionClient1DateForm) {
          nextContributionClient1DateForm.value = nextContributionClient1Date
            ? moment(nextContributionClient1Date).toDate()
            : '';
        }
        if (nextContributionClient2DateForm) {
          nextContributionClient2DateForm.value = nextContributionClient2Date
            ? moment(nextContributionClient2Date).toDate()
            : '';
        }
      }

      layout.forEach(group => {
        if (group.component === 'collapse') {
          group.collapse = false;
        }
      });
    } else {
      if (
        assetOwnership.label === AppConstants.ownershipType.Joint ||
        assetOwnership.label === AppConstants.ownershipType.Other
      ) {
        isSmsfForm.value = true;
      }
    }

    // Run condition for both cases: have and don't have edit data
    UtilLib.handleConditionLogicDynamicForm(jsonObject, conditional);
    return jsonObject;
  }, [
    assetName,
    assetOwnership,
    editData,
    frequencyType,
    getClient,
    productType,
    providerType,
    strategyType,
    userOwnershipsWithOthers,
    conditional,
    hasPartner,
    assetType,
  ]);

  function onRadioValueChange(field, value, callback) {
    if (
      field.id === 'isSmsf' &&
      !value &&
      (formRef?.current?.getFormValue('ownership')?.display === AppConstants.ownershipType.Joint ||
        formRef?.current?.getFormValue('ownership')?.display === AppConstants.ownershipType.Other)
    ) {
      formRef?.current?.setFormValue('ownership', getClient.client1);
      callback();
    } else {
      callback();
    }
  }

  const handleSubmitAPI = useCallback(
    (formData, callback) => {
      const newFormClone = cloneDeep(formData);
      // const formOwner = newFormClone.ownership;
      // if (formOwner.display === AppConstants.ownershipType.Joint) {
      //   formOwner.owners.map(owner => {
      //     if (getClient.client1.owners[0]?.owner === owner.owner) {
      //       owner.percentage = isNil(newFormClone.ownershipSplitPerson1)
      //         ? 0
      //         : parseFloat(newFormClone.ownershipSplitPerson1);
      //     } else if (getClient.client2.owners[0]?.owner === owner.owner) {
      //       owner.percentage = isNil(newFormClone.ownershipSplitPerson2)
      //         ? 0
      //         : parseFloat(newFormClone.ownershipSplitPerson2);
      //     }
      //   });
      // }

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
      const handledData = {
        ...newFormClone,
        ownership: UtilLib.handleEditOwnership(editData?.ownership, {
          ...formOwner,
          ownershipAsAt: newFormClone.ownershipAsAt,
        }),
      };
      dispatch(addSuperFundAsset(handledData)).then(results => {
        if (results) {
          if (typeof callback === 'function') {
            updateTime();
            callback();
            return;
          }
          NavigationServiceLib.pop();
        }
      });
    },
    [dispatch, getClient, editData],
  );

  return (
    <DynamicForm
      ref={formRef}
      data={data}
      onFirstTimeDataChange={onFirstTimeDataChange}
      conditionLogics={conditional}
      onSubmit={async (formData, callback) => {
        if (typeof onSubmit === 'function') {
          await onSubmit();
        }
        handleSubmitAPI({ ...formData, id: editData ? editData._id : null }, callback);
      }}
      onRadioValueChange={onRadioValueChange}
      onError={onErrorForm}
      disabled={disabled}
    />
  );
}

export default compose(withDynamicModuleLoader(getModule()))(Superannuation);
