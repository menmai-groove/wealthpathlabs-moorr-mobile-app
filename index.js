/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import 'react-native-gesture-handler';
import SystemMaintenance from 'screens/SystemMaintenance';

import AppMeta from './app.json';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

AppRegistry.registerComponent(AppMeta.APP_NAME_REGISTRY, () => SystemMaintenance);
