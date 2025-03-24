import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

import themedStyles from './style';

function InputPasswordField(props, ref) {
  const {
    error,
    hideError,
    label,
    onBlur,
    onFocus,
    style,
    LeftComponent,
    required = false,
    ...restProps
  } = props;
  const [isFocus, setFocus] = useState(false);
  const [isHiddenPassword, hidePassword] = useState(true);
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle(
    { ...themedStyles, ...convertedStyle },
    'components.inputPasswordField',
  );

  return (
    <View style={styles.container}>
      {!isEmpty(label) && (
        <View style={styles.labelWrapper}>
          {typeof label === 'function' ? (
            label()
          ) : (
            <TextField style={styles.inputLabel}>{label}</TextField>
          )}
          {required && <TextField style={styles.requiredChar}>*</TextField>}
        </View>
      )}
      <View
        style={[
          styles.inputWrapper,
          isFocus && styles.focusInputWrapper,
          error && styles.errorInputWrapper,
        ]}>
        {!isEmpty(LeftComponent) && (
          <View style={[styles.leftComponentWrapper, styles.justifyContent]}>
            <LeftComponent style={[styles.leftComponent, error && styles.errorComponent]} />
          </View>
        )}
        <View style={styles.flexContainer}>
          <TextInput
            {...restProps}
            ref={ref}
            textContentType="password"
            returnKeyType={'done'}
            contextMenuHidden
            secureTextEntry={isHiddenPassword ? true : false}
            underlineColorAndroid={'transparent'}
            blurOnSubmit={false}
            style={[styles.inputContent]}
            onFocus={e => {
              setFocus(true);
              error && typeof restProps.onChangeText === 'function' && restProps.onChangeText('');
              typeof onFocus === 'function' && onFocus(e);
            }}
            onBlur={e => {
              setFocus(false);
              typeof onBlur === 'function' && onBlur(e);
            }}
            placeholderTextColor={styles.placeholderText.color}
          />
        </View>
        <TouchableField
          onPress={() => hidePassword(!isHiddenPassword)}
          style={[styles.rightComponentWrapper, styles.justifyContent]}>
          <Entypo
            name={isHiddenPassword ? 'eye' : 'eye-with-line'}
            style={[styles.rightComponent]}
          />
        </TouchableField>
      </View>
      {!hideError && !isEmpty(error) && (
        <TextField style={styles.errorInputMessage}>{error}</TextField>
      )}
    </View>
  );
}

export default forwardRef(InputPasswordField);
