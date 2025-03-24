import { getAssetPosition } from 'store/AssetPosition/action';

import { reducer } from './reducer';
import saga from './saga';

export const moduleName = 'assetPosition';

const getModule = () => ({
  id: moduleName,
  reducerMap: {
    [moduleName]: reducer,
  },
  sagas: [saga],
  initialActions: [getAssetPosition(true)],
});

export default getModule;
