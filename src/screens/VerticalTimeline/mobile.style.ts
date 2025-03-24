import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

type NamedStyles = { [P in keyof any]: ViewStyle | TextStyle | ImageStyle };

const styles: NamedStyles = {
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  btnPlusWrapper: {
    borderRadius: 4,
    shadowColor: 'palette.color-dynamic-shadow',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 16,
    padding: 15,
  },
  imagePlus: {
    height: 56,
    width: 56,
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: 'palette.color-primary-1',
  },
  btnFloating: {
    position: 'absolute',
    right: 0,
  },
  sectionTitle: {
    backgroundColor: 'palette.color-primary-1',
    height: '24@ms0',
  },
  dateText: {
    color: 'palette.color-primary-text-3',
  },
  dateGreenText: {
    color: 'palette.color-green-2',
  },
  yearText: {
    color: 'palette.color-white-1',
  },
  triangle: {
    position: 'absolute',
    top: 0,
    right: -12,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: 'palette.color-primary-1',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
};

export default styles;
