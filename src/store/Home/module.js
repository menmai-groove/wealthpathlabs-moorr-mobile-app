import { getHomeData, getReview } from './action';
import { homeReducer } from './reducer';
import saga from './saga';

export const moduleName = 'home';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: homeReducer,
  },
  initialActions: [getHomeData(true), getReview()],
  sagas: [saga],
});

export default getModule;
