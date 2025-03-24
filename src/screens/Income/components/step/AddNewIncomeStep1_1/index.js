import ButtonField from 'components/basics/ButtonField';
import RadioButtonGroup from 'components/basics/RadioButtonGroup';
import { get } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import { selectOwnershipStructure } from 'store/Auth/selector';
import { selectIncomeOwnershipStructure } from 'store/Income/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.income';

function AddNewIncomeStep1_1(props) {
  const styles = useThemedStyle(themedStyles, 'screens.AddNewIncome.AddNewIncomeStep1');
  const ownershipStructures = useSelector(selectOwnershipStructure);
  const incomeOwnershipStructure = useSelector(selectIncomeOwnershipStructure);
  const [modalType, setModalType] = useState(
    incomeOwnershipStructure?.value || get(ownershipStructures, [0, 'value']),
  );

  const { t, onPress: handleNextStep, onCancel, disabled } = props;
  return (
    <View style={styles.container}>
      <Question emotion="smile" content={t(`${i18nScope}.questionBusinessIncome`)} />
      <View>
        <View style={[AppStyle.columnFlex, AppStyle.spaceBetweenContent, AppStyle.margin5]}>
          <RadioButtonGroup
            layout="row"
            options={ownershipStructures}
            selectedValue={modalType}
            onSelect={({ value }) => setModalType(value)}
            disabled={disabled}
          />
        </View>
      </View>
      <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
        <ButtonField
          type={disabled ? 'disabled' : 'secondary'}
          text={t('global.cancel')}
          style={styles.buttonField}
          onPress={onCancel}
        />
        <ButtonField
          type={disabled ? 'disabled' : 'primary'}
          text={t('global.next')}
          style={styles.buttonField}
          onPress={() => {
            const data = ownershipStructures.find(item => item.value === modalType);
            handleNextStep({ ownershipStructure: data });
          }}
        />
      </View>
    </View>
  );
}

export default compose(withTranslation())(AddNewIncomeStep1_1);
