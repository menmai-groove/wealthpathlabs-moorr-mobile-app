import { AppStyle } from 'theme';

export default {
  container: {
    flex: 1,
    // backgroundColor: 'palette.color-primary-1',
    backgroundColor: 'palette.color-white-1',
  },
  tabContainer: {
    paddingVertical: 20,
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'palette.color-white-1',
  },
  message: {
    textAlign: 'center',
    color: 'palette.color-primary-text-1',
  },
  pieSVG: {},
  semiCircleSVG: {},
  pieCenterTitleText: {
    textAlign: 'center',
  },
  pieCenterDescriptionText: {
    flexShrink: 1,
    textAlign: 'center',
  },
  whiteColor: { color: 'palette.color-white-1' },
  image: { width: 12, height: 12 },
  image2: { width: 35, height: 18 },
  descriptionIcon: {
    color: 'palette.color-primary-text-1',
  },
  currentSurplus: {
    backgroundColor: 'palette.color-green-1',
  },
  closeIcon: {
    color: 'palette.color-primary-text-1',
  },
  containerTabStyle: {
    backgroundColor: 'palette.color-white-3',
  },
  fontTabStyle: {
    color: 'palette.color-primary-text-1',
  },
  activeTabStyle: {
    backgroundColor: 'palette.color-white-1',
  },
  activeFontStyle: {
    color: 'palette.color-primary-text-1',
  },
  divider: {
    borderTopColor: 'palette.color-grey-6',
    borderTopWidth: 1,
    marginVertical: 15,
  },
  moneyInContainer: {
    backgroundColor: 'palette.color-green-2',
  },
  moneyOutContainer: {
    backgroundColor: 'palette.color-orange-2',
  },
  moneyInListContainer: {
    maxHeight: 260,
  },
  backIcon: {
    color: 'palette.color-white-1',
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
  bulletContainer: {
    height: 20,
  },
  iconContainer: {
    height: 48,
    width: 48,
    borderRadius: 48 / 2,
    backgroundColor: 'palette.color-white-4',
  },
  icon: { height: 20, width: 20 },
  textWithLink: {
    color: 'palette.color-primary-1',
    textDecorationLine: 'underline',
  },
};
