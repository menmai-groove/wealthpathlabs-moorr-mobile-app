import ButtonField from 'components/basics/ButtonField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import { get } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { selectAssetType } from 'store/Asset/selector';
import { selectDataAssetType } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.asset';

function AddNewAssetStep1(props) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const scrollRef = useRef();
  const { t, onPress: handleNextStep, onCancel } = props;
  const dataAssetType = useSelector(selectDataAssetType);
  const assetType = useSelector(selectAssetType);
  const [selectAsset, setSelectAsset] = useState(assetType || get(dataAssetType, [0, 'value']));

  const selectObject = type => {
    setSelectAsset(type);
  };

  const ItemAsset = data => {
    const { label, value } = data.data;
    return (
      <TouchableOpacity
        style={[value === selectAsset ? styles.itemAssetActive : styles.itemAsset]}
        onPress={() => selectObject(value)}>
        <TextField
          style={value === selectAsset ? styles.textItemAssetActive : styles.textItemAsset}>
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
          {t(`${i18nScope}.step1Hint`)}
        </TextField>
        {dataAssetType?.map((item, index) => {
          return <ItemAsset data={item} key={index} />;
        })}
        <View style={[AppStyle.rowFlex, AppStyle.spaceAroundContent, AppStyle.padY20]}>
          <ButtonField
            type="secondary"
            text={t('global.cancel')}
            style={styles.buttonField}
            onPress={onCancel}
          />
          <ButtonField
            text={t('global.next')}
            type={!selectAsset ? 'disabled' : null}
            style={styles.buttonField}
            onPress={() => handleNextStep({ type: selectAsset })}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withTranslation())(AddNewAssetStep1);
