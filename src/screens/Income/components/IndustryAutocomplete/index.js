import Autocomplete from 'components/basics/Autocomplete';
import Condition from 'components/basics/Condition';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { useDispatchResolve } from 'libs/hooks';
import { composeWithRef, mergeArrayObjectIntoObject } from 'libs/util';
import { debounce, isNil } from 'lodash';
import { useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { useSelector } from 'react-redux';
import {
  clearIndustrySearchData,
  getIndustryClassesData,
  getIndustryData,
} from 'store/Industry/action';
import getModule from 'store/Industry/module';
import {
  selectListSearchIndustry,
  selectPageIndustry,
  selectTotalPageIndustry,
} from 'store/Industry/selector';
import { AppStyle } from 'theme';

import FormIndustryManually from './FormIndustryManually';
import themedStyles from './style';

const i18Scope = 'components.industryAutocomplete';
const MIN_LENGTH = 2;

function IndustryAutocomplete(
  {
    control,
    error,
    style,
    value,
    edit,
    onChangeValue = () => {},
    updateDataFormErrors = () => {},
    disabled,
    ...restProps
  },

  ref,
) {
  const { t } = useTranslation();
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18Scope);
  const [isManually, setIsManually] = useState(false);
  const [loading, setLoading] = useState(false);
  const [textSearch, setTextSearch] = useState(value?.class || '');

  const dispatchResolve = useDispatchResolve();

  const industries = useSelector(selectListSearchIndustry);
  const totalPages = useSelector(selectTotalPageIndustry);
  const currentPage = useSelector(selectPageIndustry);

  const fetchIndustry = useCallback(
    (text, page = 1) => {
      debounce(() => {
        if (!error?.searchText?.message && text?.length > MIN_LENGTH) {
          setLoading(true);
          dispatchResolve(getIndustryData({ text, page })).finally(() => setLoading(false));
        } else {
          dispatchResolve(clearIndustrySearchData());
        }
      }, 500)();
    },
    [dispatchResolve, error],
  );

  useEffect(() => {
    if (value?.division) {
      dispatchResolve(getIndustryClassesData({ division: value.division }));
    }
  }, [dispatchResolve, value]);

  const renderTextSuggestion = useCallback(() => {
    if (isManually) {
      return (
        <TextField
          type="captain"
          style={[styles.link, disabled && styles.disabledLink]}
          suppressHighlighting
          onPress={() => {
            setIsManually(!isManually);
            if (isNil(value) || !value.class) {
              dispatchResolve(clearIndustrySearchData());
            }
          }}
          disabled={disabled}>
          {t(`${i18Scope}.suggestTitle`)}
        </TextField>
      );
    }
    const messages = t(`${i18Scope}.manuallyTitle`).split('###');
    return (
      <TextField type="captain">
        <TextField type="captain">{messages[0]}</TextField>
        <TextField
          type="captain"
          style={[styles.link, disabled && styles.disabledLink]}
          suppressHighlighting
          onPress={() => {
            setIsManually(!isManually);
            if (error?.searchText?.message) {
              setTextSearch('');
              onChangeValue({
                searchText: '',
              });
              fetchIndustry('');
            }
          }}
          disabled={disabled}>
          {t(`${i18Scope}.clickHere`)}
        </TextField>
        <TextField type="captain">{messages[1]}</TextField>
      </TextField>
    );
  }, [
    dispatchResolve,
    error,
    fetchIndustry,
    isManually,
    onChangeValue,
    styles,
    t,
    value,
    disabled,
  ]);

  const onEndReached = useCallback(() => {
    if (!loading && currentPage < totalPages) {
      fetchIndustry(textSearch ?? '', currentPage + 1);
    }
  }, [fetchIndustry, loading, currentPage, totalPages, textSearch]);

  const iconRight = () => {
    if (loading) {
      return <ActivityIndicator size="small" />;
    }
    if (textSearch.length) {
      return (
        <TouchableField
          style={styles.containerClose}
          onPress={() => {
            setTextSearch('');
            onChangeValue({
              searchText: '',
            });
            fetchIndustry('');
          }}>
          <EvilIcons name="close" style={styles.iconClose} />
        </TouchableField>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={isManually && AppStyle.hide}
        onLayout={({ nativeEvent }) => {
          updateDataFormErrors('industry.searchText', {
            offsetY: nativeEvent.layout.y,
          });
        }}
        ref={element => {
          updateDataFormErrors('industry.searchText', {
            componentRef: element,
          });
        }}>
        <Controller
          control={control}
          name="industry.searchText"
          defaultValue={textSearch}
          render={() => (
            <View>
              <TextField style={AppStyle.marginBottom15}>{t(`${i18Scope}.label`)}</TextField>
              <Autocomplete
                value={textSearch || ''}
                data={industries}
                onChangeText={text => {
                  setTextSearch(text);
                  onChangeValue({
                    searchText: text,
                  });
                  fetchIndustry(text);
                }}
                onSelectText={text => {
                  const industry = industries.find(i => i?.title === text?.title);
                  if (industry) {
                    const industryValue = industry.value;
                    setTextSearch(industryValue.class);
                    onChangeValue({
                      searchText: industryValue.class,
                      ...industryValue,
                    });
                  }
                }}
                type="expand"
                isNetwork
                LeftComponent={() => <EvilIcons name="search" style={styles.iconSearch} />}
                RightComponent={iconRight}
                keepResultsAfterBlur
                onEndReached={onEndReached}
                placeholder={t('global.search')}
                error={error?.searchText?.message}
                readOnly={disabled}
                {...restProps}
              />
            </View>
          )}
        />
      </View>
      <Condition display={isManually}>
        <View style={styles.horizontalDashedLine} />
      </Condition>
      <View style={[AppStyle.padTop10, AppStyle.selfAlignStart]}>{renderTextSuggestion()}</View>
      <Condition display={isManually}>
        <FormIndustryManually
          i18Scope={i18Scope}
          onChangeValue={industryValue => {
            setTextSearch(industryValue.class);
            onChangeValue({
              searchText: industryValue.class,
              ...industryValue,
            });
          }}
          value={value}
          edit={edit}
        />
      </Condition>
      <Condition display={isManually}>
        <View style={styles.horizontalDashedLine} />
      </Condition>
    </View>
  );
}

export default composeWithRef(withDynamicModuleLoader(getModule()))(IndustryAutocomplete);
