import FooterControl from 'components/basics/FooterControl';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import AppConstants from 'constant/constants';
import { useThemedStyle } from 'providers';
import React, { useCallback, useMemo, useRef } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import { selectAssetName, selectAssetType } from 'store/Asset/selector';
import { AppStyle } from 'theme';

import InvestmentsComponent from './components/Investments';
import PropertyComponent from './components/Property';
import themedStyles from './styles';

const i18nScope = 'forms.asset';

function AddNewAssetStep6(props) {
  const { t, onCancel, onPress: handleNextStep } = props;
  const assetType = useSelector(selectAssetType);
  const assetName = useSelector(selectAssetName);
  const styles = useThemedStyle(themedStyles);
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);
  const formRef = useRef(null);
  const { Property, Investments } = AppConstants.AssetType;

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
      case Property:
        return (
          <PropertyComponent
            formRef={formRef}
            handleNextStep={handleNextStep}
            onErrorForm={onErrorForm}
          />
        );
      case Investments:
        return (
          <InvestmentsComponent
            formRef={formRef}
            handleNextStep={handleNextStep}
            onErrorForm={onErrorForm}
          />
        );
      default:
        return null;
    }
  }, [Investments, Property, assetType, handleNextStep, onErrorForm]);

  const questionString = useMemo(() => {
    if (assetName) {
      if (assetType === Property) {
        return t(`${i18nScope}.optiIncome`, { name: assetName });
      } else {
        return t(`${i18nScope}.optiIncomeRegular`, { name: assetName });
      }
    } else {
      if (assetType === Property) {
        return t(`${i18nScope}.optiIncome2`);
      } else {
        return t(`${i18nScope}.optiIncome2Regular`);
      }
    }
  }, [Property, assetName, assetType, t]);

  return (
    <View style={styles.container}>
      <KeyboardAwareFlatList
        ref={scrollRef}
        bounces={false}
        listKey={'dynamic-form'}
        data={[]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[AppStyle.padBottom90]}
        ListHeaderComponent={
          <View style={AppStyle.marginTop20}>
            <View style={styles.itemAsset}>
              <TextField style={styles.textItemAsset}>{assetType}</TextField>
            </View>
            <Question emotion="smile" content={questionString} />
            {renderForm}
          </View>
        }
      />
      <View style={styles.wrapperControl}>
        <FooterControl onCancel={onCancel} onSave={() => formRef.current?.submit()} isEdited />
      </View>
    </View>
  );
}

export default compose(withTranslation())(AddNewAssetStep6);
