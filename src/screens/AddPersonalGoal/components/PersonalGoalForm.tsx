// screens/AddPersonalGoal/index.tsx

import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import { View, Image, Keyboard } from 'react-native';
import ButtonField from 'components/basics/ButtonField';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import CalendarIcon from 'assets/svgs/profile/calendar';
import ArrowRightIcon from 'assets/svgs/arrowRightIcon';
import { ColorPicker, PhotoIconPicker } from 'screens/AddPersonalGoal/components';
import TrashIcon from 'assets/svgs/trashIcon';
import TouchableField from 'components/basics/TouchableField';
//
import { get, isFunction, toNumber } from 'lodash';
import { AppConstants } from 'constant';
import { formatDateTime, hexToRGBA } from 'libs/util';
import { SchemaLib, GlobalLib } from 'libs';
import { useThemedStyle } from 'providers';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AppStyle } from 'theme';
import { SelectedImageOrIconItem, SELECTED_ITEM_TYPE } from 'screens/AddPersonalGoal/constants';
import { IDefaultImage } from 'screens/EditPersonalGoal';
import moment from 'moment';

const i18nScope = 'screens.personalGoal.addPersonalGoal';
const formatDateString = 'DD MMM YYYY';

interface PersonalGoalFormProps {
  yearRange?: Date[] | string[];
  defaultValues?: object;
  isAchieved?: boolean;
  defaultImage?: IDefaultImage;
  formType: 'EDIT' | 'ADD';
  onPressBtnAchieve?: () => void;
  onPressBtnDelete?: () => void;
  onSubmit: (data: object, callback: () => void) => void;
  onError: (formError: object, dataFormErrors: object, firstKey: string) => void;
}

