import { StyleSheet, Platform, Dimensions } from "react-native";
import { Constants } from "../../Common";
const { width } = Dimensions.get("window");

export default StyleSheet.create({
  body: {
    ...Platform.select({
      ios: {
        zIndex: 9,
      },
    }),
  },
  headerLabel: {
    color: "#333",
    fontSize: 28,
    fontFamily: Constants.fontHeader,
    marginBottom: 0,
    marginLeft: 14,
    position: "absolute",
    top: 50,
    ...Platform.select({
      android: {
        paddingTop: 2,
        fontSize: 24,
        top: 48,
      },
    }),
  },
  headerLabelIpad: {
    color: "#333",
    fontSize: 56,
    fontFamily: Constants.fontHeader,
    marginBottom: 0,
    marginLeft: 28,
    position: "absolute",
    top: 100,
    ...Platform.select({
      android: {
        paddingTop: 4,
        fontSize: 48,
        top: 96,
      },
    }),
  },
  headerImage: {
    marginBottom: 0,
    marginLeft: 15,
    width: (width * 1) / 3,
    resizeMode: "contain",
    position: "absolute",
    top: 56,
    ...Platform.select({
      android: {
        top: 52,
      },
    }),
  },
  headerImageIpad: {
    marginBottom: 0,
    marginLeft: 30,
    width: (width * 1) / 6,
    resizeMode: "contain",
    position: "absolute",
    top: 112,
    ...Platform.select({
      android: {
        top: 104,
      },
    }),
  },
  headerView: {
    width: width,
    height: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 3 },
    borderRadius: 2,
    elevation: 5,
  },
  headerViewIpad: {
    width: width,
    height: 150,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 6 },
    borderRadius: 4,
    elevation: 10,
  },
  flatlist: {
    paddingTop: 40,
  },
  homeMenu: {
    marginLeft: 4,
    position: "absolute",
    ...Platform.select({
      ios: {
        top: 12,
      },
      android: {
        top: 9,
      },
    }),
    zIndex: 9,
  },
  headerRight: {
    position: "absolute",
    zIndex: 9,
    top: 50,
    right: 10,
    ...Platform.select({
      android: {
        top: 46,
      },
    }),
  },
  headerRightIpad: {
    position: "absolute",
    zIndex: 18,
    top: 100,
    right: 20,
    ...Platform.select({
      android: {
        top: 92,
      },
    }),
  },
});
