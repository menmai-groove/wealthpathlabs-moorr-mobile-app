import MoneyIncomeIcon from 'assets/svgs/onboardingInterview/moneyIncomeIcon';
import ButtonField from 'components/basics/ButtonField';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { GlobalLib } from 'libs';
import { formatCurrency } from 'libs/util';
import { isArray, toNumber } from 'lodash';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import AddEditIncome from 'screens/OnBoardingInterview/components/Step/IncomeTelling/AddEditIncome';
import { setEmptyIncome, updateIncome } from 'store/OnBoardingInterview/action';
import { selectIncomes } from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.onBoardingInterview.incomeTelling';

function IncomeTelling(props) {
  useOnBackButtonPress(props.onBack);
  const { t, onPress: handleNextStep } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatch = useDispatch();
  const listIncome = useSelector(selectIncomes);
  const handleIncome = income => {
    GlobalLib.CustomModal.get().hide();
    dispatch(updateIncome(income));
  };
  const handleRemoveIncome = income => {
    GlobalLib.CustomModal.get().hide();
    income.delete = true;
    dispatch(updateIncome(income));
  };

  const onPress = () => {
    if (!isArray(listIncome)) {
      dispatch(setEmptyIncome());
    }
    handleNextStep();
  };

  const handleOpenModal = (income = null) => {
    GlobalLib.CustomModal.get().show({
      type: 'absolute',
      body: (
        <AddEditIncome
          onCancel={() => GlobalLib.CustomModal.get().hide()}
          data={income}
          onSubmit={handleIncome}
          onRemove={handleRemoveIncome}
        />
      ),
    });
  };

  const renderItemIncome = ({ item }) => {
    return (
      <TouchableField onPress={() => handleOpenModal(item)}>
        <View style={styles.cardItem}>
          <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
            <MoneyIncomeIcon />
            <View style={styles.incomeType}>
              <TextField style={styles.textIncomeType}>{item?.incomeType?.display}</TextField>
            </View>
          </View>
          <View
            style={[
              AppStyle.rowFlex,
              AppStyle.spaceBetweenContent,
              AppStyle.marginTop15,
              AppStyle.marginBottom5,
            ]}>
            <TextField>{t(`${i18nScope}.ownership`)}</TextField>
            <TextField type="paragraph-1" style={styles.textColor}>
              {item?.ownership?.display}
            </TextField>
          </View>
          <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
            <TextField>{t(`${i18nScope}.annualIncome`)}</TextField>
            <TextField type="paragraph-1" style={styles.textColor}>
              {formatCurrency(toNumber(item?.annualIncome))}
            </TextField>
          </View>
        </View>
      </TouchableField>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareFlatList
        style={AppStyle.flex1}
        showsVerticalScrollIndicator={false}
        data={listIncome}
        keyExtractor={item => item?.id?.toString()}
        renderItem={renderItemIncome}
        contentContainerStyle={AppStyle.padBottom40}
        ListHeaderComponent={
          <Question emotion="smile">
            <TextField style={styles.textContent}>
              {t(`${i18nScope}.content1`)}
              <TextField font="medium" style={styles.textHighlight}>
                {` '${t(`${i18nScope}.addAnIncome`)}' `}
              </TextField>
              {t(`${i18nScope}.content2`) + '\n'}
              {t(`${i18nScope}.content3`)}
            </TextField>
          </Question>
        }
        ListFooterComponent={
          <View>
            <TouchableField style={styles.buttonAdd} onPress={() => handleOpenModal()}>
              <View style={styles.buttonAddIcon}>
                <Feather name="plus" size={22} color={styles.buttonAddIcon.color} />
              </View>
              <TextField font="medium" style={[styles.textContent, AppStyle.marginLeft15]}>
                {t(`${i18nScope}.addAnIncome`)}
              </TextField>
            </TouchableField>
            <ButtonField text={t('global.next')} style={AppStyle.marginTop20} onPress={onPress} />
          </View>
        }
      />
    </View>
  );
}

export default compose(withTranslation())(IncomeTelling);
