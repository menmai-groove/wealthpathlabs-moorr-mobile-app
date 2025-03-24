import { DeviceInfoLib } from 'libs';
import { merge } from 'lodash';

import mobile from './mobile.style';

export default DeviceInfoLib.isTablet() ? merge({}, mobile) : mobile;
