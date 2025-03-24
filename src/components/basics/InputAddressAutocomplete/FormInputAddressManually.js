import DropDownForForm from 'components/basics/DropDownForForm';
import InputField from 'components/basics/InputField';
import { useThemedStyle } from 'providers';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.inputAddressAutocomplete';
const dataJson = require('assets/jsons/data-address.json');
function FormInputAddressManually(props) {
  const { onChangeText } = props;
  const defaultValue = props.defaultValue || {}; // prevent case null
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);

  const [stateIsDropdown, setStateIsDropdown] = useState(defaultValue?.country === 'Australia');

  const defaultValues = useMemo(() => {
    const {
      floor = '',
      unit = '',
      number = '',
      street = '',
      suburb = '',
      postcode = '',
    } = defaultValue;
    const country = defaultValue.country
      ? { display: defaultValue.country, value: defaultValue.country }
      : {};
    const streetType = defaultValue.country
      ? { display: defaultValue.streetType, value: defaultValue.streetType }
      : {};
    let state = '';
    if (defaultValue.state) {
      state =
        defaultValue.country === 'Australia'
          ? { display: defaultValue.state, value: defaultValue.state }
          : defaultValue.state;
    }
    return {
      country,
      floor,
      unit,
      number,
      street,
      streetType,
      suburb,
      postcode,
      state,
    };
  }, [defaultValue]);

  const { control, errors } = useForm({
    defaultValues,
    shouldFocusError: false,
  });

  const allCountries = useMemo(() => {
    return dataJson.allCountries.map(value => ({ display: value, value }));
  }, []);
  const streetTypes = useMemo(() => {
    let topStreetTypes = dataJson.topStreetTypes.map(value => ({ display: value, value }));
    let streetType = dataJson.streetTypes.map(value => ({ display: value, value }));
    let separator = { display: '--------------', value: '', disable: true };
    return [...topStreetTypes, separator, ...streetType];
  }, []);

  const stateAU = useMemo(() => {
    return dataJson.stateAU.map(value => ({ display: value, value }));
  }, []);

  return (
    <View style={[styles.manualFormContainer]}>
      <View style={[AppStyle.marginTop15]}>
        <Controller
          control={control}
          name={'country'}
          render={({ onChange, value, ref: componentRef }) => (
            <View style={AppStyle.width100}>
              <DropDownForForm
                ref={componentRef}
                value={value}
                options={allCountries}
                label={t('components.inputAddressAutocomplete.country')}
                // placeholder={t('components.inputAddressAutocomplete.countryPlaceholder')}
                onSelect={index => {
                  onChange(allCountries[index]);
                  onChangeText({ country: allCountries[index].value });
                  if (allCountries[index].value === 'Australia') {
                    setStateIsDropdown(true);
                  } else {
                    setStateIsDropdown(false);
                  }
                }}
                error={errors.country?.message}
              />
            </View>
          )}
        />
      </View>
      <View style={[AppStyle.marginTop15]}>
        <Controller
          control={control}
          name={'floor'}
          render={({ onChange, onBlur, value }) => (
            <InputField
              value={value}
              label={t('components.inputAddressAutocomplete.floor')}
              placeholder={t('components.inputAddressAutocomplete.floorPlaceholder')}
              onBlur={onBlur}
              onChangeText={text => {
                onChange(text);
                onChangeText({ floor: text });
              }}
              error={errors.floor?.message}
            />
          )}
        />
      </View>
      <View style={[AppStyle.marginTop15]}>
        <Controller
          control={control}
          name={'unit'}
          render={({ onChange, onBlur, value }) => (
            <InputField
              value={value}
              label={t('components.inputAddressAutocomplete.unit')}
              placeholder={t('components.inputAddressAutocomplete.unitPlaceholder')}
              onBlur={onBlur}
              onChangeText={text => {
                onChange(text);
                onChangeText({ unit: text });
              }}
              error={errors.unit?.message}
            />
          )}
        />
      </View>
      <View style={[AppStyle.marginTop15]}>
        <Controller
          control={control}
          name={'number'}
          render={({ onChange, onBlur, value }) => (
            <InputField
              value={value}
              label={t('components.inputAddressAutocomplete.lot')}
              placeholder={t('components.inputAddressAutocomplete.lotPlaceholder')}
              onBlur={onBlur}
              onChangeText={text => {
                onChange(text);
                onChangeText({ number: text });
              }}
              error={errors.number?.message}
            />
          )}
        />
      </View>
      <View style={[AppStyle.marginTop15]}>
        <Controller
          control={control}
          name={'street'}
          render={({ onChange, onBlur, value }) => (
            <InputField
              value={value}
              label={t('components.inputAddressAutocomplete.street')}
              placeholder={t('components.inputAddressAutocomplete.streetPlaceholder')}
              onBlur={onBlur}
              onChangeText={text => {
                onChange(text);
                onChangeText({ street: text });
              }}
              error={errors.street?.message}
            />
          )}
        />
      </View>
      <View style={[AppStyle.marginTop15]}>
        <Controller
          control={control}
          name={'streetType'}
          render={({ onChange, value, ref: componentRef }) => (
            <View style={AppStyle.width100}>
              <DropDownForForm
                ref={componentRef}
                value={value}
                options={streetTypes}
                label={t('components.inputAddressAutocomplete.streetType')}
                // placeholder={t('components.inputAddressAutocomplete.streetTypePlaceholder')}
                onSelect={index => {
                  onChange(streetTypes[index]);
                  onChangeText({ streetType: streetTypes[index].value });
                }}
                error={errors.streetType?.message}
              />
            </View>
          )}
        />
      </View>
      <View style={[AppStyle.marginTop15]}>
        <Controller
          control={control}
          name={'suburb'}
          render={({ onChange, onBlur, value }) => (
            <InputField
              value={value}
              label={t('components.inputAddressAutocomplete.suburb')}
              placeholder={t('components.inputAddressAutocomplete.suburbPlaceholder')}
              onBlur={onBlur}
              onChangeText={text => {
                onChange(text);
                onChangeText({ suburb: text });
              }}
              error={errors.suburb?.message}
            />
          )}
        />
      </View>
      <View style={[AppStyle.marginTop15]}>
        <Controller
          control={control}
          name={'postcode'}
          render={({ onChange, onBlur, value }) => (
            <InputField
              value={value}
              label={t('components.inputAddressAutocomplete.postcode')}
              placeholder={t('components.inputAddressAutocomplete.postcodePlaceholder')}
              onBlur={onBlur}
              onChangeText={text => {
                onChange(text);
                onChangeText({ postcode: text });
              }}
              error={errors.postcode?.message}
            />
          )}
        />
      </View>
      <View style={[AppStyle.marginTop15]}>
        <Controller
          control={control}
          name={'state'}
          render={({ onChange, value, onBlur, ref: componentRef }) =>
            stateIsDropdown ? (
              <View style={AppStyle.width100}>
                <DropDownForForm
                  ref={componentRef}
                  value={typeof value === 'object' ? value : { display: value, value: value }}
                  options={stateAU}
                  label={t('components.inputAddressAutocomplete.state')}
                  // placeholder={t('components.inputAddressAutocomplete.statePlaceholder')}
                  onSelect={index => {
                    onChange(stateAU[index]);
                    onChangeText({ state: stateAU[index].value });
                  }}
                  error={errors.state?.message}
                />
              </View>
            ) : (
              <InputField
                value={typeof value === 'object' ? value.value : value}
                label={t('components.inputAddressAutocomplete.state')}
                placeholder={t('components.inputAddressAutocomplete.statePlaceholder')}
                onBlur={onBlur}
                onChangeText={text => {
                  onChange(text);
                  onChangeText({ state: text });
                }}
                error={errors.state?.message}
              />
            )
          }
        />
      </View>
    </View>
  );
}

export default FormInputAddressManually;
