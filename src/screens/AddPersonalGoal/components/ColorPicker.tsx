import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import TextField from 'components/basics/TextField';
import ButtonField from 'components/basics/ButtonField';
import TouchableField from 'components/basics/TouchableField';
import FeaIcon from 'react-native-vector-icons/Feather';
//
import { GlobalLib } from 'libs';
import { useTranslation } from 'react-i18next';
import { useThemedStyle } from 'providers';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { AppStyle } from 'theme';
import { isFunction } from 'lodash';

import { COLORS } from '../constants';

interface IColorPicker {
  style?: object;
  color: string;
  onChange?: () => void;
}

const i18nScope = 'screens.personalGoal.addPersonalGoal';
const getTScope = text => `${i18nScope}.${text}`;
const NUM_COLUMNS = 6;

export function ColorPicker({ color = '', onChange = () => {}, style }: IColorPicker) {
  const { t } = useTranslation();
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle });
  const [selectedColor, setSelectedColor] = useState(color);

  return (
    <View style={styles.container}>
      <View style={AppStyle.alignContent}>
        <TextField type="heading-2">{t(getTScope('colorPicker.title'))}</TextField>
      </View>
      <FlatList
        numColumns={NUM_COLUMNS}
        data={COLORS}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isSelected = selectedColor === item;
          const selectedStyles = isSelected && styles.selectedItem;
          return (
            <View style={[AppStyle.middleContent, { width: `${100 / NUM_COLUMNS}%` }]}>
              <TouchableField
                activeOpacity={0.8}
                key={item}
                style={[styles.pickerItem, selectedStyles, { backgroundColor: item }]}
                onPress={() => setSelectedColor(item)}>
                {isSelected && <FeaIcon name={'check'} size={20} style={styles.icon} />}
              </TouchableField>
            </View>
          );
        }}
      />
      <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
        <ButtonField
          text={t('global.cancel')}
          type="secondary"
          onPress={() => GlobalLib.CustomModal.get().hide()}
          style={styles.button}
        />
        <ButtonField
          text={t('global.set')}
          type="primary"
          style={styles.button}
          onPress={() => {
            selectedColor && isFunction(onChange) && onChange(selectedColor);
            GlobalLib.CustomModal.get().hide();
          }}
        />
      </View>
    </View>
  );
}

const themedStyles = {
  container: {},
  button: {
    width: '50%',
  },
  listContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  pickerItem: {
    height: '36@ms0',
    width: '36@ms0',
    borderRadius: 999,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedItem: {
    height: '40@ms0',
    width: '40@ms0',
    borderWidth: 2,
    margin: 6,
    borderColor: '#FFF',
    shadowColor: 'palette.color-dynamic-shadow',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  icon: {
    color: 'checkbox.icon-color',
    // fontSize: 'checkbox.icon-font-size',
  },
};
