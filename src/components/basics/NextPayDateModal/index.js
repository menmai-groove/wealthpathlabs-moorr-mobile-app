import CalendarIcon from 'assets/svgs/profile/calendar';
import ButtonField from 'components/basics/ButtonField';
import CalendarModal from 'components/basics/CalendarModal';
import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { GlobalLib, UtilLib } from 'libs';
import { formatDateTime } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { AppStyle } from 'theme';

const i18nScope = 'screens.financialDashboard';

const formatDateString = 'DD/MM/YYYY';

export default ({
  title = '',
  content = '',
  onCancel,
  onSubmit,
  cancelText,
  submitText,
  dateLabelText,
  date,
}) => {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, `${i18nScope}.archiveModal`);
  const [nextPayDateStart, setNextPayDateStart] = useState(date || new Date());

  function validNextPayDateStart() {
    return (
      UtilLib.dateUTCAsAt(nextPayDateStart).getTime() >= UtilLib.dateUTCAsAt(Date.now()).getTime()
    );
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

    onSubmit({ date: UtilLib.dateUTCAsAt(nextPayDateStart) });
  }

  return (
    <View>
      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[AppStyle.marginX5, AppStyle.marginY10]}>
            <TextField style={[AppStyle.textLeft, styles.textTitle]} type="heading-3">
              {title}
            </TextField>
          </View>

          <View style={AppStyle.marginX5}>
            <TextField style={AppStyle.textLeft}>{content}</TextField>
          </View>

          <View style={AppStyle.margin10}>
            <InputField
              value={nextPayDateStart ? formatDateTime(nextPayDateStart, formatDateString) : ''}
              onChangeText={setNextPayDateStart}
              label={dateLabelText ?? t(`${i18nScope}.nextPayDate`)}
              placeholder={formatDateString}
              editable={false}
              onPress={() => {
                GlobalLib.CalendarInModal.get().show({
                  current: nextPayDateStart,
                  onConfirm: date => {
                    setNextPayDateStart(date);
                  },
                  minDate: UtilLib.dateUTCAsAt(Date.now()),
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
            type={validNextPayDateStart() ? 'primary' : 'disabled'}
            text={submitText ?? t('global.confirm')}
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
};

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
  textTitle: {
    color: 'palette.color-primary-1',
  },
  expenseCardColor: {
    color: 'palette.color-orange-2',
  },
  deleteTitle: {
    color: 'palette.color-primary-1',
  },
};
