export default {
  container: {
    flex: 1,
    backgroundColor: 'palette.color-authenticate-container',
  },
  imageCover: {
    position: 'absolute',
    width: '100%',
    height: undefined,
    aspectRatio: 375 / 272,
  },
  secondaryLogo: { height: 50, resizeMode: 'contain' },
  logoContainer: {
    marginTop: 40,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: 10,
    position: 'absolute',
    top: 0,
    left: 10,
  },
  otpContainer: { marginTop: 40, marginBottom: 10, height: 50 },
  underlineStyleBase: {
    width: 40,
    height: '100%',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'palette.color-black-1',
    color: 'typography.heading-1.color',
    fontSize: 'typography.heading-1.font-size',
    lineHeight: 'typography.heading-1.line-height',
    fontWeight: 'typography.heading-1.font-weight',
    fontFamily: 'typography.heading-1.font-family',
    textAlignVertical: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  underlineStyleHighLighted: {
    borderColor: 'palette.color-black-1',
  },
  buttonContainer: { marginTop: 30 },
  clickHereText: {
    color: 'palette.color-blue-2',
  },
  tooltipStyle: {
    paddingHorizontal: 15,
  },
  spacing: {
    letterSpacing: 0.24,
  },
  resendText: {
    color: 'palette.color-blue-2',
  },
  signUpText: {
    color: 'palette.color-blue-2',
  },
};
