import i18n from 'bootstrap/i18n';
import TextField from 'components/basics/TextField';
import ModalDropdown from 'greact-native-modal-dropdown';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { get, isEmpty, isNil } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import FeaIcon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.dropDown';

function DropDownForForm(
  {
    label,
    value = null,
    options = [],
    placeholder,
    emptyPlaceholder,
    onSelect = () => {},
    error,
    disabled,
    hideError,
    required,
    multipleSelect = false,
    saveScrollPosition = true,
    hideDropdownIcon = false,
    showsVerticalScrollIndicator = true,
    style,
    shouldUpdateWidth = false,
    readonly,
  },

  ref,
) {
  const _placeholder = placeholder ?? i18n.t(`${i18nScope}.placeholder`);
  const _emptyPlaceholder = emptyPlaceholder ?? i18n.t(`${i18nScope}.emptyPlaceholder`);
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);
  const isDisabled = disabled ?? options.length === 0;
  const [currentWidth, setCurrentWidth] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(0);
  const optionLayoutRef = useRef([]);
  const [focused, setFocused] = useState(0);

  useEffect(() => {
    const height = get(styles, ['defaultItem', 'height'], 46);
    const padding = get(styles, ['dropdownStyle', 'padding'], 8) * 2;
    setCurrentHeight(Math.min(6, options.length) * height + padding);
  }, [options.length, styles]);

  const _onLayout = ({ nativeEvent }) => {
    if (currentWidth === 0 || shouldUpdateWidth) {
      const { width } = nativeEvent.layout;
      setCurrentWidth(width);
    }
  };

  const _onOptionLayout = useCallback(
    ({ nativeEvent }, index) => {
      optionLayoutRef.current.splice(index, 0, nativeEvent.layout);
      if (optionLayoutRef.current?.length === options.length) {
        const padding = get(styles, ['dropdownStyle', 'padding'], 8) * 2;
        setCurrentHeight(
          optionLayoutRef.current
            .slice(0, Math.min(6, options.length))
            .map(item => Math.round(item.height))
            .reduce((a, b) => a + b) + padding,
        );
      }
    },
    [options.length, styles],
  );

  const _onDropdownWillShow = () => {
    optionLayoutRef.current?.splice(0, optionLayoutRef.current?.length);
    !focused && setFocused(true);
  };

  const _onDropdownWillHide = () => {
    focused && setFocused(false);
  };

  const renderRow = useCallback(
    (option, index) => {
      let active = false;
      if (!isNil(value)) {
        if (multipleSelect) {
          active = value.some(x =>
            !isNil(x.id)
              ? x.id === option.id
              : typeof x.value === 'object' || typeof x.value === 'undefined'
              ? x.display === option.display
              : x.value === option.value,
          );
        } else {
          active = !isNil(value.id)
            ? value.id === option.id
            : typeof value.value === 'object' || typeof value.value === 'undefined'
            ? value.display === option.display
            : value.value === option.value;
        }
      }
      return (
        <View
          onLayout={e => _onOptionLayout(e, index)}
          collapsable={false}
          style={[
            styles.defaultItem,
            active && styles.selectedItem,
            multipleSelect && [AppStyle.rowFlex, AppStyle.alignContent, AppStyle.flexStartContent],
          ]}>
          {multipleSelect && (
            <View style={[styles.checkBox, active ? styles.active : styles.inactive]}>
              {active && <FeaIcon name={'check'} style={styles.iconCheckbox} />}
            </View>
          )}
          <TextField
            numberOfLines={2}
            style={[
              styles.defaultText,
              active && styles.selectedText,
              option?.disable && styles.disabledText,
              multipleSelect && AppStyle.flex1,
            ]}>
            {option?.display}
          </TextField>
        </View>
      );
    },
    [_onOptionLayout, styles, value, multipleSelect],
  );

  const textSelected = useMemo(() => {
    if (!isEmpty(value)) {
      if (multipleSelect) {
        return value[0]?.display?.toString();
      }
      const matched = options?.find(opt => opt.value === value?.value);
      if (matched) {
        return matched?.display?.toString();
      }
      return null;
    }
  }, [multipleSelect, options, value]);

  const selectOption = (index, option) => {
    if (!option.disable) {
      if (multipleSelect) {
        let actived = (value ?? []).some(x =>
          !isNil(x.id)
            ? x.id === option.id
            : typeof x.value === 'object' || typeof x.value === 'undefined'
            ? x.display === option.display
            : x.value === option.value,
        );
        if (actived) {
          let newList = (value ?? []).filter(x =>
            !isNil(x.id)
              ? x.id !== option.id
              : typeof x.value === 'object' || typeof x.value === 'undefined'
              ? x.display !== option.display
              : x.value !== option.value,
          );
          onSelect(newList, option);
        } else {
          onSelect([...(value ?? []), option], option);
        }
      } else {
        onSelect(index, option);
      }
    }
  };

  return (
    <View>
      {(!isEmpty(label) || typeof label === 'function') && (
        <View style={styles.labelWrapper}>
          {typeof label === 'function' ? (
            label()
          ) : (
            <TextField style={styles.inputLabel}>{label}</TextField>
          )}
          {required && <TextField style={styles.requiredChar}>*</TextField>}
        </View>
      )}
      <ModalDropdown
        bounces={false}
        onDropdownWillShow={_onDropdownWillShow}
        onDropdownWillHide={_onDropdownWillHide}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        options={options}
        dropdownStyle={[
          styles.dropdownStyle,
          {
            width: currentWidth,
            height: currentHeight,
          },
        ]}
        adjustFrame={_style => {
          _style.top = Platform.OS === 'ios' ? _style.top : _style.top - StatusBar.currentHeight;
          return _style;
        }}
        onSelect={selectOption}
        renderRow={renderRow}
        renderSeparator={() => <View style={styles.separator} />}
        multipleSelect={multipleSelect}
        disabled={isDisabled || readonly}
        saveScrollPosition={saveScrollPosition}
        dropdownListProps={{
          persistentScrollbar: true,
          indicatorStyle: 'black',
          maxToRenderPerBatch: 15,
          updateCellsBatchingPeriod: 100,
          getItemLayout: (data, index) => {
            const itemHeight = get(styles, ['defaultItem', 'height'], 46);
            const separatorHeight = get(styles, ['separator', 'height'], 2);
            return {
              length: itemHeight,
              index,
              offset: (itemHeight + separatorHeight) * index,
            };
          },
        }}>
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
              numberOfLines={multipleSelect ? 1 : 2}
              style={[
                styles.defaultText,
                isDisabled && styles.disabledText,
                isEmpty(textSelected) && styles.placeholderText,
              ]}>
              {!isEmpty(textSelected)
                ? textSelected
                : options.length === 0
                ? _emptyPlaceholder
                : _placeholder}
            </TextField>
          </View>
          {multipleSelect && value.length > 1 && (
            <View style={styles.boxMultipleSelect}>
              <TextField style={styles.numberAdditional}>{`+${value.length - 1}`}</TextField>
            </View>
          )}
          {!hideDropdownIcon && (
            <MaterialIcons
              name="arrow-drop-down"
              style={[
                styles.defaultIcon,
                isDisabled && styles.disabledIcon,
                error && styles.errorIcon,
              ]}
              solid
            />
          )}
        </View>
      </ModalDropdown>
      {!hideError && !isEmpty(error) && (
        <TextField style={[styles.errorInputMessage, AppStyle.marginTop5]}>{error}</TextField>
      )}
    </View>
  );
}

export default forwardRef(DropDownForForm);
