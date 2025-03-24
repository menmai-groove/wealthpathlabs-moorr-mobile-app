/**
 *
 * MainBottomNavigation
 *
 */

// import PropTypes from 'prop-types';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { map } from 'lodash';
import TabBar from 'navigation/TabBar';
import React from 'react';

const BottomNavigation = createBottomTabNavigator();

function MainBottomNavigation({ screens, config }) {
  return (
    <BottomNavigation.Navigator
      {...config.bottomNavigationConfig}
      tabBar={props => <TabBar {...props} />}>
      {map(screens, (item, index) => (
        <BottomNavigation.Screen {...item} key={`screen-index-${index}`} />
      ))}
    </BottomNavigation.Navigator>
  );
}

MainBottomNavigation.propTypes = {};

export default MainBottomNavigation;
