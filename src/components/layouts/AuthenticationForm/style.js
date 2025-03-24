import AppSize from 'theme/size';

export default {
  form: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'palette.color-white-1',
    borderRadius: 40,
    minHeight: AppSize.screen.height * 0.65,
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 27,

    shadowColor: 'palette.color-grey-2',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.43,
    shadowRadius: 9.51,

    elevation: 15,
  },
  contentBodyContainer: {
    flex: 1,
    marginTop: 27,
  },
  footerContainer: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
};
