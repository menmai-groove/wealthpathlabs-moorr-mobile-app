import FooterControl from 'components/basics/FooterControl';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import { AppConstants } from 'constant';
import { get, includes } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { selectLoanType } from 'store/Auth/selector';
import { selectBorrowingType } from 'store/Borrowing/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.borrowing';

function AddNewBorrowingStep1(props) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const scrollRef = useRef();
  const { t, onPress: handleNextStep, onCancel } = props;
  const loanType = useSelector(selectLoanType);
  const loanTypeCustom = useMemo(() => {
    let result = [];
    if (loanType) {
      result = loanType.filter(l => !includes(l.tags, AppConstants.Borrowing.Mortgage));
      result = [
        { label: AppConstants.Borrowing.Mortgage, value: AppConstants.Borrowing.Mortgage },
        ...result,
      ];
    }
    return result;
  }, [loanType]);

  const borrowingType = useSelector(selectBorrowingType);

  const [selectBorrowing, setSelectBorrowing] = useState(
    borrowingType || get(loanTypeCustom, [0, 'value']),
  );

  const renderListBorrowingType = useMemo(() => {
    return loanTypeCustom?.map((item, index) => {
      const { label, value } = item;
      return (
        <TouchableOpacity
          key={index}
          style={[value === selectBorrowing ? styles.itemIncomeActive : styles.itemIncome]}
          onPress={() => setSelectBorrowing(value)}>
          <TextField
            style={value === selectBorrowing ? styles.textItemIncomeActive : styles.textItemIncome}>
            {label}
          </TextField>
        </TouchableOpacity>
      );
    });
  }, [loanTypeCustom, selectBorrowing, styles]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={[AppStyle.flex1, AppStyle.padX30]}
        contentContainerStyle={[AppStyle.padBottom90, AppStyle.padTop30]}
        showsVerticalScrollIndicator={false}>
        <TextField style={AppStyle.marginBottom10} type="heading-4">
          {t(`${i18nScope}.questionSelectItemBorrowing`)}
        </TextField>
        {renderListBorrowingType}
      </KeyboardAwareScrollView>
      <View style={styles.wrapperControl}>
        <FooterControl
          onCancel={onCancel}
          onSave={() => handleNextStep({ type: selectBorrowing, mortgageType: '' })}
          textButtonSave={t('global.next')}
          isEdited
        />
      </View>
    </View>
  );
}

export default compose(withTranslation())(AddNewBorrowingStep1);
