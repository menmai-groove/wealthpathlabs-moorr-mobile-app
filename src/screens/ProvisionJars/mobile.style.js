export default {
  container: {
    flex: 1,
    backgroundColor: 'palette.color-dynamic-container',
  },
  pieCenterTitleText: {
    textAlign: 'center',
  },
  pieCenterDescriptionText: {
    flexShrink: 1,
    textAlign: 'center',
  },
  pieSliceColor: {
    primary1: 'custom.screens.jar.primary-color1',
    primary2: 'custom.screens.jar.primary-color2',
    secondary1: 'custom.screens.jar.secondary-color1',
    secondary2: 'custom.screens.jar.secondary-color2',
    fill: 'palette.color-white-1',
  },
  cardContainer: {
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 'palette.color-white-1',
    shadowColor: 'palette.color-white-1',
    borderWidth: 1,
    borderRadius: 6,
    borderTopColor: 'palette.color-line-1',
    borderBottomColor: 'palette.color-line-1',
    borderRightColor: 'palette.color-line-1',
    borderLeftWidth: 4,
    borderLeftColor: 'custom.screens.jar.primary-color1',
    padding: 0,
  },
  cartContentStyle: { paddingHorizontal: 10, paddingTop: 12 },
  cartTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cartTitle: {
    fontSize: 14,
    color: 'palette.color-primary-text-1',
    lineHeight: 20,
  },
  cartPriceContainer: { flexDirection: 'row', alignItems: 'center' },
  cartArrow: {
    iconColor: 'custom.screens.jar.row-icon-color',
    iconStyle: { marginLeft: 8 },
  },
  cartFooterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  cartFooterText: {
    fontSize: 12,
    color: 'palette.color-primary-text-2',
    lineHeight: 16,
  },
  progressBar: {
    backgroundColor: 'custom.screens.jar.progress-bar-rent-color',
  },
  progressOverloadBar: {
    backgroundColor: 'palette.color-red-2',
  },
  titleOnProgressBar: {
    top: 0,
    left: 5,
    right: 5,
    position: 'absolute',
  },
  textTitleOnProgressBar: { fontSize: 10, lineHeight: 12 },
  textTitleOnProgressOverloadBar: {
    color: 'palette.color-white-1',
  },
  cardArchived: {
    borderLeftColor: 'palette.color-grey-5',
  },
  progressBarArchived: {
    backgroundColor: 'palette.color-grey-5',
  },
};
