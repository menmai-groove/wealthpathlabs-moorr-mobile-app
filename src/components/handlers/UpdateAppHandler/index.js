import { AppScreenID } from 'constant';
import { NavigationServiceLib } from 'libs';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectCheckUpdateApp, selectNavReady } from 'store/Root/selector';

function UpdateAppHandler() {
  const isNavReady = useSelector(selectNavReady);
  const checkUpdateApp = useSelector(selectCheckUpdateApp);
  useEffect(() => {
    if (isNavReady && checkUpdateApp) {
      NavigationServiceLib.reset(AppScreenID.UpdateApp);
    }
  }, [isNavReady, checkUpdateApp]);
  return <View />;
}

export default UpdateAppHandler;
