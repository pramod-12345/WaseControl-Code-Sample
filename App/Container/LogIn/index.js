import React, { Component } from "react";
import { View, Text } from "react-native";
import styles from "./style";
import { SignIn } from "../../Container";
import { Color, Languages } from "../../Common";

export default class LogIn extends Component {
  render() {
    const { toNextScreen } = this.props;
    return (
      <View style={styles.body}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              alignItems: "center",
              flex: 0.4,
              justifyContent: "center",
            }}
          >
            <Text style={[styles.textTab, { color: Color.tabbarTint }]}>
              {Languages("title")}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <SignIn toNextScreen={toNextScreen} tabLabel={Languages("title")} />
          </View>
        </View>
      </View>
    );
  }
}
