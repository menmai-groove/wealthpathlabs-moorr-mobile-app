import { yupResolver } from '@hookform/resolvers/yup';
import CalendarIcon from 'assets/svgs/profile/calendar';
import EmailIcon from 'assets/svgs/profile/email';
import UserIcon from 'assets/svgs/profile/user';
import Avatar from 'components/basics/Avatar';
import ButtonField from 'components/basics/ButtonField';
import InputField from 'components/basics/InputField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import Header from 'components/layouts/Header';
import { AppConstants, AppScreenID } from 'constant';
import { GlobalLib, NavigationServiceLib, SchemaLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { formatDateTime } from 'libs/util';
import { useThemedStyle, withBackHandler } from 'providers';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Keyboard, RefreshControl, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { getProfile, updateUser, updateUserHousehold } from 'store/Auth/action';
import { selectUser } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.profile';
const formatDateString = 'DD MMM YYYY';
function Profile() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const insets = useSafeAreaInsets();
  const user = useSelector(selectUser);
  const householdType = user.householdType;

  const [refreshing, setRefreshing] = useState(false);
  const dispatchResolve = useDispatchResolve();

  const scrollRef = useRef();
  const scrollTimeout = useRef();
  const firstNameInput = useRef(null);
  const lastNameInput = useRef(null);
  const dobInput = useRef(null);
  const emailInput = useRef(null);
  const householdInput = useRef(null);
  const mPhoneInput = useRef(null);

  const dataFormErrors = useRef({});

  const defaultValues = useMemo(
    () => ({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      dob: user?.dob ?? null,
      email: user?.email ?? '',
      household: householdType,
      mPhone: user?.mPhone ?? '',
    }),
    [householdType, user],
  );

  const { handleSubmit, control, errors } = useForm({
    defaultValues,
    resolver: yupResolver(SchemaLib.updateProfileSchema),
    shouldFocusError: false,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchResolve(getProfile()).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);

  const onSubmitData = useCallback(
    async data => {
      Keyboard.dismiss();
      const isPartner = user?.partnerUID;
      if (isPartner) {
        // NOTE: update partner
        const currentPartner = {
          _id: user?._id,
          partnerFirstName: data?.firstName,
          partnerLastName: data?.lastName,
          partnerDob: data?.dob?.toISOString(),
          partnerEmail: data?.email,
          partnerMPhone: data?.mPhone,
          dependants: user?.dependants,
        };
        await dispatchResolve(updateUserHousehold(currentPartner));
        GlobalLib.Toast.get().toastSuccess(t(`${i18nScope}.msgUpdateProfileSuccess`));
        return;
      }
      // NOTE: update primary user
      const currentUser = {
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob?.toISOString(),
        email: data.email,
        mPhone: data.mPhone,
      };
      await dispatchResolve(updateUser(currentUser));
      GlobalLib.Toast.get().toastSuccess(t(`${i18nScope}.msgUpdateProfileSuccess`));
    },
    [dispatchResolve, t, user],
  );

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
    (formErrors, dataFormErrorsCurrent, firstKey) => {
      if (firstKey) {
        scrollToElement(dataFormErrorsCurrent[firstKey]?.componentRef);
      }
    },
    [scrollToElement],
  );

  const onErrorData = useCallback(
    formError => {
      Keyboard.dismiss();
      let firstKey;
      let minOffset;
      const fieldIds = SchemaLib.getFormErrorFieldIds(formError);
      for (let i in fieldIds) {
        const key = fieldIds[i];
        if (!firstKey || dataFormErrors.current[key]?.offsetY < minOffset) {
          minOffset = dataFormErrors.current[key]?.offsetY;
          firstKey = key;
        }
      }
      typeof onErrorForm === 'function' && onErrorForm(formError, dataFormErrors.current, firstKey);
    },
    [onErrorForm],
  );

  const updateDataFormErrors = (key, data) => {
    dataFormErrors.current[key] = {
      ...dataFormErrors.current[key],
      ...data,
    };
  };

  return (
    <View style={styles.container}>
      <Header type="back" title={t(`${i18nScope}.title`)} />
      <KeyboardAwareScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ref={scrollRef}
        style={AppStyle.flex1}
        contentContainerStyle={
          insets.bottom > 0 ? { paddingBottom: insets.bottom } : AppStyle.padBottom15
        }
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}>
        <View style={[AppStyle.padX20, AppStyle.padBottom20]}>
          <View style={AppStyle.middleContent}>
            <Avatar size={100}>{user?.fullName}</Avatar>
          </View>
          <View style={styles.title}>
            <TextField type="heading-3">{user?.fullName}</TextField>
          </View>

          <View
            style={styles.formBlock}
            collapsable={false}
            onLayout={({ nativeEvent }) => {
              updateDataFormErrors('firstName', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('firstName', {
                componentRef: element,
              });
            }}>
            <Controller
              name="firstName"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputField
                  ref={firstNameInput}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={() => lastNameInput.current.focus()}
                  error={errors.firstName?.message}
                  label={t(`${i18nScope}.firstName`)}
                  placeholder={t(`${i18nScope}.firstNamePlaceholder`)}
                  required
                  RightComponent={() => <UserIcon />}
                />
              )}
            />
          </View>

          <View
            style={styles.formBlock}
            collapsable={false}
            onLayout={({ nativeEvent }) => {
              updateDataFormErrors('lastName', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('lastName', {
                componentRef: element,
              });
            }}>
            <Controller
              name="lastName"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputField
                  ref={lastNameInput}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  error={errors.lastName?.message}
                  label={t(`${i18nScope}.lastName`)}
                  placeholder={t(`${i18nScope}.lastNamePlaceholder`)}
                  required
                  RightComponent={() => <UserIcon />}
                />
              )}
            />
          </View>

          <View
            style={styles.formBlock}
            collapsable={false}
            onLayout={({ nativeEvent }) => {
              updateDataFormErrors('dob', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('dob', {
                componentRef: element,
              });
            }}>
            <Controller
              name="dob"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputField
                  ref={dobInput}
                  value={value ? formatDateTime(value, formatDateString) : ''}
                  onBlur={onBlur}
                  onSubmitEditing={() => emailInput.current.focus()}
                  error={errors.dob?.message}
                  label={t(`${i18nScope}.dob`)}
                  placeholder={t(`${i18nScope}.dobPlaceholder`)}
                  required
                  editable={false}
                  onPress={() => {
                    GlobalLib.CalendarModal.get().show({
                      current: value || new Date(),
                      onConfirm: date => {
                        onChange(date);
                      },
                    });
                  }}
                  RightComponent={() => <CalendarIcon />}
                />
              )}
            />
          </View>

          <View
            style={styles.formBlock}
            collapsable={false}
            onLayout={({ nativeEvent }) => {
              updateDataFormErrors('mPhone', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('mPhone', {
                componentRef: element,
              });
            }}>
            <Controller
              name="mPhone"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputField
                  ref={mPhoneInput}
                  returnKeyType={'next'}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={() => mPhoneInput.current.focus()}
                  error={errors.mPhone?.message}
                  label={t(`${i18nScope}.phone`)}
                  placeholder={t(`${i18nScope}.phonePlaceholder`)}
                />
              )}
            />
          </View>

          <View
            style={styles.formBlock}
            collapsable={false}
            onLayout={({ nativeEvent }) => {
              updateDataFormErrors('email', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('email', {
                componentRef: element,
              });
            }}>
            <Controller
              name="email"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputField
                  ref={emailInput}
                  returnKeyType={'next'}
                  value={value}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={() => householdInput.current.focus()}
                  error={errors.email?.message}
                  label={t(`${i18nScope}.email`)}
                  placeholder={t(`${i18nScope}.emailPlaceholder`)}
                  required
                  readonly
                  RightComponent={() => <EmailIcon />}
                />
              )}
            />
          </View>
          <TextField style={styles.formBlock}>{t(`${i18nScope}.household`)}</TextField>
          <TouchableOpacity
            style={styles.buttonHousehold}
            onPress={() => {
              NavigationServiceLib.navigate(AppScreenID.HouseholdDetail);
            }}>
            <TextField style={styles.textHousehold}>
              {AppConstants.householdName[householdType]}
            </TextField>
            <View style={styles.iconWrapper}>
              <FAIcon name="caret-right" size={16} />
            </View>
          </TouchableOpacity>
          <ButtonField
            style={AppStyle.marginTop40}
            text={t(`${i18nScope}.btnUpdate`)}
            onPress={handleSubmit(onSubmitData, onErrorData)}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withBackHandler)(Profile);
