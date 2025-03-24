import { getAssets } from 'store/Borrowing/action';

import reducer from './reducer';
import saga from './saga';

export const moduleName = 'borrowing';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: reducer,
  },
  sagas: [saga],
  initialActions: [getAssets()],
  finalActions: [],
});

export default getModule;
