import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TextField from 'components/basics/TextField';
import Accordion from 'components/basics/Accordion';
import ButtonField from 'components/basics/ButtonField';
import CheckBox from 'components/basics/CheckBox';
import { FlatList, View } from 'react-native';
import { AppStyle } from 'theme';
import { useTranslation } from 'react-i18next';
import { useThemedStyle } from 'providers';
import { ScrollView } from 'react-native-gesture-handler';
import { merge, isEqual, reduce, upperFirst, cloneDeep } from 'lodash';
import InputField from 'components/basics/InputField';
import { formatDateTime } from 'libs/util';
import CalendarIcon from 'assets/svgs/profile/calendar';
import { GlobalLib, UtilLib } from 'libs';
import moment from 'moment';
import CalendarModal from 'components/basics/CalendarModal';
import CardCheckBoxList from 'components/basics/CardCheckBoxList';

import { ListBoxInfo } from '../components';

type CheckboxItemType = {
  value: string;
};

type DataFilterType = {
  income?: CheckboxItemType[];
  expense?: CheckboxItemType[];
  assets?: CheckboxItemType[];
  borrowings?: CheckboxItemType[];
  archived?: CheckboxItemType[];
};

interface IFilteringModal {
  data: DataFilterType;
  onSubmit: (values: any, isDirty: boolean) => void;
  checkedKeys: {
    income?: string[];
    expense?: string[];
    assets?: string[];
    borrowings?: string[];
    archived?: string[];
  };
}

export const getCheckboxValues = (listKeys = []) =>
  reduce(
    listKeys,
    (result, key) => {
      if (key) {
        result[key] = true;
      }
      return result;
    },
    {},
  );

const i18nScope = 'screens.financialDashboard';
export const noSelectState = { income: {}, expense: {}, assets: {}, borrowings: {}, archived: {} };

export function FilteringModal({ onSubmit, data = {}, checkedKeys = {} }: IFilteringModal) {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, `${i18nScope}.filteringModal`);
  const [collapseValues, setCollapseValues] = useState({
    income: true,
    expense: true,
    assets: true,
    borrowings: true,
    archived: true,
  });

  const [checkboxValues, setCheckboxValues] = useState({
    income: getCheckboxValues(checkedKeys?.income),
    expense: getCheckboxValues(checkedKeys?.expense),
    assets: getCheckboxValues(checkedKeys?.assets),
    borrowings: getCheckboxValues(checkedKeys?.borrowings),
    archived: getCheckboxValues(checkedKeys?.archived),
  });

  function onToggleCollapseValue(name: string) {
    setCollapseValues(state => ({
      ...state,
      [name]: !state[name],
    }));
  }
  function onToggleTitle(key, value) {
    const obj = data[key].reduce((accumulator, item) => {
      return { ...accumulator, [item.value]: value };
    }, {});
    setCheckboxValues(state => ({
      ...state,
      [key]: obj,
    }));
  }
  function onChangeCheckboxValues(key, name, value) {
    setCheckboxValues(state => ({
      ...state,
      [key]: { ...state[key], [name]: value },
    }));
  }
  function onReset() {
    setCheckboxValues(noSelectState);
  }

  function handleSubmit() {
    const values = cloneDeep(noSelectState);
    Object.keys(checkboxValues).forEach(category => {
      const categoryValues = checkboxValues[category];
      Object.keys(categoryValues).forEach(key => {
        if (categoryValues[key]) {
          values[category][key] = categoryValues[key];
        }
      });
    });

    onSubmit(checkboxValues, !isEqual(values, noSelectState));
  }

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <TextField type="heading-2" style={AppStyle.padBottom20}>
          {t(`${i18nScope}.filteringModalTitle`)}
        </TextField>
        <ScrollView showsVerticalScrollIndicator={true}>
          {Object.keys(data)?.map((parentKey, idx) => {
            if (!data[parentKey] || !data[parentKey]?.length) {
              return null;
            }
            const parentKeyCheckboxValues = checkboxValues[parentKey];
            const titleSelected =
              data[parentKey]?.length === Object.keys(parentKeyCheckboxValues).length &&
              Object.values(parentKeyCheckboxValues).every(item => item === true);
            return (
              <Accordion
                key={`accordion-${parentKey}`}
                title={({ value }) => (
                  <View style={styles.titleContainer}>
                    <CheckBox
                      containerStyle={AppStyle.marginRight10}
                      value={titleSelected}
                      onChange={titleSelectedValue => onToggleTitle(parentKey, titleSelectedValue)}
                    />
                    <TextField
                      style={[
                        AppStyle.marginLeft10,
                        styles.accordion.titleText,
                        value && styles.accordion.expandTitleTextStyle,
                      ]}
                      type="paragraph-1">
                      {t(`${i18nScope}.filterItems`, { key: upperFirst(parentKey) })}
                    </TextField>
                  </View>
                )}
                value={collapseValues[parentKey]}
                onChange={() => onToggleCollapseValue(parentKey)}
                style={merge(
                  {},
                  styles.accordion,
                  idx === 0 && { container: { borderTopWidth: 0 } },
                )}>
                <View style={styles.childrenContainer}>
                  {data[parentKey]?.map((item, index) => (
                    <CheckBox
                      key={`option-${index}`}
                      label={item.label}
                      containerStyle={styles.checkbox}
                      onChange={value => onChangeCheckboxValues(parentKey, item.value, value)}
                      value={parentKeyCheckboxValues[item.value]}
                    />
                  ))}
                </View>
              </Accordion>
            );
          })}
        </ScrollView>
        <View
          style={[
            AppStyle.rowFlex,
            AppStyle.spaceBetweenContent,
            AppStyle.padX10,
            AppStyle.padTop20,
          ]}>
          <ButtonField
            type="secondary"
            text="Reset"
            leftIcon={
              <Ionicons
                size={20}
                name="reload"
                style={[AppStyle.marginRight5, { color: styles.resetIcon.color }]}
              />
            }
            onPress={onReset}
          />
          <ButtonField type="primary" text="Done" onPress={handleSubmit} />
        </View>
      </View>
    </View>
  );
}

