import { useNavigationState } from '@react-navigation/native';
import Avatar from 'components/basics/Avatar';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AccordionMenu } from 'components/layouts/MenuLayout';
import { AppConfigs, AppConstants, AppScreenID } from 'constant';
import { AnalyticsLib, GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { useThemedStyle } from 'providers';
import { useMenu } from 'providers/menu/consumer';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Image, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { openMyKnowledge } from 'store/Auth/action';
import { selectUser } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const DURATION = AppConfigs.menuAnimationDuration;
const i18nScope = 'screens.menu';

function MenuScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const insets = useSafeAreaInsets();
  const user = useSelector(selectUser);
  const [box, setBox] = useState();
  const [headerVisible, setHeaderVisible] = useState(true);
  const animateNative = useRef(new Animated.Value(0));
  const { findPath, setPath, setCurrentRoute, getActiveRouteState, menuOpened } = useMenu();
  const dispatch = useDispatchResolve();

  const routeName = useNavigationState(state => getActiveRouteState(state).name);

  useEffect(() => {
    if (routeName) {
      if (routeName === AppScreenID.Entry) {
        setPath(AppScreenID.Home);
        setHeaderVisible(true);
        setCurrentRoute(AppScreenID.Home);
      } else {
        const newPath = findPath(routeName);
        if (newPath?.stack?.length > 0) {
          setPath(newPath.path);
          setHeaderVisible(newPath.stack.length - 1 <= 0);
        } else {
          setPath('');
          setHeaderVisible(true);
        }
        setCurrentRoute(routeName);
      }
    }
  }, [routeName, findPath, setHeaderVisible, setCurrentRoute, setPath]);

  useEffect(() => {
    // update path when re open menu
    if (menuOpened && routeName) {
      const newPath = findPath(routeName);
      if (newPath?.stack?.length > 0) {
        setPath(newPath.path);
        setHeaderVisible(newPath.stack.length - 1 <= 0);
      }
    }
  }, [menuOpened, routeName, findPath, setPath]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animateNative.current, {
        duration: DURATION,
        toValue: menuOpened ? 1 : 0,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.quad),
      }),
    ]).start();
  }, [menuOpened]);

  const close = useCallback(() => {
    GlobalLib.MenuModal.get().hide();
  }, []);

  const handleOpenMyKnowledge = useCallback(() => {
    dispatch(openMyKnowledge());
  }, []);

  const onPressMenu = useCallback(
    ({ visible, id, path: pathInput, hasChildren, params }) => {
      if (id === 'report_a_bug') {
        UtilLib.openInAppBrowserLink(AppConfigs.feedbackInformingLink);
        return;
      }

      if (id === 'myknowledge') {
        handleOpenMyKnowledge();
        close();
        return;
      }

      const paths = pathInput.length ? pathInput.split('/') : [];
      if (!hasChildren && paths.length) {
        const listScreenDemo = [
          AppScreenID.Home,
          AppScreenID.ProfileSetting,
          AppScreenID.MoneySmartsDashboard,
          AppScreenID.JarsDashboard,
          AppScreenID.PrimarySavingAccountJar,
          AppScreenID.LivingLifeStyleJar,
          AppScreenID.CreditCardJar,
          AppScreenID.DirectPaymentJar,
          AppScreenID.LoansJar,
          AppScreenID.ProvisionJarsScreen,
          AppScreenID.ProvisionExpenseScreen,
          AppScreenID.MonthlyCheckUp,
          AppScreenID.MonthlyReportingDashboard,
          AppScreenID.ProvisionSpending,
          AppScreenID.RegularSpending,
          AppScreenID.FinancialDashboard,
          AppScreenID.AddPersonalGoal,
          AppScreenID.VerticalTimeline,
          AppScreenID.WealthDashboard,
          AppScreenID.ExpenseDashboard,
          AppScreenID.MyFINANCIALS,
        ];
        listScreenDemo.push(...[AppScreenID.Income, AppScreenID.AddAsset, AppScreenID.EditAsset]);
        if (listScreenDemo.includes(id)) {
          if (id === AppScreenID.WealthDashboard) {
            AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.wealthDashboardLoad, {
              source: 'menu',
            });
          }
          NavigationServiceLib.navigate(id, params);
        }
        close();
      }
      setPath(pathInput);

      if (!paths.length || paths.includes(id)) {
        setHeaderVisible(visible && hasChildren ? false : paths.length - 1 <= 0);
      }
    },
    [setPath, close],
  );

  const onLayout = event => {
    const { width, height } = event.nativeEvent.layout;
    if (!box) {
      setBox({
        width,
        height,
      });
    }
  };

  const opacity = animateNative.current.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[styles.container, insets.top > 0 && { paddingTop: insets.top }]}>
      {headerVisible && (
        <Animated.View style={[AppStyle.middleContent, AppStyle.padY20, { opacity }]}>
          <View style={styles.logoContainer} onLayout={onLayout}>
            <Image
              source={require('assets/images/secondary-logo-1.png')}
              style={[
                styles.logo,
                {
                  width: box?.width ?? 0,
                },
              ]}
            />
            <TextField style={styles.sloganText} type="paragraph-2">
              {t(`${i18nScope}.slogan`)}
            </TextField>
          </View>
        </Animated.View>
      )}
      <View style={[AppStyle.flex1, styles.body, AppStyle.padX15, AppStyle.padTop30]}>
        <ScrollView
          style={AppStyle.flex1}
          contentContainerStyle={AppStyle.menuPaddingBottom}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}>
          <TouchableField
            onPress={() => {
              NavigationServiceLib.navigate(AppScreenID.ProfileSetting);
              close();
            }}>
            <View style={[AppStyle.rowFlex, AppStyle.padX15]}>
              <Avatar
                style={{
                  containerStyle: styles.avatarContainer,
                  smallCircleStyle: styles.smallCircle,
                }}
                size={60}
                linearGradient={false}>
                {/* <FontAwesome5Icon name="user-alt" size={24} color={styles.avatar.color} /> */}
              </Avatar>
              <View style={[AppStyle.marginLeft15, AppStyle.justifyContent]}>
                <TextField type="heading-2">
                  {t(`${i18nScope}.hello`)}, {user?.firstName}
                </TextField>
                <TextField type="paragraph-2">{user?.email}</TextField>
              </View>
            </View>
          </TouchableField>

          <View style={[AppStyle.flex1, AppStyle.marginTop20]}>
            <AccordionMenu onPressMenu={onPressMenu} />
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
}

export default MenuScreen;
