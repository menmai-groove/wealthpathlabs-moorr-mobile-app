import FinancialTemplate from 'components/basics/FinancialTemplate/FinancialTemplate';
import Header from 'components/layouts/Header';
import { AppConstants } from 'constant';
import { useDispatchResolve } from 'libs/hooks';
import { useOnBackScreenHandler, useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { getAssetPosition, setChartTime } from 'store/AssetPosition/action';
import getModule from 'store/AssetPosition/module';
import {
  selectArchivedFinancialCards,
  selectAssetPosition,
  selectAssetPositionValue,
  selectChartTime,
  selectFetching,
  selectFinancialCards,
} from 'store/AssetPosition/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.assetPosition';

function AssetPositionScreen(props) {
  useOnBackScreenHandler();

  const { t } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [refreshing, setRefreshing] = useState(false);
  const dispatchResolve = useDispatchResolve();

  const financialCards = useSelector(selectFinancialCards);
  const archivedFinancialCards = useSelector(selectArchivedFinancialCards);
  const chartData = useSelector(selectAssetPosition);
  const assetPositionValue = useSelector(selectAssetPositionValue);
  const fetching = useSelector(selectFetching);
  const chartTime = useSelector(selectChartTime);
  const scrollViewRef = useRef(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    dispatchResolve(getAssetPosition(true)).then(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);

  const handleTimeSelect = useCallback(
    timeIndexInput => {
      const foundTime = AppConstants.listFilterChart.find((_, idx) => idx === timeIndexInput);
      dispatchResolve(setChartTime(foundTime.value));
    },
    [dispatchResolve],
  );

  const handlePressOption = useCallback(() => {}, []);

  return (
    <View style={[styles.container]}>
      <Header type="full" title={t(`${i18nScope}.headerTitle`)} />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={AppStyle.flex1}
        contentContainerStyle={[
          styles.scrollContent,
          AppStyle.flexGrow1,
          AppStyle.menuPaddingBottom,
        ]}
        ref={scrollViewRef}>
        <FinancialTemplate
          {...{
            graphTitle: t(`${i18nScope}.graphTitle`),
            timeIndex: AppConstants.listFilterChart.findIndex(x => x.value === chartTime),
            timeList: AppConstants.listFilterChart,
            onTimeSelect: handleTimeSelect,
            color: styles.assetPosition.color,
            data: {
              originalData: chartData,
            },
            onPressOption: handlePressOption,
            summaryContent: t(`${i18nScope}.summaryContent`),
            cardList: [{ id: 'assets', title: 'ASSET CARDS', list: financialCards }],
            hideCardList: archivedFinancialCards,
            totalValue: assetPositionValue,
            fetching,
            onPressViewAll: position => {
              scrollViewRef.current?.scrollTo({ x: 0, y: position + 700, animated: true });
            },
          }}
        />
      </ScrollView>
    </View>
  );
}

export default compose(
  withDynamicModuleLoader(getModule()),
  withTranslation(),
)(AssetPositionScreen);
