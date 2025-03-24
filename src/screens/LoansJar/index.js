import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import Header from 'components/layouts/Header';
import MoneySMARTBreakdownCard from 'components/layouts/MoneySMARTBreakdownCard';
import { AppConstants } from 'constant';
import { useDispatchResolve } from 'libs/hooks';
import { useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { getMoneySmarts } from 'store/MoneySmartsDashboard/action';
import getMoneySmartsModule from 'store/MoneySmartsDashboard/module';
import { selectJarByKeyAndJar } from 'store/MoneySmartsDashboard/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.loansJar';

function LoansJarScreen(props) {
  const { t } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const scrollRef = useRef();
  const [refreshing, setRefreshing] = useState(false);
  const dispatchResolve = useDispatchResolve();
  const { monthlyInTotal, monthlyOutGroups, allLoaded } = useSelector(
    selectJarByKeyAndJar(
      AppConstants.listTypeByJars.Loans,
      AppConstants.listTypeJarByMoneyOutExpense.Loans,
    ),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchResolve(getMoneySmarts(true)).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);
  return (
    <View style={styles.container}>
      <Header type="full" title={t(`${i18nScope}.headerTitle`)} />
      <KeyboardAwareScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ref={scrollRef}
        style={AppStyle.flex1}
        contentContainerStyle={AppStyle.menuPaddingBottom}
        showsVerticalScrollIndicator={false}>
        <View style={[AppStyle.flex1, AppStyle.padX15, AppStyle.marginTop10]}>
          <View style={AppStyle.marginBottom10}>
            <MoneySMARTBreakdownCard
              loading={!allLoaded}
              label={t(`${i18nScope}.monthlyIn`)}
              data={[
                {
                  key: t(`${i18nScope}.transferFromPrimaryAccount`),
                  total: monthlyInTotal,
                },
              ]}
            />
          </View>
          <View style={AppStyle.marginBottom10}>
            <MoneySMARTBreakdownCard
              loading={!allLoaded}
              label={t(`${i18nScope}.monthlyOut`)}
              data={monthlyOutGroups}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(
  withDynamicModuleLoader(getMoneySmartsModule()),
  withTranslation(),
  withBackHandler,
)(LoansJarScreen);
