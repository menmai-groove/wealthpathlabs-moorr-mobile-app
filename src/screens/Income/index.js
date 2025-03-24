import { useFocusEffect, useRoute } from '@react-navigation/core';
import Condition from 'components/basics/Condition';
import FinancialCardTopTab from 'components/basics/FinancialCardTopTab';
import ContentLoader from 'components/layouts/ContentLoader';
import Header from 'components/layouts/Header';
import NoDataAvailable from 'components/layouts/NoDataAvailable';
import { AppConstants } from 'constant';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { get, isArray, isEmpty, sortBy, toNumber } from 'lodash';
import moment from 'moment';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Platform, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import { ArchiveLabel } from 'screens/EditAsset';
import { updateTime } from 'screens/HistoricalLog';
import EditAssetIncome from 'screens/Income/components/EditAssetIncome';
import AddNewIncomeStep1 from 'screens/Income/components/step/AddNewIncomeStep1';
import AddNewIncomeStep1_1 from 'screens/Income/components/step/AddNewIncomeStep1_1';
import AddNewIncomeStep2 from 'screens/Income/components/step/AddNewIncomeStep2';
import AddNewIncomeStep3 from 'screens/Income/components/step/AddNewIncomeStep3';
import AddNewIncomeStep4 from 'screens/Income/components/step/AddNewIncomeStep4';
import { selectFlags } from 'store/Auth/selector';
import * as financialDashboardActions from 'store/FinancialDashboard/action';
import { getIncomeDetail, submitData, updateData } from 'store/Income/action';
import { AddNewIncomeStep } from 'store/Income/constants';
import getModule from 'store/Income/module';
import {
  selectIncomeAssetDetails,
  selectIncomeDetails,
  selectIncomeType,
} from 'store/Income/selector';

import themedStyles from './styles';

const i18nScope = 'screens.income';
const i18nScopeForm = 'forms.payg';

