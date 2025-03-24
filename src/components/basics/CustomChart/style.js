export default {
  yAxisSvg: {
    fill: 'palette.color-grey-3',
    fontSize: 11,
    // fontFamily: 'Poppins-Regular',
    lineHeight: 16,
  },
  yAxisContainer: {},
  barChartItemSvg: {
    strokeWidth: 10,
    strokeLinejoin: 'round',
    scaleY: 0.985,
  },
  xAxisSvg: {
    fill: 'palette.color-grey-3',
    fontSize: 11,
    // fontFamily: 'Poppins-Regular',
    fontWeight: '500',
    lineHeight: 16,
  },
  stackedBarChartXAxisSvg: {
    fill: 'palette.color-grey-3',
    fontSize: 11,
    // fontFamily: 'Poppins-Regular',
    fontWeight: '500',
    lineHeight: 16,
    // rotation: -90
  },
  activeXAxisSvg: {
    fill: 'palette.color-primary-1',
    // fontFamily: 'Poppins-Medium',
    fontWeight: '500',
  },
  decorator: {
    backgroundColor: '#fff',
    borderColor: 'palette.color-white-1',

    shadowColor: 'palette.color-black-1',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
    opacity: 0,
  },
  tooltipContainer: {
    alignSelf: 'center',
  },
  tooltipContent: {
    backgroundColor: 'palette.color-primary-1',
    borderWidth: 1,
    borderColor: 'palette.color-primary-1',
    alignSelf: 'center',
    margin: 5,
    padding: 5,
    borderRadius: 5,

    shadowColor: 'palette.color-black-1',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  tooltipText: {
    color: 'palette.color-white-1',
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    fontSize: 12,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    position: 'absolute',
    alignSelf: 'center',
    marginHorizontal: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'palette.color-primary-1',
    borderBottomColor: 'palette.color-primary-1',
  },
  customXAxisText: {
    opacity: 0,
  },
  customXAxisSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },
  stroke: {
    color: 'palette.color-white-1',
  },
  selectedTooltipOpacity: {
    opacity: 1,
  },
  hidden: { overflow: 'hidden' },
  loader: {
    position: 'absolute',
  },
  alignSelfCenter: {
    alignSelf: 'center',
  },
  stackedBarChartContainer: {
    // backgroundColor: 'palette.color-white-1',
    // borderWidth: 1,
    // borderColor: 'palette.color-grey-6',
    // alignSelf: 'center',
    // padding: 10,
    // borderRadius: 5,
    width: 170,
    opacity: 0.95,
  },
  stackedBarChartLabel: {
    fontSize: 12,
  },
  stackedBarChartValue: { fontSize: 10 },
  stackedBarChartSquare: {
    width: 12,
    height: 12,
  },
  tooltipContainerStyle: {
    backgroundColor: 'palette.color-white-1',
    borderColor: 'palette.color-grey-6',
    borderWidth: 1,
    padding: 1,
    borderRadius: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    opacity: 0.9,
  },
  squareV2: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'palette.color-primary-1',
  },

  colorBarChartContainer: {
    width: 100,
    opacity: 0.95,
  },
  colorBarChartLabel: {
    fontSize: 10,
  },
  colorBarChartValue: {
    fontSize: 12,
    color: 'palette.color-black-1',
  },

  triangle2: {
    position: 'absolute',
    alignSelf: 'center',
  },
  triangleTop: {
    top: -10,
  },
  triangleBottom: {
    bottom: -10,
  },
  triangleLeft: {
    left: 10 / 2,
  },
  triangleRight: {
    right: 10 / 2,
  },

  borderTriangleTop: {
    top: -10 - 3,
  },
  borderTriangleBottom: {
    bottom: -10 - 3,
  },
  borderTriangleLeft: {
    left: 10 / 2 - 2,
  },
  borderTriangleRight: {
    right: 10 / 2 - 2,
  },
};
