import { useThemedStyle } from 'providers';
import React from 'react';
import { FlatList, View } from 'react-native';

import themedStyles from '../../styles';
import SettingItem from '../SettingItem';

const SettingList = ({ key = 'id', ...props }) => {
  const styles = useThemedStyle(themedStyles, 'screens.settings');
  return (
    <View>
      <FlatList
        {...props}
        contentContainerStyle={styles.settingList}
        renderItem={({ item }) => <SettingItem {...item} />}
        keyExtractor={item => `${item[key]}`}
      />
    </View>
  );
};
export default SettingList;
