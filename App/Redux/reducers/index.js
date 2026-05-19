import { persistCombineReducers } from 'redux-persist'
// import storage from 'redux-persist/lib/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

import categories from './categories'
import user from './user'
import map from './map'
import language from './language'

const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['map'],
};

export default persistCombineReducers(rootPersistConfig, {
  categories,
  user,
  map,
  language,
})
