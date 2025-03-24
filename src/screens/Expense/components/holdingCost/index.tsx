import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { GlobalLib } from 'libs';
import { get, isEmpty, omit } from 'lodash';
import uuid from 'react-native-uuid';
import { useThemedStyle } from 'providers';
import React, { useCallback, useMemo, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'bootstrap/i18n';
import { View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppStyle } from 'theme';
import { CardItemWithTrashIcon } from 'components/basics/CardItem';
import { DropdownItemType, SubmitDataHoldingCostType, IHoldingCost } from 'screens/Expense/types';
import { AppConstants } from 'constant';
import { useSelector } from 'react-redux';
import {
  selectDefaultInvestmentHoldingCosts,
  selectDefaultPropertyHoldingCosts,
} from 'store/Auth/selector';

import { ModalHoldingCost } from './ModalHoldingCost';
import { CardItem } from './CardItem';
import themedStyles from './style';

const i18nScope = 'screens.expense.editExpense';

function HoldingCost({ onChange, error, field, value = [], disabled }: IHoldingCost, ref: any) {
  const { related } = field;

  const moneySMARTSJarsType: DropdownItemType[] = get(related, 'moneySMARTSJarsType') || [];
  const assetType = get(related, 'assetType') || '';
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles);
  const defaultHoldingCost = useSelector(state => {
    if (assetType === AppConstants.AssetExpenseType.Investment) {
      return selectDefaultInvestmentHoldingCosts(state);
    } else {
      return selectDefaultPropertyHoldingCosts(state);
    }
  });

  const _sortedValues = useMemo(() => {
    const data = [];
    defaultHoldingCost.forEach(item => {
      const findItem = value.find(
        v => item.value === v.holdingCostName || item.label === v.holdingCostName,
      );
      if (findItem) {
        data.push({ ...findItem, isDefault: true, holdingCostLabel: item.label });
      }
    });
    const additionalHoldingCosts = value.filter(
      item =>
        !defaultHoldingCost.some(
          e => e.value === item.holdingCostName || e.label === item.holdingCostName,
        ),
    );
    if (additionalHoldingCosts?.length) {
      data.push(...additionalHoldingCosts);
    }
    return data;
  }, [defaultHoldingCost, value]);

  const checkDefaultName = useCallback(
    (item: SubmitDataHoldingCostType) => {
      return (
        defaultHoldingCost.map(i => i.label).includes(item.holdingCostName) ||
        defaultHoldingCost.map(i => i.value).includes(item.holdingCostName)
      );
    },
    [defaultHoldingCost],
  );

  const handleAdd = useCallback(
    (item: SubmitDataHoldingCostType) => {
      if (
        _sortedValues
          .map(i => i.holdingCostLabel || i.holdingCostName)
          .includes(item.holdingCostLabel || item.holdingCostName)
      ) {
        return GlobalLib.Toast.get().toastError(i18n.t('errorMsg.existedHoldingCost'));
      }
      if (checkDefaultName(item)) {
        return GlobalLib.Toast.get().toastError(i18n.t('errorMsg.cannotAddHoldingCost'));
      }

      GlobalLib.CustomModal.get().hide();

      const _id = AppConstants.newObjectID + uuid.v4().toString();
      const newListHoldingCost = [..._sortedValues, { ...item, _id }];
      onChange(newListHoldingCost);
    },
    [onChange, _sortedValues, checkDefaultName],
  );

  const handleDelete = useCallback(
    (item: SubmitDataHoldingCostType) => {
      const newListHoldingCost = _sortedValues?.filter(i => item._id !== i._id);
      onChange(newListHoldingCost);
    },
    [_sortedValues, onChange],
  );

  const handleSave = useCallback(
    (item: SubmitDataHoldingCostType) => {
      if (!item?.isDefault) {
        if (
          _sortedValues
            .filter(i => i._id !== item._id)
            .map(i => i.holdingCostLabel || i.holdingCostName)
            .includes(item.holdingCostLabel || item.holdingCostName)
        ) {
          return GlobalLib.Toast.get().toastError(i18n.t('errorMsg.existedHoldingCost'));
        }
        if (checkDefaultName(item)) {
          return GlobalLib.Toast.get().toastError(
            i18n.t('errorMsg.cannotUpdateToDefaultHoldingCost'),
          );
        }
      }

      GlobalLib.CustomModal.get().hide();

      const newListHoldingCost = _sortedValues?.map(i => {
        if (item._id === i._id) {
          return omit(item, ['isDefault']) as SubmitDataHoldingCostType;
        }
        return omit(i, ['isDefault']) as SubmitDataHoldingCostType;
      });
      onChange(newListHoldingCost);
    },
    [_sortedValues, onChange, checkDefaultName],
  );

  const handleOpenModal = useCallback(() => {
    GlobalLib.CustomModal.get().show({
      type: 'absolute',
      body: (
        <ModalHoldingCost
          moneySMARTSJarsType={moneySMARTSJarsType}
          onCancel={() => GlobalLib.CustomModal.get().hide()}
          onSubmit={handleAdd}
        />
      ),
    });
  }, [handleAdd, moneySMARTSJarsType]);

  const handleOpenModalItemDetail = useCallback(
    (item: SubmitDataHoldingCostType) => {
      GlobalLib.CustomModal.get().show({
        type: 'absolute',
        body: (
          <ModalHoldingCost
            typeModal="EDIT"
            moneySMARTSJarsType={moneySMARTSJarsType}
            onCancel={() => GlobalLib.CustomModal.get().hide()}
            onSubmit={handleSave}
            itemData={item}
            isDefaultName={item?.isDefault}
          />
        ),
      });
    },
    [handleSave, moneySMARTSJarsType],
  );

  const handleOpenDeleteModal = useCallback(
    item => {
      GlobalLib.ConfirmModal.get().show({
        title: t(`${i18nScope}.deleteTitle`),
        content: t(`${i18nScope}.deleteContent`),
        onConfirm: () => handleDelete(item),
      });
    },
    [handleDelete, t],
  );

  const renderItem = useCallback(
    (item: SubmitDataHoldingCostType) => {
      return (
        <CardItemWithTrashIcon
          key={item._id}
          onDelete={() => handleOpenDeleteModal(item)}
          disabled={item?.isDefault}
          overshootRight={false}
          containerStyle={[AppStyle.marginY5]}>
          <CardItem data={item} onPressItem={handleOpenModalItemDetail} disabled={disabled} />
        </CardItemWithTrashIcon>
      );
    },
    [handleOpenModalItemDetail, handleOpenDeleteModal, disabled],
  );

  return (
    <View ref={ref}>
      {_sortedValues?.map(renderItem)}
      <View style={disabled && styles.disabledContainer}>
        <TouchableField
          style={!isEmpty(error) ? styles.buttonAddError : styles.buttonAdd}
          onPress={handleOpenModal}
          disabled={disabled}>
          <View style={styles.buttonAddIcon}>
            <Feather name="plus" size={22} color={styles.buttonAddIcon.color} />
          </View>
          <TextField type="heading-4" style={[styles.textContent, AppStyle.marginLeft15]}>
            {t(`${i18nScope}.buttonAddHoldingCost`)}
          </TextField>
        </TouchableField>
      </View>
      {!isEmpty(error) && (
        <TextField style={[styles.errorInputMessage, AppStyle.marginTop5]}>
          {error?.message}
        </TextField>
      )}
    </View>
  );
}

export default forwardRef(HoldingCost);
