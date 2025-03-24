import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers/';
import React from 'react';
import { View } from 'react-native';

import themedStyles from './style';

const i18nScope = 'components.radioButton';

function RadioButton({
  style,
  title,
  value,
  selected = false,
  error = false,
  disabled = false,
  onSelect = () => {},
}) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle(
    {
      ...themedStyles,
      radioButton: {
        ...themedStyles.radioButton,
        ...convertedStyle,
      },
    },
    i18nScope,
  );
  return (
    <TouchableField
      style={styles.radioButton}
      onPress={() => onSelect({ value, title })}
      disabled={disabled}>
      <View
        style={[
          styles.circle,
          error && styles.errorCircle,
          selected && styles.activeCircle,
          disabled && styles.disabledCircle,
        ]}
      />
      <TextField
        style={[
          styles.radioLabel,
          error && styles.errorRadioLabel,
          selected && styles.activeRadioLabel,
          // disabled && styles.disabledRadioLabel,
        ]}>
        {title}
      </TextField>
    </TouchableField>
  );
}

export default RadioButton;
