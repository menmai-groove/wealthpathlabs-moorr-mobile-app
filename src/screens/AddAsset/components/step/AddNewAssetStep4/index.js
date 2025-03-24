import DropDownForForm from 'components/basics/DropDownForForm';
import FooterControl from 'components/basics/FooterControl';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import AppConstants from 'constant/constants';
import { useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Animated, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { selectAssetType } from 'store/Asset/selector';
import { selectDataAssetType } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import BankAccountComponent from './components/BankAccount';
import InvestmentsComponent from './components/Investments';
import LifeInsuranceComponent from './components/LifeInsurance';
import OtherAssetsComponent from './components/OtherAssets';
import PropertyComponent from './components/Property';
import SuperannuationComponent from './components/Superannuation';
import VehicleComponent from './components/Vehicle';
import themedStyles from './styles';

const AnimatedKeyboardAwareFlatList = Animated.createAnimatedComponent(KeyboardAwareFlatList);

function AddNewAssetStep4(props) {
  const {
    t,
    upDateData,
    onCancel,
    editData,
    onEdit,
    disabled,
    restoring,
    onSubmit,
    onReload,
    onScroll,
    startDate,
  } = props;
  const assetType = useSelector(selectAssetType);
  const dataAssetType = useSelector(selectDataAssetType);
  const styles = useThemedStyle(themedStyles);
  const scrollRef = useRef(null);
  const formRef = useRef(null);
  const scrollTimeout = useRef();
  const [isEdited, setIsEdited] = useState(!editData);
  const {
    Vehicles,
    BankAccounts,
    LifeInsurance,
    OtherAssets,
    Superannuation,
    Property,
    Investments,
  } = AppConstants.AssetType;

  useEffect(() => {
    if (restoring) {
      setIsEdited(true);
    }
  }, [restoring]);

  const onFirstTimeDataChange = useCallback(() => {
    if (!isEdited) {
      setIsEdited(true);
      onEdit();
    }
  }, [isEdited, onEdit]);

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

  const renderForm = useMemo(() => {
    switch (assetType) {
      case BankAccounts:
        return (
          <BankAccountComponent
            formRef={formRef}
            editData={editData}
            onFirstTimeDataChange={onFirstTimeDataChange}
            onErrorForm={onErrorForm}
            disabled={disabled}
            onSubmit={onSubmit}
            startDate={startDate}
          />
        );
      case Vehicles:
        return (
          <VehicleComponent
            formRef={formRef}
            editData={editData}
            onFirstTimeDataChange={onFirstTimeDataChange}
            onErrorForm={onErrorForm}
            disabled={disabled}
            onSubmit={onSubmit}
          />
        );
      case LifeInsurance:
        return (
          <LifeInsuranceComponent
            formRef={formRef}
            editData={editData}
            onFirstTimeDataChange={onFirstTimeDataChange}
            onErrorForm={onErrorForm}
            disabled={disabled}
            onSubmit={onSubmit}
          />
        );
      case OtherAssets:
        return (
          <OtherAssetsComponent
            formRef={formRef}
            editData={editData}
            onFirstTimeDataChange={onFirstTimeDataChange}
            onErrorForm={onErrorForm}
            disabled={disabled}
            onSubmit={onSubmit}
          />
        );
      case Superannuation:
        return (
          <SuperannuationComponent
            formRef={formRef}
            editData={editData}
            onFirstTimeDataChange={onFirstTimeDataChange}
            onErrorForm={onErrorForm}
            disabled={disabled}
            onSubmit={onSubmit}
          />
        );
      case Property:
        return (
          <PropertyComponent
            scrollRef={scrollRef}
            formRef={formRef}
            editData={editData}
            onFirstTimeDataChange={onFirstTimeDataChange}
            onErrorForm={onErrorForm}
            disabled={disabled}
            onSubmit={onSubmit}
            onReload={onReload}
          />
        );
      case Investments:
        return (
          <InvestmentsComponent
            formRef={formRef}
            editData={editData}
            onFirstTimeDataChange={onFirstTimeDataChange}
            onErrorForm={onErrorForm}
            disabled={disabled}
            onSubmit={onSubmit}
          />
        );
      default:
        return null;
    }
  }, [
    BankAccounts,
    LifeInsurance,
    OtherAssets,
    Property,
    Investments,
    Superannuation,
    Vehicles,
    assetType,
    editData,
    onFirstTimeDataChange,
    onErrorForm,
    disabled,
    onSubmit,
    onReload,
  ]);
  return (
    <View style={styles.container}>
      <AnimatedKeyboardAwareFlatList
        ref={scrollRef}
        bounces={false}
        listKey={'dynamic-form'}
        data={[]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[AppStyle.padBottom90]}
        ListHeaderComponent={
          <View style={AppStyle.marginTop20}>
            <DropDownForForm
              value={{
                display: assetType,
                value: assetType,
              }}
              options={dataAssetType}
              label={t('forms.asset.assetItem')}
              onSelect={(i, selectValue) => {
                upDateData({ type: selectValue.value });
              }}
              disabled={true}
              hideDropdownIcon={true}
            />
            {renderForm}
          </View>
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

export default compose(withTranslation())(AddNewAssetStep4);