function FormPersonalGoal(
  {
    formType = 'ADD',
    defaultValues,
    defaultImage,
    isAchieved = false,
    yearRange = [],
    onSubmit,
    onError,
    onPressBtnAchieve,
    onPressBtnDelete,
  }: PersonalGoalFormProps,
  ref: any,
) {
  const { t } = useTranslation(AppConstants.defaultLanguageNamespace, { keyPrefix: i18nScope });
  const dataFormErrors = useRef({});
  const styles = useThemedStyle(themedStyles, i18nScope);
  const isEditScreen = useMemo(() => formType === 'EDIT', [formType]);
  const defaultAsset = useMemo(
    () => (defaultImage ? { type: defaultImage?.type, data: defaultImage } : null),
    [defaultImage],
  );
  const [selectedAssets, setSelectedAssets] = useState<SelectedImageOrIconItem>(defaultAsset);
  const {
    handleSubmit,
    control,
    errors,
    formState: { isDirty },
    setValue,
    reset,
  } = useForm({
    defaultValues,
    resolver: yupResolver(SchemaLib.addEditPersonalGoal),
    shouldFocusError: false,
  });

  const isEditAsset = useMemo(() => {
    if (defaultAsset === null) {
      return !!selectedAssets;
    } else {
      return selectedAssets?.data.photo !== defaultAsset?.data.photo;
    }
  }, [selectedAssets, defaultAsset]);

  const uploadPhotoData = useMemo(() => {
    if (selectedAssets?.type === SELECTED_ITEM_TYPE[0]) {
      // server image
      const isServerUri = !!selectedAssets?.data?.uri;
      return {
        uri: selectedAssets.data?.path,
        type: selectedAssets.data?.mime,
        filename: selectedAssets.data?.uuidFileName,
        isIcon: false,
        isServerUri,
      };
    }
    if (selectedAssets?.type === SELECTED_ITEM_TYPE[1]) {
      return {
        uri: selectedAssets.data.source,
        type: selectedAssets.data?.type,
        filename: selectedAssets.data?.uuidFileName,
        isIcon: true,
        isServerUri: false,
      };
    }
    return null;
  }, [selectedAssets]);

  const isEditForm = useMemo(() => isDirty || isEditAsset, [isDirty, isEditAsset]);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);
  useEffect(() => {
    if (defaultAsset) {
      setSelectedAssets(defaultAsset);
    }
  }, [defaultAsset]);

  const updateDataFormErrors = useCallback((key, formData) => {
    dataFormErrors.current[key] = {
      ...dataFormErrors.current[key],
      ...formData,
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      resetAllFields: values => {
        Object.keys(values).forEach(key => {
          if (values[key]) {
            setValue(key, values[key]);
          }
        });
        reset(values);
      },
      resetImage: image => {
        const asset = image ? { type: SELECTED_ITEM_TYPE[0], data: image } : null;
        setSelectedAssets(asset);
      },
    }),
    [setValue, reset],
  );
  const onSubmitData = useCallback(
    data => {
      Keyboard.dismiss();
      let photo;
      if (!uploadPhotoData?.isServerUri) {
        photo = uploadPhotoData;
      }
      isFunction(onSubmit) &&
        onSubmit({
          ...data,
          value: toNumber(data.value),
          photo,
          dueDate: data.dueDate?.toISOString(),
        });
    },
    [onSubmit, uploadPhotoData],
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
      typeof onError === 'function' && onError(formError, dataFormErrors.current, firstKey);
    },
    [onError],
  );

  const BottomForm = useMemo(() => {
    if (isEditScreen) {
      const text = isEditForm ? t('save') : isAchieved ? t('unachieve') : t('achieve');
      const onPressBtnPrimary = isEditForm
        ? handleSubmit(onSubmitData, onErrorData)
        : onPressBtnAchieve;

      return (
        <View style={[AppStyle.marginTop10, AppStyle.rowFlex]}>
          <TouchableField
            onPress={onPressBtnDelete}
            style={[styles.btnTrash, { backgroundColor: hexToRGBA(styles.trash.color, 0.2) }]}>
            <TrashIcon width={14} height={16} fill={styles.trash.color} />
          </TouchableField>
          <View style={AppStyle.flex1}>
            <ButtonField
              text={text}
              type="primary"
              onPress={onPressBtnPrimary}
              style={styles.btnAchieve}
            />
          </View>
        </View>
      );
    }

    return (
      <ButtonField
        text={t('save')}
        type={isEditForm ? 'primary' : 'disabled'}
        onPress={handleSubmit(onSubmitData, onErrorData)}
        style={styles.btnAchieve}
      />
    );
  }, [
    handleSubmit,
    isAchieved,
    isEditForm,
    isEditScreen,
    onErrorData,
    onPressBtnAchieve,
    onPressBtnDelete,
    onSubmitData,
    styles,
    t,
  ]);

  return (
    <View style={[AppStyle.flex1]}>
      <View
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors('dueDate', {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors('dueDate', {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          name={'dueDate'}
          render={({ onChange, value, ref: componentRef }) => (
            <InputField
              value={value ? formatDateTime(value, formatDateString) : ''}
              ref={componentRef}
              error={get(errors, ['dueDate', 'message'])}
              label={t('calendar')}
              placeholder={formatDateString}
              required
              editable={false}
              onPress={() => {
                const currentDate = value
                  ? value
                  : formType === 'ADD'
                  ? moment().add(1, 'days').toDate()
                  : new Date();
                GlobalLib.CalendarModal.get().show({
                  current: currentDate,
                  minDate: yearRange.length > 0 ? new Date(yearRange[0]) : undefined,
                  onConfirm: (date: any) => {
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
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors('description', {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors('description', {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          name={'description'}
          render={({ onChange, onBlur, value, ref: componentRef }) => (
            <InputField
              value={value}
              ref={componentRef}
              style={{ container: AppStyle.marginTop10 }}
              label={t('goal')}
              onBlur={onBlur}
              onChangeText={onChange}
              required
              numberOfLines={1}
              maxLength={200}
              error={get(errors, ['description', 'message'])}
            />
          )}
        />
      </View>
      <View
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors('colour', {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors('colour', {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          name={'colour'}
          render={({ onChange, onBlur, value, ref: componentRef }) => (
            <InputField
              ref={componentRef}
              editable={false}
              placeholder={t('goalColor')}
              onBlur={onBlur}
              onChangeText={onChange}
              numberOfLines={1}
              error={get(errors, ['colour', 'message'])}
              onPress={() => {
                GlobalLib.CustomModal.get().show({
                  onBackdropPress: () => GlobalLib.CustomModal.get().hide(),
                  body: <ColorPicker color={value} onChange={onChange} />,
                });
              }}
              style={{
                container: AppStyle.marginTop25,
                placeholderText: { color: 'input.text-content-color' },
              }}
              LeftComponent={() =>
                value ? (
                  <View style={[styles.colorItem, { backgroundColor: value }]} />
                ) : (
                  <Image
                    source={require('assets/images/common/aim.png')}
                    style={styles.colorItem}
                  />
                )
              }
              RightComponent={() => (
                <View style={styles.arrowRight}>
                  <ArrowRightIcon />
                </View>
              )}
            />
          )}
        />
      </View>
      <View
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors('value', {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors('value', {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          name={'value'}
          render={({ onChange, onBlur, value, ref: componentRef }) => (
            <InputField
              ref={componentRef}
              isNumericInput
              isCurrency
              value={value}
              label={t('value')}
              onBlur={onBlur}
              onChangeText={onChange}
              numberOfLines={1}
              error={get(errors, ['value', 'message'])}
              style={{ container: AppStyle.marginTop10 }}
              LeftComponent={() => <TextField>$</TextField>}
            />
          )}
        />
      </View>
      <PhotoIconPicker onChange={setSelectedAssets} imageInfo={selectedAssets} />
      {BottomForm}
    </View>
  );
}

export const PersonalGoalForm = forwardRef(FormPersonalGoal);

const themedStyles = {
  arrowRight: {
    width: '24@ms0',
    height: '24@ms0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'palette.color-line-2',
    borderRadius: 6,
  },
  colorItem: {
    height: 24,
    width: 24,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: '#fff',
  },
  trash: {
    color: 'palette.color-red-2',
  },
  btnTrash: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 99,
    minHeight: 44,
    minWidth: '20%',
    marginRight: 15,
  },
  btnAchieve: {
    flex: 1,
    minHeight: 44,
  },
};
