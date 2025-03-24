import { historicalLogReducer } from './reducer';
import saga from './saga';

export const moduleName = 'historicalLog';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: historicalLogReducer,
  },
  sagas: [saga],
  initialActions: [],
  finalActions: [],
});

export default getModule;
