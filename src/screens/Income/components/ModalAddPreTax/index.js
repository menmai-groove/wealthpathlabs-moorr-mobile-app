import ButtonField from 'components/basics/ButtonField';
import DynamicForm from 'components/basics/DynamicForm';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import { UtilLib } from 'libs';
import { cloneDeep, includes, isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useCallback, useMemo, useRef } from 'react';
import { withTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { RECORD_TYPE } from 'screens/HistoricalLog';
import { selectFrequency } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'screens.income';
const formatFormJson = require('assets/forms/layouts/income-payg-addpretax.json');

function ModalAddPreTax(props) {
  const { t, onCancel, onSubmit: submitData, dataProps, income, formParentRef } = props;
  const styles = useThemedStyle(themedStyles);
  const frequencies = useSelector(selectFrequency);
  const formRef = useRef(null);
  const dataForm = useMemo(() => {
    const jsonObject = cloneDeep(formatFormJson);
    const frequency = UtilLib.getFieldFromFormJSON(jsonObject.layout, 'frequency');
    if (frequency) {
      frequency.options = frequencies;
      if (!isEmpty(frequency.value)) {
        frequency.value = frequencies.find(type => type.value === frequency.value?.value);
      }
    }

    if (dataProps) {
      UtilLib.getFieldFromFormJSON(jsonObject.layout, 'name').value = dataProps?.name;
      UtilLib.getFieldFromFormJSON(jsonObject.layout, 'amount').value =
        `${dataProps?.amount}` || '';
      const indexFrequency = frequencies?.findIndex(item => item?.value === dataProps?.frequency);
      UtilLib.getFieldFromFormJSON(jsonObject.layout, 'frequency').value =
        indexFrequency >= 0 ? frequencies[indexFrequency] : null;
      const amountAsAtForm = UtilLib.getFieldFromFormJSON(jsonObject.layout, 'amountAsAt');
      if (amountAsAtForm) {
        amountAsAtForm.lastDate = amountAsAtForm.value = dataProps?.amountAsAt ?? null;
        if (income && dataProps?._id && !includes(dataProps?._id, 'ObjectId')) {
          const { _id, name } = income;
          amountAsAtForm.info = {
            cardId: _id,
            cardName: name,
            childCardId: dataProps._id,
            field: 'amount',
            category: 'Asset',
            type: income.type,
            recordType: RECORD_TYPE.NUMBER_WITH_FREQUENCY,
          };
        }
      }
    }
    return { layout: jsonObject.layout };
  }, [frequencies, dataProps, income]);

  const onSubmit = useCallback(
    data => {
      Keyboard.dismiss();
      const objNew = {
        amount: Number(data.amount),
        amountAsAt: data.amountAsAt ?? null,
        frequency: data.frequency.value,
        name: data.name,
        _id: dataProps?._id ? dataProps?._id : '',
      };
      submitData(objNew);
    },
    [submitData, dataProps],
  );
  return (
    <KeyboardAwareFlatList
      bounces={false}
      listKey={'dynamic-form'}
      data={[]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[AppStyle.flex1, AppStyle.justifyContent]}
      ListHeaderComponent={
        <View style={styles.container}>
          <TextField type="heading-2" style={AppStyle.textCenter}>
            {t(`${i18nScope}.titleAddPreTax`)}
          </TextField>
          <View style={styles.group} collapsable={false}>
            <DynamicForm
              ref={formRef}
              data={dataForm}
              onSubmit={onSubmit}
              handleBeforeNavigateHistoricalLog={field => {
                formRef?.current?.submit();
                if (isEmpty(formRef?.current?.errors())) {
                  // form parent handle navigation
                  setTimeout(() => {
                    if (formParentRef) {
                      formParentRef.navigationHistoricalLog(field);
                    }
                  }, 500);
                  return false;
                } else {
                  return false;
                }
              }}
            />
          </View>
          <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.marginY20]}>
            <ButtonField type="secondary" text={t('global.cancel')} onPress={onCancel} />
            <ButtonField
              type="primary"
              text={t('global.save')}
              onPress={() => formRef?.current?.submit()}
            />
          </View>
        </View>
      }
    />
  );
}

export default compose(withTranslation())(ModalAddPreTax);
