export default {
  container: {
    justifyContent: 'center',
    marginHorizontal: 10,
    alignItems: 'center',
  },
  sliderContainer: { height: 20 },
  trackStyle: { height: 10, borderRadius: 6 },
  markerStyle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'palette.color-primary-2',
    borderWidth: 4,
    borderColor: 'white',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  markerContainerStyle: {
    top: 4,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedStyle: {
    backgroundColor: 'custom.screens.review.selected-rating-color',
  },
  unselectedStyle: {
    backgroundColor: 'palette.color-white-3',
  },
  labelContainer: {
    position: 'absolute',
    bottom: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidLabelShadow: {
    shadowOpacity: 0,
    textShadowRadius: 0.4,
    textShadowOffset: { width: 0, height: 1 },
  },
  iosLableShadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  labelText: { fontSize: 12, lineHeight: 16, position: 'absolute' },
};
