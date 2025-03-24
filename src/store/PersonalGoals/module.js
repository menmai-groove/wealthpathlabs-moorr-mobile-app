import { getUpcomingGoal } from './action';
import { personalGoalReducer } from './reducer';
import saga from './saga';

export const moduleName = 'personalGoals';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: personalGoalReducer,
  },
  sagas: [saga],
  initialActions: [getUpcomingGoal(true)],
});

export default getModule;
