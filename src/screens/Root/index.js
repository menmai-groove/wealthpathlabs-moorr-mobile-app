/**
 *
 * Root Container
 *
 */

import { NavigationContainer } from '@react-navigation/native';
import CalendarModal from 'components/basics/CalendarModal';
import ConfirmModal from 'components/basics/ConfirmModal';
import CustomModal from 'components/basics/CustomModal';
// import ImagePickerModal from 'components/basics/ImagePickerModal';
import ImageCropPicker from 'components/basics/ImageCropPicker';
import { KeyboardAwareHandler } from 'components/basics/KeyboardAware';
import Loading from 'components/basics/Loading';
// import ResultModal from 'components/basics/ResultModal';
import ScreenModal from 'components/basics/ScreenModal';
import AppStateHandler from 'components/handlers/AppStateHandler';
import NetInfoHandler from 'components/handlers/NetworkHandler';
import NotificationHandler from 'components/handlers/NotificationHandler';
import UpdateAppHandler from 'components/handlers/UpdateAppHandler';
import Toast from 'components/layouts/Toast';
import { AnalyticsLib, GlobalLib, NavigationServiceLib } from 'libs';
import React, { useRef } from 'react';
import { StatusBar, Text, TextInput, View } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { useDispatch } from 'react-redux';
import { compose } from 'redux';
import { updateNavigationReady } from 'store/Root/action';
import { AppStyle } from 'theme';

import AppMeta from '../../../app.json';

function Root({ children }) {
  const dispatch = useDispatch();
  const routeNameRef = useRef();
  return (
    <NavigationContainer
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = NavigationServiceLib.getCurrentRoute();
        if (currentRouteName && previousRouteName !== currentRouteName) {
          AnalyticsLib.trackScreen(currentRouteName);
        }
        // Save the current route name for later comparison
        routeNameRef.current = currentRouteName;
        GlobalLib.PreviousRoute.set(currentRouteName);
      }}
      ref={ref => {
        NavigationServiceLib.setTopLevelNavigator(ref);
      }}
      onReady={() => {
        SplashScreen.hide();
        dispatch(updateNavigationReady(true));
        routeNameRef.current = NavigationServiceLib.getCurrentRoute();
      }}>
      <View style={AppStyle.flex1}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          hidden={false}
          translucent
        />
        <AppStateHandler />
        <KeyboardAwareHandler />
        {AppMeta.ENABLE_PUSH_NOTIFICATION && <NotificationHandler />}
        <UpdateAppHandler />
        <Loading ref={ref => GlobalLib.Loading.set(ref)} />
        <ConfirmModal
          ref={ref => {
            GlobalLib.ConfirmModal.set(ref);
          }}
        />
        <CustomModal
          ref={ref => {
            GlobalLib.CustomModal.set(ref);
          }}
        />
        <ScreenModal
          ref={ref => {
            GlobalLib.ScreenModal.set(ref);
          }}
        />
        {/* <ImagePickerModal
        ref={ref => {
          GlobalLib.ImagePickerModal.set(ref);
        }}
      /> */}
        <CalendarModal
          ref={ref => {
            GlobalLib.CalendarModal.set(ref);
          }}
        />
        <ImageCropPicker
          ref={ref => {
            GlobalLib.ImageCropPicker.set(ref);
          }}
        />
        {children}
        <NetInfoHandler />
        <Toast ref={ref => GlobalLib.Toast.set(ref)} />
      </View>
    </NavigationContainer>
  );
}

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

export default compose()(Root);
