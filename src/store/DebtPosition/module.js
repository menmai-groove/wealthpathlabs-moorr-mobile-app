import { getDebtPosition } from 'store/DebtPosition/action';

import { reducer } from './reducer';
import saga from './saga';

export const moduleName = 'debtPosition';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: reducer,
  },
  sagas: [saga],
  initialActions: [getDebtPosition(true)],
});

export default getModule;
