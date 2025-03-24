import { yupResolver } from '@hookform/resolvers/yup';
import CalendarIcon from 'assets/svgs/profile/calendar';
import i18n from 'bootstrap/i18n';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import ContentLoader from 'components/layouts/ContentLoader';
import { AppScreenID } from 'constant';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { formatDateTime } from 'libs/util';
import { debounce, get, isEmpty, map, sortBy } from 'lodash';
import moment from 'moment';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, View } from 'react-native';
import Balance from 'screens/MonthlyCheckUp/components/Balance';
import {
  changeStartDate,
  findBankAccountAndCreditCard,
  getBalancesAsAt,
  setStartDate,
} from 'store/MonthlyCheckUp/action';
import { AppStyle } from 'theme';
import * as yup from 'yup';

const formatDateString = 'DD MMM YYYY';

const i18nScope = 'screens.monthlyCheckUp';

const balanceSchema = yup
  .object()
  .shape({
    startDate: yup
      .date()
      .nullable()
      .transform(v => (v instanceof Date && !isNaN(v) ? v : null))
      .required(i18n.t('screens.monthlyCheckUp.requiredStartDate')),
    accountBalance: yup
      .array()
      .nullable()
      .of(
        yup.object().shape({
          _id: yup.string().required('_id is required'),
          name: yup.string().required('name is required'),
        }),
      )
      .test('sum-of-list', 'The sum > 100000000', list => {
        const sum = list.reduce((prev, curr) => Number(prev) + Number(curr?.amount ?? 0), 0);
        return sum <= 100000000;
      }),
    creditCardBalance: yup
      .array()
      .nullable()
      .of(
        yup.object().shape({
          _id: yup.string().required('_id is required'),
          name: yup.string().required('name is required'),
        }),
      )
      .test('sum-of-list', 'The sum > 10000000', list => {
        const sum = list.reduce((prev, curr) => Number(prev) + Number(curr?.amount ?? 0), 0);
        return sum <= 10000000;
      }),
  })
  .required();

