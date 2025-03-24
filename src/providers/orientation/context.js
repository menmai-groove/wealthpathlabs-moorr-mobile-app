import React from 'react';
import { Dimensions } from 'react-native';

const screen = Dimensions.get('screen');

export const orientation = {
  mode: screen.width > screen.height ? 'landscape' : 'portrait',
  isLandscape: screen.width > screen.height,
  screenHeight: screen.height,
  screenWidth: screen.width,
};

export default React.createContext(orientation);
