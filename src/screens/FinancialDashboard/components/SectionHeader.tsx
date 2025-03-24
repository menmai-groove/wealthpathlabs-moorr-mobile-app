import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import TextField from 'components/basics/TextField';
import { AppStyle } from 'theme';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyle } from 'providers';
import TouchableField from 'components/basics/TouchableField';
import InputSearch from 'components/basics/InputSearch';
import { cloneDeep, isFunction } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FILTER_FIELDS, FINANCIAL_LIST_TYPE } from 'components/basics/FinancialList';
import * as expenseDashboardSelectors from 'store/ExpenseDashboard/selector';
import * as financialDashboardSelectors from 'store/FinancialDashboard/selector';
import * as expenseDashboardActions from 'store/ExpenseDashboard/action';
import * as financialDashboardActions from 'store/FinancialDashboard/action';
import { useDispatchResolve } from 'libs/hooks';

import { getCheckboxValues, noSelectState } from './ModalContent';

interface ISectionHeader {
  title: string;
  searchKey: string;
  isFiltered?: boolean;
  onPressSearch?: () => void;
  onPressFilter?: () => void;
  onPressBack?: () => void;
  onSubmitEditing?: (text: string) => void;
  filteredDisabled?: boolean;
  type?: string;
}

function onToggleTitle(filterFields: any, checkboxValues: any, key: string, value: boolean) {
  if (key === FINANCIAL_LIST_TYPE.ALL) {
    return {
      [FINANCIAL_LIST_TYPE.INCOME]: [],
      [FINANCIAL_LIST_TYPE.EXPENSE]: [],
      [FINANCIAL_LIST_TYPE.ASSETS]: [],
      [FINANCIAL_LIST_TYPE.BORROWINGS]: [],
      [FINANCIAL_LIST_TYPE.ARCHIVED]: [],
    };
  }
  const obj = filterFields[key].reduce((accumulator, item) => {
    return { ...accumulator, [item.value]: value };
  }, {});
  return {
    ...checkboxValues,
    [key]: obj,
  };
}

