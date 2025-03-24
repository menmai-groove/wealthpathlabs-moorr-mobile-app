import { getGroupingAndItems } from './action';
import reducer from './reducer';
import saga from './saga';

export const moduleName = 'expenseDashboard';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: reducer,
  },
  sagas: [saga],
  initialActions: [getGroupingAndItems({ isRefresh: true })],
  finalActions: [],
});

export default getModule;
