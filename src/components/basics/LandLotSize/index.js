import i18n from 'bootstrap/i18n';
import DropDownForForm from 'components/basics/DropDownForForm';
import InputField from 'components/basics/InputField';
import { isNil } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef } from 'react';
import { Controller } from 'react-hook-form';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.landLotSize';

function LandLotSize(
  {
    label,
    landSize = '',
    landSizeUnit = '',
    onChange = () => {},
    updateDataFormErrors = () => {},
    lotUnitOptions = [],
    required = false,
    style,
    error,
    control,
    readonly,
  },

  ref,
) {
  const styles = useThemedStyle(themedStyles);
  function onUpdateSize(text) {
    onChange({
      landSize: text,
      landSizeUnit: landSizeUnit,
    });
  }

  function onUpdateUnit(val) {
    onChange({
      landSize: landSize,
      landSizeUnit: val,
    });
  }

  return (
    <View style={[styles.container, style]}>
      <View
        style={AppStyle.marginBottom10}
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors('landLotSize.landSize', {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors('landLotSize.landSize', {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          name="landLotSize.landSize"
          defaultValue={landSize}
          render={({ onChange: onChangeLandSize }) => (
            <InputField
              isNumericInput
              value={`${isNil(landSize) ? '' : landSize}`}
              onChangeText={text => {
                onUpdateSize(text);
                onChangeLandSize(text);
              }}
              label={label}
              required={required}
              error={error?.landSize?.message}
              readonly={readonly}
            />
          )}
        />
      </View>
      <View
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors('landLotSize.landSizeUnit', {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors('landLotSize.landSizeUnit', {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          name="landLotSize.landSizeUnit"
          defaultValue={landSizeUnit}
          render={({ onChange: onChangeLandSizeUnit }) => (
            <DropDownForForm
              value={landSizeUnit}
              options={lotUnitOptions}
              placeholder={i18n.t(`${i18nScope}.placeholder`)}
              onSelect={selectValue => {
                onUpdateUnit(lotUnitOptions[selectValue]);
                onChangeLandSizeUnit(lotUnitOptions[selectValue]);
              }}
              required={required}
              error={error?.landSizeUnit?.message}
              disabled={readonly}
            />
          )}
        />
      </View>
    </View>
  );
}
export default forwardRef(LandLotSize);
