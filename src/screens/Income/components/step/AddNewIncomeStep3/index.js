import ButtonField from 'components/basics/ButtonField';
import TextField from 'components/basics/TextField';
import CardRelate from 'components/layouts/CardRelate';
import { get } from 'lodash';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import React, { useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { selectOwnersWithoutJoint } from 'store/Auth/selector';
import { selectIncomeOwnership } from 'store/Income/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.income.cardRelate';

function AddNewIncomeStep3(props) {
  useOnBackButtonPress(props.onBack);
  const { t, onPress: handleNextStep, onCancel, disabled } = props;
  const styles = useThemedStyle(themedStyles);
  const userOwnerships = useSelector(selectOwnersWithoutJoint);
  const incomeOwnership = useSelector(selectIncomeOwnership);
  const [selectCard, setSelectCard] = useState(0);

  useEffect(() => {
    if (incomeOwnership?.owners?.length > 1) {
      setSelectCard(2);
    } else if (incomeOwnership?.owners?.length === 1) {
      const id = get(incomeOwnership, ['owners', 0, 'owner']);
      let index = userOwnerships?.findIndex(item => get(item, ['owners', 0, 'owner']) === id);
      setSelectCard(index);
    }
  }, [incomeOwnership, userOwnerships]);

  const renderCardRelate = ({ item, index }) => {
    return (
      <CardRelate
        onPress={() => setSelectCard(index)}
        type={index}
        text={item?.label.toString()}
        style={[index % 2 === 0 && AppStyle.marginRight15, styles.itemCard]}
        selected={selectCard === index}
        disabled={disabled}
      />
    );
  };

  const onNext = () => {
    handleNextStep({
      ownership: userOwnerships[selectCard],
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        bounces={false}
        data={userOwnerships}
        contentContainerStyle={[AppStyle.padX30, AppStyle.padBottom30, AppStyle.marginTop20]}
        keyExtractor={item => item.toString()}
        renderItem={renderCardRelate}
        numColumns={2}
        ListHeaderComponentStyle={AppStyle.marginBottom30}
        ListHeaderComponent={
          <TextField type="heading-4">{t(`${i18nScope}.questionCardRelate`)}</TextField>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.padTop30]}>
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
              onPress={onNext}
            />
          </View>
        }
      />
    </View>
  );
}

export default compose(withTranslation())(AddNewIncomeStep3);
