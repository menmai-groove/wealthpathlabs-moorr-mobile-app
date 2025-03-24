import ButtonField from 'components/basics/ButtonField';
import Condition from 'components/basics/Condition';
import { useKeyboardState } from 'providers/keyboard';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import { AppStyle } from 'theme';

const OnboardingFooterControl = ({
  onCancel,
  onSubmit,
  textButtonCancel = '',
  textButtonNext = '',
  typeButtonNext = 'primary',
}) => {
  const { t } = useTranslation();
  const { visible: keyboardVisible } = useKeyboardState();
  return (
    <Condition display={Platform.OS === 'ios' ? !keyboardVisible : true}>
      <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
        <ButtonField
          type="secondary"
          text={textButtonCancel || t('global.cancel')}
          style={AppStyle.marginTop20}
          onPress={onCancel}
        />
        <ButtonField
          text={textButtonNext || t('global.next')}
          style={AppStyle.marginTop20}
          onPress={onSubmit}
          type={typeButtonNext}
        />
      </View>
    </Condition>
  );
};

export default OnboardingFooterControl;
