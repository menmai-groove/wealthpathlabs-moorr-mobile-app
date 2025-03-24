import { useRoute } from '@react-navigation/core';
import ListWealthCard from 'components/basics/ListWealthCard';
import Swiper from 'components/basics/Swiper';
import TileCard from 'components/basics/TileCard';
import TouchableField from 'components/basics/TouchableField';
import Header from 'components/layouts/Header';
import { AppConstants } from 'constant';
import { AnalyticsLib, GlobalLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { useOnScreenRefresh, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import GaugeList from 'screens/WealthDashboard/components/GaugeList';
import NetWorthChart from 'screens/WealthDashboard/components/NetWorthChart';
import { selectFlags } from 'store/Auth/selector';
import { selectAppPreference } from 'store/Root/selector';
import { getWealthSpeedData } from 'store/Wealth/action';
import getModule from 'store/Wealth/module';
import { selectWealthData } from 'store/Wealth/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.wealthDashboard';

function WealthDashboard() {
  const { params } = useRoute();
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatchResolve = useDispatchResolve();
  const { screenRefreshId } = useOnScreenRefresh();
  const wealthData = useSelector(selectWealthData);
  const [refreshing, setRefreshing] = useState(false);
  const { wealthDashboardLink } = useSelector(selectAppPreference);
  const { wealthUpgradeNotification } = useSelector(selectFlags);

  const myData = useMemo(() => {
    const { annualSurplusCashflow, loanValuationRatio, availableEquity } = wealthData;
    return {
      annualSurplusCashflow: {
        title: t(`${i18nScope}.annualSurplusCashflow`),
        value: UtilLib.formatCurrency(annualSurplusCashflow, '$'),
        icon: require('assets/images/common/jar-money.png'),
        iconBackgroundColor: '#94E9B880',
      },
      totalLoanToValuationRatio: {
        title: t(`${i18nScope}.totalLoanToValuationRatio`),
        value: `${loanValuationRatio}%`,
        icon: require('assets/images/common/wallet.png'),
        iconBackgroundColor: '#FFB7B7',
      },
      totalAvailableEquity: {
        title: t(`${i18nScope}.totalAvailableEquityAt80%`),
        value: UtilLib.formatCurrency(availableEquity, '$'),
        icon: require('assets/images/common/bank.png'),
        iconBackgroundColor: '#8ECCF4',
      },
    };
  }, [t, wealthData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([dispatchResolve(getWealthSpeedData({ generate: false }))]).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);

  const closeModal = useCallback(() => {
    GlobalLib.ScreenModal.get().hide();
  }, []);

  const searchTree = useCallback((element, key, value, level = 1) => {
    // if (element[key] === value) { // TODO: version 1
    if (element[key] === value && element.children != null) {
      // TODO: version 2
      return element;
    } else if (element.children != null) {
      var i;
      var result = null;
      for (i = 0; result === null && i < element.children.length; i++) {
        // console.log(element, element.children[i], value, level)
        result = searchTree(element.children[i], key, value, level + 1);
      }
      return result;
    }
    return null;
  }, []);

  const handleSeeMore = useCallback(
    item => {
      const element = {
        children: AppConstants.wealthTreeData,
      };
      const foundElement = searchTree(element, 'key', item?.key);
      const data = {
        label: item?.info?.label,
        definition: item?.definition,
        key: item?.key,
        foundElement,
      };
      GlobalLib.ScreenModal.get().show({
        onRequestClose: () => {
          closeModal();
        },
        hideCloseButton: true,
        body: <GaugeList data={data} wealthData={wealthData} closeModal={closeModal} />,
      });
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.wealthDashboardShowDetails, {
        gauge: data.key,
        source: 'dashboard',
      });
    },
    [closeModal, searchTree, wealthData],
  );

  useEffect(() => {
    if (wealthUpgradeNotification) {
      GlobalLib.ConfirmModal.get().show({
        title: t(`${i18nScope}.upgradedTitle`),
        content: t(`${i18nScope}.upgradedContent`),
        okText: t(`${i18nScope}.dismiss`),
        onlyOneButton: true,
      });
    }
  }, [t, wealthUpgradeNotification]);

  const renderTileCard = useCallback((data, isPercent) => {
    return (
      <TileCard
        title={data.title}
        value={data.value}
        icon={data.icon}
        iconBackgroundColor={data.iconBackgroundColor}
        isPercent={isPercent}
      />
    );
  }, []);

  const renderInfoIcon = useCallback(
    () => (
      <TouchableField onPress={() => UtilLib.openInAppBrowserLink(wealthDashboardLink)}>
        <View style={AppStyle.marginRight10}>
          <FastImage
            style={styles.infoIcon}
            source={require('assets/images/more-info.png')}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      </TouchableField>
    ),
    [styles, wealthDashboardLink],
  );

  return (
    <View style={styles.container}>
      <Header type="full" title={t(`${i18nScope}.title`)} renderInfoIcon={renderInfoIcon} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={AppStyle.flex1}
        contentContainerStyle={AppStyle.menuPaddingBottom}
        showsVerticalScrollIndicator={false}>
        <View style={[AppStyle.flex1]}>
          <View style={[AppStyle.marginTop10]}>
            <ListWealthCard
              showTextSeeDetails
              onPressDetail={handleSeeMore}
              onPressGauge={handleSeeMore}
              initialIndex={params?.index || 0}
            />
          </View>

          <View>
            <Swiper
              style={{
                bulletContainer: styles.bulletContainer,
              }}
              key={'tileCard'}
              views={[
                {
                  view: (
                    <View style={[styles.chartContainer]}>
                      {renderTileCard(myData.annualSurplusCashflow)}
                    </View>
                  ),
                },
                {
                  view: (
                    <View style={[styles.chartContainer]}>
                      {renderTileCard(myData.totalLoanToValuationRatio, true)}
                    </View>
                  ),
                },
                {
                  view: (
                    <View style={[styles.chartContainer]}>
                      {renderTileCard(myData.totalAvailableEquity)}
                    </View>
                  ),
                },
              ]}
            />
          </View>
        </View>
        <NetWorthChart key={screenRefreshId} />
      </ScrollView>
    </View>
  );
}

export default compose(withBackHandler, withDynamicModuleLoader(getModule()))(WealthDashboard);
