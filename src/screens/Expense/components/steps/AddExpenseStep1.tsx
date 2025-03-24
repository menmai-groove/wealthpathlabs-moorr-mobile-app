import { AppConstants } from 'constant';
import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import i18n from 'bootstrap/i18n';
import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, FlatList, TextStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { selectDataBillExpenseType, selectDataSpendingExpenseType } from 'store/Auth/selector';
import { useFormData } from 'screens/Expense/useSaveFormData';
import { AppStyle } from 'theme';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { get, head } from 'lodash';
import FooterControl from 'components/basics/FooterControl';

import themedStyles, { tabBarOptions } from './styles';

const TAB_ROUTE = {
  Spending: 'SpendingExpense',
  Bills: 'BillExpense',
};
const TopTab = createMaterialTopTabNavigator();
const i18nScope = 'screens.expense';

function ExpenseTabList({ onItemPress, data, selectedItem }) {
  const styles = useThemedStyle(themedStyles, `${i18nScope}.addExpense`);

  const renderItem = useCallback(
    ({ item }) => {
      const isSelectedItem = item?.value === selectedItem?.value;
      return (
        <TouchableOpacity
          style={isSelectedItem ? styles.activeCategoryItem : styles.categoryItem}
          onPress={() => onItemPress(item)}>
          <TextField style={isSelectedItem ? styles.activeCategoryText : styles.categoryText}>
            {item.label}
          </TextField>
        </TouchableOpacity>
      );
    },
    [styles, onItemPress, selectedItem],
  );

  return (
    <FlatList
      data={data}
      initialNumToRender={20}
      showsVerticalScrollIndicator={false}
      style={styles.containerList}
      contentContainerStyle={[styles.contentList, AppStyle.padBottom90]}
      keyExtractor={item => item.label}
      renderItem={renderItem}
    />
  );
}

function BillExpense() {
  const billExpenseData = useSelector(selectDataBillExpenseType);
  const { formData, saveFormData } = useFormData();
  return (
    <ExpenseTabList
      data={billExpenseData}
      onItemPress={item => saveFormData({ selectBillType: item })}
      selectedItem={formData.selectBillType}
    />
  );
}

function SpendingExpense() {
  const spendingExpenseData = useSelector(selectDataSpendingExpenseType);
  const { formData, saveFormData } = useFormData();
  return (
    <ExpenseTabList
      data={spendingExpenseData}
      onItemPress={item => saveFormData({ selectSpendingType: item })}
      selectedItem={formData.selectSpendingType}
    />
  );
}

export function AddExpenseStep1({ onPress: handleNextStep, onCancel }) {
  const billExpenseData = useSelector(selectDataBillExpenseType);
  const spendingExpenseData = useSelector(selectDataSpendingExpenseType);
  const styles = useThemedStyle(themedStyles, `${i18nScope}.addExpense`);
  const { formData, saveFormData } = useFormData();
  const [indexTab, setIndexTab] = useState(0);

  useEffect(() => {
    if (!formData.selectBillType?.value) {
      saveFormData({ selectBillType: head(billExpenseData) });
    }
    if (!formData.selectSpendingType?.value) {
      saveFormData({ selectSpendingType: head(spendingExpenseData) });
    }
  }, [billExpenseData, spendingExpenseData, saveFormData, formData]);

  const onPressNext = useCallback(() => {
    saveFormData({
      type: indexTab === 0 ? formData.selectBillType : formData.selectSpendingType,
      expenseGroup:
        indexTab === 0 ? AppConstants.ExpenseGroups.Bills : AppConstants.ExpenseGroups.Spending,
    });
    handleNextStep({ type: formData.type });
  }, [formData, handleNextStep, indexTab, saveFormData]);

  return (
    <View style={[AppStyle.flex1, styles.container]}>
      <TextField
        type="heading-4"
        style={[AppStyle.padTop30, AppStyle.padBottom10, AppStyle.padX30]}>
        {i18n.t(`${i18nScope}.addExpense.questionSelectItem`)}
      </TextField>
      <TopTab.Navigator
        screenListeners={{
          state: e => {
            setIndexTab(get(e, ['data', 'state', 'index'], 0));
          },
        }}
        backBehavior="none"
        initialRouteName={
          formData.expenseGroup === AppConstants.ExpenseGroups.Spending
            ? TAB_ROUTE.Spending
            : TAB_ROUTE.Bills
        }
        defaultScreenOptions={{ tabBarLabelStyle: { color: '#222' } as TextStyle }}
        screenOptions={{
          ...tabBarOptions,
          tabBarLabelStyle: styles.tabBarLabelStyle || tabBarOptions.tabBarLabelStyle,
          tabBarIndicatorStyle: styles.tabBarIndicatorStyle || tabBarOptions.tabBarIndicatorStyle,
          tabBarStyle: styles.tabBarStyle || tabBarOptions.tabBarStyle,
          tabBarItemStyle: styles.tabBarItemStyle || tabBarOptions.tabBarItemStyle,
        }}
        tabBarPosition="top">
        <TopTab.Screen
          name={TAB_ROUTE.Bills}
          options={{ title: i18n.t(`${i18nScope}.billsTitle`) }}>
          {() => <BillExpense />}
        </TopTab.Screen>
        <TopTab.Screen
          name={TAB_ROUTE.Spending}
          options={{ title: i18n.t(`${i18nScope}.spendingTitle`) }}>
          {() => <SpendingExpense />}
        </TopTab.Screen>
      </TopTab.Navigator>
      <View style={styles.wrapperControl}>
        <FooterControl
          onCancel={onCancel}
          onSave={onPressNext}
          isEdited
          textButtonSave={i18n.t('global.next')}
          textButtonCancel={null}
        />
      </View>
    </View>
  );
}
