import DropDownForForm from 'components/basics/DropDownForForm';
import FooterControl from 'components/basics/FooterControl';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import NextPayDateModal from 'components/basics/NextPayDateModal';
import { AppConstants } from 'constant';
import { GlobalLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { get, isDate } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Animated, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import BusinessCompany from 'screens/Income/components/step/AddNewIncomeStep4/component/BusinessCompany';
import BusinessPartnership from 'screens/Income/components/step/AddNewIncomeStep4/component/BusinessPartnership';
import BusinessTrust from 'screens/Income/components/step/AddNewIncomeStep4/component/BusinessTrust';
import GovtPrivateOther from 'screens/Income/components/step/AddNewIncomeStep4/component/GovtPrivateOther';
import PayG from 'screens/Income/components/step/AddNewIncomeStep4/component/PayG';
import SelfEmployer from 'screens/Income/components/step/AddNewIncomeStep4/component/SelfEmployer';
import { selectDataIncomeType, selectOwnershipStructure } from 'store/Auth/selector';
import { updateNextPayDateStart } from 'store/FinancialDashboard/action';
import { updateData } from 'store/Income/action';
import { BusinessType } from 'store/Income/constants';
import {
  selectIncomeDetails,
  selectIncomeOwnershipStructure,
  selectIncomeType,
} from 'store/Income/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const AnimatedKeyboardAwareFlatList = Animated.createAnimatedComponent(KeyboardAwareFlatList);
const AddNewIncomeStep4 = props => {
  const styles = useThemedStyle(themedStyles, 'screens.AddNewIncome.AddNewIncomeStep4');
  const formRef = useRef(null);
  const {
    t,
    onPress: handleNextStep,
    editIncome,
    onCancel,
    onEdit,
    disabled,
    restoring,
    onSubmit,
    onScroll = () => {},
  } = props;
  const scrollRef = useRef();
  const scrollTimeout = useRef();
  const nextPayStartDateRef = useRef(null);

  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();
  const dataIncomeType = useSelector(selectDataIncomeType);
  const incomeType = useSelector(selectIncomeType);
  const incomeDetails = useSelector(selectIncomeDetails);
  const itemIncomeType = dataIncomeType.find(item => item.value === incomeType);
  const [dropdownValue, setDropdownValue] = useState(itemIncomeType);
  const ownershipStructure = useSelector(selectOwnershipStructure);
  const incomeOwnershipStructure = useSelector(selectIncomeOwnershipStructure);
  const [dropdownValueOwnerStructure, setDropdownValueOwnerStructure] = useState(
    incomeOwnershipStructure || get(ownershipStructure, [0]),
  );
  const [isEdited, setIsEdited] = useState(!editIncome);
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

  useEffect(() => {
    if (incomeType) {
      const indexIncomeType = dataIncomeType?.findIndex(item => item.value === incomeType);
      setDropdownValue(dataIncomeType[indexIncomeType]);
    }
  }, [incomeType, dataIncomeType]);

  useEffect(() => {
    if (incomeDetails && get(incomeDetails, [0, 'type']) === AppConstants.IncomeType.Business) {
      let indexOwnerStructure = ownershipStructure?.findIndex(
        item => item.value === incomeDetails[0]?.basis?.details?.ownershipStructure,
      );
      if (indexOwnerStructure < 0) {
        indexOwnerStructure = 0;
      }
      dispatch(
        updateData({
          ownershipStructure: ownershipStructure[indexOwnerStructure],
        }),
      );
      setDropdownValueOwnerStructure(ownershipStructure[indexOwnerStructure]);
    }
  }, [incomeDetails, editIncome, dispatch, ownershipStructure]);

  const onSubmitForm = useCallback(
    (data, callback) => {
      handleNextStep({ forms: data }, callback);
    },
    [handleNextStep],
  );

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

  const paymentFrequencyOnChange = useCallback(
    (_field, value) => {
      const incomeDetail = get(incomeDetails, [0]);
      const nextPayDateField = formRef.current?.getFormValue('nextPayDate');
      if (incomeDetail == null || !isDate(nextPayDateField)) {
        return;
      }
      const nextPayDate = incomeDetail?.nextPayDateStart;
      nextPayStartDateRef.current = nextPayDateField ?? nextPayDate;
      GlobalLib.CustomModal.get().show({
        onBackdropPress: () => GlobalLib.CustomModal.get().hide(),
        body: (
          <NextPayDateModal
            date={nextPayStartDateRef.current}
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
                  nextPayStartDateRef.current = nextPayDateStartValue;
                }
              });
            }}
          />
        ),
      });
    },
    [incomeDetails],
  );

  const renderForm = useMemo(() => {
    switch (dropdownValue?.value) {
      case AppConstants.IncomeType.PayG:
        return (
          <PayG
            formRef={formRef}
            onSubmitForm={onSubmitForm}
            editIncome={editIncome}
            onFirstTimeDataChange={onFirstTimeDataChange}
            onErrorForm={onErrorForm}
            disabled={disabled}
            onSubmit={onSubmit}
            paymentFrequencyOnChange={paymentFrequencyOnChange}
          />
        );
      case AppConstants.IncomeType.SelfEmployed:
        return (
          <SelfEmployer
            formRef={formRef}
            onSubmitForm={onSubmitForm}
            onErrorForm={onErrorForm}
            editIncome={editIncome}
            onFirstTimeDataChange={onFirstTimeDataChange}
            disabled={disabled}
            onSubmit={onSubmit}
            paymentFrequencyOnChange={paymentFrequencyOnChange}
          />
        );
      case AppConstants.IncomeType.GovtFamily:
      case AppConstants.IncomeType.GovtUnemploued:
      case AppConstants.IncomeType.GovtWindowed:
      case AppConstants.IncomeType.PrivatePension:
      case AppConstants.IncomeType.Other:
        return (
          <GovtPrivateOther
            formRef={formRef}
            onSubmitForm={onSubmitForm}
            editIncome={editIncome}
            onFirstTimeDataChange={onFirstTimeDataChange}
            onErrorForm={onErrorForm}
            disabled={disabled}
            onSubmit={onSubmit}
            paymentFrequencyOnChange={paymentFrequencyOnChange}
          />
        );
      case AppConstants.IncomeType.Business:
        if (dropdownValueOwnerStructure?.value === BusinessType.trust) {
          return (
            <BusinessTrust
              formRef={formRef}
              onSubmitForm={onSubmitForm}
              editIncome={editIncome}
              onFirstTimeDataChange={onFirstTimeDataChange}
              onErrorForm={onErrorForm}
              disabled={disabled}
              onSubmit={onSubmit}
              paymentFrequencyOnChange={paymentFrequencyOnChange}
            />
          );
        }
        if (dropdownValueOwnerStructure?.value === BusinessType.partnership) {
          return (
            <BusinessPartnership
              formRef={formRef}
              onSubmitForm={onSubmitForm}
              editIncome={editIncome}
              onFirstTimeDataChange={onFirstTimeDataChange}
              onErrorForm={onErrorForm}
              disabled={disabled}
              onSubmit={onSubmit}
              paymentFrequencyOnChange={paymentFrequencyOnChange}
            />
          );
        }
        if (dropdownValueOwnerStructure?.value === BusinessType.company) {
          return (
            <BusinessCompany
              formRef={formRef}
              onSubmitForm={onSubmitForm}
              editIncome={editIncome}
              onFirstTimeDataChange={onFirstTimeDataChange}
              onErrorForm={onErrorForm}
              disabled={disabled}
              onSubmit={onSubmit}
              paymentFrequencyOnChange={paymentFrequencyOnChange}
            />
          );
        }
        return null;
      default:
        return null;
    }
  }, [
    dropdownValue,
    dropdownValueOwnerStructure,
    onSubmitForm,
    editIncome,
    onFirstTimeDataChange,
    onErrorForm,
    disabled,
    onSubmit,
    paymentFrequencyOnChange,
  ]);
  return (
    <View style={styles.container}>
      <AnimatedKeyboardAwareFlatList
        bounces={false}
        listKey={'dynamic-form'}
        data={[]}
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
        ListHeaderComponentStyle={[AppStyle.padBottom90, AppStyle.padX30]}
        ListHeaderComponent={
          <>
            <View>
              <DropDownForForm
                value={dropdownValue}
                options={dataIncomeType}
                label={t('forms.income.incomeItem')}
                // placeholder={t('forms.income.incomeTypePlaceholder')}
                disabled={editIncome || disabled}
                hideDropdownIcon={editIncome}
                onSelect={selectValue => {
                  setDropdownValue(dataIncomeType[selectValue]);
                  dispatch(
                    updateData({
                      type: dataIncomeType[selectValue]?.value,
                    }),
                  );
                }}
              />
              <View style={AppStyle.marginTop10}>
                {dropdownValue?.value === AppConstants.IncomeType.Business ? (
                  <DropDownForForm
                    value={dropdownValueOwnerStructure}
                    options={ownershipStructure}
                    // placeholder={t('forms.income.ownershipStructurePlaceholder')}
                    label={t('forms.income.ownershipStructure')}
                    onSelect={selectValue => {
                      setDropdownValueOwnerStructure(ownershipStructure[selectValue]);
                      dispatch(
                        updateData({
                          ownershipStructure: ownershipStructure[selectValue],
                        }),
                      );
                      onFirstTimeDataChange();
                    }}
                    hideDropdownIcon={editIncome}
                    disabled={editIncome || disabled}
                  />
                ) : null}
              </View>

              {renderForm}
            </View>
          </>
        }
        onScroll={onScroll}
      />
      {isEdited && !disabled && (
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
};

export default compose(withTranslation())(AddNewIncomeStep4);
