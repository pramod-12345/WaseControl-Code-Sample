import React from "react";
import { Image, Dimensions, TouchableOpacity, StyleSheet } from "react-native";
import { Images } from "../Common";

const styles = StyleSheet.create({
  toolbarIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    marginTop: 2,
    marginRight: 12,
    marginBottom: 12,
    marginLeft: 12,
    opacity: 0.8,
  },
  longBack: {
    width: 25,
    marginTop: 9,
  },
});

export const Back = (
  func,
  iconBack = { uri: Images.icons.back },
  tintColor = "#FFF"
) => (
  <TouchableOpacity onPress={func}>
    <Image
      source={iconBack}
      style={[{ tintColor: tintColor }, styles.toolbarIcon, styles.longBack]}
    />
  </TouchableOpacity>
);
