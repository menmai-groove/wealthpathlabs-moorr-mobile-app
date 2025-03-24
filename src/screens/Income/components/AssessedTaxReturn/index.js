import DropDownForForm from 'components/basics/DropDownForForm';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { UtilLib } from 'libs';
import { get, toNumber } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useCallback, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectAssessedTaxReturn } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const FIELDS = {
  PREFIX_KEY: 'assessedTaxReturn',
  FY: 'FY',
  SALARY: 'salary',
};
const AssessedTaxReturn = ({
  control,
  onChangeValue,
  valueProps = {},
  lableType,
  getTotalAnual,
  updateDataFormErrors,
  error,
  field,
  disabled,
}) => {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles);

  const [currentFY, setCurrentFY] = useState(get(valueProps, [0]));
  const dataAssessedTaxReturn = useSelector(selectAssessedTaxReturn);
  const changelableByFY = useCallback(
    Year => {
      let label = '';
      const yearCurrent = currentFY?.FY?.split('/') || [];
      const FYLastYear =
        yearCurrent.length > 1
          ? `${toNumber(yearCurrent[0] - 1)}/${toNumber(yearCurrent[1] - 1)}`
          : '';
      switch (Year) {
        case 'CurrentYear':
          label = t(lableType, { FY: currentFY?.FY });
          break;
        case 'LastYear':
          label = t(lableType, { FY: FYLastYear });
          break;

        default:
          break;
      }
      return label;
    },
    [t, lableType, currentFY],
  );
  const taxReturned = useRef([
    {
      _id: get(valueProps, [0, '_id']),
      FY: get(valueProps, [0, FIELDS.FY]),
      salary: get(valueProps, [0, FIELDS.SALARY]) ?? null,
    },
    {
      _id: get(valueProps, [1, '_id']),
      FY: get(valueProps, [1, FIELDS.FY]),
      salary: get(valueProps, [1, FIELDS.SALARY]) ?? null,
    },
  ]);
  const handleOnChange = (_field, val) => {
    if (_field === FIELDS.FY) {
      const yearCurrent = val?.value?.split('/') || [];
      const FYLastYear =
        yearCurrent.length > 1
          ? `${toNumber(yearCurrent[0] - 1)}/${toNumber(yearCurrent[1] - 1)}`
          : '';
      taxReturned.current[0][FIELDS.FY] = val?.value;
      taxReturned.current[1][FIELDS.FY] = FYLastYear;
    }

    if (_field === `${field?.id || FIELDS.PREFIX_KEY}[0].${FIELDS.SALARY}`) {
      taxReturned.current[0][FIELDS.SALARY] = val ?? null;
    }

    if (_field === `${field?.id || FIELDS.PREFIX_KEY}[1].${FIELDS.SALARY}`) {
      taxReturned.current[1][FIELDS.SALARY] = val ?? null;
    }
    onChangeValue(taxReturned.current);
  };
  const getLeftComponentInput = useCallback(() => {
    return <TextField style={[styles.inputIcon]}>{'$'}</TextField>;
  }, [styles]);
  return (
    <View>
      <View
        style={{}}
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors(FIELDS.FY, {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors(FIELDS.FY, {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          defaultValue={
            UtilLib.getFYTaxReturnByValue(dataAssessedTaxReturn, get(valueProps, [0, FIELDS.FY])) ||
            null
          }
          name={FIELDS.FY}
          render={({ onChange, value, ref: componentRef }) => (
            <View style={AppStyle.width100}>
              <DropDownForForm
                ref={componentRef}
                value={value}
                options={dataAssessedTaxReturn}
                label={t('forms.payg.assessedTax')}
                onSelect={index => {
                  onChange(dataAssessedTaxReturn[index]);
                  handleOnChange(FIELDS.FY, dataAssessedTaxReturn[index]);
                  setCurrentFY({ FY: dataAssessedTaxReturn[index]?.value });
                }}
                disabled={disabled}
              />
            </View>
          )}
        />
      </View>
      <View
        style={[AppStyle.marginTop15]}
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors(`${field?.id || FIELDS.PREFIX_KEY}[0].${FIELDS.SALARY}`, {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors(`${field?.id || FIELDS.PREFIX_KEY}[0].${FIELDS.SALARY}`, {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          name={`${field?.id || FIELDS.PREFIX_KEY}[0].${FIELDS.SALARY}`}
          defaultValue={get(valueProps, [0, FIELDS.SALARY]) ?? null}
          render={({ onChange, value }) => (
            <View style={AppStyle.width100}>
              <InputField
                isNumericInput
                isCurrency
                value={value?.toString()}
                label={changelableByFY('CurrentYear')}
                LeftComponent={() => getLeftComponentInput()}
                onChangeText={text => {
                  onChange(text);
                  handleOnChange(`${field?.id || FIELDS.PREFIX_KEY}[0].${FIELDS.SALARY}`, text);
                  getTotalAnual(field);
                }}
                error={get(error, [0, FIELDS.SALARY, 'message'])}
                disabled={disabled}
              />
            </View>
          )}
        />
      </View>
      <View
        style={[AppStyle.marginTop15]}
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors(`${field?.id || FIELDS.PREFIX_KEY}[1].${FIELDS.SALARY}`, {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors(`${field?.id || FIELDS.PREFIX_KEY}[1].${FIELDS.SALARY}`, {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          name={`${field?.id || FIELDS.PREFIX_KEY}[1].${FIELDS.SALARY}`}
          defaultValue={get(valueProps, [1, FIELDS.SALARY]) ?? null}
          render={({ onChange, value }) => (
            <View style={AppStyle.width100}>
              <InputField
                isNumericInput
                isCurrency
                value={value?.toString()}
                label={changelableByFY('LastYear')}
                LeftComponent={() => getLeftComponentInput()}
                onChangeText={text => {
                  onChange(text);
                  handleOnChange(`${field?.id || FIELDS.PREFIX_KEY}[1].${FIELDS.SALARY}`, text);
                }}
                error={get(error, [1, FIELDS.SALARY, 'message'])}
                disabled={disabled}
              />
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default AssessedTaxReturn;
