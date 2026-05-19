import React, { StyleSheet, Platform, Dimensions } from "react-native";
import { Color, Constants } from "../../Common";

const { width, height } = Dimensions.get("window"),
  vw = width / 100,
  vh = height / 100;

export default StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  profile: {
    alignItems: "center",
    justifyContent: "center",
    width: width / 2,
    marginTop: vh * 2,
    marginBottom: vh * 2,
  },
  menu: {
    marginLeft: 4,
    marginTop: 8,
  },
  avatar: {
    height: vh * 15,
    ...Platform.select({
      android: {
        width: vh * 15,
      },
    }),
    resizeMode: "contain",
  },
  username: {
    color: "#2C3956",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    fontFamily: Constants.fontFamilyBold,
  },
  email: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  buttonTextIpad: {
    backgroundColor: "#ffffff",
    fontSize: 32,
    color: "#9B9B9B",
    padding: 20,
    paddingLeft: 40,
    paddingRight: 40,
    color: "#000000",
  },
  topBar: {
    width: width,
    height: 30,
    backgroundColor: Color.toolbarTint,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: 15,
    marginTop: 10,
  },
  iconTop: {
    marginTop: 10,
    marginLeft: 6,
  },
  content: {
    marginTop: 0.25 * height,
    position: "relative",
    flex: 1,
    marginBottom: 300,
  },
  scrollview: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    overflow: "hidden",
    height: 0.25 * height,
    alignItems: "center",
  },
  profileView: {
    position: "absolute",
    backgroundColor: "transparent",
    alignItems: "center",
    top: 50,
    left: 0,
    right: 0,
    width: null,
    height: 0.25 * height,
  },
  profileSection: {
    backgroundColor: "#FFF",
    marginTop: 15,
  },
  icon: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  buttonText: {
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#9B9B9B",
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    color: "#000000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
});
