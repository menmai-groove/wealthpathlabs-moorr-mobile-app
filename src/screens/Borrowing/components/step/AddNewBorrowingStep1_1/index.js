import ButtonField from 'components/basics/ButtonField';
import RadioButtonGroup from 'components/basics/RadioButtonGroup';
import { AppConstants } from 'constant';
import { get, includes } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import { selectLoanType } from 'store/Auth/selector';
import { selectBorrowingMortgageType } from 'store/Borrowing/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.borrowing';

function AddNewBorrowingStep1_1(props) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { t, onPress: handleNextStep, onCancel } = props;
  const filter = props?.filter;

  const loanType = useSelector(selectLoanType);
  const mortgageTypes = useMemo(() => {
    let result = [];
    if (loanType) {
      result = loanType.filter(l => includes(l.tags, AppConstants.Borrowing.Mortgage));
    }
    if (filter) {
      result = loanType
        .filter(l => includes(l.tags, AppConstants.Borrowing.Mortgage))
        .filter(l => String(l.value).includes(filter));
    }
    return result;
  }, [loanType, filter]);

  const mortgageTypeSelected = useSelector(selectBorrowingMortgageType);
  const [selected, setSelected] = useState(
    mortgageTypeSelected || get(mortgageTypes, [0, 'value']),
  );

  return (
    <View style={styles.container}>
      <Question content={t(`${i18nScope}.questionMortgage`)} />
      <View style={[AppStyle.columnFlex, AppStyle.spaceBetweenContent, AppStyle.margin5]}>
        <RadioButtonGroup
          layout="row"
          options={mortgageTypes}
          selectedValue={selected}
          onSelect={({ value }) => setSelected(value)}
        />
      </View>
      <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
        <ButtonField
          type="secondary"
          text={t('global.cancel')}
          style={styles.buttonField}
          onPress={onCancel}
        />
        <ButtonField
          text={t('global.next')}
          style={styles.buttonField}
          onPress={() => handleNextStep({ mortgageType: selected })}
        />
      </View>
    </View>
  );
}

export default compose(withTranslation())(AddNewBorrowingStep1_1);
