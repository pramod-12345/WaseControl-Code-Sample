import React from "react";
import { createStackNavigator } from "react-navigation-stack";
import { Images } from "../../App/Common";
import { TabBar, TabBarIcon, MapView } from "../../App/Components";
import { Pickup } from "../../App/Container";
import CategoryScreen from "./CategoryScreen";
import CategoriesScreen from "./CategoriesScreen";
import UserProfileScreen from "./UserProfileScreen";
import LoginScreen from "./LoginScreen";

const categoriesStack = createStackNavigator({
  categories: { screen: CategoriesScreen },
  category: { screen: CategoryScreen },
});

const mapStack = createStackNavigator({
  map: {
    screen: MapView,
    navigationOptions: {
      header: null,
    },
  },
  category: { screen: CategoryScreen },
});

const userProfileStack = createStackNavigator({
  userProfile: { screen: UserProfileScreen },
});

export default {
  tabs: {
    //Initial screen, Sign-In Screen.
    login: {
      screen: LoginScreen,
      navigationOptions: {
        header: null,
        tabBarVisible: false,
      },
    },
    //Screen after Sign-In, to select Pickup Request.
    pickup: {
      screen: Pickup,
      navigationOptions: {
        tabBarVisible: false,
        gesturesEnabled: true,
      },
    },
    //Tab 1, List of containers
    categories: {
      screen: categoriesStack,
      navigationOptions: {
        header: null,
        tabBarIcon: ({ tintColor }) => (
          <TabBarIcon
            iconStatic={Images.icons.category}
            tintColor={tintColor}
          />
        ),
      },
    },
    //Tab 2, Map with markers
    map: {
      screen: mapStack,
      navigationOptions: {
        header: null,
        tabBarIcon: ({ tintColor }) => (
          <TabBarIcon
            css={{ width: 20, height: 20 }}
            iconStatic={Images.icons.mapPin}
            tintColor={tintColor}
          />
        ),
      },
    },
    //Tab 3, User Page
    userProfile: {
      screen: userProfileStack,
      navigationOptions: {
        header: null,
        tabBarIcon: ({ tintColor }) => (
          <TabBarIcon
            iconStatic={Images.icons.iconUser}
            tintColor={tintColor}
          />
        ),
      },
    },
  },
  config: {
    initialRouteName: "login",
    tabBarComponent: TabBar,
    tabBarPosition: "bottom",
    swipeEnabled: false,
    animationEnabled: false,
    tabBarOptions: {
      showIcon: true,
      showLabel: false,
      style: {
        backgroundColor: "#000",
      },
    },
    lazy: true,
  },
};
