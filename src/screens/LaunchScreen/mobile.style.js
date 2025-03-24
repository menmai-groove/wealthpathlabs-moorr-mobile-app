export default {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'palette.color-dynamic-container',
  },
  logo: {
    height: 300,
    aspectRatio: 1,
  },
  animatedLogo: {
    position: 'absolute',
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
  codePushWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  codePushStatus: {
    alignItems: 'center',
    marginBottom: 8,
  },
  syncProgressBar: {
    backgroundColor: 'palette.color-primary-1',
  },
};
