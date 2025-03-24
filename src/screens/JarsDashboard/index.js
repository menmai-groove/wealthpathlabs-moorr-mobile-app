import { PieChart } from 'components/basics/PieChart';
import Header from 'components/layouts/Header';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { get } from 'lodash';
import { useOnScreenRefresh, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { getMoneySmarts } from 'store/MoneySmartsDashboard/action';
import getMoneySmartsModule from 'store/MoneySmartsDashboard/module';
import { selectMoneySmarts } from 'store/MoneySmartsDashboard/selector';
import { AppStyle } from 'theme';

import { JarsItem } from './component/JarsItem';
import themedStyles from './styles';

const i18nScope = 'screens.jars_dashboard';
function JarsDashboard(props) {
  const { t } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { screenRefreshId } = useOnScreenRefresh();

  const { moneyOutBreakdown, totalTargetedSurplus, allLoaded } = useSelector(selectMoneySmarts);
  const [refreshing, setRefreshing] = useState(false);
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
      const monthlyJarBreakdown = get(moneyOutBreakdown, ['monthly', 'groups']) || [];
      if (monthlyJarBreakdown.length && key === AppConstants.listTypeByJars.Primary_Saving) {
        return {
          type: AppConstants.listTypeByJars.Primary_Saving,
          label: t(`global.jars.${AppConstants.listTypeByJars.Primary_Saving}`),
          value: get(totalTargetedSurplus, ['monthly']) ?? 0,
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

  const dataListJars = useMemo(() => {
    return [
      {
        ...getJarData(AppConstants.listTypeByJars.Provision),
        color: ['#6BD0E8', '#1BA2C3'],
        description: t(`${i18nScope}.totalRemaining`),
      },
      {
        ...getJarData(AppConstants.listTypeByJars.Living_LifeStyle),
        color: ['#B178FC', '#8E57FC'],
        description: t(`${i18nScope}.monthlyOut`),
      },
      {
        ...getJarData(AppConstants.listTypeByJars.Primary_Saving),
        color: ['#5EC9FD', '#40BFFD'],
        description: t(`${i18nScope}.totalMonthlySurplus`),
      },
      {
        ...getJarData(AppConstants.listTypeByJars.Credit),
        color: ['#517CFC', '#517CFC'],
        description: t(`${i18nScope}.monthlyOut`),
      },
      {
        ...getJarData(AppConstants.listTypeByJars.Direct),
        color: ['#44E7B6', '#19D59B'],
        description: t(`${i18nScope}.monthlyOut`),
      },
      {
        ...getJarData(AppConstants.listTypeByJars.Loans),
        color: ['#FD4B6B', '#FD4B6B'],
        description: t(`${i18nScope}.monthlyOut`),
      },
    ];
  }, [t, getJarData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchResolve(getMoneySmarts(true)).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);

  return (
    <View key={screenRefreshId} style={styles.container}>
      <Header type="full" title={t(`${i18nScope}.headerTitle`)} />

      <View style={[AppStyle.flex1, AppStyle.padX15]}>
        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          data={dataListJars}
          style={AppStyle.flex1}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item, index }) => (
            <JarsItem {...item} key={`jar-${index}`} type={item.type} />
          )}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <PieChart
              loading={!allLoaded}
              height={250}
              data={[
                dataListJars[5],
                dataListJars[2],
                dataListJars[4],
                dataListJars[3],
                dataListJars[0],
                dataListJars[1],
              ]}
              valueAccessor={item => item.value}
              formatValue={value => UtilLib.formatCurrency(value)}
              // outerRadius={'55%'}
              // activeOuterRadius={'62%'}
              // activeOuterRadius={'55%'}
              // tooltipOuterRadius={'67%'}
              tooltipContainerStyle={styles.tooltipContainer}
            />
          }
          ListFooterComponent={<View style={AppStyle.menuPaddingBottom} />}
        />
      </View>
    </View>
  );
}

export default compose(
  withDynamicModuleLoader([getMoneySmartsModule()]),
  withTranslation(),
  withBackHandler,
)(JarsDashboard);
