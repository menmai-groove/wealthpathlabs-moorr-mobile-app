import { getIndustryDivisionsData } from 'store/Industry/action';

import reducer from './reducer';
import saga from './saga';

export const moduleName = 'industry';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: reducer,
  },
  sagas: [saga],
  initialActions: [getIndustryDivisionsData()],
  finalActions: [],
});

export default getModule;
