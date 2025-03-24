import CustomChart from 'components/basics/CustomChart';
import CustomTooltip from 'components/basics/CustomTooltip';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import Header from 'components/layouts/Header';
import { AppConfigs } from 'constant';
import { UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { useOnScreenRefresh, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { getMonthlyCheckUpData } from 'store/MonthlyCheckUp/action';
import getModule from 'store/MonthlyCheckUp/module';
import {
  selectCheckUpReportTableData,
  selectFetchedDataCheckUp,
  selectMonthlyProvisionSpent,
} from 'store/MonthlyCheckUp/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.provisionSpending';

function ProvisionSpendingScreen(props) {
  const { t } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { screenRefreshId } = useOnScreenRefresh();

  const scrollRef = useRef();
  const tooltipRef = useRef(null);
  const chartRef = useRef(null);

  const [refreshing, setRefreshing] = useState(false);
  const dispatchResolve = useDispatchResolve();
  const monthlyProvisionSpent = useSelector(selectMonthlyProvisionSpent);

  const tableData = useSelector(selectCheckUpReportTableData);

  const allLoaded = useSelector(selectFetchedDataCheckUp);

  const yearData = useMemo(() => {
    const _data = [];
    tableData.forEach((item, index) => {
      if (monthlyProvisionSpent[index]) {
        _data.push({
          value: item?.yearlyRemainingProvisioningTotal ?? 0,
          label: monthlyProvisionSpent[index]?.label,
        });
      }
    });
    return _data;
  }, [tableData, monthlyProvisionSpent]);

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
              title={t(`${i18nScope}.yearlyRemainingProvisions`)}
              content={
                <TextField>
                  <TextField type="heading-4" font="semi-bold">
                    {`${t(`${i18nScope}.monthlyProvisionSpent`)}\n`}
                  </TextField>
                  {`${t(`${i18nScope}.monthlyProvisionSpentContent`)}\n`}
                  <TextField type="heading-4" font="semi-bold">
                    {`\n${t(`${i18nScope}.yearlyRemainingProvisionsTotal`)}\n`}
                  </TextField>
                  {`${t(`${i18nScope}.yearlyRemainingProvisionsContent`)}`}
                  <TextField
                    style={styles.textWithLink}
                    onPress={() => {
                      UtilLib.openInAppBrowserLink(AppConfigs.trackingProvisionSpentLink);
                      if (tooltipRef.current) {
                        tooltipRef.current?.hide();
                      }
                      if (chartRef.current) {
                        chartRef.current?.clearTooltip();
                      }
                    }}
                    suppressHighlighting={true}>
                    {'here.'}
                  </TextField>
                </TextField>
              }
              tooltipRef={tooltipRef}
            />

            <CustomChart
              loading={!allLoaded}
              type="combine-chart"
              data={yearData}
              barData={monthlyProvisionSpent}
              color={styles.lineChart.color}
              activeColor={styles.activeBarChart.color}
              labelAccessor={item => item.label}
              valueAccessor={item => item.value}
              formatValue={value => UtilLib.formatCurrency(value)}
              contentInset={{
                top: 20,
                bottom: 20,
                left: 30,
                right: 30,
              }}
              disableBackgroundAreaChart
              xAxisHeight={40}
              height={350}
              ref={chartRef}
            />

            <View style={AppStyle.marginTop20}>
              <View style={[AppStyle.rowFlex, AppStyle.marginLeft50]}>
                <View
                  style={[
                    styles.barLegend,
                    {
                      backgroundColor: styles.activeBarChart.color,
                    },
                  ]}
                />
                <View style={[AppStyle.flex1]}>
                  <TextField type="captain">
                    {`${t(`${i18nScope}.monthlyProvisionSpent`)}`}
                  </TextField>
                </View>
              </View>
              <View style={[AppStyle.rowFlex, AppStyle.marginLeft50, AppStyle.marginTop15]}>
                <View
                  style={[
                    styles.lineLegend,
                    {
                      backgroundColor: styles.lineChart.color,
                    },
                  ]}
                />
                <View style={[AppStyle.flex1]}>
                  <TextField type="captain">{`${t(
                    `${i18nScope}.yearlyRemainingProvisionsTotal`,
                  )}`}</TextField>
                </View>
              </View>
            </View>
          </View>

          {/* <View style={[AppStyle.marginBottom20, styles.chartContainer, AppStyle.shadow]}>
            <ChartHeader
              title={t(`${i18nScope}.monthlyProvisionSpent`)}
              content={t(`${i18nScope}.monthlyProvisionSpentContent`)}
            />
            <CustomChart
              loading={!allLoaded}
              type="bar-chart"
              data={monthlyProvisionSpent}
              activeColor={styles.activeBarChart.color}
              color={styles.barChart.color}
              labelAccessor={item => item.label}
              valueAccessor={item => item.value}
              formatValue={value => UtilLib.formatCurrency(value)}
              barVersion={1}
              xAxisHeight={40}
              height={350}
            />
          </View> */}

          {/* <View style={[styles.chartContainer, AppStyle.shadow]}>
            <ChartHeader
              type="yearly"
              title={t(`${i18nScope}.yearlyRemainingProvisions`)}
              content={t(`${i18nScope}.yearlyRemainingProvisionsContent`)}
            />
            <CustomChart
              loading={!allLoaded}
              data={yearlyRemainingProvisions}
              color={styles.lineChart.color}
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
          </View> */}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const ChartHeader = ({ type = 'monthly', title = '', content = '', tooltipRef }) => {
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
          ref={tooltipRef}
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
          displayInsets={{ top: type === 'monthly' ? insets.top + 50 : 0 }}
        />
      </View>
    </View>
  );
};

export default compose(
  withDynamicModuleLoader(getModule()),
  withTranslation(),
  withBackHandler,
)(ProvisionSpendingScreen);
