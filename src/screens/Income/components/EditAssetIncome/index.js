import DynamicForm from 'components/basics/DynamicForm';
import FooterControl from 'components/basics/FooterControl';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import NextPayDateModal from 'components/basics/NextPayDateModal';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants } from 'constant';
import Constants from 'constant/constants';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { cloneDeep, get, isDate, isEmpty, last, omit } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation, withTranslation } from 'react-i18next';
import { Animated, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import ViewAssetLink from 'screens/Expense/components/viewAssetLink';
import { RECORD_TYPE, updateTime } from 'screens/HistoricalLog';
import { selectFlags, selectFrequency, selectOwnersWithOthers } from 'store/Auth/selector';
import { updateNextPayDateStart } from 'store/FinancialDashboard/action';
import { updateIncomeInvestment } from 'store/Income/action';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.income';

const AnimatedKeyboardAwareFlatList = Animated.createAnimatedComponent(KeyboardAwareFlatList);

function EditAssetIncome(props) {
  const {
    onCancel,
    income,
    asset,
    onEdit,
    disabled,
    restoring,
    onSubmit: onSubmitData,
    overrideOnSubmitForm,
    incomes,
    onScroll = () => {},
  } = props;
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const formRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollTimeout = useRef();
  const dispatchResolve = useDispatchResolve();
  const nextPayDateStartRef = useRef(null);

  const owners = useSelector(selectOwnersWithOthers);
  const frequency = useSelector(selectFrequency);
  const { assetIncomeCards, nextDates } = useSelector(selectFlags);

  const [isEdited, setIsEdited] = useState(false);

  const onFirstTimeDataChange = useCallback(() => {
    if (!isEdited) {
      setIsEdited(true);
      onEdit();
    }
  }, [isEdited, onEdit]);

  useEffect(() => {
    if (restoring) {
      setIsEdited(true);
    }
  }, [restoring]);

  const regularIncome = useMemo(() => {
    if (assetIncomeCards) {
      return income;
    }
    if (asset) {
      return incomes?.find(item => item._id === asset.income);
    }
    return incomes.length > 0 ? incomes[0] : null;
  }, [assetIncomeCards, asset, incomes, income]);

  const adhocIncome = useMemo(() => {
    if (assetIncomeCards) {
      return {};
    }
    if (asset) {
      return incomes?.find(
        item => item._id === asset.adhocIncome || item._id === asset.adHocIncome,
      );
    }
    return incomes.length === 2 ? incomes[1] : null;
  }, [asset, assetIncomeCards, incomes]);

  const incomeType = useMemo(
    () => regularIncome?.type || adhocIncome?.type,
    [regularIncome, adhocIncome],
  );

  const openInfoDialog = useCallback(() => {
    GlobalLib.ConfirmModal.get().show({
      top: (
        <View>
          <FastImage
            source={require('assets/images/optiIcon/infoNoti.png')}
            style={styles.infoNoti}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      ),
      title:
        incomeType === 'Investment'
          ? t(`${i18nScope}.investmentInfoTitle`)
          : incomeType === 'Investment Property'
          ? t(`${i18nScope}.propertyInfoTitle`)
          : '',
      content:
        incomeType === 'Investment'
          ? t(`${i18nScope}.investmentInfoContent`)
          : incomeType === 'Investment Property'
          ? t(`${i18nScope}.propertyInfoContent`)
          : '',
      okText: t(`${i18nScope}.close`),
      onlyOneButton: true,
      style: {
        title: styles.infoTitle,
      },
    });
  }, [incomeType]);

  const renderTooltipOnLabel = useCallback(() => {
    return (
      <View style={[AppStyle.rowFlex, AppStyle.middleContent]}>
        <TextField>{'Payment Frequency'}</TextField>
        <View style={AppStyle.pad5}>
          <TouchableField style={styles.labelContainer} onPress={openInfoDialog}>
            <FastImage
              style={styles.infoIcon}
              source={require('assets/images/more-info.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableField>
        </View>
      </View>
    );
  }, []);

  const paymentFrequencyOnChange = useCallback(
    (_field, value) => {
      const incomeDetail = regularIncome;
      const nextPayDateField = formRef.current?.getFormValue('nextPayDate');
      if (!isDate(nextPayDateField)) {
        return;
      }
      const { nextPayDate } = incomeDetail;
      nextPayDateStartRef.current = nextPayDateField ?? nextPayDate;
      GlobalLib.CustomModal.get().show({
        onBackdropPress: () => GlobalLib.CustomModal.get().hide(),
        body: (
          <NextPayDateModal
            date={nextPayDateStartRef.current}
            title={'Does this change your next pay day?'}
            content={
              'You have updated your payment frequency, does this change your next pay date?'
            }
            dateLabelText={'Next pay day'}
            onCancel={() => GlobalLib.CustomModal.get().hide()}
            onSubmit={data => {
              const _id = get(incomeDetail, ['_id']);
              const nextPayDateStartValue = get(data, ['date']);
              const frequencyValue = get(value, ['value']);
              const incomeData = {
                cardType: 'income',
                _id,
                nextPayDateStart: nextPayDateStartValue,
                frequency: frequencyValue,
                frequencyField: 'paymentFrequency',
              };
              GlobalLib.CustomModal.get().hide();
              dispatchResolve(updateNextPayDateStart(incomeData)).then(response => {
                const _nextPayDate = get(response, 'nextPayDate');
                if (_nextPayDate) {
                  formRef.current?.setFormValue('nextPayDate', moment(_nextPayDate).toDate());
                  nextPayDateStartRef.current = nextPayDateStartValue;
                }
              });
            }}
          />
        ),
      });
    },
    [regularIncome],
  );

  const getFormAndCL = type => {
    switch (type) {
      case AppConstants.IncomeType.InvestmentIncome:
        const formatFormJson = require('assets/forms/layouts/income-investment-details.json');
        return { formatFormJson, conditionLogics: formatFormJson.conditionLogics };

      default:
        const formJsonInvestmentProperty = require('assets/forms/layouts/income-property-details.json');
        return {
          formatFormJson: formJsonInvestmentProperty,
          conditionLogics: formJsonInvestmentProperty.conditionLogics,
        };
    }
  };

  const handledData = useCallback(
    field => {
      const isAdd = regularIncome?._id === Constants.newObjectIDForTypes.Income;
      switch (field.id) {
        case 'type':
          field.value =
            incomeType === 'Investment Property'
              ? 'Property Income'
              : incomeType === 'Investment'
              ? 'Investment Income'
              : incomeType || '';
          break;
        case 'name':
          field.value = regularIncome?.name || adhocIncome?.name || '';
          break;

        //Investment Income
        case 'investmentName':
          field.value = asset ? asset.name : '';
          break;

        //Property Income
        case 'address':
          field.value = asset ? asset.address?.formatted || '' : '';
          break;

        case 'assetLink':
          field.ComponentNode = ViewAssetLink;
          field.value = asset?._id;
          field.label = field.label || t('forms.income.viewAssetDetail', { type: asset?.type });
          field.assetType = asset?.type;
          field.assetName = asset?.name;
          break;

        //Readonly ownership
        case 'ownership':
          if (asset) {
            const id = get(asset, ['ownership', 'owners', 0, 'owner']);
            let owner = owners.find(
              item =>
                get(item, ['owners', 0, 'owner']) === id &&
                get(item, ['ownershipType']) === asset.ownership?.ownershipType,
            );
            if (owner) {
              field.value = owner.label;
            }
          }
          break;
        case 'ownershipAsAt':
          if (asset) {
            field.lastDate = field.value = asset.ownership?.ownershipAsAt ?? null;
          }
          break;

        case 'regularIncome':
          if (regularIncome) {
            field.value = regularIncome.amount?.toString() || '';
          }
          break;

        case 'frequency':
          field.options = frequency;

          if (!isEmpty(field.value)) {
            field.value = frequency.find(type => type.value === field.value?.value);
          }
          if (regularIncome) {
            field.value =
              field.options.find(type => type.value === regularIncome.frequency) || null;
          }
          break;

        case 'paymentFrequency':
          if (nextDates) {
            field.visible = true;
            field.options = frequency;
            field.label = renderTooltipOnLabel;
            if (!isAdd) {
              field.onChange = paymentFrequencyOnChange;
            }
            if (!isEmpty(field.value)) {
              field.value = frequency.find(type => type.value === field.value?.value);
            }
            if (regularIncome) {
              field.value =
                field.options.find(type => type.value === regularIncome.paymentFrequency) || null;
            }
          }
          break;

        case 'nextPayDate':
          if (nextDates) {
            field.visible = true;
            field.value = regularIncome?.nextPayDate
              ? moment(regularIncome?.nextPayDate).toDate()
              : '';
            field.minDate = UtilLib.dateUTCAsAt(Date.now());
          }
          break;
        case 'adhocIncome':
          if (adhocIncome) {
            field.value = adhocIncome.amount?.toString() || '';
          }
          break;

        case 'adhocFrequency':
          field.options = frequency;
          if (!isEmpty(field.value)) {
            field.value = frequency.find(type => type.value === field.value?.value);
          }
          if (adhocIncome) {
            field.value = field.options.find(type => type.value === adhocIncome.frequency) || null;
          }
          break;

        case 'moneySmarts':
          if (regularIncome) {
            field.value = regularIncome.moneySmarts;
          } else {
            field.value = t(`${i18nScope}.primaryAccount`);
          }
          break;
        case 'notes':
          if (regularIncome) {
            field.value = regularIncome.notes || '';
          }
          break;
        case 'amountAsAt':
          if (regularIncome) {
            const isAddNew = regularIncome?._id === AppConstants.newObjectIDForTypes.Income;
            field.lastDate = field.value = regularIncome.amountAsAt ?? null;
            const { _id, name } = regularIncome;
            if (!isAddNew) {
              field.info = {
                cardId: _id,
                cardName: name,
                field: 'amount',
                category: 'Income',
                type: incomeType,
                recordType: RECORD_TYPE.NUMBER_WITH_FREQUENCY,
              };
            }
          }
          break;

        default:
          break;
      }
    },
    [adhocIncome, asset, frequency, owners, regularIncome, t, nextDates, incomeType],
  );

  const data = useMemo(() => {
    const { formatFormJson, conditionLogics } = getFormAndCL(incomeType);
    let layout = cloneDeep(formatFormJson);
    if (assetIncomeCards) {
      const nameForm = UtilLib.getFieldFromFormJSON(layout?.layout, 'name');
      nameForm.visible = true;
      const notesForm = UtilLib.getFieldFromFormJSON(layout?.layout, 'notes');
      notesForm.visible = true;
      const regularIncomeForm = UtilLib.getFieldFromFormJSON(layout?.layout, 'regularIncome');
      regularIncomeForm.label = 'forms.income.grossIncome';
      const adhocIncomeForm = UtilLib.getFieldFromFormJSON(layout?.layout, 'adhocIncome');
      adhocIncomeForm.visible = false;
      const adhocFrequencyForm = UtilLib.getFieldFromFormJSON(layout?.layout, 'adhocFrequency');
      adhocFrequencyForm.visible = false;
    }

    layout?.layout?.map(group => {
      group.fields.forEach(field => {
        if (field.fields) {
          field.fields.forEach(f => handledData(f));
        }
        handledData(field);
      });
      if (group.component === 'collapse' && (income || incomes)) {
        group.collapse = false;
      }
      return group;
    });
    UtilLib.handleConditionLogicDynamicForm(layout, conditionLogics);
    return { layout, conditionLogics };
  }, [assetIncomeCards, income, incomes, handledData, incomeType]);

  const onSubmit = async (dataForm, callback) => {
    if (assetIncomeCards) {
      if (typeof onSubmitData === 'function') {
        await onSubmitData();
      }
      const _incomes =
        (await dispatchResolve(
          updateIncomeInvestment({
            ...dataForm,
            _id: regularIncome?._id,
            assetType: asset?.type,
            ownership: omit(dataForm?.ownership, ['ownershipAsAt']),
          }),
        )) ?? [];

      if (typeof overrideOnSubmitForm === 'function') {
        overrideOnSubmitForm({
          ...dataForm,
          ownership: omit(dataForm?.ownership, ['ownershipAsAt']),
          _id:
            regularIncome?._id === AppConstants.newObjectIDForTypes.Income
              ? last(_incomes)?._id
              : regularIncome?._id,
        });
      }
      if (typeof callback === 'function') {
        updateTime();
        callback();
        return;
      }
      NavigationServiceLib.pop();
      return;
    }
    let regularIncomeID;
    let adhocIncomeID;
    if (regularIncome?._id) {
      regularIncomeID = regularIncome?._id;
    } else if (dataForm.regularIncome !== '') {
      regularIncomeID = AppConstants.newObjectIDForTypes.Income;
    }
    if (adhocIncome?._id) {
      adhocIncomeID = adhocIncome?._id;
    } else if (dataForm.adhocIncome !== '') {
      adhocIncomeID = AppConstants.newObjectIDForTypes.Income.replace('income', 'adhocIncome');
    }
    if (typeof onSubmitData === 'function') {
      await onSubmitData();
    }
    await dispatchResolve(
      updateIncomeInvestment({
        ...dataForm,
        regularIncomeID,
        adhocIncomeID,
        assetType: asset?.type,
        name: asset?.name,
      }),
    );
    NavigationServiceLib.pop();
  };

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
    (formErrors, dataFormErrors, firstKey) => {
      if (firstKey) {
        scrollToElement(dataFormErrors[firstKey]?.componentRef);
      }
    },
    [scrollToElement],
  );

  return (
    <View style={styles.container}>
      <AnimatedKeyboardAwareFlatList
        listKey={'dynamic-form'}
        data={[]}
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
        style={[AppStyle.flex1, AppStyle.padX25]}
        contentContainerStyle={AppStyle.padBottom90}
        ListHeaderComponent={
          <DynamicForm
            ref={formRef}
            data={data.layout}
            onSubmit={onSubmit}
            onError={onErrorForm}
            conditionLogics={data.conditionLogics}
            onFirstTimeDataChange={onFirstTimeDataChange}
            disabled={disabled}
          />
        }
        onScroll={onScroll}
      />
      {isEdited && (
        <View style={styles.wrapperControl}>
          <FooterControl
            onCancel={onCancel}
            onSave={() => formRef.current?.submit()}
            isEdited={isEdited}
            textButtonSave={restoring ? t('screens.financialDashboard.restore') : null}
          />
        </View>
      )}
    </View>
  );
}

export default compose(withTranslation())(EditAssetIncome);
