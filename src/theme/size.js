import { Dimensions } from 'react-native';

const screen = Dimensions.get('screen');

export default {
  screen: {
    height: screen.height,
    width: screen.width,
  },
};
