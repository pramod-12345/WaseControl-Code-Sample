import React, { Component } from "react";
import {
  FlatList,
  View,
  Text,
  Alert,
  StyleSheet,
  Dimensions,
  BackHandler,
  Platform,
  Modal,
  Switch,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Languages } from "../../Common";
import Icon from "react-native-vector-icons/FontAwesome";
import Menu, { MenuItem } from "react-native-material-menu";
import * as Location from "expo-location";
import { RFValue } from "react-native-responsive-fontsize";
import ParallaxImage from "../../Components/Custom/react-native-parallax/ParallaxImage";
const { width, height } = Dimensions.get("window"),
  vw = width / 100,
  vh = height / 100;

export default class Pickup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingPickups: false,
      pickups: [],
      visible: false,
      pickupId: "",
      mode: "DRIVING",
      shouldEnterWeight: false,
      showAllContainers: true,
    };
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener("willFocus", () => {
      this.loadPickupRequests().then();
      this.setOriginPointAsCurrent();

      this.backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          BackHandler.exitApp();
          return true;
        }
      );
    });
  }

  setOriginPointAsCurrent = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.warn(`status : ${status}`);
    if (status !== "granted") {
      Alert.alert(Languages("error"), Languages("locationPermission"));
      console.error("Location permission not granted");
      return;
    }
    try {
      const location = await Location.getCurrentPositionAsync({});
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;
      console.log("Current latitude:", latitude);
      console.log("Current longitude:", longitude);
    } catch (error) {
      console.warn(`error : ${error}`);
      console.error("Error getting location:", error);
    }
  };

  componentWillUnmount() {
    this.backHandler?.remove();
  }

  loadPickupRequests = async () => {
    try {
      this.setState({ loadingPickups: true });
      // API call scrubbed for client demonstration
      setTimeout(() => {
        const mockPickups = [
          { id: 1, title: "Sample Pickup Location 1" },
          { id: 2, title: "Sample Pickup Location 2" },
        ];
        this.setState({ pickups: mockPickups, loadingPickups: false });
      }, 1000);
    } catch (err) {
      Alert.alert(Languages("pickupErrALT_T"), Languages("pickupErrALT_M"));
    }
  };

  renderTabComponent = (text) => {
    const { listExtraTab, tabText } = styles;

    return (
      <View style={listExtraTab}>
        <Text style={tabText}>{text}</Text>
      </View>
    );
  };

  selectMode = (pickupId) => {
    this.setState({ visible: true, pickupId: pickupId });
  };

  onPickupItemSelected = async () => {
    const { pickupId, mode, shouldEnterWeight, showAllContainers } = this.state;
    await SecureStore.setItemAsync("pickupId", pickupId.toString());
    await SecureStore.setItemAsync("mode", mode);
    await SecureStore.setItemAsync(
      "shouldEnterWeight",
      shouldEnterWeight.toString()
    );
    await SecureStore.setItemAsync(
      "showAllContainers",
      (!showAllContainers).toString()
    );
    const navigateAction = this.props.navigation.navigate({
      routeName: "map",
      action: this.props.navigation.navigate({
        routeName: "map",
        params: { fromPickupScreen: true },
      }),
    });
    this.setState({ visible: false });
    this.props.navigation.dispatch(navigateAction);
  };

  renderPickupItem = (i, pickup) => {
    const { pickupText } = styles;
    let displayText = pickup?.title || pickup?.id;

    return (
      <ParallaxImage
        key={pickup.id}
        onPress={() => this.selectMode(pickup.id)}
        style={Platform.isPad ? styles.imageIpad : styles.image}
        overlayStyle={styles.overlay}
        containerStyle={
          Platform.isPad ? [styles.containerStyleIpad] : [styles.containerStyle]
        }
        parallaxFactor={0.9}
        source={{
          uri: "https://images.pexels.com/photos/128421/pexels-photo-128421.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
        }}
      >
        <View style={{ flex: 0.9 }}>
          <Text style={pickupText}>{displayText}</Text>
        </View>
        <Icon
          name="chevron-right"
          size={20}
          color="#fff"
          style={{ flex: 0.1 }}
        />
      </ParallaxImage>
    );
  };

  logOut = async () => {
    try {
      this.menu.hide();
      await SecureStore.deleteItemAsync("secure_token");
      this.props.navigation.navigate("login");
    } catch (err) {
      Alert.alert(Languages("error"), Languages("cantLogOutALT_M"));
    }
  };

  render() {
    const { loadingPickups, pickups } = this.state;
    const { container, header, tabText, headerText } = styles;

    return (
      <View style={container}>
        <View style={header}>
          <Text
            allowFontScaling={false}
            style={{ ...tabText, ...headerText, fontSize: RFValue(16.4) }}
          >
            {Languages("PickupHD")}
          </Text>
          <Menu
            ref={(ref) => (this.menu = ref)}
            button={
              <Icon
                name="bars"
                size={20}
                color="#000"
                onPress={() => this.menu.show()}
              />
            }
            style={{ marginTop: vh * 3 }}
          >
            <MenuItem onPress={this.logOut} textStyle={{ fontSize: 16 }}>
              {Languages("signOut")}
            </MenuItem>
          </Menu>
        </View>
        <FlatList
          initialNumToRender={8}
          data={pickups}
          numColumns={1}
          ListEmptyComponent={() =>
            !loadingPickups && this.renderTabComponent(Languages("noPickups"))
          }
          renderItem={({ item, i }) => this.renderPickupItem(i, item)}
          refreshing={loadingPickups}
          onRefresh={() => this.loadPickupRequests()}
        />

        <Modal
          visible={this.state.visible}
          transparent={true}
          animationType="fade"
          hardwareAccelerated={true}
          onRequestClose={() => this.setState({ visible: false })}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                padding: 14,
                width: "94%",
                borderRadius: 10,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    width: "53%",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>{Languages("driveModeTxt")}</Text>
                  <Text>{Languages("weightModeTxt")}</Text>
                  <Text>{Languages("pickupContMode")}</Text>
                </View>

                <View
                  style={{
                    width: "18%",
                    marginLeft: Platform.OS === "ios" && 10,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        color:
                          this.state.mode === "BICYCLING" ? "black" : "#00d0b8",
                        fontWeight:
                          this.state.mode === "BICYCLING" ? "400" : "700",
                      }}
                    >
                      {Languages("car")}
                    </Text>
                    <Switch
                      trackColor={Platform.OS === "ios" && { true: "#00e6cb" }}
                      value={this.state.mode === "BICYCLING"}
                      onValueChange={(value) =>
                        this.setState({ mode: value ? "BICYCLING" : "DRIVING" })
                      }
                      style={{ marginHorizontal: 10 }}
                    />
                    <Text
                      style={{
                        color:
                          this.state.mode === "BICYCLING" ? "#00d0b8" : "black",
                        fontWeight:
                          this.state.mode === "BICYCLING" ? "700" : "400",
                      }}
                    >
                      {Languages("bike")}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: Platform.OS === "android" ? 3 : 10,
                    }}
                  >
                    <Text
                      style={{
                        color: this.state.shouldEnterWeight
                          ? "black"
                          : "#00d0b8",
                        fontWeight: this.state.shouldEnterWeight
                          ? "400"
                          : "700",
                      }}
                    >
                      {Languages("no")}{" "}
                    </Text>
                    <Switch
                      trackColor={Platform.OS === "ios" && { true: "#00e6cb" }}
                      value={this.state.shouldEnterWeight}
                      onValueChange={(value) =>
                        this.setState({ shouldEnterWeight: value })
                      }
                      style={{ marginHorizontal: 10 }}
                    />
                    <Text
                      style={{
                        color: this.state.shouldEnterWeight
                          ? "#00d0b8"
                          : "black",
                        fontWeight: this.state.shouldEnterWeight
                          ? "700"
                          : "400"
                      }}
                    >
                      {Languages("yes")}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: Platform.OS === "android" ? 3 : 10,
                    }}
                  >
                    <Text
                      style={{
                        color: this.state.showAllContainers
                          ? "black"
                          : "#00d0b8",
                        fontWeight: this.state.showAllContainers
                          ? "400"
                          : "700",
                      }}
                    >
                      {Languages("all")}{" "}
                    </Text>
                    <Switch
                      trackColor={Platform.OS === "ios" && { true: "#00e6cb" }}
                      value={this.state.showAllContainers}
                      onValueChange={(value) =>
                        this.setState({ showAllContainers: value })
                      }
                      style={{ marginHorizontal: 10 }}
                    />
                    <Text
                      style={{
                        color: this.state.showAllContainers
                          ? "#00d0b8"
                          : "black",
                        fontWeight: this.state.showAllContainers
                          ? "700"
                          : "400",
                      }}
                    >
                      {Languages("pickup")}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ marginTop: 8 }}>
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "grey",
                      padding: 12,
                      borderRadius: RFValue(24),
                    }}
                    onPress={() => this.setState({ visible: false })}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: RFValue(15),
                        fontWeight: "700",
                      }}
                    >
                      {Languages("cancel")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#00d0b8",
                      padding: 12,
                      marginHorizontal: 20,
                      borderRadius: RFValue(24),
                    }}
                    onPress={this.onPickupItemSelected}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: RFValue(15),
                        fontWeight: "700",
                      }}
                    >
                      {Languages("continue")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#fff",
    height: "8%",
    alignItems: "center",
    flexDirection: "row",
    marginTop: "5%",
    marginBottom: "1%",
  },
  tabText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  headerText: {
    fontSize: RFValue(16.4),
    letterSpacing: 1.2,
    flex: 0.95,
    textAlign: "center",
    color: "#000",
  },
  pickupTextLabel: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontFamily: Constants.fontFamilyBold,
  },
  pickupText: {
    fontSize: 16,
    fontFamily: Constants.fontFamilyBold,
    color: "#fff",
    textAlign: "center",
  },
  listExtraTab: {
    backgroundColor: "#d5d5d5",
    height: vh * 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: vh * 2.5,
  },
  image: {
    width: width - 30,
    marginLeft: 15,
    height: 75,
    marginBottom: 26,
    borderRadius: (vh * vw) / 2.5,
  },
  imageIpad: {
    width: width - 60,
    alignItems: "center",
    marginLeft: 30,
    height: 150,
    marginBottom: 60,
    borderRadius: (vh * vw) / 1.25,
  },
  overlay: {
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    flex: 1,
  },
  containerStyle: {
    shadowColor: "#000",
    backgroundColor: "transparent",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  containerStyleIpad: {
    shadowColor: "#000",
    backgroundColor: "transparent",
    shadowOpacity: 0.8,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 24 },
    elevation: 20,
  },
});
