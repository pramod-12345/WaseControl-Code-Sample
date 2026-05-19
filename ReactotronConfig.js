import Reactotron from 'reactotron-react-native'

import { reactotronRedux as reduxPlugin } from 'reactotron-redux'
import Constants from 'expo-constants';

// console.disableYellowBox = true;

if (Constants && Constants.isDevice) {
  // test on real device: change to your local config
  Reactotron.configure({name: "Listable",host: "10.20.0.160"});
}
else {
  Reactotron.configure({name: 'Listable'})
}
Reactotron.useReactNative({
  asyncStorage: { ignore: ['secret'] }
});

Reactotron.use(reduxPlugin());

if (__DEV__) {
  Reactotron.connect();
  Reactotron.clear()
}

console.tron = Reactotron;
