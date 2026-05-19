import React, { StyleSheet } from "react-native";
import { Color, Device } from "../../Common";

const { isIOS, isIphoneX } = Device;

export default StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 200,
    paddingLeft: 0,
    zIndex: 9999,
    justifyContent: "center",
  },
  tab: {
    paddingBottom: 10,
    borderBottomWidth: 0,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  activeTab: {
    height: 3,
    backgroundColor: Color.main,
  },
  textTab: {
    fontWeight: isIOS ? "600" : "bold",
    fontSize: 35,
  },
  toolbar: {
    left: 14,
    alignSelf: "flex-start",
  },
});
