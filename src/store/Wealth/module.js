import { getWealthSpeedData } from 'store/Wealth/action';

import reducer from './reducer';
import saga from './saga';

export const moduleName = 'wealth';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: reducer,
  },
  sagas: [saga],
  initialActions: [getWealthSpeedData({ generate: false })],
  finalActions: [],
});

export default getModule;
