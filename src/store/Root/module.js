import { rootReducer } from './reducer';
import saga from './saga';

export const moduleName = 'root';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: rootReducer,
  },
  sagas: [saga],
});

export default getModule;
