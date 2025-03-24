import ButtonField from 'components/basics/ButtonField';
import CheckBox from 'components/basics/CheckBox';
import DynamicForm from 'components/basics/DynamicForm';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import { cloneDeep, get, isEmpty } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import BalanceForm from 'screens/MonthlyCheckUp/components/BalanceForm';
import { selectFlags } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.monthlyCheckUp';

const AddEditCheckUp = ({
  onSubmit,
  onCancel,
  type = 'add',
  formatDateTimeString,
  itemCheckUp,
  startDate,
  isFirstItem,
  balanceAsAt,
  handleSetUpMoneySMARTSTracking,
  onNavigate,
  onEnableTracking = () => {},
  enableTrackingDefault = false,
}) => {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { checkUpFlow } = useSelector(selectFlags);

  const isLegacyCheckupDate = balanceAsAt?.isLegacyCheckupDate;
  const [enableTracking, setEnableTracking] = useState(enableTrackingDefault);
  const [enableSubmit, setEnableSubmit] = useState(checkUpFlow ? false : true);

  const formRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);

  const formData = useMemo(() => {
    const formatFormJson = require('assets/forms/layouts/monthly-check-up.json');
    const newLayout = cloneDeep(formatFormJson);
    if (type === 'add') {
      let fields = get(newLayout, ['layout', 0, 'fields']);
      if (fields) {
        fields.forEach(field => {
          if (field.id === 'startDate') {
            field.visible = false;
            field.value = startDate;
          }
        });
      }
    }
    if (type === 'edit') {
      let fields = get(newLayout, ['layout', 0, 'fields']);
      if (fields) {
        fields.forEach(field => {
          if (field.id === 'startDate') {
            field.disable = true;
            if (checkUpFlow) {
              field.visible = false;
            } else {
              if (!isFirstItem) {
                field.visible = false;
              }
            }
            field.value = startDate;
          }
          if (field.id === 'primaryAccount') {
            field.value = get(itemCheckUp, ['primary'])?.toString();
          }
          if (field.id === 'creditCardAccount') {
            field.value = get(itemCheckUp, ['credit'])?.toString();
          }
        });
      }
    }
    return newLayout;
  }, [type, startDate, checkUpFlow, isFirstItem, itemCheckUp]);

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
    <View style={[styles.containerModal, AppStyle.padRight20]}>
      <KeyboardAwareFlatList
        ref={scrollRef}
        bounces={false}
        listKey={'dynamic-form'}
        data={[]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {checkUpFlow ? (
              <TextField type="heading-2" style={[AppStyle.textCenter, AppStyle.marginBottom20]}>
                {t(`${i18nScope}.moneySMARTSCheckUp`)}
              </TextField>
            ) : (
              <TextField type="heading-2" style={[AppStyle.textCenter, AppStyle.marginBottom20]}>
                {type === 'add'
                  ? t(`${i18nScope}.titleAddCheckUp`)
                  : t(`${i18nScope}.titleEditCheckUp`)}
              </TextField>
            )}

            {checkUpFlow && (
              <TextField style={styles.textContenAddCheckUp}>
                {t(`${i18nScope}.contentAddCheckUpV2`)}
              </TextField>
            )}
            {checkUpFlow && isLegacyCheckupDate && (
              <TextField style={styles.textContenAddCheckUpNote}>
                {t(`${i18nScope}.contentAddCheckUpV2Note`)}
              </TextField>
            )}
            {!checkUpFlow && type === 'add' && (
              <TextField style={styles.textContenAddCheckUp}>
                {t(`${i18nScope}.contentAddCheckUp`) + ' '}
                <TextField font="semi-bold" style={styles.textHighlightContenAddCheckUp}>
                  {!isEmpty(startDate)
                    ? moment(startDate).add(1, 'months').format(formatDateTimeString)
                    : moment().format(formatDateTimeString)}
                </TextField>
              </TextField>
            )}
            {!checkUpFlow && type === 'edit' && !isFirstItem && (
              <TextField style={styles.textContenAddCheckUp}>
                {t(`${i18nScope}.contentAddCheckUp`) + ' '}
                <TextField font="semi-bold" style={styles.textHighlightContenAddCheckUp}>
                  {moment(startDate).format(formatDateTimeString)}
                </TextField>
              </TextField>
            )}
            {checkUpFlow && isLegacyCheckupDate && (
              <View style={[AppStyle.marginTop20, AppStyle.marginBottom10]}>
                <CheckBox
                  value={enableTracking}
                  onChange={state => {
                    setEnableTracking(state);
                    onEnableTracking(state);
                  }}
                  label={t(`${i18nScope}.trackUsingCardBalances`)}
                />
              </View>
            )}
            {checkUpFlow && (!isLegacyCheckupDate || (isLegacyCheckupDate && enableTracking)) ? (
              <BalanceForm
                ref={formRef}
                onSubmit={formValues =>
                  onSubmit({
                    ...formValues,
                    isMoneySMARTSV2: true,
                    balanceAsAt: balanceAsAt,
                  })
                }
                onNavigate={onNavigate}
                styles={styles}
                data={balanceAsAt}
                handleSetUpMoneySMARTSTracking={handleSetUpMoneySMARTSTracking}
                itemCheckUp={itemCheckUp}
                startDate={startDate}
                isFirstItem={isFirstItem}
                balanceAsAt={balanceAsAt}
                onChangeData={_data => {
                  if (_data) {
                    const { accountBalance, creditCardBalance } = _data;
                    const hasAmount =
                      accountBalance?.some(x => x.amount != null && x.amount !== '') ||
                      creditCardBalance?.some(x => x.amount != null && x.amount !== '');
                    setEnableSubmit(hasAmount);
                  }
                }}
                enableTracking={enableTracking}
                defaultValue={enableTracking ? { checkupDate: balanceAsAt?.checkupDate } : null}
              />
            ) : (
              <View>
                {checkUpFlow && (
                  <View style={[AppStyle.rowFlex, AppStyle.justifyContent, AppStyle.marginTop10]}>
                    <View style={AppStyle.flex1}>
                      <TextField numberOfLines={1} font="medium" type="heading-4">
                        {t(`${i18nScope}.startDateSummaryText`)}
                      </TextField>
                    </View>
                    <View style={AppStyle.marginRight10} />
                    {startDate ? (
                      <TextField numberOfLines={1} font="medium" type="heading-4">
                        {type === 'add'
                          ? moment(startDate).add(1, 'months').format(formatDateTimeString)
                          : moment(startDate).format('DD/MM/YYYY')}
                      </TextField>
                    ) : null}
                  </View>
                )}

                <DynamicForm
                  ref={formRef}
                  data={formData}
                  onSubmit={formValues =>
                    onSubmit({
                      ...formValues,
                      isMoneySMARTSV2: checkUpFlow,
                      balanceAsAt: balanceAsAt,
                      isLegacyCard: true,
                    })
                  }
                  onError={onErrorForm}
                />
              </View>
            )}

            <View
              style={[
                AppStyle.rowFlex,
                AppStyle.spaceBetweenContent,
                AppStyle.marginTop20,
                AppStyle.marginBottom20,
              ]}>
              <ButtonField type="secondary" text={t('global.cancel')} onPress={onCancel} />
              <ButtonField
                type={
                  enableSubmit || (isLegacyCheckupDate && !enableTracking) ? 'primary' : 'disabled'
                }
                text={t(`${i18nScope}.btnCheckUp`)}
                onPress={() => formRef.current.submit()}
                disabled={!enableSubmit || (isLegacyCheckupDate && !enableTracking)}
              />
            </View>
            <TextField style={styles.textFooterModal}>
              {t(`${i18nScope}.textFooterModal`)}
            </TextField>
          </>
        }
      />
    </View>
  );
};

export default AddEditCheckUp;
