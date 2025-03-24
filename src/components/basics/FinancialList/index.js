import { useIsFocused, useRoute } from '@react-navigation/core';
import Condition from 'components/basics/Condition';
import { KeyboardAwareSectionList } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import { getMenuBoxHeight } from 'components/layouts/MenuLayout/MenuButton';
import NoDataAvailable from 'components/layouts/NoDataAvailable';
import { AppConstants, AppScreenID } from 'constant';
import { GlobalLib, NavigationServiceLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { get, isBoolean } from 'lodash';
import { useOnScreenRefresh, useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import {
  ArchiveModalContent,
  FilteringModal,
  FinancialCardItem,
  Loader,
  SectionHeader,
} from 'screens/FinancialDashboard/components';
//ExpenseDashboard
import * as expenseDashboardActions from 'store/ExpenseDashboard/action';
import * as expenseDashboardSelectors from 'store/ExpenseDashboard/selector';
import * as financialDashboardActions from 'store/FinancialDashboard/action';
import * as financialDashboardSelectors from 'store/FinancialDashboard/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'screens.financialDashboard';
export const FILTER_FIELDS = {
  BORROWINGS: 'borrowings',
  ASSETS: 'assets',
  INCOME: 'income',
  EXPENSE: 'expense',
  ARCHIVED: 'archived',
};
export const FINANCIAL_LIST_TYPE = {
  BORROWINGS: 'borrowings',
  ASSETS: 'assets',
  INCOME: 'income',
  EXPENSE: 'expense',
  ALL: 'ALL',
  ARCHIVED: 'archived',
};

const LIST_SCREENS_KEEP_STATUS = [
  AppScreenID.AddAsset,
  AppScreenID.EditAsset,
  AppScreenID.AddExpense,
  AppScreenID.EditExpense,
  AppScreenID.Income,
  AppScreenID.Borrowing,
];

function FinancialList({
  type = FINANCIAL_LIST_TYPE.ALL,
  ListHeaderComponent,
  ListEmptyComponent,
  isEmptyData,
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { screenRefreshId } = useOnScreenRefresh();
  const menuHeight = getMenuBoxHeight(insets);
  const isFocused = useIsFocused();
  const dispatchResolve = useDispatchResolve();
  const MyFINANCIALSRef = useRef(null);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);

  const collectFinancialList = useMemo(() => {
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        return expenseDashboardSelectors.selectFinancialCardData;

      default:
        return financialDashboardSelectors.selectFinancialCardData;
    }
  }, [type]);
  const collectCurrentPage = useMemo(() => {
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        return expenseDashboardSelectors.selectCurrentPageFinancialList;

      default:
        return financialDashboardSelectors.selectCurrentPageFinancialList;
    }
  }, [type]);
  const collectIsAllLoaded = useMemo(() => {
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        return expenseDashboardSelectors.selectIsAllLoadedFinancialList;

      default:
        return financialDashboardSelectors.selectIsAllLoadedFinancialList;
    }
  }, [type]);
  const collectIsReadyList = useMemo(() => {
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        return expenseDashboardSelectors.selectIsFetchedFinancialDashboard;

      default:
        return financialDashboardSelectors.selectIsFetchedFinancialDashboard;
    }
  }, [type]);
  const collectSearchParams = useMemo(() => {
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        return expenseDashboardSelectors.selectFetchParams;

      default:
        return financialDashboardSelectors.selectFetchParams;
    }
  }, [type]);
  const collectFilterFields = useMemo(() => {
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        return expenseDashboardSelectors.selectFilterFields;

      default:
        return financialDashboardSelectors.selectFilterFields;
    }
  }, [type]);

  const financialCardList = useSelector(collectFinancialList);
  const currentPage = useSelector(collectCurrentPage);
  const isAllLoaded = useSelector(collectIsAllLoaded);
  const isReadyList = useSelector(collectIsReadyList);
  const searchParams = useSelector(collectSearchParams);
  const filterFields = useSelector(collectFilterFields);

  const scrollRef = useRef(null);
  const scrollEndOffset = useRef(0);
  const swipeListRef = useRef({});

  useEffect(() => {
    const scrollToMyFINANCIALS = get(route, 'params.scrollToMyFINANCIALS');
    if (scrollToMyFINANCIALS) {
      setTimeout(() => {
        scrollRef.current.scrollIntoView(MyFINANCIALSRef.current);
      }, 300);
    }
  }, [route]);

  useLayoutEffect(() => {
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        dispatchResolve(expenseDashboardActions.getFinancialStaticValues(true)).finally(() => {
          Promise.all([dispatchResolve(expenseDashboardActions.getFinancialList(true))]);
        });
        break;
      default:
        Promise.all([
          dispatchResolve(
            financialDashboardActions.setFetchParams({
              searchKey: '',
              filter: {
                [FILTER_FIELDS.ASSETS]: [],
                [FILTER_FIELDS.EXPENSE]: [],
                [FILTER_FIELDS.INCOME]: [],
                [FILTER_FIELDS.BORROWINGS]: [],
                [FILTER_FIELDS.ARCHIVED]: [''],
              },
            }),
          ),
          dispatchResolve(
            financialDashboardActions.setSelectedFilterButton([FINANCIAL_LIST_TYPE.ALL]),
          ),
          dispatchResolve(financialDashboardActions.getFinancialList(true)),
          dispatchResolve(financialDashboardActions.getFinancialStaticValues(true)),
        ]);
        // dispatchResolve(financialDashboardActions.getFinancialStaticValues(true)).finally(() => {
        //   Promise.all([dispatchResolve(financialDashboardActions.getFinancialList(true))]);
        // });
        break;
    }
  }, [dispatchResolve, type]);

  useEffect(() => {
    switch (type) {
      case FINANCIAL_LIST_TYPE.ALL:
        if (screenRefreshId) {
          const currentRoute = NavigationServiceLib.getCurrentRoute();
          if (!LIST_SCREENS_KEEP_STATUS.includes(currentRoute)) {
            handleResetSearchFilter();
          }
        }
        break;
      default:
        break;
    }
  }, [screenRefreshId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        Promise.all([
          dispatchResolve(expenseDashboardActions.getFinancialList(true)),
          // dispatchResolve(expenseDashboardActions.getFinancialStaticValues(true)),
        ]).finally(() => {
          setRefreshing(false);
        });
        break;
      default:
        Promise.all([
          dispatchResolve(financialDashboardActions.getFinancialSummary(true)),
          dispatchResolve(financialDashboardActions.getFinancialList(true)),
          dispatchResolve(financialDashboardActions.getFinancialStaticValues(true)),
        ]).finally(() => {
          setRefreshing(false);
        });
        break;
    }
  }, [dispatchResolve, type]);

  const sectionsData = useMemo(
    () => [
      {
        title: t(`${i18nScope}.sectionTitle`),
        data: financialCardList,
      },
    ],
    [financialCardList, t],
  );

  const onPressSearch = useCallback(() => {}, []);

  const onGetData = useCallback(
    (params, enabledSetSelectedFilterButton = false) => {
      const checkedKeys = params.filter ?? {};
      const newSelectedFilterButton = Object.entries(checkedKeys)
        .filter(
          ([key, value]) =>
            (value?.length > 0 &&
              value[0] !== '' &&
              value?.length === filterFields?.[key]?.length) ||
            (key === 'archived' && value?.[0] === 'Archived Cards'),
        )
        .map(keyItem => keyItem?.[0]);
      switch (type) {
        case FINANCIAL_LIST_TYPE.EXPENSE:
          dispatchResolve(expenseDashboardActions.setFetchParams(params));
          dispatchResolve(expenseDashboardActions.resetFetchingFinancialList());
          dispatchResolve(expenseDashboardActions.getFinancialList(true));
          // dispatchResolve(expenseDashboardActions.getFinancialStaticValues(true));
          enabledSetSelectedFilterButton &&
            dispatchResolve(
              expenseDashboardActions.setSelectedFilterButton(newSelectedFilterButton),
            );
          break;
        default:
          dispatchResolve(financialDashboardActions.setFetchParams(params));
          dispatchResolve(financialDashboardActions.resetFetchingFinancialList());
          dispatchResolve(financialDashboardActions.getFinancialList(true));
          dispatchResolve(financialDashboardActions.getFinancialStaticValues(true));
          enabledSetSelectedFilterButton &&
            dispatchResolve(
              financialDashboardActions.setSelectedFilterButton(newSelectedFilterButton),
            );
          break;
      }
    },
    [dispatchResolve, type, filterFields],
  );

  const onPressFilter = useCallback(() => {
    GlobalLib.CustomModal.get().show({
      onBackdropPress: GlobalLib.CustomModal.get().hide,
      onRequestClose: GlobalLib.CustomModal.get().hide,
      hideCloseButton: false,
      body: (
        <FilteringModal
          onSubmit={(checkedValues = {}, isDirty = false) => {
            GlobalLib.CustomModal.get().hide();
            const getListFilters = name => {
              const filters = checkedValues?.[name]
                ? Object.keys(checkedValues[name]).filter(key => checkedValues[name]?.[key])
                : [];
              return filters.length === 0 && isDirty ? [''] : filters;
            };
            const params = {
              filter: {
                [FILTER_FIELDS.ASSETS]: getListFilters(FILTER_FIELDS.ASSETS),
                [FILTER_FIELDS.EXPENSE]: getListFilters(FILTER_FIELDS.EXPENSE),
                [FILTER_FIELDS.INCOME]: getListFilters(FILTER_FIELDS.INCOME),
                [FILTER_FIELDS.BORROWINGS]: getListFilters(FILTER_FIELDS.BORROWINGS),
                [FILTER_FIELDS.ARCHIVED]: [''],
              },
            };
            onGetData(params, true);
            setRefreshing(false);
            setIsLoadMore(false);
          }}
          data={filterFields}
          checkedKeys={searchParams.filter}
        />
      ),
    });
  }, [filterFields, searchParams, onGetData]);

  const onSubmitEditing = useCallback(
    text => {
      const params = {
        searchKey: text,
        filter: null, // remove filter when submit text search
      };
      switch (type) {
        case FINANCIAL_LIST_TYPE.EXPENSE:
          params.filter = searchParams.filter;
          break;

        default:
          break;
      }
      onGetData(params);
      setRefreshing(false);
      setIsLoadMore(false);
    },
    [onGetData, searchParams, type],
  );

  const handleResetSearchFilter = useCallback(() => {
    // reset search and filter
    const params = {
      searchKey: '',
      filter: {
        [FILTER_FIELDS.ASSETS]: [],
        [FILTER_FIELDS.EXPENSE]: [],
        [FILTER_FIELDS.INCOME]: [],
        [FILTER_FIELDS.BORROWINGS]: [],
        [FILTER_FIELDS.ARCHIVED]: [''],
      },
    };
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        params.filter = searchParams.filter;
        break;

      default:
        break;
    }
    onGetData(params, true);
    dispatchResolve(financialDashboardActions.setSelectedFilterButton([FINANCIAL_LIST_TYPE.ALL]));
  }, [type, onGetData, dispatchResolve, searchParams]);

  const isFiltered = useMemo(() => {
    return [
      FINANCIAL_LIST_TYPE.INCOME,
      FINANCIAL_LIST_TYPE.EXPENSE,
      FINANCIAL_LIST_TYPE.ASSETS,
      FINANCIAL_LIST_TYPE.BORROWINGS,
    ].every(financialType => searchParams.filter?.[financialType]?.[0] !== undefined);
  }, [searchParams]);

  const ListFooterComponent = useMemo(() => {
    if (!isReadyList) {
      return <Loader />;
    }
    return (
      <View key={`footer-${screenRefreshId}`} style={{ marginBottom: menuHeight }}>
        <View style={[AppStyle.alignContent, AppStyle.marginTop15, AppStyle.marginBottom30]}>
          <Condition display={!financialCardList.length}>
            <NoDataAvailable
              type="none"
              title={t(`${i18nScope}.emptyCardTitle`)}
              description={t(`${i18nScope}.emptyCardDescription`)}
            />
          </Condition>

          <Condition display={financialCardList.length && isLoadMore && !isAllLoaded}>
            <ActivityIndicator size={'large'} />
          </Condition>

          <Condition display={financialCardList.length && !isLoadMore && isAllLoaded}>
            <TextField type="paragraph-2">{t(`${i18nScope}.loadingFooter.allLoaded`)}</TextField>
          </Condition>

          <View style={styles.bottomBounceBackground} />
        </View>
      </View>
    );
  }, [
    financialCardList,
    isAllLoaded,
    isLoadMore,
    isReadyList,
    menuHeight,
    screenRefreshId,
    styles,
    t,
  ]);

  const onLayout = ({}) => {};

  const renderSectionHeader = useCallback(
    ({ section: { title } }) => {
      const filteredDisabled = Object.values(filterFields).every(values => values.length === 0);
      return (
        <View ref={MyFINANCIALSRef} onLayout={onLayout}>
          <SectionHeader
            key={`section-header-${screenRefreshId}`}
            title={title}
            searchKey={searchParams.searchKey}
            onPressFilter={onPressFilter}
            onPressSearch={onPressSearch}
            onSubmitEditing={onSubmitEditing}
            isFiltered={isFiltered}
            onPressBack={handleResetSearchFilter}
            filteredDisabled={filteredDisabled}
            type={type}
          />
        </View>
      );
    },
    [
      onPressFilter,
      onPressSearch,
      onSubmitEditing,
      searchParams,
      isFiltered,
      screenRefreshId,
      handleResetSearchFilter,
      filterFields,
      type,
    ],
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      const onSwipeOpenBegan = itemValue => {
        const parentId = get(itemValue, 'parentId');
        const id = [get(itemValue, 'id.0', String(index)), ...(parentId ? [parentId] : [])].join(
          '-',
        );
        Object.keys(swipeListRef.current).forEach(key => {
          if (key !== id) {
            swipeListRef.current[key]?.close();
          }
        });
      };

      const onPressDelete = (itemValue, callback = () => {}) => {
        const hasNoDirectLinks =
          itemValue?.linkedIncomeExpenses === null || itemValue?.linkedIncomeExpenses?.length === 0;

        const isPropertyInvestmentCard =
          itemValue?.type === AppConstants.AssetType.Property ||
          itemValue?.type === AppConstants.AssetType.Investments;

        const cardName =
          isPropertyInvestmentCard && !hasNoDirectLinks
            ? `${itemValue?.name} ${AppConstants.cardCategory.Asset}`
            : itemValue?.name;
        const title = t(`${i18nScope}.modalDeleteTitle`, { cardName });
        const content = t(`${i18nScope}.modalDeleteContent`);
        const content2 = hasNoDirectLinks ? null : t(`${i18nScope}.modalDeleteContent2`);
        const dateLabelText = t(`${i18nScope}.archiveDateLabelText`);
        const submitText = t(`${i18nScope}.delete`);
        GlobalLib.CustomModal.get().show({
          onBackdropPress: GlobalLib.CustomModal.get().hide,
          onRequestClose: GlobalLib.CustomModal.get().hide,
          body: (
            <ArchiveModalContent
              title={title}
              content={content}
              content2={content2}
              card={itemValue}
              onCancel={GlobalLib.CustomModal.get().hide}
              onSubmit={() => {
                // const _type = itemValue.cardType === 'expense' ? 'expenses' : itemValue.cardType;
                // dispatchResolve(
                //   financialDashboardActions.deleteFinancialCardItem({ type: _type, item: itemValue }),
                // );
                const payload = {
                  item: itemValue,
                };
                dispatchResolve(financialDashboardActions.deleteFinancialCardItem(payload)).then(
                  () => {
                    onSwipeOpenBegan(itemValue);
                    callback();
                  },
                );
                GlobalLib.CustomModal.get().hide();
              }}
              dateLabelText={dateLabelText}
              type="delete"
              hideAsAt
              submitText={submitText}
            />
          ),
        });
      };

      const onPressArchive = async (itemValue, callback = () => {}) => {
        const latestAsAt = await dispatchResolve(
          financialDashboardActions.getLatestAsAt({ cardId: itemValue?.id?.[0] }),
        );
        // const hasAssetId = itemValue?.assetId;
        const hasNoDirectLinks =
          itemValue?.linkedIncomeExpenses === null || itemValue?.linkedIncomeExpenses?.length === 0;
        const title = t(`${i18nScope}.archiveTitle`);
        const content = t(`${i18nScope}.archiveContent`);
        const content2 = t(`${i18nScope}.archiveContent2`);
        const content4 = !hasNoDirectLinks ? t(`${i18nScope}.archiveContent4`) : '';
        const latestAsAtError = t(`${i18nScope}.archiveLatestAsAtError`);
        const dateLabelText = t(`${i18nScope}.archiveDateLabelText`);
        const submitText = t(`${i18nScope}.archive`);

        // if (hasAssetId) {
        //   GlobalLib.Toast.get().toastWarning(t(`${i18nScope}.archiveWarningArchiveSubCard`));
        //   return;
        // }

        GlobalLib.CustomModal.get().show({
          onBackdropPress: GlobalLib.CustomModal.get().hide,
          onRequestClose: GlobalLib.CustomModal.get().hide,
          body: (
            <ArchiveModalContent
              title={title}
              content={content}
              content2={content2}
              content4={content4}
              latestAsAt={latestAsAt}
              latestAsAtError={latestAsAtError}
              card={itemValue}
              onCancel={GlobalLib.CustomModal.get().hide}
              onSubmit={({ asAt }) => {
                const payload = {
                  item: itemValue,
                  asAt,
                };
                dispatchResolve(financialDashboardActions.archiveFinancialCardItem(payload)).then(
                  () => {
                    onSwipeOpenBegan(itemValue);
                    GlobalLib.CustomModal.get().hide();
                    callback();
                  },
                );
                GlobalLib.CustomModal.get().hide();
              }}
              dateLabelText={dateLabelText}
              submitText={submitText}
            />
          ),
        });
      };

      const onPress = itemValue => {
        switch (itemValue.cardType) {
          case 'borrowings':
            NavigationServiceLib.navigate(AppScreenID.Borrowing, {
              borrowing: itemValue,
              onPressArchive,
              onPressDelete,
            });
            break;
          case 'income':
            NavigationServiceLib.navigate(AppScreenID.Income, {
              income: itemValue,
              onPressArchive,
              onPressDelete,
            });
            break;
          case 'assets':
            NavigationServiceLib.navigate(AppScreenID.EditAsset, {
              item: itemValue,
              onPressArchive,
              onPressDelete,
            });
            break;
          case 'expense':
            NavigationServiceLib.navigate(AppScreenID.EditExpense, {
              item: itemValue,
              onPressArchive,
              onPressDelete,
            });
            break;
          default:
            break;
        }
      };

      return (
        <FinancialCardItem
          data={item}
          onPressDelete={onPressDelete}
          onPressArchive={onPressArchive}
          onSwipeOpenBegan={onSwipeOpenBegan}
          onPress={onPress}
          ref={swipeListRef.current}
          index={index}
        />
      );
    },
    [dispatchResolve, t],
  );

  function onEndReached() {
    if (isAllLoaded || !isReadyList || !isFocused) {
      return;
    }
    if (isLoadMore && refreshing && financialCardList.length === 0) {
      return;
    }
    setIsLoadMore(true);
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        dispatchResolve(
          expenseDashboardActions.getFinancialList(false, true, { page: currentPage + 1 }),
        ).then(() => {
          setIsLoadMore(false);
        });
        break;
      default:
        dispatchResolve(
          financialDashboardActions.getFinancialList(false, true, { page: currentPage + 1 }),
        ).then(() => {
          setIsLoadMore(false);
        });
        break;
    }
  }

  if (
    isReadyList &&
    (isBoolean(isEmptyData) ? isEmptyData : financialCardList?.length === 0) &&
    ListEmptyComponent
  ) {
    return ListEmptyComponent;
  }

  return (
    <KeyboardAwareSectionList
      ref={scrollRef}
      style={AppStyle.flex1}
      scrollsToTop
      stickySectionHeadersEnabled
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          style={styles.refreshContainer}
        />
      }
      keyExtractor={(item, index) => get(item, ['id', 0]) + index}
      onMomentumScrollEnd={({ nativeEvent }) => {
        scrollEndOffset.current = nativeEvent.contentOffset.y;
      }}
      contentContainerStyle={styles.contentList}
      sections={sectionsData}
      renderSectionHeader={renderSectionHeader}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      renderItem={renderItem}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
    />
  );
}
export default FinancialList;
