import React, { Component } from "react";
import { Categories } from "../Container";

export default class CategoriesScreen extends Component {
  static navigationOptions = {
    header: null,
  };

  render() {
    const { navigate } = this.props.navigation;
    return (
      <Categories
        onViewCategory={(item) =>
          navigate("category", { mainCategory: item, navigate: navigate })
        }
        navigation={this.props.navigation}
      />
    );
  }
}
