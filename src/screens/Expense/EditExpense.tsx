import Header from 'components/layouts/Header';
import { useThemedStyle, useOnBackButtonPress } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { compose } from 'redux';
import getModule from 'store/Expense/module';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { AppStyle } from 'theme';
import { get } from 'lodash';
import { useSelector } from 'react-redux';
import { FormDataProvider, useFormData } from 'screens/Expense/useSaveFormData';
import { useRoute } from '@react-navigation/native';
import {
  ExpenseRentForm,
  // ExpenseInvestmentForm
} from 'screens/Expense/components/forms';
import * as actions from 'store/Expense/action';
import {
  selectExpenseDetail,
  // selectGroupExpenses,
  selectRelatedAsset,
  selectRentExpenseData,
  selectInvestmentExpense,
} from 'store/Expense/selector';
import {
  selectDataBillExpenseType,
  selectDataSpendingExpenseType,
  selectFlags,
  // selectListExpenseTypes,
  selectOwners,
} from 'store/Auth/selector';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import { useDispatchResolve } from 'libs/hooks';
import Condition from 'components/basics/Condition';
import ContentLoader from 'components/layouts/ContentLoader';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import FooterControl from 'components/basics/FooterControl';
import { ArchiveLabel } from 'screens/EditAsset';
import * as financialDashboardActions from 'store/FinancialDashboard/action';
import moment, { Moment } from 'moment';
import { updateTime } from 'screens/HistoricalLog';
import FinancialCardTopTab from 'components/basics/FinancialCardTopTab';
import { Animated } from 'react-native';
import { AppConstants } from 'constant';
import NoDataAvailable from 'components/layouts/NoDataAvailable';

import { getSubmitExpenseData } from './utils';
import themedStyles from './styles';
const i18nScope = 'screens.expense';
// const assetExpenseTypeValue = Object.values(AppConstants.AssetExpenseType);
// const defaultHoldingCostFields = [
//   // 'category',
//   'frequency',
//   'type',
//   // 'isTaxDeductable',
//   // 'note',
//   // 'name',
//   'expenseGroup',
//   // 'ownership',
// ];
const AnimatedKeyboardAwareFlatList = Animated.createAnimatedComponent(KeyboardAwareScrollView);