export function ExplanatoryModal({ title, data = [] }: any) {
  const styles = useThemedStyle(themedStyles, `${i18nScope}.explanatoryModal`);
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <TextField type="heading-2">{title}</TextField>
        <FlatList
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          data={data}
          renderItem={({ item, index }) => (
            <ListBoxInfo key={item.id} item={item} isLast={index === data.length - 1} />
          )}
          keyExtractor={(item, index) => `item-${index}`}
        />
      </View>
    </View>
  );
}

type ArchiveModal = {
  title?: string;
  content?: string;
  content2?: string;
  content3?: string;
  content4?: string;
  latestAsAt: any;
  latestAsAtError: string;
  card: any;
  onCancel?: () => void;
  onSubmit?: ({}: { asAt: Date }) => void;
  cancelText?: string;
  submitText?: string;
  type?: 'archive' | 'delete';
  hideAsAt?: boolean;
  hideLinkedCards: boolean;
  minDate?: string;
  dateLabelText?: string;
  date?: Date;
};

const formatDateString = 'DD/MM/YYYY';

export function ArchiveModalContent({
  title,
  content,
  content2,
  content3,
  content4,
  latestAsAt,
  latestAsAtError,
  card,
  onCancel,
  onSubmit,
  cancelText,
  submitText,
  type,
  hideAsAt,
  hideLinkedCards,
  minDate,
  dateLabelText,
  date,
}: ArchiveModal) {
  const hasNoDirectLinks =
    card?.linkedIncomeExpenses === null || card?.linkedIncomeExpenses?.length === 0;
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, `${i18nScope}.archiveModal`);
  const [archiveDate, setArchiveDate] = useState(date || new Date());

  const cards = card?.linkedIncomeExpenses?.map((cardItem: any) => ({
    ...cardItem,
    id: cardItem._id,
    color:
      cardItem?.type === 'income' ? styles.incomeCardColor.color : styles.expenseCardColor.color,
  }));
  // const cards = [
  //   {
  //     id: '1',
  //     name: 'Rent',
  //     amount: 23532.34,
  //     color: '#27AE60',
  //   },
  //   {
  //     id: '2',
  //     name: 'Expense linked with card',
  //     amount: 1242.33,
  //     color: '#FFA850',
  //   },
  //   {
  //     id: '3',
  //     name: 'Expense linked with card',
  //     amount: 1242.33,
  //     color: '#FFA850',
  //   },
  //   {
  //     id: '4',
  //     name: 'Expense linked with card',
  //     amount: 1242.33,
  //     color: '#FFA850',
  //   },
  // ] as const;

  function validArchiveDate() {
    return !latestAsAt || UtilLib.dateUTCAsAt(archiveDate).getTime() >= latestAsAt.getTime();
  }

  function handleCancel() {
    if (typeof onCancel === 'undefined') {
      return;
    }
    onCancel();
  }

  function handleSubmit() {
    if (typeof onSubmit === 'undefined') {
      return;
    }

    onSubmit({ asAt: UtilLib.dateUTCAsAt(archiveDate) });
  }

  return (
    <View>
      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {title ? (
            <TextField
              style={[AppStyle.textCenter, type === 'delete' && styles.deleteTitle]}
              type="heading-3">
              {title}
            </TextField>
          ) : null}
          {content ? (
            <View style={AppStyle.marginX10}>
              <TextField style={AppStyle.textLeft}>{content}</TextField>
            </View>
          ) : null}

          {content2 ? (
            <View style={[AppStyle.marginX10, AppStyle.marginTop10]}>
              <TextField style={AppStyle.textLeft}>{content2}</TextField>
            </View>
          ) : null}

          {content3 ? (
            <View style={[AppStyle.marginX10, AppStyle.marginTop10]}>
              <TextField style={[AppStyle.marginTop10, AppStyle.textLeft]}>{content3}</TextField>
            </View>
          ) : null}

          {!hideAsAt ? (
            <View style={AppStyle.margin10}>
              <InputField
                value={archiveDate ? formatDateTime(archiveDate, formatDateString) : ''}
                onChangeText={setArchiveDate}
                label={dateLabelText ?? t(`${i18nScope}.dateLabel`)}
                // placeholder={t(`${i18nScope}.datePlaceholder`)}
                placeholder={formatDateString}
                editable={false}
                onPress={() => {
                  GlobalLib.CalendarInModal.get().show({
                    current: archiveDate,
                    onConfirm: (dateValue: Date) => {
                      setArchiveDate(dateValue);
                    },
                    minDate: minDate ? moment(minDate).format('YYYY-MM-DD') : undefined,
                    maxDate: moment(new Date()).format('YYYY-MM-DD'),
                  });
                }}
                RightComponent={() => <CalendarIcon />}
              />
            </View>
          ) : null}

          {content4 ? (
            <TextField style={[AppStyle.marginX10, AppStyle.textLeft]}>{content4}</TextField>
          ) : null}
          {!validArchiveDate() && latestAsAtError ? (
            <TextField
              style={[
                AppStyle.marginX10,
                AppStyle.marginTop10,
                AppStyle.textLeft,
                styles.errorInputMessage,
              ]}>
              {latestAsAtError.replace(
                /\{\{date\}\}/g,
                formatDateTime(latestAsAt, formatDateString),
              )}
            </TextField>
          ) : null}

          {!hideLinkedCards && !hasNoDirectLinks ? (
            <View style={[AppStyle.marginTop10]}>
              <CardCheckBoxList cards={cards} readonly type={type} />
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            AppStyle.rowFlex,
            AppStyle.spaceBetweenContent,
            AppStyle.padX10,
            AppStyle.padTop20,
          ]}>
          <ButtonField
            type="secondary"
            text={cancelText ?? t(`${i18nScope}.cancelText`)}
            onPress={handleCancel}
          />
          <ButtonField
            type={validArchiveDate() ? 'primary' : 'disabled'}
            text={submitText ?? t(`${i18nScope}.submitText`)}
            onPress={handleSubmit}
          />
        </View>
      </View>

      <CalendarModal
        ref={ref => {
          GlobalLib.CalendarInModal.set(ref);
        }}
      />
    </View>
  );
}

