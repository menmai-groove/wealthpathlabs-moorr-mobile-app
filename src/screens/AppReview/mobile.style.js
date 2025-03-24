import { AppSize } from 'theme';

export default {
  container: {
    backgroundColor: 'palette.color-dynamic-container',
    paddingVertical: 30,
    borderRadius: 10,
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 40 },
  button: { minWidth: AppSize.screen.width < 380 ? 120 : 140 },
  reviewSuggestionDescription: { textAlign: 'center', marginTop: 20, paddingHorizontal: 10 },
  ratingOptiContainer: {
    flexDirection: 'row',
    marginTop: 25,
    marginBottom: 15,
    marginLeft: 20,
    marginRight: 4,
    alignItems: 'flex-end',
  },
  ratingOptiTextContent1: { alignItems: 'flex-start', flex: 1 },
  ratingOptiTextContent: {
    borderWidth: 1,
    borderColor: 'palette.color-white-3',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 15,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'palette.color-dynamic-container',

    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  sliderContainer: { marginTop: 60 },
  ratingFeelingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
  },
  ratingFeelLoveContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingLoveIcon: {
    color: 'custom.screens.review.heart-color',
  },
  blinkOpti: {
    width: '36@s',
    height: '35@s',
  },
};
