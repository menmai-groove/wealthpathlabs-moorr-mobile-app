const DOT_SIZE = 10;

export default {
  container: {
    flex: 1,
  },
  scrollView: {},
  page: {
    paddingHorizontal: 30,
  },
  image: {
    marginTop: 10,
    width: '100%',
    maxHeight: 345,
    alignSelf: 'center',
  },
  titleContainer: {
    marginTop: 40,
  },
  titleText: {
    textAlign: 'center',
    fontSize: 24,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  buttonContainer: {
    marginTop: 60,
    marginBottom: 100,
  },
  button: {
    backgroundColor: 'palette.color-primary-1',
    width: 150,
    padding: 5,
    borderRadius: 5,
  },
  outlineButton: {
    backgroundColor: 'palette.color-white-1',
  },
  buttonText: {
    color: 'palette.color-white-1',
  },
  bulletContainer: {
    flexDirection: 'row',
    width: DOT_SIZE * 4 + DOT_SIZE * 3 * 1.5,
    justifyContent: 'space-between',
  },
  bullet: {
    backgroundColor: 'palette.color-primary-1',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  textCenter: {
    padding: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },
  signInText: {
    color: 'palette.color-blue-2',
  },
  lightPage: {
    backgroundColor: 'custom.screens.onboardingHome.light-background-color',
    color: 'custom.screens.onboardingHome.light-font-color',
  },
  darkPage: {
    backgroundColor: 'custom.screens.onboardingHome.dark-background-color',
    color: 'custom.screens.onboardingHome.dark-font-color',
  },
  lightPullet: {
    color: 'custom.screens.onboardingHome.light-bullet-color',
  },
  darkPullet: {
    color: 'custom.screens.onboardingHome.dark-bullet-color',
  },
};
