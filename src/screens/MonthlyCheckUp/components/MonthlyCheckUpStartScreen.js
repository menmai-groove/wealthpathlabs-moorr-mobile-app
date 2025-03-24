import ButtonField from 'components/basics/ButtonField';
import DynamicForm from 'components/basics/DynamicForm';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import { cloneDeep, get } from 'lodash';
import moment from 'moment';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import BalanceForm from 'screens/MonthlyCheckUp/components/BalanceForm';
import Question from 'screens/OnBoardingInterview/components/Question';
import { selectFlags } from 'store/Auth/selector';
import { startMonthlyCheckUp } from 'store/MonthlyCheckUp/action';
import { selectOpenedCheckup, selectStartDate } from 'store/MonthlyCheckUp/selector';
import { AppStyle } from 'theme';

const i18nScope = 'screens.monthlyCheckUp';

function MonthlyCheckUpStartScreen(
  { styles, minDate, disabledSelectDate, handleSetUpMoneySMARTSTracking },
  ref,
) {
  const { t } = useTranslation();

  const formRef = useRef(null);
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);
  const { checkUpFlow } = useSelector(selectFlags);
  const currentCheckup = useSelector(selectOpenedCheckup);
  const currentCheckupStartDate = currentCheckup?.startDate;
  const startDate = useSelector(selectStartDate);
  const [enableSubmit, setEnableSubmit] = useState(checkUpFlow ? false : true);

  const formData = useMemo(() => {
    const formatFormJson = require('assets/forms/layouts/monthly-check-up.json');
    const newDataJSON = cloneDeep(formatFormJson);
    const fields = get(newDataJSON, ['layout', 0, 'fields'], []);
    fields[0].disable = disabledSelectDate;

    return newDataJSON;
  }, [disabledSelectDate]);

  useEffect(() => {
    if (minDate && formRef?.current && !checkUpFlow) {
      formRef.current?.setFormValue('startDate', moment(minDate).toDate());
    }
  }, [minDate, checkUpFlow]);

  useImperativeHandle(ref, () => ({
    refresh: formRef.current?.refresh,
  }));

  const onSubmit = data => {
    if (checkUpFlow) {
      const primaryAccount = data?.accountBalance?.reduce(
        (prev, current) => prev + Number(current.amount),
        0,
      );
      const creditCardAccount = data?.creditCardBalance?.reduce(
        (prev, current) => prev + Number(current.amount),
        0,
      );
      dispatch(
        startMonthlyCheckUp({
          ...data,
          primaryAccount,
          creditCardAccount,
          startDate: new Date(data.startDate).toISOString(),
        }),
      );

      return;
    }
    dispatch(
      startMonthlyCheckUp({
        ...data,
        startDate: new Date(data.startDate).toISOString(),
      }),
    );
  };

  const scrollToElement = useCallback(
    (element, timeout = 250) => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        element && scrollRef?.current?.scrollIntoView(element);
      }, timeout);
    },
    [scrollRef],
  );

  const onErrorForm = useCallback(
    (formErrors, dataFormErrors, firstKey) => {
      if (firstKey) {
        scrollToElement(dataFormErrors[firstKey]?.componentRef);
      }
    },
    [scrollToElement],
  );

  return (
    <KeyboardAwareScrollView
      ref={scrollRef}
      style={[AppStyle.flex1, AppStyle.marginX30, AppStyle.marginTop30]}
      contentContainerStyle={AppStyle.menuPaddingBottom}
      showsVerticalScrollIndicator={false}>
      <Question content={t(`${i18nScope}.questionStartScreen`)} />
      {checkUpFlow ? (
        <BalanceForm
          ref={formRef}
          onSubmit={onSubmit}
          styles={styles}
          defaultValue={{ checkupDate: startDate ?? currentCheckupStartDate }}
          handleSetUpMoneySMARTSTracking={handleSetUpMoneySMARTSTracking}
          onChangeData={_data => {
            if (_data) {
              const { accountBalance, creditCardBalance } = _data;
              const hasAmount =
                accountBalance?.some(x => x.amount != null && x.amount !== '') ||
                creditCardBalance?.some(x => x.amount != null && x.amount !== '');
              setEnableSubmit(hasAmount);
            }
          }}
        />
      ) : (
        <DynamicForm
          key={`form-${minDate || '1'}`}
          ref={formRef}
          data={formData}
          onSubmit={onSubmit}
          onError={onErrorForm}
        />
      )}
      <ButtonField
        type={enableSubmit ? 'primary' : 'disabled'}
        style={[AppStyle.marginTop20]}
        text={t(`${i18nScope}.btnCheckUp`)}
        onPress={() => formRef.current.submit()}
        disabled={!enableSubmit}
      />
    </KeyboardAwareScrollView>
  );
}

export default forwardRef(MonthlyCheckUpStartScreen);
