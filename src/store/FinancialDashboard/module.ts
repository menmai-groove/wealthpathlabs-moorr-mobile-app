import { getFinancialSummary } from './action';
import reducer from './reducer';
import saga from './saga';

export const moduleName = 'financialDashboard';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: reducer,
  },
  sagas: [saga],
  initialActions: [getFinancialSummary(true)],
});

export default getModule;
