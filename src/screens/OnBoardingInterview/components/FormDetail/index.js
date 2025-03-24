import DynamicForm from 'components/basics/DynamicForm';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import React, { useCallback, useRef } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { compose } from 'redux';
import OnboardingFooterControl from 'screens/OnBoardingInterview/components/OnboardingFooterControl';
import { AppStyle } from 'theme';

function FormDetail(props) {
  const {
    t,
    onCancel,
    formFormat = {},
    condition,
    onSubmit: submitData,
    i18nScope,
    textTitle,
    textButtonNext,
    textButtonCancel,
  } = props;
  const formRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollTimeout = useRef();

  const onSubmit = data => {
    submitData(data);
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
    <View>
      <KeyboardAwareFlatList
        ref={scrollRef}
        bounces={false}
        listKey={'dynamic-form'}
        data={[]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <TextField type="heading-2" style={AppStyle.textCenter}>
              {textTitle || t(`${i18nScope}.title2`)}
            </TextField>
            <DynamicForm
              ref={formRef}
              data={formFormat}
              onSubmit={onSubmit}
              onError={onErrorForm}
              conditionLogics={condition}
            />
            <OnboardingFooterControl
              onCancel={onCancel}
              onSubmit={() => formRef.current.submit()}
              textButtonNext={textButtonNext}
              textButtonCancel={textButtonCancel}
            />
          </View>
        }
      />
    </View>
  );
}

export default compose(withTranslation())(FormDetail);
