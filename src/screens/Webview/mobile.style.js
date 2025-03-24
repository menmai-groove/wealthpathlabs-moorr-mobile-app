import { StyleSheet } from 'react-native';

export default {
  container: {
    flex: 1,
    backgroundColor: 'palette.color-dynamic-container',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    backgroundColor: 'white',
    top: 120,
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {},
  icon: {
    width: '60@s',
    height: '60@s',
  },
};
