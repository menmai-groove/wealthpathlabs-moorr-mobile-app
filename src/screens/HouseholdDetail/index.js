import { yupResolver } from '@hookform/resolvers/yup';
import CalendarIcon from 'assets/svgs/profile/calendar';
import Accordion from 'components/basics/Accordion';
import ButtonField from 'components/basics/ButtonField';
import InputField from 'components/basics/InputField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import Header from 'components/layouts/Header';
import { AppConstants } from 'constant';
import { GlobalLib, SchemaLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { formatDateTime } from 'libs/util';
import { isEmpty } from 'lodash';
import { useThemedStyle, withBackHandler } from 'providers';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Keyboard, RefreshControl, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import ButtonAddHousehold from 'screens/HouseholdDetail/components/ButtonAddHousehold';
import FormAddDependant from 'screens/HouseholdDetail/components/FormAddDependant';
import { getProfile, updateUser, updateUserHousehold } from 'store/Auth/action';
import { selectUser } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.householdDetail';
const formatDateString = 'DD MMM YYYY';
function HouseholdDetail() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const user = useSelector(selectUser);

  const [refreshing, setRefreshing] = useState(false);
  const [accordionValue, setAccordionValue] = useState(true);
  const [partnerInfo, setPartnerInfo] = useState(user?.partner);
  const dispatchResolve = useDispatchResolve();

  const scrollRef = useRef();
  const scrollTimeout = useRef();
  const householdInput = useRef(null);

  const dataFormErrors = useRef({});

  const defaultValues = useMemo(
    () => ({
      partnerFirstName: user?.partner?.firstName ?? '',
      partnerLastName: user?.partner?.lastName ?? '',
      partnerDob: user?.partner?.dob ?? null,
      partnerEmail: user?.partner?.email ?? '',
      partnerMPhone: user?.partner?.mPhone ?? '',
      dependants: user?.dependants || [],
    }),
    [user],
  );

  const { handleSubmit, control, errors, getValues, watch } = useForm({
    defaultValues,
    resolver: yupResolver(SchemaLib.updateHouseholdSchema),
    shouldFocusError: false,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dependants',
  });
  const watchDependants = watch('dependants');
  const partnerFirstNameInput = useRef(null);
  const partnerLastNameInput = useRef(null);
  const partnerDobInput = useRef(null);
  const partnerEmailInput = useRef(null);
  const partnerMPhoneInput = useRef(null);
  const partnerNoOfKidsInput = useRef(null);

  const [householdType, setHouseholdType] = useState(user?.householdType || 0);

  useEffect(() => {
    let type;
    let { dependants = [] } = getValues();
    if (isEmpty(partnerInfo._id)) {
      type =
        dependants.length > 0
          ? AppConstants.householdType.meKids
          : AppConstants.householdType.justMe;
    } else {
      type =
        dependants.length > 0
          ? AppConstants.householdType.usKids
          : AppConstants.householdType.mePartner;
    }
    setHouseholdType(type);
  }, [getValues, partnerInfo, watchDependants]);

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
        // NOTE: update primary user
        const currentUser = {
          firstName: data.partnerFirstName,
          lastName: data.partnerLastName,
          dob:
            typeof data.partnerDob === 'object' ? data.partnerDob?.toISOString() : data.partnerDob,
          email: data.partnerEmail,
          mPhone: data.partnerMPhone,
        };
        await dispatchResolve(updateUser(currentUser));

        const hasDependants = data?.dependants;
        if (hasDependants) {
          const partner = {
            dependants: data?.dependants,
          };
          // NOTE: update dependants and primary user
          await dispatchResolve(updateUserHousehold(partner));
        }
        GlobalLib.Toast.get().toastSuccess(t(`${i18nScope}.msgUpdateHouseholdSuccess`));
        return;
      }
      // NOTE: update partner
      const partner = {
        _id: partnerInfo?._id,
        partnerFirstName: data?.partnerFirstName,
        partnerLastName: data?.partnerLastName,
        partnerDob:
          typeof data.partnerDob === 'object' ? data.partnerDob?.toISOString() : data.partnerDob,
        partnerEmail: data?.partnerEmail,
        partnerMPhone: data?.partnerMPhone,
        dependants: data?.dependants,
      };
      await dispatchResolve(updateUserHousehold(partner));
      GlobalLib.Toast.get().toastSuccess(t(`${i18nScope}.msgUpdateHouseholdSuccess`));
    },
    [dispatchResolve, t, user, partnerInfo],
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

  const onAddDependant = useCallback(() => {
    append({ name: '', _id: null });
  }, [append]);

  const onAddPartner = useCallback(() => {
    setPartnerInfo(info => ({ ...info, _id: AppConstants.newObjectID }));
  }, []);

  const onShowConfirmationDelete = useCallback(
    (index, isPartner) => {
      GlobalLib.ConfirmModal.get().show({
        title: t(`${i18nScope}.deleteTitle`),
        content: isPartner ? t(`${i18nScope}.deletePartner`) : t(`${i18nScope}.deleteDependant`),
        onConfirm: () => {
          remove(index);
        },
      });
    },
    [remove, t],
  );

  const renderUpdatePartner = useCallback(() => {
    return (
      <View style={styles.group}>
        <Accordion
          keepCollapsedContent
          title={t(`${i18nScope}.partnerDetails`)}
          value={accordionValue}
          onChange={() => setAccordionValue(!accordionValue)}>
          <View
            style={styles.formBlock}
            collapsable={false}
            onLayout={({ nativeEvent }) => {
              updateDataFormErrors('partnerFirstName', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('partnerFirstName', {
                componentRef: element,
              });
            }}>
            <Controller
              name="partnerFirstName"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputField
                  ref={partnerFirstNameInput}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={() => partnerLastNameInput.current.focus()}
                  error={errors.partnerFirstName?.message}
                  label={t(`${i18nScope}.partnerFirstName`)}
                  placeholder={t(`${i18nScope}.partnerFirstNamePlaceholder`)}
                />
              )}
            />
          </View>

          <View
            style={styles.formBlock}
            collapsable={false}
            onLayout={({ nativeEvent }) => {
              updateDataFormErrors('partnerLastName', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('partnerLastName', {
                componentRef: element,
              });
            }}>
            <Controller
              name="partnerLastName"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputField
                  ref={partnerLastNameInput}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  error={errors.partnerLastName?.message}
                  label={t(`${i18nScope}.partnerLastName`)}
                  placeholder={t(`${i18nScope}.partnerLastNamePlaceholder`)}
                />
              )}
            />
          </View>

          <View
            style={styles.formBlock}
            collapsable={false}
            onLayout={({ nativeEvent }) => {
              updateDataFormErrors('partnerDob', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('partnerDob', {
                componentRef: element,
              });
            }}>
            <Controller
              name="partnerDob"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputField
                  ref={partnerDobInput}
                  value={value ? formatDateTime(value, formatDateString) : ''}
                  onBlur={onBlur}
                  onSubmitEditing={() => partnerEmailInput.current.focus()}
                  error={errors.partnerDob?.message}
                  label={t(`${i18nScope}.partnerDob`)}
                  placeholder={t(`${i18nScope}.partnerDobPlaceholder`)}
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
              updateDataFormErrors('partnerMPhone', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('partnerMPhone', {
                componentRef: element,
              });
            }}>
            <Controller
              name="partnerMPhone"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputField
                  ref={partnerMPhoneInput}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={() => partnerMPhoneInput.current?.focus()}
                  error={errors.partnerMPhone?.message}
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
              updateDataFormErrors('partnerEmail', {
                offsetY: nativeEvent.layout.y,
              });
            }}
            ref={element => {
              updateDataFormErrors('partnerEmail', {
                componentRef: element,
              });
            }}>
            <Controller
              name="partnerEmail"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <InputField
                  ref={partnerEmailInput}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={() => partnerNoOfKidsInput.current?.focus()}
                  error={errors.partnerEmail?.message}
                  label={t(`${i18nScope}.partnerEmail`)}
                  placeholder={t(`${i18nScope}.partnerEmailPlaceholder`)}
                  readonly={!isEmpty(user?.partnerUID) || user?.hasPartnerAccount}
                />
              )}
            />
          </View>
        </Accordion>
      </View>
    );
  }, [accordionValue, control, errors, styles, t, user]);

  const renderUpdateDependant = useCallback(() => {
    return (
      <View>
        {fields.map((field, index) => (
          <View key={field.id} collapsable={false}>
            <Controller
              name={`dependants.${index}._id`}
              control={control}
              defaultValue={field._id}
            />
            <Controller
              name={`dependants.${index}.name`}
              control={control}
              defaultValue={field.name}
              render={({ onChange, value, ref }) => (
                <FormAddDependant
                  text={value}
                  ref={ref}
                  title={t(`${i18nScope}.dependant`) + ` ${index + 1}`}
                  i18nScope={i18nScope}
                  onChangeText={onChange}
                  onRemove={() => {
                    onShowConfirmationDelete(index, false);
                  }}
                />
              )}
            />
          </View>
        ))}
      </View>
    );
  }, [control, fields, onShowConfirmationDelete, t]);

  return (
    <View style={styles.container}>
      <Header type="back" title={t(`${i18nScope}.title`)} />
      <KeyboardAwareScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ref={scrollRef}
        style={AppStyle.flex1}
        contentContainerStyle={AppStyle.padBottom90}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}>
        <View style={[AppStyle.padX20, AppStyle.padBottom20]}>
          <View style={AppStyle.marginTop20}>
            <InputField
              ref={householdInput}
              value={AppConstants.householdName[householdType]}
              label={t(`${i18nScope}.household`)}
              readonly
            />
            {!isEmpty(partnerInfo._id) && renderUpdatePartner()}
            {renderUpdateDependant()}
          </View>

          {isEmpty(partnerInfo._id) && (
            <ButtonAddHousehold text={t(`${i18nScope}.addPartner`)} onPress={onAddPartner} />
          )}
          <ButtonAddHousehold text={t(`${i18nScope}.addDependant`)} onPress={onAddDependant} />
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.wrapperControl}>
        <ButtonField
          style={AppStyle.marginTop40}
          text={t(`${i18nScope}.btnUpdate`)}
          onPress={handleSubmit(onSubmitData, onErrorData)}
        />
      </View>
    </View>
  );
}

export default compose(withBackHandler)(HouseholdDetail);
