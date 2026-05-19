import React from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import * as Animatable from "react-native-animatable";
import { Color } from "../../Common";

var createReactClass = require("create-react-class");
const styles = StyleSheet.create({
  tabbar: {
    height: 49,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#eee",
  },
  tab: {
    alignSelf: "stretch",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

const TabBar = createReactClass({
  onPress(key) {
    this.props.navigation.navigate(key);
  },

  render() {
    const { navigation, renderIcon, activeTintColor, inactiveTintColor } =
      this.props;

    const { routes } = navigation.state;
    const ignoreMenu = ["login", "pickup"];

    return (
      <View style={[styles.tabbar, { backgroundColor: Color.tabbar }]}>
        {routes &&
          routes.map((route, index) => {
            const focused = index === navigation.state.index;
            const tintColor = focused ? activeTintColor : inactiveTintColor;
            if (ignoreMenu.indexOf(route.key) > -1) {
              return <View key={route.key} />;
            }

            return (
              <TouchableWithoutFeedback
                key={route.key}
                style={styles.tab}
                onPress={this.onPress.bind(this, route.key)}
              >
                <Animatable.View ref={"tabItem" + index} style={styles.tab}>
                  {renderIcon({
                    route,
                    index,
                    focused,
                    tintColor,
                  })}
                </Animatable.View>
              </TouchableWithoutFeedback>
            );
          })}
      </View>
    );
  },
});

export default TabBar;
