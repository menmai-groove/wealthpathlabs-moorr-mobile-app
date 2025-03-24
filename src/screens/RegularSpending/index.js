import CustomChart from 'components/basics/CustomChart';
import CustomTooltip from 'components/basics/CustomTooltip';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import Header from 'components/layouts/Header';
import { UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { useOnScreenRefresh, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { getMonthlyCheckUpData } from 'store/MonthlyCheckUp/action';
import getModule from 'store/MonthlyCheckUp/module';
import { selectFetchedDataCheckUp, selectRegularReport } from 'store/MonthlyCheckUp/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.regularSpending';

function RegularSpendingScreen(props) {
  const { t } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { screenRefreshId } = useOnScreenRefresh();

  const scrollRef = useRef();
  const [refreshing, setRefreshing] = useState(false);
  const dispatchResolve = useDispatchResolve();
  const regularReport = useSelector(selectRegularReport);
  // console.log("regularReport---", JSON.stringify(regularReport, null, 2))
  // const regularReport = {
  //   accumulatedActualSurplus: [
  //     {
  //       label: 'Mar’09',
  //       value: 20,
  //     },
  //   ],
  //   rollingTargetedSurplus: [
  //     {
  //       // label: 'Mar’09',
  //       value: 50,
  //     },
  //   ],
  //   monthlyActualSurplus: [
  //     {
  //       label: 'Mar’09',
  //       value: 10,
  //     },
  //     {
  //       label: 'Apr’09',
  //       value: 60,
  //     },
  //   ],
  //   targetedMonthlySurplus: [
  //     {
  //       // label: 'Mar’09',
  //       value: 15,
  //     },
  //     {
  //       // label: 'Apr’09',
  //       value: 10,
  //     },
  //   ],
  //   accumulatedExcessSurplus: [
  //     {
  //       label: 'Mar’09',
  //       value: 25,
  //     },
  //     {
  //       label: 'Apr’09',
  //       value: -15,
  //     },
  //     {
  //       label: 'May’09',
  //       value: 0,
  //     },
  //   ],
  //   monthlyExcessSurplus: [
  //     {
  //       // label: 'Mar’09',
  //       value: 20,
  //     },
  //     {
  //       // label: 'Apr’09',
  //       value: -30,
  //     },
  //     {
  //       // label: 'May’09',
  //       value: 15,
  //     },
  //   ],
  //   savingsFlag: 10 ?? 499949445,
  //   spendingFlag: -10 ?? -499949445,
  //   primaryAccountBalance: [
  //     {
  //       label: 'Mar’09',
  //       value: 200000,
  //     },
  //   ],
  // };
  const allLoaded = useSelector(selectFetchedDataCheckUp);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchResolve(getMonthlyCheckUpData(true)).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);

  return (
    <View key={screenRefreshId} style={styles.container}>
      <Header type="full" title={t(`${i18nScope}.headerTitle`)} />
      <KeyboardAwareScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ref={scrollRef}
        style={AppStyle.flex1}
        contentContainerStyle={AppStyle.menuPaddingBottom}
        showsVerticalScrollIndicator={false}>
        <View style={[AppStyle.flex1, AppStyle.padX15, AppStyle.marginTop10]}>
          <View style={[AppStyle.marginBottom20, styles.chartContainer, AppStyle.shadow]}>
            <ChartHeader
              title={t(`${i18nScope}.accumulatedActualSurplus`)}
              content={t(`${i18nScope}.accumulatedActualSurplusContent`)}
            />
            <CustomChart
              loading={!allLoaded}
              type="combine-chart"
              data={regularReport.rollingTargetedSurplus}
              barData={regularReport.accumulatedActualSurplus}
              color={styles.blueLineChart.color}
              activeColor={styles.redBarChart.color}
              labelAccessor={item => item.label}
              valueAccessor={item => item.value}
              formatValue={value => UtilLib.formatCurrency(value)}
              contentInset={{
                top: 20,
                bottom: 20,
                left: 30,
                right: 30,
              }}
            />
          </View>

          <View style={[AppStyle.marginBottom20, styles.chartContainer, AppStyle.shadow]}>
            <ChartHeader
              title={t(`${i18nScope}.monthlyActualSurplus`)}
              content={t(`${i18nScope}.monthlyActualSurplusContent`)}
            />
            <CustomChart
              loading={!allLoaded}
              type="combine-chart"
              data={regularReport.targetedMonthlySurplus}
              barData={regularReport.monthlyActualSurplus}
              color={styles.blueLineChart.color}
              activeColor={styles.redBarChart.color}
              labelAccessor={item => item.label}
              valueAccessor={item => item.value}
              formatValue={value => UtilLib.formatCurrency(value)}
              xAxisHeight={40}
              height={350}
            />
          </View>

          <View style={[AppStyle.marginBottom20, styles.chartContainer, AppStyle.shadow]}>
            <ChartHeader
              title={t(`${i18nScope}.monthlyExcessSurplus/Deficit`)}
              content={t(`${i18nScope}.monthlyExcessSurplus/DeficitContent`)}
            />
            <CustomChart
              loading={!allLoaded}
              type="combine-chart"
              data={regularReport.accumulatedExcessSurplus}
              barData={regularReport.monthlyExcessSurplus}
              color={styles.greenLineChart.color}
              activeColor={styles.redBarChart.color}
              labelAccessor={item => item.label}
              valueAccessor={item => item.value}
              formatValue={value => UtilLib.formatCurrency(value)}
              high={regularReport.savingsFlag}
              low={regularReport.spendingFlag}
              xAxisHeight={40}
              height={350}
            />
          </View>

          <View style={[styles.chartContainer, AppStyle.shadow]}>
            <ChartHeader
              type="yearly"
              title={t(`${i18nScope}.primaryAccountRollingBalance`)}
              content={t(`${i18nScope}.primaryAccountRollingBalanceContent`)}
            />
            <CustomChart
              loading={!allLoaded}
              type="bar-chart"
              data={regularReport.primaryAccountBalance}
              activeColor={styles.blueBarChart.color}
              labelAccessor={item => item.label}
              valueAccessor={item => item.value}
              formatValue={value => UtilLib.formatCurrency(value)}
              barVersion={1}
              contentInset={{
                top: 20,
                bottom: 20,
                left: 30,
                right: 30,
              }}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const ChartHeader = ({ type = 'monthly', title = '', content = '' }) => {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const insets = useSafeAreaInsets();
  const [contentHeight, setContentHeight] = useState(0);

  return (
    <View style={[AppStyle.rowFlex, AppStyle.middleContent, styles.headerContainer]}>
      <View style={AppStyle.padX30}>
        <TextField type="heading-4" style={AppStyle.textCenter}>
          {title}
        </TextField>
      </View>
      <View style={styles.tooltipContainer}>
        <CustomTooltip
          hideArrow
          placement="left"
          content={
            <TextField
              style={styles.contentContainer}
              type="captain"
              onLayout={event => {
                if (contentHeight === 0) {
                  setContentHeight(event.nativeEvent.layout.height);
                }
              }}>
              {content}
            </TextField>
          }
          displayInsets={{ top: type === 'monthly' ? contentHeight / 2 : 0 }}
        />
      </View>
    </View>
  );
};

export default compose(
  withDynamicModuleLoader(getModule()),
  withTranslation(),
  withBackHandler,
)(RegularSpendingScreen);
