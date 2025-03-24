import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import { createStore } from 'redux-dynamic-modules';
import { getSagaExtension } from 'redux-dynamic-modules-saga';
import { createLogger } from 'redux-logger';
import { persistReducer, persistStore } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import getAuthModule from 'store/Auth/module';
import getRootModule from 'store/Root/module';
import getVerificationModule from 'store/Verification/module';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  whitelist: [],
};

const advancedCombineReducers = reducers => {
  return persistReducer(persistConfig, combineReducers(reducers));
};

const getLoggingExtension = () => {
  return {
    middleware: [
      createLogger({
        // only log in development mode
        predicate: () => __DEV__,
      }),
    ],
  };
};

const extensions = __DEV__ ? [getSagaExtension(), getLoggingExtension()] : [getSagaExtension()];

const store = createStore(
  {
    initialState: {},
    extensions,
    advancedCombineReducers,
  },
  getAuthModule(),
  getRootModule(),
  getVerificationModule(),
);

export const persistor = persistStore(store);
export default store;
