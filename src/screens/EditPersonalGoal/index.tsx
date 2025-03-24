// screens/AddPersonalGoal/index.tsx

import React, { useRef, useMemo, useCallback, useLayoutEffect, useState } from 'react';
// components
import { View, RefreshControl } from 'react-native';
import Header from 'components/layouts/Header';
//
import { AppConstants } from 'constant';
import moment from 'moment';
import { NavigationServiceLib, GlobalLib, UtilLib } from 'libs';
import { useThemedStyle } from 'providers';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
//
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import getModule from 'store/PersonalGoals/module';
import { useDispatchResolve } from 'libs/hooks';
import { updatePersonalGoal, setPersonalGoal, getPersonalGoal } from 'store/PersonalGoals/action';
import { AppStyle } from 'theme';
import { useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { selectGoalDetail } from 'store/PersonalGoals/selector';
import { PersonalGoalForm } from 'screens/AddPersonalGoal/components';
import { SELECTED_ITEM_TYPE } from 'screens/AddPersonalGoal/constants';
import { selectListYearOptions } from 'store/PersonalGoals/selector';
import TextField from 'components/basics/TextField';
import AnimatedLottieView from 'lottie-react-native';
import { isEmpty, isFunction } from 'lodash';

import themedStyles from './style';

const i18nScope = 'screens.personalGoal.addPersonalGoal';

function getDefaultValues(goalDetail) {
  const newDate = new Date();
  const dueDate = goalDetail?.dueDate ?? newDate;
  return {
    dueDate,
    description: goalDetail?.description || '',
    colour: goalDetail?.colour || '',
    value: goalDetail?.value ? goalDetail?.value?.toString() : '',
  };
}

export type IDefaultImage = { uri: string; type: string; photo?: string; uuidFileName?: string };
function getDefaultImage(goalDetail): IDefaultImage {
  if (goalDetail?.icon) {
    let icon = AppConstants.listIconGoal.find(ic => ic.uuidFileName === goalDetail.icon);
    return {
      uri: icon.source,
      uuidFileName: goalDetail?.icon,
      photo: goalDetail?.icon,
      type: SELECTED_ITEM_TYPE[1],
    };
  }
  return goalDetail?.photoUrl
    ? {
        uri: goalDetail?.photoUrl,
        photo: goalDetail?.photo,
        type: goalDetail?.icon ? SELECTED_ITEM_TYPE[1] : SELECTED_ITEM_TYPE[0],
      }
    : null;
}

function EditPersonalGoal() {
  const route = useRoute();
  const { _id } = route.params;

  const dispatchResolve = useDispatchResolve();
  const { t } = useTranslation(AppConstants.defaultLanguageNamespace, { keyPrefix: i18nScope });
  const styles = useThemedStyle(themedStyles, i18nScope);
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);
  const formRef = useRef(null);
  const goalDetail = useSelector(selectGoalDetail);
  const yearOptions = useSelector(selectListYearOptions);

  const defaultImage = getDefaultImage(goalDetail);
  const defaultValues = useMemo(() => getDefaultValues(goalDetail), [goalDetail]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    if (isEmpty(_id)) {
      return;
    }
    setRefreshing(true);
    dispatchResolve(getPersonalGoal({ _id }))
      .then(goal => {
        setRefreshing(false);
        formRef.current?.resetAllFields(getDefaultValues(goal));
        formRef.current?.resetImage(getDefaultImage(goal));
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [_id, dispatchResolve]);

  const onSubmit = useCallback(
    (data, callback) => {
      if (!isEmpty(goalDetail?._id)) {
        dispatchResolve(updatePersonalGoal({ ...data, _id: goalDetail?._id })).then(() => {
          GlobalLib.Toast.get().toastSuccess(t('msgUpdateSuccess'));
          isFunction(callback) && callback();
        });
      }
    },
    [dispatchResolve, t, goalDetail],
  );

  const onPressBtnAchieve = useCallback(() => {
    if (!goalDetail) {
      return null;
    }
    dispatchResolve(
      updatePersonalGoal({
        _id: goalDetail._id,
        isAchieved: !goalDetail.isAchieved,
      }),
    ).then(results => {
      const { isAchieved } = results;
      if (isAchieved) {
        GlobalLib.ConfirmModal.get().show({
          onlyOneButton: true,
          top: (
            <View style={styles.confettiContainer}>
              <AnimatedLottieView
                resizeMode="contain"
                style={styles.confetti}
                source={require('assets/images/optiIcon/confetti.json')}
                autoPlay
                loop
              />
              <AnimatedLottieView
                resizeMode="contain"
                style={styles.smileOpti}
                source={require('assets/images/optiIcon/excited.json')}
                autoPlay
                loop
              />
            </View>
          ),
          title: t('congratsTitle'),
          content: (
            <TextField type="paragraph-2">
              {t('congratsBody1')}{' '}
              <TextField style={styles.descriptionText} font="semi-bold">
                {goalDetail?.description}
              </TextField>{' '}
              {t('congratsBody2')}
            </TextField>
          ),
          onConfirm: () => NavigationServiceLib.pop(),
        });
      } else {
        GlobalLib.Toast.get().toastSuccess(t('msgUpdateSuccess'));
      }
    });
  }, [dispatchResolve, goalDetail, styles, t]);

  const onConfirmDelete = useCallback(() => {
    dispatchResolve(
      updatePersonalGoal({
        _id: goalDetail._id,
        dueDate: goalDetail.dueDate,
        _delete: true,
      }),
    ).then(e => e && NavigationServiceLib.pop());
  }, [dispatchResolve, goalDetail]);

  const onPressBtnDelete = useCallback(() => {
    GlobalLib.ConfirmModal.get().show({
      title: t('deleteConfirmTitle'),
      content: t('deleteConfirmBody'),
      onConfirm: onConfirmDelete,
    });
  }, [onConfirmDelete, t]);

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

  useLayoutEffect(() => {
    if (!isEmpty(_id)) {
      dispatchResolve(getPersonalGoal({ _id }));
      return () => {
        dispatchResolve(setPersonalGoal());
      };
    }
  }, [_id, dispatchResolve]);

  const getYearRange = () => {
    const tomorrow = moment().add(1, 'days').toDate();
    const length = yearOptions?.length;
    const goalDate = defaultValues?.dueDate;

    const minYear = goalDate
      ? UtilLib.compareDate(goalDate, tomorrow) > 0
        ? tomorrow
        : new Date(goalDate)
      : length > 0
      ? new Date(yearOptions[0].value, 0, 1)
      : undefined;

    const maxYear = undefined;

    if (!minYear && !maxYear) {
      return [];
    }
    if (!maxYear) {
      return [minYear.toISOString()];
    }
    return [minYear.toISOString(), maxYear.toISOString()];
  };

  return (
    <View style={styles.container}>
      <Header type="back" title={t('editHeaderTitle')} />
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={[AppStyle.flex1, AppStyle.pad30]}
        contentContainerStyle={AppStyle.menuPaddingBottom}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {goalDetail && (
          <PersonalGoalForm
            ref={formRef}
            yearRange={getYearRange()}
            formType="EDIT"
            onSubmit={onSubmit}
            onError={onErrorForm}
            defaultValues={defaultValues}
            defaultImage={defaultImage}
            isAchieved={goalDetail?.isAchieved}
            onPressBtnAchieve={onPressBtnAchieve}
            onPressBtnDelete={onPressBtnDelete}
          />
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

export default withDynamicModuleLoader(getModule())(EditPersonalGoal);
