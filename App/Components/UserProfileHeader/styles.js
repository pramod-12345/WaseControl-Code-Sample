import { StyleSheet, Dimensions } from "react-native";
const { width } = Dimensions.get("window");
import { Color } from "../../Common";

export default StyleSheet.create({
  container: {
    marginBottom: 2,

    borderRadius: width / 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  fullName: {
    fontWeight: "600",
    color: Color.blackTextPrimary,
    backgroundColor: "transparent",
    fontSize: 30,
    marginBottom: 6,
  },
  address: {
    backgroundColor: "transparent",
    fontSize: 15,
    color: "#9B9B9B",
    fontWeight: "600",
  },
  textContainer: {
    marginLeft: 20,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: width / 2,
    overflow: "hidden",
  },
  avatar: {
    height: width / 5,
    width: width / 5,
  },
});
