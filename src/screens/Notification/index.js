import { handleDialog } from 'components/basics/CampaignContent';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import ContentLoader from 'components/layouts/ContentLoader';
import Header from 'components/layouts/Header';
import NoDataAvailable from 'components/layouts/NoDataAvailable';
import { AppConstants, AppScreenID } from 'constant';
import screenID from 'constant/screenID';
import { NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { isEmpty, isNil } from 'lodash';
import LottieView from 'lottie-react-native';
import moment from 'moment';
import { useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Image, RefreshControl, View } from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import {
  getCampaign,
  getNotifications,
  markAllAsRead,
  setMarkItAsRead,
} from 'store/Notification/action';
import getModule from 'store/Notification/module';
import {
  selectFetchedDataNotification,
  selectIsFullData,
  selectNotification,
  selectTotalBadge,
} from 'store/Notification/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.notification';

function Notification() {
  const styles = useThemedStyle(themedStyles);
  const { t } = useTranslation();
  const dispatchResolve = useDispatchResolve();
  const fetchedData = useSelector(selectFetchedDataNotification);
  const notificationData = useSelector(selectNotification);
  const isFullData = useSelector(selectIsFullData);
  const totalBadge = useSelector(selectTotalBadge);
  const [refreshing, setRefreshing] = useState(false);
  const [isLazyLoad, setIsLazyLoad] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchResolve(getNotifications({ page: 1 })).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);

  const renderItem = useCallback(({ item }) => <NotificationCard item={item} />, []);
  const keyExtractor = useCallback((_, index) => 'key' + index, []);

  const onEndReached = useCallback(() => {
    if (!isLazyLoad && !isFullData) {
      setIsLazyLoad(true);
      dispatchResolve(getNotifications()).finally(() => {
        setIsLazyLoad(false);
      });
    }
  }, [dispatchResolve, isLazyLoad, isFullData]);

  const markAll = useCallback(() => {
    dispatchResolve(markAllAsRead());
  }, [dispatchResolve]);

  const renderHeader = useCallback(() => {
    if (notificationData.length > 0) {
      return (
        <View
          style={[
            AppStyle.rowFlex,
            AppStyle.padBottom15,
            AppStyle.alignEnd,
            AppStyle.spaceBetweenContent,
          ]}>
          <LottieView
            resizeMode="contain"
            style={styles.blinkOpti}
            source={require('assets/images/optiIcon/blink.json')}
            autoPlay
            loop
          />
          <TouchableField onPress={markAll} disabled={totalBadge === 0}>
            <TextField style={[AppStyle.padTop30, AppStyle.padLeft25]}>
              {t(`${i18nScope}.markAllAsRead`)}
            </TextField>
          </TouchableField>
        </View>
      );
    }
    return <View />;
  }, [notificationData, styles, t, markAll, totalBadge]);

  return (
    <View style={styles.container}>
      <Header type="back" title={t(`${i18nScope}.notificationTitle`)} />
      {!fetchedData && <ContentLoader name="notification" />}
      <FlatList
        data={notificationData}
        // data={mockData}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={isLazyLoad && <ActivityIndicator size={'large'} />}
        ListEmptyComponent={
          <NoDataAvailable
            type="none"
            title={t(`${i18nScope}.emptyNotificationTitle`)}
            description={t(`${i18nScope}.emptyNotificationDescription`)}
          />
        }
        contentContainerStyle={[styles.scrollContent, AppStyle.menuPaddingBottom]}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        updateCellsBatchingPeriod={100} // Increase time between renders
        windowSize={51} // Reduce the window size
        keyExtractor={keyExtractor}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
      />
    </View>
  );
}

