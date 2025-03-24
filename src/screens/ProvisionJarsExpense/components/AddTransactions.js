import FloatingButton from 'components/basics/FloatingButton';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import PropTypes from 'prop-types';
import { useThemedStyle } from 'providers';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import themedStyles from '../styles';

const i18nScope = 'screens.provisionsJar';

function AddTransactions({ onPress, floatingButton }) {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);

  if (floatingButton) {
    return <FloatingButton onPress={onPress} />;
  }

  return (
    <View style={styles.addTransactionButtonContainer}>
      <TouchableField style={styles.addTransactionButton} onPress={onPress}>
        <View style={styles.addTransactionIcon}>
          <Feather name="plus" size={22} color={styles.addTransactionIcon.color} />
        </View>
        <TextField font="medium" style={styles.addTransactionText}>
          {t(`${i18nScope}.addTransaction`)}
        </TextField>
      </TouchableField>
    </View>
  );
}

AddTransactions.propTypes = {
  floatingButton: PropTypes.bool,
  onPress: PropTypes.func,
};

export default memo(AddTransactions);
