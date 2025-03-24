import { verificationReducer } from './reducer';
import saga from './saga';

export const moduleName = 'verification';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: verificationReducer,
  },
  sagas: [saga],
});

export default getModule;
