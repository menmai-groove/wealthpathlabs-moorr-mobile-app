import { useRoute } from '@react-navigation/core';
import Condition from 'components/basics/Condition';
import FloatingButton from 'components/basics/FloatingButton';
import ContentLoader from 'components/layouts/ContentLoader';
import Header from 'components/layouts/Header';
import { AppConstants } from 'constant';
import { AnalyticsLib, GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { first, get } from 'lodash';
import moment from 'moment';
import { useOnScreenRefresh, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import AddEditEntry from 'screens/HistoricalLog/components/AddEditEntry';
import MyTable from 'screens/HistoricalLog/components/MyTable';
import {
  addHistoricalLog,
  deleteHistoricalLog,
  getHistoricalLogData,
} from 'store/HistoricalLog/action';
import getModule from 'store/HistoricalLog/module';
import {
  selectHistoricalLogFetched,
  selectOriginValues,
  selectOwnershipDetails,
  selectValues,
} from 'store/HistoricalLog/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.historicalLog';
const formatDateTimeString = 'DD MMM YYYY';

export const RECORD_TYPE = {
  NUMBER: 'NUMBER',
  NUMBER_WITH_FREQUENCY: 'NUMBER_WITH_FREQUENCY',
  STRING: 'STRING',
  OWNERSHIP: 'OWNERSHIP',
  OBJECT_IDS: 'OBJECT_IDS',
  CHILDREN_NUMBER_WITH_FREQUENCY: 'CHILDREN_NUMBER_WITH_FREQUENCY',
  DEPRECIATION: 'DEPRECIATION',
};

export const updateTime = () => {
  GlobalLib.HistoricalLog.set({
    updatedAt: moment(),
  });
};

function HistoricalLogScreen() {
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
  const route = useRoute();
  const info = get(route, 'params.info');
  const cardId = get(info, 'cardId');
  const childCardId = get(info, 'childCardId', null);
  const cardName = get(info, 'cardName');
  const category = get(info, 'category');
  const field = get(info, 'field');
  const fieldId = get(info, 'fieldId');
  const type = get(info, 'type');
  const recordType = get(info, 'recordType');
  const fields = get(route, 'params.fields');
  const person = get(fields, '0.labelDynamic.person');
  const fieldName = t(get(fields, '0.label'), {
    person,
  });
  const heading =
    recordType === RECORD_TYPE.DEPRECIATION
      ? AppConstants.depreciation.header
      : [cardName, fieldName].join(' - ');
  const breadcrumb = [category, type, cardName].join(' > ');
  const { screenRefreshId } = useOnScreenRefresh();
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const dispatchResolve = useDispatchResolve();
  const fetched = useSelector(selectHistoricalLogFetched);
  const values = useSelector(selectValues);
  const originValues = useSelector(selectOriginValues);
  const ownershipDetails = useSelector(selectOwnershipDetails);
  const params = useMemo(
    () => ({
      category,
      item_type: type,
      name: cardName,
      card_id: cardId,
      field_name: fieldName,
    }),
    [cardId, cardName, category, fieldName, type],
  );
  const [modal, setModal] = useState();

  const restrictValue = info.restrictValue
    ? info.restrictValue.some(x => first(values)?.stringValue?.includes(x))
    : true;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const data = {
      cardId,
      childCardId,
      field,
    };
    dispatchResolve(getHistoricalLogData(data)).finally(() => {
      setRefreshing(false);
    });
  }, [cardId, childCardId, dispatchResolve, field]);

  const onAddSubmit = useCallback(
    async data => {
      switch (recordType) {
        case RECORD_TYPE.NUMBER: {
          const formatData = {
            ...data,
            recordType,
            cardId,
            childCardId,
            field,
            asAt: UtilLib.dateUTCAsAt(data.date),
            info,
          };
          await dispatchResolve(addHistoricalLog(formatData));
          break;
        }
        case RECORD_TYPE.NUMBER_WITH_FREQUENCY: {
          const formatData = {
            ...data,
            recordType,
            cardId,
            childCardId,
            field,
            asAt: UtilLib.dateUTCAsAt(data.date),
            info,
          };
          await dispatchResolve(addHistoricalLog(formatData));
          break;
        }
        case RECORD_TYPE.STRING: {
          const formatData = {
            ...data,
            recordType,
            cardId,
            childCardId,
            field,
            asAt: UtilLib.dateUTCAsAt(data.date),
            info,
          };
          await dispatchResolve(addHistoricalLog(formatData));
          break;
        }
        case RECORD_TYPE.OWNERSHIP: {
          const formatData = {
            ...data,
            recordType,
            cardId,
            childCardId,
            field,
            asAt: UtilLib.dateUTCAsAt(data.date),
            info,
          };
          await dispatchResolve(addHistoricalLog(formatData));
          break;
        }
        case RECORD_TYPE.OBJECT_IDS: {
          const formatData = {
            ...data,
            recordType,
            cardId,
            childCardId,
            field,
            fieldId,
            asAt: UtilLib.dateUTCAsAt(data.date),
            info,
          };
          await dispatchResolve(addHistoricalLog(formatData));
          break;
        }
        case RECORD_TYPE.DEPRECIATION: {
          const year = new Date(data.date).getFullYear();
          const formatData = {
            ...data,
            recordType,
            cardId,
            childCardId,
            field,
            fieldId,
            asAt: UtilLib.dateUTCAsAt(`${year - 1}-07-01T00:00:00.000Z`),
            info,
          };
          await dispatchResolve(addHistoricalLog(formatData));
          break;
        }
        default:
          break;
      }

      GlobalLib.CustomModal.get().hide();
      updateTime();
      return;
    },
    [recordType, cardId, childCardId, field, info, dispatchResolve, fieldId],
  );

  const addEntry = useCallback(() => {
    const minDate = get(values, '0.asAt') ? moment(get(values, '0.asAt')).toDate() : undefined;
    GlobalLib.CustomModal.get().show({
      type: 'absolute',
      body: (
        <AddEditEntry
          minDate={minDate}
          onCancel={() => GlobalLib.CustomModal.get().hide()}
          onSubmit={data => {
            onAddSubmit(data);
            AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.historicalLogAdd, params);
          }}
          recordType={recordType}
          fields={fields}
          info={info}
        />
      ),
    });
  }, [values, recordType, fields, info, onAddSubmit, params]);

  const deleteEntry = useCallback(
    async (historicalLog, skipCheckRequired = false) => {
      if (originValues?.length === 1 && fields[0]?.required && !skipCheckRequired) {
        GlobalLib.Toast.get().toastWarning(t(`${i18nScope}.deleteLastRecord`));
        return;
      }
      if (recordType === RECORD_TYPE.DEPRECIATION) {
        historicalLog.asAt = UtilLib.dateUTCAsAt(
          moment(historicalLog.asAt).subtract(1, 'y').toDate(),
        );
      }
      await dispatchResolve(deleteHistoricalLog({ ...historicalLog, field }));
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.historicalLogDelete, params);
      updateTime();
      return;
    },
    [dispatchResolve, field, originValues, params, fields, recordType, t],
  );

  const onDeleteHistoricalLog = useCallback(
    historicalLog => {
      GlobalLib.ConfirmModal.get().show({
        title: t('components.confirmModal.deleteConfirmation'),
        content: t('components.confirmModal.deleteItemMessage'),
        onConfirm: () => deleteEntry(historicalLog),
      });
    },
    [deleteEntry, t],
  );

  const onEditSubmit = useCallback(
    async (data, editData) => {
      try {
        const isSame = moment(UtilLib.dateUTCAsAt(get(data, 'date'))).isSame(
          UtilLib.dateUTCAsAt(get(editData, 'asAt')),
        );
        await onAddSubmit(data);
        if (!isSame) {
          setFetching(true);
          await deleteEntry(editData, true);
        }
        GlobalLib.CustomModal.get().hide();
        updateTime();
      } catch (error) {
      } finally {
        setFetching(false);
      }
    },
    [deleteEntry, onAddSubmit],
  );

  const editEntry = useCallback(
    historicalLog => {
      const { actionType } = historicalLog;
      if (actionType === 'archive' || actionType === 'restore') {
        return;
      }
      if (typeof modal === 'string') {
        return;
      }
      setModal('add_edit_entry');
      const minDate = moment(get(values, '0.asAt')).toDate();
      GlobalLib.CustomModal.get().show({
        type: 'absolute',
        body: (
          <AddEditEntry
            minDate={minDate}
            onCancel={() => {
              GlobalLib.CustomModal.get().hide();
              setModal();
            }}
            onSubmit={async data => {
              await onEditSubmit(data, historicalLog);
              setModal();
              AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.historicalLogEdit, params);
            }}
            recordType={recordType}
            editData={historicalLog}
            fields={fields}
            info={info}
          />
        ),
      });
    },
    [values, recordType, fields, info, onEditSubmit, params, modal],
  );

  const onBackHeader = useCallback(() => {
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.historicalLogClose, params);
    NavigationServiceLib.pop();
  }, [params]);

  useEffect(() => {
    const data = {
      cardId,
      field,
      childCardId,
    };
    dispatchResolve(getHistoricalLogData(data)).then(() => {
      AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.historicalLogOpen, params);
    });
  }, [cardId, cardName, category, childCardId, dispatchResolve, field, fieldName, params, type]);

  return (
    <View key={screenRefreshId} style={styles.container}>
      <Header type="full" title={t(`${i18nScope}.headerTitle`)} onBackHeader={onBackHeader} />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={AppStyle.flex1}
        contentContainerStyle={[
          styles.scrollContent,
          AppStyle.flexGrow1,
          AppStyle.menuPaddingBottom,
        ]}>
        <Condition display={!fetched || fetching}>
          <View style={[AppStyle.flex1]}>
            <ContentLoader name="historical_log" />
          </View>
        </Condition>

        <Condition display={fetched && !fetching}>
          <MyTable
            heading={heading}
            breadcrumb={breadcrumb}
            data={values}
            ownershipDetails={ownershipDetails}
            formatDateTimeString={formatDateTimeString}
            onDelete={onDeleteHistoricalLog}
            recordType={recordType}
            onPress={editEntry}
            fieldName={fieldName}
            fields={fields}
            info={info}
          />
        </Condition>
      </ScrollView>
      <Condition display={fetched && !fetching && restrictValue}>
        <FloatingButton onPress={addEntry} />
      </Condition>
    </View>
  );
}

export default compose(withDynamicModuleLoader(getModule()), withBackHandler)(HistoricalLogScreen);
