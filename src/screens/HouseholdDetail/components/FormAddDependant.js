import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const FormAddDependant = ({ i18nScope, text, onChangeText, title, onRemove }, ref) => {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles);
  return (
    <View style={[styles.group, AppStyle.padX15, AppStyle.padY15]}>
      <TextField font="semi-bold" type="paragraph-1" style={styles.textColor}>
        {title}
      </TextField>
      <View style={styles.formBlock}>
        <InputField
          value={text}
          onChangeText={onChangeText}
          label={t(`${i18nScope}.dependantName`)}
        />
      </View>
      <TextField style={styles.textRemove} onPress={onRemove} suppressHighlighting={true}>
        {t(`${i18nScope}.removeDependant`)}
      </TextField>
    </View>
  );
};

export default React.forwardRef(FormAddDependant);
