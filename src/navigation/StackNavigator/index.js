/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { AppScreenID } from 'constant';
import { map } from 'lodash';
import React, { useMemo } from 'react';
import Entry from 'screens/Entry';
import LaunchScreen from 'screens/LaunchScreen';
import Login from 'screens/Login';
import OnBoardingHome from 'screens/OnBoardingHome';
import OnBoardingInterview from 'screens/OnBoardingInterview';
import RequestPassword from 'screens/RequestPassword';
import RequestPasswordFeedback from 'screens/RequestPasswordFeedback';
import SignUp from 'screens/SignUp';
import SignUpPageInfo from 'screens/SignUpPageInfo';
import SMSVerification from 'screens/SMSVerification';
import TermCondition from 'screens/TermCondition';
import TwoFA from 'screens/TwoFA';
import UpdateApp from 'screens/UpdateApp';
import Verification from 'screens/Verification';

const RootStack = createStackNavigator();

function StackNavigator() {
  const screens = useMemo(() => {
    const data = [
      {
        name: AppScreenID.Entry,
        component: Entry,
      },
      {
        name: AppScreenID.UpdateApp,
        component: UpdateApp,
        options: {
          animationEnabled: false,
        },
      },
      {
        name: AppScreenID.Launch,
        component: LaunchScreen,
        options: {
          animationEnabled: false,
        },
      },
      {
        name: AppScreenID.OnBoardingHome,
        component: OnBoardingHome,
      },
      {
        name: AppScreenID.SignUp,
        component: SignUp,
      },
      {
        name: AppScreenID.Login,
        component: Login,
      },
      {
        name: AppScreenID.TwoFA,
        component: TwoFA,
      },
      {
        name: AppScreenID.Verification,
        component: Verification,
      },
      {
        name: AppScreenID.SMSVerification,
        component: SMSVerification,
      },
      {
        name: AppScreenID.SignUpPageInfo,
        component: SignUpPageInfo,
      },
      {
        name: AppScreenID.OnBoardingInterview,
        component: OnBoardingInterview,
      },
      {
        name: AppScreenID.RequestPassword,
        component: RequestPassword,
      },
      {
        name: AppScreenID.RequestPasswordFeedback,
        component: RequestPasswordFeedback,
      },
      {
        name: AppScreenID.TermCondition,
        component: TermCondition,
      },
    ];
    return data;
  }, []);
  return (
    <RootStack.Navigator
      initialRouteName={AppScreenID.Launch}
      screenOptions={{
        headerShown: false,
        drawerLockMode: 'locked-closed',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      {map(screens, item => {
        return <RootStack.Screen {...item} key={item.name} />;
      })}
    </RootStack.Navigator>
  );
}

export default StackNavigator;
