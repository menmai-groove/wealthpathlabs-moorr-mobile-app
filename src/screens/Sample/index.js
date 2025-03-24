import Condition from 'components/basics/Condition';
import ContentLoader from 'components/layouts/ContentLoader';
import Header from 'components/layouts/Header';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { compose } from 'redux';
import getModule from 'store/Verification/module';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.sample';

function SampleScreen(props) {
  const { t } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [refreshing, setRefreshing] = useState(false);

  const fetched = true;

  const handleBack = useCallback(async () => {}, []);
  useOnBackButtonPress(() => handleBack());

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 200);
  }, []);

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
        ]}>
        <Condition display={!fetched}>
          <View style={[AppStyle.flex1]}>
            <ContentLoader name="sample" />
          </View>
        </Condition>

        <Condition display={fetched}>
          <Text>sad</Text>
        </Condition>
      </ScrollView>
    </View>
  );
}

export default compose(withDynamicModuleLoader(getModule()), withTranslation())(SampleScreen);
