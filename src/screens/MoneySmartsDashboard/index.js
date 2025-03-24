import CustomCard from 'components/basics/CustomCard';
import CustomTab from 'components/basics/CustomTab';
import CustomTooltip from 'components/basics/CustomTooltip';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import NavigationItem from 'components/basics/NavigationItem';
import { PieChart } from 'components/basics/PieChart';
import ProgressBar from 'components/basics/ProgressBar';
import Swiper from 'components/basics/Swiper';
import TextField from 'components/basics/TextField';
import Header from 'components/layouts/Header';
import { AppScreenID } from 'constant';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import util, { formatDateTime } from 'libs/util';
import { get, isEmpty, last } from 'lodash';
import moment from 'moment';
import { useOnScreenRefresh, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, RefreshControl, ScrollView, useWindowDimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { selectFlags, selectUser } from 'store/Auth/selector';
import { getMoneySmarts } from 'store/MoneySmartsDashboard/action';
import getModule from 'store/MoneySmartsDashboard/module';
import {
  selectMoneySmartMoneyOutBreakdown,
  selectMoneySmarts,
} from 'store/MoneySmartsDashboard/selector';
import { selectOpenedCheckup } from 'store/MonthlyCheckUp/selector';
import { AppStyle } from 'theme';

import MoneySmartPopup from './components/MoneySmartPopup';
import themedStyles from './styles';

const i18nScope = 'screens.moneySmartsDashboard';

const FrequencyEnums = {
  0: 'monthly',
  1: 'yearly',
};

const MoneySMARTS_UI_VERSION = 2;

function MoneySmartsDashboardScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { screenRefreshId } = useOnScreenRefresh();

  const scrollRef = useRef();
  const {
    moneyInBreakdown,
    essentialAmount,
    discretionaryAmount,
    moneyOutBorrowingsMonthlyBreakdown,
    totalMoneyIn,
    totalMoneyOut,
    accumulatedActualSurplus,
    totalTargetedSurplus,
    allLoaded,
  } = useSelector(selectMoneySmarts);
  const moneySmartMoneyOutBreakdown = useSelector(selectMoneySmartMoneyOutBreakdown);
  const user = useSelector(selectUser);
  const { checkUpFlow } = useSelector(selectFlags);
  const currentCheckup = useSelector(selectOpenedCheckup);
  const currentCheckUpEndDate =
    currentCheckup && checkUpFlow
      ? moment(last(get(currentCheckup, ['balancesAsAt', 'checkupDates']))).subtract(1, 'day')
      : null;
  const isAsAtCurrentDate = get(currentCheckup, 'isAsAtCurrentDate');
  const currentCheckUpEndDateFormat = formatDateTime(currentCheckUpEndDate, 'DD MMM YYYY');
  const tooltipRef = useRef(null);
  const chartMonthlyRef = useRef(null);
  const chartYearlyRef = useRef(null);

  const [tabIndex, setTabIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const dispatchResolve = useDispatchResolve();
  const { width: layoutWidth } = useWindowDimensions();

  const frequency = useMemo(() => FrequencyEnums[tabIndex], [tabIndex]);

  useEffect(() => {
    setTabIndex(0);
  }, [screenRefreshId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchResolve(getMoneySmarts(true)).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);

  const frequencyFilters = useMemo(
    () => [
      {
        label: t(`${i18nScope}.monthly`),
      },
      {
        label: t(`${i18nScope}.yearly`),
      },
    ],
    [t],
  );

  const ownershipFilters = useMemo(() => {
    let primaryName = [user?.client1?.fName, user?.client1?.lName].join(' ');
    if (isEmpty(primaryName.trim())) {
      primaryName = t('global.primaryUser');
    }

    let partnerName = [user?.client2?.fName, user?.client2?.lName].join(' ');
    if (isEmpty(partnerName.trim())) {
      partnerName = t('global.partner');
    }

    return [
      {
        label: primaryName,
      },
      {
        label: user?.client2 === null ? null : partnerName,
      },
    ];
  }, [user, t]);

  const closeModal = useCallback(() => {
    GlobalLib.CustomModal.get().hide();
  }, []);

  const openModal = useCallback(
    (id, frequencyInput) => {
      const isMoneyIn = id === 'moneyIn';
      GlobalLib.CustomModal.get().show({
        body: (
          <MoneySmartPopup
            isMoneyIn={isMoneyIn}
            frequency={frequencyInput}
            ownershipOptions={ownershipFilters}
            moneyInBreakdown={moneyInBreakdown}
            moneyOutBreakdown={moneySmartMoneyOutBreakdown}
            closeModal={closeModal}
          />
        ),
      });
    },
    [ownershipFilters, moneyInBreakdown, moneySmartMoneyOutBreakdown, closeModal],
  );

  const handleOnPress = useCallback(id => openModal(id, frequency), [openModal, frequency]);

  const MoneySmartsDashboardV1 = useCallback(() => {
    const data = [
      {
        label: t(`${i18nScope}.essentialExpense`),
        value: get(essentialAmount, [frequency]) ?? 0,
        color: ['#FD8F65', '#FD8152'],
      },
      {
        label: t(`${i18nScope}.discretionaryExpense`),
        value: get(discretionaryAmount, [frequency]) ?? 0,
        color: ['#FD5170', '#FD4B6B'],
      },
      {
        label: t(`${i18nScope}.targetedSurplus`),
        value: get(totalTargetedSurplus, [frequency]) ?? 0,
        color: ['#5EC9FD', '#40BFFD'],
      },
    ];

    return (
      <View key={screenRefreshId} style={styles.container}>
        <Header type="auth" title={t(`${i18nScope}.title`)} titleBackground={false} />
        {/* <Header
        type="full"
        title={t(`${i18nScope}.title`)}
        titleBackground={false}
        backIconColor={styles.backIcon.color}
      /> */}
        <View style={styles.tabContainer}>
          <CustomTab
            data={frequencyFilters}
            value={tabIndex}
            onSelect={index => {
              setTabIndex(index);
            }}
          />
        </View>
        <View style={[AppStyle.flex1, styles.body, AppStyle.padX15, styles.content]}>
          <KeyboardAwareScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ref={scrollRef}
            style={AppStyle.flex1}
            contentContainerStyle={AppStyle.menuPaddingBottom}
            showsVerticalScrollIndicator={false}>
            <View style={[AppStyle.flex1, AppStyle.padTop20]}>
              <View>
                <TextField type="heading-3">
                  {tabIndex === 0
                    ? t(`${i18nScope}.monthlySnapshot`)
                    : t(`${i18nScope}.yearlySnapshot`)}
                </TextField>
              </View>

              <PieChart
                loading={!allLoaded}
                style={styles.pieSVG}
                height={250}
                data={data}
                labelAccessor={item => item.label}
                valueAccessor={item => item.value}
                formatValue={value => UtilLib.formatCurrency(value)}
                centeredText={() => {
                  return (
                    <View style={AppStyle.flex1}>
                      <View>
                        <TextField
                          type="captain"
                          style={styles.pieCenterTitleText}
                          numberOfLines={3}>
                          {t(`${i18nScope}.totalIncome`)}
                        </TextField>
                      </View>
                      <View style={AppStyle.padTop5}>
                        <TextField
                          type="heading-2"
                          style={styles.pieCenterDescriptionText}
                          numberOfLines={2}>
                          {UtilLib.formatCurrency(get(totalMoneyIn, [frequency]), '$')}
                        </TextField>
                      </View>
                    </View>
                  );
                }}
              />

              <View style={AppStyle.rowFlex}>
                <CustomCard
                  id="moneyIn"
                  containerStyle={AppStyle.flex1}
                  title={() => (
                    <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                      <TextField numberOfLines={1}>{t(`${i18nScope}.moneyIn`)}</TextField>
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
                      <TextField type="heading-2" numberOfLines={2}>
                        {UtilLib.formatCurrency(get(totalMoneyIn, [frequency]), '$')}
                      </TextField>
                      <FontAwesome5Icon
                        style={[AppStyle.marginLeft5, AppStyle.marginTop8]}
                        name="play"
                        size={8}
                        color={styles.descriptionIcon.color}
                      />
                    </View>
                  )}
                  onPress={() => handleOnPress('moneyIn')}
                />
                <CustomCard
                  id="moneyOut"
                  containerStyle={[AppStyle.flex1, AppStyle.marginLeft15]}
                  title={() => (
                    <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                      <TextField numberOfLines={1}>{t(`${i18nScope}.moneyOut`)}</TextField>
                      <FastImage
                        style={[AppStyle.marginLeft5, styles.image]}
                        source={require('assets/images/moneySmartsDashboard/arrow-down.png')}
                      />
                      <FastImage
                        style={[AppStyle.marginLeft5, styles.image2]}
                        source={require('assets/images/moneySmartsDashboard/dec.png')}
                      />
                    </View>
                  )}
                  description={() => (
                    <View style={[AppStyle.marginTop10, AppStyle.rowFlex]}>
                      <TextField type="heading-2" numberOfLines={2}>
                        {UtilLib.formatCurrency(get(totalMoneyOut, [frequency]), '$')}
                      </TextField>
                      <FontAwesome5Icon
                        style={[AppStyle.marginLeft5, AppStyle.marginTop8]}
                        name="play"
                        size={8}
                        color={styles.descriptionIcon.color}
                      />
                    </View>
                  )}
                  onPress={() => handleOnPress('moneyOut')}
                />
              </View>

              <View style={AppStyle.marginTop15}>
                <CustomCard
                  title={t(`${i18nScope}.currentSurplus`)}
                  description={UtilLib.formatCurrency(
                    get(accumulatedActualSurplus, [frequency]),
                    '$',
                  )}
                  source={require('assets/images/moneySmartsDashboard/aim.png')}
                  renderFooter={() => {
                    return (
                      <View>
                        <ProgressBar
                          progress={
                            get(accumulatedActualSurplus, [frequency]) /
                            get(totalTargetedSurplus, [frequency])
                          }
                          barStyle={styles.currentSurplus}
                        />
                        <View style={[AppStyle.alignEnd, AppStyle.marginTop5]}>
                          <TextField type="paragraph-3" numberOfLines={1}>
                            {t(`${i18nScope}.targeted`)}{' '}
                            {UtilLib.formatCurrency(get(totalTargetedSurplus, [frequency]), '$')}
                          </TextField>
                        </View>
                      </View>
                    );
                  }}
                />
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </View>
    );
  }, [
    discretionaryAmount,
    essentialAmount,
    frequency,
    t,
    totalTargetedSurplus,
    accumulatedActualSurplus,
    allLoaded,
    frequencyFilters,
    handleOnPress,
    onRefresh,
    refreshing,
    screenRefreshId,
    styles,
    tabIndex,
    totalMoneyIn,
    totalMoneyOut,
  ]);

  const MoneySmartsDashboardV2 = useCallback(() => {
    const _padX = 50;
    const _pieChartWidth = layoutWidth - _padX;

    const monthlyEssentialAmountValue = get(essentialAmount, [FrequencyEnums[0]]) ?? 0;
    const monthlyDiscretionaryAmountValue = get(discretionaryAmount, [FrequencyEnums[0]]) ?? 0;
    const monthlyBorrowingsValue =
      get(moneyOutBorrowingsMonthlyBreakdown, [FrequencyEnums[0], 'total']) ?? 0;
    const monthlyTargetedSurplusValue = get(totalTargetedSurplus, [FrequencyEnums[0]]) ?? 0;

    const yearlyEssentialAmountValue = get(essentialAmount, [FrequencyEnums[1]]) ?? 0;
    const yearlyDiscretionaryAmountValue = get(discretionaryAmount, [FrequencyEnums[1]]) ?? 0;
    const yearlyBorrowingsValue =
      get(moneyOutBorrowingsMonthlyBreakdown, [FrequencyEnums[1], 'total']) ?? 0;
    const yearlyTargetedSurplusValue = get(totalTargetedSurplus, [FrequencyEnums[1]]) ?? 0;

    const monthlySnapshot = [
      {
        label: t(`${i18nScope}.essentialExpense`),
        value: monthlyEssentialAmountValue,
        color: ['#FD8F65', '#FD8152'],
      },
      {
        label: t(`${i18nScope}.discretionaryExpense`),
        value: monthlyDiscretionaryAmountValue,
        color: ['#FD5170', '#FD4B6B'],
      },
      {
        label: t(`${i18nScope}.borrowings`),
        value: monthlyBorrowingsValue,
        color: ['#E34242', '#D64444'],
      },
      {
        label: t(`${i18nScope}.targetedSurplus`),
        value: monthlyTargetedSurplusValue,
        color: ['#5EC9FD', '#40BFFD'],
      },
    ];

    const yearlySnapshot = [
      {
        label: t(`${i18nScope}.essentialExpense`),
        value: yearlyEssentialAmountValue,
        color: ['#FD8F65', '#FD8152'],
      },
      {
        label: t(`${i18nScope}.discretionaryExpense`),
        value: yearlyDiscretionaryAmountValue,
        color: ['#FD5170', '#FD4B6B'],
      },
      {
        label: t(`${i18nScope}.borrowings`),
        value: yearlyBorrowingsValue,
        color: ['#E34242', '#D64444'],
      },
      {
        label: t(`${i18nScope}.targetedSurplus`),
        value: yearlyTargetedSurplusValue,
        color: ['#5EC9FD', '#40BFFD'],
      },
    ];

    const Title = ({ children }) => (
      <TextField style={AppStyle.textCenter} type="heading-4">
        {children}
      </TextField>
    );

    const renderSnapshot = (frequencyInput, dataInput, chartWidth, chartRef) => (
      <View style={[AppStyle.flex1]}>
        <Title>
          {frequencyInput === FrequencyEnums[0]
            ? t(`${i18nScope}.monthlySnapshot`)
            : t(`${i18nScope}.yearlySnapshot`)}
        </Title>
        <PieChart
          ref={chartRef}
          loading={!allLoaded}
          style={styles.pieSVG}
          width={util.safePositiveValue(chartWidth)}
          data={dataInput}
          labelAccessor={item => item.label}
          valueAccessor={item => item.value}
          formatValue={value => UtilLib.formatCurrency(value)}
          centeredText={() => {
            return (
              <View style={AppStyle.flex1}>
                <View>
                  <TextField type="captain" style={styles.pieCenterTitleText} numberOfLines={3}>
                    {t(`${i18nScope}.totalIncome`)}
                  </TextField>
                </View>
                <View style={AppStyle.padTop5}>
                  <TextField
                    type="heading-2"
                    style={styles.pieCenterDescriptionText}
                    numberOfLines={2}>
                    {UtilLib.formatCurrency(get(totalMoneyIn, [frequencyInput]), '$')}
                  </TextField>
                </View>
              </View>
            );
          }}
        />

        <View style={AppStyle.marginTop10}>
          <View style={AppStyle.rowFlex}>
            <CustomCard
              id="moneyIn"
              containerStyle={AppStyle.flex1}
              title={() => (
                <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                  <TextField numberOfLines={1}>{t(`${i18nScope}.moneyIn`)}</TextField>
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
                  <TextField type="heading-2" numberOfLines={2}>
                    {UtilLib.formatCurrency(get(totalMoneyIn, [frequencyInput]), '$')}
                  </TextField>
                  <FontAwesome5Icon
                    style={[AppStyle.marginLeft5, AppStyle.marginTop8]}
                    name="play"
                    size={8}
                    color={styles.descriptionIcon.color}
                  />
                </View>
              )}
              onPress={() => openModal('moneyIn', frequencyInput)}
            />
            <CustomCard
              id="moneyOut"
              containerStyle={[AppStyle.flex1, AppStyle.marginLeft15]}
              title={() => (
                <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                  <TextField numberOfLines={1}>{t(`${i18nScope}.moneyOut`)}</TextField>
                  <FastImage
                    style={[AppStyle.marginLeft5, styles.image]}
                    source={require('assets/images/moneySmartsDashboard/arrow-down.png')}
                  />
                  <FastImage
                    style={[AppStyle.marginLeft5, styles.image2]}
                    source={require('assets/images/moneySmartsDashboard/dec.png')}
                  />
                </View>
              )}
              description={() => (
                <View style={[AppStyle.marginTop10, AppStyle.rowFlex]}>
                  <TextField type="heading-2" numberOfLines={2}>
                    {UtilLib.formatCurrency(get(totalMoneyOut, [frequencyInput]), '$')}
                  </TextField>
                  <FontAwesome5Icon
                    style={[AppStyle.marginLeft5, AppStyle.marginTop8]}
                    name="play"
                    size={8}
                    color={styles.descriptionIcon.color}
                  />
                </View>
              )}
              onPress={() => openModal('moneyOut', frequencyInput)}
            />
          </View>
        </View>

        <View style={styles.bulletContainer} />
      </View>
    );

    const renderNavigations = () => {
      const moneySMARTSNavigations = [
        {
          id: 1,
          name: t(`${i18nScope}.navigation.monthlyCheckupTitle`),
          icon: require('assets/images/common/calendarChecked.png'),
          onPress: () => {
            NavigationServiceLib.navigate(AppScreenID.MonthlyCheckUp);
          },
        },
        {
          id: 2,
          name: t(`${i18nScope}.navigation.provisionJarsTitle`),
          icon: require('assets/images/common/jar-money.png'),
          onPress: () => NavigationServiceLib.navigate(AppScreenID.ProvisionJarsScreen),
        },
        {
          id: 3,
          name: t(`${i18nScope}.navigation.jarsTitle`),
          icon: require('assets/images/common/saving.png'),
          onPress: () => NavigationServiceLib.navigate(AppScreenID.JarsDashboard),
        },
        {
          id: 4,
          name: t(`${i18nScope}.navigation.monthlyReportingTitle`),
          icon: require('assets/images/common/chart.png'),
          onPress: () => NavigationServiceLib.navigate(AppScreenID.MonthlyReportingDashboard),
        },
        {
          id: 5,
          name: t(`${i18nScope}.navigation.provisionSpendingTitle`),
          icon: require('assets/images/common/chart.png'),
          onPress: () => NavigationServiceLib.navigate(AppScreenID.ProvisionSpending),
        },
        {
          id: 6,
          name: t(`${i18nScope}.navigation.regularSpendingTitle`),
          icon: require('assets/images/common/chart.png'),
          onPress: () => NavigationServiceLib.navigate(AppScreenID.RegularSpending),
        },
      ];
      if (moneySMARTSNavigations.length === 0) {
        return null;
      }
      return moneySMARTSNavigations.map((item, index) => {
        const isFirst = index === 0;
        return (
          <View key={`navigation-${item.id}`} style={!isFirst && AppStyle.marginTop20}>
            <NavigationItem onPress={item.onPress}>
              <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                {item?.icon && (
                  <View
                    style={[AppStyle.justifyContent, AppStyle.alignContent, styles.iconContainer]}>
                    <Image source={item.icon} style={styles.icon} resizeMode="contain" />
                  </View>
                )}
                <View style={AppStyle.marginLeft10}>
                  <TextField type="heading-4">{item.name}</TextField>
                </View>
              </View>
            </NavigationItem>
          </View>
        );
      });
    };

    return (
      <View key={screenRefreshId} style={styles.container}>
        <Header type="full" title={t(`${i18nScope}.title`)} />
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          style={AppStyle.flex1}
          contentContainerStyle={AppStyle.menuPaddingBottom}
          showsVerticalScrollIndicator={false}>
          <View style={[AppStyle.flex1]}>
            {isAsAtCurrentDate === false && checkUpFlow ? (
              <View>
                <View style={[AppStyle.rowFlex, AppStyle.textLeft]}>
                  <View style={AppStyle.padLeft20}>
                    <TextField type="heading-4" style={AppStyle.textCenter}>
                      {'Displaying snapshot as at ' + currentCheckUpEndDateFormat + '.'}
                    </TextField>
                  </View>
                  <View style={AppStyle.padLeft10}>
                    <CustomTooltip
                      ref={tooltipRef}
                      hideArrow
                      placement="bottom"
                      content={
                        <View>
                          <TextField type="captain">
                            {`The current MoneySMARTS period ended on ${currentCheckUpEndDateFormat}. The below snapshots are displayed as at ${currentCheckUpEndDateFormat}. To start a new period, head to our website at `}
                            <TextField
                              type="captain"
                              style={styles.textWithLink}
                              onPress={() => {
                                UtilLib.openInAppBrowserLink('https://www.my.moorr.com.au');
                                tooltipRef.current?.hide();
                                if (chartMonthlyRef.current) {
                                  chartMonthlyRef.current?.clearTooltip();
                                }
                                if (chartYearlyRef.current) {
                                  chartYearlyRef.current?.clearTooltip();
                                }
                              }}
                              suppressHighlighting={true}>
                              {'www.my.moorr.com.au'}
                            </TextField>
                            {' and commence a rollover.'}
                          </TextField>
                        </View>
                      }
                    />
                  </View>
                </View>
              </View>
            ) : null}
            <View style={[isAsAtCurrentDate === false ? {} : AppStyle.marginTop10]}>
              <Swiper
                key={'Snapshot'}
                views={[
                  {
                    view: (
                      <View style={[styles.chartContainer]}>
                        {renderSnapshot(
                          FrequencyEnums[0],
                          monthlySnapshot,
                          _pieChartWidth,
                          chartMonthlyRef,
                        )}
                      </View>
                    ),
                  },
                  {
                    view: (
                      <View style={[styles.chartContainer]}>
                        {renderSnapshot(
                          FrequencyEnums[1],
                          yearlySnapshot,
                          _pieChartWidth,
                          chartYearlyRef,
                        )}
                      </View>
                    ),
                  },
                ]}
              />
            </View>

            <View style={[AppStyle.padX15, AppStyle.marginY10]}>
              <CustomCard
                title={t(`${i18nScope}.currentSurplus`)}
                description={UtilLib.formatCurrency(
                  get(accumulatedActualSurplus, [FrequencyEnums[1]]),
                  '$',
                )}
                source={require('assets/images/moneySmartsDashboard/aim.png')}
                renderFooter={() => {
                  return (
                    <View>
                      <ProgressBar
                        progress={
                          get(accumulatedActualSurplus, [FrequencyEnums[1]]) /
                          get(totalTargetedSurplus, [FrequencyEnums[1]])
                        }
                        barStyle={styles.currentSurplus}
                      />
                      <View style={[AppStyle.alignEnd, AppStyle.marginTop5]}>
                        <TextField type="paragraph-3" numberOfLines={1}>
                          {t(`${i18nScope}.targeted`)}{' '}
                          {UtilLib.formatCurrency(
                            get(totalTargetedSurplus, [FrequencyEnums[1]]),
                            '$',
                          )}
                        </TextField>
                      </View>
                    </View>
                  );
                }}
              />
            </View>

            <View style={[AppStyle.padX15, AppStyle.marginY10]}>{renderNavigations()}</View>
          </View>
        </ScrollView>
      </View>
    );
  }, [
    accumulatedActualSurplus,
    allLoaded,
    discretionaryAmount,
    essentialAmount,
    onRefresh,
    openModal,
    refreshing,
    screenRefreshId,
    styles,
    t,
    totalMoneyIn,
    totalMoneyOut,
    totalTargetedSurplus,
    layoutWidth,
    moneyOutBorrowingsMonthlyBreakdown,
  ]);

  return (
    <>{MoneySMARTS_UI_VERSION === 2 ? <MoneySmartsDashboardV2 /> : <MoneySmartsDashboardV1 />}</>
  );
}

export default compose(
  withDynamicModuleLoader(getModule()),
  withBackHandler,
)(MoneySmartsDashboardScreen);
