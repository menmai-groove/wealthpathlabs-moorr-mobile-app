import AssetStoryIcon from 'assets/svgs/onboardingInterview/assetStoryIcon';
import IncomeIcon from 'assets/svgs/onboardingInterview/incomeIcon';
import LoanIcon from 'assets/svgs/onboardingInterview/loanIcon';
import SpendingIcon from 'assets/svgs/onboardingInterview/spendingIcon';
import ButtonField from 'components/basics/ButtonField';
import TextField from 'components/basics/TextField';
import { isArray, isEmpty, isNil } from 'lodash';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import React, { useCallback, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import Option from 'screens/OnBoardingInterview/components/Option';
import Question from 'screens/OnBoardingInterview/components/Question';
import { nextStep } from 'store/OnBoardingInterview/action';
import { OnboardingStep } from 'store/OnBoardingInterview/constants';
import {
  selectAskingNameData,
  selectAssets,
  selectBorrowings,
  selectIncomes,
  selectSpending,
} from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.onBoardingInterview.asset';

function Asset(props) {
  useOnBackButtonPress(props.onBack);
  const { t, onPress: handleSubmit } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatch = useDispatch();

  const askingName = useSelector(selectAskingNameData);
  const assets = useSelector(selectAssets);
  const borrowings = useSelector(selectBorrowings);
  const incomes = useSelector(selectIncomes);
  const spendings = useSelector(selectSpending);

  const assetStatus = useMemo(() => {
    if (
      !isEmpty(assets?.properties) &&
      !isEmpty(assets?.bankAccounts) &&
      !isEmpty(assets?.investments)
    ) {
      return 'complete-all';
    }
    return 'enable';
  }, [assets]);

  const borrowingStatus = useMemo(() => {
    if (assetStatus === 'complete-all') {
      if (!isEmpty(borrowings?.liabilities)) {
        return 'complete-all';
      }
      return 'enable';
    }
    return 'disable';
  }, [assetStatus, borrowings]);

  const incomeStatus = useMemo(() => {
    if (borrowingStatus === 'complete-all') {
      if (isArray(incomes)) {
        return 'complete-all';
      }
      return 'enable';
    }
    return 'disable';
  }, [borrowingStatus, incomes]);

  const expenditureStatus = useMemo(() => {
    if (incomeStatus === 'complete-all') {
      if (isArray(spendings) && !spendings.some(x => isNil(x.totalAmount))) {
        return 'complete-all';
      }
      return 'enable';
    }
    return 'disable';
  }, [incomeStatus, spendings]);

  const getContent = useMemo(() => {
    if (borrowingStatus === 'enable') {
      return {
        content: t(`${i18nScope}.borrowingContent1`),
        question: t(`${i18nScope}.borrowingContent2`),
      };
    }
    if (incomeStatus === 'enable') {
      return {
        content: t(`${i18nScope}.incomeContent`),
      };
    }
    if (expenditureStatus === 'enable') {
      return {
        content: t(`${i18nScope}.expenditureContent`, { name: askingName?.name }),
      };
    }
    return {
      content: t(`${i18nScope}.assetContent1`, { name: askingName?.name }),
      question: t(`${i18nScope}.assetContent2`),
    };
  }, [askingName, borrowingStatus, expenditureStatus, incomeStatus, t]);

  const handleNextStep = useCallback(
    step => {
      dispatch(nextStep({ step }));
    },
    [dispatch],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={AppStyle.flex1}
        contentContainerStyle={[AppStyle.padX30, AppStyle.padBottom40]}
        showsVerticalScrollIndicator={false}>
        {expenditureStatus === 'complete-all' ? (
          <Question emotion="smile">
            <TextField style={styles.textContent}>
              {t(`${i18nScope}.contentCompleted1`, { name: askingName?.name })}
            </TextField>
            <TextField style={[styles.textContent, AppStyle.padY10]}>
              {t(`${i18nScope}.contentCompleted2`)}
            </TextField>
            <TextField style={styles.textContent}>{t(`${i18nScope}.contentCompleted3`)}</TextField>
          </Question>
        ) : (
          <Question emotion="excited" content={getContent.content} question={getContent.question} />
        )}

        <Option
          type={assetStatus}
          text={t(`${i18nScope}.option1`)}
          onPress={() => handleNextStep(OnboardingStep.AssetStoryTelling)}
          renderIcon={() => <AssetStoryIcon />}
        />
        <Option
          type={borrowingStatus}
          text={t(`${i18nScope}.option2`)}
          style={AppStyle.marginTop10}
          onPress={() => handleNextStep(OnboardingStep.BorrowingTelling)}
          renderIcon={type => <LoanIcon active={type !== 'disable'} />}
        />
        <Option
          type={incomeStatus}
          text={t(`${i18nScope}.option3`)}
          style={AppStyle.marginTop10}
          onPress={() => handleNextStep(OnboardingStep.IncomeTelling)}
          renderIcon={type => <IncomeIcon active={type !== 'disable'} />}
        />
        <Option
          type={expenditureStatus}
          text={t(`${i18nScope}.option4`)}
          style={AppStyle.marginTop10}
          onPress={() => handleNextStep(OnboardingStep.SpendingTelling)}
          renderIcon={type => <SpendingIcon active={type !== 'disable'} />}
        />
        <ButtonField
          text={t('global.finish')}
          style={AppStyle.marginTop20}
          onPress={() => handleSubmit({ expenditureStatus })}
        />
      </ScrollView>
    </View>
  );
}

export default compose(withTranslation())(Asset);
