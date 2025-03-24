import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { useThemedStyle } from 'providers';
import React from 'react';
import { View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const ButtonAddHousehold = ({ onPress, text }) => {
  const styles = useThemedStyle(themedStyles);
  return (
    <TouchableField style={styles.buttonAdd} onPress={onPress}>
      <View style={styles.buttonAddIcon}>
        <Feather name="plus" size={22} color={styles.buttonAddIcon?.color} />
      </View>
      <TextField type="heading-4" style={[AppStyle.flex1, AppStyle.marginLeft15]}>
        {text || ''}
      </TextField>
    </TouchableField>
  );
};

export default ButtonAddHousehold;
