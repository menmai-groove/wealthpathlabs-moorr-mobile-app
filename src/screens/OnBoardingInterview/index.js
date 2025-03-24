import ButtonField from 'components/basics/ButtonField';
import TextField from 'components/basics/TextField';
import Header from 'components/layouts/Header';
import { GlobalLib } from 'libs';
import { useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useEffect, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import HeaderProgressBar from 'screens/OnBoardingInterview/components/HeaderProgressBar';
import Question from 'screens/OnBoardingInterview/components/Question';
import AskingName from 'screens/OnBoardingInterview/components/Step/AskingName';
import Asset from 'screens/OnBoardingInterview/components/Step/Asset';
import AssetStoryTelling from 'screens/OnBoardingInterview/components/Step/AssetStoryTelling';
import BorrowingTelling from 'screens/OnBoardingInterview/components/Step/BorrowingTelling';
import GetStarted from 'screens/OnBoardingInterview/components/Step/GetStarted';
import Household from 'screens/OnBoardingInterview/components/Step/Household';
import HouseholdKid from 'screens/OnBoardingInterview/components/Step/HouseholdKid';
import HouseholdPartner from 'screens/OnBoardingInterview/components/Step/HouseholdPartner';
import IncomeTelling from 'screens/OnBoardingInterview/components/Step/IncomeTelling';
import SpendingTelling from 'screens/OnBoardingInterview/components/Step/SpendingTelling';
import Success from 'screens/OnBoardingInterview/components/Step/Success';
import {
  finishInterview,
  loadDataFromLocalStorage,
  nextStep,
  previousStep,
  submitInterview,
} from 'store/OnBoardingInterview/action';
import { OnboardingStep } from 'store/OnBoardingInterview/constants';
import getModule from 'store/OnBoardingInterview/module';
import { selectCurrentStep } from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.onBoardingInterview';

function OnBoardingInterview(props) {
  const { t } = props;
  const styles = useThemedStyle(themedStyles, 'screens.onBoardingInterview');
  const dispatch = useDispatch();

  const currentStep = useSelector(selectCurrentStep);

  useEffect(() => {
    dispatch(loadDataFromLocalStorage());
  }, [dispatch]);

  const openConfirmModal = useCallback(() => {
    GlobalLib.CustomModal.get().show({
      body: (
        <ScrollView showsVerticalScrollIndicator={false}>
          <TextField type="heading-2" style={[AppStyle.textCenter, AppStyle.marginBottom20]}>
            {t(`${i18nScope}.titleConfirmModal`)}
          </TextField>
          <Question
            emotion="confused"
            content={t(`${i18nScope}.contentConfirmModal`)}
            question={t(`${i18nScope}.questionConfirmModal`)}
          />
          <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
            <ButtonField
              type="secondary"
              text={t(`${i18nScope}.no`)}
              onPress={() => GlobalLib.CustomModal.get().hide()}
            />
            <ButtonField
              text={t(`${i18nScope}.yes`)}
              onPress={() => {
                GlobalLib.CustomModal.get().hide();
                dispatch(submitInterview({ skip: true }));
              }}
            />
          </View>
        </ScrollView>
      ),
    });
  }, [dispatch, t]);

  const handleNextStep = useCallback(
    data => {
      switch (currentStep) {
        case OnboardingStep.Asset:
          if (data?.expenditureStatus === 'complete-all') {
            dispatch(submitInterview());
          } else {
            openConfirmModal();
          }
          break;
        case OnboardingStep.Success:
          dispatch(finishInterview(data));
          break;
        default:
          dispatch(nextStep(data));
          break;
      }
    },
    [currentStep, dispatch, openConfirmModal],
  );

  const handleGoBack = useCallback(() => {
    dispatch(previousStep());
  }, [dispatch]);

  const renderHeader = useMemo(() => {
    if (
      currentStep === OnboardingStep.GetStarted ||
      currentStep === OnboardingStep.Success ||
      currentStep === ''
    ) {
      return <View />;
    }
    if (currentStep === OnboardingStep.SpendingTelling) {
      return (
        <Header
          type="back"
          title={t('screens.onBoardingInterview.spendingTelling.title')}
          onBackHeader={handleGoBack}
          style={styles.headerPadding}
        />
      );
    }

    return <HeaderProgressBar onPress={handleGoBack} />;
  }, [currentStep, handleGoBack, styles, t]);

  const renderStep = useMemo(() => {
    switch (currentStep) {
      case OnboardingStep.GetStarted:
        return <GetStarted onPress={handleNextStep} />;
      case OnboardingStep.AskingName:
        return <AskingName onPress={handleNextStep} onBack={handleGoBack} />;
      case OnboardingStep.Household:
        return <Household onPress={handleNextStep} onBack={handleGoBack} />;
      case OnboardingStep.HouseholdPartner:
        return <HouseholdPartner onPress={handleNextStep} onBack={handleGoBack} />;
      case OnboardingStep.HouseholdKid:
        return <HouseholdKid onPress={handleNextStep} onBack={handleGoBack} />;
      case OnboardingStep.Asset:
        return <Asset onPress={handleNextStep} onBack={handleGoBack} />;
      case OnboardingStep.AssetStoryTelling:
        return <AssetStoryTelling onPress={handleNextStep} onBack={handleGoBack} />;
      case OnboardingStep.BorrowingTelling:
        return <BorrowingTelling onPress={handleNextStep} onBack={handleGoBack} />;
      case OnboardingStep.IncomeTelling:
        return <IncomeTelling onPress={handleNextStep} onBack={handleGoBack} />;
      case OnboardingStep.SpendingTelling:
        return <SpendingTelling onPress={handleNextStep} onBack={handleGoBack} />;
      case OnboardingStep.Success:
        return <Success onPress={handleNextStep} />;
      default:
        return <View />;
    }
  }, [currentStep, handleGoBack, handleNextStep]);

  return (
    <View style={styles.container}>
      {renderHeader}
      {renderStep}
    </View>
  );
}

export default compose(
  withDynamicModuleLoader(getModule()),
  withTranslation(),
)(OnBoardingInterview);
