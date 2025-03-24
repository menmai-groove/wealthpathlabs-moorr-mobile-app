import { gql } from '@apollo/client';
import Condition from 'components/basics/Condition';
import FormInputAddressManually from 'components/basics/InputAddressAutocomplete/FormInputAddressManually';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { capitalize, debounce, get, isEmpty, take } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { query } from 'services/apolloGraphql';
import { selectAccessToken, selectFlags } from 'store/Auth/selector';
import { selectAppPreference } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const QUERY_ADDRESS = {
  label: 'Address/QUERY_ADDRESS',
  query: gql`
    query QueryAddress($searchString: String) {
      me {
        addressGnafLookup(searchString: $searchString) {
          data {
            address
            flatNumber
            flatType
            gnafId
            latitude
            locality
            locId
            longitude
            numberFirst
            postCode
            state
            streetName
            streetType
            country
          }
        }
      }
    }
  `,
};

function GNAFAutocomplete(props) {
  const appPreference = useSelector(selectAppPreference);
  const token = useSelector(selectAccessToken);
  const [searchString, setSearchString] = useState('');
  const [addressList, setAddressList] = useState([]);
  const [open, setOpen] = useState(false);
  const inputFieldRef = useRef(null);

  const sendRequest = useCallback(
    async value => {
      const variables = {
        searchString: value,
      };
      const headers = {
        Locale: appPreference.locale,
        Authorization: ['Bearer', token].join(' '),
      };
      const addressResponse = await query(QUERY_ADDRESS.query, variables, headers);
      const gnafAddressList = take(get(addressResponse, 'data.me.addressGnafLookup.data'), 5);
      setAddressList(gnafAddressList);
      setOpen(true);
    },
    [appPreference, token],
  );

  const debouncedSendRequest = useCallback(debounce(sendRequest, 500), [sendRequest]);
  const defaultValue = useMemo(() => props?.defaultValue, [props]);

  useEffect(() => {
    if (defaultValue) {
      setSearchString(defaultValue?.formatted ?? '');
    }
  }, [defaultValue]);

  return (
    <View>
      <InputField
        {...{
          ref: inputFieldRef,
          ...props,
          value: searchString,
          onChangeText: text => {
            setSearchString(text);
            if (text.length < 3) {
              return;
            }
            debouncedSendRequest(text);
          },
        }}
      />
      {open ? (
        <View style={[props?.styles?.dropdownStyle, {}]}>
          {addressList.length > 0
            ? addressList.map((addressItem, aii) => (
                <Pressable
                  onPress={() => {
                    typeof props?.onPress === 'function' ? props?.onPress(addressItem) : undefined;
                    const text = addressItem?.address;
                    setSearchString(text);
                    setOpen(false);
                    inputFieldRef.current?.blur();
                  }}>
                  <View
                    key={`address-${aii}`}
                    style={[
                      props?.styles?.dropdownContainer,
                      aii > 0 ? props?.styles?.dropdownDivider : {},
                    ]}>
                    <TextField
                      style={props?.styles?.dropdownText}
                      type="paragraph-2"
                      numberOfLines={1}>
                      {addressItem.address}
                    </TextField>
                  </View>
                </Pressable>
              ))
            : null}
        </View>
      ) : null}
    </View>
  );
}