const themedStyles = {
  container: {
    paddingTop: 20,
  },
  closeIcon: {
    color: 'palette.color-primary-text-1',
  },
  resetIcon: {
    color: 'palette.color-primary-1',
  },
  errorInputMessage: {
    color: 'palette.color-red-2',
  },
  body: {
    padding: 0,
    maxHeight: '100%',
  },
  accordion: {
    container: {
      backgroundColor: 'palette.color-white-4',
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: 'palette.color-grey-6',
    },
    accordionStyle: {
      backgroundColor: 'palette.color-dynamic-container',
    },
    expandAccordionStyle: {
      backgroundColor: 'palette.color-white-4',
    },
    titleText: {
      color: 'palette.color-primary-text-1',
    },
    expandTitleTextStyle: {
      color: 'palette.color-primary-1',
    },
    expandIcon: {
      color: 'palette.color-primary-1',
    },
    children: {
      marginTop: 10,
    },
  },
  checkbox: {
    paddingVertical: 5,
  },
  titleContainer: {
    flexDirection: 'row',
  },
  childrenContainer: {
    marginLeft: 28,
  },
  incomeCardColor: {
    color: 'palette.color-green-4',
  },
  expenseCardColor: {
    color: 'palette.color-orange-2',
  },
  deleteTitle: {
    color: 'palette.color-primary-1',
  },
};
