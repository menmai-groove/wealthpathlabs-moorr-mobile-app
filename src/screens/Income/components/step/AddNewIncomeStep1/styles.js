import { DeviceInfoLib } from 'libs';
import { merge } from 'lodash';

import mobile from './mobile.style';
import tablet from './tablet.style';

export default DeviceInfoLib.isTablet() ? merge({}, mobile, tablet) : mobile;
