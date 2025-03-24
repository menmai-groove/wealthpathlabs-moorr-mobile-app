import { yupResolver } from '@hookform/resolvers/yup';
import ButtonField from 'components/basics/ButtonField';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import SecondaryInputField from 'components/basics/SecondaryInputField';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppScreenID } from 'constant';
import { NavigationServiceLib, SchemaLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, Keyboard, StatusBar, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import { requestResetPassword, updateResetPasswordError } from 'store/ResetPassword/action';
import getModule from 'store/ResetPassword/module';
import { selectResetPasswordError } from 'store/ResetPassword/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.requestPassword';

function RequestPassword() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispathResolve = useDispatchResolve();
  const resetPasswordError = useSelector(selectResetPasswordError);

  const scrollRef = useRef();
  const emailInput = useRef();

  const defaultValues = useMemo(() => ({ email: '' }), []);
  const { handleSubmit, control, errors } = useForm({
    defaultValues,
    resolver: yupResolver(SchemaLib.requestPassword),
    shouldFocusError: false,
  });

  useLayoutEffect(() => {
    StatusBar.setBarStyle('dark-content');
    return () => {
      StatusBar.setBarStyle('light-content');
    };
  }, []);

  const onSubmit = useCallback(
    data => {
      Keyboard.dismiss();
      dispathResolve(requestResetPassword({ email: data?.email }))
        .then(() => {
          NavigationServiceLib.navigate(AppScreenID.RequestPasswordFeedback);
        })
        .catch(() => {});
    },
    [dispathResolve],
  );

  const onError = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const redirectToLoginScreen = useCallback(() => {
    NavigationServiceLib.navigate(AppScreenID.Login);
  }, []);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={[AppStyle.flex1]}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrap}>
          <View style={[AppStyle.middleContent]}>
            <Image
              source={require('assets/images/icon-forgot-password-1.png')}
              style={styles.image}
            />
          </View>
          <View style={styles.boxContent}>
            <TextField type="heading-1">{t(`${i18nScope}.titleRequest`)}</TextField>
            <TextField type="paragraph-2" style={styles.content}>
              {t(`${i18nScope}.contentRequest`)}
            </TextField>
          </View>
          <View collapsable={false}>
            <Controller
              name="email"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <SecondaryInputField
                  type="email"
                  ref={emailInput}
                  returnKeyType={'done'}
                  value={value}
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={text => {
                    onChange(text);
                    resetPasswordError && dispatch(updateResetPasswordError());
                  }}
                  onSubmitEditing={handleSubmit(onSubmit, onError)}
                  error={resetPasswordError?.message || errors.email?.message}
                  label={t(`${i18nScope}.email`, 'Email')}
                  textContentType="username"
                  autoComplete="email"
                  importantForAutofill="yes"
                />
              )}
            />
          </View>
          <ButtonField
            style={AppStyle.marginTop30}
            text={t(`${i18nScope}.resetPassword`)}
            onPress={handleSubmit(onSubmit, onError)}
          />
          <View style={AppStyle.alignContent}>
            <TouchableField style={AppStyle.marginTop20} onPress={redirectToLoginScreen}>
              <TextField type="text-label" style={styles.backToLoginText}>
                {t(`${i18nScope}.backTologin`, 'Back to login')}
              </TextField>
            </TouchableField>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withBackHandler, withDynamicModuleLoader(getModule()))(RequestPassword);
