import React, { Component } from "react";
import { Category } from "../Container";

export default class CategoryScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: null,
    tabBarVisible: false,
  });

  render() {
    const { goBack, state } = this.props.navigation;
    const { mainCategory, containerId } = state.params;

    return (
      <Category
        mainCategory={mainCategory}
        containerId={containerId}
        goBack={() => goBack()}
      />
    );
  }
}
