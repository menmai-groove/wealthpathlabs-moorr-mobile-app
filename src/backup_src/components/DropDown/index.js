import TextField from 'components/basics/TextField';
import ModalDropdown from 'greact-native-modal-dropdown';
import { isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useRef, useState } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import themedStyles from './style';

const i18nScope = 'components.dropDown';

function DropDown({
  label,
  indexDefault = 0,
  options = [],
  placeholder = 'Select...',
  emptyPlaceholder = '- No options available -',
  onSelect = () => {},
  error,
  disabled,
  hideError,
}) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const isDisabled = disabled ?? options.length === 0;
  const [currentWidth, setCurrentWidth] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(0);
  const [focused, setFocused] = useState(0);
  const optionLayoutRef = useRef([]);

  const _onLayout = ({ nativeEvent }) => {
    if (currentWidth === 0) {
      const { width } = nativeEvent.layout;
      setCurrentWidth(width);
    }
  };

  const _onOptionLayout = ({ nativeEvent }, index) => {
    optionLayoutRef.current.splice(index, 0, nativeEvent.layout);
    if (optionLayoutRef.current?.length === options.length) {
      setCurrentHeight(
        optionLayoutRef.current
          .slice(0, Math.min(6, options.length))
          .map(item => Math.round(item.height + 0.5))
          .reduce((a, b) => a + b) + 16,
      );
    }
  };

  const _onDropdownWillShow = () => {
    optionLayoutRef.current?.splice(0, optionLayoutRef.current?.length);
    !focused && setFocused(true);
  };

  const _onDropdownWillHide = () => {
    focused && setFocused(false);
  };

  return (
    <View>
      {!isEmpty(label) && (
        <View style={styles.labelWrapper}>
          {typeof label === 'function' ? (
            label()
          ) : (
            <TextField style={styles.inputLabel}>{label}</TextField>
          )}
        </View>
      )}
      <ModalDropdown
        bounces={false}
        onDropdownWillShow={_onDropdownWillShow}
        onDropdownWillHide={_onDropdownWillHide}
        options={options}
        dropdownStyle={[
          styles.dropdownStyle,
          {
            width: currentWidth,
            height: currentHeight,
          },
        ]}
        adjustFrame={style => {
          style.top = Platform.OS === 'ios' ? style.top : style.top - StatusBar.currentHeight;
          return style;
        }}
        onSelect={onSelect}
        renderRow={(option, index) => (
          <View
            onLayout={e => _onOptionLayout(e, index)}
            collapsable={false}
            style={[styles.defaultItem, indexDefault === index && styles.selectedItem]}>
            <TextField
              numberOfLines={2}
              style={[styles.defaultText, indexDefault === index && styles.selectedText]}>
              {option?.display}
            </TextField>
          </View>
        )}
        renderSeparator={() => null}
        disabled={isDisabled}>
        <View
          style={[
            styles.dropdownButton,
            isDisabled && styles.disabledItem,
            error && styles.errorItem,
            focused && styles.dropdownButtonFocused,
          ]}
          collapsable={false}
          onLayout={_onLayout}>
          <View style={styles.flex1}>
            <TextField
              numberOfLines={2}
              style={[
                styles.defaultText,
                isDisabled && styles.disabledText,
                indexDefault == null && styles.placeholderText,
              ]}>
              {options.length === 0
                ? emptyPlaceholder
                : options[indexDefault]?.display ?? placeholder}
            </TextField>
          </View>
          <MaterialIcons
            name="arrow-drop-down"
            style={[
              styles.defaultIcon,
              isDisabled && styles.disabledIcon,
              error && styles.errorIcon,
            ]}
            solid
          />
        </View>
      </ModalDropdown>
      {!hideError && !isEmpty(error) && (
        <TextField style={styles.errorInputMessage}>{error}</TextField>
      )}
    </View>
  );
}

export default DropDown;
