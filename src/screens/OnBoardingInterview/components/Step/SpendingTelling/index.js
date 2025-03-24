import ButtonField from 'components/basics/ButtonField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { GlobalLib } from 'libs';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import React, { useCallback, useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import Expenses from 'screens/OnBoardingInterview/components/Step/SpendingTelling/Expenses';
import { selectExpenseType } from 'store/Auth/selector';
import { updateListSpending } from 'store/OnBoardingInterview/action';
import { selectSpending } from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.onBoardingInterview.spendingTelling';

function SpendingTelling(props) {
  useOnBackButtonPress(props.onBack);
  const { t } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatch = useDispatch();
  const listSpendingType = useSelector(selectExpenseType);
  const listSpending = useSelector(selectSpending);

  const [listSelected, setListSelected] = useState(listSpending || []);

  const handleCompleted = () => {
    GlobalLib.CustomModal.get().hide();
    props.onBack();
  };

  const handleOpenModal = () => {
    const list = listSelected || [];
    dispatch(updateListSpending(list));
    GlobalLib.CustomModal.get().show({
      type: 'absolute',
      body: (
        <Expenses onCancel={() => GlobalLib.CustomModal.get().hide()} onSubmit={handleCompleted} />
      ),
    });
  };

  const handleSelect = useCallback(
    item => {
      let active = listSelected?.some(x => x.category === item.value);
      if (active) {
        let newList = listSelected?.filter(x => x.category !== item.value);
        setListSelected(newList);
      } else {
        let newList = [...listSelected, { ...item, category: item.value }];
        setListSelected(newList);
      }
    },
    [listSelected],
  );

  const renderListSpendingType = useMemo(() => {
    return listSpendingType.map((item, index) => {
      let active = listSelected?.some(x => x.category === item.value);
      return (
        <TouchableField key={index.toString()} onPress={() => handleSelect(item)}>
          <View style={[styles.cardItem, active && styles.itemActive]}>
            <TextField style={active && styles.textItemActive}>{item.label}</TextField>
          </View>
        </TouchableField>
      );
    });
  }, [handleSelect, listSelected, listSpendingType, styles]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={AppStyle.flex1}
        contentContainerStyle={AppStyle.padBottom40}
        showsVerticalScrollIndicator={false}>
        <Question emotion="confused">
          <TextField style={styles.textContent}>
            {t(`${i18nScope}.content1`) + '\n'}
            {t(`${i18nScope}.content2`)}
            <TextField font="medium" style={styles.textHighlight}>
              {` '${t(`${i18nScope}.next`)}' `}
            </TextField>
            {t(`${i18nScope}.content3`)}
          </TextField>
        </Question>
        <View style={styles.layout}>{renderListSpendingType}</View>
        <ButtonField
          text={t('global.next')}
          style={AppStyle.marginTop10}
          onPress={handleOpenModal}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withTranslation())(SpendingTelling);
