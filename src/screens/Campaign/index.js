/**
 *
 * ErrorNetwork
 *
 */

import { useRoute } from '@react-navigation/core';
import { CampaignButton } from 'components/basics/CampaignContent';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import Header from 'components/layouts/Header';
import { NavigationServiceLib } from 'libs';
// import { useDispatchResolve } from 'libs/hooks';
import { get, isNil } from 'lodash';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  // RefreshControl,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { compose } from 'redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.campaign';

function Campaign({}) {
  const route = useRoute();
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const insets = useSafeAreaInsets();
  // const [refreshing, setRefreshing] = useState(false);
  // const dispatchResolve = useDispatchResolve();

  const scrollRef = useRef();

  // const onRefresh = useCallback(() => {
  //   setRefreshing(true);
  //   dispatchResolve(getProfile()).finally(() => {
  //     setRefreshing(false);
  //   });
  // }, []);

  const campaign = get(route, ['params', 'campaign']);
  const initialDialogId = get(campaign, ['initialDialogId']);
  const dialogs = get(campaign, ['dialogs']);
  const initialDialog = dialogs?.find(dialog => get(dialog, ['dialogId']) === initialDialogId);
  const header = get(initialDialog, ['header']);
  const body = get(initialDialog, ['body']);
  const buttons = get(initialDialog, ['buttons']);
  const backButtonHidden = get(campaign, ['backButtonHidden']);

  useOnBackButtonPress(() => {
    if (!backButtonHidden) {
      NavigationServiceLib.pop();
    }
  });

  return (
    <View style={styles.container}>
      <Header type={backButtonHidden ? 'none' : 'back'} title={t(`${i18nScope}.title`)} />
      <KeyboardAwareScrollView
        // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ref={scrollRef}
        style={AppStyle.flex1}
        contentContainerStyle={
          insets.bottom > 0 ? { paddingBottom: insets.bottom } : AppStyle.padBottom15
        }
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}>
        <View style={[AppStyle.padX20, AppStyle.padBottom20]}>
          {!isNil(body) && (
            <Question emotion="excited" content={body} header={header} enabledMarkdown />
          )}
          {buttons?.length > 0 ? (
            <View style={AppStyle.marginTop20}>
              {buttons.map((button, bi) => {
                const isFirst = bi === 0;
                return (
                  <View
                    key={`campaign-button-${bi}`}
                    style={[!isFirst ? AppStyle.marginTop15 : null]}>
                    <CampaignButton style={styles} campaign={campaign} button={button} />
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

Campaign.propTypes = {};

export default compose()(Campaign);
