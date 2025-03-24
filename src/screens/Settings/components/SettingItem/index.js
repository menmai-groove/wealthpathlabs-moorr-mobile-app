import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { useThemedStyle } from 'providers';
import React from 'react';
import { View } from 'react-native';
import EnIcon from 'react-native-vector-icons/Entypo';
import { AppStyle } from 'theme';

import themedStyles from '../../styles';

const SettingItem = ({ title, onPress = () => {}, icon = null, settingValue = '' }) => {
  const styles = useThemedStyle(themedStyles, 'screens.settings');

  return (
    <TouchableField onPress={onPress}>
      <View style={[AppStyle.pad15, styles.settingItem]}>
        <View style={[AppStyle.rowFlex, AppStyle.middleContent]}>
          <TextField type="paragraph-1" style={AppStyle.marginRight5}>
            <EnIcon size={16} name={icon} />
          </TextField>
          <TextField type="paragraph-1">{title}</TextField>
        </View>
        <View style={[AppStyle.rowFlex, AppStyle.middleContent]}>
          <TextField type="paragraph-1" style={AppStyle.marginRight5}>
            {settingValue}
          </TextField>
          <TextField type="paragraph-1">
            <EnIcon name="chevron-thin-right" size={16} />
          </TextField>
        </View>
      </View>
    </TouchableField>
  );
};
export default SettingItem;
