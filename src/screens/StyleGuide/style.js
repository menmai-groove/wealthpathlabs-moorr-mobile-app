import { AppStyle } from 'theme';

export default {
  container: {
    flex: 1,
    backgroundColor: 'palette.color-white-1',
  },
  block: {
    padding: 10,
  },
  primaryLogo: { height: 100, resizeMode: 'contain' },
  secondaryLogo: { height: 50, resizeMode: 'contain' },
  logoCover: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    margin: 10,
    flex: 1,
  },
  backgroundLogo: {
    backgroundColor: 'palette.color-primary-1',
  },
  borderLogo: {
    borderColor: '#E6E6E6',
    borderWidth: 1,
  },
  content: {
    paddingBottom: 95,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: 'palette.color-white-1',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginVertical: 10,
    marginHorizontal: 15,

    ...AppStyle.shadow,
  },
  lineChart: {
    color: 'palette.color-blue-3',
  },

  containerTabStyle: {
    backgroundColor: 'palette.color-white-1',
  },
  fontTabStyle: {
    color: 'palette.color-primary-1',
  },
  activeTabStyle: {
    backgroundColor: 'palette.color-primary-1',
  },
  activeFontStyle: {
    color: 'palette.color-white-1',
  },
};
