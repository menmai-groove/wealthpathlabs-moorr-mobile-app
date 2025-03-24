import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import { includes, isEmpty, isNaN } from 'lodash';
import { useThemedStyle } from 'providers';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AppStyle } from 'theme';

import themedStyles from './style';

function InterestRate(props, ref) {
  const {
    value = {},
    onChangeValue = () => {},
    updateDataFormErrors = () => {},
    field,
    loanTypeId = 'loanType',
    loanTypeValue,
    required = false,
    readonly = false,
    style,
    isFirst = false,
    disabled = false,
    ...restProps
  } = props;
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, 'components.InterestRate');

  const { errors, watch } = useFormContext();

  const loanType = loanTypeValue ?? watch(loanTypeId);
  const loanTypeRef = useRef(null);

  const [visible, setVisible] = useState(false);

  const changeValue = useCallback(
    newData => {
      onChangeValue(newData);
    },
    [onChangeValue],
  );

  const isShowArrow = useMemo(() => {
    if (loanType) {
      const condition =
        loanType.value === AppConstants.Borrowing.LoanType.Other ||
        includes(loanType.tags, AppConstants.Borrowing.Mortgage);
      if (!condition && loanTypeRef.current !== loanType.value) {
        onChangeValue({ interestRate: value?.interestRate });
      }
      loanTypeRef.current = loanType.value;
      return condition;
    }
    return false;
  }, [loanType, onChangeValue, value.interestRate]);

  useEffect(() => {
    if (
      isShowArrow &&
      (!isEmpty(errors[field.id]?.message?.baseRate) ||
        !isEmpty(errors[field.id]?.message?.discountRate))
    ) {
      setVisible(true);
    }
  }, [field, isShowArrow, errors]);

  useImperativeHandle(ref, () => ({}));

  const toggleExpand = () => {
    UtilLib.handleConfigureNextLayoutAnimation();
    setVisible(!visible);
  };

  const handleSetValueInterestRate = useCallback(
    (fieldName, text) => {
      let baseRate = fieldName === 'baseRate' ? text : value?.baseRate;
      let discountRate = fieldName === 'discountRate' ? text : value?.discountRate;
      let interestRate = Number(baseRate ?? 0) - Number(discountRate ?? 0);
      if (isNaN(interestRate)) {
        interestRate = t('global.invalid');
      }
      if (!isEmpty(baseRate) || !isEmpty(discountRate)) {
        changeValue({ ...value, interestRate: interestRate?.toString(), [fieldName]: text });
      } else {
        changeValue({ ...value, interestRate: '', [fieldName]: text });
      }
    },
    [changeValue, value, t],
  );
  const handleChangeInterestRate = useCallback(
    text => {
      let discountRate = value?.discountRate ?? 0;
      if (
        !UtilLib.checkEmptyButNotZero(value?.baseRate) &&
        !isNaN(Number(value?.baseRate)) &&
        !isNaN(Number(text))
      ) {
        let baseRate = Number(text) + Number(discountRate ?? 0);
        changeValue({ ...value, baseRate: baseRate?.toString(), interestRate: text });
      }
    },
    [changeValue, value],
  );

  const getRightComponentInput = p => (
    <TextField {...p} style={styles.inputIcon}>
      {'%'}
    </TextField>
  );

  return (
    <View style={styles.container} {...restProps}>
      <View
        style={[AppStyle.rowFlex, !isFirst && AppStyle.marginTop10]}
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors(`${field.id}.interestRate`, {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors(`${field.id}.interestRate`, {
            componentRef: element,
          });
        }}>
        <View style={[AppStyle.flex1]}>
          <InputField
            isNumericInput
            value={value?.interestRate || ''}
            label={t('forms.borrowing.interestRate')}
            placeholder={t('forms.borrowing.interestRate')}
            onChangeText={text => {
              changeValue({ ...value, interestRate: text });
              handleChangeInterestRate(text);
            }}
            error={errors[field.id]?.message?.interestRate}
            RightComponent={getRightComponentInput}
            CustomRightComponent={() =>
              isShowArrow && (
                <TouchableField
                  style={[
                    styles.boxArrow,
                    visible && styles.activeBoxArrow,
                    disabled && styles.disabledBoxArrow,
                  ]}
                  onPress={toggleExpand}
                  disabled={disabled}>
                  <FontAwesome
                    name={visible ? 'angle-down' : 'angle-up'}
                    style={[styles.icon, visible && styles.activeIcon]}
                  />
                </TouchableField>
              )
            }
            required={required}
            readonly={readonly || disabled}
            style={style}
          />
        </View>
      </View>
      <ScrollView
        bounces={false}
        scrollEnabled={false}
        disableScrollViewPanResponder
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={(!isShowArrow || !visible) && AppStyle.collapseHeight}>
        <View
          style={AppStyle.marginTop10}
          onLayout={({ nativeEvent }) => {
            updateDataFormErrors(`${field.id}.baseRate`, {
              offsetY: nativeEvent.layout.y,
            });
          }}
          ref={element => {
            updateDataFormErrors(`${field.id}.baseRate`, {
              componentRef: element,
            });
          }}>
          <InputField
            isNumericInput
            value={value?.baseRate || ''}
            label={t('forms.borrowing.baseRate')}
            placeholder={!isShowArrow ? '' : t('forms.borrowing.baseRate')}
            onChangeText={text => {
              handleSetValueInterestRate('baseRate', text);
            }}
            error={errors[field.id]?.message?.baseRate}
            RightComponent={getRightComponentInput}
          />
        </View>
        <View
          style={AppStyle.marginTop10}
          onLayout={({ nativeEvent }) => {
            updateDataFormErrors(`${field.id}.discountRate`, {
              offsetY: nativeEvent.layout.y,
            });
          }}
          ref={element => {
            updateDataFormErrors(`${field.id}.discountRate`, {
              componentRef: element,
            });
          }}>
          <InputField
            isNumericInput
            value={value?.discountRate || ''}
            label={t('forms.borrowing.discountRate')}
            placeholder={!isShowArrow ? '' : t('forms.borrowing.discountRate')}
            onChangeText={text => {
              handleSetValueInterestRate('discountRate', text);
            }}
            error={errors[field.id]?.message?.discountRate}
            RightComponent={getRightComponentInput}
          />
        </View>
      </ScrollView>
    </View>
  );
}
export default forwardRef(InterestRate);
