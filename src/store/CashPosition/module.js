import { getCashPosition } from 'store/CashPosition/action';

import { reducer } from './reducer';
import saga from './saga';

export const moduleName = 'cashPosition';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: reducer,
  },
  sagas: [saga],
  initialActions: [getCashPosition(true)],
});

export default getModule;
