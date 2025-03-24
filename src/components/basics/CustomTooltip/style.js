export default {
  tooltipContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  label: {
    color: 'palette.color-blue-2',
    paddingLeft: 8,
  },
  icon: {
    color: 'palette.color-primary-1',
    fontSize: 18,
  },
  activeIcon: {
    color: 'palette.color-green-1',
  },
  noArrow: {
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  tooltipStyle: {},
  androidTooltip: {
    shadowColor: 'palette.color-black-1',
    elevation: 5,
  },
  contentContainer: { maxWidth: 270 },
  iosTooltip: {
    shadowColor: 'palette.color-black-1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
};
