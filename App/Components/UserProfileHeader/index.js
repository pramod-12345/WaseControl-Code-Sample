import React, { PureComponent } from "react";
import { View, Image } from "react-native";
import { Images } from "../../Common";
import styles from "./styles";

export default class UserProfileHeader extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image style={styles.avatar} source={{ uri: Images.person }} />
        </View>
      </View>
    );
  }
}
