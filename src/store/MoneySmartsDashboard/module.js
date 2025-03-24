import { getMoneySmarts } from './action';
import { moneySmartsDashboardReducer } from './reducer';
import saga from './saga';

export const moduleName = 'moneySmartsDashboard';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: moneySmartsDashboardReducer,
  },
  sagas: [saga],
  initialActions: [getMoneySmarts(true)],
  finalActions: [],
});

export default getModule;
