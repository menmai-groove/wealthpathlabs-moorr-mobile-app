import ButtonField from 'components/basics/ButtonField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { useDispatchResolve } from 'libs/hooks';
import { formatCurrency } from 'libs/util';
import { isEmpty, isNil } from 'lodash';
import { useThemedStyle } from 'providers';
import { default as React, useCallback, useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import OnboardingFooterControl from 'screens/OnBoardingInterview/components/OnboardingFooterControl';
import Question from 'screens/OnBoardingInterview/components/Question';
import SetupExpense from 'screens/OnBoardingInterview/components/Step/SpendingTelling/SetupExpense';
import { selectFrequency } from 'store/Auth/selector';
import { updateListSpending, updateSpending } from 'store/OnBoardingInterview/action';
import { selectSpending } from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'screens.onBoardingInterview.spendingTelling.expenses';

function Expenses(props) {
  const { t, onCancel, onSubmit: submitData } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();
  const spendingSetup = useRef({});
  const [showSetup, setShowSetup] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const listSpending = useSelector(selectSpending);
  const frequencies = useSelector(selectFrequency);

  const spendingSetup1 = useMemo(() => {
    return listSpending?.some(x => !isNil(x.totalAmount));
  }, [listSpending]);

  const spendingCompleted = useMemo(() => {
    return !listSpending?.some(x => isNil(x.totalAmount));
  }, [listSpending]);

  const handleSubmit = data => {
    dispatch(updateSpending(data));
  };

  const renderListSpendingType = useMemo(() => {
    return listSpending?.map((item, index) => {
      return (
        <TouchableField
          key={index.toString()}
          onPress={() => {
            spendingSetup.current = item;
            setShowSetup(true);
          }}>
          <View style={[styles.cardItem]}>
            <TextField style={styles.textItem}>{item.category}</TextField>
            <TextField
              type={!isNil(item?.totalAmount) ? 'paragraph-1' : 'paragraph-2'}
              style={!isNil(item?.totalAmount) && styles.textContent}>
              {!isNil(item?.totalAmount)
                ? formatCurrency(item?.totalAmount)
                : t(`${i18nScope}.setup`)}
            </TextField>
          </View>
        </TouchableField>
      );
    });
  }, [listSpending, styles, t]);

  const onSubmitListExpense = useCallback(() => {
    if (spendingCompleted) {
      submitData();
    } else {
      setShowConfirmation(true);
    }
  }, [spendingCompleted, submitData]);

  const onConfirmFinishExpense = useCallback(() => {
    let defaultFrequency;
    if (!isEmpty(frequencies) && frequencies?.length > 0) {
      const freq = frequencies?.find(f => f.value === 'Monthly');
      if (freq !== null) {
        defaultFrequency = freq;
      } else {
        defaultFrequency = frequencies[0];
      }
    }
    let newList = listSpending.map(item => {
      if (isNil(item.totalAmount)) {
        return {
          ...item,
          totalAmount: 0,
          discretionaryAmount: '0',
          essentialAmount: '0',
          frequency: defaultFrequency?.value,
        };
      }
      return item;
    });
    dispatchResolve(updateListSpending(newList)).finally(() => submitData());
  }, [dispatchResolve, frequencies, listSpending, submitData]);

  const renderConfirmationFinishExpense = useMemo(() => {
    return (
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <TextField type="heading-2" style={AppStyle.textCenter}>
          {t(`${i18nScope}.confirmationTitle`)}
        </TextField>
        <Question emotion={'smile'} style={AppStyle.marginTop20}>
          <TextField style={styles.textContent}>{t(`${i18nScope}.confirmationContent`)}</TextField>
        </Question>
        <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
          <ButtonField
            type="secondary"
            text={t('global.cancel')}
            onPress={() => setShowConfirmation(false)}
          />
          <ButtonField text={t('global.yes')} onPress={onConfirmFinishExpense} />
        </View>
      </KeyboardAwareScrollView>
    );
  }, [styles, onConfirmFinishExpense, t]);

  const renderListExpense = useMemo(() => {
    return (
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <TextField type="heading-2" style={AppStyle.textCenter}>
          {t(`${i18nScope}.title`)}
        </TextField>
        <Question emotion={spendingSetup1 ? 'smile' : 'blink'} style={AppStyle.marginTop20}>
          <TextField style={styles.textContent}>
            {t(`${i18nScope}.content1`)}
            <TextField font="medium" style={styles.textHighlight}>
              {` '${t(`${i18nScope}.completed`)}' `}
            </TextField>
            {t(`${i18nScope}.content2`)}
          </TextField>
        </Question>
        {renderListSpendingType}
        <OnboardingFooterControl
          onCancel={onCancel}
          onSubmit={onSubmitListExpense}
          textButtonNext={t(`${i18nScope}.completed`)}
        />
      </KeyboardAwareScrollView>
    );
  }, [onCancel, onSubmitListExpense, renderListSpendingType, spendingSetup1, styles, t]);

  return (
    <View style={styles.container}>
      {showSetup ? (
        <SetupExpense
          onCancel={() => setShowSetup(false)}
          expenseData={spendingSetup?.current}
          onSubmit={handleSubmit}
          listExpense={listSpending}
        />
      ) : showConfirmation ? (
        renderConfirmationFinishExpense
      ) : (
        renderListExpense
      )}
    </View>
  );
}

export default compose(withTranslation())(Expenses);
