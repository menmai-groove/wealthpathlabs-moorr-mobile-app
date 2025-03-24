import { useFocusEffect, useRoute } from '@react-navigation/native';
import i18n from 'bootstrap/i18n';
import FinancialCardTopTab from 'components/basics/FinancialCardTopTab';
import FinancialGraph from 'components/basics/FinancialGraph';
import ContentLoader from 'components/layouts/ContentLoader';
import Header from 'components/layouts/Header';
import NoDataAvailable from 'components/layouts/NoDataAvailable';
import { AppConstants } from 'constant';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { get, isEmpty } from 'lodash';
import moment from 'moment';
import { useOnBackButtonPress, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Platform, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import FormAddDetail from 'screens/Borrowing/components/FormAddDetail';
import AddNewBorrowingStep1 from 'screens/Borrowing/components/step/AddNewBorrowingStep1';
import AddNewBorrowingStep1_1 from 'screens/Borrowing/components/step/AddNewBorrowingStep1_1';
import AddNewBorrowingStep2 from 'screens/Borrowing/components/step/AddNewBorrowingStep2';
import AddNewBorrowingStep3 from 'screens/Borrowing/components/step/AddNewBorrowingStep3';
import { ArchiveLabel } from 'screens/EditAsset';
import { ArchiveModalContent } from 'screens/FinancialDashboard/components';
import { updateTime } from 'screens/HistoricalLog';
import { selectFlags } from 'store/Auth/selector';
import { getBorrowingDetail, getLinkedOffsets, updateData } from 'store/Borrowing/action';
import { AddNewBorrowingStep } from 'store/Borrowing/constants';
import getModule from 'store/Borrowing/module';
import {
  selectBorrowingDetails,
  selectBorrowingType,
  selectFetchedData,
} from 'store/Borrowing/selector';
import * as financialDashboardActions from 'store/FinancialDashboard/action';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.borrowing';
const i18nScopeForm = 'forms.borrowing';
const i18nScopeFinancialForm = 'screens.financialDashboard';

function AddNewBorrowing() {
  useOnBackButtonPress(() => handleGoBack());
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();
  const [currentStep, setStep] = useState(AddNewBorrowingStep.Step1);
  const [isEdited, setIsEdited] = useState(false);
  const [restoreAsAt, setRestoreAsAt] = useState(null);
  const [loaded, setLoaded] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [linkedOffsetsBorrowings, setLinkedOffsetsBorrowing] = useState([]);
  const borrowingDetails = useSelector(selectBorrowingDetails);
  const fetchedData = useSelector(selectFetchedData);

  const { mobileCardTabsInsights, insightsMobileOvertimeChart } = useSelector(selectFlags);
  const { params } = useRoute();
  const openDetailsTab = get(params, 'openDetailsTab', false);
  const [index, setIndex] = useState(
    insightsMobileOvertimeChart ? 0 : mobileCardTabsInsights ? (openDetailsTab ? 1 : 0) : 1,
  );

  const borrowingType = useSelector(selectBorrowingType);
  const headerTitle = useMemo(
    () => (!isEmpty(params?.borrowing) ? params?.borrowing?.name : t(`${i18nScope}.headerTitle`)),
    [t, params],
  );
  const borrowing = params?.borrowing;
  const onPressArchive = params?.onPressArchive;
  const onPressDelete = params?.onPressDelete;

  const isArchived = useMemo(() => {
    if (borrowingDetails) {
      return borrowingDetails?.isArchived;
    }
    return borrowing?.isArchived;
  }, [borrowing, borrowingDetails]);
  const createdAt = useRef();

  const reload = useCallback(() => {
    if (params?.borrowing) {
      const historicalLog = GlobalLib.HistoricalLog.get();
      const updatedAt = get(historicalLog, 'updatedAt');
      const newHistoricalLog = updatedAt && moment(createdAt.current).isBefore(updatedAt);
      if (createdAt.current && !newHistoricalLog) {
        return;
      }
      setLoaded(false);
      Promise.all([
        dispatchResolve(getBorrowingDetail({ id: params?.borrowing?.id })),
        dispatchResolve(getLinkedOffsets()),
      ]).then(([, response]) => {
        const linkedOffsetsData = get(response, 'data.me.client.borrowings');
        setLinkedOffsetsBorrowing(linkedOffsetsData);
        setLoaded(true);
      });
      createdAt.current = moment();
    } else {
      setLoaded(false);
      dispatchResolve(getLinkedOffsets()).then(response => {
        const linkedOffsetsData = get(response, 'data.me.client.borrowings');
        setLinkedOffsetsBorrowing(linkedOffsetsData);
        setLoaded(true);
      });
    }
    setIsEdited(false);
  }, [dispatchResolve, params]);

  useFocusEffect(
    useCallback(() => {
      reload();
      return () => {};
    }, [reload]),
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

  const handleNextStep = useCallback(
    data => {
      dispatch(updateData(data));
      switch (currentStep) {
        case AddNewBorrowingStep.Step1:
          if (data?.type === AppConstants.Borrowing.Mortgage) {
            setStep(AddNewBorrowingStep.Step1_1);
          } else {
            setStep(AddNewBorrowingStep.Step2);
          }
          break;
        case AddNewBorrowingStep.Step1_1:
          setStep(AddNewBorrowingStep.Step2);
          break;
        case AddNewBorrowingStep.Step2:
          setStep(AddNewBorrowingStep.Step3);
          break;
        case AddNewBorrowingStep.Step3:
          setStep(AddNewBorrowingStep.FormAddDetail);
          break;
        default:
          break;
      }
    },
    [currentStep, dispatch],
  );

  const onCancel = useCallback(() => {
    if (!isEmpty(params?.borrowing) && !isEdited) {
      NavigationServiceLib.pop();
      return;
    }
    GlobalLib.ConfirmModal.get().show({
      title: t(`${i18nScopeForm}.cancelConfirmation`),
      content: !isEmpty(params?.borrowing)
        ? t(`${i18nScopeForm}.areYouSureCancelEditBorrowing`)
        : t(`${i18nScopeForm}.areYouSureCancelBorrowing`),
      onConfirm: () => {
        NavigationServiceLib.pop();
      },
    });
  }, [params, isEdited, t]);

  const handleGoBack = useCallback(() => {
    switch (currentStep) {
      case AddNewBorrowingStep.Step1_1:
        setStep(AddNewBorrowingStep.Step1);
        break;
      case AddNewBorrowingStep.Step2:
        if (borrowingType === AppConstants.Borrowing.Mortgage) {
          setStep(AddNewBorrowingStep.Step1_1);
        } else {
          setStep(AddNewBorrowingStep.Step1);
        }
        break;
      case AddNewBorrowingStep.Step3:
        setStep(AddNewBorrowingStep.Step2);
        break;
      case AddNewBorrowingStep.FormAddDetail:
        setStep(AddNewBorrowingStep.Step3);
        break;
      case AddNewBorrowingStep.Step1:
        onCancel();
        break;
      default:
        break;
    }
  }, [currentStep, borrowingType, onCancel]);

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
              dispatchResolve(financialDashboardActions.deleteFinancialCardItem(payload)).then(
                () => {
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
    },
    [dispatchResolve],
  );

  const onPressArchiveDefault = useCallback(
    async (itemValue, callback = () => {}) => {
      const latestAsAt = await dispatchResolve(
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
              dispatchResolve(financialDashboardActions.archiveFinancialCardItem(payload)).then(
                () => {
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
    },
    [dispatchResolve],
  );

  useEffect(() => {
    if (params?.nextStepData) {
      handleNextStep(params.nextStepData);
    }
  }, [params]);

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case AddNewBorrowingStep.Step1_1:
        return (
          <AddNewBorrowingStep1_1
            onPress={handleNextStep}
            onCancel={onCancel}
            filter={params?.filter ?? undefined}
          />
        );
      case AddNewBorrowingStep.Step2:
        return <AddNewBorrowingStep2 onPress={handleNextStep} onCancel={onCancel} />;
      case AddNewBorrowingStep.Step3:
        return <AddNewBorrowingStep3 onPress={handleNextStep} onCancel={onCancel} />;
      case AddNewBorrowingStep.FormAddDetail:
        return (
          <FormAddDetail
            onPress={handleNextStep}
            onCancel={onCancel}
            linkedOffsetsBorrowings={linkedOffsetsBorrowings}
            startDate={params?.startDate}
          />
        );
      default:
        return <AddNewBorrowingStep1 onPress={handleNextStep} onCancel={onCancel} />;
    }
  }, [currentStep, handleNextStep, onCancel, linkedOffsetsBorrowings]);

  const renderTab = () => {
    switch (index) {
      case insightsMobileOvertimeChart ? 0 : 1:
        return borrowingDetails && fetchedData && loaded ? (
          <View style={AppStyle.flex1}>
            {isArchived || restoreAsAt ? (
              <ArchiveLabel
                date={borrowingDetails?.archivedDate}
                item={borrowing}
                onSubmit={async ({ asAt }) => {
                  setRestoring(true);
                  await dispatchResolve(
                    financialDashboardActions.restoreFinancialCardItem({ item: borrowing, asAt }),
                  );
                  await dispatchResolve(getBorrowingDetail({ id: params?.borrowing?.id }));
                  setRestoreAsAt(asAt);
                  setIsEdited(true);
                  setRestoring(false);
                }}
                restoreAsAt={restoreAsAt}
              />
            ) : null}
            {restoring ? (
              <ContentLoader name="borrowing_detail" />
            ) : (
              <FormAddDetail
                onPress={handleNextStep}
                onCancel={handleGoBack}
                borrowing={borrowingDetails}
                onEdit={() => setIsEdited(true)}
                disabled={restoreAsAt ? false : isArchived}
                restoring={restoreAsAt}
                linkedOffsetsBorrowings={linkedOffsetsBorrowings}
                onScroll={handleScroll}
              />
            )}
          </View>
        ) : (
          <ContentLoader name="borrowing_detail" />
        );
      case insightsMobileOvertimeChart ? 1 : 0:
        if (insightsMobileOvertimeChart) {
          return (
            <FinancialGraph
              {...{
                cardId: borrowingDetails?._id,
                graphTitle: 'CURRENT BALANCE',
                timeList: AppConstants.listFilterChart,
                type: AppConstants.cardCategory.Borrowing,
              }}
            />
          );
        }
        return (
          <NoDataAvailable
            type="none"
            title={t('components.noDataAvailable.title')}
            description={t('components.noDataAvailable.noDataAvailable')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        type="full"
        title={headerTitle}
        style={styles.headerPadding}
        onBackHeader={() => handleGoBack()}
        numberOfLines={1}
      />
      {borrowing && (
        <FinancialCardTopTab
          height={animatedHeight}
          topBarHeight={topBarHeight}
          type={AppConstants.cardCategory.Borrowing}
          tabIndex={index}
          onChangeTab={idx => setIndex(idx)}
          isArchived={isArchived}
          onArchived={() => {
            if (isEdited) {
              GlobalLib.ConfirmModal.get().show({
                title: t(`${i18nScopeForm}.cancelConfirmation`),
                content: !isEmpty(params?.borrowing)
                  ? t(`${i18nScopeForm}.areYouSureCancelEditBorrowing`)
                  : t(`${i18nScopeForm}.areYouSureCancelBorrowing`),
                onConfirm: () => {
                  setTimeout(() => {
                    typeof onPressArchive === 'function'
                      ? onPressArchive(borrowing, () => {
                          setRestoreAsAt(null);
                          setIsEdited(false);
                          updateTime();
                          reload();
                        })
                      : onPressArchiveDefault(borrowing, () => {
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
                  ? onPressArchive(borrowing, () => {
                      setRestoreAsAt(null);
                      setIsEdited(false);
                      updateTime();
                      reload();
                    })
                  : onPressArchiveDefault(borrowing, () => {
                      setRestoreAsAt(null);
                      setIsEdited(false);
                      updateTime();
                      reload();
                    });
              }, 500);
            }
          }}
          onDelete={() => {
            if (isEdited) {
              GlobalLib.ConfirmModal.get().show({
                title: t(`${i18nScopeForm}.cancelConfirmation`),
                content: !isEmpty(params?.borrowing)
                  ? t(`${i18nScopeForm}.areYouSureCancelEditBorrowing`)
                  : t(`${i18nScopeForm}.areYouSureCancelBorrowing`),
                onConfirm: () => {
                  setTimeout(() => {
                    typeof onPressDelete === 'function'
                      ? onPressDelete(borrowing, () => {
                          NavigationServiceLib.pop();
                        })
                      : onPressDeleteDefault(borrowing, () => {
                          NavigationServiceLib.pop();
                        });
                  }, 500);
                },
              });
            } else {
              setTimeout(() => {
                typeof onPressDelete === 'function'
                  ? onPressDelete(borrowing, () => {
                      NavigationServiceLib.pop();
                    })
                  : onPressDeleteDefault(borrowing, () => {
                      NavigationServiceLib.pop();
                    });
              }, 500);
            }
          }}
        />
      )}
      {borrowing ? renderTab() : renderStep()}
    </View>
  );
}

export default compose(withDynamicModuleLoader(getModule()), withBackHandler)(AddNewBorrowing);
