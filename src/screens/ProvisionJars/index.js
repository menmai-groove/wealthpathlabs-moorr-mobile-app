import Accordion from 'components/basics/Accordion';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import ContentLoader from 'components/layouts/ContentLoader';
import Header from 'components/layouts/Header';
import NoDataAvailable from 'components/layouts/NoDataAvailable';
import { AppScreenID } from 'constant';
import { NavigationServiceLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { useOnScreenRefresh, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { getMoneySmarts } from 'store/MoneySmartsDashboard/action';
import getModule from 'store/MoneySmartsDashboard/module';
import { selectAllLoaded, selectProvisionsJar } from 'store/MoneySmartsDashboard/selector';
import { AppStyle } from 'theme';

import ProvisionCards from './components/ProvisionCards';
import ProvisionChart from './components/ProvisionChart';
import themedStyles from './styles';

const i18nScope = 'screens.provisionsJar';

const isArchivedProvisionChanges = true;

function ProvisionJarsScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { summary, provisions, previousProvisions } = useSelector(selectProvisionsJar);
  const allLoaded = useSelector(selectAllLoaded);
  const [refreshing, setRefreshing] = useState(false);
  const { screenRefreshId } = useOnScreenRefresh();
  const [accordionExpand, setAccordionExpand] = useState(false);
  const [accordionExpand2, setAccordionExpand2] = useState(true);

  const dispatchResolve = useDispatchResolve();

  useEffect(() => {
    // Refresh data for first time load UI. Data will change when change expense item
    dispatchResolve(getMoneySmarts(true));
  }, [dispatchResolve]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchResolve(getMoneySmarts(true)).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);

  return (
    <View key={screenRefreshId} style={styles.container}>
      <Header type="full" title={t(`${i18nScope}.headerTitle`)} />
      <KeyboardAwareScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={AppStyle.flex1}
        contentContainerStyle={[AppStyle.flexGrow1, AppStyle.menuPaddingBottom]}
        showsVerticalScrollIndicator={false}>
        {allLoaded ? (
          !provisions?.length && !previousProvisions?.length ? (
            <NoDataAvailable
              type="button"
              buttonText={t(`${i18nScope}.emptyProvisionJarButton`)}
              onPress={() => NavigationServiceLib.navigate(AppScreenID.FinancialDashboard)}
              title={t(`${i18nScope}.emptyProvisionJarTitle`)}
              description={t(`${i18nScope}.emptyProvisionJarDescription`)}
            />
          ) : (
            <>
              <ProvisionChart summary={summary} />
              {isArchivedProvisionChanges ? (
                <View>
                  <Accordion
                    title={t(`${i18nScope}.currentProvisions`)}
                    value={accordionExpand}
                    onChange={setAccordionExpand}
                    version={2}
                    style={{
                      accordionStyle: !accordionExpand
                        ? {
                            backgroundColor: '#F5F5FA',
                          }
                        : {},
                    }}>
                    {provisions?.length > 0 ? (
                      <ProvisionCards cardList={provisions} />
                    ) : (
                      <NoDataAvailable
                        type="none"
                        imageType="empty"
                        title=""
                        description={t(`${i18nScope}.emptyProvisionJarTitle`)}
                      />
                    )}
                  </Accordion>
                  <Accordion
                    title={t(`${i18nScope}.archivedPreviousProvisions`)}
                    value={accordionExpand2}
                    onChange={setAccordionExpand2}
                    version={2}
                    style={{
                      accordionStyle: !accordionExpand2
                        ? {
                            backgroundColor: '#F5F5FA',
                          }
                        : {},
                    }}>
                    {previousProvisions?.length > 0 ? (
                      <ProvisionCards cardList={previousProvisions} isPreviousProvision={true} />
                    ) : (
                      <NoDataAvailable
                        type="none"
                        imageType="empty"
                        title=""
                        description={t(`${i18nScope}.emptyProvisionJarTitle`)}
                      />
                    )}
                  </Accordion>
                </View>
              ) : (
                <ProvisionCards cardList={provisions} />
              )}
            </>
          )
        ) : (
          <ContentLoader name="provisionJar" />
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(
  withDynamicModuleLoader([getModule()]),
  withBackHandler,
)(ProvisionJarsScreen);