const BalanceForm = (props, ref) => {
  const {
    onSubmit,
    onError,
    styles,
    data,
    defaultValue,
    handleSetUpMoneySMARTSTracking = () => {},
    onChangeData = () => {},

    balanceAsAt,
    onNavigate = () => {},
    enableTracking,
  } = props;
  const defaultValues = {
    startDate: defaultValue ? defaultValue.checkupDate : data ? data.checkupDate : '',
    accountBalance: data
      ? map(sortBy(data.bankAccounts, 'name'), item => ({ ...item, type: 'assets.bankAccounts' }))
      : [],
    creditCardBalance: data
      ? map(sortBy(data.creditCards, 'name'), item => ({ ...item, type: 'borrowings' }))
      : [],
  };
  const methods = useForm({
    defaultValues,
    resolver: yupResolver(balanceSchema),
    shouldFocusError: false,
  });
  const { control, handleSubmit, errors, setValue, getValues, watch } = methods;
  const dataFormErrors = useRef({});
  const dispatchResolve = useDispatchResolve();

  const watchFields = watch(['accountBalance', 'creditCardBalance']);
  useEffect(() => {
    onChangeData(watchFields);
  }, [watchFields]);

  const [bankAccountEmpty, setBankAccountEmpty] = useState(false);
  const [creditCardEmpty, setCreditCardEmpty] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkupDateDefault = useMemo(() => defaultValues?.startDate, [defaultValues]);

  const submit = useCallback(
    callback => {
      const _loading = GlobalLib.Loading.get();
      _loading.show();
      handleSubmit(
        formData => {
          _loading.hide();
          Keyboard.dismiss();
          typeof onSubmit === 'function' && onSubmit(formData, callback);
        },
        formError => {
          _loading.hide();
          Keyboard.dismiss();
          let firstKey;
          typeof onError === 'function' && onError(formError, dataFormErrors.current, firstKey);
        },
      )();
    },
    [handleSubmit, onError, onSubmit],
  );

  const fetchBalances = useCallback(
    date => {
      if (date) {
        setLoading(true);
        dispatchResolve(getBalancesAsAt({ date: UtilLib.dateUTCAsAt(date).toISOString() }))
          .then(response => {
            const bankAccounts = sortBy(
              response
                ?.filter(
                  item =>
                    !item?.isArchived ||
                    (item?.isArchived && moment(date).isBefore(moment(item.archiveDate))),
                )
                ?.filter(x => x.type === 'assets.bankAccounts'),
              'name',
            );
            const creditCards = sortBy(
              response
                ?.filter(
                  item =>
                    !item?.isArchived ||
                    (item?.isArchived && moment(date).isBefore(moment(item.archiveDate))),
                )
                .filter(x => x.type === 'borrowings'),
              'name',
            );

            setValue('startDate', date);
            setValue('accountBalance', bankAccounts);
            setValue('creditCardBalance', creditCards);
          })
          .finally(() => setLoading(false));
      }
    },
    [dispatchResolve, setValue],
  );

  const findBankAccountAndCreditCardAction = useCallback(() => {
    dispatchResolve(findBankAccountAndCreditCard()).then(response => {
      if (response?.data) {
        let bankAccountExisted = false;
        let creditCardExisted = false;
        response?.data.forEach(e => {
          if (e.type === 'assets' && e.item?.typeValue === 'Bank Accounts') {
            bankAccountExisted = true;
          }
          if (
            e.type === 'borrowings' &&
            (e.item?.typeValue?.includes('Line of Credit') ||
              e.item?.typeValue?.includes('Credit Card'))
          ) {
            creditCardExisted = true;
          }
        });
        setBankAccountEmpty(!bankAccountExisted);
        setCreditCardEmpty(!creditCardExisted);
      }
    });
  }, [dispatchResolve]);

  const refresh = useCallback(
    checkupDateProp => {
      fetchBalances(checkupDateProp ?? checkupDateDefault);
      findBankAccountAndCreditCardAction();
    },
    [fetchBalances, findBankAccountAndCreditCardAction, checkupDateDefault],
  );

  useEffect(() => {
    if (data || checkupDateDefault || enableTracking) {
      findBankAccountAndCreditCardAction();
    }
    if (checkupDateDefault) {
      fetchBalances(checkupDateDefault);
    }
  }, [data, fetchBalances, checkupDateDefault]);

  useImperativeHandle(ref, () => ({
    submit,
    refresh,
  }));

  const handleNewBankAccount = useCallback(() => {
    const startDateValue = getValues('startDate');
    onNavigate();
    NavigationServiceLib.navigate('add_asset', {
      startDate: startDateValue,
      nextStepData: { type: 'Bank Accounts' },
    });
  }, []);

  const handleNewCreditCards = useCallback(() => {
    const startDateValue = getValues('startDate');
    onNavigate();
    NavigationServiceLib.navigate('borrowing', {
      startDate: startDateValue,
      nextStepData: { mortgageType: '', type: 'Credit Card' },
    });
  }, []);

  const onCardPress = useCallback(item => {
    const _id = get(item, '_id');
    const cardType = get(item, 'type');
    const name = get(item, 'name');
    const itemValue = {
      id: [_id],
      name,
      ...(cardType === 'assets.bankAccounts'
        ? {
            typeValue: 'Bank Accounts',
          }
        : {}),
    };
    switch (cardType) {
      case 'borrowings':
        GlobalLib.CustomModal.get().hide();
        NavigationServiceLib.navigate(AppScreenID.Borrowing, {
          borrowing: itemValue,
          openDetailsTab: true,
        });
        break;
      case 'assets.bankAccounts':
        GlobalLib.CustomModal.get().hide();
        NavigationServiceLib.navigate(AppScreenID.EditAsset, {
          item: itemValue,
          openDetailsTab: true,
        });
        break;
      default:
        break;
    }
  }, []);

  const onCardPressDebounce = debounce(balance => {
    if (typeof onCardPress === 'function') {
      onCardPress(balance);
    }
  }, 200);

  return (
    <>
      <View style={loading ? AppStyle.marginTop20 : AppStyle.hidden}>
        <ContentLoader name="balance_form_loading" />
      </View>
      <View style={loading ? AppStyle.hidden : undefined}>
        <Controller
          control={control}
          name={'startDate'}
          render={({ onChange, value }) => (
            <View>
              {!data && (
                <InputField
                  value={value ? formatDateTime(value, formatDateString) : ''}
                  label={i18n.t(`${i18nScope}.startDate`)}
                  placeholder={formatDateString}
                  required
                  editable={false}
                  onPress={() => {
                    GlobalLib.CalendarModal.get().show({
                      current: value || new Date(),
                      onConfirm: dateValue => {
                        onChange(dateValue);
                        dispatchResolve(setStartDate(dateValue));
                        fetchBalances(dateValue);
                        const startDateValue = new Date(dateValue).toISOString();
                        dispatchResolve(changeStartDate(startDateValue)).then(() => {
                          dispatchResolve(setStartDate(undefined));
                        });
                      },
                    });
                  }}
                  RightComponent={() => <CalendarIcon />}
                  error={errors.startDate?.message}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    this.secondTextInput.focus();
                  }}
                  blurOnSubmit={false}
                />
              )}
              <View style={AppStyle.marginTop10} />
              <View style={[AppStyle.rowFlex, AppStyle.justifyContent]}>
                <View style={AppStyle.flex1}>
                  <TextField numberOfLines={1} font="semi-bold" type="heading-3">
                    {i18n.t(`${i18nScope}.startDateSummaryText`)}
                  </TextField>
                </View>
                <View style={AppStyle.marginRight10} />
                {value ? (
                  <TextField numberOfLines={1} font="semi-bold" type="heading-3">
                    {moment(value).format('DD/MM/YYYY')}
                  </TextField>
                ) : null}
              </View>
            </View>
          )}
        />
        <View style={AppStyle.marginTop20} />

        <Controller
          control={control}
          name={'accountBalance'}
          render={({ onChange, value }) => (
            <View>
              {isEmpty(value) ? (
                bankAccountEmpty ? (
                  <TextField style={styles.textError}>
                    {i18n.t(`${i18nScope}.notFoundItemTracking1`, { type: 'Bank Account' })}
                    <TextField
                      style={styles.textErrorWithLink}
                      suppressHighlighting={true}
                      onPress={() => {
                        const startDateValue = getValues('startDate');
                        handleNewBankAccount(startDateValue);
                      }}>
                      {i18n.t(`${i18nScope}.notFoundItemTrackingClickHere`)}
                    </TextField>
                    {i18n.t(`${i18nScope}.notFoundItemTracking2`)}
                  </TextField>
                ) : (
                  <TextField style={styles.textError}>
                    {i18n.t(`${i18nScope}.notSetupTracking`, { type: 'Bank Accounts' })}
                    <TextField
                      style={styles.textErrorWithLink}
                      suppressHighlighting={true}
                      onPress={() => {
                        const startDateValue = getValues('startDate');
                        handleSetUpMoneySMARTSTracking(startDateValue);
                      }}>
                      {' click here.'}
                    </TextField>
                  </TextField>
                )
              ) : null}
              <Balance
                {...{
                  totalText: i18n.t(`${i18nScope}.accountBalanceTotalText`),
                  type: 'account',
                  value,
                  onChange,
                  error: errors.accountBalance?.message,
                  styles,
                  onPress: onCardPressDebounce,
                }}
              />
            </View>
          )}
        />
        <View style={AppStyle.marginTop20} />
        <Controller
          control={control}
          name={'creditCardBalance'}
          render={({ onChange, value }) => (
            <View>
              {isEmpty(value) ? (
                creditCardEmpty ? (
                  <TextField style={styles.textError}>
                    {i18n.t(`${i18nScope}.notFoundItemTracking1`, { type: 'Credit Card' })}
                    <TextField
                      style={styles.textErrorWithLink}
                      suppressHighlighting={true}
                      onPress={handleNewCreditCards}>
                      {i18n.t(`${i18nScope}.notFoundItemTrackingClickHere`)}
                    </TextField>
                    {i18n.t(`${i18nScope}.notFoundItemTracking2`)}
                  </TextField>
                ) : (
                  <TextField style={styles.textError}>
                    {i18n.t(`${i18nScope}.notSetupTracking`, { type: 'Credit Cards' })}
                    <TextField
                      style={styles.textErrorWithLink}
                      suppressHighlighting={true}
                      onPress={() => {
                        const startDateValue = getValues('startDate');
                        handleSetUpMoneySMARTSTracking(startDateValue);
                      }}>
                      {' click here.'}
                    </TextField>
                  </TextField>
                )
              ) : null}
              <Balance
                {...{
                  totalText: i18n.t(`${i18nScope}.creditCardBalanceTotalText`),
                  type: 'creditCard',
                  value,
                  onChange,
                  error: errors.creditCardBalance?.message,
                  styles,
                  onPress: onCardPressDebounce,
                }}
              />
            </View>
          )}
        />
      </View>
    </>
  );
};

export default forwardRef(BalanceForm);
