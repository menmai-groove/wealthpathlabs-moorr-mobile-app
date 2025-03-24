import TextField from 'components/basics/TextField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { isEmpty, isNumber } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import themedStyles from './style';

function SecondaryInputField(props, ref) {
  const {
    type,
    value,
    error,
    hideError,
    label,
    multiline = false,
    numberOfLines = 5,
    onBlur,
    onFocus,
    onSubmitEditing,
    returnKeyType = 'default',
    style,
    LeftComponent,
    RightComponent,
    readonly = false,
    required = false,
    isNumericInput = false,
    textContentType,
    keyboardType,
    ...restProps
  } = props;
  const [isFocus, setFocus] = useState(false);
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle(
    { ...themedStyles, ...convertedStyle },
    'components.secondaryInputField',
  );
  const animatedIsFocused = useRef(new Animated.Value(value === '' ? 1 : 1));

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

  useEffect(() => {
    Animated.timing(animatedIsFocused.current, {
      toValue: isFocus || value !== '' ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocus, value]);

  const labelStyle = {
    position: 'absolute',
    left: 0,
    top: animatedIsFocused.current.interpolate({
      inputRange: [0, 1],
      outputRange: [styles.inputContent.fontSize, styles.inputFloatingLabel.top],
    }),
    fontSize: animatedIsFocused.current.interpolate({
      inputRange: [0, 1],
      outputRange: [styles.inputLabel.fontSize, styles.inputFloatingLabel.fontSize],
    }),
    lineHeight: animatedIsFocused.current.interpolate({
      inputRange: [0, 1],
      outputRange: [styles.inputLabel.lineHeight, styles.inputFloatingLabel.lineHeight],
    }),
    color: animatedIsFocused.current.interpolate({
      inputRange: [0, 1],
      outputRange: [styles.inputFloatingLabel.color, styles.inputLabel.color],
    }),
  };

  const marginTopStyle = {
    marginTop: animatedIsFocused.current.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 10],
    }),
  };

  // TODO:  EM-3965 isNumericInput remember check isCurrency, apply logic currency input
  return (
    <Animated.View style={[styles.container, marginTopStyle]}>
      <View
        style={[
          styles.inputWrapper,
          multiline && styles.areaInputWrapper,
          isFocus && styles.focusInputWrapper,
          error && styles.errorInputWrapper,
          readonly && styles.readonlyInputWrapper,
        ]}>
        {!isEmpty(label) && (
          <View style={styles.labelWrapper}>
            {typeof label === 'function' ? (
              label()
            ) : (
              <TextField style={styles.inputLabel} animated animatedStyle={labelStyle}>
                {label}
              </TextField>
            )}
            {required && <TextField style={styles.requiredChar}>*</TextField>}
          </View>
        )}

        {!isEmpty(LeftComponent) && (
          <View style={[styles.leftComponentWrapper, !multiline && styles.justifyContent]}>
            <LeftComponent style={[styles.leftComponent, error && styles.errorComponent]} />
          </View>
        )}
        {readonly && (
          <TextField style={[styles.inputContent, styles.readonlyInputContent, lineHeightStyle]}>
            {value}
          </TextField>
        )}
        {!readonly && (
          <View style={[styles.flexContainer]}>
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
              placeholder=""
              placeholderTextColor={styles.placeholderText.color}
              keyboardType={
                isNumericInput
                  ? Platform.OS === 'ios'
                    ? 'numbers-and-punctuation'
                    : 'numeric'
                  : keyboardType
              }
              textContentType={textContentType}
            />
          </View>
        )}
        {type === 'email' ? (
          <View style={[styles.rightComponentWrapper, !multiline && styles.justifyContent]}>
            <Ionicons name={'mail'} style={[styles.rightComponent]} />
          </View>
        ) : !isEmpty(RightComponent) ? (
          <View style={[styles.rightComponentWrapper, !multiline && styles.justifyContent]}>
            <RightComponent style={[styles.rightComponent]} />
          </View>
        ) : null}
      </View>
      {!hideError && !isEmpty(error) && (
        <TextField style={styles.errorInputMessage}>{error}</TextField>
      )}
    </Animated.View>
  );
}

export default forwardRef(SecondaryInputField);
