/**
 *
 * CalendarModal
 *
 */

import ButtonField from 'components/basics/ButtonField';
// import CustomCalendar from 'components/basics/CustomCalendar';
import FullCalendar, { CALENDAR_TYPES } from 'components/basics/FullCalendar';
import TextField from 'components/basics/TextField';
import util from 'libs/util';
import { isFunction } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { selectCloseModalsRefreshId } from 'store/Root/selector';

import themedStyles from './style';

const initialState = {
  type: CALENDAR_TYPES.DAILY,
  current: new Date(),
  onBackdropPress: () => {},
  onBackButtonPress: () => {},
  onModalHide: () => {},
  onRequestClose: () => {},
  onConfirm: () => {},
};

const CalendarModal = (props, ref) => {
  const styles = useThemedStyle(themedStyles, 'components.calendarModal');
  const { t } = useTranslation();
  const closeModalsRefreshId = useSelector(selectCloseModalsRefreshId);
  const [visibility, setVisibility] = useState(false);
  const [states, setStates] = useState(initialState);
  const [selectedDate, setSelectedDate] = useState(null);
  const insets = useSafeAreaInsets();

  /**
   *
   * @param {Object} params
   * @param {String} params.type Type of calendar
   * @param {String} params.minDate Minimum range date
   * @param {String} params.maxDate Maximum range date
   * @param {String} params.current The default date of modal
   * @param {Function} params.onBackdropPress Callback invoked when clicking backdrop
   * @param {Function} params.onBackButtonPress Callback invoked when clicking Back button
   * @param {Function} params.onModalHide Callback invoked after modal is hidden
   * @param {Function} params.onRequestClose Callback invoked when closing modal manually
   * @param {Function} params.onConfirm Callback invoked when press Set button
   * @param {Function} params.onCancel Callback invoked when press Cancel button

   */
  const show = params => {
    setVisibility(true);
    setStates(prevState => ({
      ...prevState,
      ...params,
    }));
    setSelectedDate(params.current);
  };

  const hide = () => {
    setVisibility(false);
    setStates(initialState);
  };

  useEffect(() => {
    if (closeModalsRefreshId) {
      hide();
    }
  }, [closeModalsRefreshId]);

  /**
   * Customize the instance value that is exposed to parent components when using `ref`
   */
  useImperativeHandle(
    ref,
    () => ({
      show,
      hide,
    }),
    [],
  );

  const onConfirm = () => {
    hide();
    isFunction(states.onConfirm) && states.onConfirm(selectedDate);
  };

  const onCancel = () => {
    hide();
    isFunction(states.onCancel) && states.onCancel();
  };

  const onDateChange = date => setSelectedDate(date);

  const renderDate = useMemo(() => {
    return moment(selectedDate).format('YYYY ddd, MMM DD');
  }, [selectedDate]);

  const paddingBottom = insets.bottom ? insets.bottom : 20;

  return (
    <Modal
      visible={visibility}
      onBackdropPress={onCancel}
      onRequestClose={onCancel}
      animationType="slide"
      transparent={true}>
      <View style={[styles.centeredView]}>
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.modalView, { paddingBottom }]}>
          {states.type === CALENDAR_TYPES.DAILY && (
            <View style={[styles.headerContainer]}>
              <TextField>{renderDate}</TextField>
            </View>
          )}

          <View style={styles.bodyContainer}>
            <FullCalendar
              type={states.type}
              current={selectedDate}
              onDateChange={onDateChange}
              height={util.safePositiveValue(styles.bodyContainer.minHeight)}
              minDate={states.minDate}
              maxDate={states.maxDate}
            />
          </View>

          <View style={styles.divider} />

          <View style={[styles.footerContainer]}>
            <View style={styles.cancelContainer}>
              <ButtonField text={t('global.cancel')} onPress={onCancel} type="secondary" />
            </View>
            <ButtonField text={t('global.set')} onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default forwardRef(CalendarModal);