export const getNotificationWithType = (item = {}, callback) => {
  const { type, link, ui, backButtonHidden } = item;
  let handledData = {
    icon: require('assets/images/common/calendarNotice.png'),
    screenID: screenID.MonthlyCheckUp,
    onPress: () => {},
  };
  switch (type) {
    case AppConstants.notificationType.MoneySmartsReminder:
      handledData = {
        icon: require('assets/images/common/calendarNotice.png'),
        screenID: screenID.MonthlyCheckUp,
        isHomeScreenReady: true,
        onPress: () => {
          NavigationServiceLib.navigate(screenID.MonthlyCheckUp);
          typeof callback === 'function' && callback();
        },
      };
      break;
    case AppConstants.notificationType.MoneySmartsTargetedSurplus:
      handledData = {
        icon: require('assets/images/common/saving.png'),
        screenID: screenID.MonthlyCheckUp,
        isHomeScreenReady: true,
        onPress: () => {
          NavigationServiceLib.navigate(screenID.MonthlyCheckUp);
          typeof callback === 'function' && callback();
        },
      };
      break;
    case AppConstants.notificationType.PersonalGoals:
      handledData = {
        icon: require('assets/images/common/aim.png'),
        screenID: screenID.VerticalTimeline,
        isHomeScreenReady: true,
        onPress: () => {
          NavigationServiceLib.navigate(screenID.VerticalTimeline);
          typeof callback === 'function' && callback();
        },
      };
      break;
    case AppConstants.notificationType.Wealth:
      handledData = {
        icon: require('assets/images/common/calendarNotice.png'),
        screenID: screenID.WealthDashboard,
        isHomeScreenReady: true,
        onPress: () => {
          NavigationServiceLib.navigate(screenID.WealthDashboard);
          typeof callback === 'function' && callback();
        },
      };
      break;
    case AppConstants.notificationType.Campaign:
      handledData = {
        icon: require('assets/images/common/campaign.png'),
        screenID: screenID.Campaign,
        isHomeScreenReady: true,
        onPress: async () => {
          if (typeof callback === 'function') {
            // call api to get campaign detail
            const campaign = await callback(item);
            handleDialog({ ...campaign, backButtonHidden });
          }
        },
      };
      break;
    case AppConstants.notificationType.Link:
      handledData = {
        icon: 'info-circle',
        screenID: null,
        isHomeScreenReady: true,
        onPress: () => {
          link && UtilLib.openInAppBrowserLink(link);
          typeof callback === 'function' && callback();
        },
      };
      break;
    case AppConstants.notificationType.UI:
      handledData = {
        icon: 'info-circle',
        screenID: null,
        isHomeScreenReady: true,
        onPress: () => {
          ui && Object.values(AppScreenID).includes(ui) && NavigationServiceLib.navigate(ui);
          typeof callback === 'function' && callback();
        },
      };
      break;
    default:
      break;
  }
  return handledData;
};

function NotificationCard({ item }) {
  const styles = useThemedStyle(themedStyles);
  const { t } = useTranslation();
  const dispatchResolve = useDispatchResolve();

  const dateText = useMemo(() => {
    const a = moment(item?.createdDate).calendar(null, {
      sameDay: function () {
        return '[' + moment(item?.createdDate).fromNow() + ']';
      },
      lastDay: `[${t(`${i18nScope}.yesterdayAt`)}] HH:mm`,
      lastWeek: function () {
        return `dddd [ ${t(`${i18nScope}.at`)} ] HH:mm`;
      },
      sameElse: function () {
        return `MMM DD, YYYY [ ${t(`${i18nScope}.at`)} ] HH:mm`;
      },
    });

    return a;
  }, [item, t]);

  const onPress = useCallback(
    notification => {
      if (!notification?.isRead) {
        dispatchResolve(setMarkItAsRead(notification));
      }
      getNotificationWithType(notification, async _item => {
        if (
          _item &&
          _item.type === AppConstants.notificationType.Campaign &&
          !isEmpty(_item.campaignId)
        ) {
          const campaign = await dispatchResolve(getCampaign({ campaignId: _item.campaignId }));
          return campaign;
        }
        return null;
      }).onPress();
    },
    [dispatchResolve],
  );

  if (!item) {
    return null;
  }

  return (
    <View style={[styles.cardContainer, !item.isRead && styles.cardUnReadContainer]}>
      <TouchableField style={styles.cardTouchable} onPress={() => onPress(item)}>
        <View style={styles.cardImage}>
          {!isEmpty(item.icon) && item.icon?.toString()?.startsWith('http') ? (
            <Image source={{ uri: item.icon }} resizeMode="contain" style={styles.image} />
          ) : typeof getNotificationWithType(item).icon === 'number' ? (
            <Image source={getNotificationWithType(item).icon} resizeMode="contain" />
          ) : typeof getNotificationWithType(item).icon === 'string' ? (
            <FontAwesome5Icon name={getNotificationWithType(item).icon} style={styles.icon} />
          ) : null}
        </View>
        <View style={styles.cardContent}>
          {!isNil(item?.body) ? (
            <View>
              <TextField type="heading-4">{item?.body}</TextField>
            </View>
          ) : null}
          {!isNil(dateText) ? (
            <View style={styles.cardTimeContainer}>
              <Ionicons
                name="time-outline"
                style={styles.cardTimeIcon}
                size={styles.cardTimeIcon.width}
              />
              <TextField type="captain">{dateText}</TextField>
            </View>
          ) : null}
        </View>
      </TouchableField>
    </View>
  );
}

export default compose(withBackHandler, withDynamicModuleLoader([getModule()]))(Notification);
