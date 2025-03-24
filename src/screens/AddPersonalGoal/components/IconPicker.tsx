import React, { useCallback, useMemo, useState } from 'react';
import { View, Image, Platform } from 'react-native';
import uuid from 'react-native-uuid';
import TextField from 'components/basics/TextField';
import ButtonField from 'components/basics/ButtonField';
import TouchableField from 'components/basics/TouchableField';
//
import { GlobalLib } from 'libs';
import { useThemedStyle } from 'providers';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { AppStyle } from 'theme';
import { FlatList } from 'react-native-gesture-handler';
import { isFunction } from 'lodash';
import { useTranslation } from 'react-i18next';
import { AppConstants } from 'constant';

import { IconData } from '../constants';

const i18nScope = 'screens.personalGoal.addPersonalGoal';
const getTScope = text => `${i18nScope}.${text}`;
const NUM_COLUMNS = 4;

interface IIconPicker {
  style?: object;
  onChange?: (e: IconData) => void;
}

export function IconPicker({ onChange, style }: IIconPicker) {
  const { t } = useTranslation();
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);
  const [selectedIcon, setSelectedIcon] = useState(null);

  const icons = useMemo(
    () => AppConstants.listIconGoal.map(icon => ({ ...icon, id: uuid.v4().toString() })),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: IconData }) => {
      const isSelected = selectedIcon?.id === item.id;
      const selectedStyles = isSelected && styles.selectedItem;
      return (
        <View style={[AppStyle.middleContent, { width: `${100 / NUM_COLUMNS}%` }]}>
          <TouchableField
            activeOpacity={0.8}
            key={item.id}
            onPress={() => setSelectedIcon(item)}
            style={[styles.pickerItem, selectedStyles]}>
            <Image source={{ uri: item.source }} style={styles.image} resizeMode="center" />
            {isSelected && (
              <Image source={require('assets/images/common/check.png')} style={styles.check} />
            )}
          </TouchableField>
        </View>
      );
    },
    [selectedIcon, styles],
  );

  return (
    <View style={styles.container}>
      <View style={AppStyle.alignContent}>
        <TextField type="heading-2">{t(getTScope('selectIcon'))}</TextField>
      </View>
      <FlatList
        numColumns={NUM_COLUMNS}
        data={icons}
        scrollEnabled={false}
        renderItem={renderItem}
        contentContainerStyle={styles.listIcons}
      />
      <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
        <ButtonField
          text={t('global.cancel')}
          type="secondary"
          onPress={GlobalLib.CustomModal.get().hide}
          style={styles.button}
        />
        <ButtonField
          text={t('global.set')}
          type="primary"
          style={styles.button}
          onPress={() => {
            selectedIcon &&
              isFunction(onChange) &&
              onChange({ ...selectedIcon, photo: selectedIcon.uuidFileName, isIcon: true });
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
  image: {
    height: '60@ms0',
    width: '60@ms0',
  },
  pickerItem: {
    borderRadius: 16,
    padding: 1,
    margin: 6,
    backgroundColor: '#FAFAFC',
  },
  listIcons: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  selectedItem: {
    borderWidth: 1,
    borderColor: '#D9D9E5',
    padding: 0,
    shadowColor: 'palette.color-dynamic-shadow',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  icon: {
    color: 'checkbox.icon-color',
  },
  check: {
    height: 18,
    width: 18,
    position: 'absolute',
    right: -5,
    top: -5,
  },
};
