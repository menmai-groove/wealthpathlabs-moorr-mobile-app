import { useFocusEffect } from '@react-navigation/core';
import i18n from 'bootstrap/i18n';
import ButtonField from 'components/basics/ButtonField';
import Condition from 'components/basics/Condition';
import CustomCard from 'components/basics/CustomCard';
import ListWealthCard from 'components/basics/ListWealthCard';
import { PieChart } from 'components/basics/PieChart';
import Swiper from 'components/basics/Swiper';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import Header from 'components/layouts/Header';
import { AppConstants, AppScreenID } from 'constant';
import { AnalyticsLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import util from 'libs/util';
import { get, sumBy } from 'lodash';
import moment from 'moment';
import { useOnExitAppHandler, useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Image, RefreshControl, ScrollView, useWindowDimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import AppReview from 'screens/AppReview';
import FinancialChart from 'screens/Home/components/FinancialChart';
import NetMonthlyIncomeChart from 'screens/Home/components/NetMonthlyIncomeChart';
import UpcomingCard from 'screens/Home/components/UpcomingCard';
import { ModalCardItem } from 'screens/MoneySmartsDashboard/components/MoneySmartPopup';
import { selectFlags, selectTask, selectUser } from 'store/Auth/selector';
import { getFinancialSummary } from 'store/FinancialDashboard/action';
import getFinancialModule from 'store/FinancialDashboard/module';
import { selectFinancialSummaryGroupData } from 'store/FinancialDashboard/selector';
import { getHomeData, getShowOnLogin } from 'store/Home/action';
import getModule from 'store/Home/module';
import {
  selectAssetPosition,
  selectAssetPositionValue,
  selectCashPosition,
  selectCashPositionValue,
  selectDebtPosition,
  selectDebtPositionValue,
  selectHomeDashboard,
  selectNetWorth,
  selectNetWorthValue,
} from 'store/Home/selector';
import { getMoneySmarts } from 'store/MoneySmartsDashboard/action';
import getMoneySmartsDashboardModule from 'store/MoneySmartsDashboard/module';
import { selectMoneySmarts, selectProvisionsJar } from 'store/MoneySmartsDashboard/selector';
import { getMonthlyCheckUpData } from 'store/MonthlyCheckUp/action';
import getMonthlyCheckUpModule from 'store/MonthlyCheckUp/module';
import { selectNextCheckupDate } from 'store/MonthlyCheckUp/selector';
import { getNotifications } from 'store/Notification/action';
import getNotificationModule from 'store/Notification/module';
import { getUpcomingGoal } from 'store/PersonalGoals/action';
import getPersonalGoalsModule from 'store/PersonalGoals/module';
import { selectUpcomingGoal } from 'store/PersonalGoals/selector';
import { selectAppState } from 'store/Root/selector';
import { getWealthSpeedData } from 'store/Wealth/action';
import getWealthModule from 'store/Wealth/module';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.home';
const FREQUENCY = 'monthly';

const getMonthlyFinancialData = (data, type, dividedNumber = 1) => ({
  total: get(data, [type, 'total']) / dividedNumber,
  breakdown: get(data, [type, 'breakdown']).map(item => ({
    ...item,
    value: item.value / dividedNumber,
  })),
});

const MiniCard = ({ style, value = '', label = '' }) => {
  const styles = useThemedStyle(themedStyles, i18nScope);
  return (
    <View style={[styles.miniCardContainer, style]}>
      <View>
        <TextField style={AppStyle.textCenter} type="paragraph-1">
          {value}
        </TextField>
      </View>
      <View style={styles.labelContainer}>
        <TextField style={AppStyle.textCenter} type="captain">
          {label}
        </TextField>
      </View>
    </View>
  );
};

const SeeDetails = ({ onPress }) => {
  const styles = useThemedStyle(themedStyles, i18nScope);

  return (
    <View style={[AppStyle.marginTop5, AppStyle.flex1, AppStyle.rowFlex, AppStyle.alignEnd]}>
      <View style={[AppStyle.flex1, styles.width0]} />
      <View style={[AppStyle.flex1, AppStyle.marginLeft10, AppStyle.alignEnd, styles.width0]}>
        <TouchableField onPress={onPress}>
          <View style={[AppStyle.rowFlex, styles.seeDetailsContainer]}>
            <TextField type="captain" style={[styles.seeDetailsText]}>
              {i18n.t(`${i18nScope}.seeDetails`)}
            </TextField>
            <IonIcon
              style={AppStyle.marginLeft5}
              name="arrow-forward-circle"
              size={14}
              color={styles.seeDetailsIcon.color}
            />
          </View>
        </TouchableField>
      </View>
    </View>
  );
};

function HomeScreen(props) {
  useOnExitAppHandler();
  const { t } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { width: layoutWidth } = useWindowDimensions();
  // const { screenRefreshId } = useOnScreenRefresh();
  const appState = useSelector(selectAppState);
  const user = useSelector(selectUser);
  const flags = useSelector(selectFlags);
  const {
    totalTargetedSurplus,
    accumulatedActualSurplus,
    weekly7DayFloatAllocation,
    essentialAmount,
    discretionaryAmount,
    totalMoneyIn,
    totalMoneyOut,
    moneyInBreakdown,
    moneyOutBreakdown,
    allLoaded: moneySmartsAllLoaded,
  } = useSelector(selectMoneySmarts);
  const { expenses: homeExpenses } = useSelector(selectHomeDashboard);
  const summaryGroupData = useSelector(selectFinancialSummaryGroupData);
  const nextCheckUp = useSelector(selectNextCheckupDate);
  const upcomingGoalData = useSelector(selectUpcomingGoal);
  const { summary } = useSelector(selectProvisionsJar);
  const task = useSelector(selectTask);
  const [refreshing, setRefreshing] = useState(false);
  const pushNotificationFirstRef = useRef(true);
  const scrollViewRef = useRef(null);
  const dispatchResolve = useDispatchResolve();
  const getJarData = useCallback(
    key => {
      const { images } = require('assets/images/jarsDashboard');
      let icon = '';
      switch (key) {
        case AppConstants.listTypeByJars.Provision:
          icon = images.provision;
          break;
        case AppConstants.listTypeByJars.Living_LifeStyle:
          icon = images.living_life;
          break;
        case AppConstants.listTypeByJars.Credit:
          icon = images.credit_card;
          break;
        case AppConstants.listTypeByJars.Direct:
          icon = images.direct_payment;
          break;
        case AppConstants.listTypeByJars.Loans:
          icon = images.loans;
          break;
        default:
          icon = images.account_saving;
          break;
      }
      const monthlyJarBreakdown = get(moneyOutBreakdown, [FREQUENCY, 'groups']) || [];
      if (monthlyJarBreakdown.length && key === AppConstants.listTypeByJars.Primary_Saving) {
        return {
          type: AppConstants.listTypeByJars.Primary_Saving,
          label: t(`global.jars.${AppConstants.listTypeByJars.Primary_Saving}`),
          value: get(totalTargetedSurplus, [FREQUENCY]) ?? 0,
          icon,
        };
      }
      const matchedJar = monthlyJarBreakdown.find(item => item.key === key);
      return {
        type: key,
        label: t(`global.jars.${key}`, key),
        value: get(matchedJar, ['total']) ?? 0,
        icon,
      };
    },
    [moneyOutBreakdown, t, totalTargetedSurplus],
  );
  const cashPositionData = useSelector(selectCashPosition);
  const cashPositionValue = useSelector(selectCashPositionValue);
  const netWorthData = useSelector(selectNetWorth);
  const netWorthValue = useSelector(selectNetWorthValue);
  const assetPositionData = useSelector(selectAssetPosition);
  const assetPositionValue = useSelector(selectAssetPositionValue);
  const debtPositionData = useSelector(selectDebtPosition);
  const debtPositionValue = useSelector(selectDebtPositionValue);

  const moneySmartsData = useMemo(
    () => ({
      moneySmartsSurplus: [
        {
          label: t(`${i18nScope}.currentSurplus`),
          value: get(accumulatedActualSurplus, ['yearly']),
          color: ['#44E7B6', '#19D59B'],
        },
        {
          label: t(`${i18nScope}.outstandingSurplus`),
          value: get(totalTargetedSurplus, ['yearly']) - get(accumulatedActualSurplus, ['yearly']),
          color: ['#5EC9FD', '#40BFFD'],
        },
      ],
      weekly7DayFloatAllocation: get(weekly7DayFloatAllocation, ['weekly', 'total']),
      nextCheckUp: nextCheckUp,
      spendProvision: get(summary, ['totalAmount']),
      monthlyIncome: totalMoneyIn?.monthly || 0,
      monthlyExpenditure: totalMoneyOut?.monthly || 0,
      monthlySurplus: totalTargetedSurplus?.monthly || 0,
      moneyInBreakdown: moneyInBreakdown,
      moneyOutBreakdown: moneyOutBreakdown,
    }),
    [
      nextCheckUp,
      accumulatedActualSurplus,
      summary,
      t,
      totalTargetedSurplus,
      weekly7DayFloatAllocation,
      totalMoneyIn,
      totalMoneyOut,
      moneyInBreakdown,
      moneyOutBreakdown,
    ],
  );

  const moneySmartsJarData = useMemo(
    () => ({
      jarSummary: [
        {
          label: t(`${i18nScope}.essentialExpense`),
          value: get(essentialAmount, [FREQUENCY]),
          color: ['#FD8F65', '#FD8152'],
        },
        {
          label: t(`${i18nScope}.discretionaryExpense`),
          value: get(discretionaryAmount, [FREQUENCY]),
          color: ['#FD5170', '#FD4B6B'],
        },
        {
          label: t(`${i18nScope}.targetedSurplus`),
          value: get(totalTargetedSurplus, [FREQUENCY]),
          color: ['#5EC9FD', '#40BFFD'],
        },
      ],
      totalMoneyIn: get(totalMoneyIn, [FREQUENCY]),
      totalMoneyOut: get(totalMoneyOut, [FREQUENCY]),
      dataListJars: [
        {
          ...getJarData(AppConstants.listTypeByJars.Provision),
        },
        {
          ...getJarData(AppConstants.listTypeByJars.Living_LifeStyle),
        },
        {
          ...getJarData(AppConstants.listTypeByJars.Primary_Saving),
        },
        {
          ...getJarData(AppConstants.listTypeByJars.Credit),
        },
        {
          ...getJarData(AppConstants.listTypeByJars.Direct),
        },
        {
          ...getJarData(AppConstants.listTypeByJars.Loans),
        },
      ],
    }),
    [
      discretionaryAmount,
      essentialAmount,
      getJarData,
      t,
      totalMoneyIn,
      totalMoneyOut,
      totalTargetedSurplus,
    ],
  );

  const financialData = useMemo(() => {
    const income = getMonthlyFinancialData(summaryGroupData, 'income', 12);
    const expense = get(homeExpenses, [FREQUENCY]);
    const data = {
      cashflow: {
        income: income.total,
        expense: expense.total,
      },
      expenses: expense,
      income: income,
      assets: getMonthlyFinancialData(summaryGroupData, 'assets'),
      borrowings: getMonthlyFinancialData(summaryGroupData, 'borrowings'),
      propertyPortfolio: getMonthlyFinancialData(summaryGroupData, 'propertyPortfolio'),
    };
    data.netWorths = {
      total: data.assets.total - data.borrowings.total,
      breakdown: [
        {
          label: t(`${i18nScope}.totalAssets`),
          value: data.assets.total,
          color: UtilLib.getColorByIndex(0),
        },
        {
          label: t(`${i18nScope}.totalLiabilities`),
          value: data.borrowings.total,
          color: UtilLib.getColorByIndex(1),
        },
      ],
    };
    return data;
  }, [summaryGroupData, homeExpenses, t]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      dispatchResolve(getHomeData(true)),
      dispatchResolve(getMoneySmarts(true)),
      dispatchResolve(getUpcomingGoal(true)),
      dispatchResolve(getMonthlyCheckUpData(true)),
      dispatchResolve(getFinancialSummary(true)),
      dispatchResolve(getNotifications({ page: 1 })),
      dispatchResolve(getWealthSpeedData({ generate: false })),
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);

  const navigateProvisionJars = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.ProvisionJarsScreen);
  }, []);

  const navigateCheckUp = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.MonthlyCheckUp);
  }, []);

  const navigateMoneySmartsJars = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.JarsDashboard);
  }, []);

  const navigateVerticalTimeline = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.VerticalTimeline);
  }, []);

  const navigateFinancialDashboard = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.FinancialDashboard);
  }, []);

  const navigateExpenseDashboard = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.FinancialDashboard, {
      expandIndex: 1,
    });
  }, []);

  const navigateIncomeDashboard = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.FinancialDashboard, {
      expandIndex: 0,
    });
  }, []);

  const navigateWealthDashboard = useCallback((data, index) => {
    const gaugeKey = data?.info?.key;
    if (gaugeKey) {
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.wealthDashboardLoad, {
        gauge: gaugeKey,
        source: 'home_dashboard',
      });
    }

    NavigationServiceLib.navigate(AppScreenID.WealthDashboard, { index: index || 0 });
  }, []);

  const navigateAssetsDashboard = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.FinancialDashboard, {
      expandIndex: 2,
    });
  }, []);

  const navigateBorrowingsDashboard = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.FinancialDashboard, {
      expandIndex: 3,
    });
  }, []);
  const navigateMoneySmartsDashboard = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.MoneySmartsDashboard);
  }, []);

  const navigateCashPosition = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.CashPosition);
  }, []);
  const navigateNetWorth = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.NetWorth);
  }, []);
  const navigateAssetPosition = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.AssetPosition);
  }, []);
  const navigateDebtPosition = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.DebtPosition);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (appState === 'active') {
        if (pushNotificationFirstRef.current && task === null) {
          dispatchResolve(getShowOnLogin());
        }
        pushNotificationFirstRef.current = false;
      }
    }, [task, dispatchResolve, appState]),
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        pushNotificationFirstRef.current = true;
      };
    }, []),
  );

  const renderGreetings = useCallback(
    data => (
      <TouchableField
        style={AppStyle.rowFlex}
        onPress={() => NavigationServiceLib.navigate(AppScreenID.ProfileSetting)}>
        <Image source={require('assets/images/home/opti.png')} />
        <View style={[AppStyle.marginX10, AppStyle.flex1]}>
          <TextField type="heading-1">
            {t(`${i18nScope}.hello`)} {data?.fullName}
          </TextField>
          <TextField type="paragraph-2">{t(`${i18nScope}.welcomeBack`)}</TextField>
        </View>
      </TouchableField>
    ),
    [t],
  );

  const Title = useCallback(
    ({ children }) => (
      <TextField style={AppStyle.textCenter} type="heading-4">
        {children}
      </TextField>
    ),
    [],
  );

  const _padX = 50;
  const _pieChartWidth = layoutWidth - _padX;

  const renderMoneySmart = useCallback(
    (data, chartWidth) => (
      <View style={[AppStyle.flex1]}>
        <Title>{t(`${i18nScope}.moneySmartsSurplus`)}</Title>
        <PieChart
          // key={screenRefreshId}
          loading={!moneySmartsAllLoaded}
          style={styles.pieSVG}
          width={util.safePositiveValue(chartWidth)}
          data={data.moneySmartsSurplus}
          labelAccessor={item => item.label}
          valueAccessor={item => item.value}
          formatValue={value => UtilLib.formatCurrency(value)}
          centeredText={() => {
            return (
              <View style={AppStyle.flex1}>
                <View>
                  <TextField type="captain" style={styles.pieCenterTitleText} numberOfLines={3}>
                    {t(`${i18nScope}.targetedAnnualSurplus`)}
                  </TextField>
                </View>
                <View style={AppStyle.padTop5}>
                  <TextField
                    type="heading-2"
                    style={styles.pieCenterDescriptionText}
                    numberOfLines={2}>
                    {UtilLib.formatCurrency(sumBy(data.moneySmartsSurplus, 'value'), '$')}
                  </TextField>
                </View>
              </View>
            );
          }}
        />

        <View style={AppStyle.rowFlex}>
          <MiniCard
            value={UtilLib.formatCurrency(data.weekly7DayFloatAllocation, '$')}
            label={t(`${i18nScope}.weekly7DayFloat`)}
          />
          <Condition display={data.nextCheckUp}>
            <MiniCard
              style={AppStyle.marginLeft10}
              value={moment(data.nextCheckUp).format('DD MMM YYYY')}
              label={t(`${i18nScope}.nextCheckUp`)}
            />
          </Condition>
        </View>

        <View
          style={[AppStyle.marginTop20, AppStyle.flex1, AppStyle.rowFlex, AppStyle.justifyContent]}>
          {data.spendProvision > 0 && (
            <View style={[styles.flex05, styles.width0]}>
              <ButtonField
                style={AppStyle.padX15}
                type="medium-secondary"
                text={t(`${i18nScope}.spendProvision`)}
                onPress={navigateProvisionJars}
              />
            </View>
          )}
          <View style={[AppStyle.marginLeft10, styles.flex05, styles.width0]}>
            <ButtonField
              type="medium-primary"
              style={AppStyle.padX15}
              text={t(`${i18nScope}.checkUp`)}
              onPress={navigateCheckUp}
            />
          </View>
        </View>
        <View style={[AppStyle.marginTop5, AppStyle.flex1, AppStyle.rowFlex, AppStyle.alignEnd]}>
          <View style={[AppStyle.flex1, styles.width0]} />
          <View style={[AppStyle.flex1, AppStyle.marginLeft10, AppStyle.alignEnd, styles.width0]}>
            <TouchableField onPress={navigateMoneySmartsDashboard}>
              <View style={[AppStyle.rowFlex, styles.seeDetailsContainer]}>
                <TextField type="captain" style={[styles.seeDetailsText]}>
                  {t(`${i18nScope}.seeDetails`)}
                </TextField>
                <IonIcon
                  style={AppStyle.marginLeft5}
                  name="arrow-forward-circle"
                  size={14}
                  color={styles.seeDetailsIcon.color}
                />
              </View>
            </TouchableField>
          </View>
        </View>
      </View>
    ),
    [
      moneySmartsAllLoaded,
      navigateCheckUp,
      navigateProvisionJars,
      styles,
      t,
      navigateMoneySmartsDashboard,
    ],
  );

  const renderJarSummary = useCallback(
    (data, chartWidth) => (
      <View style={[AppStyle.flex1]}>
        <Title>{t(`${i18nScope}.jarSummary`)}</Title>
        <PieChart
          // key={screenRefreshId}
          loading={!moneySmartsAllLoaded}
          style={styles.pieSVG}
          width={util.safePositiveValue(chartWidth)}
          data={data.jarSummary}
          labelAccessor={item => item.label}
          valueAccessor={item => item.value}
          formatValue={value => UtilLib.formatCurrency(value)}
          centeredText={() => {
            return (
              <View style={AppStyle.flex1}>
                <View>
                  <TextField type="captain" style={styles.pieCenterTitleText} numberOfLines={3}>
                    {t(`${i18nScope}.moneyIn`)}
                  </TextField>
                </View>
                <View style={AppStyle.padTop5}>
                  <TextField
                    type="heading-2"
                    style={styles.pieCenterDescriptionText}
                    numberOfLines={2}>
                    {UtilLib.formatCurrency(data.totalMoneyIn, '$')}
                  </TextField>
                </View>
              </View>
            );
          }}
        />

        <View style={[AppStyle.rowFlex, AppStyle.flexWrap]}>
          {data.dataListJars.length > 0 &&
            data.dataListJars.map((item, ii) => {
              const marginLeft = ii % 2 !== 0 ? '2%' : 0;
              const width = '49%';
              return (
                <View
                  key={`jar-${ii}`}
                  style={[
                    AppStyle.rowFlex,
                    AppStyle.spaceBetweenContent,
                    styles.jarCard,
                    {
                      width,
                      marginLeft,
                    },
                  ]}>
                  <View style={AppStyle.flex1}>
                    <TextField type="paragraph-1">
                      {UtilLib.formatCurrency(item?.value, '$')}
                    </TextField>
                    <TextField type="captain">{item?.label}</TextField>
                  </View>
                  <Image source={item?.icon} style={styles.icon} resizeMode="contain" />
                </View>
              );
            })}
        </View>

        <View style={[AppStyle.marginTop5, AppStyle.flex1, AppStyle.rowFlex]}>
          <View style={[AppStyle.flex1, styles.width0]} />
          <View style={[AppStyle.flex1, AppStyle.marginLeft10, styles.width0]}>
            <ButtonField
              style={AppStyle.padX15}
              type="medium-primary"
              text={t(`${i18nScope}.viewJars`)}
              onPress={navigateMoneySmartsJars}
            />
          </View>
        </View>
      </View>
    ),
    [moneySmartsAllLoaded, navigateMoneySmartsJars, styles, t],
  );

  const renderUpcomingGoal = useCallback(
    data => {
      if (data == null) {
        return (
          <CustomCard
            id="upcomingGoals"
            containerStyle={[AppStyle.flex1]}
            title={() => (
              <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                <TextField type="heading-3" numberOfLines={1}>
                  {t(`${i18nScope}.upcomingGoals`)}
                </TextField>
                <FastImage
                  style={[AppStyle.marginLeft5, styles.image]}
                  source={require('assets/images/moneySmartsDashboard/arrow-up.png')}
                />
                <FastImage
                  style={[AppStyle.marginLeft5, styles.image2]}
                  source={require('assets/images/moneySmartsDashboard/inc.png')}
                />
              </View>
            )}
            description={() => (
              <View style={[AppStyle.marginTop10, AppStyle.rowFlex]}>
                <ButtonField
                  type="medium-primary"
                  text={t(`${i18nScope}.addANewGoal`)}
                  onPress={navigateVerticalTimeline}
                />
              </View>
            )}
            contentStyle={AppStyle.alignContent}
            imageStyle={styles.image3}
            source={require('assets/images/home/aim.png')}
            onPress={navigateVerticalTimeline}
          />
        );
      }
      return <UpcomingCard data={data} onPress={navigateVerticalTimeline} />;
    },
    [navigateVerticalTimeline, styles, t],
  );

  const renderCashflow = useCallback(
    data => (
      <View style={[AppStyle.flex1]}>
        <Title>{t(`${i18nScope}.cashflow`)}</Title>
        <View style={[AppStyle.marginY20, AppStyle.flex1]}>
          <View style={[AppStyle.flex0]}>
            <ModalCardItem
              title={t(`${i18nScope}.moneyIN`)}
              backgroundColor={styles.moneyInContainer.backgroundColor}
              imageSources={[
                require('assets/images/moneySmartsDashboard/white-arrow-up.png'),
                require('assets/images/moneySmartsDashboard/white-inc.png'),
              ]}
              value={data.monthlyIncome}
            />
          </View>
          <View style={[AppStyle.marginTop10, AppStyle.flex0]}>
            <ModalCardItem
              title={t(`${i18nScope}.moneyOUT`)}
              backgroundColor={styles.moneyOutContainer.backgroundColor}
              imageSources={[
                require('assets/images/moneySmartsDashboard/white-arrow-down.png'),
                require('assets/images/moneySmartsDashboard/white-dec.png'),
              ]}
              value={data.monthlyExpenditure}
            />
          </View>
          <View style={[AppStyle.rowFlex, AppStyle.marginTop10, AppStyle.justifyContent]}>
            <CustomCard
              containerStyle={[
                data.monthlySurplus >= 0 ? styles.monthlySurplusBg : styles.monthlyDeficitBg,
              ]}
              contentStyle={[AppStyle.columnFlex, AppStyle.padX20]}
              title={() => (
                <View style={[AppStyle.alignContent]}>
                  <TextField style={styles.whiteColor}>
                    {data.monthlySurplus >= 0
                      ? t(`${i18nScope}.moneyMonthlySurplus`)
                      : t(`${i18nScope}.moneyMonthlyDeficit`)}
                  </TextField>
                </View>
              )}
              description={() => (
                <View style={[AppStyle.alignContent]}>
                  <TextField style={[AppStyle.marginTop5, styles.whiteColor]} type="heading-2">
                    {UtilLib.formatCurrency(data.monthlySurplus || 0, '$')}
                  </TextField>
                </View>
              )}
            />
          </View>
        </View>
      </View>
    ),
    [styles, t],
  );

  const renderChartWithSeeDetails = useCallback(
    (chartWidth, label = '', data = [], total = 0, onPress) => (
      <View style={[AppStyle.flex1, AppStyle.flexEndContent]}>
        <Title>{label}</Title>
        <View style={[AppStyle.flex1, AppStyle.justifyContent]}>
          <PieChart
            // key={screenRefreshId}
            loading={!moneySmartsAllLoaded}
            style={styles.pieSVG}
            width={util.safePositiveValue(chartWidth)}
            data={data}
            labelAccessor={item => item.label}
            valueAccessor={item => item.value}
            formatValue={value => UtilLib.formatCurrency(value)}
            centeredText={() => {
              return (
                <View style={AppStyle.flex1}>
                  <TextField
                    type="heading-2"
                    style={styles.pieCenterDescriptionText}
                    numberOfLines={2}>
                    {UtilLib.formatCurrency(total, '$')}
                  </TextField>
                </View>
              );
            }}
          />
        </View>
        <View style={[AppStyle.marginTop5, AppStyle.flex1, AppStyle.rowFlex, AppStyle.alignEnd]}>
          <View style={[AppStyle.flex1, styles.width0]} />
          {typeof onPress === 'function' && (
            <View style={[AppStyle.flex1, AppStyle.marginLeft10, AppStyle.alignEnd, styles.width0]}>
              <TouchableField onPress={onPress}>
                <View style={[AppStyle.rowFlex, styles.seeDetailsContainer]}>
                  <TextField type="captain" style={[styles.seeDetailsText]}>
                    {t(`${i18nScope}.seeDetails`)}
                  </TextField>
                  <IonIcon
                    style={AppStyle.marginLeft5}
                    name="arrow-forward-circle"
                    size={14}
                    color={styles.seeDetailsIcon.color}
                  />
                </View>
              </TouchableField>
            </View>
          )}
        </View>
      </View>
    ),
    [moneySmartsAllLoaded, styles, t],
  );

  const renderExpenseChart = useCallback(
    (data, chartWidth, onNavigate) => {
      return renderChartWithSeeDetails(
        chartWidth,
        t(`${i18nScope}.totalExpenses`),
        data.breakdown,
        data.total,
        onNavigate,
      );
    },
    [t, renderChartWithSeeDetails],
  );

  const renderIncomeChart = useCallback(
    (chartWidth, onNavigate) => {
      return (
        <NetMonthlyIncomeChart
          chartWidth={util.safePositiveValue(chartWidth)}
          moneyInBreakdown={moneySmartsData.moneyInBreakdown}
          onPress={onNavigate}
          moneySmartsAllLoaded={moneySmartsAllLoaded}
        />
      );
    },
    [moneySmartsAllLoaded, moneySmartsData],
  );

  const renderNetWorth = useCallback(
    (data, chartWidth, onNavigate) => {
      return renderChartWithSeeDetails(
        chartWidth,
        t(`${i18nScope}.netWORTH`),
        data.breakdown,
        data.total,
        onNavigate,
      );
    },
    [t, renderChartWithSeeDetails],
  );

  const renderTotalAsset = useCallback(
    (data, chartWidth, onNavigate) => {
      return renderChartWithSeeDetails(
        chartWidth,
        t(`${i18nScope}.totalAssets`),
        data.breakdown,
        data.total,
        onNavigate,
      );
    },
    [t, renderChartWithSeeDetails],
  );

  const renderTotalBorrowing = useCallback(
    (data, chartWidth, onNavigate) => {
      return renderChartWithSeeDetails(
        chartWidth,
        t(`${i18nScope}.totalLiabilities`),
        data.breakdown,
        data.total,
        onNavigate,
      );
    },
    [t, renderChartWithSeeDetails],
  );

  const renderPortfolio = useCallback(
    (data, chartWidth, onNavigate) => {
      return renderChartWithSeeDetails(
        chartWidth,
        t(`${i18nScope}.propertyPortfolio`),
        data.breakdown,
        data.total,
        onNavigate,
      );
    },
    [t, renderChartWithSeeDetails],
  );

  const renderCashflow2 = useMemo(() => {
    if (!flags.cashPosition) {
      return null;
    }

    return (
      <View style={[styles.chartContainer]}>
        <FinancialChart
          graphTitle={t('screens.cashPosition.headerTitle')}
          color={styles.cashPosition.color}
          data={{ originalData: cashPositionData }}
          totalValue={cashPositionValue}
          onPress={navigateCashPosition}
          loadingDuration={1200}
        />
        <SeeDetails onPress={navigateCashPosition} />
      </View>
    );
  }, [flags, styles, t, cashPositionData, cashPositionValue, navigateCashPosition]);

  const renderNetWorth2 = useMemo(() => {
    return (
      <View style={[AppStyle.flex1]}>
        <FinancialChart
          graphTitle={t('screens.netWorth.headerTitle')}
          color={styles.netWorth.color}
          data={{ originalData: netWorthData }}
          totalValue={netWorthValue}
          onPress={navigateNetWorth}
          loadingDuration={1600}
        />
        <SeeDetails onPress={navigateNetWorth} />
      </View>
    );
  }, [netWorthValue, styles, t, netWorthData, navigateNetWorth]);

  const renderAssetPosition = useMemo(() => {
    return (
      <View style={[AppStyle.flex1]}>
        <FinancialChart
          graphTitle={t('screens.assetPosition.headerTitle')}
          color={styles.assetPosition.color}
          data={{ originalData: assetPositionData }}
          totalValue={assetPositionValue}
          onPress={navigateAssetPosition}
          loadingDuration={2000}
        />
        <SeeDetails onPress={navigateAssetPosition} />
      </View>
    );
  }, [assetPositionValue, styles, t, assetPositionData, navigateAssetPosition]);

  const renderDebtPosition = useMemo(() => {
    return (
      <View style={[AppStyle.flex1]}>
        <FinancialChart
          graphTitle={t('screens.debtPosition.headerTitle')}
          color={styles.debtPosition.color}
          data={{ originalData: debtPositionData }}
          totalValue={debtPositionValue}
          onPress={navigateDebtPosition}
          loadingDuration={2400}
        />
        <SeeDetails onPress={navigateDebtPosition} />
      </View>
    );
  }, [debtPositionValue, styles, t, navigateDebtPosition, debtPositionData]);

  return (
    <View style={styles.container}>
      <Header type="notification" title={t(`${i18nScope}.headerTitle`)} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={AppStyle.flex1}
        contentContainerStyle={AppStyle.menuPaddingBottom}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}>
        <View style={[AppStyle.flex1]}>
          <View style={[AppStyle.marginTop10, AppStyle.padX15]}>{renderGreetings(user)}</View>

          <View style={[AppStyle.marginTop10]}>
            <Swiper
              key={'moneySmartsSurplus'}
              views={[
                {
                  view: (
                    <View style={[styles.chartContainer]}>
                      {renderMoneySmart(moneySmartsData, _pieChartWidth)}
                    </View>
                  ),
                },
                {
                  view: (
                    <View style={[styles.chartContainer]}>
                      {renderJarSummary(moneySmartsJarData, _pieChartWidth)}
                    </View>
                  ),
                },
              ]}
            />
          </View>

          <View style={[AppStyle.padX15, AppStyle.marginY10]}>
            {renderUpcomingGoal(upcomingGoalData)}
          </View>

          {flags.wealthSpeedHomeDashboardVisible ? (
            <View>
              <ListWealthCard showTextSeeDetails onPressDetail={navigateWealthDashboard} />
            </View>
          ) : null}

          <View>
            <Swiper
              key={'cashflow'}
              views={[
                {
                  view: (
                    <View style={[styles.chartContainer]}>{renderCashflow(moneySmartsData)}</View>
                  ),
                },
                {
                  view: (
                    <View style={[styles.chartContainer]}>
                      {renderIncomeChart(_pieChartWidth, navigateIncomeDashboard)}
                    </View>
                  ),
                },
                {
                  view: (
                    <View style={[styles.chartContainer]}>
                      {renderExpenseChart(
                        financialData.expenses,
                        _pieChartWidth,
                        navigateExpenseDashboard,
                      )}
                    </View>
                  ),
                },
              ]}
            />
          </View>

          {renderCashflow2}
          <View style={[styles.chartContainer]}>
            {flags.netWorth
              ? renderNetWorth2
              : renderNetWorth(
                  financialData.netWorths,
                  _pieChartWidth,
                  flags?.wealthSpeedHomeDashboardVisible ? navigateWealthDashboard : null,
                )}
          </View>
          <View style={[styles.chartContainer]}>
            {flags.assetPosition
              ? renderAssetPosition
              : renderTotalAsset(financialData.assets, _pieChartWidth, navigateAssetsDashboard)}
          </View>
          <View style={[styles.chartContainer]}>
            {flags.debtPosition
              ? renderDebtPosition
              : renderTotalBorrowing(
                  financialData.borrowings,
                  _pieChartWidth,
                  navigateBorrowingsDashboard,
                )}
          </View>

          <View style={[styles.chartContainer]}>
            {renderPortfolio(
              financialData.propertyPortfolio,
              _pieChartWidth,
              navigateFinancialDashboard,
            )}
          </View>
        </View>
      </ScrollView>

      <AppReview />
    </View>
  );
}

export default compose(
  withDynamicModuleLoader([
    getModule(),
    getMoneySmartsDashboardModule(),
    getMonthlyCheckUpModule(),
    getPersonalGoalsModule(),
    getFinancialModule(),
    getNotificationModule(),
    getWealthModule(),
  ]),
  withTranslation(),
)(HomeScreen);
