import { useFocusEffect } from '@react-navigation/core';
import i18n from 'bootstrap/i18n';
import ButtonField from 'components/basics/ButtonField';
import FinancialCardTopTab from 'components/basics/FinancialCardTopTab';
import FinancialGraph from 'components/basics/FinancialGraph';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import ContentLoader from 'components/layouts/ContentLoader';
import Header from 'components/layouts/Header';
import NoDataAvailable from 'components/layouts/NoDataAvailable';
import { AppConstants } from 'constant';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { formatDateTime } from 'libs/util';
import { get } from 'lodash';
import moment from 'moment';
import { useOnBackButtonPress, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Platform, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import AddNewAssetStep4 from 'screens/AddAsset/components/step/AddNewAssetStep4';
import OffsetBalance from 'screens/EditAsset/components/OffsetBalance';
import { ArchiveModalContent } from 'screens/FinancialDashboard/components';
import { updateTime } from 'screens/HistoricalLog';
import { getDetailAsset, updateData } from 'store/Asset/action';
import getModule from 'store/Asset/module';
import { selectAssetType, selectData } from 'store/Asset/selector';
import { getCurrentTime } from 'store/Auth/action';
import { selectFlags } from 'store/Auth/selector';
import * as financialDashboardActions from 'store/FinancialDashboard/action';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.asset';
const i18nScopeForm = 'forms.asset';
const i18nScopeFinancialForm = 'screens.financialDashboard';

export const ArchiveLabel = ({ item, restoreAsAt, date, onSubmit, relatedAsset }) => {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const formatDateString = 'DD/MM/YYYY';
  const formatDateStringText = 'Do MMM YYYY';
  if (date === undefined) {
    return <></>;
  }
  const archiveDate = formatDateTime(new Date(date), formatDateString);
  const archiveDataText = formatDateTime(new Date(date), formatDateStringText);
  const onPressRestore = () => {
    if (item.assetId && relatedAsset?.data?.isArchived) {
      const title = t(`${i18nScopeFinancialForm}.restoreTitleLinkedAsseteCard`);
      const content = t(`${i18nScopeFinancialForm}.restoreContentLinkedAsseteCard`);
      GlobalLib.CustomModal.get().show({
        onBackdropPress: GlobalLib.CustomModal.get().hide,
        onRequestClose: GlobalLib.CustomModal.get().hide,
        body: (
          <View style={[AppStyle.alignContent, AppStyle.padX20]}>
            <TextField
              font="semi-bold"
              type="heading-3"
              style={[AppStyle.textCenter, styles.titleColor]}>
              {title}
            </TextField>
            <TextField style={[AppStyle.textCenter, AppStyle.marginY15]}>{content}</TextField>
            <ButtonField
              text={t('global.close')}
              style={[]}
              onPress={() => GlobalLib.CustomModal.get().hide()}
            />
          </View>
        ),
      });
      return;
    }

    const title = t(`${i18nScopeFinancialForm}.restoreTitle`);
    const content = t(`${i18nScopeFinancialForm}.restoreContent`);
    const content2 = t(`${i18nScopeFinancialForm}.restoreContent2`);
    const dateLabelText = t(`${i18nScopeFinancialForm}.restoreDateLabelText`);
    const submitText = t(`${i18nScopeFinancialForm}.next`);
    GlobalLib.CustomModal.get().show({
      onBackdropPress: GlobalLib.CustomModal.get().hide,
      onRequestClose: GlobalLib.CustomModal.get().hide,
      body: (
        <ArchiveModalContent
          title={title}
          content={content}
          content2={content2}
          content3={
            <TextField>
              {`${t(`${i18nScopeFinancialForm}.restoreContent3`)} - `}
              <TextField font="bold">{archiveDataText}</TextField>
            </TextField>
          }
          card={item}
          onCancel={GlobalLib.CustomModal.get().hide}
          onSubmit={({ asAt }) => {
            typeof onSubmit === 'function' && onSubmit({ asAt });
            GlobalLib.CustomModal.get().hide();
          }}
          dateLabelText={dateLabelText}
          submitText={submitText}
          minDate={new Date(date)}
          hideLinkedCards
          date={restoreAsAt ? new Date(restoreAsAt) : new Date()}
        />
      ),
    });
  };
  return (
    <View style={AppStyle.marginX20}>
      {!restoreAsAt && (
        <View style={[AppStyle.marginBottom20, styles.archiveLabelContainer]}>
          <TextField type="paragraph-2" style={styles.archiveLabelText}>
            {[t(`${i18nScopeFinancialForm}.archived`), archiveDate].join(' - ')}
          </TextField>
        </View>
      )}
      <View style={AppStyle.marginBottom20}>
        <ButtonField
          type="medium-primary"
          text={
            restoreAsAt
              ? t(`${i18nScopeFinancialForm}.restoring`) +
                ` ${formatDateTime(new Date(restoreAsAt), formatDateString)}`
              : t(`${i18nScopeFinancialForm}.restoreCard`)
          }
          disabled={restoreAsAt}
          onPress={() => {
            if (restoreAsAt) {
              return;
            }
            onPressRestore();
          }}
        />
      </View>
    </View>
  );
};
function EditAsset({ route }) {
  const { t } = useTranslation();
  const { item, onPressArchive, onPressDelete } = route?.params;
  const openDetailsTab = get(route, 'params.openDetailsTab', false);
  const assetType = useSelector(selectAssetType);
  const editData = useSelector(selectData);
  // console.log('🚀 ~ EditAsset ~ editData:', JSON.stringify(editData, null, 2));
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatch = useDispatchResolve();
  const isArchived = useMemo(() => {
    if (editData) {
      return editData?.isArchived;
    }
    return item?.isArchived;
  }, [item, editData]);
  const isOffset = editData?.accountType === 'Offset';

  const getOffsetBenefit = !isArchived && isOffset;

  const [isEdited, setIsEdited] = useState(false);
  const [restoreAsAt, setRestoreAsAt] = useState(null);
  const [loaded, setLoaded] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const createdAt = useRef();
  const { mobileCardTabsInsights, insightsMobileOvertimeChart, insightsMobileOffsetBenefit } =
    useSelector(selectFlags);
  const defaultIndex = insightsMobileOvertimeChart
    ? 0
    : mobileCardTabsInsights
    ? openDetailsTab
      ? 1
      : 0
    : 1;
  const [index, setIndex] = useState(defaultIndex);

  const reload = useCallback(() => {
    const historicalLog = GlobalLib.HistoricalLog.get();
    const updatedAt = get(historicalLog, 'updatedAt');
    const newHistoricalLog = updatedAt && moment(createdAt.current).isBefore(updatedAt);
    if (createdAt.current && !newHistoricalLog) {
      return;
    }
    setLoaded(false);
    Promise.all([dispatch(getDetailAsset(item)), dispatch(getCurrentTime())]).then(() => {
      setLoaded(true);
      setIsEdited(false);
    });
    createdAt.current = moment();
  }, [dispatch, item]);

  useOnBackButtonPress(() => handleGoBack());
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const handleGoBack = useCallback(() => {
    if (!isEdited) {
      NavigationServiceLib.pop();
      return;
    }
    GlobalLib.ConfirmModal.get().show({
      title: t(`${i18nScopeForm}.cancelConfirmation`),
      content: t(`${i18nScopeForm}.areYouSureCancelEditAsset`),
      onConfirm: () => {
        NavigationServiceLib.pop();
      },
    });
  }, [isEdited, t]);

  const onPressDeleteDefault = useCallback(
    (itemValue, callback = () => {}) => {
      const hasNoDirectLinks =
        itemValue?.linkedIncomeExpenses == null || itemValue?.linkedIncomeExpenses?.length === 0;

      const isPropertyInvestmentCard =
        itemValue?.type === AppConstants.AssetType.Property ||
        itemValue?.type === AppConstants.AssetType.Investments;

      const cardName =
        isPropertyInvestmentCard && !hasNoDirectLinks
          ? `${itemValue?.name} ${AppConstants.cardCategory.Asset}`
          : itemValue?.name;
      const title = i18n.t(`${i18nScopeFinancialForm}.modalDeleteTitle`, { cardName });
      const content = i18n.t(`${i18nScopeFinancialForm}.modalDeleteContent`);
      const content2 = hasNoDirectLinks
        ? null
        : i18n.t(`${i18nScopeFinancialForm}.modalDeleteContent2`);
      const dateLabelText = i18n.t(`${i18nScopeFinancialForm}.archiveDateLabelText`);
      const submitText = i18n.t(`${i18nScopeFinancialForm}.delete`);
      GlobalLib.CustomModal.get().show({
        onBackdropPress: GlobalLib.CustomModal.get().hide,
        onRequestClose: GlobalLib.CustomModal.get().hide,
        body: (
          <ArchiveModalContent
            hideLinkedCards
            title={title}
            content={content}
            content2={content2}
            card={itemValue}
            onCancel={GlobalLib.CustomModal.get().hide}
            onSubmit={() => {
              const payload = {
                item: itemValue,
              };
              dispatch(financialDashboardActions.deleteFinancialCardItem(payload)).then(() => {
                callback();
              });
              GlobalLib.CustomModal.get().hide();
            }}
            dateLabelText={dateLabelText}
            type="delete"
            hideAsAt
            submitText={submitText}
          />
        ),
      });
    },
    [dispatch],
  );

  const onPressArchiveDefault = useCallback(
    async (itemValue, callback = () => {}) => {
      const latestAsAt = await dispatch(
        financialDashboardActions.getLatestAsAt({ cardId: itemValue?.id?.[0] }),
      );
      const title = i18n.t(`${i18nScopeFinancialForm}.archiveTitle`);
      const content = i18n.t(`${i18nScopeFinancialForm}.archiveContent`);
      const content2 = i18n.t(`${i18nScopeFinancialForm}.archiveContent2`);
      const content4 = '';
      const latestAsAtError = i18n.t(`${i18nScopeFinancialForm}.archiveLatestAsAtError`);
      const dateLabelText = i18n.t(`${i18nScopeFinancialForm}.archiveDateLabelText`);
      const submitText = i18n.t(`${i18nScopeFinancialForm}.archive`);

      GlobalLib.CustomModal.get().show({
        onBackdropPress: GlobalLib.CustomModal.get().hide,
        onRequestClose: GlobalLib.CustomModal.get().hide,
        body: (
          <ArchiveModalContent
            hideLinkedCards
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
              dispatch(financialDashboardActions.archiveFinancialCardItem(payload)).then(() => {
                callback();
              });
              GlobalLib.CustomModal.get().hide();
            }}
            dateLabelText={dateLabelText}
            submitText={submitText}
          />
        ),
      });
    },
    [dispatch],
  );

  const scrollY = useRef(new Animated.Value(0)).current;
  const animatedHeight = useRef(new Animated.Value(40)).current;
  const topBarHeight = useRef(new Animated.Value(1)).current;
  const topBarVisibleRef = useRef(true);
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: event => {
      const offsetY = event.nativeEvent.contentOffset.y;
      if (Platform.OS === 'android') {
        const velocityY = event.nativeEvent.velocity?.y ?? 0;
        if (topBarVisibleRef.current) {
          if (offsetY > 50 && velocityY > 0) {
            UtilLib.animateTopBar(topBarHeight, 0, animatedHeight, 0, ({ finished }) => {
              if (finished) {
                topBarVisibleRef.current = false;
              }
            });
          }
        } else {
          if (offsetY <= 0 && velocityY <= 0) {
            UtilLib.animateTopBar(topBarHeight, 1, animatedHeight, 40, ({ finished }) => {
              if (finished) {
                topBarVisibleRef.current = true;
              }
            });
          }
        }
      } else {
        if (offsetY > 50) {
          UtilLib.animateTopBar(topBarHeight, 0, animatedHeight, 0);
        } else {
          if (offsetY <= 0) {
            UtilLib.animateTopBar(topBarHeight, 1, animatedHeight, 40);
          }
        }
      }
    },
  });

  const renderTabViewContent = () => {
    if (insightsMobileOvertimeChart) {
      switch (index) {
        case 2: {
          return (
            <NoDataAvailable
              type="none"
              title={t('components.noDataAvailable.title')}
              description={t('components.noDataAvailable.noDataAvailable')}
            />
          );
        }
        case 1: {
          if (item?.id && item?.type !== AppConstants.AssetType.LifeInsurance) {
            return (
              <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={AppStyle.padBottom20}>
                <FinancialGraph
                  {...{
                    cardId: item?.id?.[0],
                    graphTitle:
                      item?.type === AppConstants.AssetType.BankAccounts
                        ? 'CURRENT BALANCE'
                        : 'CURRENT VALUE',
                    timeList: AppConstants.listFilterChart,
                    type: AppConstants.cardCategory.Asset,
                    getOffsetBenefit,
                  }}
                />
                {!isArchived &&
                  item?.type === AppConstants.AssetType.BankAccounts &&
                  insightsMobileOffsetBenefit && <OffsetBalance />}
              </KeyboardAwareScrollView>
            );
          }
          return (
            <NoDataAvailable
              type="none"
              title={t('components.noDataAvailable.title')}
              description={t('components.noDataAvailable.noDataAvailable')}
            />
          );
        }
        case 0: {
          if (assetType && loaded) {
            return (
              <View style={AppStyle.flex1}>
                {isArchived || restoreAsAt ? (
                  <ArchiveLabel
                    date={editData?.archivedDate}
                    item={item}
                    onSubmit={async ({ asAt }) => {
                      setRestoring(true);
                      await dispatch(
                        financialDashboardActions.restoreFinancialCardItem({ item, asAt }),
                      );
                      await dispatch(getDetailAsset(item));
                      setRestoreAsAt(asAt);
                      setIsEdited(true);
                      setRestoring(false);
                    }}
                    restoreAsAt={restoreAsAt}
                  />
                ) : null}
                {restoring ? (
                  <ContentLoader name="asset_detail" />
                ) : (
                  <AddNewAssetStep4
                    editData={editData}
                    upDateData={data => dispatch(updateData(data))}
                    onCancel={handleGoBack}
                    onEdit={() => setIsEdited(true)}
                    disabled={restoreAsAt ? false : isArchived}
                    restoring={restoreAsAt}
                    onReload={() => reload()}
                    onScroll={handleScroll}
                  />
                )}
              </View>
            );
          }
          return <ContentLoader name="asset_detail" />;
        }
        default: {
          return null;
        }
      }
    } else {
      switch (index) {
        case 2: {
          return (
            <NoDataAvailable
              type="none"
              title={t('components.noDataAvailable.title')}
              description={t('components.noDataAvailable.noDataAvailable')}
            />
          );
        }
        case 1: {
          if (assetType && loaded) {
            return (
              <View style={AppStyle.flex1}>
                {isArchived || restoreAsAt ? (
                  <ArchiveLabel
                    date={editData?.archivedDate}
                    item={item}
                    onSubmit={async ({ asAt }) => {
                      setRestoring(true);
                      await dispatch(
                        financialDashboardActions.restoreFinancialCardItem({ item, asAt }),
                      );
                      await dispatch(getDetailAsset(item));
                      setRestoreAsAt(asAt);
                      setIsEdited(true);
                      setRestoring(false);
                    }}
                    restoreAsAt={restoreAsAt}
                  />
                ) : null}
                {restoring ? (
                  <ContentLoader name="asset_detail" />
                ) : (
                  <AddNewAssetStep4
                    editData={editData}
                    upDateData={data => dispatch(updateData(data))}
                    onCancel={handleGoBack}
                    onEdit={() => setIsEdited(true)}
                    disabled={restoreAsAt ? false : isArchived}
                    restoring={restoreAsAt}
                    onReload={() => reload()}
                    onScroll={handleScroll}
                  />
                )}
              </View>
            );
          }
          return <ContentLoader name="asset_detail" />;
        }
        case 0: {
          return (
            <NoDataAvailable
              type="none"
              title={t('components.noDataAvailable.title')}
              description={t('components.noDataAvailable.noDataAvailable')}
            />
          );
        }
        default: {
          return null;
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Header
        type="full"
        title={item?.name}
        style={styles.headerPadding}
        onBackHeader={() => handleGoBack()}
        numberOfLines={1}
      />
      <FinancialCardTopTab
        height={animatedHeight}
        topBarHeight={topBarHeight}
        type={AppConstants.cardCategory.Asset}
        assetType={item?.type}
        tabIndex={index}
        onChangeTab={idx => setIndex(idx)}
        isArchived={isArchived}
        onArchived={async () => {
          const result = await dispatch(getDetailAsset(item));
          item.linkedIncomeExpenses = [
            ...(result?.expensesData
              ? result?.expensesData?.map(e => ({ ...e, type: 'expense' }))
              : []),
            ...(result?.incomesData
              ? result?.incomesData?.map(e => ({ ...e, type: 'income' }))
              : []),
          ];
          if (isEdited) {
            GlobalLib.ConfirmModal.get().show({
              title: t(`${i18nScopeForm}.cancelConfirmation`),
              content: t(`${i18nScopeForm}.areYouSureCancelEditAsset`),
              onConfirm: () => {
                setTimeout(() => {
                  typeof onPressArchive === 'function'
                    ? onPressArchive(item, () => {
                        setRestoreAsAt(null);
                        setIsEdited(false);
                        updateTime();
                        reload();
                      })
                    : onPressArchiveDefault(item, () => {
                        setRestoreAsAt(null);
                        setIsEdited(false);
                        updateTime();
                        reload();
                      });
                }, 500);
              },
            });
          } else {
            setTimeout(() => {
              typeof onPressArchive === 'function'
                ? onPressArchive(item, () => {
                    setRestoreAsAt(null);
                    setIsEdited(false);
                    updateTime();
                    reload();
                  })
                : onPressArchiveDefault(item, () => {
                    setRestoreAsAt(null);
                    setIsEdited(false);
                    updateTime();
                    reload();
                  });
            }, 500);
          }
        }}
        onDelete={async () => {
          const result = await dispatch(getDetailAsset(item));
          item.linkedIncomeExpenses = [
            ...(result?.expensesData
              ? result?.expensesData?.map(e => ({ ...e, type: 'expense' }))
              : []),
            ...(result?.incomesData
              ? result?.incomesData?.map(e => ({ ...e, type: 'income' }))
              : []),
          ];
          if (isEdited) {
            GlobalLib.ConfirmModal.get().show({
              title: t(`${i18nScopeForm}.cancelConfirmation`),
              content: t(`${i18nScopeForm}.areYouSureCancelEditAsset`),
              onConfirm: () => {
                setTimeout(() => {
                  typeof onPressDelete === 'function'
                    ? onPressDelete(item, () => {
                        NavigationServiceLib.pop();
                      })
                    : onPressDeleteDefault(item, () => {
                        NavigationServiceLib.pop();
                      });
                }, 500);
              },
            });
          } else {
            setTimeout(() => {
              typeof onPressDelete === 'function'
                ? onPressDelete(item, () => {
                    NavigationServiceLib.pop();
                  })
                : onPressDeleteDefault(item, () => {
                    NavigationServiceLib.pop();
                  });
            }, 500);
          }
        }}
      />
      {renderTabViewContent()}
    </View>
  );
}

export default compose(withBackHandler, withDynamicModuleLoader(getModule()))(EditAsset);
