import FooterControl from 'components/basics/FooterControl';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import { default as AppConstants, default as Constants } from 'constant/constants';
import { useDispatchResolve } from 'libs/hooks';
import { isNil, omit } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import { addInvestmentAsset, addPropertyAsset } from 'store/Asset/action';
import { selectAssetType, selectData } from 'store/Asset/selector';
import { selectUser } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import PropertyComponent from './components/Property';
import themedStyles from './styles';

const i18nScope = 'forms.asset';

function AddNewAssetStep8(props) {
  const { t, onCancel, onPress: handleNextStep } = props;
  const dispatch = useDispatchResolve();
  const assetType = useSelector(selectAssetType);
  const assetData = useSelector(selectData);
  const { borrowingCard: borrowingCardInit } = assetData;
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);

  const user = useSelector(selectUser);
  const styles = useThemedStyle(themedStyles);
  const [borrowingCard, setBorrowingCard] = useState(borrowingCardInit || []);

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
    return (
      <PropertyComponent
        borrowingCardInit={borrowingCard}
        setBorrowingCard={setBorrowingCard}
        handleNextStep={handleNextStep}
        onErrorForm={onErrorForm}
      />
    );
  }, [borrowingCard, handleNextStep, onErrorForm]);

  const handleDataBeforeSubmit = useCallback(() => {
    const submitData = {
      ...assetData,
      borrowingCard: borrowingCard,
      borrowings: borrowingCard.map(item => {
        const rate =
          isNil(item.interestRate) || item.interestRate === ''
            ? null
            : {
                interestRate: parseFloat(item?.interestRate?.interestRate),
                discountRate: isNil(item?.interestRate?.discountRate)
                  ? null
                  : parseFloat(item?.interestRate?.discountRate),
                baseRate: isNil(item?.interestRate?.baseRate)
                  ? null
                  : parseFloat(item?.interestRate?.baseRate),
              };
        const formData = {
          ...item,
          borrower: omit(item.borrower, ['label', 'display', 'value']),
          interestRate: rate?.interestRate || null,
          discountRate: rate?.discountRate || null,
          baseRate: rate?.baseRate || null,
          outstanding: isNil(item.outstanding) ? null : parseFloat(item.outstanding),
          provider: isNil(item.provider) ? null : item.provider.value,
          repayment: isNil(item.repayment) ? null : parseFloat(item.repayment),
          repaymentFreq: isNil(item.repaymentFreq) ? null : item.repaymentFreq.value,
          repaymentType: isNil(item.repaymentType) ? null : item.repaymentType.value,
          type: isNil(item.type) ? null : item.type.value,
        };
        if (assetType === AppConstants.AssetType.Property) {
          formData.properties = [Constants.newObjectIDForTypes.Property];
        }
        if (assetType === AppConstants.AssetType.Investments) {
          formData.investments = [Constants.newObjectIDForTypes.Investment];
        }
        return formData;
      }),
    };
    if (assetType === AppConstants.AssetType.Property) {
      dispatch(addPropertyAsset(submitData)).then(results => {
        if (results) {
          handleNextStep();
        }
      });
    }
    if (assetType === AppConstants.AssetType.Investments) {
      dispatch(addInvestmentAsset(submitData)).then(results => {
        if (results) {
          handleNextStep();
        }
      });
    }
  }, [assetData, assetType, borrowingCard, dispatch, handleNextStep]);

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
            <Question
              emotion="confused"
              content={
                assetType === AppConstants.AssetType.Investments
                  ? t(`${i18nScope}.optiBorrowInvestment`, { name: user?.firstName })
                  : t(`${i18nScope}.optiBorrow`, { name: user?.firstName })
              }
            />
            {renderForm}
          </View>
        }
      />
      <View style={styles.wrapperControl}>
        <FooterControl onCancel={onCancel} onSave={handleDataBeforeSubmit} isEdited />
      </View>
    </View>
  );
}

export default compose(withTranslation())(AddNewAssetStep8);
