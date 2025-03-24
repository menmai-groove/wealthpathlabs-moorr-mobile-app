import CalendarIcon from 'assets/svgs/profile/calendar';
import ButtonField from 'components/basics/ButtonField';
import CalendarModal from 'components/basics/CalendarModal';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { GlobalLib, UtilLib } from 'libs';
import { formatDateTime } from 'libs/util';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { AppStyle } from 'theme';

const formatDateString = 'DD/MM/YYYY';
const i18nScope = 'screens.financialDashboard';

export function ModalMoveOffsets({
  title,
  content,
  content2,
  onCancel,
  onSubmit,
  cancelText,
  submitText,
  type,
  minDate,
  dateLabelText,
  date,
  offset,
}) {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles);
  const [archiveDate, setArchiveDate] = useState(date || new Date());

  function handleCancel() {
    if (typeof onCancel === undefined) {
      return;
    }
    onCancel();
  }

  function handleSubmit() {
    if (typeof onSubmit === undefined) {
      return;
    }

    onSubmit({ asAt: UtilLib.dateUTCAsAt(archiveDate) });
  }

  return (
    <View>
      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TextField style={[AppStyle.textLeft, styles.deleteTitle]} type="heading-3">
            {title}
          </TextField>

          <View style={AppStyle.marginY10}>
            <TextField style={AppStyle.textLeft}>
              {content} <TextField font="semi-bold">{offset.name}.</TextField>
            </TextField>
          </View>

          {content2 ? (
            <View style={[AppStyle.marginTop10]}>
              <TextField style={AppStyle.textLeft}>{content2}</TextField>
            </View>
          ) : null}

          <View style={AppStyle.margin10}>
            <InputField
              value={archiveDate ? formatDateTime(archiveDate, formatDateString) : ''}
              onChangeText={setArchiveDate}
              label={() => <TextField font="semi-bold">{dateLabelText}</TextField>}
              // placeholder={t(`${i18nScope}.datePlaceholder`)}
              placeholder={formatDateString}
              editable={false}
              onPress={() => {
                GlobalLib.CalendarInModal.get().show({
                  current: archiveDate,
                  onConfirm: dateValue => {
                    setArchiveDate(dateValue);
                  },
                  minDate: minDate ? moment(minDate).format('YYYY-MM-DD') : undefined,
                  maxDate: moment(new Date()).format('YYYY-MM-DD'),
                });
              }}
              RightComponent={() => <CalendarIcon />}
            />
          </View>
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
            type={'primary'}
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
  cardItem: {
    backgroundColor: 'palette.color-dynamic-container',
    // marginHorizontal: 15,
    borderRadius: 6,
    overflow: 'hidden',
    minHeight: 50,
    borderWidth: 1,
    borderColor: 'palette.color-grey-6',
  },
  leftLine: {
    width: 6,
    height: '100%',
  },
};
