import Header from 'components/layouts/Header';
import { GlobalLib, NavigationServiceLib } from 'libs';
import { useThemedStyle, useOnBackButtonPress } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { compose } from 'redux';
import {
  AddExpenseStep1,
  AddExpenseStep2,
  AddExpenseStep3,
} from 'screens/Expense/components/steps';
import { ADD_NEW_EXPENSE_STEPS } from 'screens/Expense/constants';
import getModule from 'store/Expense/module';

import themedStyles from './styles';
import { FormDataProvider } from './useSaveFormData';

const i18nScope = 'screens.expense';

function AddExpense() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, `${i18nScope}.addExpense`);
  useOnBackButtonPress(() => handleGoBack());
  const [currentStep, setStep] = useState(ADD_NEW_EXPENSE_STEPS.STEP1);

  const handleNextStep = useCallback(() => {
    switch (currentStep) {
      case ADD_NEW_EXPENSE_STEPS.STEP1:
        setStep(ADD_NEW_EXPENSE_STEPS.STEP2);
        break;
      case ADD_NEW_EXPENSE_STEPS.STEP2:
        setStep(ADD_NEW_EXPENSE_STEPS.STEP3);
        break;
      case ADD_NEW_EXPENSE_STEPS.STEP3:
        break;
      default:
        break;
    }
  }, [currentStep]);

  const handleCancel = useCallback(() => {
    GlobalLib.ConfirmModal.get().show({
      title: t(`${i18nScope}.addExpense.cancelConfirmation`),
      content: t(`${i18nScope}.addExpense.areYouSureCancel`),
      onConfirm: () => NavigationServiceLib.pop(),
    });
  }, [t]);

  const handleGoBack = useCallback(() => {
    switch (currentStep) {
      case ADD_NEW_EXPENSE_STEPS.STEP1:
        handleCancel();
        break;
      case ADD_NEW_EXPENSE_STEPS.STEP2:
        setStep(ADD_NEW_EXPENSE_STEPS.STEP1);
        break;
      case ADD_NEW_EXPENSE_STEPS.STEP3:
        setStep(ADD_NEW_EXPENSE_STEPS.STEP2);
        break;
      default:
        break;
    }
  }, [currentStep, handleCancel]);

  const renderStep = useMemo(() => {
    switch (currentStep) {
      case ADD_NEW_EXPENSE_STEPS.STEP3:
        return <AddExpenseStep3 onCancel={handleCancel} />;
      case ADD_NEW_EXPENSE_STEPS.STEP2:
        return <AddExpenseStep2 onPress={handleNextStep} onCancel={handleCancel} />;
      default:
        return <AddExpenseStep1 onPress={handleNextStep} onCancel={handleCancel} />;
    }
  }, [currentStep, handleNextStep, handleCancel]);

  return (
    <View style={styles.container}>
      <Header
        type="full"
        title={t(`${i18nScope}.addExpense.headerTitle`)}
        style={styles.headerPadding}
        onBackHeader={handleGoBack}
        numberOfLines={1}
      />
      <FormDataProvider>{renderStep}</FormDataProvider>
    </View>
  );
}

export default compose(withDynamicModuleLoader(getModule()))(AddExpense);
