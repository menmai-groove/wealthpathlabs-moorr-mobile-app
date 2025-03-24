import { merge } from 'lodash';
import React, { useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUIMode } from 'store/Root/action';
import { selectAppTheme } from 'store/Root/selector';
import darkTheme from 'theme/darkTheme.json';

import AppMeta from '../../../app.json';

import Context from './context';

export const AppThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const appTheme = useSelector(selectAppTheme);
  const colorScheme = useColorScheme();
  const mergedTheme = useMemo(
    () => merge({}, appTheme, colorScheme === 'dark' && AppMeta.ENABLE_DARK_MODE ? darkTheme : {}),
    [appTheme, colorScheme],
  );
  useEffect(() => {
    if (AppMeta.ENABLE_DARK_MODE) {
      dispatch(updateUIMode(colorScheme === 'dark'));
    }
  }, [dispatch, colorScheme]);

  return <Context.Provider value={mergedTheme}>{children}</Context.Provider>;
};

export default AppThemeProvider;
