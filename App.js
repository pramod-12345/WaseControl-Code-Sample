import React, { useState, useEffect } from "react";
import {
  Image,
  Text,
  Alert,
  LogBox,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  View,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Color, Device } from "./App/Common";
import * as SecureStore from "expo-secure-store";
import * as Font from "expo-font";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import { persistStore } from "redux-persist";
import reducers from "./App/Redux/reducers";
import thunk from "redux-thunk";
import { Constants, Languages } from "./App/Common";
import RootRouter from "./App/RootRouter";
import "./ReactotronConfig";

const { isIOS } = Device;

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

const middleware = [thunk];

LogBox.ignoreAllLogs(true);
let store = null;
if (__DEV__) {
  console.log("__DEV__");
  if (Constants.useReactotron) {
    store = createStore(reducers, {}, applyMiddleware(...middleware));
  } else {
    const composeEnhancers =
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    store = composeEnhancers(applyMiddleware(...middleware))(createStore)(
      reducers
    );

    if (module.hot) {
      module.hot.accept(reducers, () => {
        const nextRootReducer = reducers;
        store.replaceReducer(nextRootReducer);
      });
    }

    global.XMLHttpRequest = global.originalXMLHttpRequest
      ? global.originalXMLHttpRequest
      : global.XMLHttpRequest;
    global.FormData = global.originalFormData
      ? global.originalFormData
      : global.FormData;
  }
} else {
  console.log("sdsdsdsdsdsdsdsdsd");
  store = compose(applyMiddleware(...middleware))(createStore)(reducers);
}

persistStore(store);

const fontData = {
  OpenSans: require("./assets/fonts/OpenSans-Regular.ttf"),
  Volkhov: require("./assets/fonts/Volkhov-Regular.ttf"),
  Montserrat: require("./assets/fonts/Montserrat-Regular.ttf"),
  MontserratLight: require("./assets/fonts/Montserrat-Light.ttf"),
  MontserratBold: require("./assets/fonts/Montserrat-SemiBold.ttf"),
};

const App = () => {
  useEffect(() => {
    const handleInternet = () => {
      NetInfo.fetch().then(() => {
        NetInfo.addEventListener((state) => {
          if (state.isConnected) {
            SecureStore.setItemAsync("is_connection", "true");
          } else {
            SecureStore.setItemAsync("is_connection", "false");
            Alert.alert(Languages("oops"), Languages("noInternet"));
          }
        });
      });
    };

    handleInternet();

    return () => {
      NetInfo.removeEventListener(handleInternet);
    };
  }, []);

  const cacheFonts = (fonts) => {
    return fonts.map((font) => Font.loadAsync(font));
  };

  const loadAssets = async () => {
    const fontAssets = cacheFonts([fontData]);
    await Promise.all([...fontAssets]);
  };

  return (
    <View onLayout={loadAssets} style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaView style={styles.safe}>
          {isIOS && (
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          )}
          <RootRouter />
        </SafeAreaView>
      </Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    ...Platform.select({
      android: {
        marginTop: 20,
      },
    }),
    backgroundColor: "#fff",
  },
});

export default App;
