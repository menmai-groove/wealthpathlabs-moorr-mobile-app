import { AppStyle } from 'theme';

export default {
  container: {
    flex: 1,
    backgroundColor: 'palette.color-white-1',
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
  pieSVG: {},
  pieCenterTitleText: {
    textAlign: 'center',
  },
  pieCenterDescriptionText: {
    flexShrink: 1,
    textAlign: 'center',
  },
  text: { fontSize: 12 },
  propertyPortfolioLineChart: {
    color: 'palette.color-blue-2',
  },
  miniCardContainer: {
    flex: 1,
    backgroundColor: 'palette.color-white-5',
    borderRadius: 6,
    width: 0,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  labelContainer: {
    padding: 5,
    marginTop: 20,
    backgroundColor: 'palette.color-grey-9',
    borderRadius: 4,
  },
  flex05: { flex: 0.5 },
  width0: {
    width: 0,
  },
  jarCard: {
    borderWidth: 1,
    borderColor: 'palette.color-line-1',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  icon: { width: 20, height: 20 },
  image3: { width: 54, height: 54 },
  arrowLeft: {
    color: 'palette.color-primary-text-1',
  },
  moneyInContainer: {
    backgroundColor: 'palette.color-green-2',
  },
  moneyOutContainer: {
    backgroundColor: 'palette.color-orange-2',
  },
  seeDetailsText: {
    color: 'palette.color-blue-2',
  },
  seeDetailsIcon: {
    color: 'palette.color-blue-2',
  },
  seeDetailsContainer: {
    marginBottom: -3,
    paddingVertical: 5,
    alignItems: 'center',
  },
  whiteColor: {
    color: 'palette.color-white-1',
  },
  monthlySurplusBg: {
    backgroundColor: 'palette.color-blue-4',
  },
  monthlyDeficitBg: {
    backgroundColor: 'palette.color-red-3',
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
  displayChart: {
    display: 'flex',
    zIndex: 100,
  },
  imageHeaderGoal: { width: 41, height: 41 },
  itemGoal: {
    borderRadius: 6,
    borderLeftWidth: 5,
    marginTop: 15,
  },
  heightItemGoal: {
    height: 146,
  },
  imageBackgroundGoal: {
    flex: 1,
    height: 146,
    borderBottomRightRadius: 6,
    borderTopRightRadius: 6,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  containerGoal: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 6,
    marginLeft: 20,
    marginRight: 10,
    marginBottom: 5,
  },
  iconGoal: {
    width: 20,
    height: 20,
  },
  iconGoalWrapper: {
    borderRadius: 20,
    width: 40,
    height: 40,
    margin: 15,
    marginRight: 0,
    backgroundColor: 'palette.color-white-1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cashPosition: {
    color: 'palette.color-green-2',
  },
  netWorth: {
    color: 'palette.color-primary-1',
  },
  assetPosition: {
    color: 'palette.color-blue-2',
  },
  debtPosition: {
    color: 'palette.color-red-2',
  },
};
