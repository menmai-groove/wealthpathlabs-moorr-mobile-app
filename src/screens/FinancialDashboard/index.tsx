import FloatingButtonActions from 'components/basics/FloatingButtonActions';
import Header from 'components/layouts/Header';
import React, { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
//
import { RouteProp, useRoute } from '@react-navigation/native';
import { AppScreenID } from 'constant';
import { GlobalLib, NavigationServiceLib } from 'libs';
import { RootStackParamList } from 'navigation/types';
import { useOnBackScreenHandler, useOnScreenRefresh, useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import getModule from 'store/FinancialDashboard/module';
import {
  selectFinancialSummaryGroupData,
  selectIsFetchedFinancialDashboard,
  selectIsFetchedFinancialSummary,
} from 'store/FinancialDashboard/selector';
import { AppStyle } from 'theme';
import FinancialList from 'components/basics/FinancialList';
import { selectFlags } from 'store/Auth/selector';

import { ExplanatoryModal, OverviewCard } from './components';

import themedStyles from './styles';

const DEFAULT_EXPAND_INDEX = 0;
const i18nScope = 'screens.financialDashboard';

export function getFloatingActions(styles) {
  const defaultParams = {
    textStyle: styles.actionText,
    buttonSize: styles.actionButton.width,
    margin: styles.actionButton.margin,
  };
  return [
    {
      text: 'Income',
      icon: require('assets/images/common/jar-money.png'),
      name: 'bt_income',
      screenID: AppScreenID.Income,
      position: 1,
      color: styles.addIncomeButton.backgroundColor,
    },
    {
      text: 'Asset',
      icon: require('assets/images/common/home.png'),
      name: 'bt_asset',
      screenID: AppScreenID.AddAsset,
      position: 2,
      color: styles.addAssetButton.backgroundColor,
    },
    {
      text: 'Expense',
      icon: require('assets/images/common/wallet.png'),
      name: 'bt_expense',
      screenID: AppScreenID.AddExpense,
      position: 3,
      color: styles.addExpenseButton.backgroundColor,
    },
    {
      text: 'Borrowing',
      icon: require('assets/images/common/borrowing-white.png'),
      name: 'bt_borrowing',
      screenID: AppScreenID.Borrowing,
      position: 4,
      color: styles.addBorrowingButton.backgroundColor,
    },
  ].map(i => ({ ...i, ...defaultParams }));
}

function FinancialDashboard() {
  useOnBackScreenHandler();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { t } = useTranslation();
  const { screenRefreshId } = useOnScreenRefresh();
  const summaryGroupData = useSelector(selectFinancialSummaryGroupData);
  const isReadyList = useSelector(selectIsFetchedFinancialDashboard);
  const isReadySummary = useSelector(selectIsFetchedFinancialSummary);
  const flags = useSelector(selectFlags);

  const route = useRoute<RouteProp<RootStackParamList, 'financial_dashboard'>>();
  const defaultExpandIndex = route?.params?.expandIndex ?? DEFAULT_EXPAND_INDEX;

  const stickyHeaderOffset = useRef(0);

  const floatingActions = useMemo(() => getFloatingActions(styles), [styles]);

  const navigateExpenseDashboard = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.ExpenseDashboard);
  }, []);

  const onPressSeeDetails = useCallback((breakdown, description) => {
    GlobalLib.CustomModal.get().show({
      onBackdropPress: GlobalLib.CustomModal.get().hide,
      onRequestClose: GlobalLib.CustomModal.get().hide,
      hideCloseButton: false,
      body: <ExplanatoryModal data={breakdown} title={description} />,
    });
  }, []);

  const ListHeaderComponent = useMemo(
    () => (
      <View
        key={`summary-${screenRefreshId}`}
        onLayout={({ nativeEvent }) => {
          stickyHeaderOffset.current = nativeEvent.layout.height;
        }}
        style={[AppStyle.padY15, styles.listHeader]}>
        {Object.keys(summaryGroupData).map((key, index) => {
          const item = summaryGroupData[key];
          const label = item?.label ?? '';
          const total = item?.total ?? 0;
          const data = item?.breakdown?.filter(_item => _item.value !== 0);
          const description = item?.description ?? '';
          const isExpenses = key === 'expenses';
          if (key === 'propertyPortfolio') {
            return null;
          }
          return (
            <OverviewCard
              key={`overview-${label}`}
              label={label}
              totalLabel={`${t(`${i18nScope}.total`)} ${label}`}
              description={`${label} ${t(`${i18nScope}.breakdown`)}`}
              defaultCollapse={index !== defaultExpandIndex}
              total={total}
              data={data}
              allLoaded={isReadySummary}
              onPressSeeDetails={() => {
                if (isExpenses && flags.expenseDashboardVisible) {
                  navigateExpenseDashboard();
                } else {
                  onPressSeeDetails(data, description);
                }
              }}
              showSeeDetails={isExpenses}
            />
          );
        })}
      </View>
    ),
    [
      defaultExpandIndex,
      isReadySummary,
      onPressSeeDetails,
      screenRefreshId,
      styles,
      summaryGroupData,
      t,
      navigateExpenseDashboard,
      flags,
    ],
  );

  return (
    <View style={styles.container}>
      <Header type={'full'} title={t(`${i18nScope}.headerTitle`)} />
      <FinancialList type="ALL" ListHeaderComponent={ListHeaderComponent} />
      <FloatingButtonActions
        actions={floatingActions}
        onPressItem={name => {
          const item = floatingActions.find(i => i.name === name);
          if (item && item.screenID) {
            NavigationServiceLib.navigate(item.screenID);
          }
        }}
        disabled={isReadyList}
      />
    </View>
  );
}

export default compose(withDynamicModuleLoader(getModule()))(FinancialDashboard);
