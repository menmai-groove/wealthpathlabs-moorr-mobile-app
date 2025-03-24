export default {
  container: {
    flex: 1,
    shadowColor: 'palette.color-black-1',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  logoContainer: {},
  logo: {
    resizeMode: 'contain',
    height: undefined,
    aspectRatio: 180 / 41,
  },
  sloganText: {
    color: 'palette.color-white-1',
    marginTop: 10,
  },
  body: {
    backgroundColor: 'palette.color-white-1',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
};
