import TextField from 'components/basics/TextField';
import { isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AIcon from 'react-native-vector-icons/AntDesign';
import { AppStyle } from 'theme';

import themedStyles from './style';

function IncreaseNumber(
  { label, value = 0, onChange = () => {}, minimum = 0, maximum = 99999, style, error, disabled },

  ref,
) {
  const styles = useThemedStyle(themedStyles);

  const formatedValue = parseInt(`${value}`, 10);
  function increaseNumber() {
    if (formatedValue < maximum) {
      const newNumberValue = formatedValue + 1;
      onChange(newNumberValue);
    }
  }
  function descreaseNumber() {
    if (formatedValue > minimum) {
      const newNumberValue = formatedValue - 1;
      onChange(newNumberValue);
    }
  }
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <TextField>{label}</TextField>
        <View style={styles.rightContainer}>
          <TouchableOpacity onPress={descreaseNumber} disabled={disabled}>
            <AIcon
              name="minuscircle"
              size={25}
              style={[styles.minusIcon, disabled && styles.disabledIcon]}
            />
          </TouchableOpacity>
          <TextField type="heading-4" style={styles.numberContainer}>
            {`${formatedValue}`}
          </TextField>
          <TouchableOpacity onPress={increaseNumber} disabled={disabled}>
            <AIcon
              name="pluscircle"
              size={25}
              style={[styles.plusIcon, disabled && styles.disabledIcon]}
            />
          </TouchableOpacity>
        </View>
      </View>
      {!isEmpty(error) && (
        <TextField style={[styles.errorInputMessage, AppStyle.marginTop5]}>{error}</TextField>
      )}
    </View>
  );
}
export default forwardRef(IncreaseNumber);
