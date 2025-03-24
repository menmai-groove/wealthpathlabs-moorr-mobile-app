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
import { selectOwnersWithOthers } from 'store/Auth/selector';
import { selectBorrowingOwnership } from 'store/Borrowing/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.borrowing';

function AddNewBorrowingStep3(props) {
  useOnBackButtonPress(props.onBack);
  const { t, onPress: handleNextStep, onCancel } = props;
  const styles = useThemedStyle(themedStyles);
  const userOwnerships = useSelector(selectOwnersWithOthers);
  const borrowingOwnership = useSelector(selectBorrowingOwnership);
  const [selectCard, setSelectCard] = useState(0);

  useEffect(() => {
    const id = get(borrowingOwnership, 'value');
    let index = userOwnerships.findIndex(item => get(item, 'value') === id);
    if (index > -1) {
      setSelectCard(index);
    }
  }, [borrowingOwnership, userOwnerships]);

  const renderCardRelate = ({ item, index }) => {
    return (
      <CardRelate
        onPress={() => setSelectCard(index)}
        type={index}
        text={item.label}
        style={[index % 2 === 0 && AppStyle.marginRight15, styles.itemCard]}
        selected={selectCard === index}
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
              type="secondary"
              text={t('global.cancel')}
              style={styles.buttonField}
              onPress={onCancel}
            />
            <ButtonField text={t('global.next')} style={styles.buttonField} onPress={onNext} />
          </View>
        }
      />
    </View>
  );
}

export default compose(withTranslation())(AddNewBorrowingStep3);
