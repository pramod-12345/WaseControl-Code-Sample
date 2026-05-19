import React from "react";
import { Color } from "../App/Common";
import { createAppContainer } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";
import Navigation from "../App/Navigation";

const RootRouter = createBottomTabNavigator(Navigation.tabs, {
  ...Navigation.config,
  tabBarOptions: {
    activeTintColor: Color.tabbarTint,
    inactiveTintColor: Color.tabbarColor,
  },
});

export default createAppContainer(RootRouter);
