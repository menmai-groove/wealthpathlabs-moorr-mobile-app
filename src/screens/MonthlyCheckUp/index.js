import { useFocusEffect } from '@react-navigation/core';
import CalendarIcon from 'assets/svgs/profile/calendar';
import ButtonField from 'components/basics/ButtonField';
import Condition from 'components/basics/Condition';
import FloatingButton from 'components/basics/FloatingButton';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import ContentLoader from 'components/layouts/ContentLoader';
import Header from 'components/layouts/Header';
import { AppConfigs, AppConstants } from 'constant';
import { AnalyticsLib, GlobalLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { formatDateTime } from 'libs/util';
import { first, get, isEmpty, last, sortBy } from 'lodash';
import moment from 'moment';
import { useOnScreenRefresh, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import AddEditCheckUp from 'screens/MonthlyCheckUp/components/AddEditCheckUp';
import CardItemCheckUp from 'screens/MonthlyCheckUp/components/CardItemCheckUp';
import HeaderList from 'screens/MonthlyCheckUp/components/HeaderList';
import MonthlyCheckUpStartScreen from 'screens/MonthlyCheckUp/components/MonthlyCheckUpStartScreen';
import PreviusCheckUp from 'screens/MonthlyCheckUp/components/PreviusCheckUp';
import SetUpMoneySMARTSTracking from 'screens/MonthlyCheckUp/components/SetUpMoneySMARTSTracking';
import { selectFlags } from 'store/Auth/selector';
import {
  addEditMonthlyCheckUp,
  changeStartDate,
  deleteAllMonthlyCheckUp,
  deleteCheckUp,
  getMonthlyCheckUpData,
  resetPreviusCheckUpData,
  setActions,
  setStartDate,
  takeMonthlyCheckUp,
  updateMoneySMARTSTrackingCards,
} from 'store/MonthlyCheckUp/action';
import getModule from 'store/MonthlyCheckUp/module';
import {
  selectActions,
  selectFetchedDataCheckUp,
  selectLastStartDate,
  selectOpenedCheckup,
  selectPreviousCheckUps,
} from 'store/MonthlyCheckUp/selector';
// import { selectAppPreference } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.monthlyCheckUp';
const formatDateTimeString = 'DD MMM YYYY';

const ChangeStartDateForm = ({ startDate }) => {
  const styles = useThemedStyle(
    {
      ...themedStyles,
      floatingButton: {
        ...themedStyles.floatingButton,
        bottom: themedStyles.floatingButton.bottom,
      },
    },
    i18nScope,
  );
  const [value, setValue] = useState(new Date(startDate).toISOString() ?? '');
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const dispatchResolve = useDispatchResolve();

  const onHandleChange = () => {
    if (moment(startDate).isSame(value)) {
      setError(t(`${i18nScope}.startDateDifferent`));
      return;
    }
    if (isEmpty(String(value).trim())) {
      setError(t(`${i18nScope}.startDateRequired`));
      return;
    }
    setError('');
    const startDateValue = new Date(value).toISOString();
    dispatchResolve(changeStartDate(startDateValue)).then(() => {
      GlobalLib.CustomModal.get().hide();
      dispatchResolve(setStartDate(undefined));
    });
  };

  return (
    <View style={[AppStyle.padY30, styles.changeStartDateContainer]}>
      <TextField style={AppStyle.textCenter} type="heading-2">
        {t(`${i18nScope}.changeStartDate`)}
      </TextField>
      <View style={AppStyle.marginX20}>
        <TextField style={[AppStyle.marginTop20, AppStyle.marginBottom5]} type="heading-4">
          {t(`${i18nScope}.changeStartDateDescription1`)}
        </TextField>
        <TextField style={[AppStyle.marginTop20, AppStyle.marginBottom5]} type="heading-4">
          {t(`${i18nScope}.changeStartDateDescription2`)}
        </TextField>
        <TextField
          style={[AppStyle.marginTop20, AppStyle.marginBottom5, styles.noteText]}
          type="heading-4">
          {t(`${i18nScope}.changeStartDateNote`)}
        </TextField>
        <View style={[AppStyle.marginTop20, AppStyle.marginBottom5]}>
          <InputField
            value={value ? formatDateTime(value, formatDateTimeString) : ''}
            label={t(`${i18nScope}.startDate`)}
            placeholder={formatDateTimeString}
            required
            editable={false}
            onPress={() => {
              GlobalLib.CalendarModal.get().show({
                current: value || new Date(),
                onConfirm: dateValue => {
                  setValue(dateValue);
                  setError('');
                },
              });
            }}
            RightComponent={() => <CalendarIcon />}
            error={error}
          />
        </View>
      </View>
      <View
        style={[
          AppStyle.rowFlex,
          AppStyle.marginX20,
          AppStyle.marginTop20,
          styles.buttonContainer,
        ]}>
        <ButtonField
          onPress={() => {
            GlobalLib.CustomModal.get().hide();
          }}
          style={styles.button}
          type="medium-secondary"
          text={t(`${i18nScope}.cancel`)}
        />
        <ButtonField
          style={styles.button}
          onPress={onHandleChange}
          type="medium-primary"
          text={t(`${i18nScope}.change`)}
        />
      </View>
    </View>
  );
};

function MonthlyCheckUpScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyle(
    {
      ...themedStyles,
      floatingButton: {
        ...themedStyles.floatingButton,
        bottom: themedStyles.floatingButton.bottom,
      },
    },
    i18nScope,
  );
  const { screenRefreshId } = useOnScreenRefresh();

  const [refreshing, setRefreshing] = useState(false);
  const dispatchResolve = useDispatchResolve();
  const dispatch = useDispatch();
  const monthlyCheckUpStartScreenRef = useRef();

  // const { webHomePage } = useSelector(selectAppPreference);
  const fetchedData = useSelector(selectFetchedDataCheckUp);
  const currentCheckup = useSelector(selectOpenedCheckup);
  const currentCheckUpStartDate = get(currentCheckup, 'startDate');
  const previousCheckUp = useSelector(selectPreviousCheckUps);
  const { total, documents } = previousCheckUp;
  const previousCheckUpStartDate = get(first(documents), 'startDate');
  const lastStartDate = useSelector(selectLastStartDate);
  const { checkUpFlow, checkUpPage, trackInMoneySMARTS } = useSelector(selectFlags);
  const actions = useSelector(selectActions);
  const startDateDefault = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const firstDayOfYear = new Date(currentYear, 0, 1);
    const startDate = previousCheckUpStartDate
      ? currentCheckUpStartDate
        ? UtilLib.dateUTCAsAt(currentCheckUpStartDate)
        : UtilLib.dateUTCAsAt(Date.now())
      : UtilLib.dateUTCAsAt(firstDayOfYear);
    return startDate;
  }, []);

  const balances = useMemo(() => {
    if (checkUpFlow) {
      let list =
        currentCheckup?.balancesAsAt?.totalCheckupsBalances?.filter(
          x => x.checkupDate <= UtilLib.dateUTCAsAt(Date.now()).toISOString(),
        ) ?? [];
      return list;
    }
    return currentCheckup?.balances;
  }, [checkUpFlow, currentCheckup]);

  const isShowStartScreen = useMemo(() => {
    if (checkUpFlow) {
      return !currentCheckup?.balancesAsAt?.checkupBalances?.some(x => {
        return (
          x.bankAccounts?.some(b => b.amount != null) || x.creditCards?.some(b => b.amount != null)
        );
      });
    } else {
      return balances == null || balances?.length === 0;
    }
  }, [currentCheckup]);

  const checkupItemBlank = useMemo(() => {
    const findItemsNull = currentCheckup?.balancesAsAt?.checkupBalances?.filter(x => {
      return (
        !x.bankAccounts?.some(b => b.amount != null) && !x.creditCards?.some(b => b.amount != null)
      );
    });
    if (findItemsNull?.length > 0) {
      return sortBy(findItemsNull, x => x.checkupDate)[0];
    }
    return null;
  }, [balances]);

  const showFloatButtonAdd = () => {
    if (checkUpFlow && balances?.length > 0) {
      return (
        checkupItemBlank != null &&
        checkupItemBlank?.checkupDate <= UtilLib.dateUTCAsAt(Date.now()).toISOString()
      );
    }
    return balances?.length < AppConfigs.circleMonthCheckUp;
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchResolve(getMonthlyCheckUpData(true)).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);

  const onConfirmClearAll = useCallback(() => {
    dispatch(deleteAllMonthlyCheckUp());
  }, [dispatch]);

  const handleClearAll = useCallback(() => {
    GlobalLib.ConfirmModal.get().show({
      title: t(`${i18nScope}.deleteTitle`),
      content: t(`${i18nScope}.deleteContent`),
      onConfirm: onConfirmClearAll,
    });
  }, [onConfirmClearAll, t]);

  const onSubmitModal = useCallback(
    async (data, itemCheckUp) => {
      if (itemCheckUp) {
        data.id = itemCheckUp._id;
      }
      dispatch(addEditMonthlyCheckUp(data));
      await GlobalLib.CustomModal.get().hide();
      await dispatchResolve(takeMonthlyCheckUp());
    },
    [dispatchResolve],
  );

  const handleEditCheckUp = useCallback(
    (
      itemCheckUp,
      startDate,
      isFirstItem,
      balanceAsAt,
      _currentCheckup = null,
      enableTracking = false,
      open = true,
    ) => {
      const showProps = {
        type: 'absolute',
        body: (
          <AddEditCheckUp
            onCancel={async () => {
              await GlobalLib.CustomModal.get().hide();
              removeAction('add_edit_checkup');
            }}
            formatDateTimeString={formatDateTimeString}
            startDate={startDate}
            itemCheckUp={itemCheckUp}
            type={isEmpty(itemCheckUp) ? 'add' : 'edit'}
            onSubmit={async data => {
              if (_currentCheckup) {
                data.currentCheckupId = _currentCheckup._id;
              }
              await onSubmitModal(data, itemCheckUp);
              removeAction('add_edit_checkup');
            }}
            isFirstItem={isFirstItem}
            balanceAsAt={balanceAsAt}
            handleSetUpMoneySMARTSTracking={handleSetUpMoneySMARTSTracking}
            onNavigate={async () => {
              await GlobalLib.CustomModal.get().hide();
            }}
            onEnableTracking={enableTrackingState => {
              handleEditCheckUp(
                itemCheckUp,
                startDate,
                isFirstItem,
                balanceAsAt,
                _currentCheckup,
                enableTrackingState,
                false,
              );
            }}
            enableTrackingDefault={enableTracking}
          />
        ),
      };
      if (open) {
        GlobalLib.CustomModal.get().show(showProps);
      }
      saveAction(GlobalLib.CustomModal.get().show, [showProps], 'add_edit_checkup');
    },
    [onSubmitModal],
  );

  const handlePressStartDate = useCallback(startDateValue => {
    GlobalLib.CustomModal.get().show({
      type: 'absolute',
      body: <ChangeStartDateForm startDate={startDateValue} />,
      onBackdropPress: () => {
        GlobalLib.CustomModal.get().hide();
      },
      onRequestClose: () => {
        GlobalLib.CustomModal.get().hide();
      },
    });
  }, []);

  const openPreviousCheckup = useCallback(
    ({ defaultPage }, open = true) => {
      const showProps = {
        body: (
          <PreviusCheckUp
            formatDateTimeString={formatDateTimeString}
            handleEditCheckUp={handleEditCheckUp}
            defaultPage={defaultPage}
            onPageChange={page => {
              openPreviousCheckup({ defaultPage: page }, false);
            }}
          />
        ),
        hideCloseButton: false,
        onRequestClose: () => {
          dispatch(resetPreviusCheckUpData());
          GlobalLib.CustomModal.get().hide();
          removeAction('previous_checkup');
        },
        styles: styles.customModal,
      };
      if (open) {
        GlobalLib.CustomModal.get().show(showProps);
      }
      saveAction(GlobalLib.CustomModal.get().show, [showProps], 'previous_checkup');
    },
    [dispatch, styles],
  );

  // const onConfirmRollover = useCallback(() => {
  //   UtilLib.openInAppBrowserLink(webHomePage);
  //   // dispatch(rolloverCheckUp());
  // }, [webHomePage]);

  const rolloverInformation = useCallback(() => {
    GlobalLib.ConfirmModal.get().show({
      title: t(`${i18nScope}.rolloverTitle`),
      content: t(`${i18nScope}.rolloverContent_1`),
      // onConfirm: onConfirmRollover,
      onlyOneButton: true,
      okText: t(`${i18nScope}.close`),
    });
  }, [t]);

  const onConfirmDeleteCheckUp = useCallback(
    checkUp => {
      dispatch(deleteCheckUp(checkUp));
    },
    [dispatch],
  );

  const onDeleteCheckUp = useCallback(
    checkUp => {
      GlobalLib.ConfirmModal.get().show({
        title: t('components.confirmModal.deleteConfirmation'),
        content: t('components.confirmModal.deleteItemMessage'),
        onConfirm: () => onConfirmDeleteCheckUp(checkUp),
      });
    },
    [onConfirmDeleteCheckUp, t],
  );

  const handleSetUpMoneySMARTSTracking = useCallback((selectedStartDate, open = true) => {
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.moneySMARTSTrackingSetupStart, {});
    const startDate = selectedStartDate ?? startDateDefault;
    const showProps = {
      type: 'absolute',
      body: (
        <SetUpMoneySMARTSTracking
          onCancel={() => {
            GlobalLib.CustomModal.get().hide();
            removeAction('set_up_money_smarts');
            if (typeof monthlyCheckUpStartScreenRef.current?.refresh === 'function') {
              monthlyCheckUpStartScreenRef.current.refresh(startDate);
            }
          }}
          startDate={startDate}
          onSubmit={(data, metaData) => {
            const bankAccountsData = get(metaData, 'bankAccountsData');
            const borrowingsData = get(metaData, 'borrowingsData');
            const asAtDate = UtilLib.dateUTCAsAt(get(data, 'startDate')).toISOString();
            const bankAccountsFields = get(data, 'bankAccounts', []).map(item => ({
              _id: item?._id,
              isTrackedInMoneySmarts: item?.isTrackedInMoneySmarts,
            }));
            const creditCardsFields = get(data, 'creditCards', []).map(item => ({
              _id: item?._id,
              isTrackedInMoneySmarts: item?.isTrackedInMoneySmarts,
            }));
            const lineCreditsFields = get(data, 'lineCredits', []).map(item => ({
              _id: item?._id,
              isTrackedInMoneySmarts: item?.isTrackedInMoneySmarts,
            }));
            const bankAccounts = bankAccountsData.map(item => ({
              _id: item._id,
              isTrackedInMoneySmarts:
                bankAccountsFields.find(field => field?._id === item?._id)
                  ?.isTrackedInMoneySmarts ?? item?.isTrackedInMoneySmarts,
              isTrackedInMoneySmartsAsAt: asAtDate,
            }));
            const borrowings = borrowingsData.map(item => ({
              _id: item._id,
              isTrackedInMoneySmarts:
                [...creditCardsFields, ...lineCreditsFields].find(field => field?._id === item?._id)
                  ?.isTrackedInMoneySmarts ?? item?.isTrackedInMoneySmarts,
              isTrackedInMoneySmartsAsAt: asAtDate,
            }));
            const payload = {
              bankAccounts,
              borrowings,
            };
            dispatchResolve(updateMoneySMARTSTrackingCards(payload)).then(response => {
              if (response) {
                AnalyticsLib.logEvent(
                  AppConstants.analytics.eventTypes.moneySMARTSTrackingSetupComplete,
                  {},
                );
                GlobalLib.CustomModal.get().hide();
                removeAction('set_up_money_smarts');
                monthlyCheckUpStartScreenRef.current.refresh(startDate);
              }
            });
          }}
          onStartDateChange={date => handleSetUpMoneySMARTSTracking(date, false)}
        />
      ),
    };
    if (open) {
      GlobalLib.CustomModal.get().show(showProps);
    }
    saveAction(GlobalLib.CustomModal.get().show, [showProps], 'set_up_money_smarts');
  }, []);

  const saveAction = useCallback((fn, params, key) => {
    const action = { key, fn, params };
    dispatch(
      setActions({
        key,
        action,
      }),
    );
  }, []);

  const removeAction = useCallback(key => {
    dispatch(
      setActions({
        key,
      }),
    );
  }, []);

  const replayLastAction = useCallback(() => {
    const lastAction = actions[actions.length - 1];
    if (lastAction) {
      lastAction.fn(...lastAction.params);
    }
  }, [actions]);

  useFocusEffect(
    useCallback(() => {
      if (trackInMoneySMARTS) {
        const previousRoute = GlobalLib.PreviousRoute.get();
        if (['add_asset', 'borrowing', 'edit_asset'].includes(previousRoute)) {
          monthlyCheckUpStartScreenRef.current?.refresh();
        }
      }

      replayLastAction();
      return () => {};
    }, [replayLastAction]),
  );

  useEffect(() => {
    // NOTE: go back
    return () => {
      dispatchResolve(setStartDate(undefined));
    };
  }, []);

  const isValidCheckUpStartDate = moment(new Date()).isSameOrAfter(moment(currentCheckUpStartDate));

  return (
    <View key={screenRefreshId} style={styles.container}>
      <Header type="full" title={t(`${i18nScope}.headerTitle`)} />

      <Condition display={!fetchedData}>
        <View style={[AppStyle.flex1, AppStyle.marginTop30]}>
          <ContentLoader name="monthlyCheckUp" />
        </View>
      </Condition>

      <Condition display={fetchedData && isShowStartScreen && isValidCheckUpStartDate}>
        <MonthlyCheckUpStartScreen
          ref={monthlyCheckUpStartScreenRef}
          minDate={
            lastStartDate
              ? moment(lastStartDate)
                  .add(AppConfigs.circleMonthCheckUp - 1, 'months')
                  .toDate()
              : undefined
          }
          disabledSelectDate={total > 0}
          styles={styles}
          handleSetUpMoneySMARTSTracking={handleSetUpMoneySMARTSTracking}
        />
      </Condition>

      <Condition display={fetchedData && (!isShowStartScreen || !isValidCheckUpStartDate)}>
        {trackInMoneySMARTS ? (
          <View style={[AppStyle.alignContent, AppStyle.marginBottom10]}>
            <TouchableField
              onPress={() => handleSetUpMoneySMARTSTracking(currentCheckup.startDate)}>
              <TextField type="text-label" font="medium" style={styles.linkText}>
                {t(`${i18nScope}.setUpMoneySMARTSTracking`)}
              </TextField>
            </TouchableField>
          </View>
        ) : null}
        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          data={balances}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <CardItemCheckUp
              isFirstItem={index === 0}
              startDate={moment(currentCheckup.startDate).add(index, 'months')}
              item={item}
              formatDateTimeString={formatDateTimeString}
              onPress={handleEditCheckUp}
              onDelete={() => onDeleteCheckUp(item)}
              disabledDelete={index + 1 !== currentCheckup?.balances?.length}
              onPressStartDate={handlePressStartDate}
              balanceAsAt={currentCheckup?.balancesAsAt?.checkupBalances?.[index]}
              swipeDisabled={checkUpFlow}
              readonly={actions?.length > 0}
            />
          )}
          contentContainerStyle={[{ paddingBottom: AppStyle.menuPaddingBottom.paddingBottom + 50 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <HeaderList
              formatDateTimeString={formatDateTimeString}
              onPress={() => {
                openPreviousCheckup({ defaultPage: 0 });
              }}
            />
          }
          ItemSeparatorComponent={() => <View style={AppStyle.marginTop10} />}
          ListFooterComponent={
            <View>
              {checkUpPage &&
              (!isValidCheckUpStartDate ||
                balances.length < currentCheckup?.balancesAsAt?.totalCheckupsBalances?.length) ? (
                <View style={[AppStyle.justifyContent, AppStyle.marginX30, AppStyle.padY20]}>
                  <TextField style={[styles.textInfo, AppStyle.textCenter]}>
                    {t(`${i18nScope}.checkupFutureMessage1`)}
                    {!isValidCheckUpStartDate ? ' Click ' : ''}
                    {!isValidCheckUpStartDate ? (
                      <TextField
                        style={styles.textInfoWithLink}
                        suppressHighlighting={true}
                        onPress={() => handlePressStartDate(moment(currentCheckup.startDate))}>
                        {t('here')}
                      </TextField>
                    ) : null}
                    {!isValidCheckUpStartDate ? t(`${i18nScope}.checkupFutureMessage2`) : ''}
                  </TextField>
                </View>
              ) : null}
              {!checkUpPage ? (
                <View style={[AppStyle.rowFlex, AppStyle.flexEndContent, AppStyle.marginX15]}>
                  <TouchableField style={styles.buttonClearAll} onPress={handleClearAll}>
                    <View style={styles.iconXCircle}>
                      <FeatherIcon name="x" style={styles.iconX} />
                    </View>
                    <TextField style={styles.textClearAll}>{t(`${i18nScope}.clearAll`)}</TextField>
                  </TouchableField>
                </View>
              ) : null}
              {balances?.length >= 2 && isValidCheckUpStartDate && (
                <ButtonField
                  style={[AppStyle.marginTop20, AppStyle.marginBottom20, AppStyle.marginX15]}
                  text={t(`${i18nScope}.rolloverInformation`)}
                  onPress={rolloverInformation}
                />
              )}
            </View>
          }
        />
        {showFloatButtonAdd() && isValidCheckUpStartDate && (
          <FloatingButton
            // bottom={AppStyle.menuPaddingBottom.paddingBottom}
            onPress={() =>
              handleEditCheckUp(
                null,
                checkUpFlow
                  ? moment(checkupItemBlank?.checkupDate).toDate()
                  : moment(currentCheckup.startDate).add(balances.length - 1, 'months'),
                false,
                checkUpFlow
                  ? currentCheckup?.balancesAsAt?.checkupBalances?.find(
                      x => x.checkupDate === moment(checkupItemBlank?.checkupDate).toISOString(),
                    )
                  : {
                      checkupDate: moment(last(balances)?.checkupDate).add(1, 'M').toISOString(),
                    },
              )
            }
          />
        )}
      </Condition>
    </View>
  );
}

export default compose(withDynamicModuleLoader(getModule()), withBackHandler)(MonthlyCheckUpScreen);
