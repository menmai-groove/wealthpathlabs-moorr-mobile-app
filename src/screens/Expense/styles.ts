import { DeviceInfoLib } from 'libs';
import { merge } from 'lodash';

const mobile = {
  container: { flex: 1, backgroundColor: 'palette.color-dynamic-container' },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'palette.color-dynamic-container',
    paddingVertical: 10,
  },
  wrapperControl: { position: 'absolute', bottom: 30, left: 30, right: 30 },
};
const tablet = {};

export default DeviceInfoLib.isTablet() ? merge({}, mobile, tablet) : mobile;
