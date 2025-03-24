/**
 *
 * Entry
 *
 */

import { MenuButton, MenuModal } from 'components/layouts/MenuLayout';
import { AppScreenID } from 'constant';
import { GlobalLib } from 'libs';
import MainStackNavigator from 'navigation/MainStackNavigator';
import MenuProvider from 'providers/menu/provider';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import AddNewAsset from 'screens/AddAsset';
import AddPersonalGoal from 'screens/AddPersonalGoal';
import AssetPositionScreen from 'screens/AssetPosition';
import Borrowing from 'screens/Borrowing';
import Campaign from 'screens/Campaign';
import CashPositionScreen from 'screens/CashPosition';
import ChangePassword from 'screens/ChangePassword';
import CreditCardJar from 'screens/CreditCardJar';
import DebtPositionScreen from 'screens/DebtPosition';
import DirectPaymentJar from 'screens/DirectPaymentJar';
import EditAsset from 'screens/EditAsset';
import EditPersonalGoal from 'screens/EditPersonalGoal';
import AddExpense from 'screens/Expense/AddExpense';
import EditExpense from 'screens/Expense/EditExpense';
import ExpenseDashboard from 'screens/ExpenseDashboard';
import FinancialDashboard from 'screens/FinancialDashboard';
import HistoricalLogScreen from 'screens/HistoricalLog';
import Home from 'screens/Home';
import HouseholdDetail from 'screens/HouseholdDetail';
import AddNewIncome from 'screens/Income';
import JarsDashboard from 'screens/JarsDashboard';
import LivingLifeStyleJar from 'screens/LivingLifeStyleJar';
import LoansJar from 'screens/LoansJar';
import MoneySmartsDashboard from 'screens/MoneySmartsDashboard';
import MonthlyCheckUpScreen from 'screens/MonthlyCheckUp';
import MonthlyReportingDashboard from 'screens/MonthlyReportingDashboard';
import NetWorthScreen from 'screens/NetWorth';
import Notification from 'screens/Notification';
import PrimarySavingAccountJar from 'screens/PrimarySavingAccountJar';
import Profile from 'screens/Profile';
import ProfileSetting from 'screens/ProfileSetting';
import ProvisionJarsScreen from 'screens/ProvisionJars';
import ProvisionJarsExpense from 'screens/ProvisionJarsExpense';
import ProvisionSpending from 'screens/ProvisionSpending';
import RegularSpending from 'screens/RegularSpending';
import Settings from 'screens/Settings';
import StyleGuide from 'screens/StyleGuide';
import VerticalTimeline from 'screens/VerticalTimeline';
import WealthDashboard from 'screens/WealthDashboard';
import WebviewScreen from 'screens/Webview';
import { AppStyle } from 'theme';

function Entry() {
  const screens = useMemo(() => {
    const data = [
      {
        name: AppScreenID.Home,
        component: Home,
      },
      {
        name: AppScreenID.Profile,
        component: Profile,
      },
      {
        name: AppScreenID.ProfileSetting,
        component: ProfileSetting,
      },
      {
        name: AppScreenID.ChangePassword,
        component: ChangePassword,
      },
      {
        name: AppScreenID.FinancialDashboard,
        component: FinancialDashboard,
      },
      {
        name: AppScreenID.MyFINANCIALS,
        component: FinancialDashboard,
      },
      {
        name: AppScreenID.MoneySmartsDashboard,
        component: MoneySmartsDashboard,
      },
      {
        name: AppScreenID.JarsDashboard,
        component: JarsDashboard,
      },
      {
        name: AppScreenID.PrimarySavingAccountJar,
        component: PrimarySavingAccountJar,
      },
      {
        name: AppScreenID.LivingLifeStyleJar,
        component: LivingLifeStyleJar,
      },
      {
        name: AppScreenID.CreditCardJar,
        component: CreditCardJar,
      },
      {
        name: AppScreenID.ProvisionJarsScreen,
        component: ProvisionJarsScreen,
      },
      {
        name: AppScreenID.ProvisionExpenseScreen,
        component: ProvisionJarsExpense,
      },
      {
        name: AppScreenID.VerticalTimeline,
        component: VerticalTimeline,
      },
      {
        name: AppScreenID.AddPersonalGoal,
        component: AddPersonalGoal,
      },
      {
        name: AppScreenID.EditPersonalGoal,
        component: EditPersonalGoal,
      },
      {
        name: AppScreenID.DirectPaymentJar,
        component: DirectPaymentJar,
      },
      {
        name: AppScreenID.LoansJar,
        component: LoansJar,
      },
      {
        name: AppScreenID.Income,
        component: AddNewIncome,
      },
      {
        name: AppScreenID.ProvisionSpending,
        component: ProvisionSpending,
      },
      {
        name: AppScreenID.RegularSpending,
        component: RegularSpending,
      },
      {
        name: AppScreenID.MonthlyCheckUp,
        component: MonthlyCheckUpScreen,
      },
      {
        name: AppScreenID.MonthlyReportingDashboard,
        component: MonthlyReportingDashboard,
      },
      {
        name: AppScreenID.Notification,
        component: Notification,
      },
      {
        name: AppScreenID.Borrowing,
        component: Borrowing,
      },
      {
        name: AppScreenID.AddAsset,
        component: AddNewAsset,
      },
      {
        name: AppScreenID.EditAsset,
        component: EditAsset,
      },
      {
        name: AppScreenID.AddExpense,
        component: AddExpense,
      },
      {
        name: AppScreenID.EditExpense,
        component: EditExpense,
      },
      {
        name: AppScreenID.HouseholdDetail,
        component: HouseholdDetail,
      },
      {
        name: AppScreenID.WealthDashboard,
        component: WealthDashboard,
      },
      {
        name: AppScreenID.ExpenseDashboard,
        component: ExpenseDashboard,
      },
      {
        name: AppScreenID.Campaign,
        component: Campaign,
      },
      {
        name: AppScreenID.HistoricalLog,
        component: HistoricalLogScreen,
      },
      {
        name: AppScreenID.CashPosition,
        component: CashPositionScreen,
      },
      {
        name: AppScreenID.NetWorth,
        component: NetWorthScreen,
      },
      {
        name: AppScreenID.AssetPosition,
        component: AssetPositionScreen,
      },
      {
        name: AppScreenID.DebtPosition,
        component: DebtPositionScreen,
      },
      {
        name: AppScreenID.Webview,
        component: WebviewScreen,
      },
    ];
    if (__DEV__) {
      data.push(
        {
          name: AppScreenID.Settings,
          component: Settings,
        },
        {
          name: AppScreenID.StyleGuide,
          component: StyleGuide,
        },
      );
    }
    return data;
  }, []);

  return (
    <View style={AppStyle.flex1}>
      <MainStackNavigator
        screens={screens}
        config={{
          initialRouteName: AppScreenID.Home,
        }}
      />
      <MenuProvider>
        <MenuModal
          ref={ref => {
            GlobalLib.MenuModal.set(ref);
          }}
        />
        <MenuButton />
      </MenuProvider>
    </View>
  );
}

Entry.propTypes = {};

export default Entry;
