import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  PixelRatio,
  SectionList,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import Header from 'components/layouts/Header';
import TextField from 'components/basics/TextField';
import DashedLine from 'components/basics/DashedLine';
import FloatingButton from 'components/basics/FloatingButton';
//
import moment from 'moment';
import { useDispatchResolve } from 'libs/hooks';
import {
  useThemedStyle,
  useOnBackScreenHandler,
  useOnScreenRefresh,
  withBackHandler,
} from 'providers';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { NavigationServiceLib } from 'libs';
import { AppConstants, AppScreenID } from 'constant';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
//
import { getListGoals, getGoalsUntilYear } from 'store/PersonalGoals/action';
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout';
import getModule from 'store/PersonalGoals/module';
import {
  selectListYearOptions,
  selectGroupGoals,
  selectListPersonalGoals,
  selectIsFetchedList,
} from 'store/PersonalGoals/selector';
import { selectAppPreference } from 'store/Root/selector';
import { AppSize, AppStyle } from 'theme';
import { head, get, findIndex, findLastIndex, last } from 'lodash';
import Condition from 'components/basics/Condition';
import { compose } from 'redux';

import { GoalCard, SelectYearHeader, Loader, NoGoalAdded } from './components';
import themedStyles from './styles';

const i18nScope = 'screens.personalGoal.verticalTimeline';
const FIRST_PAGE_INDEX = 1;
const ITEM_LAYOUT = {
  itemWidth: AppSize.screen.width,
  itemHeight: 92,
  headerWidth: AppSize.screen.width,
  headerHeight: 40,
};
const VIEWABILITY_CONFIG = {
  waitForInteraction: true,
  viewAreaCoveragePercentThreshold: 100,
};
const LIST_SCREENS_KEEP_STATUS = [AppScreenID.AddPersonalGoal, AppScreenID.EditPersonalGoal];

