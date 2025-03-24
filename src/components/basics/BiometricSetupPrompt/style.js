import { AppSize } from 'theme';

export default {
  checkImage: { width: 180, aspectRatio: 1 },
  splitImage: { width: 182, height: 110 },
  titleContainer: {
    paddingTop: 5,
  },
  buttonContainer: {
    minWidth: AppSize.screen.width < 350 ? 135 : 140,
  },
  noFaceIDIcon: {
    width: '62@s',
    height: '62@s',
  },
  noFingerPrintIcon: {
    width: '76@s',
    height: '54@s',
  },
};
