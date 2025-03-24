import { DeviceInfoLib } from 'libs';
import { merge } from 'lodash';
import { TextStyle } from 'react-native';

const mobile = {
  container: {
    backgroundColor: 'palette.color-dynamic-container',
  },
  categoryItem: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'palette.color-white-4',
    borderWidth: 1,
    borderColor: 'palette.color-line-1',
    borderRadius: 30,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  activeCategoryItem: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'palette.color-green-1',
    borderWidth: 1,
    borderColor: 'palette.color-line-1',
    paddingVertical: 8,
    borderRadius: 30,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  categoryText: { textAlign: 'center' },
  activeCategoryText: { textAlign: 'center', color: 'white' },
  contentList: {
    paddingHorizontal: 30,
    paddingTop: 15,
  },
  containerList: {
    backgroundColor: 'palette.color-dynamic-container',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'palette.color-dynamic-container',
  },
  bottomShadow: {
    shadowColor: 'black',
    shadowOpacity: 0.03,
    shadowRadius: 1,
    shadowOffset: { height: -1, width: 0 },
    elevation: 7,
  },
  tabBarLabelStyle: {
    textTransform: 'capitalize',
    fontSize: 'typography.paragraph-2.font-size',
    fontWeight: 'typography.paragraph-2.font-weight',
    fontFamily: 'typography.paragraph-2.font-family',
    lineHeight: 'typography.paragraph-2.line-height',
  },
  tabBarIndicatorStyle: {
    backgroundColor: 'palette.color-primary-1',
    borderRadius: 999,
    height: '100%',
  },
  tabBarStyle: {
    backgroundColor: 'palette.color-line-1',
    borderRadius: 999,
    marginHorizontal: 30,
    shadowColor: '#fff',
    shadowRadius: 0,
  },
  tabBarItemStyle: {
    borderRadius: 999,
    marginVertical: -3,
  },
  wrapperControl: { position: 'absolute', bottom: 30, left: 30, right: 30 },
};
const tablet = {};

export default DeviceInfoLib.isTablet() ? merge({}, mobile, tablet) : mobile;

export const tabBarOptions = {
  lazy: false,
  swipeEnabled: true,
  tabBarActiveTintColor: '#fff',
  tabBarInactiveTintColor: '#222',
  tabBarPressColor: 'transparent',
  tabBarLabelStyle: {
    textTransform: 'capitalize',
    fontSize: 14,
  } as TextStyle,
  tabBarIndicatorStyle: {
    backgroundColor: '#541868',
    borderRadius: 999,
    height: '100%',
  },
  tabBarStyle: {
    backgroundColor: '#ECECF4',
    borderRadius: 999,
    marginHorizontal: 30,
    shadowColor: '#fff',
    shadowRadius: 0,
  },
  tabBarItemStyle: {
    borderRadius: 999,
    marginVertical: -2,
  },
};
