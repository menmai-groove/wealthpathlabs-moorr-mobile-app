import CustomTab from 'components/basics/CustomTab';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import Header from 'components/layouts/Header';
import MoneySMARTBreakdownCard from 'components/layouts/MoneySMARTBreakdownCard';
import { useDispatchResolve } from 'libs/hooks';
import { get, isEmpty } from 'lodash';
import { useOnScreenRefresh, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { selectUser } from 'store/Auth/selector';
import { getMoneySmarts } from 'store/MoneySmartsDashboard/action';
import getModule from 'store/MoneySmartsDashboard/module';
import { selectMoneySmarts } from 'store/MoneySmartsDashboard/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.primarySavingAccountJar';
const FREQUENCY = 'monthly';

function PrimarySavingAccountJarScreen(props) {
  const { t } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { screenRefreshId } = useOnScreenRefresh();

  const [tabIndex, setTabIndex] = useState(0);
  const scrollRef = useRef();
  const user = useSelector(selectUser);
  const [refreshing, setRefreshing] = useState(false);
  const dispatchResolve = useDispatchResolve();
  const { allLoaded, moneyInBreakdown, moneyOutBreakdown, totalTargetedSurplus } =
    useSelector(selectMoneySmarts);

  useEffect(() => {
    setTabIndex(0);
  }, [screenRefreshId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchResolve(getMoneySmarts(true)).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);

  const filters = useMemo(() => {
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

  return (
    <View key={screenRefreshId} style={styles.container}>
      <Header type="full" title={t(`${i18nScope}.headerTitle`)} />
      {moneyInBreakdown?.length > 1 && (
        <View style={[AppStyle.marginTop10, AppStyle.marginBottom20]}>
          <CustomTab
            data={filters}
            value={tabIndex}
            onSelect={index => {
              setTabIndex(index);
            }}
            containerStyle={styles.containerStyle}
            fontStyle={styles.fontStyle}
            activeTabStyle={styles.activeTabStyle}
            activeFontStyle={styles.activeFontStyle}
          />
        </View>
      )}
      <KeyboardAwareScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ref={scrollRef}
        style={AppStyle.flex1}
        contentContainerStyle={AppStyle.menuPaddingBottom}
        showsVerticalScrollIndicator={false}>
        <View style={[AppStyle.flex1, AppStyle.padX15]}>
          <View style={AppStyle.marginBottom10}>
            <MoneySMARTBreakdownCard
              loading={!allLoaded}
              label={t(`${i18nScope}.monthlyIn`)}
              data={get(moneyInBreakdown, [tabIndex, FREQUENCY])?.groups}
            />
          </View>

          <View style={AppStyle.marginBottom10}>
            <MoneySMARTBreakdownCard
              loading={!allLoaded}
              label={t(`${i18nScope}.monthlyOut`)}
              data={[
                ...get(moneyOutBreakdown, [FREQUENCY])?.groups?.map(item => ({
                  ...item,
                  key: t(`global.jars.${item.key}`, item.key),
                })),
                {
                  key: t('components.moneySMARTBreakdownCard.total'),
                  total: get(moneyOutBreakdown, [FREQUENCY])?.total,
                },
              ]}
            />
          </View>

          <MoneySMARTBreakdownCard
            loading={!allLoaded}
            label={t(`${i18nScope}.monthlySurplus`)}
            data={get(totalTargetedSurplus, [FREQUENCY])}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(
  withDynamicModuleLoader(getModule()),
  withTranslation(),
  withBackHandler,
)(PrimarySavingAccountJarScreen);
