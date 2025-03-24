/**
 *
 * EntryNavigation
 *
 */

import { intersectionBy, isEmpty } from 'lodash';
import MainBottomNavigation from 'navigation/MainBottomNavigation';
import MainDrawerNavigation from 'navigation/MainDrawerNavigation';
import { useThemedStyle } from 'providers';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectUser } from 'store/Auth/selector';

import themedStyles from './style';

function useScreensToDisplay(screens, userScreens) {
  const screensToDisplay = useMemo(
    () => intersectionBy(screens, userScreens, item => item.name),
    [screens, userScreens],
  );
  const newScreens = [];

  screens.forEach(screen => {
    if (screensToDisplay.includes(screen)) {
      newScreens.push({
        ...screen,
        options: screen.options,
      });
    }
  });
  return newScreens;
}

function EntryNavigation({ screens, config }) {
  const mainNavigationMethod = 'Drawer';
  const user = useSelector(selectUser);
  const styles = useThemedStyle(themedStyles, 'components.entryNavigation');
  const userScreens = !isEmpty(user) ? user.permission_screens.map(e => ({ name: e })) : [];
  const screensToDisplay = useScreensToDisplay(screens, userScreens, styles);

  const Navigator = useMemo(() => {
    switch (mainNavigationMethod) {
      case 'BottomTab':
        return MainBottomNavigation;

      case 'Drawer':
        return MainDrawerNavigation;

      default:
        return View;
    }
  }, [mainNavigationMethod]);
  if (isEmpty(screensToDisplay)) {
    return null;
  }
  return <Navigator screens={screensToDisplay} config={config} />;
}

EntryNavigation.propTypes = {};

export default EntryNavigation;
