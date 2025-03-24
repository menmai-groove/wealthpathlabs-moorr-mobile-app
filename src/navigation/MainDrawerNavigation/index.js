/**
 *
 * MainDrawerNavigation
 *
 */

import { createDrawerNavigator } from '@react-navigation/drawer';
import { map } from 'lodash';
import React from 'react';

// import PropTypes from 'prop-types';

const Drawer = createDrawerNavigator();

function MainDrawerNavigation({ screens, config }) {
  return (
    <Drawer.Navigator {...config.drawerNavigationConfig}>
      {map(screens, item => (
        <Drawer.Screen {...item} key={item.name} />
      ))}
    </Drawer.Navigator>
  );
}

MainDrawerNavigation.propTypes = {};

export default MainDrawerNavigation;
