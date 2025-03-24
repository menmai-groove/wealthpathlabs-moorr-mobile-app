import ButtonField from 'components/basics/ButtonField';
import DynamicForm from 'components/basics/DynamicForm';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import { cloneDeep, first, get, isArray, isNumber, toNumber } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { RECORD_TYPE } from 'screens/HistoricalLog';
import {
  selectFrequency,
  selectOwnersWithOthers,
  selectOwnersWithoutJoint,
  selectUser,
} from 'store/Auth/selector';
import { selectValues } from 'store/HistoricalLog/selector';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.historicalLog';

const AddEditEntry = ({ onSubmit, onCancel, recordType, editData, fields, info, minDate }) => {
  const { t } = useTranslation('translation', { keyPrefix: i18nScope });
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [isEdited, setIsEdited] = useState(!editData);

  const user = useSelector(selectUser);
  const hasPartner = user.partner?._id;
  const formRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);

  const frequencyType = useSelector(selectFrequency);
  const userOwnerships = useSelector(
    info?.withoutJoint ? selectOwnersWithoutJoint : selectOwnersWithOthers,
  );
  const values = useSelector(selectValues);

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

  const formData = useMemo(() => {
    let formatFormJson = {};
    switch (recordType) {
      case RECORD_TYPE.NUMBER:
        formatFormJson = require('assets/forms/layouts/historicalLog/add-number.json');
        break;
      case RECORD_TYPE.NUMBER_WITH_FREQUENCY:
        formatFormJson = require('assets/forms/layouts/historicalLog/add-number-with-frequency.json');
        if (isArray(info.field) && info.field[0] === 'essentialAmount') {
          formatFormJson = require('assets/forms/layouts/historicalLog/add-number-essential-frequency.json');
        }
        break;
      case RECORD_TYPE.STRING:
        formatFormJson = require('assets/forms/layouts/historicalLog/add-string.json');
        break;
      case RECORD_TYPE.OWNERSHIP:
        formatFormJson = require('assets/forms/layouts/historicalLog/add-ownership.json');
        break;
      case RECORD_TYPE.OBJECT_IDS:
        formatFormJson = require('assets/forms/layouts/historicalLog/add-objectids.json');
        break;
      case RECORD_TYPE.DEPRECIATION:
        formatFormJson = require('assets/forms/layouts/historicalLog/add-depreciation.json');
        break;
      default:
        break;
    }
    if (formatFormJson) {
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
      if (recordType === RECORD_TYPE.OBJECT_IDS) {
        const dropdown = UtilLib.getFieldFromFormJSON(layout, fields[0].id);
        if (dropdown == null) {
          layout.forEach(_layout => {
            if (_layout.id === 'add-objectids') {
              fields[0].value = [];
              fields[0].required = true;
              fields[0].validation = [
                {
                  type: 'required',
                  message: `${i18nScope}.requiredValue`,
                },
              ];
              _layout.fields.push(fields[0]);
            }
          });
        }
      }
      if (recordType === RECORD_TYPE.NUMBER) {
        if (fields[0].id === 'interestRate' && fields[0].component === 'interestRate') {
          layout.forEach(_layout => {
            if (_layout.id === 'form') {
              let value = {};
              if (editData && editData.numberValues) {
                Object.keys(editData.numberValues).forEach(
                  x => (value[x] = String(editData.numberValues[x])),
                );
              }
              fields[0].value = value;
              fields[0].loanTypeValue = info?.loanTypeValue;
              _layout.fields[1] = fields[0];
            }
          });
        }
        if (fields[0].id === 'isTrackedInMoneySmarts') {
          const _amountForm = UtilLib.getFieldFromFormJSON(layout, 'amount');
          if (_amountForm) {
            _amountForm.value = fields[0].value;
            _amountForm.options = fields[0].options;
            _amountForm.label = fields[0].label;
            _amountForm.component = fields[0].component;
          }
        }
      }
      const dateForm = UtilLib.getFieldFromFormJSON(layout, 'date');

      const label = get(fields, '0.label');
      const labelDynamic = get(fields, '0.labelDynamic');
      if (dateForm) {
        // Check archived date
        const firstData = first(values);
        if (firstData != null && firstData?.actionType === 'archive') {
          // If the card archived, just add new entry in the past
          const date = moment(firstData.asAt).subtract(1, 'day').toDate();
          dateForm.maxDate = UtilLib.dateUTCAsAt(date);
          dateForm.value = UtilLib.dateUTCAsAt(date);
          if (recordType === RECORD_TYPE.DEPRECIATION) {
            dateForm.value = UtilLib.dateUTCAsAt(moment(date).add(1, 'year').toDate());
          }
        } else {
          dateForm.maxDate = UtilLib.dateUTCAsAt(Date.now());
          let dateValue = minDate ?? Date.now();
          if (minDate && recordType === RECORD_TYPE.DEPRECIATION) {
            dateValue = moment(minDate).add(1, 'year').toDate();
          }
          dateForm.value = UtilLib.dateUTCAsAt(dateValue);
        }
      }
      const amountForm = UtilLib.getFieldFromFormJSON(layout, 'amount');
      const iconRight = get(fields, '0.iconRight');
      const dataType = get(fields, '0.dataType');
      const isPercent = iconRight === 'percent';
      const isBoolean = dataType === 'boolean';
      if (amountForm) {
        amountForm.label = label;
        amountForm.labelDynamic = labelDynamic;
        if (isPercent) {
          amountForm.iconRight = iconRight;
          amountForm.formatData = null;
          amountForm.minValue = fields[0]?.minValue ?? 0;
          amountForm.maxValue = fields[0]?.maxValue ?? 100;
        }
        if (isBoolean) {
          amountForm.component = 'radio';
          amountForm.value = true;
          amountForm.dataType = 'boolean';
          amountForm.validation = [];
        }
      }
      const frequencyForm = UtilLib.getFieldFromFormJSON(layout, 'frequency');
      if (frequencyForm && frequencyType) {
        frequencyForm.options = frequencyType;
      }
      const ownershipForm = UtilLib.getFieldFromFormJSON(layout, 'ownership');
      if (ownershipForm && userOwnerships) {
        ownershipForm.options = get(fields, ['0', 'options'], userOwnerships);
      }
      const valueForm = UtilLib.getFieldFromFormJSON(layout, 'value');
      const options = get(fields, '0.options');
      if (valueForm && options?.length) {
        valueForm.label = label;
        valueForm.options = options;
        valueForm.value = options[0];
      }

      if (editData) {
        const asAt = moment(get(editData, 'asAt')).toDate();
        if (dateForm && asAt) {
          dateForm.value = asAt;
        }
        switch (recordType) {
          case RECORD_TYPE.NUMBER: {
            const numberValue = get(editData, 'numberValue');
            if (amountForm && isNumber(numberValue)) {
              amountForm.value = numberValue;
              if (isBoolean) {
                amountForm.value = Boolean(numberValue);
              }
            }
            if (fields[0].id === 'isTrackedInMoneySmarts') {
              amountForm.value = fields[0].options.find(x => x.value === Boolean(numberValue));
            }
            break;
          }
          case RECORD_TYPE.NUMBER_WITH_FREQUENCY: {
            const numberValue = get(editData, 'numberValue');
            const frequencyName = get(editData, 'frequencyName');
            if (amountForm && numberValue) {
              amountForm.value = numberValue;
            }
            if (frequencyForm && frequencyName) {
              frequencyForm.value = {
                value: frequencyName,
              };
            }
            if (isArray(info.field) && info.field[0] === 'essentialAmount') {
              const essentialAmountForm = UtilLib.getFieldFromFormJSON(layout, 'essentialAmount');
              const discretionaryAmountForm = UtilLib.getFieldFromFormJSON(
                layout,
                'discretionaryAmount',
              );
              essentialAmountForm.value = editData.numberValues?.essentialAmount?.toString();
              discretionaryAmountForm.value =
                editData.numberValues?.discretionaryAmount?.toString();
            }
            break;
          }
          case RECORD_TYPE.STRING: {
            const value = get(editData, 'stringValue');
            if (valueForm && value) {
              valueForm.value = { value };
            }
            break;
          }
          case RECORD_TYPE.OWNERSHIP:
            // owner ship value
            const ownershipSplitPerson1 = UtilLib.getFieldFromFormJSON(
              layout,
              'ownershipSplitPerson1',
            );
            const ownershipSplitPerson2 = UtilLib.getFieldFromFormJSON(
              layout,
              'ownershipSplitPerson2',
            );
            const otherBorrowerPercentage = UtilLib.getFieldFromFormJSON(
              layout,
              'otherBorrowerPercentage',
            );
            const { joint } = getClient;
            const ownership = editData?.ownershipDetail;
            ownershipSplitPerson1.value = `${joint?.owners[0]?.percentage ?? ''}`;
            if (ownershipSplitPerson2) {
              ownershipSplitPerson2.value = `${joint?.owners[1]?.percentage ?? ''}`;
            }
            if (ownership?.ownershipType === AppConstants.ownershipType.Joint) {
              ownership?.owners.map(ownerM => {
                if (getClient.client1.owners[0]?.owner === ownerM.owner) {
                  ownershipSplitPerson1.value = `${ownerM.percentage ?? ''}`;
                } else if (
                  getClient.client2.owners[0]?.owner === ownerM.owner &&
                  ownershipSplitPerson2
                ) {
                  ownershipSplitPerson2.value = `${ownerM.percentage ?? ''}`;
                }
              });
            }
            if (ownership?.ownershipType === AppConstants.ownershipType.Other) {
              ownership?.owners.map(ownerM => {
                if (getClient.client1.owners[0]?.owner === ownerM.owner) {
                  ownershipSplitPerson1.value = `${ownerM.percentage ?? ''}`;
                } else if (
                  getClient.client2.owners[0]?.owner === ownerM.owner &&
                  ownershipSplitPerson2
                ) {
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

            if (ownershipForm) {
              ownershipForm.value = userOwnerships.find(
                owner =>
                  owner.ownershipType === ownership?.ownershipType &&
                  owner.owners[0].owner === ownership.owners[0].owner,
              );
            }
            break;
          case RECORD_TYPE.OBJECT_IDS:
            try {
              const dropdown = UtilLib.getFieldFromFormJSON(layout, fields[0].id);
              dropdown.value = dropdown.options.filter(x =>
                editData.stringValues.includes(x.value),
              );
            } catch (error) {}
            break;
          case RECORD_TYPE.DEPRECIATION:
            try {
              const annualDepreciationAmount = UtilLib.getFieldFromFormJSON(
                layout,
                'annualDepreciationAmount',
              );
              annualDepreciationAmount.value =
                editData.numberValues?.annualDepreciationAmount?.toString() || '';
              const plantAndEquipment = UtilLib.getFieldFromFormJSON(layout, 'plantAndEquipment');
              plantAndEquipment.value = editData.numberValues?.plantAndEquipment?.toString() || '';
              const capitalWorks = UtilLib.getFieldFromFormJSON(layout, 'capitalWorks');
              capitalWorks.value = editData.numberValues?.capitalWorks?.toString() || '';
            } catch (error) {}
            break;
          default:
            break;
        }
      }
      UtilLib.handleConditionLogicDynamicForm(jsonObject, jsonObject.conditional);
      return jsonObject;
    }
  }, [
    minDate,
    recordType,
    info,
    fields,
    frequencyType,
    userOwnerships,
    editData,
    hasPartner,
    values,
    getClient,
  ]);

  const scrollToElement = useCallback(
    (element, timeout = 250) => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        element && scrollRef?.current?.scrollIntoView(element);
      }, timeout);
    },
    [scrollRef],
  );

  const onErrorForm = useCallback(
    (dataFormErrors, firstKey) => {
      if (firstKey) {
        scrollToElement(dataFormErrors[firstKey]?.componentRef);
      }
    },
    [scrollToElement],
  );

  const onFirstTimeDataChange = useCallback(() => {
    if (!isEdited) {
      setIsEdited(true);
    }
  }, [isEdited]);

  return (
    <View style={styles.containerModal}>
      <KeyboardAwareFlatList
        ref={scrollRef}
        bounces={false}
        listKey={'dynamic-form'}
        data={[]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <TextField type="heading-2" style={AppStyle.textCenter}>
              {editData ? t('editEntry') : t('addEntry')}
            </TextField>
            <DynamicForm
              ref={formRef}
              data={formData}
              onSubmit={onSubmit}
              onError={onErrorForm}
              onFirstTimeDataChange={onFirstTimeDataChange}
              conditionLogics={formData.conditional}
            />
            <View
              style={[
                AppStyle.rowFlex,
                AppStyle.spaceBetweenContent,
                AppStyle.marginTop20,
                AppStyle.marginBottom20,
              ]}>
              <ButtonField type="secondary" text={t('cancel')} onPress={onCancel} />
              <ButtonField
                text={editData ? t('edit') : t('add')}
                onPress={() => formRef.current.submit()}
                type={isEdited ? 'primary' : 'disabled'}
              />
            </View>
          </>
        }
      />
    </View>
  );
};

export default AddEditEntry;
