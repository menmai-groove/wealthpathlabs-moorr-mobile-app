import reducer from './reducer';
import saga from './saga';

export const moduleName = 'auth';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: reducer,
  },
  sagas: [saga],
});

export default getModule;
