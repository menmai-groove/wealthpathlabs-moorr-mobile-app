// screens/AddPersonalGoal/index.tsx

import React, { useRef, useMemo, useCallback } from 'react';
// components
import { View } from 'react-native';
import Header from 'components/layouts/Header';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
//
import { AppConstants } from 'constant';
import moment from 'moment';
import { NavigationServiceLib } from 'libs';
import { useThemedStyle } from 'providers';
import { useTranslation } from 'react-i18next';
// import { useSelector } from 'react-redux';
//
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import getModule from 'store/PersonalGoals/module';
import { useDispatchResolve } from 'libs/hooks';
import { createPersonalGoal } from 'store/PersonalGoals/action';
// import { selectListYearOptions } from 'store/PersonalGoals/selector';
import { AppStyle } from 'theme';

//
import { PersonalGoalForm } from './components';
import themedStyles from './style';
import { DEFAULT_COLOR } from './constants';

const i18nScope = 'screens.personalGoal.addPersonalGoal';

function AddPersonalGoal() {
  const dispatchResolve = useDispatchResolve();
  const { t } = useTranslation(AppConstants.defaultLanguageNamespace, { keyPrefix: i18nScope });
  const styles = useThemedStyle(themedStyles, i18nScope);
  // const yearOptions = useSelector(selectListYearOptions);
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);

  const defaultValues = useMemo(() => {
    const newDate = moment().add(1, 'days').toDate();
    return {
      dueDate: newDate,
      description: '',
      colour: DEFAULT_COLOR,
      value: '',
    };
  }, []);

  const onSubmit = useCallback(
    data => {
      const { description, colour, dueDate, photo, value } = data;

      dispatchResolve(
        createPersonalGoal({
          description,
          colour,
          dueDate: moment(dueDate).toISOString(),
          photo,
          value,
        }),
      )
        .then(() => {
          NavigationServiceLib.pop();
        })
        .catch(() => {});
    },
    [dispatchResolve],
  );
  const getYearRange = () => {
    const tomorrow = moment().add(1, 'days').toDate();
    const goalDate = defaultValues?.dueDate;

    const minYear = goalDate ? new Date(goalDate) : tomorrow;

    const maxYear = undefined;

    if (!minYear && !maxYear) {
      return [];
    }
    if (!maxYear) {
      return [minYear.toISOString()];
    }
    return [minYear.toISOString(), maxYear.toISOString()];
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
    <View style={styles.container}>
      <Header type="back" title={t('headerTitle')} />
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={[AppStyle.flex1, AppStyle.pad30]}
        contentContainerStyle={AppStyle.menuPaddingBottom}
        showsVerticalScrollIndicator={false}>
        <PersonalGoalForm
          yearRange={getYearRange()}
          formType="ADD"
          onSubmit={onSubmit}
          onError={onErrorForm}
          defaultValues={defaultValues}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

export default withDynamicModuleLoader(getModule())(AddPersonalGoal);
