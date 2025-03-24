import ButtonField from 'components/basics/ButtonField';
import TextField from 'components/basics/TextField';
import CardRelate from 'components/layouts/CardRelate';
import { AppConstants } from 'constant';
import { get } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useEffect, useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { selectAssetOwnership, selectAssetType } from 'store/Asset/selector';
import { selectOwnersWithOthers } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.asset';

function AddNewAssetStep3(props) {
  const { t, onPress: handleNextStep, onCancel } = props;
  const styles = useThemedStyle(themedStyles);
  const userOwnerships = useSelector(selectOwnersWithOthers);
  const assetOwnership = useSelector(selectAssetOwnership);
  const assetType = useSelector(selectAssetType);
  const [selectCard, setSelectCard] = useState(0);

  const availableOwner = useMemo(() => {
    switch (assetType) {
      case AppConstants.AssetType.LifeInsurance:
        return userOwnerships.filter(
          item =>
            item.label !== AppConstants.ownershipType.Joint &&
            item.label !== AppConstants.ownershipType.Other,
        );
      case AppConstants.AssetType.BankAccounts:
      case AppConstants.AssetType.OtherAssets:
      case AppConstants.AssetType.Vehicles:
        return userOwnerships.filter(item => item.label !== AppConstants.ownershipType.Other);

      default:
        return userOwnerships;
    }
  }, [assetType, userOwnerships]);

  useEffect(() => {
    const id = get(assetOwnership, 'value');
    let index = userOwnerships.findIndex(item => get(item, 'value') === id);
    if (index > -1) {
      setSelectCard(index);
    }
  }, [assetOwnership, userOwnerships]);

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
      ownership: availableOwner[selectCard],
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        bounces={false}
        data={[
          ...availableOwner,
          // {
          //   ownershipType: 'Other',
          //   label: 'Other',
          // },
        ]}
        contentContainerStyle={[AppStyle.padX30, AppStyle.padBottom30, AppStyle.marginTop20]}
        keyExtractor={item => item.value.toString()}
        renderItem={renderCardRelate}
        numColumns={2}
        ListHeaderComponentStyle={AppStyle.marginBottom30}
        ListHeaderComponent={
          <TextField type="heading-4">{t(`${i18nScope}.questionCardRelate`)}</TextField>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View style={[AppStyle.rowFlex, AppStyle.spaceAroundContent, AppStyle.padTop30]}>
            <ButtonField
              type="secondary"
              text={t('global.cancel')}
              style={styles.buttonField}
              onPress={onCancel}
            />
            <ButtonField
              text={t('global.next')}
              style={styles.buttonField}
              onPress={onNext}
              disabled={setSelectCard < 0}
              type={setSelectCard < 0 ? 'disabled' : 'primary'}
            />
          </View>
        }
      />
    </View>
  );
}

export default compose(withTranslation())(AddNewAssetStep3);
