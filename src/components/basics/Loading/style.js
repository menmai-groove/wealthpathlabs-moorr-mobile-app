import { StyleSheet } from 'react-native';

export default {
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  iconContainer: {
    // padding: 5,
    // borderRadius: 10,
    // backgroundColor: '#ffffff70',
  },
  icon: {
    width: '60@s',
    height: '60@s',
  },
};