export function SectionHeader({
  title,
  searchKey,
  isFiltered = false,
  onPressSearch,
  onPressFilter,
  onPressBack,
  onSubmitEditing,
  filteredDisabled = false,
  type,
}: ISectionHeader) {
  const styles = useThemedStyle(themedStyles);
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();
  const dispatchResolve = useDispatchResolve();
  const collectFilterFields = useMemo(() => {
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        return expenseDashboardSelectors.selectFilterFields;

      default:
        return financialDashboardSelectors.selectFilterFields;
    }
  }, [type]);
  const collectSearchParams = useMemo(() => {
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        return expenseDashboardSelectors.selectFetchParams;

      default:
        return financialDashboardSelectors.selectFetchParams;
    }
  }, [type]);
  const collectSelectedFilterButton = useMemo(() => {
    switch (type) {
      case FINANCIAL_LIST_TYPE.EXPENSE:
        return expenseDashboardSelectors.selectSelectedFilterButton;

      default:
        return financialDashboardSelectors.selectSelectedFilterButton;
    }
  }, [type]);
  const searchParams = useSelector(collectSearchParams);
  const checkedKeys = searchParams.filter;
  const filterFields = useSelector(collectFilterFields);
  const selectedFilterButton = useSelector(collectSelectedFilterButton);

  function handlePressBack() {
    setIsFocused(false);
    isFunction(onPressBack) && onPressBack();
  }

  const onGetData = useCallback(
    (params, enabledSetSelectedFilterButton?: boolean) => {
      const newCheckedKeys = params.filter ?? {};
      const newSelectedFilterButton = Object.entries(newCheckedKeys)
        .filter(
          ([key, value]: any) =>
            (value?.length > 0 &&
              value[0] !== '' &&
              value?.length === filterFields?.[key]?.length) ||
            (key === 'archived' && value?.[0] === 'Archived Cards'),
        )
        .map(keyItem => keyItem?.[0]);
      switch (type) {
        case FINANCIAL_LIST_TYPE.EXPENSE:
          dispatchResolve(expenseDashboardActions.setFetchParams(params));
          dispatchResolve(expenseDashboardActions.resetFetchingFinancialList());
          dispatchResolve(expenseDashboardActions.getFinancialList(true));
          // dispatchResolve(expenseDashboardActions.getFinancialStaticValues(true));
          enabledSetSelectedFilterButton &&
            dispatchResolve(
              expenseDashboardActions.setSelectedFilterButton(newSelectedFilterButton),
            );
          break;
        default:
          dispatchResolve(financialDashboardActions.setFetchParams(params));
          dispatchResolve(financialDashboardActions.resetFetchingFinancialList());
          dispatchResolve(financialDashboardActions.getFinancialList(true));
          dispatchResolve(financialDashboardActions.getFinancialStaticValues(true));
          enabledSetSelectedFilterButton &&
            dispatchResolve(
              financialDashboardActions.setSelectedFilterButton(newSelectedFilterButton),
            );
          break;
      }
      return;
    },
    [dispatchResolve, type, filterFields],
  );

  useEffect(() => {
    if (
      selectedFilterButton.includes(
        (selectedFilterButtonItem: string) => selectedFilterButtonItem === FINANCIAL_LIST_TYPE.ALL,
      )
    ) {
      switch (type) {
        case FINANCIAL_LIST_TYPE.EXPENSE:
          dispatchResolve(expenseDashboardActions.setSelectedFilterButton([type]));
          break;
        default:
          dispatchResolve(financialDashboardActions.setSelectedFilterButton([type]));
          break;
      }
    }
  }, [selectedFilterButton, type, dispatchResolve]);

  if (isFocused) {
    return (
      <InputSearch
        defaultValue={searchKey}
        placeholder={`${t('global.search')}...`}
        onPress={onPressSearch}
        onPressBack={handlePressBack}
        onFocus={onPressSearch}
        onSubmitEditing={({ nativeEvent: { text } }) => {
          onSubmitEditing(text);
          if (!text) {
            handlePressBack();
          }
        }}
        style={{ container: styles.container }}
      />
    );
  }
  return (
    <View style={[AppStyle.pad15, styles.container]}>
      <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.alignContent]}>
        <TextField type="heading-2">{title}</TextField>
        <View style={[AppStyle.rowFlex, AppStyle.alignContent, AppStyle.padY10]}>
          <TouchableField
            style={styles.wrapperSectionIcon}
            onPress={() => {
              setIsFocused(true);
              isFunction(onPressSearch) && onPressSearch();
            }}>
            <Ionicons
              name={'search'}
              size={18}
              style={[styles.sectionIcon, searchKey && styles.activeIcon]}
            />
          </TouchableField>
          <TouchableField
            onPress={onPressFilter}
            style={styles.wrapperSectionIcon}
            disabled={filteredDisabled}>
            <Feather
              name="filter"
              size={18}
              style={[
                styles.sectionIcon,
                isFiltered && styles.activeIcon,
                filteredDisabled && styles.inactiveIcon,
              ]}
            />
          </TouchableField>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={[AppStyle.rowFlex, AppStyle.alignContent, styles.container]}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {[
          FINANCIAL_LIST_TYPE.ALL,
          FINANCIAL_LIST_TYPE.INCOME,
          FINANCIAL_LIST_TYPE.EXPENSE,
          FINANCIAL_LIST_TYPE.ASSETS,
          FINANCIAL_LIST_TYPE.BORROWINGS,
          FINANCIAL_LIST_TYPE.ARCHIVED,
        ].map((filterButton, fbi: number) => {
          const isFirst = fbi === 0;
          const isSelected = selectedFilterButton.includes(filterButton);
          const isAll = filterButton === FINANCIAL_LIST_TYPE.ALL;
          const isIncome = filterButton === FINANCIAL_LIST_TYPE.INCOME;
          const isExpense = filterButton === FINANCIAL_LIST_TYPE.EXPENSE;
          const isAssets = filterButton === FINANCIAL_LIST_TYPE.ASSETS;
          const isBorrowings = filterButton === FINANCIAL_LIST_TYPE.BORROWINGS;
          const isArchived = filterButton === FINANCIAL_LIST_TYPE.ARCHIVED;
          return (
            <Pressable
              key={`filter-button-${fbi}`}
              style={[
                !isFirst && AppStyle.marginLeft10,
                AppStyle.pad10,
                styles.filterButtonContainer,
                filterButton === FINANCIAL_LIST_TYPE.ALL
                  ? isSelected
                    ? styles.selectedAllButton
                    : styles.allButton
                  : {},
                filterButton === FINANCIAL_LIST_TYPE.INCOME
                  ? isSelected
                    ? styles.selectedIncomeButton
                    : styles.incomeButton
                  : {},
                filterButton === FINANCIAL_LIST_TYPE.EXPENSE
                  ? isSelected
                    ? styles.selectedExpensesButton
                    : styles.expensesButton
                  : {},
                filterButton === FINANCIAL_LIST_TYPE.ASSETS
                  ? isSelected
                    ? styles.selectedAssetsButton
                    : styles.assetsButton
                  : {},
                filterButton === FINANCIAL_LIST_TYPE.BORROWINGS
                  ? isSelected
                    ? styles.selectedBorrowingsButton
                    : styles.borrowingsButton
                  : {},
                filterButton === FINANCIAL_LIST_TYPE.ARCHIVED
                  ? isSelected
                    ? styles.selectedArchivedButton
                    : styles.archivedButton
                  : {},
              ]}
              onPress={async () => {
                let newCheckboxValues = {};
                const checkboxValues = {
                  [FINANCIAL_LIST_TYPE.INCOME]: getCheckboxValues(checkedKeys?.income),
                  [FINANCIAL_LIST_TYPE.EXPENSE]: getCheckboxValues(checkedKeys?.expense),
                  [FINANCIAL_LIST_TYPE.ASSETS]: getCheckboxValues(checkedKeys?.assets),
                  [FINANCIAL_LIST_TYPE.BORROWINGS]: getCheckboxValues(checkedKeys?.borrowings),
                  [FINANCIAL_LIST_TYPE.ARCHIVED]: getCheckboxValues(checkedKeys?.archived),
                };

                newCheckboxValues = onToggleTitle(filterFields, checkboxValues, filterButton, true);
                const values = cloneDeep(noSelectState);
                Object.keys(checkboxValues).forEach(category => {
                  const categoryValues = checkboxValues[category];
                  Object.keys(categoryValues).forEach(key => {
                    if (categoryValues[key]) {
                      values[category][key] = categoryValues[key];
                    }
                  });
                });
                // const isDirty = !isEqual(values, noSelectState);
                const isDirty = false;
                const getListFilters = (name: string) => {
                  const filters = newCheckboxValues?.[name]
                    ? Object.keys(newCheckboxValues[name]).filter(
                        key => newCheckboxValues[name]?.[key],
                      )
                    : [];
                  return filters.length === 0 && isDirty ? [''] : filters;
                };
                const allFilter = {
                  [FILTER_FIELDS.ASSETS]: [],
                  [FILTER_FIELDS.EXPENSE]: [],
                  [FILTER_FIELDS.INCOME]: [],
                  [FILTER_FIELDS.BORROWINGS]: [],
                  [FILTER_FIELDS.ARCHIVED]: [''],
                };
                const archivedFilter = {
                  [FILTER_FIELDS.ARCHIVED]: ['Archived Cards'],
                };
                const params = {
                  filter: isAll
                    ? allFilter
                    : isArchived
                    ? archivedFilter
                    : {
                        [FILTER_FIELDS.ASSETS]: isAssets
                          ? getListFilters(FILTER_FIELDS.ASSETS)
                          : [''],
                        [FILTER_FIELDS.EXPENSE]: isExpense
                          ? getListFilters(FILTER_FIELDS.EXPENSE)
                          : [''],
                        [FILTER_FIELDS.INCOME]: isIncome
                          ? getListFilters(FILTER_FIELDS.INCOME)
                          : [''],
                        [FILTER_FIELDS.BORROWINGS]: isBorrowings
                          ? getListFilters(FILTER_FIELDS.BORROWINGS)
                          : [''],
                        [FILTER_FIELDS.ARCHIVED]: [''],
                      },
                };
                onGetData(params);
                switch (type) {
                  case FINANCIAL_LIST_TYPE.EXPENSE:
                    dispatchResolve(
                      expenseDashboardActions.setSelectedFilterButton([filterButton]),
                    );
                    break;
                  default:
                    dispatchResolve(
                      financialDashboardActions.setSelectedFilterButton([filterButton]),
                    );
                    break;
                }
              }}>
              <TextField
                style={[
                  styles.filterButtonText,
                  filterButton === FINANCIAL_LIST_TYPE.ALL && styles.allText,
                  filterButton === FINANCIAL_LIST_TYPE.INCOME && styles.incomeText,
                  filterButton === FINANCIAL_LIST_TYPE.EXPENSE && styles.expensesText,
                  filterButton === FINANCIAL_LIST_TYPE.ASSETS && styles.assetsText,
                  filterButton === FINANCIAL_LIST_TYPE.BORROWINGS && styles.borrowingsText,
                  filterButton === FINANCIAL_LIST_TYPE.ARCHIVED && styles.archivedText,
                  isSelected && styles.selectedText,
                ]}>
                {filterButton === FINANCIAL_LIST_TYPE.EXPENSE ? 'expenses' : filterButton}
              </TextField>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const themedStyles = {
  container: {
    backgroundColor: 'palette.color-light-alice-blue-1',
  },
  wrapperSectionIcon: {
    borderRadius: 99,
    overflow: 'hidden',
    marginLeft: 8,
  },
  sectionIcon: {
    color: 'palette.color-primary-text-1',
    padding: 6,
  },
  activeIcon: {
    color: 'palette.color-white-1',
    backgroundColor: 'palette.color-primary-1',
  },
  inactiveIcon: {
    color: 'palette.color-grey-1',
  },
  iconSearch: {
    color: 'palette.color-grey-3',
  },
  filterButtonContainer: {
    borderWidth: 1,
    borderRadius: 5,
  },
  allButton: {
    backgroundColor: 'palette.color-white-6',
    borderColor: 'palette.color-primary-1',
  },
  selectedAllButton: {
    backgroundColor: 'palette.color-primary-1',
  },
  incomeButton: {
    backgroundColor: 'palette.color-toast-success',
    borderColor: 'palette.color-toast-text-success',
  },
  selectedIncomeButton: {
    backgroundColor: 'palette.color-toast-text-success',
    borderColor: 'palette.color-toast-text-success',
  },
  expensesButton: {
    backgroundColor: 'palette.color-toast-warning',
    borderColor: 'palette.color-toast-text-warning',
  },
  selectedExpensesButton: {
    backgroundColor: 'palette.color-toast-text-warning',
    borderColor: 'palette.color-toast-text-warning',
  },
  assetsButton: {
    backgroundColor: 'palette.color-toast-info',
    borderColor: 'palette.color-toast-text-info',
  },
  selectedAssetsButton: {
    backgroundColor: 'palette.color-toast-text-info',
    borderColor: 'palette.color-toast-text-info',
  },
  selectedBorrowingsButton: {
    backgroundColor: 'palette.color-toast-text-error',
    borderColor: 'palette.color-toast-text-error',
  },
  borrowingsButton: {
    backgroundColor: 'palette.color-toast-error',
    borderColor: 'palette.color-toast-text-error',
  },
  selectedArchivedButton: {
    backgroundColor: 'palette.color-grey-10',
    borderColor: 'palette.color-grey-10',
  },
  archivedButton: {
    backgroundColor: 'palette.color-grey-11',
    borderColor: 'palette.color-grey-10',
  },
  disabled: {
    opacity: 0.5,
  },
  filterButtonText: {
    textTransform: 'capitalize',
  },
  allText: {
    color: 'palette.color-primary-1',
  },
  incomeText: {
    color: 'palette.color-toast-text-success',
  },
  expensesText: {
    color: 'palette.color-toast-text-warning',
  },
  assetsText: {
    color: 'palette.color-toast-text-info',
  },
  borrowingsText: {
    color: 'palette.color-toast-text-error',
  },
  archivedText: {
    color: 'palette.color-grey-10',
  },
  selectedText: {
    color: 'palette.color-white-1',
  },
};
