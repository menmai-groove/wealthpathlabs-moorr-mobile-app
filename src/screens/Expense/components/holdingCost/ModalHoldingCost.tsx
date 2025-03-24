import DynamicForm from 'components/basics/DynamicForm';
import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import { AppStyle } from 'theme';

import { IModalHoldingCost, SubmitDataHoldingCostType } from 'screens/Expense/types';
import ButtonField from 'components/basics/ButtonField';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';

const i18nScope = 'screens.expense';

export function ModalHoldingCost({
  onCancel,
  onSubmit: submitData,
  typeModal = 'ADD',
  moneySMARTSJarsType = [],
  itemData,
  isDefaultName = false,
}: IModalHoldingCost) {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles);
  const formatFormJson = require('assets/forms/layouts/expense-add-holdingcost.json');
  const formRef = useRef(null);

  const dataForm = useMemo(() => {
    const { layout = [] } = formatFormJson;
    const formLayout = layout.map(item => {
      const { fields = [] } = item;
      return {
        ...item,
        fields: fields.map(field => {
          switch (field.id) {
            case 'jar':
              field.options = moneySMARTSJarsType;
              const value =
                moneySMARTSJarsType.find(i => i.display === itemData?.jar) ||
                moneySMARTSJarsType[0];

              field.value = value;
              break;
            case 'essentialAmount':
              field.value = itemData?.essentialAmount ? itemData?.essentialAmount?.toString() : '';
              break;
            case 'holdingCostName':
              field.value = itemData?.holdingCostName || '';
              field.readonly = isDefaultName;
              if (itemData?.isDefault) {
                field.displayValue = itemData.holdingCostLabel;
              } else {
                field.displayValue = null;
              }
              break;
            default:
              break;
          }
          return field;
        }),
      };
    });
    return { layout: formLayout };
  }, [formatFormJson, itemData, moneySMARTSJarsType, isDefaultName]);

  const onSubmit = useCallback(
    (data: SubmitDataHoldingCostType) => {
      Keyboard.dismiss();
      const objNew = {
        _id: itemData?._id,
        holdingCostLabel: itemData?.holdingCostLabel,
        isDefault: itemData?.isDefault,
        holdingCostName: data.holdingCostName,
        essentialAmount: Number(data.essentialAmount),
        jar: data.jar?.value,
      };
      submitData(objNew);
    },
    [submitData, itemData],
  );
  return (
    <KeyboardAwareFlatList
      bounces={false}
      listKey={'dynamic-form'}
      data={[]}
      renderItem={() => null}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[AppStyle.flex1, AppStyle.justifyContent]}
      ListHeaderComponent={() => (
        <View style={styles.container}>
          <TextField type="heading-2" style={AppStyle.textCenter}>
            {typeModal === 'ADD'
              ? t(`${i18nScope}.editExpense.addHoldingCostTitle`)
              : t(`${i18nScope}.editExpense.editHoldingCostTitle`)}
          </TextField>

          <View style={styles.group} collapsable={false}>
            <DynamicForm ref={formRef} data={dataForm} onSubmit={onSubmit} />
          </View>
          <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.marginTop20]}>
            <ButtonField type="secondary" text={t('global.cancel')} onPress={onCancel} />
            <ButtonField
              type="primary"
              text={t('global.save')}
              onPress={() => formRef?.current?.submit()}
            />
          </View>
        </View>
      )}
    />
  );
}

const themedStyles = {
  container: {
    backgroundColor: 'palette.color-dynamic-container',
    padding: 20,
    opacity: 1,
    borderRadius: 10,
  },
  group: {
    marginVertical: 15,
  },
  iconDelete: { position: 'absolute', top: 0, right: 0, padding: 12 },
};
