import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Animated, TextInput, View } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

import themedStyles from './style';

function SecondaryInputPasswordField(props, ref) {
  const {
    value,
    error,
    hideError,
    label,
    onBlur,
    onFocus,
    style,
    LeftComponent,
    required = false,
    textContentType,
    ...restProps
  } = props;
  const [isFocus, setFocus] = useState(false);
  const [isHiddenPassword, hidePassword] = useState(true);
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle(
    { ...themedStyles, ...convertedStyle },
    'components.inputPasswordField',
  );

  const animatedIsFocused = useRef(new Animated.Value(value === '' ? 1 : 1));

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

  return (
    <Animated.View style={[styles.container, marginTopStyle]}>
      <View
        style={[
          styles.inputWrapper,
          isFocus && styles.focusInputWrapper,
          error && styles.errorInputWrapper,
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
          <View style={[styles.leftComponentWrapper, styles.justifyContent]}>
            <LeftComponent style={[styles.leftComponent, error && styles.errorComponent]} />
          </View>
        )}
        <View style={[styles.flexContainer]}>
          <TextInput
            {...restProps}
            value={value}
            ref={ref}
            returnKeyType={'done'}
            contextMenuHidden
            secureTextEntry={isHiddenPassword ? true : false}
            underlineColorAndroid={'transparent'}
            blurOnSubmit={false}
            style={[styles.inputContent]}
            onFocus={e => {
              setFocus(true);
              // error &&
              //   typeof restProps.onChangeText === 'function' &&
              //   restProps.onChangeText('');
              typeof onFocus === 'function' && onFocus(e);
            }}
            onBlur={e => {
              setFocus(false);
              typeof onBlur === 'function' && onBlur(e);
            }}
            placeholder={''}
            placeholderTextColor={styles.placeholderText.color}
            textContentType={textContentType}
          />
        </View>
        <View style={[styles.rightComponentWrapper, styles.justifyContent]}>
          <TouchableField onPress={() => hidePassword(!isHiddenPassword)}>
            <Entypo
              name={isHiddenPassword ? 'eye' : 'eye-with-line'}
              style={[styles.rightComponent]}
            />
          </TouchableField>
        </View>
      </View>
      {!hideError && !isEmpty(error) && (
        <TextField style={styles.errorInputMessage}>{error}</TextField>
      )}
    </Animated.View>
  );
}

export default forwardRef(SecondaryInputPasswordField);
