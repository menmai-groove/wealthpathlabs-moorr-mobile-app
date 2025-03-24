import { getNotifications } from './action';
import reducer from './reducer';
import saga from './saga';

export const moduleName = 'notification';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: reducer,
  },
  initialActions: [getNotifications({ page: 1 })],
  sagas: [saga],
});

export default getModule;
