/**
 *
 * CommonForm
 *
 */

import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import React from 'react';
import { View } from 'react-native';

import themedStyles from './style';

const i18nScope = 'components.layouts.authenticationForm';

const AuthenticationForm = ({
  style,
  title = '',
  renderContent = () => {},
  renderFooter = () => {},
}) => {
  const styles = useThemedStyle(themedStyles, i18nScope);

  return (
    <View style={[styles.form, style]}>
      <View style={styles.contentContainer}>
        {title.length > 0 && <TextField type="heading-1">{title}</TextField>}
        <View style={styles.contentBodyContainer}>{renderContent()}</View>
      </View>
      <View style={styles.footerContainer}>{renderFooter()}</View>
    </View>
  );
};

AuthenticationForm.propTypes = {};

export default AuthenticationForm;
