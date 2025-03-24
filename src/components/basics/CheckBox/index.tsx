import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { isFunction } from 'lodash';
import { isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { View } from 'react-native';
import FeaIcon from 'react-native-vector-icons/Feather';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.checkbox';

interface ICheckbox {
  disabled?: boolean;
  onChange?: (value: boolean) => void;
  style?: object;
  value?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
  children?: React.ReactChild;
  containerStyle?: string;
}

function CheckBox(
  {
    disabled = false,
    onChange,
    style,
    value = false,
    label,
    required = false,
    error,
    children,
    containerStyle,
    ...restProps
  }: ICheckbox,
  ref: any,
) {
  const [checked, setChecked] = useState(value);
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);

  const onPress = () => {
    isFunction(onChange) && onChange(!checked);
    setChecked(!checked);
  };

  useEffect(() => {
    if (value !== checked) {
      setChecked(value);
    }
  }, [value, checked]);

  useImperativeHandle(ref, () => ({}));

  return (
    <TouchableField activeOpacity={0.8} {...restProps} disabled={disabled} onPress={onPress}>
      <View style={[styles.container, containerStyle]}>
        <View
          style={[
            styles.checkBox,
            checked ? styles.active : styles.inactive,
            !isEmpty(error) && styles.checkBoxError,
            disabled && styles.disabled,
          ]}>
          {checked === true && <FeaIcon name={'check'} style={styles.icon} />}
        </View>
        {children || label || !isEmpty(error) ? (
          <View style={[AppStyle.columnFlex, AppStyle.flex1, AppStyle.marginLeft10]}>
            {label ? (
              <TextField style={styles.label}>
                {label}
                {required && <TextField style={styles.requiredChar}>*</TextField>}
              </TextField>
            ) : (
              children
            )}
            {!isEmpty(error) ? <TextField style={styles.errorMessage}>{error}</TextField> : null}
          </View>
        ) : null}
      </View>
    </TouchableField>
  );
}
export default forwardRef(CheckBox);