function InputAddressAutocomplete(props, ref) {
  const {
    apiKey,
    defaultValue,
    error,
    label,
    onBlur,
    onFocus,
    onSubmitEditing,
    returnKeyType,
    style,
    required = false,
    onChangeText = () => {},
    getDetail = () => {},
    fetchDetails = true,
    value,
    listKey,
    trim,
    disabled,
    ...restProps
  } = props;
  const { gnafVisible } = useSelector(selectFlags);

  const { t } = useTranslation();
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle(
    { ...themedStyles, ...convertedStyle },
    'components.InputAddressAutocomplete',
  );

  const googleAutocompleteRef = useRef(null);
  const [isManually, setIsManually] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (defaultValue) {
      googleAutocompleteRef.current?.setAddressText(defaultValue?.formatted ?? '');
    }
  }, [defaultValue]);

  const FIRST_AND_ONLY_KEY = 0;
  const REGEX_MATCH_KEY = 1;

  const contains = useCallback((target, pattern) => {
    let val = 0;
    pattern.forEach(function (word) {
      if (target.includes(word)) {
        val++;
      }
    });
    return val === target.length;
  }, []);

  const getUnit = useCallback((address_components, val = '') => {
    const ret = address_components.find(i => {
      return i.types.includes('subpremise');
    });
    if (ret) {
      return parseInt(ret.long_name, 10);
    } else {
      // if there is no result subpremise from google, we will get the unit number from the textfield value which is value
      // we can only get it if it has slash /
      const match = val.match(/(\d*)\//);
      if (match) {
        return parseInt(match[REGEX_MATCH_KEY], 10);
      }
      return '';
    }
  }, []);

  const getNumber = useCallback((address_components, val = '') => {
    const ret = address_components.find(i => {
      return i.types.includes('street_number');
    });
    if (ret) {
      return ret.long_name;
    } else {
      // if there is no result subpremise from google, we will get the unit number from the textfield value which is value
      // we can only get it if it has slash /
      const match = val.match(/\/(\d*)/);
      if (match) {
        return parseInt(match[REGEX_MATCH_KEY], 10);
      }
      return '';
    }
  }, []);

  const getStreet = useCallback(address_components => {
    const ret = address_components.find(i => {
      return i.types.includes('route');
    });
    if (ret) {
      const z = ret.long_name.split(' ');
      z.pop();
      return z.join(' ');
    }
    return '';
  }, []);

  const getStreetType = useCallback(address_components => {
    const ret = address_components.find(i => {
      return i.types.includes('route');
    });
    if (ret) {
      return ret.long_name.split(' ').splice(-1)[FIRST_AND_ONLY_KEY];
    }
    return '';
  }, []);

  const getSuburb = useCallback(
    address_components => {
      const ret = address_components.find(i => {
        return contains(i.types, ['locality', 'political']);
      });
      if (ret) {
        return ret.long_name;
      }
      return '';
    },
    [contains],
  );

  const getPostalCode = useCallback(address_components => {
    const ret = address_components.find(i => {
      return i.types.includes('postal_code');
    });
    if (ret) {
      return ret.long_name;
    }
    return '';
  }, []);

  const getState = useCallback(
    address_components => {
      const ret = address_components.find(i => {
        return contains(i.types, ['administrative_area_level_1', 'political']);
      });
      if (ret) {
        return ret.short_name;
      }
      return '';
    },
    [contains],
  );

  const getCountry = useCallback(
    address_components => {
      const ret = address_components.find(i => {
        return contains(i.types, ['country', 'political']);
      });
      if (ret) {
        return ret.long_name;
      }
      return '';
    },
    [contains],
  );

  const setFormatted = useCallback(address => {
    return [
      address.floor,
      [address.unit, address.number].filter(Boolean).join('/'),
      address.street,
      address.streetType,
      address.suburb,
      address.postcode,
      address.state,
      address.country,
    ]
      .filter(Boolean)
      .join(' ');
  }, []);

  const handleTextManually = useCallback(
    data => {
      let formattedData = data;
      if (trim) {
        Object.keys(data).forEach(k => (formattedData[k] = data[k].trim()));
      }
      let detail = {
        ...value,
        ...formattedData,
        longitude: '',
        latitude: '',
        isManual: true,
      };
      detail.formatted = setFormatted(detail);
      getDetail(detail);
    },
    [getDetail, setFormatted, value, trim],
  );

  const handleSelectDetailSuggest = useCallback(
    (data, details = null) => {
      if (details) {
        const address = {};
        address.floor = '';
        address.unit = String(getUnit(details.address_components, data.description));
        address.number = String(getNumber(details.address_components, data.description));
        address.street = getStreet(details.address_components);
        address.streetType = getStreetType(details.address_components);
        address.suburb = getSuburb(details.address_components);
        address.postcode = String(getPostalCode(details.address_components));
        address.state = getState(details.address_components);
        address.country = getCountry(details.address_components);

        address.formatted = data?.description || setFormatted(address);
        address.longitude = details.geometry?.location?.lng?.toString();
        address.latitude = details.geometry?.location?.lat?.toString();
        address.isManual = false;
        getDetail(address);
        setIsChanged(false);
      }
    },
    [
      getCountry,
      getDetail,
      getNumber,
      getPostalCode,
      getState,
      getStreet,
      getStreetType,
      getSuburb,
      getUnit,
      setFormatted,
    ],
  );

  const handleSelectDetailSuggestGNAF = useCallback(
    addressInput => {
      const address = {
        floor: '',
        unit: '',
        number: addressInput?.numberFirst,
        street: addressInput?.streetName,
        streetType: capitalize(addressInput?.streetType),
        suburb: addressInput?.locality,
        postcode: addressInput?.postCode,
        state: addressInput?.state,
        country: capitalize(addressInput?.country),
        formatted: addressInput?.address,
        longitude: addressInput?.longitude?.toString(),
        latitude: addressInput?.latitude?.toString(),
        isManual: false,
        gnafId: addressInput?.gnafId,
      };
      getDetail(address);
      setIsChanged(false);
    },
    [getDetail],
  );

  const renderTextSuggestion = useCallback(() => {
    if (isManually) {
      return (
        <TextField
          type="captain"
          style={[styles.link, disabled && styles.disabledLink]}
          suppressHighlighting
          onPress={() => {
            if (isManually && !isEmpty(value?.formatted)) {
              googleAutocompleteRef.current?.setAddressText(value?.formatted ?? '');
            }
            setIsManually(!isManually);
          }}
          disabled={disabled}>
          {t('components.inputAddressAutocomplete.suggestTitle')}
        </TextField>
      );
    }
    if (!isChanged && value?.isManual) {
      return (
        <TextField
          type="captain"
          style={[styles.link, disabled && styles.disabledLink]}
          suppressHighlighting
          onPress={() => setIsManually(!isManually)}
          disabled={disabled}>
          {t('components.inputAddressAutocomplete.enteredManuallyTitle')}
        </TextField>
      );
    }
    return (
      <TextField type="captain">
        <TextField type="captain">
          {t('components.inputAddressAutocomplete.manuallyTitle')}
        </TextField>
        <TextField
          type="captain"
          style={[styles.link, disabled && styles.disabledLink]}
          suppressHighlighting
          onPress={() => setIsManually(!isManually)}
          disabled={disabled}>
          {t('components.inputAddressAutocomplete.manuallyEnter')}
        </TextField>
      </TextField>
    );
  }, [isChanged, isManually, styles, t, value, disabled]);

  return (
    <View style={[styles.container, style]}>
      <View style={isManually && AppStyle.hide}>
        {gnafVisible ? (
          <GNAFAutocomplete
            {...{
              styles,
              label,
              error,
              onSubmitEditing,
              required,
              ref,
              onBlur,
              onFocus,
              onChangeText: _text => {
                onChangeText({ ...value, formatted: _text });
                if (_text && !isChanged) {
                  setIsChanged(true);
                }
              },
              LeftComponent: () => (
                <Ionicons name="location-sharp" size={18} color={styles.locationIcon.color} />
              ),
              readonly: disabled,
              clearButtonMode: 'while-editing',
              onPress: handleSelectDetailSuggestGNAF,
              defaultValue,
            }}
          />
        ) : (
          <GooglePlacesAutocomplete
            ref={googleAutocompleteRef}
            fetchDetails={fetchDetails}
            onPress={handleSelectDetailSuggest}
            onFail={() => {}}
            debounce={500}
            disableScroll={true}
            query={{
              key: apiKey,
              language: 'en',
              components: 'country:au',
            }}
            returnKeyType={returnKeyType}
            enablePoweredByContainer={false}
            textInputProps={{
              InputComp: InputField,
              label,
              error,
              onSubmitEditing,
              required,
              ref,
              onBlur,
              onFocus,
              onChangeText: _text => {
                onChangeText({ ...value, formatted: _text });
                if (_text && !isChanged) {
                  setIsChanged(true);
                }
              },
              LeftComponent: () => (
                <Ionicons name="location-sharp" size={18} color={styles.locationIcon.color} />
              ),
              readonly: disabled,
            }}
            styles={{
              listView: styles.dropdownStyle,
            }}
            timeout={10000}
            keepResultsAfterBlur
            listKey={listKey}
            {...restProps}
          />
        )}
      </View>
      <Condition display={isManually}>
        <View style={styles.horizontalDashedLine} />
      </Condition>
      <View style={[AppStyle.padTop10, AppStyle.selfAlignStart]}>{renderTextSuggestion()}</View>
      <Condition display={isManually}>
        <FormInputAddressManually onChangeText={handleTextManually} defaultValue={value} />
      </Condition>
      <Condition display={isManually}>
        <View style={styles.horizontalDashedLine} />
      </Condition>
    </View>
  );
}

export default forwardRef(InputAddressAutocomplete);
