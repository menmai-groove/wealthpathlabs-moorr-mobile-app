import { AppSize } from 'theme';
const optiSize = AppSize.screen.width / 4;

export default {
  container: {
    flex: 1,
    backgroundColor: 'palette.color-dynamic-container',
    alignItems: 'center',
  },
  buttonField: {
    minWidth: 180,
  },
  imageContainer: { justifyContent: 'center', alignItems: 'center' },
  opti: {
    width: optiSize,
    height: optiSize,
    position: 'absolute',
    marginTop: optiSize / 3,
  },
  contentText: { marginTop: 10, paddingHorizontal: 20, textAlign: 'center', marginBottom: 30 },
};
