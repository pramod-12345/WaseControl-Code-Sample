import React, { Component } from "react";
import { View } from "react-native";
import { LogIn } from "../Container";

export default class LoginScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: null,
  });

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <LogIn toNextScreen={() => navigate("pickup")} />
      </View>
    );
  }
}
