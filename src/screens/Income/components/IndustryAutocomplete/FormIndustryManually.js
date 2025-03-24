import DropDownForForm from 'components/basics/DropDownForForm';
import { useDispatchResolve } from 'libs/hooks';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { getIndustryClassesData } from 'store/Industry/action';
import { selectIndustryClasses, selectIndustryDivisions } from 'store/Industry/selector';
import { AppStyle } from 'theme';

const FormIndustryManually = ({ onChangeValue, value: industryValue, i18Scope }) => {
  const { t } = useTranslation();
  const dispatch = useDispatchResolve();

  const divisions = useSelector(selectIndustryDivisions);
  const classes = useSelector(selectIndustryClasses);
  const defaultValues = useMemo(() => {
    const divisionField = divisions?.find(item => item?.value === industryValue?.division) ?? null;
    const classField = classes?.find(item => item?.value?.class === industryValue?.class) ?? null;
    return { divisionField, classField };
  }, [classes, divisions, industryValue]);

  const { control, setValue } = useForm({
    defaultValues,
    shouldFocusError: false,
  });

  return (
    <View>
      <View style={[AppStyle.marginTop15]}>
        <Controller
          control={control}
          name={'divisionField'}
          render={({ onChange, value, ref: componentRef }) => (
            <View style={AppStyle.width100}>
              <DropDownForForm
                ref={componentRef}
                value={value}
                options={divisions}
                label={t(`${i18Scope}.division`)}
                // placeholder={t(`${i18Scope}.divisionPlaceholder`)}
                onSelect={index => {
                  onChange(divisions[index]);
                  setValue('classField', null);
                  dispatch(getIndustryClassesData({ division: divisions[index]?.value }));
                }}
              />
            </View>
          )}
        />
      </View>
      <View style={[AppStyle.marginTop15]}>
        <Controller
          control={control}
          name={'classField'}
          render={({ onChange, value, ref: componentRef }) => (
            <View style={AppStyle.width100}>
              <DropDownForForm
                ref={componentRef}
                value={value}
                options={classes}
                label={t(`${i18Scope}.class`)}
                // emptyPlaceholder={t(`${i18Scope}.classPlaceholder`)}
                onSelect={index => {
                  onChange(classes[index]);
                  onChangeValue(classes[index].value);
                }}
              />
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default FormIndustryManually;
