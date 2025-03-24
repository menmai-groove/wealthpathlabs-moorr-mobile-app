import ButtonField from 'components/basics/ButtonField';
import { useThemedStyle } from 'providers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const FooterControl = ({ isEdited, onCancel, onSave, textButtonSave, textButtonCancel }) => {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles);
  return (
    <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
      <ButtonField
        type="secondary"
        text={textButtonCancel || t('global.cancel')}
        style={[styles.buttonField, styles.buttonCancel]}
        onPress={onCancel}
        customHandleColor={() => {
          return {
            backgroundColor: styles.buttonCancelPressed.backgroundColor,
          };
        }}
      />
      <ButtonField
        text={textButtonSave || t('global.save')}
        style={styles.buttonField}
        onPress={onSave}
        disabled={!isEdited}
        type={!isEdited ? 'disabled' : 'primary'}
      />
    </View>
  );
};

export default FooterControl;
