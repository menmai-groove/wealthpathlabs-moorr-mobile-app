import TextField from 'components/basics/TextField';
import ModalDropdown from 'greact-native-modal-dropdown';
import { get } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.titleDropdown';

function TitleDropdown({ value, options, onSelect }, ref) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [currentWidth, setCurrentWidth] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(0);

  const handleOnSelect = useCallback(
    index => {
      onSelect(index);
    },
    [onSelect],
  );

  const _onLayout = ({ nativeEvent }) => {
    if (currentWidth === 0) {
      const { width } = nativeEvent.layout;
      setCurrentWidth(width);
    }
  };

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const height = get(styles, ['defaultItem', 'height'], 46);
    const padding = get(styles, ['dropdownStyle', 'padding'], 8) * 2;
    setCurrentHeight(Math.min(6, options.length) * height + padding);
  }, [options.length, styles]);

  const itemHeight = get(styles, ['defaultItem', 'height'], 46);
  const separatorHeight = get(styles, ['separator', 'height'], 2);

  return (
    <View>
      <ModalDropdown
        options={options}
        renderRow={option => {
          const selected = option?.value === value?.value;
          return (
            <View
              style={[
                {
                  height: itemHeight,
                },
                styles.defaultItem,
                selected && styles.selectedItem,
              ]}>
              <TextField
                style={[styles.defaultText, selected && styles.selectedText]}
                numberOfLines={2}>
                {option?.display}
              </TextField>
            </View>
          );
        }}
        renderSeparator={() => <View style={styles.separator} />}
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
        dropdownListProps={{
          persistentScrollbar: true,
          indicatorStyle: 'black',
          maxToRenderPerBatch: 15,
          updateCellsBatchingPeriod: 100,
          getItemLayout: (data, index) => {
            return {
              length: itemHeight,
              index,
              offset: (itemHeight + separatorHeight) * index,
            };
          },
        }}
        onSelect={handleOnSelect}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            AppStyle.rowFlex,
            AppStyle.spaceBetweenContent,
            AppStyle.alignContent,
            AppStyle.padY5,
          ]}
          onLayout={_onLayout}>
          <View style={AppStyle.flex1}>
            <TextField style={styles.buttonText} numberOfLines={2}>
              {value?.display}
            </TextField>
          </View>
          <View style={styles.caretContainer}>
            <MaterialIcons name={'arrow-drop-down'} size={24} />
          </View>
        </View>
      </ModalDropdown>
    </View>
  );
}

export default forwardRef(TitleDropdown);
