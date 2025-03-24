import reducer from './reducer';
import saga from './saga';

export const moduleName = 'onBoardingInterview';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: reducer,
  },
  sagas: [saga],
  finalActions: [],
});

export default getModule;
