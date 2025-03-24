import BackIcon from 'assets/svgs/backIcon';
import DashedLine from 'components/basics/DashedLine';
import TouchableField from 'components/basics/TouchableField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { isArray, isEmpty, isNil } from 'lodash';
import { useThemedStyle } from 'providers/';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import { OnboardingStep } from 'store/OnBoardingInterview/constants';
import {
  selectAssets,
  selectBorrowings,
  selectCurrentStep,
  selectIncomes,
  selectSpending,
  selectTotalStep,
} from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.progressBar';

function HeaderProgressBar({ style, onPress }) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle(
    {
      ...themedStyles,
      container: {
        ...themedStyles.container,
        ...convertedStyle,
      },
    },
    i18nScope,
  );
  const totalStep = useSelector(selectTotalStep);
  const currentStep = useSelector(selectCurrentStep);
  const assets = useSelector(selectAssets);
  const borrowings = useSelector(selectBorrowings);
  const incomes = useSelector(selectIncomes);
  const spendings = useSelector(selectSpending);

  const assetCompleted = useMemo(() => {
    if (
      isEmpty(assets?.properties) ||
      isEmpty(assets?.bankAccounts) ||
      isEmpty(assets?.investments)
    ) {
      return false;
    }
    return true;
  }, [assets]);

  const borrowingCompleted = useMemo(() => {
    if (isEmpty(borrowings?.liabilities)) {
      return false;
    }
    return true;
  }, [borrowings]);
  const incomeCompleted = useMemo(() => {
    if (isArray(incomes)) {
      return true;
    }
    return false;
  }, [incomes]);
  const spendingCompleted = useMemo(() => {
    if (isArray(spendings) && !spendings.some(x => isNil(x.totalAmount))) {
      return true;
    }
    return false;
  }, [spendings]);

  const progress = useMemo(() => {
    switch (currentStep) {
      case OnboardingStep.AskingName:
        return 1;
      case OnboardingStep.Household:
      case OnboardingStep.HouseholdKid:
      case OnboardingStep.HouseholdPartner:
        return 2;
      case OnboardingStep.Asset:
      case OnboardingStep.AssetStoryTelling:
      case OnboardingStep.BorrowingTelling:
      case OnboardingStep.IncomeTelling:
      case OnboardingStep.SpendingTelling:
        if (incomeCompleted) {
          return 6;
        }
        if (borrowingCompleted) {
          return 5;
        }
        if (assetCompleted) {
          return 4;
        }
        return 3;
      default:
        break;
    }
  }, [currentStep, assetCompleted, borrowingCompleted, incomeCompleted]);

  const renderProgress = useMemo(() => {
    return (
      <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.alignContent]}>
        {[...Array(totalStep)].map((_, idx) => {
          const Dash = () =>
            idx === totalStep - 1 ? null : (
              <DashedLine dashLength={3} dashGap={1} dashThickness={1} style={AppStyle.flex1} />
            );

          if (idx + 1 < progress) {
            return (
              <View
                key={`step-${idx}`}
                style={[AppStyle.rowFlex, AppStyle.flex1, AppStyle.alignContent]}>
                <View style={styles.iconCheck}>
                  <FAIcon name="check" color={'#FFF'} size={10} />
                </View>
                <View style={styles.line} />
              </View>
            );
          }
          if (idx + 1 === progress) {
            if (spendingCompleted && progress === totalStep) {
              return (
                <View key={`step-${idx}`} style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                  <View style={styles.iconCheck}>
                    <FAIcon name="check" color={'#FFF'} size={10} />
                  </View>
                </View>
              );
            }
            return (
              <View
                key={`step-${idx}`}
                style={[AppStyle.rowFlex, AppStyle.flex1, AppStyle.alignContent]}>
                <View style={styles.iconCheckCurrent}>
                  <View style={styles.dotActive} />
                </View>
                <Dash />
              </View>
            );
          }
          return (
            <View
              key={`step-${idx}`}
              style={[
                AppStyle.rowFlex,
                idx < totalStep - 1 && AppStyle.flex1,
                AppStyle.alignContent,
              ]}>
              <View style={styles.iconCheckDefault}>
                <View style={styles.dot} />
              </View>
              <Dash />
            </View>
          );
        })}
      </View>
    );
  }, [progress, styles, totalStep, spendingCompleted]);

  return (
    <SafeAreaView edges={['top', 'right', 'left']} style={styles.safeView}>
      <View style={styles.container}>
        <TouchableField style={styles.width} onPress={onPress}>
          <BackIcon color={styles.backIcon.color} />
        </TouchableField>
        <View style={styles.progress}>{renderProgress}</View>
        <View style={styles.width} />
      </View>
    </SafeAreaView>
  );
}

export default HeaderProgressBar;
