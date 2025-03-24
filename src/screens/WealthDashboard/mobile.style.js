import { AppStyle } from 'theme';

export default {
  container: {
    flex: 1,
    backgroundColor: 'palette.color-dynamic-container',
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
  centerView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContainer: {
    backgroundColor: 'palette.color-white-1',
  },
  gaugeContainer: {
    backgroundColor: 'palette.color-white-1',
    borderRadius: 10,
    borderColor: 'palette.color-grey-6',
    borderWidth: 1,
  },
  wrapperChart: {
    backgroundColor: 'palette.color-dynamic-container',
    borderWidth: 1,
    borderColor: 'palette.color-grey-6',
    borderRadius: 10,
    paddingVertical: 10,
  },
  modalScrollView: { maxHeight: 650 },
  netWorthLineChart: {
    color: 'palette.color-blue-2',
  },
  titleRangeContainer: {
    // width: 200,
  },
  rangeContainer: {
    width: 85,
  },
  bulletContainer: {
    position: 'absolute',
    height: 20,
    bottom: 20,
    left: 25,
  },
  infoIcon: {
    width: 20,
    height: 20,
  },
};
