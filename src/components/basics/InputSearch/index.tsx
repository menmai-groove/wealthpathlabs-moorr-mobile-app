import React, { forwardRef } from 'react';
import { View } from 'react-native';
import TouchableField from 'components/basics/TouchableField';
import InputField, { IInputField } from 'components/basics/InputField';
import Feather from 'react-native-vector-icons/Feather';
import BackIcon from 'assets/svgs/backIcon';
import { AppStyle } from 'theme';
import { useThemedStyle } from 'providers';
import { mergeArrayObjectIntoObject } from 'libs/util';

interface ISearchInput extends IInputField {
  onBlur?: () => void;
  onFocus?: () => void;
  onPress?: () => void;
  onPressBack?: () => void;
  style?: object;
}

const i18nScope = 'components.inputSearch';
const placeholderText = 'Search ...';

export default forwardRef(function InputSearch(
  { onBlur, onFocus, onPress, onPressBack, style, value, ...rest }: ISearchInput,
  ref: any,
) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);

  return (
    <View
      style={[
        AppStyle.flex1,
        AppStyle.rowFlex,
        AppStyle.alignContent,
        AppStyle.padY10,
        styles.container,
      ]}>
      <TouchableField
        style={[AppStyle.padRight10, AppStyle.pad15, styles.btnBack]}
        onPress={onPressBack}>
        <BackIcon />
      </TouchableField>
      <View style={[AppStyle.flex1, AppStyle.padRight15]}>
        <InputField
          {...rest}
          ref={ref}
          value={value}
          autoFocus
          placeholder={placeholderText}
          onPress={onPress}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholderTextColor={'#888'}
          returnKeyType="search"
          style={styles.input}
          LeftComponent={() => <Feather name="search" size={18} style={styles.iconSearch} />}
        />
      </View>
    </View>
  );
});

const themedStyles = {};
