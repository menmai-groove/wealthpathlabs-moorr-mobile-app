import RadioButton from 'components/basics/RadioButton';
import TextField from 'components/basics/TextField';
import { isEmpty } from 'lodash';
import { useThemedStyle } from 'providers/';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.radioButton';

function RadioButtonGroup({
  options,
  hideUnselected = false,
  selectedValue = null,
  onSelect = () => {},
  error,
  disabled = false,
  style,
  radioStyle,
  readonly = false,
  noMarginBottom,
}) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  return (
    <View style={[styles.container, style]}>
      {options?.map((option, index) => {
        if (disabled && selectedValue !== option.value && hideUnselected) {
          return null;
        }
        const isSelected = selectedValue === option.value;
        return (
          <View style={radioStyle} key={`radio-${index}`}>
            <RadioButton
              style={noMarginBottom ? AppStyle.marginBottom0 : AppStyle.marginBottom20}
              selected={isSelected}
              title={option.display}
              value={option.value}
              onSelect={onSelect}
              error={!!error}
              // disabled={disabled || (!isSelected && readonly)}
              disabled={disabled || readonly}
            />
          </View>
        );
      })}
      {!isEmpty(error?.message) && (
        <TextField style={styles.errorInputMessage}>{error?.message}</TextField>
      )}
    </View>
  );
}

export default RadioButtonGroup;
