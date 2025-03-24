import { CardItemWithTrashIcon } from 'components/basics/CardItem';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { GlobalLib } from 'libs';
import { cloneDeep, isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { compose } from 'redux';
import ModalAddPreTax from 'screens/Income/components/ModalAddPreTax';
import PreTaxItem from 'screens/Income/components/PreTax';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'screens.income';

const AddNewPreTax = props => {
  const { t, onChangeValue, error, value, disabled, income, formParentRef } = props;
  const styles = useThemedStyle(themedStyles);
  const [listPreTax, setListPreTax] = useState(value || []);

  const handleSave = item => {
    const dataNew = cloneDeep(listPreTax);
    GlobalLib.CustomModal.get().hide();
    if (item?._id) {
      const indexPreTax = dataNew.findIndex(option => option._id === item._id);
      dataNew[indexPreTax] = item;
      setListPreTax(dataNew);
      onChangeValue(dataNew);
    } else {
      Object.assign(item, { _id: `__ObjectId__${listPreTax.length + 1}` });
      dataNew.push(item);
      setListPreTax(dataNew);
      onChangeValue(dataNew);
    }
  };
  const handleOpenModal = data => {
    GlobalLib.CustomModal.get().show({
      type: 'absolute',
      body: (
        <ModalAddPreTax
          onCancel={() => GlobalLib.CustomModal.get().hide()}
          onSubmit={handleSave}
          dataProps={data}
          income={income}
          formParentRef={formParentRef}
        />
      ),
    });
  };
  const onDeletePreTax = (item, index) => {
    GlobalLib.ConfirmModal.get().show({
      title: t(`${i18nScope}.titlePreTaxDelete`),
      content: t(`${i18nScope}.contentPreTaxDelete`),
      onConfirm: () => {
        const dataNew = cloneDeep(listPreTax);
        dataNew[index]._delete = true;
        setListPreTax(dataNew);
        onChangeValue(dataNew);
      },
    });
  };

  return (
    <View>
      {listPreTax?.map((item, index) => {
        if (item?._delete) {
          return null;
        }
        return (
          <CardItemWithTrashIcon
            trashIconContainerStyle={styles.trashIconContainerStyle}
            key={`pretax-${index}`}
            onDelete={() => onDeletePreTax(item, index)}>
            <PreTaxItem data={item} handleOpenModal={() => handleOpenModal(item)} />
          </CardItemWithTrashIcon>
        );
      })}

      <View style={disabled && styles.disabledContainer}>
        <TouchableField
          style={!isEmpty(error) ? styles.buttonAddError : styles.buttonAdd}
          onPress={() => handleOpenModal()}
          disabled={disabled}>
          <View style={styles.buttonAddIcon}>
            <Feather name="plus" size={22} color={styles.buttonAddIcon.color} />
          </View>
          <TextField type="heading-4" style={[styles.textContent, AppStyle.marginLeft15]}>
            {t(`${i18nScope}.buttonAddPreTax`)}
          </TextField>
        </TouchableField>
      </View>
      {!isEmpty(error) && (
        <TextField style={[styles.errorInputMessage, AppStyle.marginTop5]}>{error}</TextField>
      )}
    </View>
  );
};

export default compose(withTranslation())(AddNewPreTax);
