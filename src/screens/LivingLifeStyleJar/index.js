import CustomCard from 'components/basics/CustomCard';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import Header from 'components/layouts/Header';
import MoneySMARTBreakdownCard from 'components/layouts/MoneySMARTBreakdownCard';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { get } from 'lodash';
import { useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { getMoneySmarts } from 'store/MoneySmartsDashboard/action';
import getModule from 'store/MoneySmartsDashboard/module';
import { selectJarByKeyAndJar, selectMoneySmarts } from 'store/MoneySmartsDashboard/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.livingLifeStyleJar';

function LivingLifeStyleJarScreen(props) {
  const { t } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const scrollRef = useRef();
  const [refreshing, setRefreshing] = useState(false);
  const dispatchResolve = useDispatchResolve();
  const { weekly7DayFloatAllocation } = useSelector(selectMoneySmarts);
  const { monthlyInTotal, monthlyOutGroups, allLoaded } = useSelector(
    selectJarByKeyAndJar(
      AppConstants.listTypeByJars.Living_LifeStyle,
      AppConstants.listTypeJarByMoneyOutExpense.Living_LifeStyle,
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
          <CustomCard
            id="weekly7DayFloatAllocation"
            containerStyle={[styles.weekly7DayContainer, AppStyle.marginBottom20]}
            title={() => (
              <TextField style={styles.whiteColor}>
                {t(`${i18nScope}.weekly7DayFloatAllocation`)}
              </TextField>
            )}
            description={() => (
              <TextField style={[AppStyle.marginTop5, styles.whiteColor]} type="heading-2">
                {UtilLib.formatCurrency(
                  get(weekly7DayFloatAllocation, ['weekly', 'total'], 0),
                  '$',
                )}
              </TextField>
            )}
            source={require('assets/images/livingLifeStyleJar/suitcase.png')}
          />

          <View style={AppStyle.marginBottom10}>
            <MoneySMARTBreakdownCard
              loading={!allLoaded}
              label={t(`${i18nScope}.monthlyIn`)}
              data={[
                {
                  key: t(`${i18nScope}.paidFromPrimaryAccount`),
                  total: monthlyInTotal,
                },
              ]}
            />
          </View>

          <MoneySMARTBreakdownCard
            loading={!allLoaded}
            label={t(`${i18nScope}.monthlyOut`)}
            data={monthlyOutGroups}
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
)(LivingLifeStyleJarScreen);
