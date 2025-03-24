// https://amanhimself.dev/blog/custom-scroll-bar-indicator-with-react-native-animated-api/
import { yupResolver } from '@hookform/resolvers/yup';
import CalendarIcon from 'assets/svgs/profile/calendar';
import i18n from 'bootstrap/i18n';
import ButtonField from 'components/basics/ButtonField';
import CustomTooltip from 'components/basics/CustomTooltip';
import InputField from 'components/basics/InputField';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import ContentLoader from 'components/layouts/ContentLoader';
import { AppScreenID } from 'constant';
import { GlobalLib, NavigationServiceLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { formatDateTime } from 'libs/util';
import { debounce, get, sortBy } from 'lodash';
import moment from 'moment';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Keyboard, Platform, View } from 'react-native';
import BalanceV2, { RADIO_GROUP_WIDTH } from 'screens/MonthlyCheckUp/components/BalanceV2';
import { getMoneySMARTSTrackingCards } from 'store/MonthlyCheckUp/action';
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
    bankAccounts: yup.array(),
    creditCards: yup.array(),
    lineCredits: yup.array(),
  })
  .required();

const BalanceFormV2 = (props, ref) => {
  const {
    header,
    content,
    description,
    t,
    onSubmit,
    onCancel,
    onError,
    styles,
    data,
    defaultValue,
    height = 300,
    onStartDateChange,
  } = props;
  const startDate = defaultValue ? defaultValue.checkupDate : data ? data.checkupDate : '';
  const defaultValues = {
    startDate,
    bankAccounts: [],
    creditCards: [],
    lineCredits: [],
  };
  const methods = useForm({
    defaultValues,
    resolver: yupResolver(balanceSchema),
    shouldFocusError: false,
  });
  const { control, handleSubmit, errors, setValue, getValues } = methods;
  const dataFormErrors = useRef({});
  const scrollRef = useRef(null);
  const dispatchResolve = useDispatchResolve();
  const [bankAccountsData, setBankAccountsData] = useState([]);
  const [borrowingsData, setBorrowingsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const submit = useCallback(
    callback => {
      const loadingView = GlobalLib.Loading.get();
      loadingView.show();
      handleSubmit(
        formData => {
          const newFormData = getValues();
          loadingView.hide();
          Keyboard.dismiss();
          const metaData = {
            bankAccountsData,
            borrowingsData,
          };
          typeof onSubmit === 'function' && onSubmit(newFormData, metaData);
        },
        formError => {
          loadingView.hide();
          Keyboard.dismiss();
          let firstKey;
          typeof onError === 'function' && onError(formError, dataFormErrors.current, firstKey);
        },
      )();
    },
    [handleSubmit, onError, onSubmit, bankAccountsData, borrowingsData],
  );

  const fetchBalances = useCallback(
    date => {
      if (date) {
        setLoading(true);
        dispatchResolve(getMoneySMARTSTrackingCards(date))
          .then(response => {
            const bankAccounts = sortBy(
              get(response, 'bankAccounts')
                .filter(item => !item?.isArchived)
                .map(item => ({
                  _id: item?._id,
                  name: item?.name,
                  type: 'assets.bankAccounts',
                  amount: item?.balance,
                  isTrackedInMoneySmarts: item?.isTrackedInMoneySmarts,
                })),
              'name',
            );
            const borrowings = get(response, 'borrowings')
              .filter(item => !item?.isArchived)
              .map(item => ({
                _id: item?._id,
                name: item?.name,
                type: item?.type,
                amount: item?.outstanding,
                isTrackedInMoneySmarts: item?.isTrackedInMoneySmarts,
              }));
            setBankAccountsData(bankAccounts);
            setBorrowingsData(borrowings);
            const creditCards = sortBy(
              borrowings
                .filter(borrowing => String(borrowing.type).includes('Credit Card'))
                .map(item => ({
                  ...item,
                  type: 'borrowings',
                })),
              'name',
            );
            const lineCredits = sortBy(
              borrowings
                .filter(borrowing => String(borrowing.type).includes('Line of Credit'))
                .map(item => ({
                  ...item,
                  type: 'borrowings',
                })),
              'name',
            );
            setValue('bankAccounts', bankAccounts);
            setValue('creditCards', creditCards);
            setValue('lineCredits', lineCredits);
          })
          .finally(() => setLoading(false));
      }
    },
    [dispatchResolve, setValue],
  );

  useEffect(() => {
    if (data || defaultValue?.checkupDate) {
      fetchBalances(data?.checkupDate ?? defaultValue?.checkupDate);
    }
  }, [data, defaultValue]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      Platform.OS === 'android' && setShow(false);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {});

    // Clean up the listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    submit,
  }));

  const handleNewBankAccount = useCallback(() => {
    GlobalLib.CustomModal.get().hide();
    const startDateValue = getValues('startDate');
    NavigationServiceLib.navigate('add_asset', {
      startDate: startDateValue,
      nextStepData: { type: 'Bank Accounts' },
    });
  }, [onCancel]);

  const handleNewCreditCards = useCallback(() => {
    GlobalLib.CustomModal.get().hide();
    const startDateValue = getValues('startDate');
    NavigationServiceLib.navigate('borrowing', {
      startDate: startDateValue,
      nextStepData: { mortgageType: '', type: 'Credit Card' },
    });
  }, [onCancel]);

  const handleNewLineCredits = useCallback(() => {
    GlobalLib.CustomModal.get().hide();
    const startDateValue = getValues('startDate');
    NavigationServiceLib.navigate('borrowing', {
      startDate: startDateValue,
      nextStepData: { mortgageType: '', type: 'Mortgage' },
      filter: 'Line of Credit',
    });
  }, [onCancel]);

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

  const [completeScrollBarHeight, setCompleteScrollBarHeight] = useState(1);
  const [visibleScrollBarHeight, setVisibleScrollBarHeight] = useState(0);

  const scrollIndicator = useRef(new Animated.Value(0)).current;

  const scrollIndicatorSize =
    completeScrollBarHeight > visibleScrollBarHeight
      ? (visibleScrollBarHeight * visibleScrollBarHeight) / completeScrollBarHeight
      : visibleScrollBarHeight;

  const difference =
    visibleScrollBarHeight > scrollIndicatorSize ? visibleScrollBarHeight - scrollIndicatorSize : 1;

  const scrollIndicatorPosition = Animated.multiply(
    scrollIndicator,
    visibleScrollBarHeight / completeScrollBarHeight,
  ).interpolate({
    inputRange: [0, difference],
    outputRange: [0, difference],
    extrapolate: 'clamp',
  });

  const setBelowFieldsText = i18n.t(`${i18nScope}.setBelowFieldsText`);
  const bankAccountLeftHeader = i18n.t(`${i18nScope}.bankAccountLeftHeader`);
  const bankAccountRightHeader = i18n.t(`${i18nScope}.bankAccountRightHeader`);
  const addNewBankText = i18n.t(`${i18nScope}.addNewBankText`);
  const creditCardHeader = i18n.t(`${i18nScope}.creditCardHeader`);
  const addNewCreditCardText = i18n.t(`${i18nScope}.addNewCreditCardText`);
  const lineCreditCardHeader = i18n.t(`${i18nScope}.lineCreditCardHeader`);
  const addNewLineCreditCardText = i18n.t(`${i18nScope}.addNewLineCreditCardText`);

  return (
    <>
      <View
        style={[
          loading
            ? [AppStyle.marginTop20, AppStyle.pad20, styles.loadingContainer]
            : AppStyle.hidden,
        ]}>
        <View style={[AppStyle.rowFlex, AppStyle.alignContent, AppStyle.spaceBetweenContent]}>
          <View>
            <TextField type="heading-2">{header}</TextField>
          </View>
          <View>
            <CustomTooltip
              hideArrow
              placement="bottom"
              content={<TextField type="captain">{content}</TextField>}
              tooltipStyle={styles.tooltipStyle}
            />
          </View>
        </View>

        <TextField style={styles.textContentAddCheckUp}>{description}</TextField>

        <View
          style={[
            AppStyle.marginTop10,
            {
              height,
            },
          ]}>
          <ContentLoader name="balance_form_2_loading" />
        </View>
      </View>

      <View style={[loading ? AppStyle.hidden : styles.containerModal]}>
        <KeyboardAwareFlatList
          ref={scrollRef}
          bounces={false}
          listKey={'dynamic-form'}
          data={[]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={[AppStyle.rowFlex, AppStyle.alignContent, AppStyle.spaceBetweenContent]}>
                <View style={AppStyle.flex1}>
                  <TextField type="heading-2">{header}</TextField>
                </View>
                <View>
                  <CustomTooltip
                    hideArrow
                    placement="bottom"
                    content={<TextField type="captain">{content}</TextField>}
                    tooltipStyle={styles.tooltipStyle}
                  />
                </View>
              </View>

              <TextField style={styles.textContentAddCheckUp}>{description}</TextField>

              <View>
                <View>
                  <Controller
                    control={control}
                    name={'startDate'}
                    render={({ onChange, value }) => (
                      <View>
                        <View
                          style={[AppStyle.marginTop10, AppStyle.rowFlex, AppStyle.alignContent]}>
                          <View style={AppStyle.flex1}>
                            <TextField>{setBelowFieldsText}</TextField>
                          </View>
                          <View style={[AppStyle.flex1, AppStyle.rowFlex, AppStyle.alignEnd]}>
                            {!data && (
                              <InputField
                                // ref={dobInput}
                                value={value ? formatDateTime(value, formatDateString) : ''}
                                // onBlur={onBlur}
                                // onSubmitEditing={() => emailInput.current.focus()}
                                // error={errors.dob?.message}
                                // label={t(`${i18nScope}.dob`)}
                                // label={i18n.t(`${i18nScope}.startDate`)}
                                // label="Start Date"
                                // placeholder={t(`${i18nScope}.dobPlaceholder`)}
                                placeholder={formatDateString}
                                required
                                editable={false}
                                onPress={() => {
                                  GlobalLib.CalendarModal.get().show({
                                    current: value || new Date(),
                                    onConfirm: dateValue => {
                                      onChange(dateValue);
                                      typeof onStartDateChange === 'function'
                                        ? onStartDateChange(dateValue)
                                        : undefined;
                                      fetchBalances(dateValue);
                                    },
                                    maxDate: moment(new Date()).format('YYYY-MM-DD'),
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
                          </View>
                        </View>
                      </View>
                    )}
                  />
                  <View style={AppStyle.marginTop20} />
                  <Controller
                    control={control}
                    name={'bankAccounts'}
                    render={({ onChange, value }) => (
                      <BalanceV2
                        {...{
                          totalText: i18n.t(`${i18nScope}.accountBalanceTotalText`),
                          type: 'account',
                          value,
                          onChange,
                          error: errors.accountBalance?.message,
                          styles,
                          header: (
                            <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                              <View style={AppStyle.flex1}>
                                <TextField
                                  style={AppStyle.textAlign}
                                  numberOfLines={2}
                                  font="semi-bold"
                                  type="heading-3">
                                  {bankAccountLeftHeader}
                                </TextField>
                              </View>
                              <View style={{ width: RADIO_GROUP_WIDTH }}>
                                <TextField
                                  style={AppStyle.textAlign}
                                  numberOfLines={2}
                                  font="semi-bold"
                                  type="heading-3">
                                  {bankAccountRightHeader}
                                </TextField>
                              </View>
                            </View>
                          ),
                          footerText: addNewBankText,
                          onFooterPress: handleNewBankAccount,
                          loading,
                          onPress: onCardPressDebounce,
                        }}
                      />
                    )}
                  />
                  <View style={AppStyle.marginTop5} />
                  <Controller
                    control={control}
                    name={'creditCards'}
                    render={({ onChange, value }) => (
                      <BalanceV2
                        {...{
                          totalText: i18n.t(`${i18nScope}.creditCardBalanceTotalText`),
                          type: 'creditCard',
                          value,
                          onChange,
                          error: errors.creditCardBalance?.message,
                          styles,
                          header: (
                            <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                              <View style={AppStyle.flex1}>
                                <TextField
                                  style={AppStyle.textAlign}
                                  numberOfLines={2}
                                  font="semi-bold"
                                  type="heading-3">
                                  {creditCardHeader}
                                </TextField>
                              </View>
                              <View style={AppStyle.flex1} />
                            </View>
                          ),
                          footerText: addNewCreditCardText,
                          onFooterPress: handleNewCreditCards,
                          loading,
                          onPress: onCardPressDebounce,
                        }}
                      />
                    )}
                  />
                  <View style={AppStyle.marginTop5} />
                  <Controller
                    control={control}
                    name={'lineCredits'}
                    render={({ onChange, value }) => (
                      <BalanceV2
                        {...{
                          totalText: i18n.t(`${i18nScope}.creditCardBalanceTotalText`),
                          type: 'creditCard',
                          value,
                          onChange,
                          error: errors.creditCardBalance?.message,
                          styles,
                          header: (
                            <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                              <View style={AppStyle.flex1}>
                                <TextField
                                  style={AppStyle.textAlign}
                                  numberOfLines={2}
                                  font="semi-bold"
                                  type="heading-3">
                                  {lineCreditCardHeader}
                                </TextField>
                              </View>
                              <View style={AppStyle.flex1} />
                            </View>
                          ),
                          footerText: addNewLineCreditCardText,
                          onFooterPress: handleNewLineCredits,
                          onPress: onCardPress,
                        }}
                      />
                    )}
                  />
                </View>
              </View>

              <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.marginTop20]}>
                <ButtonField type="secondary" text={t('global.cancel')} onPress={onCancel} />
                <ButtonField text={t('global.confirm')} onPress={submit} />
              </View>
            </>
          }
          scrollEventThrottle={16}
          onContentSizeChange={
            Platform.OS === 'android'
              ? debounce((_, heightValue) => {
                  setCompleteScrollBarHeight(heightValue);
                  setShow(true);
                }, 700)
              : (_, heightValue) => {
                  setCompleteScrollBarHeight(heightValue);
                }
          }
          onLayout={({
            nativeEvent: {
              layout: { height: heightValue },
            },
          }) => {
            setVisibleScrollBarHeight(heightValue);
          }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollIndicator } } }], {
            useNativeDriver: false,
          })}
        />

        <View
          style={[
            AppStyle.justifyContent,
            difference === 1 ? styles.scrollbarIndicatorHidden : styles.scrollbarIndicatorVisible,
            Platform.OS === 'android'
              ? show
                ? styles.scrollbarIndicatorVisible
                : styles.scrollbarIndicatorHidden
              : undefined,
          ]}>
          <View>
            <View
              style={[
                styles.scrollbarIndicatorContainer,
                {
                  height: visibleScrollBarHeight,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.scrollbarIndicatorItem,
                {
                  height: scrollIndicatorSize,
                  transform: [{ translateY: scrollIndicatorPosition }],
                },
              ]}
            />
          </View>
        </View>
      </View>
    </>
  );
};

export default forwardRef(BalanceFormV2);
