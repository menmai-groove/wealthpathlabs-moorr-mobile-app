import AssetStoryIcon from 'assets/svgs/onboardingInterview/assetStoryIcon';
import BankIcon from 'assets/svgs/onboardingInterview/bankIcon';
import InvestmentIcon from 'assets/svgs/onboardingInterview/investmentIcon';
import ButtonField from 'components/basics/ButtonField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import { GlobalLib, UtilLib } from 'libs';
import { isEmpty } from 'lodash';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import React, { useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import Option from 'screens/OnBoardingInterview/components/Option';
import Question from 'screens/OnBoardingInterview/components/Question';
import BankAccounts from 'screens/OnBoardingInterview/components/Step/AssetStoryTelling/BankAccounts';
import Investments from 'screens/OnBoardingInterview/components/Step/AssetStoryTelling/Investments';
import Properties from 'screens/OnBoardingInterview/components/Step/AssetStoryTelling/Properties';
import {
  updateDataBankAccount,
  updateDataInvestment,
  updateDataProperty,
} from 'store/OnBoardingInterview/action';
import { selectAskingNameData, selectAssets } from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.onBoardingInterview.assetStoryTelling';

function AssetStoryTelling(props) {
  useOnBackButtonPress(props.onBack);
  const { t, onPress: handleNextStep } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatch = useDispatch();

  const askingName = useSelector(selectAskingNameData);
  const assetsData = useSelector(selectAssets);

  const isFinishedProperty = useMemo(() => !isEmpty(assetsData?.properties), [assetsData]);
  const isFinishedBankAccount = useMemo(() => !isEmpty(assetsData?.bankAccounts), [assetsData]);
  const isFinishedInvestment = useMemo(() => !isEmpty(assetsData?.investments), [assetsData]);

  const submitProperties = properties => {
    GlobalLib.CustomModal.get().hide();
    dispatch(updateDataProperty({ properties }));
  };

  const handleOpenModalProperties = () => {
    GlobalLib.CustomModal.get().show({
      type: 'absolute',
      body: (
        <Properties
          onCancel={() => GlobalLib.CustomModal.get().hide()}
          data={assetsData?.properties}
          onSubmit={submitProperties}
        />
      ),
    });
  };

  const submitBankAccounts = bankAccounts => {
    GlobalLib.CustomModal.get().hide();
    dispatch(
      updateDataBankAccount({
        bankAccounts: {
          ...bankAccounts,
          isTrackedInMoneySmarts: true,
          isTrackedInMoneySmartsAsAt: UtilLib.dateUTCAsAt(Date.now()),
        },
      }),
    );
  };

  const handleOpenModalBankAccounts = () => {
    GlobalLib.CustomModal.get().show({
      type: 'absolute',
      body: (
        <BankAccounts
          onCancel={() => GlobalLib.CustomModal.get().hide()}
          data={assetsData?.bankAccounts}
          onSubmit={submitBankAccounts}
        />
      ),
    });
  };

  const submitInvestments = investments => {
    GlobalLib.CustomModal.get().hide();
    dispatch(updateDataInvestment({ investments }));
  };

  const handleOpenModalInvestments = () => {
    GlobalLib.CustomModal.get().show({
      type: 'absolute',
      body: (
        <Investments
          onCancel={() => GlobalLib.CustomModal.get().hide()}
          data={assetsData?.investments}
          onSubmit={submitInvestments}
        />
      ),
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        nestedScrollEnabled
        style={AppStyle.flex1}
        contentContainerStyle={AppStyle.padBottom40}
        showsVerticalScrollIndicator={false}>
        <Question emotion="blink" content={t(`${i18nScope}.content`, { name: askingName?.name })} />
        <Option
          type={isFinishedProperty ? 'complete' : 'enable'}
          text={t(`${i18nScope}.option1`)}
          onPress={handleOpenModalProperties}
          renderIcon={() => <AssetStoryIcon />}
        />
        <Option
          type={isFinishedBankAccount ? 'complete' : 'enable'}
          text={t(`${i18nScope}.option2`)}
          style={AppStyle.marginTop10}
          onPress={handleOpenModalBankAccounts}
          renderIcon={() => <BankIcon />}
        />
        <Option
          type={isFinishedInvestment ? 'complete' : 'enable'}
          text={t(`${i18nScope}.option3`)}
          style={AppStyle.marginTop10}
          onPress={handleOpenModalInvestments}
          renderIcon={() => <InvestmentIcon />}
        />
        <ButtonField
          type={
            (!isFinishedProperty || !isFinishedBankAccount || !isFinishedInvestment) && 'disabled'
          }
          text={t('global.next')}
          style={AppStyle.marginTop20}
          onPress={() => handleNextStep()}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withTranslation())(AssetStoryTelling);