function VerticalTimelineScreen() {
  useOnBackScreenHandler();
  const dispatchResolve = useDispatchResolve();
  const { screenRefreshId } = useOnScreenRefresh();
  const { pagination } = useSelector(selectAppPreference);
  const yearOptions = useSelector(selectListYearOptions);
  const listGroupGoals = useSelector(selectGroupGoals);
  const isFetchedList = useSelector(selectIsFetchedList);
  const currentYear = new Date().getFullYear();

  const personalGoalsData = useSelector(selectListPersonalGoals);
  const { t } = useTranslation(AppConstants.defaultLanguageNamespace);
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { verticalTimeLinePageSize: LIMIT } = pagination;

  const sectionListRef = useRef(null);
  const flagRef = useRef(null);
  const enableSelfScrollRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { page: pageIndex } = personalGoalsData;
  const selectedYear = useMemo(() => yearOptions[currentIndex], [currentIndex, yearOptions]);
  const isAllLoadedData = pageIndex * LIMIT >= personalGoalsData.total;
  const isEmptyList = listGroupGoals.length === 0;
  const [scrollToSectionTitle, setScrollToSectionTitle] = useState('');
  const [layoutList, setLayoutList] = useState({ height: 0, width: 0 });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchResolve(getListGoals({ page: FIRST_PAGE_INDEX, limit: LIMIT })).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve, LIMIT]);

  const scrollToTodaySeperator = useCallback(() => {
    // scroll to today section
    enableSelfScrollRef.current = true;
    setScrollToSectionTitle('');
    setTimeout(() => {
      setScrollToSectionTitle(moment().format('YYYY-MM-DD')); // today
    }, 50);
  }, []);

  useEffect(() => {
    if (screenRefreshId) {
      const currentRoute = NavigationServiceLib.getCurrentRoute();
      if (!LIST_SCREENS_KEEP_STATUS.includes(currentRoute) && isFetchedList) {
        let index = yearOptions.findIndex(i => i?.value?.toString() === currentYear.toString());
        if (index === -1) {
          index = 0;
        }
        setCurrentIndex(index);
        scrollToTodaySeperator();
        return () => {};
      }
    }
  }, [screenRefreshId, isFetchedList, scrollToTodaySeperator, yearOptions, currentYear]);

  useLayoutEffect(() => {
    dispatchResolve(getListGoals({ page: FIRST_PAGE_INDEX, limit: LIMIT })).then(resData => {
      const lastYear = resData.data?.find(i => moment(i.dueDate).get('years') === currentYear - 1);
      if (lastYear) {
        scrollToTodaySeperator();
      } else {
        dispatchResolve(getGoalsUntilYear({ selectYear: currentYear - 1 })).then(() => {
          scrollToTodaySeperator();
        });
      }
    });
  }, [LIMIT, currentYear, dispatchResolve, scrollToTodaySeperator]);

  // scrolling after the layout be updated with new items
  useEffect(() => {
    if (
      scrollToSectionTitle &&
      enableSelfScrollRef.current &&
      layoutList.height &&
      listGroupGoals.length
    ) {
      flagRef.current = true;
      enableSelfScrollRef.current = false;
      const sectionIndex = listGroupGoals.findIndex(i => i.title === scrollToSectionTitle);
      if (sectionIndex !== -1) {
        sectionListRef.current?.scrollToLocation({
          animated: true,
          sectionIndex,
          itemIndex: 0,
          viewOffset: layoutList.height / 2 - ITEM_LAYOUT.headerHeight,
        });
      }
    }
  }, [scrollToSectionTitle, listGroupGoals, layoutList.height]);

  useEffect(() => {
    let index = yearOptions.findIndex(i => i?.value?.toString() === currentYear.toString());
    if (index === -1) {
      index = 0;
    }
    setCurrentIndex(index);
  }, [currentYear, yearOptions]);

  // functions
  const onPressButtonPlus = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.AddPersonalGoal);
  }, []);

  const onPressItem = useCallback(
    item => () => {
      if (item?._id) {
        NavigationServiceLib.navigate(AppScreenID.EditPersonalGoal, { _id: item._id });
      }
    },
    [],
  );

  const onPressSelectedYear = useCallback(
    yearIndex => {
      setCurrentIndex(yearIndex);
      const yearValue = yearOptions[yearIndex].value;
      const selectedYearIndex = findIndex(
        listGroupGoals,
        i => i.isYearTitle && yearValue === i.year,
      );

      if (selectedYearIndex !== -1) {
        flagRef.current = true;
        sectionListRef.current?.scrollToLocation({
          animated: true,
          sectionIndex: selectedYearIndex,
          itemIndex: 0,
        });
      } else {
        const maxYear = head(listGroupGoals)?.year;
        const minYear = last(listGroupGoals)?.year;
        if (!minYear && !maxYear) {
          return null;
        }
        if (yearValue > maxYear) {
          flagRef.current = true;
          sectionListRef.current?.scrollToLocation({
            animated: true,
            sectionIndex: 0,
            itemIndex: 0,
          });
        }
        if (yearValue < minYear) {
          if (!isAllLoadedData) {
            dispatchResolve(getGoalsUntilYear({ selectYear: yearValue })).then(() => {
              enableSelfScrollRef.current = true;
              setScrollToSectionTitle(yearValue);
            });
          } else {
            flagRef.current = true;
            sectionListRef.current?.scrollToLocation({
              animated: true,
              sectionIndex: listGroupGoals.length - 1,
              itemIndex: 0,
            });
          }
        }
        if (yearValue >= minYear && yearValue <= maxYear) {
          const nearestSelectedYearIndex = findIndex(
            listGroupGoals,
            i => i.isYearTitle && yearValue >= i.year,
          );
          flagRef.current = true;
          sectionListRef.current?.scrollToLocation({
            animated: true,
            sectionIndex: nearestSelectedYearIndex,
            itemIndex: 0,
          });
        }
      }
    },
    [dispatchResolve, isAllLoadedData, listGroupGoals, yearOptions],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      if (flagRef.current) {
        return null;
      }
      const firstViewableItems = head(viewableItems);
      const year = get(firstViewableItems, 'section.year');
      if (year && year !== selectedYear?.value) {
        const index = findLastIndex(yearOptions, (i: any) => year === i.value);
        if (index !== -1) {
          setCurrentIndex(index);
        }
      }
    },
    [selectedYear, yearOptions],
  );

  const keyExtractor = useCallback(item => item._id, []);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={{ height: ITEM_LAYOUT.itemHeight }}>
        <GoalCard item={item} onPress={onPressItem} />
      </View>
    ),
    [onPressItem],
  );

  const renderSectionHeader = useCallback(
    ({ section: { title, isYearTitle, isToday } }) => {
      if (isYearTitle) {
        return (
          <TouchableWithoutFeedback
            onPress={() => {
              const index = yearOptions.findIndex(i => i.display === title);
              if (index) {
                setCurrentIndex(index);
              }
            }}>
            <View
              style={[
                AppStyle.rowFlex,
                AppStyle.alignContent,
                AppStyle.padY5,
                { height: ITEM_LAYOUT.headerHeight },
              ]}>
              <View
                style={[AppStyle.pad5, AppStyle.padY5, AppStyle.marginLeft15, styles.sectionTitle]}>
                <TextField type="captain" font="medium" style={styles.yearText}>
                  {title}
                </TextField>
                <View style={styles.triangle} />
              </View>
              <View style={styles.line} />
            </View>
          </TouchableWithoutFeedback>
        );
      }

      return (
        <View
          style={[
            AppStyle.marginX15,
            AppStyle.rowFlex,
            AppStyle.alignContent,
            AppStyle.padY5,
            styles.sectionHeader,
            { height: ITEM_LAYOUT.headerHeight },
          ]}>
          <View style={[AppStyle.pad5]}>
            {isToday ? (
              <TextField type="captain" font="medium" style={styles.dateGreenText}>
                Today
              </TextField>
            ) : (
              <TextField type="captain" font="medium" style={styles.dateText}>
                {moment(title).format('MMM DD')}
              </TextField>
            )}
          </View>
          <DashedLine
            style={AppStyle.flex1}
            dashColor={isToday ? '#38C976' : '#E6E6E6'}
            dashStyle={undefined}
          />
        </View>
      );
    },
    [styles, yearOptions],
  );

  const onEndReached = () => {
    if (isLoadingMore || refreshing || listGroupGoals.length === 0 || isAllLoadedData) {
      return;
    }
    if (!isAllLoadedData) {
      setIsLoadingMore(true);
      const nextPage = pageIndex + 1;
      dispatchResolve(getListGoals({ page: nextPage, limit: LIMIT })).then(() => {
        setIsLoadingMore(false);
      });
    }
  };

  const ListFooterComponent = useMemo(() => {
    if (isEmptyList) {
      return null;
    }
    if (!isLoadingMore && isAllLoadedData) {
      return (
        <View style={[AppStyle.alignContent, AppStyle.marginTop15]}>
          <TextField type="paragraph-2">{t(`${i18nScope}.loadingFooter.allLoaded`)}</TextField>
        </View>
      );
    }
    return <ActivityIndicator size={'large'} style={AppStyle.marginTop15} />;
  }, [isAllLoadedData, isEmptyList, isLoadingMore, t]);

  return (
    <View style={styles.container}>
      <Header type="full" title={t(`${i18nScope}.title`)} titleBackground={true} />
      {!isFetchedList && <Loader />}
      {isFetchedList && (
        <View style={AppStyle.flex1}>
          <Condition display={listGroupGoals.length > 0}>
            <SelectYearHeader
              key={screenRefreshId}
              currentIndex={currentIndex}
              options={yearOptions}
              onPressItem={onPressSelectedYear}
            />
          </Condition>
          <SectionList
            onLayout={({ nativeEvent }) => {
              setLayoutList({ height: nativeEvent.layout.height, width: nativeEvent.layout.width });
            }}
            ref={sectionListRef}
            showsVerticalScrollIndicator={false}
            sections={listGroupGoals}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={AppStyle.menuPaddingBottom}
            renderItem={renderItem}
            ListEmptyComponent={<NoGoalAdded />}
            stickySectionHeadersEnabled={false}
            keyExtractor={keyExtractor}
            renderSectionHeader={renderSectionHeader}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            initialNumToRender={5}
            windowSize={25}
            viewabilityConfig={VIEWABILITY_CONFIG}
            onViewableItemsChanged={onViewableItemsChanged}
            getItemLayout={sectionListGetItemLayout({
              getItemHeight: () => ITEM_LAYOUT.itemHeight,
              getSeparatorHeight: () => 1 / PixelRatio.get(), // The height of your separators
              getSectionHeaderHeight: () => ITEM_LAYOUT.headerHeight, // The height of your section headers
            })}
            onEndReached={onEndReached}
            onMomentumScrollEnd={() => {
              flagRef.current = false;
            }}
            ListFooterComponent={ListFooterComponent}
            // bounces
          />
          {!isEmptyList && <FloatingButton onPress={onPressButtonPlus} />}
        </View>
      )}
    </View>
  );
}

export default compose(
  withDynamicModuleLoader(getModule()),
  withBackHandler,
)(VerticalTimelineScreen);
