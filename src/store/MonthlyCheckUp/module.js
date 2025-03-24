import { getMonthlyCheckUpData } from 'store/MonthlyCheckUp/action';

import { monthlyCheckUpReducer } from './reducer';
import saga from './saga';

export const moduleName = 'monthlyCheckUp';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: monthlyCheckUpReducer,
  },
  sagas: [saga],
  initialActions: [getMonthlyCheckUpData(true)],
  finalActions: [],
});

export default getModule;
