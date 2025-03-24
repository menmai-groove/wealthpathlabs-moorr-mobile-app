import { getNetWorth } from 'store/NetWorth/action';

import { reducer } from './reducer';
import saga from './saga';

export const moduleName = 'netWorth';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: reducer,
  },
  sagas: [saga],
  initialActions: [getNetWorth(true)],
});

export default getModule;
