import { yupResolver } from '@hookform/resolvers/yup';
import ButtonField from 'components/basics/ButtonField';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { SchemaLib, UtilLib } from 'libs';
import { useThemedStyle } from 'providers';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { withTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import { selectAssetName, selectAssetType } from 'store/Asset/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.asset';

function AddNewAssetStep2(props) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { t, onPress: handleNextStep, onCancel } = props;
  const assetName = useSelector(selectAssetName);
  const assetType = useSelector(selectAssetType);
  const cardNameInput = useRef(null);
  const [disabledNext, setDisableNext] = useState(false);

  const { handleSubmit, control, errors, setValue } = useForm({
    defaultValues: { name: assetName ?? '' },
    resolver: yupResolver(SchemaLib.addNewAsset),
    shouldFocusError: false,
  });
  const onSubmit = data => {
    Keyboard.dismiss();
    cardNameInput.current.blur();
    handleNextStep(data);
  };
  useEffect(() => {
    setValue('name', assetName || '');
  }, [assetName, setValue]);

  useEffect(() => {
    const disabled = UtilLib.handleCheckValueStep2(assetName);
    setDisableNext(disabled);
  }, [assetName]);

  const onError = () => {
    Keyboard.dismiss();
  };
  return (
    <View style={styles.container}>
      <ScrollView
        style={(AppStyle.flex1, AppStyle.pad30)}
        contentContainerStyle={AppStyle.menuPaddingBottom}
        showsVerticalScrollIndicator={false}>
        <View style={styles.itemAsset}>
          <TextField style={styles.textItemAsset}>{assetType}</TextField>
        </View>
        <Question emotion="confused" content={t(`${i18nScope}.step2Hint`)} />
        <View collapsable={false} style={AppStyle.padBottom30}>
          <Controller
            name="name"
            control={control}
            render={({ onChange, onBlur, value }) => (
              <InputField
                ref={cardNameInput}
                placeholder={t(`${i18nScope}.nameCardPlaceholder`)}
                value={value}
                onBlur={onBlur}
                onChangeText={text => {
                  onChange(text);
                  const disabled = UtilLib.handleCheckValueStep2(text);
                  setDisableNext(disabled);
                }}
                onSubmitEditing={() => {}}
                error={errors.name?.message}
              />
            )}
          />
        </View>
        <View style={[AppStyle.rowFlex, AppStyle.spaceAroundContent]}>
          <ButtonField
            type="secondary"
            text={t('global.cancel')}
            style={styles.buttonField}
            onPress={onCancel}
          />
          <ButtonField
            text={t('global.next')}
            style={styles.buttonField}
            onPress={handleSubmit(onSubmit, onError)}
            type={disabledNext ? 'disabled' : 'primary'}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export default compose(withTranslation())(AddNewAssetStep2);