function AddNewIncome() {
  useOnBackButtonPress(() => handleGoBack());
  const { t } = useTranslation();
  const { params } = useRoute();
  const income = params?.income;
  const onPressArchive = params?.onPressArchive;
  const onPressDelete = params?.onPressDelete;
  const formRef = params?.formRef;
  const { assetIncomeCards } = useSelector(selectFlags);

  const styles = useThemedStyle(themedStyles, 'screens.income');
  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();
  const isEdit = useMemo(() => !isEmpty(params?.income), [params]);
  const headerTitle = useMemo(
    () =>
      !isEmpty(params?.income) && params?.income?._id !== AppConstants.newObjectIDForTypes.Income
        ? params?.income?.name
        : t(`${i18nScope}.headerTitle`),
    [t, params],
  );
  const isAssetIncome = useMemo(() => {
    if (assetIncomeCards) {
      return params?.income?.assetId != null;
    }
    const type = params?.income?.typeValue || params?.income?.type;
    if (
      [AppConstants.IncomeType.InvestmentIncome, AppConstants.IncomeType.PropertyIncome].includes(
        type,
      )
    ) {
      return true;
    }
    return false;
  }, [assetIncomeCards, params]);

  const [isEdited, setIsEdited] = useState(false);
  const [restoreAsAt, setRestoreAsAt] = useState(null);
  const [loaded, setLoaded] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const createdAt = useRef();

  const incomeDetails = useSelector(selectIncomeDetails);
  const assetDetails = useSelector(selectIncomeAssetDetails);
  const isArchived = useMemo(() => {
    if (incomeDetails) {
      return (isArray(incomeDetails) ? incomeDetails[0] : incomeDetails)?.isArchived;
    }
    return income?.isArchived;
  }, [income, incomeDetails]);

  const { mobileCardTabsInsights, insightsMobileOvertimeChart } = useSelector(selectFlags);
  const [index, setIndex] = useState(
    insightsMobileOvertimeChart
      ? 0
      : !mobileCardTabsInsights || params?.income?._id?.includes('__ObjectId__')
      ? 1
      : 0,
  );

  const isShowDetailTab = insightsMobileOvertimeChart ? index === 0 : index === 1;

  const reload = useCallback(() => {
    if (isEdit) {
      const historicalLog = GlobalLib.HistoricalLog.get();
      const updatedAt = get(historicalLog, 'updatedAt');
      const newHistoricalLog = updatedAt && moment(createdAt.current).isBefore(updatedAt);
      if (createdAt.current && !newHistoricalLog) {
        return;
      }
      setLoaded(false);
      if (assetIncomeCards && params?.asset) {
        dispatchResolve(getIncomeDetail({ income: params?.income, asset: params?.asset })).then(
          () => {
            setLoaded(true);
          },
        );
      } else {
        dispatchResolve(getIncomeDetail({ income: params?.income })).then(() => {
          setLoaded(true);
        });
      }
      createdAt.current = moment();
    }
    setIsEdited(false);
  }, [assetIncomeCards, dispatchResolve, isEdit, params]);

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

  const [currentStep, setStep] = useState(
    !isEmpty(params?.income) ? AddNewIncomeStep.Step4 : AddNewIncomeStep.Step1,
  );

  const incomeType = useSelector(selectIncomeType);
  const handleNextStep = useCallback(
    (data, callback) => {
      dispatch(updateData(data));
      switch (currentStep) {
        case AddNewIncomeStep.Step1:
          if (data?.type === AppConstants.IncomeType.Business) {
            setStep(AddNewIncomeStep.Step1_1);
          } else {
            setStep(AddNewIncomeStep.Step2);
          }
          break;
        case AddNewIncomeStep.Step1_1:
          setStep(AddNewIncomeStep.Step2);
          break;
        case AddNewIncomeStep.Step2:
          setStep(AddNewIncomeStep.Step3);
          break;
        case AddNewIncomeStep.Step3:
          setStep(AddNewIncomeStep.Step4);
          break;
        case AddNewIncomeStep.Step4:
          dispatchResolve(submitData()).then(() => {
            if (typeof callback === 'function') {
              updateTime();
              callback();
              return;
            }
            NavigationServiceLib.pop();
          });
          break;
        default:
          break;
      }
    },
    [currentStep, dispatch, dispatchResolve],
  );
  const handleCancel = useCallback(() => {
    if (incomeDetails && !isEdited) {
      NavigationServiceLib.pop();
      return;
    }
    GlobalLib.ConfirmModal.get().show({
      title: t(`${i18nScopeForm}.cancelConfirmation`),
      content: incomeDetails
        ? t(`${i18nScopeForm}.areYouSureCancelEditIncome`)
        : t(`${i18nScopeForm}.areYouSureCancelIncome`),
      onConfirm: () => {
        NavigationServiceLib.pop();
      },
    });
  }, [isEdited, t, incomeDetails]);
  const handleGoBack = useCallback(() => {
    if (isEdit) {
      handleCancel();
      return;
    }
    switch (currentStep) {
      case AddNewIncomeStep.Step2:
        if (incomeType === AppConstants.IncomeType.Business) {
          setStep(AddNewIncomeStep.Step1_1);
        } else {
          setStep(AddNewIncomeStep.Step1);
        }
        break;
      case AddNewIncomeStep.Step1_1:
        setStep(AddNewIncomeStep.Step1);
        break;
      case AddNewIncomeStep.Step3:
        setStep(AddNewIncomeStep.Step2);
        break;
      case AddNewIncomeStep.Step4:
        setStep(AddNewIncomeStep.Step3);
        break;
      case AddNewIncomeStep.Step1:
        handleCancel();
        break;
      default:
        break;
    }
  }, [currentStep, handleCancel, incomeType, isEdit]);

  const overrideOnSubmitForm = useCallback(
    dataForm => {
      try {
        let incomesData = formRef?.getFormValue('incomeBreakdownCard');
        if (incomeDetails._id !== AppConstants.newObjectIDForTypes.Income) {
          incomesData.forEach(_income => {
            if (_income._id === incomeDetails._id) {
              _income.amount = UtilLib.checkEmptyButNotZero(dataForm.regularIncome)
                ? null
                : toNumber(dataForm.regularIncome);
              _income.name = dataForm.name;
              _income.notes = dataForm.notes;
              _income.frequency = dataForm.frequency?.value;
              _income.totalAnnual = dataForm.totalAnnual;
              _income.id = [dataForm._id];
            }
          });
        } else {
          incomesData.push({
            ...incomeDetails,
            amount: UtilLib.checkEmptyButNotZero(dataForm.regularIncome)
              ? null
              : toNumber(dataForm.regularIncome),
            name: dataForm.name,
            notes: dataForm.notes,
            frequency: dataForm.frequency?.value,
            totalAnnual: dataForm.totalAnnual,
            _id: dataForm._id,
            id: [dataForm._id],
          });
        }

        const annualIncome = incomesData
          .filter(x => !x.isArchived)
          .reduce((total, current) => {
            return (
              total +
              current.amount *
                (AppConstants.frequencyMultiplier.find(x => x.value === current.frequency)
                  ?.multiplier ?? 0)
            );
          }, 0);

        incomesData = sortBy(incomesData, ['name']);

        formRef?.setFormValue('incomeBreakdownCard', incomesData);
        formRef?.setFormValue('annualIncome', annualIncome);
      } catch (error) {}
    },
    [formRef, incomeDetails],
  );

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case AddNewIncomeStep.Step2:
        return (
          <AddNewIncomeStep2
            onPress={handleNextStep}
            onCancel={handleCancel}
            disabled={isArchived}
          />
        );
      case AddNewIncomeStep.Step3:
        return (
          <AddNewIncomeStep3
            onPress={handleNextStep}
            onCancel={handleCancel}
            disabled={isArchived}
          />
        );
      case AddNewIncomeStep.Step4:
        return (
          <AddNewIncomeStep4
            onPress={handleNextStep}
            onCancel={handleCancel}
            editIncome={isEdit}
            onEdit={() => setIsEdited(true)}
            disabled={restoreAsAt ? false : isArchived}
            restoring={restoreAsAt}
            onScroll={handleScroll}
          />
        );
      case AddNewIncomeStep.Step1_1:
        return (
          <AddNewIncomeStep1_1
            onPress={handleNextStep}
            onCancel={handleCancel}
            disabled={isArchived}
          />
        );
      default:
        AddNewIncomeStep.Step1;
        return (
          <AddNewIncomeStep1
            onPress={handleNextStep}
            onCancel={handleCancel}
            disabled={isArchived}
          />
        );
    }
  }, [currentStep, handleNextStep, handleCancel, isArchived, isEdit, restoreAsAt, handleScroll]);
  return (
    <View style={styles.container}>
      <Header
        type="full"
        title={headerTitle}
        style={styles.headerPadding}
        onBackHeader={() => handleGoBack()}
        numberOfLines={1}
      />
      <Condition display={isEdit && !params?.income?._id?.includes('__ObjectId__')}>
        <FinancialCardTopTab
          height={animatedHeight}
          topBarHeight={topBarHeight}
          type={AppConstants.cardCategory.Income}
          tabIndex={index}
          onChangeTab={idx => setIndex(idx)}
          isArchived={isArchived}
          onArchived={() => {
            if (isEdited) {
              GlobalLib.ConfirmModal.get().show({
                title: t(`${i18nScopeForm}.cancelConfirmation`),
                content: incomeDetails
                  ? t(`${i18nScopeForm}.areYouSureCancelEditIncome`)
                  : t(`${i18nScopeForm}.areYouSureCancelIncome`),
                onConfirm: () => {
                  setTimeout(() => {
                    onPressArchive(income, () => {
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
                onPressArchive(income, () => {
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
                content: incomeDetails
                  ? t(`${i18nScopeForm}.areYouSureCancelEditIncome`)
                  : t(`${i18nScopeForm}.areYouSureCancelIncome`),
                onConfirm: () => {
                  setTimeout(() => {
                    onPressDelete(income, () => {
                      NavigationServiceLib.pop();
                    });
                  }, 500);
                },
              });
            } else {
              setTimeout(() => {
                onPressDelete(income, () => {
                  NavigationServiceLib.pop();
                });
              }, 500);
            }
          }}
        />
      </Condition>
      <Condition display={!isEdit}>{renderStep()}</Condition>

      <Condition display={isEdit && !(incomeDetails && loaded) && isShowDetailTab}>
        <ContentLoader name="income_detail" />
      </Condition>

      <Condition display={isEdit && incomeDetails && loaded && !isAssetIncome && isShowDetailTab}>
        {isArchived || restoreAsAt ? (
          <ArchiveLabel
            date={(isArray(incomeDetails) ? incomeDetails[0] : incomeDetails)?.archivedDate}
            item={income}
            onSubmit={async ({ asAt }) => {
              setRestoring(true);
              await dispatchResolve(
                financialDashboardActions.restoreFinancialCardItem({ item: income, asAt }),
              );
              await dispatchResolve(getIncomeDetail({ income: params?.income }));
              setRestoreAsAt(asAt);
              setIsEdited(true);
              setRestoring(false);
            }}
            restoreAsAt={restoreAsAt}
            relatedAsset={{ data: assetDetails }}
          />
        ) : null}
        {restoring ? <ContentLoader name="income_detail" /> : renderStep({ disabled: isArchived })}
      </Condition>

      <Condition display={isEdit && incomeDetails && loaded && isAssetIncome && isShowDetailTab}>
        {isArchived || restoreAsAt ? (
          <ArchiveLabel
            date={(isArray(incomeDetails) ? incomeDetails[0] : incomeDetails)?.archivedDate}
            item={income}
            onSubmit={async ({ asAt }) => {
              setRestoring(true);
              await dispatchResolve(
                financialDashboardActions.restoreFinancialCardItem({ item: income, asAt }),
              );
              await dispatchResolve(getIncomeDetail({ income: params?.income }));
              setRestoreAsAt(asAt);
              setIsEdited(true);
              setRestoring(false);
            }}
            restoreAsAt={restoreAsAt}
            relatedAsset={{ data: assetDetails }}
          />
        ) : null}
        {restoring ? (
          <ContentLoader name="income_detail" />
        ) : (
          <EditAssetIncome
            onPress={handleNextStep}
            onCancel={handleGoBack}
            income={
              assetIncomeCards ? (isArray(incomeDetails) ? incomeDetails[0] : incomeDetails) : null
            }
            incomes={incomeDetails}
            asset={assetDetails}
            onEdit={() => setIsEdited(true)}
            disabled={restoreAsAt ? false : isArchived}
            restoring={restoreAsAt}
            onSubmit={() => {
              if (isArchived) {
                return dispatchResolve(
                  financialDashboardActions.restoreFinancialCardItem({
                    item: income,
                    asAt: restoreAsAt,
                  }),
                );
              }
              updateTime();
            }}
            overrideOnSubmitForm={assetIncomeCards && formRef != null ? overrideOnSubmitForm : null}
            formRef={formRef}
            onScroll={handleScroll}
          />
        )}
      </Condition>
      {index !== 0 && isEdit && (
        <NoDataAvailable
          type="none"
          title={t('components.noDataAvailable.title')}
          description={t('components.noDataAvailable.noDataAvailable')}
        />
      )}
    </View>
  );
}

export default compose(withDynamicModuleLoader(getModule()))(AddNewIncome);
