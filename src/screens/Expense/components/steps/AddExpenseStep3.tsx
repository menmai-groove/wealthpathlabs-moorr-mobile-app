import { useThemedStyle } from 'providers';
import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { AppStyle } from 'theme';
import { ExpenseRentForm } from 'screens/Expense/components/forms';
import themedStyles from 'screens/Expense/components/steps/styles';
import * as actions from 'store/Expense/action';
import { getSubmitExpenseData } from 'screens/Expense/utils';
import { AppConstants } from 'constant';
import { useDispatchResolve } from 'libs/hooks';
import { NavigationServiceLib } from 'libs';
import {
  selectDataBillExpenseType,
  selectDataSpendingExpenseType,
  selectOwners,
} from 'store/Auth/selector';
import { useSelector } from 'react-redux';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import FooterControl from 'components/basics/FooterControl';

const i18nScope = 'screens.expense';

export function AddExpenseStep3({ onCancel }) {
  const dispatchResolve = useDispatchResolve();
  const styles = useThemedStyle(themedStyles, `${i18nScope}.addExpense`);
  const billCategories = useSelector(selectDataBillExpenseType);
  const spendingCategories = useSelector(selectDataSpendingExpenseType);
  const userOwnerships = useSelector(selectOwners);

  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);
  const formRef = useRef(null);

  const onSubmitForm = useCallback(
    submitData => {
      const params = getSubmitExpenseData(submitData, '', {
        billCategories,
        spendingCategories,
        userOwnerships,
      });
      dispatchResolve(actions.submitData(params)).then(() => {
        NavigationServiceLib.pop();
      });
    },
    [dispatchResolve, spendingCategories, billCategories, userOwnerships],
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

  return (
    <View style={[AppStyle.flex1, styles.container]}>
      <KeyboardAwareScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[AppStyle.padX30, AppStyle.padBottom90]}>
        <ExpenseRentForm formRef={formRef} onSubmitForm={onSubmitForm} onErrorForm={onErrorForm} />
      </KeyboardAwareScrollView>
      <View style={styles.wrapperControl}>
        <FooterControl onCancel={onCancel} onSave={() => formRef.current?.submit()} isEdited />
      </View>
    </View>
  );
}
