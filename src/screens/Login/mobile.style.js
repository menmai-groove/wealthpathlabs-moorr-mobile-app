export default {
  container: {
    flex: 1,
    backgroundColor: 'palette.color-authenticate-container',
  },
  errorMsgEmail: {
    color: 'secondaryInput.message-error-color',
    fontSize: 'secondaryInput.message-error-font-size',
    fontFamily: 'secondaryInput.message-error-font-family',
    lineHeight: 'secondaryInput.message-error-line-height',
  },
  formBlock: {
    marginBottom: 10,
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
  formButton: {
    marginTop: 30,
    flexDirection: 'row',
  },
  biometricsContainer: { marginTop: 20 },
  textWithLink: { color: 'palette.color-red-2' },
  signUpText: {
    color: 'palette.color-blue-2',
  },
  biometricsButton: {
    flex: 1,
    width: 70,
    borderRadius: 16,
    marginLeft: 10,
    backgroundColor: 'palette.color-green-1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipStyle: {
    paddingHorizontal: 15,
  },
  avatar: {
    color: 'palette.color-primary-1',
  },
  avatarContainer: {
    borderWidth: 1,
    borderColor: 'palette.color-grey-4',
    shadowColor: 'palette.color-white-1',
  },
  avatarCircle: {
    backgroundColor: 'palette.color-authenticate-container',
  },
  biometricContentModal: { maxHeight: 380 },
  biometricItemsContainer: { flexDirection: 'row', alignItems: 'center' },
  biometricItemsText: { paddingLeft: 10, flexShrink: 1 },
  biometricModalTitle: { paddingBottom: 10, alignSelf: 'center' },
  biometricModalSubTitle: { alignSelf: 'center' },
  biometricNote: { alignSelf: 'center' },
  verticalLine: {
    height: 0.5,
    backgroundColor: 'palette.vertical-line',
    width: '100%',
  },
};
