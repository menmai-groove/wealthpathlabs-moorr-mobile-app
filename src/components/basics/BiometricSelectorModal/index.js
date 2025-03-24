import Avatar from 'components/basics/Avatar';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants } from 'constant';
import { useThemedStyle } from 'providers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.biometricSelectorModal';
function BiometricSelectorModal({ listAccount, onSelect }) {
  const styles = useThemedStyle(themedStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.biometricContentModal}>
      <View style={AppStyle.marginBottom20}>
        <TextField style={styles.biometricModalTitle} type="heading-1">
          {t(`${i18nScope}.biometricTitle`)}
        </TextField>
        <TextField style={styles.biometricNote} font="regular" italic>
          {t(`${i18nScope}.biometricNote`, {
            number: AppConstants.biometric?.maximumNumberOfAccounts,
          })}
        </TextField>
        <TextField italic font="regular" style={styles.biometricModalSubTitle}>
          {t(`${i18nScope}.biometricSubTitle`)}
        </TextField>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {listAccount.map((item, index) => (
          <View key={index}>
            <TouchableField
              style={[AppStyle.padX5, AppStyle.padY10]}
              onPress={() => {
                onSelect(item);
              }}>
              <View style={styles.biometricItemsContainer}>
                <Avatar
                  style={{
                    containerStyle: styles.avatarContainer,
                    smallCircleStyle: styles.avatarCircle,
                  }}
                  size={30}
                  linearGradient={false}>
                  <FontAwesome5Icon name="user-alt" size={14} color={styles.avatar.color} />
                </Avatar>
                <TextField numberOfLines={2} font="medium" style={styles.biometricItemsText}>
                  {item.username}
                </TextField>
              </View>
            </TouchableField>
            {index < listAccount.length - 1 && <View style={styles.verticalLine} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default BiometricSelectorModal;