function EditExpense() {
  useOnBackButtonPress(() => onCancel());

  const route = useRoute();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatchResolve = useDispatchResolve();
  const styles = useThemedStyle(themedStyles, `${i18nScope}.editExpense`);

  const ids = get(route.params, 'item.id') ?? [];
  const hasId = ids.length > 0;
  const isAddForm = !hasId;
  const assetId = get(route.params, 'item.assetId');
  const assetFormRef = get(route.params, 'assetFormRef');
  const onPressDelete = get(route.params, 'onPressDelete');
  const onPressArchive = get(route.params, 'onPressArchive');
  // const typeValue = get(route.params, 'item.typeValue');
  const item = get(route.params, 'item');
  const overrideOnSubmitForm = get(route.params, 'onSubmitForm');
  const expenseDetail = useSelector(selectExpenseDetail);

  const isArchived = useMemo(() => {
    if (expenseDetail) {
      return expenseDetail?.isArchived;
    }
    return item?.isArchived;
  }, [item, expenseDetail]);

  const { mobileCardTabsInsights, insightsMobileOvertimeChart } = useSelector(selectFlags);
  const [index, setIndex] = useState(
    insightsMobileOvertimeChart
      ? 0
      : !mobileCardTabsInsights || item?._id?.includes('__ObjectId__')
      ? 1
      : 0,
  );

  // const dataListExpenseTypes = useSelector(selectListExpenseTypes);
  // const groupExpenses = useSelector(selectGroupExpenses);
  const rentExpenseData = useSelector(selectRentExpenseData);
  const relatedAsset = useSelector(selectRelatedAsset);
  const investmentExpenseData = useSelector(selectInvestmentExpense);
  const billCategories = useSelector(selectDataBillExpenseType);
  const spendingCategories = useSelector(selectDataSpendingExpenseType);
  const userOwnerships = useSelector(selectOwners);
  const isExpenseRentForm = useMemo(
    () =>
      assetId
        ? isAddForm && assetId
          ? relatedAsset
          : relatedAsset && expenseDetail
        : expenseDetail,
    [assetId, expenseDetail, isAddForm, relatedAsset],
  );

  // const isExpenseInvestmentForm = useMemo(
  //   () => assetId && assetExpenseTypeValue.includes(typeValue),
  //   [typeValue, assetId],
  // );

  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);
  const formRef = useRef(null);
  const { saveFormData } = useFormData();
  const [isReady, setIsReady] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [restoreAsAt, setRestoreAsAt] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const createdAt = useRef<undefined | Moment>();

  const reload = useCallback(() => {
    const historicalLog = GlobalLib.HistoricalLog.get();
    const updatedAt = get(historicalLog, 'updatedAt');
    const newHistoricalLog = updatedAt && moment(createdAt.current).isBefore(updatedAt);
    if (createdAt.current && !newHistoricalLog) {
      return;
    }
    setIsReady(false);
    dispatchResolve(actions.getExpenseDetail({ ids, assetId })).then(() => {
      setIsReady(true);
      setIsEdited(false);
    });
    createdAt.current = moment();
    setIsEdited(false);
  }, [assetId, dispatchResolve, ids]);

  useEffect(() => {
    return () => {
      // reset
      saveFormData({});
      dispatchResolve(actions.setGroupExpensesData(null));
      dispatchResolve(actions.setExpenseDetail(null));
      dispatchResolve(actions.setRelatedAsset(null));
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
      return () => {};
    }, [reload]),
  );

  useEffect(() => {
    if (rentExpenseData && isExpenseRentForm) {
      saveFormData(rentExpenseData);
      setIsReady(true);
      setIsEdited(false);
    }
    if (!rentExpenseData && isExpenseRentForm && assetId && relatedAsset) {
      setIsReady(true);
      setIsEdited(false);
    }
  }, [saveFormData, isExpenseRentForm, rentExpenseData, assetId, relatedAsset]);

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

  // useEffect(() => {
  //   if (investmentExpenseData && relatedAsset && isExpenseInvestmentForm) {
  //     saveFormData(investmentExpenseData);
  //     setIsReady(true);
  //   }
  // }, [isExpenseInvestmentForm, investmentExpenseData, relatedAsset, saveFormData]);

  const onSubmitForm = useCallback(
    async (submitData: any, callback?: Function) => {
      const params = getSubmitExpenseData(submitData, ids[0], {
        billCategories: billCategories,
        spendingCategories: spendingCategories,
        userOwnerships,
        prevDataExpense: expenseDetail,
      });

      if (restoreAsAt) {
        await dispatchResolve(
          financialDashboardActions.restoreFinancialCardItem({ item, asAt: restoreAsAt }),
        );
      }
      const expense = await dispatchResolve(actions.submitData({ ...params, relatedAsset }));
      if (typeof overrideOnSubmitForm === 'function') {
        overrideOnSubmitForm({
          ...params,
          ownership: submitData?.ownership,
          _id: ids[0] ?? expense?._id,
        });
      }
      if (typeof callback === 'function') {
        updateTime();
        callback();
        return;
      }
      navigation.goBack();
    },
    [
      ids,
      billCategories,
      spendingCategories,
      userOwnerships,
      expenseDetail,
      overrideOnSubmitForm,
      restoreAsAt,
      dispatchResolve,
      item,
      navigation,
      relatedAsset,
    ],
  );

  // const onSubmitExpenseInvestmentForm = async submitData => {
  //   const {
  //     holdingCosts = [],
  //     name,
  //     // note
  //   } = submitData;
  //   const defaultParams = _.pick(groupExpenses[0], defaultHoldingCostFields);
  //   const deleteExpenseIds = _.difference(
  //     groupExpenses.map(groupExpenseItem => groupExpenseItem._id),
  //     holdingCosts.map(holdingCostItem => holdingCostItem._id),
  //   );
  //   if (restoreAsAt) {
  //     await dispatchResolve(
  //       financialDashboardActions.restoreFinancialCardItem({ item, asAt: restoreAsAt }),
  //     );
  //   }
  //   dispatchResolve(
  //     actions.submitGroupExpenses({
  //       name: name,
  //       groupExpenses: holdingCosts.map(holdingCostItem => {
  //         return {
  //           ...defaultParams,
  //           // name,
  //           // note,
  //           _id: holdingCostItem._id,
  //           jar: holdingCostItem.jar,
  //           holdingCostName: holdingCostItem.holdingCostName,
  //           essentialAmount: holdingCostItem.essentialAmount,
  //         };
  //       }),
  //       deleteExpenseIds,
  //       assetId: relatedAsset.data._id,
  //       assetType: relatedAsset?.type,
  //     }),
  //   ).then(() => {
  //     navigation.goBack();
  //   });
  // };

  const onCancel = useCallback(() => {
    if (!isEdited) {
      NavigationServiceLib.pop();
      return;
    }
    GlobalLib.ConfirmModal.get().show({
      title: t(`${i18nScope}.editExpense.cancelConfirmation`),
      content: t(`${i18nScope}.editExpense.areYouSureCancel`),
      onConfirm: () => {
        NavigationServiceLib.pop();
      },
    });
  }, [isEdited, t]);

  const onFirstTimeDataChange = useCallback(() => {
    setIsEdited(true);
  }, []);

  const scrollToElement = useCallback(
    (element, timeout = 250) => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        element && scrollRef?.current?.scrollIntoView(element);
      }, timeout);
    },
    [scrollRef],
  );

  const onErrorForm = useCallback(
    (formErrors, dataFormErrors, firstKey) => {
      if (firstKey) {
        scrollToElement(dataFormErrors[firstKey]?.componentRef);
      }
    },
    [scrollToElement],
  );

  return (
    <View style={styles.container}>
      <Header
        type="full"
        title={
          (isExpenseRentForm && rentExpenseData?.name) ||
          (investmentExpenseData && `Expenses - ${relatedAsset?.data?.name || ''}`) ||
          (!rentExpenseData &&
            isExpenseRentForm &&
            assetId &&
            relatedAsset &&
            t('screens.expense.addExpense.headerTitle'))
        }
        style={styles.headerPadding}
        numberOfLines={1}
        onBackHeader={onCancel}
      />
      <Condition display={!item?._id?.includes('__ObjectId__')}>
        <FinancialCardTopTab
          height={animatedHeight}
          type={AppConstants.cardCategory.Expense}
          tabIndex={index}
          onChangeTab={idx => setIndex(idx)}
          isArchived={isArchived}
          onArchived={() => {
            if (isEdited) {
              GlobalLib.ConfirmModal.get().show({
                title: t(`${i18nScope}.editExpense.cancelConfirmation`),
                content: t(`${i18nScope}.editExpense.areYouSureCancel`),
                onConfirm: () => {
                  setTimeout(() => {
                    onPressArchive(item, () => {
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
                onPressArchive(item, () => {
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
                title: t(`${i18nScope}.editExpense.cancelConfirmation`),
                content: t(`${i18nScope}.editExpense.areYouSureCancel`),
                onConfirm: () => {
                  setTimeout(() => {
                    onPressDelete(item, () => {
                      NavigationServiceLib.pop();
                    });
                  }, 500);
                },
              });
            } else {
              setTimeout(() => {
                onPressDelete(item, () => {
                  NavigationServiceLib.pop();
                });
              }, 500);
            }
          }}
        />
      </Condition>
      <Condition display={!isReady}>
        <ContentLoader name="asset_detail" />
      </Condition>
      <Condition display={isReady && index === (insightsMobileOvertimeChart ? 0 : 1)}>
        {isArchived || restoreAsAt ? (
          <ArchiveLabel
            date={rentExpenseData?.archivedDate}
            item={item}
            onSubmit={async ({ asAt }) => {
              setRestoring(true);
              await dispatchResolve(
                financialDashboardActions.restoreFinancialCardItem({ item, asAt }),
              ).then(() => updateTime());
              await dispatchResolve(actions.getExpenseDetail({ ids, assetId }));
              setRestoreAsAt(asAt);
              setIsEdited(true);
              setRestoring(false);
            }}
            restoreAsAt={restoreAsAt}
            relatedAsset={relatedAsset}
          />
        ) : null}
        {restoring ? (
          <ContentLoader name="asset_detail" />
        ) : (
          <AnimatedKeyboardAwareFlatList
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[AppStyle.padX20, AppStyle.padBottom90]}
            onScroll={handleScroll}>
            <View>
              {isExpenseRentForm && (
                <ExpenseRentForm
                  formRef={formRef}
                  onSubmitForm={onSubmitForm}
                  onFirstTimeDataChange={onFirstTimeDataChange}
                  onErrorForm={onErrorForm}
                  disabled={restoreAsAt ? false : isArchived}
                  value={expenseDetail}
                  assetFormRef={assetFormRef}
                />
              )}
              {/* {isExpenseInvestmentForm && (
              <ExpenseInvestmentForm
                formRef={formRef}
                onSubmitForm={onSubmitExpenseInvestmentForm}
                onFirstTimeDataChange={onFirstTimeDataChange}
                onErrorForm={onErrorForm}
                disabled={restoreAsAt ? false : isArchived}
              />
            )} */}
            </View>
          </AnimatedKeyboardAwareFlatList>
        )}
        {isEdited && (
          <View style={styles.wrapperControl}>
            <FooterControl
              onCancel={onCancel}
              onSave={() => formRef.current?.submit()}
              isEdited={isEdited}
              textButtonSave={restoreAsAt ? t('screens.financialDashboard.restore') : null}
            />
          </View>
        )}
      </Condition>
      {index !== (insightsMobileOvertimeChart ? 0 : 1) && (
        <NoDataAvailable
          type="none"
          title={t('components.noDataAvailable.title')}
          description={t('components.noDataAvailable.noDataAvailable')}
        />
      )}
    </View>
  );
}

function EditExpenseScreen(props) {
  return (
    <FormDataProvider>
      <EditExpense {...props} />
    </FormDataProvider>
  );
}

export default compose(withDynamicModuleLoader(getModule()))(EditExpenseScreen);
