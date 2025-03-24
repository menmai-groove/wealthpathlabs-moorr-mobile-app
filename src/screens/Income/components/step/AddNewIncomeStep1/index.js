import ButtonField from 'components/basics/ButtonField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import { get } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useEffect, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { selectDataIncomeType } from 'store/Auth/selector';
import { selectIncomeType } from 'store/Income/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.income';

function AddNewIncomeStep1(props) {
  const styles = useThemedStyle(themedStyles, 'screens.AddNewIncome.AddNewIncomeStep1');
  const scrollRef = useRef();
  const { t, onPress: handleNextStep, onCancel, disabled } = props;
  const dataIncomeType = useSelector(selectDataIncomeType);
  const incomeType = useSelector(selectIncomeType);
  const [selectIncome, setSelectIncome] = useState(incomeType || get(dataIncomeType, [0, 'value']));
  const [nameType, setNameType] = useState(get(dataIncomeType, [0, 'label']));

  const selectObject = type => {
    setSelectIncome(type);
  };
  useEffect(() => {
    const indexIncomeType = dataIncomeType.findIndex(item => item?.value === selectIncome);
    const labelIncomeType = get(dataIncomeType, [indexIncomeType, 'label']);
    setNameType(labelIncomeType);
  }, [selectIncome, dataIncomeType]);
  const ItemIncome = data => {
    const { label, value } = data.data;
    return (
      <TouchableOpacity
        style={[
          value === selectIncome ? styles.itemIncomeActive : styles.itemIncome,
          disabled && styles.disabledItemIncome,
        ]}
        onPress={() => selectObject(value, label)}
        disabled={disabled}>
        <TextField
          style={value === selectIncome ? styles.textItemIncomeActive : styles.textItemIncome}>
          {label}
        </TextField>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={(AppStyle.flex1, AppStyle.pad30)}
        contentContainerStyle={AppStyle.menuPaddingBottom}
        showsVerticalScrollIndicator={false}>
        <TextField style={AppStyle.marginBottom10} type="heading-4">
          {t(`${i18nScope}.questionSelectItemIncome`)}
        </TextField>
        {dataIncomeType?.map((item, index) => {
          return <ItemIncome data={item} key={index} />;
        })}
        <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.padY20]}>
          <ButtonField
            type={disabled ? 'disabled' : 'secondary'}
            text={t('global.cancel')}
            style={styles.buttonField}
            onPress={onCancel}
          />
          <ButtonField
            text={t('global.next')}
            type={!selectIncome || disabled ? 'disabled' : 'primary'}
            style={styles.buttonField}
            onPress={() =>
              handleNextStep({
                type: selectIncome,
                nameType: nameType,
              })
            }
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withTranslation())(AddNewIncomeStep1);
