import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { isNil, isEmpty, isNumber } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useMemo, useState } from 'react';
import { Platform, TextInput, TextInputProps, View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

const PRECISION = 2;

export interface IInputField extends TextInputProps {
  isNumericInput?: boolean;
  isCurrency?: boolean;
  isPercent?: boolean;
  readonly?: boolean;
  required?: boolean;
  hideError?: boolean;
  label?: string | Function;
  error?: string;
  onPress?: () => void;
  LeftComponent?: React.ReactNode | any;
  RightComponent?: React.ReactNode | any;
  CustomRightComponent?: React.ReactNode | any;
  style?: object;
  disabled?: boolean;
}
function InputField(props: IInputField, ref: any) {
  const {
    value,
    error,
    hideError,
    label,
    multiline = false,
    numberOfLines = 5,
    onPress,
    onChangeText,
    onBlur,
    onFocus,
    onSubmitEditing,
    returnKeyType = 'default',
    style,
    LeftComponent,
    RightComponent,
    editable = true,
    readonly = false,
    required = false,
    isNumericInput = false,
    isCurrency = false,
    isPercent = false,
    placeholder,
    keyboardType,
    CustomRightComponent,
    disabled = false,
    ...restProps
  } = props;
  const [isFocus, setFocus] = useState(false);
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, 'components.inputField');

  const lineHeightStyle = useMemo(() => {
    const { height: heightWrapper, borderWidth } = styles.inputWrapper || {};
    const dataStyle = {
      lineHeight: multiline
        ? styles.multilineInputContent?.lineHeight
        : styles.inputContent?.lineHeight,
    };
    const paddingTop =
      styles.inputContent?.paddingTop ??
      styles.inputContent?.paddingVertical ??
      styles.inputContent?.padding;
    if (Platform.OS === 'ios' && !multiline && isNumber(heightWrapper) && isNumber(paddingTop)) {
      const borderWidthWrapper = isNumber(borderWidth) ? borderWidth : 0;
      const inputHeight = heightWrapper - borderWidthWrapper * 2 - paddingTop * 2;
      if (isNumber(dataStyle.lineHeight) && dataStyle.lineHeight > 0) {
        dataStyle.lineHeight = (dataStyle.lineHeight + inputHeight) / 2;
      } else {
        dataStyle.lineHeight = inputHeight;
      }
    }
    return dataStyle.lineHeight ? dataStyle : {};
  }, [multiline, styles]);

  const renderInput = () => {
    // TODO: prevent change text with regex
    const formatNumber = (n: string) => {
      // format number 1000000 to 1,234,567
      return n.replace(/[^\d,.]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const formatValue = (text = '') => {
      if (isNil(text)) {
        return text;
      }

      const prefix = '';
      let inputVal = text?.toString();
      if (inputVal?.indexOf('.') >= 0) {
        const decimalPos = inputVal.indexOf('.');
        let leftSide = inputVal.substring(0, decimalPos);
        let rightSide = inputVal.substring(decimalPos);
        leftSide = formatNumber(leftSide);
        rightSide = rightSide.replace(/\D/g, '');
        rightSide = rightSide.substring(0, PRECISION);
        inputVal = prefix + leftSide + '.' + rightSide;
      } else {
        inputVal = formatNumber(inputVal);
        inputVal = prefix + inputVal;
      }
      return inputVal;
    };

    if (!editable) {
      return (
        <View style={AppStyle.flex1}>
          <TextField style={[styles.inputContent, lineHeightStyle]}>
            {value ? (
              isCurrency || isPercent ? (
                formatValue(value)
              ) : (
                value
              )
            ) : (
              <TextField style={{ color: styles.placeholderText.color }}>{placeholder}</TextField>
            )}
          </TextField>
        </View>
      );
    }
    if (readonly || disabled) {
      return (
        <View style={AppStyle.flex1}>
          <TextField style={[styles.inputContent, styles.readonlyInputContent, lineHeightStyle]}>
            {isCurrency || isPercent ? formatValue(value) : value}
          </TextField>
        </View>
      );
    }

    if (isCurrency || isPercent) {
      return (
        <View style={AppStyle.flex1}>
          <TextInput
            {...restProps}
            value={formatValue(value)}
            underlineColorAndroid={'transparent'}
            style={[
              styles.inputContent,
              error && styles.inputErrorContentColor,
              multiline && styles.multilineInputContent,
              styles.inputContentCustom,
            ]}
            ref={ref}
            onChangeText={text => {
              const formattedValue = formatValue(text);
              var inputVal = formattedValue ? formattedValue.replace(/[A-z,]/g, '') : '';
              typeof onChangeText === 'function' && onChangeText(String(inputVal));
            }}
            onFocus={e => {
              setFocus(true);
              typeof onFocus === 'function' && onFocus(e);
            }}
            onBlur={e => {
              try {
                var inputVal = value ? parseFloat(value.toString()?.replace(/,/g, '')) : '';
                typeof onChangeText === 'function' && onChangeText(String(inputVal));
              } catch (_e) {
              } finally {
                setFocus(false);
                typeof onBlur === 'function' && onBlur(e);
              }
            }}
            onSubmitEditing={e =>
              !multiline && typeof onSubmitEditing === 'function' && onSubmitEditing(e)
            }
            multiline={multiline}
            numberOfLines={numberOfLines}
            returnKeyType={multiline ? 'default' : returnKeyType}
            placeholder={placeholder}
            placeholderTextColor={styles.placeholderText.color}
            keyboardType={
              isNumericInput
                ? Platform.OS === 'ios'
                  ? 'numbers-and-punctuation'
                  : 'numeric'
                : keyboardType
            }
          />
        </View>
      );
    }
    return (
      <View style={AppStyle.flex1}>
        <TextInput
          {...restProps}
          value={value}
          ref={ref}
          underlineColorAndroid={'transparent'}
          style={[
            styles.inputContent,
            error && styles.inputErrorContentColor,
            multiline && styles.multilineInputContent,
          ]}
          onChangeText={text => {
            typeof onChangeText === 'function' && onChangeText(text);
          }}
          onFocus={e => {
            setFocus(true);
            typeof onFocus === 'function' && onFocus(e);
          }}
          onBlur={e => {
            setFocus(false);
            typeof onBlur === 'function' && onBlur(e);
          }}
          onSubmitEditing={e =>
            !multiline && typeof onSubmitEditing === 'function' && onSubmitEditing(e)
          }
          multiline={multiline}
          numberOfLines={numberOfLines}
          returnKeyType={multiline ? 'default' : returnKeyType}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholderText.color}
          keyboardType={
            isNumericInput
              ? Platform.OS === 'ios'
                ? 'numbers-and-punctuation'
                : 'numeric'
              : keyboardType
          }
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {label !== undefined && label !== '' ? (
        <View style={styles.labelWrapper}>
          {typeof label === 'function' ? (
            <View style={[AppStyle.rowFlex, AppStyle.flex1]}>
              {label()}
              {required && <TextField style={styles.requiredChar}>*</TextField>}
            </View>
          ) : typeof label === 'string' ? (
            <TextField style={styles.inputLabel}>
              {label}
              {required && <TextField style={styles.requiredChar}>*</TextField>}
            </TextField>
          ) : null}
        </View>
      ) : null}
      <View style={AppStyle.rowFlex}>
        <TouchableField onPress={onPress} disabled={readonly || disabled} style={AppStyle.flex1}>
          <View
            style={[
              styles.inputWrapper,
              multiline && styles.areaInputWrapper,
              isFocus && styles.focusInputWrapper,
              error && styles.errorInputWrapper,
              (readonly || disabled) && styles.readonlyInputWrapper,
            ]}>
            {typeof LeftComponent === 'function' && (
              <View style={[styles.leftComponentWrapper, !multiline && styles.justifyContent]}>
                <LeftComponent style={[styles.leftComponent, error && styles.errorComponent]} />
              </View>
            )}
            {renderInput()}
            {typeof RightComponent === 'function' && (
              <View style={[styles.rightComponentWrapper, !multiline && styles.justifyContent]}>
                <RightComponent style={[styles.rightComponent, error && styles.errorComponent]} />
              </View>
            )}
          </View>
        </TouchableField>
        {typeof CustomRightComponent === 'function' && <CustomRightComponent />}
      </View>

      {!hideError && !isEmpty(error) && (
        <TextField style={styles.errorInputMessage}>{error}</TextField>
      )}
    </View>
  );
}

export default forwardRef(InputField);
