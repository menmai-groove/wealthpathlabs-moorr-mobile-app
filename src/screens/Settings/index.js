import Modal from 'components/basics/Modal';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import Header from 'components/layouts/Header';
import { useThemedStyle, withExitAppHandler } from 'providers';
import React, { useEffect, useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import SettingList from 'screens/Settings/components/SettingList';
import { selectUser } from 'store/Auth/selector';
import { updateLanguage } from 'store/Root/action';
import {
  selectAvailableLanguages,
  selectCloseModalsRefreshId,
  selectCurrentLanguage,
} from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.setting';

function SettingsScreen({ t }) {
  const closeModalsRefreshId = useSelector(selectCloseModalsRefreshId);
  const styles = useThemedStyle(themedStyles, 'screens.settings');
  const user = useSelector(selectUser);
  const language = useSelector(selectCurrentLanguage);
  const availableLanguages = useSelector(selectAvailableLanguages);

  const dispatch = useDispatch();
  const [visibility, setVisibility] = useState(false);

  const onChangeLanguage = lng => {
    dispatch(updateLanguage(lng));
  };

  const onCancel = () => {
    setVisibility(false);
  };

  const onOpenModal = () => {
    setVisibility(true);
  };

  const settingList = useMemo(
    () => [
      {
        id: 1,
        title: t(`${i18nScope}.language`),
        icon: 'globe',
        onPress: onOpenModal,
        settingValue:
          (availableLanguages?.length &&
            language &&
            availableLanguages?.find(item => item.value === language)?.label) ||
          '',
      },
    ],
    [t, language, availableLanguages],
  );

  useEffect(() => {
    if (closeModalsRefreshId) {
      onCancel();
    }
  }, [closeModalsRefreshId]);

  return (
    <View style={styles.container}>
      <Header type="back" title={'Settings'} />
      <View style={[AppStyle.middleContent, AppStyle.padX15, AppStyle.padY20]}>
        <TextField type="paragraph-1">{user?.fullName}</TextField>
        <TextField type="paragraph-2" font="thin" italic>
          {user?.email}
        </TextField>
      </View>
      <SettingList style={AppStyle.pad0} data={settingList} />
      <Modal
        containerStyle={[styles.modalContainer]}
        visible={visibility}
        onBackdropPress={onCancel}
        onRequestClose={onCancel}>
        {availableLanguages?.map(({ label, value: lang }) => {
          return (
            <TouchableField
              key={lang}
              onPress={() => {
                language !== lang && onChangeLanguage(lang);
              }}>
              <View
                style={[
                  styles.languageOption,
                  language === lang ? styles.selectedLanguageOption : {},
                ]}>
                <TextField style={language === lang ? styles.selectedLanguageOptionText : {}}>
                  {label}
                </TextField>
              </View>
            </TouchableField>
          );
        })}
      </Modal>
    </View>
  );
}

export default compose(withTranslation(), withExitAppHandler)(SettingsScreen);
