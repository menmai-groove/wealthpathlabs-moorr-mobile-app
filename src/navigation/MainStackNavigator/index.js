/**
 *
 * MainStackNavigator
 *
 */

import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { map } from 'lodash';
import React from 'react';

const MainStack = createStackNavigator();

function MainStackNavigator({ screens, config }) {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        drawerLockMode: 'locked-closed',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
      {...config}>
      {map(screens, item => {
        return <MainStack.Screen {...item} key={item.name} />;
      })}
    </MainStack.Navigator>
  );
}

MainStackNavigator.propTypes = {};

export default MainStackNavigator;
