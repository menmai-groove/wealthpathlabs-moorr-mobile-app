import ButtonField from 'components/basics/ButtonField';
import Condition from 'components/basics/Condition';
import DynamicForm from 'components/basics/DynamicForm';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import Header from 'components/layouts/Header';
import NoDataAvailable from 'components/layouts/NoDataAvailable';
import { GlobalLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { formatCurrency, formatDateTime } from 'libs/util';
import { cloneDeep, get, isArray, last } from 'lodash';
import moment from 'moment';
import { useOnScreenRefresh, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import ProvisionChart from 'screens/ProvisionJars/components/ProvisionChart';
import {
  addTransaction,
  deleteTransaction,
  editTransaction,
  getMoneySmarts,
} from 'store/MoneySmartsDashboard/action';
import getModule from 'store/MoneySmartsDashboard/module';
import { selectDocumentID, selectProvisionsJar } from 'store/MoneySmartsDashboard/selector';
import { selectCheckUpData } from 'store/MonthlyCheckUp/selector';
import { AppStyle } from 'theme';

import AddTransactions from './components/AddTransactions';
import TransactionCard from './components/TransactionCard';
import themedStyles from './styles';

const i18nScope = 'screens.provisionsJar';
const i18nGlobalScope = 'global';
const i18nModalScope = 'components.confirmModal';
const formatFormJson = require('assets/forms/layouts/provision-jar-expense-transaction.json');
const cartFormatDate = 'ddd, DD MMMM YYYY';

function ProvisionExpenseScreen({ route }) {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { screenRefreshId } = useOnScreenRefresh();

  const [refreshing, setRefreshing] = useState(false);
  const { provisions, previousProvisions } = useSelector(selectProvisionsJar);
  const documentID = useSelector(selectDocumentID);
  const currentCheckUp = useSelector(selectCheckUpData);
  const currentCheckUpStartDate = moment(currentCheckUp?.startDate).toDate();
  const currentCheckUpEndDate = last(currentCheckUp?.balancesAsAt?.checkupDates)
    ? moment(last(currentCheckUp?.balancesAsAt?.checkupDates)).toDate()
    : new Date();

  const isPreviousProvision = get(route, ['params', 'isPreviousProvision'], false);
  const provisionItem = useMemo(() => {
    const expenseId = get(route, ['params', '_id'], null);
    return (
      provisions.find(item => item.expense?._id === expenseId) ??
      previousProvisions.find(item => item.expense?._id === expenseId)
    );
  }, [route, provisions, previousProvisions]);
  const expenseItem = provisionItem?.expense;
  const headerTitle = useMemo(() => get(route, ['params', 'name'], ''), [route]);

  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();

  const data = useMemo(() => {
    return {
      summary: {
        remainingAmount: get(provisionItem, 'remainingAmount') || 0,
        spentAmount: get(provisionItem, 'spentAmount') || 0,
        totalAmount: get(provisionItem, 'totalAmount') || 0,
      },
      transactions: get(provisionItem, 'transactions') || [],
    };
  }, [provisionItem]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchResolve(getMoneySmarts(true)).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);
  const openAddEditTransactionModal = useCallback(
    (formData, title, onSubmit) => {
      let scrollRef;
      let scrollTimeout;
      const scrollToElement = (element, timeout = 250) => {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
          element && scrollRef?.scrollIntoView(element);
        }, timeout);
      };

      const onErrorForm = (formErrors, dataFormErrorsCurrent, firstKey) => {
        if (firstKey) {
          scrollToElement(dataFormErrorsCurrent[firstKey]?.componentRef);
        }
      };

      const CustomModal = GlobalLib.CustomModal.get();
      const ModalUI = () => {
        const formRef = useRef(null);
        return (
          <KeyboardAwareScrollView
            bounces={false}
            contentContainerStyle={AppStyle.justifyContent}
            showsVerticalScrollIndicator={false}
            ref={ref => {
              scrollRef = ref;
            }}>
            <TextField font="semi-bold" style={styles.modalTitle}>
              {title}
            </TextField>
            <DynamicForm
              ref={formRef}
              data={formData}
              onErrorForm={onErrorForm}
              onSubmit={dataModal => {
                // console.log('dataModal', dataModal);
                // formRef.current?.setErrorMessage(
                //   'date',
                //   'This entry is outside of the selected period',
                // );
                // return;
                onSubmit(dataModal);
                CustomModal.hide();
              }}
            />
            <View style={styles.modalButtonContainer}>
              <ButtonField
                type="medium-secondary"
                text={t(`${i18nGlobalScope}.cancel`)}
                style={styles.modalButton}
                onPress={() => GlobalLib.CustomModal.get().hide()}
              />
              <ButtonField
                type="medium-primary"
                text={t(`${i18nGlobalScope}.save`)}
                style={styles.modalButton}
                onPress={() => formRef.current.submit()}
              />
            </View>
          </KeyboardAwareScrollView>
        );
      };
      CustomModal.show({
        body: <ModalUI />,
        onRequestClose: () => CustomModal.hide(),
        onBackdropPress: () => CustomModal.hide(),
      });
    },
    [styles, t],
  );

  // format data before input to child component
  const flatListData = useMemo(() => {
    if (!isArray(data.transactions)) {
      return [];
    }
    return data.transactions.map(item => ({
      ...item,
      key: item._id,
      amountFormat: formatCurrency(item.amount),
      dateFormat: formatDateTime(item.date, cartFormatDate),
    }));
  }, [data.transactions]);

  const onDeleteTransaction = useCallback(
    id => {
      GlobalLib.ConfirmModal.get().show({
        title: t(`${i18nModalScope}.deleteConfirmation`),
        content: t(`${i18nModalScope}.deleteItemMessage`),
        onConfirm: () =>
          dispatch(
            deleteTransaction({ documentID: documentID, id: id, expenseId: expenseItem._id }),
          ),
      });
    },
    [dispatch, documentID, t, expenseItem],
  );

  const onPressAdd = useCallback(() => {
    const newDataJSON = cloneDeep(formatFormJson);
    const fields = get(newDataJSON, ['layout', 0, 'fields'], []);
    fields[2].value = moment(currentCheckUpEndDate).isBefore(moment(new Date()))
      ? currentCheckUpEndDate
      : new Date();
    fields[2].minDate = currentCheckUpStartDate;
    fields[2].maxDate = currentCheckUpEndDate ?? new Date();
    if (isPreviousProvision) {
      let minDate, maxDate;
      provisionItem?.archivedAndPreviousDateRange?.forEach(e => {
        if (minDate == null) {
          minDate = e.from;
        } else {
          if (moment(minDate).isAfter(moment(e.from))) {
            minDate = e.from;
          }
        }
        if (maxDate == null) {
          maxDate = e.to;
        } else {
          if (moment(maxDate).isBefore(moment(e.to))) {
            maxDate = e.to;
          }
        }
      });
      if (minDate && maxDate) {
        fields[2].maxDate = moment(maxDate).toDate();
        fields[2].minDate = moment(minDate).toDate();
        fields[2].value = moment(maxDate).isBefore(moment(new Date())) ? maxDate : new Date();
      }
    }
    openAddEditTransactionModal(newDataJSON, t(`${i18nScope}.addTransaction`), dataModal => {
      dispatch(
        addTransaction({
          documentID: documentID,
          name: dataModal?.transactionName,
          expenseId: expenseItem?._id,
          date: dataModal?.date?.toISOString(),
          amount: Number(dataModal?.amount),
        }),
      );
    });
  }, [dispatch, documentID, expenseItem, openAddEditTransactionModal, t]);

  const onPressTransaction = useCallback(
    (id, name, amount, date, periodId) => {
      // Update JSON to replace default value when open edit modal
      const newDataJSON = cloneDeep(formatFormJson);
      const fields = get(newDataJSON, ['layout', 0, 'fields'], []);
      fields[0].value = name;
      fields[1].value = `${amount}`;
      fields[2].value = date;
      fields[2].minDate = currentCheckUpStartDate;
      fields[2].maxDate = currentCheckUpEndDate ?? new Date();
      if (isPreviousProvision) {
        let minDate, maxDate;
        provisionItem?.archivedAndPreviousDateRange?.forEach(e => {
          if (minDate == null) {
            minDate = e.from;
          } else {
            if (moment(minDate).isAfter(moment(e.from))) {
              minDate = e.from;
            }
          }
          if (maxDate == null) {
            maxDate = e.to;
          } else {
            if (moment(maxDate).isBefore(moment(e.to))) {
              maxDate = e.to;
            }
          }
        });
        if (minDate && maxDate) {
          fields[2].maxDate = moment(maxDate).toDate();
          fields[2].minDate = moment(minDate).toDate();
        }
      }
      openAddEditTransactionModal(newDataJSON, t(`${i18nScope}.editTransaction`), dataModal => {
        dispatch(
          editTransaction({
            id: id,
            documentID: periodId ?? documentID,
            name: dataModal?.transactionName,
            expenseId: expenseItem?._id,
            date: dataModal?.date?.toISOString(),
            amount: Number(dataModal?.amount),
          }),
        );
      });
    },
    [expenseItem, dispatch, documentID, openAddEditTransactionModal, t],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <TransactionCard
        onDeleteTransaction={onDeleteTransaction}
        onPressTransaction={onPressTransaction}
        key={item._id}
        styles={styles}
        {...item}
      />
    ),
    [onDeleteTransaction, onPressTransaction, styles],
  );

  return (
    <View key={screenRefreshId} style={styles.container}>
      <Header type="full" title={headerTitle} />
      <Condition display={!provisionItem}>
        <NoDataAvailable
          type="none"
          title={t(`${i18nScope}.emptyProvisionJarsExpenseTitle`)}
          description={t(`${i18nScope}.emptyProvisionJarsExpenseDescription`)}
        />
      </Condition>
      <Condition display={provisionItem}>
        <FlatList
          data={flatListData}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{
            paddingBottom: AppStyle.menuPaddingBottom.paddingBottom + styles.floatingButton.height,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <ProvisionChart summary={data.summary} isExpense />
              <TextField font="semi-bold" style={styles.transactionTitle}>
                {t(`${i18nScope}.transactions`)}
              </TextField>
            </View>
          }
          renderItem={renderItem}
          // ListFooterComponent={
          //   <AddTransactions onPress={onPressAdd} />
          // }
          initialNumToRender={5} // Reduce initial render amount
          maxToRenderPerBatch={1} // Reduce number in each render batch
          updateCellsBatchingPeriod={100} // Increase time between renders
          windowSize={51} // Reduce the window size
        />
        <AddTransactions onPress={onPressAdd} floatingButton />
      </Condition>
    </View>
  );
}

export default compose(
  withDynamicModuleLoader(getModule()),
  withBackHandler,
)(ProvisionExpenseScreen);
