import { AppConstants } from 'constant';
const {
  layout: {
    menu: { buttonSize },
  },
} = AppConstants;

export default {
  menuButtonContainer: {
    position: 'absolute',
    alignSelf: 'center',
  },
  menuButton: {
    width: `${buttonSize}@ms0`,
    height: `${buttonSize}@ms0`,
    borderRadius: 999,
    borderWidth: 3,
    backgroundColor: 'palette.color-primary-1',
    borderColor: 'palette.color-primary-1',
    zIndex: 999,
  },
  closeMenuButton: {
    backgroundColor: 'palette.color-red-2',
    borderColor: 'palette.color-white-1',
    shadowColor: 'palette.color-black-1',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  closeIcon: {
    width: '16@ms0',
    height: '16@ms0',
  },
  logoIcon: {
    width: '56@ms0',
    height: '56@ms0',
  },
};
