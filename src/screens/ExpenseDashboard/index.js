import CustomChart from 'components/basics/CustomChart';
import CustomTab from 'components/basics/CustomTab';
import FinancialList, { FINANCIAL_LIST_TYPE } from 'components/basics/FinancialList';
import FloatingButtonActions from 'components/basics/FloatingButtonActions';
import NoDataAdded from 'components/basics/NoDataAdded';
import { PieChart } from 'components/basics/PieChart';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import ContentLoader from 'components/layouts/ContentLoader';
import Header from 'components/layouts/Header';
import { AppScreenID } from 'constant';
import { NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { get, upperCase } from 'lodash';
import { useOnScreenRefresh, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { BreakdownItem } from 'screens/ExpenseDashboard/components/BreakdownItem';
import { getFloatingActions } from 'screens/FinancialDashboard';
import { getBreakdownItems, getGroupingAndItems } from 'store/ExpenseDashboard/action';
import { SORT_TYPE } from 'store/ExpenseDashboard/constants';
import getModule from 'store/ExpenseDashboard/module';
import {
  selectDesc,
  selectGroupingAndItems,
  selectIsFetchedFinancialDashboard,
  // selectIsFetchedFinancialDashboard,
  selectIsFetchedGroupingAndItems,
  selectSortType,
} from 'store/ExpenseDashboard/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const FrequencyEnums = {
  0: 'monthly',
  1: 'yearly',
};
export const GroupingAndItemsEnums = {
  0: 'grouping',
  1: 'items',
};

const i18nScope = 'screens.expenseDashboard';

function ExpenseDashboard() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatchResolve = useDispatchResolve();
  const [tabIndex, setTabIndex] = useState(0);
  const [groupingAndItemsTabIndex, setGroupingAndItemsTabIndex] = useState(1);
  const groupingAndItems = useSelector(selectGroupingAndItems);
  const sortType = useSelector(selectSortType);
  const desc = useSelector(selectDesc);
  const isFetchedGroupingAndItems = useSelector(selectIsFetchedGroupingAndItems);
  const isFetchedFinancialDashboard = useSelector(selectIsFetchedFinancialDashboard);
  const { screenRefreshId } = useOnScreenRefresh();
  const isNoData = isFetchedGroupingAndItems
    ? get(groupingAndItems, [GroupingAndItemsEnums[1], FrequencyEnums[0]], []).length === 0
    : null;

  const frequency = useMemo(() => FrequencyEnums[tabIndex], [tabIndex]);
  const type = useMemo(
    () => GroupingAndItemsEnums[groupingAndItemsTabIndex],
    [groupingAndItemsTabIndex],
  );

  const frequencyFilters = useMemo(
    () => [
      {
        label: t(`${i18nScope}.monthly`),
      },
      {
        label: t(`${i18nScope}.annually`),
      },
    ],
    [t],
  );

  const groupingAndItemFilters = useMemo(
    () => [
      {
        label: t(`${i18nScope}.grouping`),
      },
      {
        label: t(`${i18nScope}.item`),
      },
    ],
    [t],
  );

  const onGetBreakdownItems = useCallback(
    async breakdownItem => {
      return dispatchResolve(
        getBreakdownItems({
          frequency: upperCase(frequency),
          sortType,
          desc,
          typeQuery: type === GroupingAndItemsEnums[0] ? 'GROUPS' : 'ITEMS',
          type: type,
          key: breakdownItem.label,
        }),
      );
    },
    [desc, dispatchResolve, frequency, sortType, type],
  );

  const breakdownData = useMemo(() => {
    return get(groupingAndItems, [type, frequency], []) || [];
  }, [frequency, groupingAndItems, type]);

  const renderBreakdownItem = () => {
    return breakdownData.map(breakdownItem => (
      <BreakdownItem
        key={`${type}-${frequency}-${sortType}-${breakdownItem.label}-${breakdownItem.value}-${screenRefreshId}`}
        item={breakdownItem}
        type={type}
        onExpand={() => onGetBreakdownItems(breakdownItem)}
        defaultCollapse={true}
      />
    ));
  };

  const onSelectSortType = useCallback(
    _sortType => {
      dispatchResolve(getGroupingAndItems({ sortType: _sortType, desc: desc }));
    },
    [desc, dispatchResolve],
  );

  const ListHeaderComponent = (
    <View style={[styles.headerContainer]}>
      <View style={[AppStyle.marginY10, AppStyle.padX15]}>
        <View
          style={[
            AppStyle.flex1,
            AppStyle.rowFlex,
            AppStyle.spaceBetweenContent,
            AppStyle.alignEnd,
          ]}>
          <TextField
            type="heading-2"
            style={[AppStyle.flex1, AppStyle.padRight5]}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {t(`${i18nScope}.headerTitle`)}
          </TextField>
          <TextField type="heading-1">
            {UtilLib.formatCurrency(groupingAndItems.targetedExpenses[frequency], '$', {
              decimal: 2,
            })}
          </TextField>
        </View>
        <View style={[styles.piechartContainer, AppStyle.justifyContent]}>
          {!isFetchedGroupingAndItems || !isFetchedFinancialDashboard ? (
            <ContentLoader name="customChart" />
          ) : type === GroupingAndItemsEnums[0] ? (
            <PieChart
              key={`pie-chart-${type}-${frequency}`}
              height={250}
              data={groupingAndItems.grouping[frequency]}
              labelAccessor={item => item.label}
              valueAccessor={item => item.value}
              formatValue={value => UtilLib.formatCurrency(value, '$', { decimal: 2 })}
            />
          ) : (
            <CustomChart
              key={`bar-chart-${type}-${frequency}`}
              type="bar-chart"
              data={groupingAndItems.items[frequency]}
              labelAccessor={item => item.label}
              valueAccessor={item => item.value}
              formatValue={value => UtilLib.formatCurrency(value, '$', { decimal: 2 })}
              barWidth={30}
              tooltipType={2}
              multiple={false}
              transparent
              hideLabel
              contentInset={{
                top: 20,
                bottom: 20,
                left: 40,
                right: 40,
              }}
              barVersion={3}
              pinchNZoom
            />
          )}
        </View>
        {!isFetchedGroupingAndItems ? (
          <ContentLoader name="expense_dashboard_tab" />
        ) : (
          <>
            <View style={[AppStyle.flex1, AppStyle.flexEndContent, AppStyle.alignEnd]}>
              <View>
                <CustomTab
                  key={'color-bar-chart-custom-tab'}
                  data={frequencyFilters}
                  value={tabIndex}
                  onSelect={index => {
                    setTabIndex(index);
                  }}
                  containerStyle={styles.containerTabStyle}
                  fontStyle={styles.fontTabStyle}
                  activeTabStyle={styles.activeTabStyle}
                  activeFontStyle={styles.activeFontStyle}
                />
              </View>
            </View>

            <View style={[AppStyle.margin15]}>
              <View>
                <CustomTab
                  key={'grouping-item-custom-tab'}
                  data={groupingAndItemFilters}
                  value={groupingAndItemsTabIndex}
                  onSelect={index => {
                    setGroupingAndItemsTabIndex(index);
                  }}
                  containerStyle={styles.containerTabStyle2}
                  fontStyle={styles.fontTabStyle2}
                  activeTabStyle={styles.activeTabStyle2}
                  activeFontStyle={styles.activeFontStyle2}
                />
              </View>
            </View>
          </>
        )}

        <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
          <TextField style={[AppStyle.flex1, AppStyle.padRight20]} type="heading-2">
            {t(`${i18nScope}.expensesBreakdown`)}
          </TextField>
          <View style={[AppStyle.rowFlex]}>
            <TouchableField onPress={() => onSelectSortType(SORT_TYPE.KEY)}>
              <TextField
                type="paragraph-1"
                style={sortType === SORT_TYPE.KEY ? styles.iconActive : {}}>
                <FontAwesome5Icon
                  name={desc ? 'arrow-up' : 'arrow-down'}
                  size={14}
                  style={sortType === SORT_TYPE.KEY && desc ? styles.iconActive : {}}
                />
                A
              </TextField>
            </TouchableField>
            <TextField style={AppStyle.padX5}>|</TextField>
            <TouchableField onPress={() => onSelectSortType(SORT_TYPE.AMOUNT)}>
              <TextField
                type="paragraph-1"
                style={sortType === SORT_TYPE.AMOUNT ? styles.iconActive : {}}>
                <FontAwesome5Icon
                  name={desc ? 'arrow-up' : 'arrow-down'}
                  size={14}
                  style={sortType === SORT_TYPE.AMOUNT && desc ? styles.iconActive : {}}
                />
                $
              </TextField>
            </TouchableField>
          </View>
        </View>
        <View style={[AppStyle.padX10, AppStyle.padTop10]}>
          {isFetchedGroupingAndItems ? (
            renderBreakdownItem()
          ) : (
            <View style={styles.containerLoaderBreakdown}>
              <ContentLoader name="expense_dashboard_breakdown" />
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const ListEmptyComponent = useMemo(
    () => (
      <NoDataAdded
        source={require('assets/images/expenseDashboard/wallet.png')}
        title={t(`${i18nScope}.noExpenseAddedTitle`)}
        description={t(`${i18nScope}.noExpenseAddedDescription`)}
        buttonText={t(`${i18nScope}.noExpenseAddedButtonText`)}
        onButtonPress={() => NavigationServiceLib.navigate(AppScreenID.AddExpense)}
      />
    ),
    [t],
  );
  const floatingActions = useMemo(() => getFloatingActions(styles), [styles]);

  return (
    <View style={styles.container}>
      <Header type="full" title={t(`${i18nScope}.title`)} />
      <FinancialList
        type={FINANCIAL_LIST_TYPE.EXPENSE}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        isEmptyData={isNoData}
      />
      {!isNoData && (
        <FloatingButtonActions
          actions={floatingActions}
          onPressItem={name => {
            const item = floatingActions.find(i => i.name === name);
            if (item && item.screenID) {
              NavigationServiceLib.navigate(item.screenID);
            }
          }}
        />
      )}
    </View>
  );
}

export default compose(withBackHandler, withDynamicModuleLoader(getModule()))(ExpenseDashboard);
