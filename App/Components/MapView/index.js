import React, { Component } from "react";
import {
  Text,
  View,
  Modal,
  Image,
  Alert,
  Animated,
  FlatList,
  TextInput,
  Dimensions,
  ScrollView,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import styles from "./styles";
import { setContainerArr } from "../../Redux/actions";
import { AnimatedHeader, Spinkit } from "../index";
import { Color, Config, Languages, Device } from "../../Common";

import { connect } from "react-redux";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import _, { cloneDeep, isArray, remove } from "lodash";
import Icon from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import MapView, { Marker, Callout, MarkerAnimated } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import Menu, { MenuDivider, MenuItem } from "react-native-material-menu";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  updateContainerTypeLanguageKey,
  updatefractionLanguageKey,
} from "../../Common/Languages";

const { width, height } = Dimensions.get("window"),
  vw = width / 100,
  vh = height / 100;

const ASPECT_RATIO = width / height;
export const LATITUDE_DELTA = 0.0422;
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 20000,
  // timeout: 11000,
  maximumAge: 4000,
};
const ANCHOR = { x: 0.5, y: 0.5 };
const CENTER = { x: 0, y: 0 };

const { baseUrl, getPickupContainers, distanceMatrix, getAllContainers } =
    Config.URL,
  { mapKey } = Config.keys,
  {
    emptiedTodayPinColor,
    defaultPinColor,
    multiContainersPinColor,
    multiContainersPinColorIOS,
  } = Color.map,
  { isAndroid, isIOS, isPad } = Device,
  increment = 25,
  isAppPaid = false,
  ImagesPath = "../../../assets/Images/",
  loadingImage = require(ImagesPath + "loadingImg.gif");

let startingIndexForRoute = 0,
  isDirectionsModeSingle = false,
  tooFarAlertShown = false,
  allContainersAlertShown = false;

class Index extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: null,
  });

  constructor(props) {
    super(props);
    this.markers = [];
    this.state = {
      myPosition: null,
      region: null,
      containers: [],
      id: null,
      containerIndex: null,
      weight: "",
      note: "",
      containersToEmpty: "-",
      containersEmptied: "-",
      areContainersReady: false,
      canGetDirections: false,
      origin: {},
      destination: {},
      fetchedLastRoute: false,
      modalVisible: false,
      list: [],
      isDirectionsModeSingle: false,
      containersForSingleRoute: [],
      textLoader: true,
      mapLoader: false,
      emptyModalShow: false,
      scrollY: new Animated.Value(0),
      container: {},
      printText: true,
      isPicLoading: true,
      initialLatLong: null,
      drivingMode: "",
      isTrack: false,
      shouldVisible: false,
      isInitialMapLoad: true,
      shouldAskWeight: false,
      showAllContainers: false,
      allContainers: [],
      contCountLoader: true,
      currentLocation: null,
      heading: null,
      isCentered: false,
      isMapToach: false,
      mapDelta: {
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      mapType: "terrain",
    };
    this.intervalId = null;
    this.mapRef = React.createRef();
    this.marker = null;
  }

  animateToNewRegion = (data) => {
    if (this.mapRef.current) {
      this.mapRef.current.animateToRegion(data, 1000); // 1.5-second animation
    }
  };

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Clear the interval.
      this.intervalId = null; // Reset the interval ID.
    }
  }

  async requestPermissions() {
    await Location.getCurrentPositionAsync({}).then((coord) => {
      let region = {
        latitude: coord.coords.latitude,
        longitude: coord.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      if (this.marker) {
        this.marker.animateMarkerToCoordinate(
          {
            latitude: coord.coords.latitude,
            longitude: coord.coords.longitude,
          },
          1000
        );
      } else {
        this.setState({
          currentLocation: region,
        });
      }
      this.setState(
        {
          heading: coord.coords.heading,
          myPosition: {
            latitude: coord.coords.latitude,
            longitude: coord.coords.longitude,
          },
          initialLatLong: region,
        },
        () => {
          this.checkIfLocationIsCentered();
        }
      );
      if (!this.state.isMapToach) {
        this.animateToNewRegion({
          ...region,
          latitudeDelta: this.state.mapDelta.latitudeDelta, // Keep the current zoom level
          longitudeDelta: this.state.mapDelta.longitudeDelta, // Keep the current zoom level
        });
      }
    });
  }

  checkIfLocationIsCentered = () => {
    const { currentLocation } = this.state;
    if (currentLocation && this.mapRef.current) {
      this.mapRef.current.getCamera().then((camera) => {
        const { center } = camera;
        const isCentered =
          Math.abs(center.latitude - currentLocation.latitude) < 0.0001 &&
          Math.abs(center.longitude - currentLocation.longitude) < 0.0001;
        this.setState({ isCentered });
      });
    }
  };

  async initialMount() {
    this.setOriginPointAsCurrent();
    this.setState({
      drivingMode: await SecureStore.getItemAsync("mode"),
      shouldAskWeight: await SecureStore.getItemAsync("shouldEnterWeight"),
      showAllContainers: await SecureStore.getItemAsync("showAllContainers"),
    });
    this.state.areContainersReady &&
      this.setState({
        areContainersReady: false,
        containersToEmpty: "-",
        containersEmptied: "-",
        myPosition: null,
        fetchedLastRoute: false,
        isDirectionsModeSingle: false,
        contCountLoader: true,
        textLoader: true,
        emptyModalShow: false,
        region: null,
      });

    if (
      this.props.navigation &&
      this.props.navigation.state &&
      this.props.navigation.state.params &&
      this.props.navigation.state.params.fromPickupScreen
    ) {
      tooFarAlertShown = false;
      allContainersAlertShown = false;
      this.props.navigation.state.params = null;
    }
    startingIndexForRoute = 0;
    const pickupId = await SecureStore.getItemAsync("pickupId");
    this.getContainersWithToken(getPickupContainers + pickupId);
    this.state.showAllContainers == "true" &&
      this.getContainersWithToken(getAllContainers);

    this.mapBackHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        this.props.navigation.navigate("pickup");
        this.setState({ emptyModalShow: false });
        if (this.state.printText === false) {
          this.setState({ emptyModalShow: false });
        } else {
          this.hideText();
        }
        return true;
      }
    );
  }
  componentDidMount() {
    this.props.navigation.addListener("willFocus", async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      this.props.setContainerArr("mapScreen");
      this.initialMount();
      this.intervalId = setInterval(async () => {
        if (this.props?.containersArray != "mapScreen") {
          clearInterval(this.intervalId);
        }
        this.requestPermissions();
      }, 4000);
    });
  }

  showText = (containerId, containerIndex) => {
    const { navigate } = this.props.navigation;
    const { selectedCategory } = this.props;
    this.setState({
      id: containerId,
      container: selectedCategory,
      containerIndex,
      modalVisible: false,
      areContainersReady: true,
      loading: false,
    });
    this.state.shouldAskWeight == "true"
      ? this.setState({ emptyModalShow: true, textLoader: true })
      : this.emptyContainer();
    startingIndexForRoute = 0;
    // navigate('category', { containerId, navigate: navigate })
  };

  cantEmptyAlert = () => {
    Alert.alert(Languages("cantEmptyALT_T"), Languages("cantEmptyALT_M"));
  };

  renderCalloutMaker = (item, index) => {
    return (
      <Callout
        onPress={() => {
          // this.setState({ loading: true });
          this.markers[item?.id].hideCallout();
          if (item.empty_today) {
            this.cantEmptyAlert();
          } else {
            this.setState({ textLoader: true, loading: true });
            this.showText(item.id, index);
          }
        }}
      >
        <View
          activeOpacity={0.9}
          disabled={true}
          style={styles.slideInnerContainer}
          key={`calloutMarker-${index + 1}`}
        >
          <View style={styles.row}>
            <Text style={isPad ? [styles.titleIpad] : [styles.title]}>
              {Languages("detailsLBL")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={isPad ? styles.textIpad : styles.text}>
              {Languages("sensorIdLBL") + item.id || "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={isPad ? styles.textIpad : styles.text}>
              {Languages("fillingDegLBL") + item.waste_distance || "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={isPad ? styles.textIpad : styles.text}>
              {Languages("addressLBL") + item.address || "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={isPad ? styles.textIpad : styles.text}>
              {Languages("contFracLBL") +
                (item[updatefractionLanguageKey()] || Languages("notFilled"))}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={isPad ? styles.textIpad : styles.text}>
              {Languages("contTypeLBL") +
                (item[updateContainerTypeLanguageKey()] ||
                  Languages("notFilled"))}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={isPad ? styles.textIpad : styles.text}>
              {Languages("batteryLBL")}
              {item?.sensor?.battery}%
            </Text>
          </View>
          <View style={styles.wrapButton}>
            <TouchableOpacity
              style={isPad ? styles.btnLogInIpad : styles.btnLogIn}
            >
              {this.state.loading ? (
                <Spinkit />
              ) : (
                <Text
                  style={isPad ? styles.btnLogInTextIpad : styles.btnLogInText}
                >
                  {Languages("emptyBTN")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Callout>
    );
  };

  getEmptiedContainersCount = (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        data.forEach((cont) => {
          cont.empty_today && count++;
        });
        resolve(count);
      } catch (err) {
        reject((err && err.message) || err);
      }
    });
  };

  getContainersWithToken = async (endpointAddress) => {
    const token = await SecureStore.getItemAsync("secure_token");
    const isConnected = await SecureStore.getItemAsync("is_connection");
    // const pickupId = await SecureStore.getItemAsync("pickupId");
    const { containers, allContainers } = this.state;

    //if containers exists then delete them.

    endpointAddress == getAllContainers
      ? allContainers.length > 0 && this.setState({ allContainers: [] })
      : containers.length > 0 && this.setState({ containers: [] });

    if (isConnected === "true") {
      let deleteToken = 0;

      const settings = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      let requestUrl = baseUrl + endpointAddress;
      const data = await fetch(requestUrl, settings)
        .then((response) => response.json())
        .then(async (json) => {
          if (json && json.error) {
            deleteToken = 1;
          } else {
            if (
              json &&
              json.message &&
              json.message === "internal server error"
            ) {
              Alert.alert(
                Languages("contErrResALT_T"),
                Languages("errResALT_M")
              );
            } else if (isArray(json)) {
              if (json.length === 0) Alert.alert(Languages("noContainersALT"));
              if (!isAppPaid) {
                // json.length > 25 && this.allContainersAlert();
                // json = json.slice(0, 150); //only first 25 containers.
                let arr = [];
                for (let i = 0; i < json.length; i++) {
                  arr.push(json[i]);
                }

                let containersEmptied = await this.getEmptiedContainersCount(
                  arr
                );
                // console.log('endpoint cond =-=-=-=-=-', endpointAddress == getAllContainers);
                // endpointAddress != getAllContainers && this.setState({ containersToEmpty: arr.length - containersEmptied })
                this.setState({
                  // containers: arr,
                  [endpointAddress == getAllContainers
                    ? "allContainers"
                    : "containers"]: arr,
                  canGetDirections: arr.length !== 0,
                  areContainersReady: !this.state.isDirectionsModeSingle,
                  // containersToEmpty: endpointAddress != getAllContainers && arr.length - containersEmptied,
                  containersEmptied,
                  containersForSingleRoute: arr,
                  // textLoader: false,
                });
                endpointAddress != getAllContainers &&
                  this.setState({
                    containersToEmpty: arr.length - containersEmptied,
                    contCountLoader: false,
                  });
              } else {
                this.setState({
                  [endpointAddress == getAllContainers
                    ? "allContainers"
                    : "containers"]: json,
                  containersForSingleRoute: cloneDeep(json),
                });
                json.length > 0 &&
                  (this.state.isDirectionsModeSingle
                    ? this.getNextRoute()
                    : this.sortContainersForRoutes());
              }
              this.setState({ textLoader: false });
            }
          }
        })
        .catch((e) => {
          Alert.alert(Languages("contErrResALT_T"));
        });
      if (deleteToken === 1) {
        await SecureStore.deleteItemAsync("secure_token");
        this.props.navigation.navigate("login");
      }
    }
  };

  sortContainersForRoutes = async (currentPosition) => {
    try {
      return new Promise(async (resolve, reject) => {
        const isConnected = await SecureStore.getItemAsync("is_connection"),
          {
            containers,
            myPosition,
            containersForSingleRoute,
            isDirectionsModeSingle,
          } = this.state;
        if (!myPosition && !isDirectionsModeSingle) {
          setTimeout(this.sortContainersForRoutes, 300);
        } else if (isDirectionsModeSingle) {
          let startingIndex = 0;
          const originObj = isDirectionsModeSingle
            ? currentPosition || myPosition
            : myPosition;
          const { latitude, longitude } = originObj;
          const containersMain = cloneDeep(
            isDirectionsModeSingle ? containersForSingleRoute : containers
          );

          while (startingIndex < containersMain.length) {
            let matrixDestinations = "",
              containersCopy = cloneDeep(containersMain).slice(
                startingIndex,
                startingIndex + increment
              );
            containersCopy.map((container) => {
              matrixDestinations += `${container.lat},${container.lng}|`;
            });

            if (isConnected === "true") {
              await fetch(
                distanceMatrix +
                  mapKey +
                  `&origins=${latitude},${longitude}&destinations=${matrixDestinations}`
              )
                .then((response) => response.json())
                .then((json) => {
                  json &&
                    json.rows &&
                    json.rows[0].elements &&
                    json.rows[0].elements.map((item, i) => {
                      Object.assign(containersMain[i + startingIndex], {
                        distanceFromOrigin:
                          item.distance && item.distance.value,
                      });
                    });
                })
                .catch((err) => {
                  Alert.alert(
                    Languages("pickupErrALT_M"),
                    Languages("distanceErrALT_M")
                  );
                });
            }
            startingIndex += increment;
          } //end of while

          let sortedContainers = remove(containersMain, (c) => {
            return typeof c.distanceFromOrigin === "number";
          });
          sortedContainers.sort(
            (a, b) => a.distanceFromOrigin - b.distanceFromOrigin
          );

          if (isDirectionsModeSingle) {
            let uniqueContainers = sortedContainers.filter((container, i) => {
              if (i !== sortedContainers.length - 1) {
                return (
                  container.lat !== sortedContainers[i + 1].lat ||
                  container.lng !== sortedContainers[i + 1].lng
                );
              }
              return true;
            });
            return resolve(uniqueContainers);
          }

          let finalContainers =
            sortedContainers.length === 0 ? containers : sortedContainers;
          let containersEmptied = await this.getEmptiedContainersCount(
            finalContainers
          );

          startingIndexForRoute = 0;
          this.setState({
            containers: finalContainers,
            canGetDirections: sortedContainers.length !== 0,
            areContainersReady: !isDirectionsModeSingle,
            containersToEmpty: finalContainers.length - containersEmptied,
            containersEmptied,
          });
        }
      });
    } catch (err) {
      Alert.alert(Languages("pickupErrALT_M"), Languages("distanceErrALT_M"));
    }
  };

  getNextRoute = async () => {
    try {
      this.setState({ mapLoader: true });
      const { containers, destination } = this.state;
      let currentPosition = await this.setOriginPointAsCurrent(true);
      // let currentPosition = destination;
      let sortedContainers = await this.sortContainersForRoutes(
        currentPosition
      );
      if (sortedContainers.length === 0) {
        Alert.alert(
          Languages("emptiedLastALT_T"),
          Languages("emptiedLastALT_M")
        );
        this.setState({
          areContainersReady: true,
          fetchedLastRoute: true,
          origin: currentPosition,
          mapLoader: false,
        });
      } else {
        let destinationCoOrdinate = {
          latitude: parseFloat(sortedContainers[0] && sortedContainers[0].lat),
          longitude: parseFloat(sortedContainers[0] && sortedContainers[0].lng),
          id: containers[0].id,
        };

        sortedContainers = sortedContainers.splice(1);

        this.setState({
          containersForSingleRoute: sortedContainers,
          origin: currentPosition,
          destination: destinationCoOrdinate,
          areContainersReady: true,
          canGetDirections: true,
          isDirectionsModeSingle: true,
          mapLoader: false,
        });
        // this.state.showAllContainers == 'false' && this.renderDirections();
      }
    } catch (err) {
      this.setState({ mapLoader: false });
      Alert.alert(Languages("nextRouteErrALT_M"), Languages("wrong"));
    }
  };

  renderDirections = (coOrdinates) => {
    try {
      if (this.state.isDirectionsModeSingle) {
        const { origin, destination, drivingMode } = this.state;
        return (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={mapKey}
            precision={"high"} //low
            strokeWidth={2}
            strokeColor={"red"}
            mode={drivingMode}
            // onError={err => {Alert.alert(Languages('directionErr'),`${err}`)}}
            onReady={(res) => {
              this.mapRef.current.fitToCoordinates(res && res.coordinates, {});
            }}
            // onStart={res => {}}
          />
        );
      } else {
        let parts = [];
        // let directionPoints = coOrdinates.slice(startingIndexForRoute, startingIndexForRoute + 40);
        // startingIndexForRoute += (40 - 1);
        for (let i = 0, max = 25 - 1; i < coOrdinates.length; i = i + max) {
          parts.push(coOrdinates.slice(i, i + max + 1));
        }
        let service_options = [];
        for (let i = 0; i < parts.length; i++) {
          let waypoints = [];
          for (let j = 0; j < parts[i].length; j++) waypoints.push(parts[i][j]);
          service_options.push({
            origin: parts[i][0],
            destination: parts[i][parts[i].length - 1],
            waypoints: waypoints,
          });
        }
        return service_options.map((item) => {
          return (
            <MapViewDirections
              origin={item.origin}
              destination={item.destination}
              waypoints={item.waypoints} //removes first and last element from directionPoints.
              optimizeWaypoints={true}
              apikey={mapKey}
              precision={"high"} //low
              strokeWidth={2}
              strokeColor={"red"}
              mode={this.state.drivingMode}
              resetOnChange={false}
              // onError={(err) => Alert.alert(Languages("directionsErr"))}
              // onReady={res => {
              //   !isIOS && (res ? this.map.fitToCoordinates(res.coordinates, {}) : this.tooFarAlert())
              // }}
              // onStart={res => {}}
            />
          );
        });
      }
    } catch (err) {
      Alert.alert(Languages("error"), Languages("directionsErr"));
    }
  };

  tooFarAlert = () => {
    if (!tooFarAlertShown) {
      tooFarAlertShown = true;
      Alert.alert(Languages("directionsErr"), Languages("tooFar"));
    }
  };

  allContainersAlert = () => {
    if (!allContainersAlertShown) {
      allContainersAlertShown = true;
      Alert.alert(
        Languages("allRoutesALT_T"),
        "",
        [
          { text: Languages("no"), style: "cancel" },
          {
            text: Languages("yes"),
            onPress: () => {
              Alert.alert(Languages("contact"));
            },
            style: "default",
          },
        ],
        { cancelable: false }
      );
    }
  };

  onOneOfMultipleMarkerPressed = (list) => {
    startingIndexForRoute = 0;
    this.setState({ modalVisible: true, list, areContainersReady: false });
  };

  mapMarkers = (
    containers,
    latitudeDelta,
    longitudeDelta,
    multiContainersAtPoint,
    determineEmptied,
    isAllContainers
  ) => {
    return containers?.map((item, index) => {
      // console.log(item?.id);
      if (!item.lat) return;
      let list,
        coordinate = {
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lng),
          latitudeDelta,
          longitudeDelta,
        };
      let isOneOfMultiple = Object.keys(multiContainersAtPoint).includes(
        item.id.toString()
      );
      if (isOneOfMultiple)
        list = [
          ...multiContainersAtPoint[item.id],
          { id: item.id, index, empty_today: item.empty_today },
        ];
      let OneOfMultiplePinColor = determineEmptied.includes(item?.id)
        ? emptiedTodayPinColor
        : multiContainersPinColor;
      pinColor = isOneOfMultiple
        ? OneOfMultiplePinColor
        : item?.empty_today
        ? emptiedTodayPinColor
        : defaultPinColor;

      return (
        <Marker
          key={item?.id}
          ref={(ref) => {
            this.markers[item?.id] = ref;
          }}
          anchor={ANCHOR}
          centerOffset={CENTER}
          coordinate={coordinate}
          pinColor={pinColor}
          style={[styles.marker]}
          tracksViewChanges={false}
          zIndex={item.id}
          position={"absolute"}
          pointerEvents="auto" //none
          onPress={() => {
            isOneOfMultiple && this.onOneOfMultipleMarkerPressed(list);
          }}
        >
          {isAllContainers && (
            <MaterialCommunityIcons name="map-marker" size={32} color="gray" />
          )}
          {!isOneOfMultiple && this.renderCalloutMaker(item, index)}
        </Marker>
      );
    });
  };

  renderMarkers = (containers, isAllContainers = false) => {
    // console.log('=-=-=-=-=-=-=-=-=-=-=-=-=', containers.length);
    const { latitudeDelta, longitudeDelta } = this.props;
    // const { containers } = this.state;
    let multiContainersAtPoint = {},
      determineEmptied = [],
      pinColor;
    try {
      containers &&
        containers?.length > 0 &&
        containers?.map((container, i) => {
          let flag = 0,
            emptiedflag = 0,
            arr = [];
          containers?.map((cont, j) => {
            if (
              container?.id !== cont?.id &&
              container?.lat === cont?.lat &&
              container?.lng === cont?.lng
            ) {
              arr.push({
                id: cont.id,
                index: j,
                empty_today: cont.empty_today,
                address: cont?.address,
              });
              !cont.empty_today && (emptiedflag = 1);
              flag = 1;
            }
          });
          if (flag === 1) {
            Object.assign(multiContainersAtPoint, { [container.id]: arr });
            if (emptiedflag === 0 && container.empty_today) {
              determineEmptied.push(container.id);
            }
          }
        });
    } catch (e) {
      Alert.alert("catch block");
      alert(e.message || e);
    }

    return (
      isArray(containers) &&
      this.mapMarkers(
        containers,
        latitudeDelta,
        longitudeDelta,
        multiContainersAtPoint,
        determineEmptied,
        isAllContainers
      )
    );
  };

  setOriginPointAsCurrent = (returnData = false) => {
    return new Promise(async (resolve, reject) => {
      try {
        let permissionStatus;
        if (isAndroid) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          permissionStatus = status;
        }
        if (permissionStatus !== "granted" && isAndroid) {
          Alert.alert(Languages("error"), Languages("locationPermission"));
        } else if (1) {
          const location = await Location?.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          });
          const latitude = location.coords.latitude;
          const longitude = location.coords.longitude;
          if (returnData) {
            return resolve({
              latitude,
              longitude,
              heading: location.coords.heading,
            });
          }
          let region = {
            latitude,
            longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
            heading: location.coords.heading,
          };
          this.setState({
            myPosition: {
              latitude,
              longitude,
              heading: location.coords.heading,
            },
            region: region,
            initialLatLong: region,
          });
        }
      } catch (err) {
        Alert.alert(Languages("error"), Languages("currentLocALT_M"));
      }
    });
  };

  confirmEmptyingAllContainers = () => {
    Alert.alert(
      Languages("confirm"),
      Languages("emptyAllALT_M"),
      [
        { text: Languages("no"), style: "cancel" },
        {
          text: Languages("yes"),
          onPress: this.emptyAllContainers,
          style: "default",
        },
      ],
      { cancelable: false }
    );
  };

  emptyAllContainers = async () => {
    try {
      const token = await SecureStore.getItemAsync("secure_token");
      const isConnected = await SecureStore.getItemAsync("is_connection");
      if (isConnected === "true") {
        const settings = {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };

        await fetch(baseUrl + `user/pickup-note`, settings)
          .then((res) => {
            res.status === 200
              ? Alert.alert(Languages("success"), Languages("routeFinalized"), [
                  {
                    text: Languages("yes"),
                    onPress: () => {
                      this.props.navigation.navigate("categories");
                    },
                    style: "default",
                  },
                ])
              : Alert.alert(Languages("error"), Languages("emptyContErrALT_M"));
          })
          .catch((err) => {
            Alert.alert(Languages("error"), Languages("emptyContErrALT_M"));
          });
      }
    } catch (err) {
      Alert.alert(Languages("error"), Languages("emptyContErrALT_M"));
    }
  };

  logOut = async () => {
    this.menu && this.menu.hide();
    await SecureStore.deleteItemAsync("secure_token");
    this.props.navigation && this.props.navigation.navigate("login");
  };

  toggleDirectionsMode = (isDirectionsModeSingleParam) => {
    this.menu && this.menu.hide();
    this.setState({ isDirectionsModeSingle: isDirectionsModeSingleParam });
    // isDirectionsModeSingle = isDirectionsModeSingleParam;
    !isDirectionsModeSingleParam && this.sortContainersForRoutes();
    isDirectionsModeSingleParam && this.getNextRoute();
  };

  renderNextDirection = () => {
    this.menu && this.menu.hide();
    this.getNextRoute();
  };

  renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>{Languages("directionsHD")}</Text>
        {this.state.isMapToach && (
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => {
              this.setState({ isMapToach: false });
              this.animateToNewRegion({
                ...this.state.currentLocation,
                latitudeDelta: this.state.mapDelta.latitudeDelta, // Keep the current zoom level
                longitudeDelta: this.state.mapDelta.longitudeDelta, // Keep the current zoom level
              });
            }}
          >
            <Text
              style={[
                isPad ? styles.btnLogInTextIpad : styles.btnLogInText,
                { fontSize: 14 },
              ]}
            >
              {" "}
              Re-center{" "}
            </Text>
          </TouchableOpacity>
        )}
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
          <MenuItem
            onPress={() => this.toggleDirectionsMode(true)}
            textStyle={styles.menuItemText}
            disabled={this.state.isDirectionsModeSingle} //isDirectionsModeSingle
          >
            {Languages("singleMode")}
          </MenuItem>
          <MenuItem
            onPress={() => this.toggleDirectionsMode(false)}
            textStyle={styles.menuItemText}
            disabled={!this.state.isDirectionsModeSingle}
          >
            {Languages("allMode")}
          </MenuItem>
          {this.state.isDirectionsModeSingle && (
            <MenuItem
              onPress={this.renderNextDirection}
              textStyle={styles.menuItemText}
            >
              {Languages("nextDirection")}
            </MenuItem>
          )}
          <MenuDivider />
          <MenuItem onPress={this.logOut} textStyle={styles.menuItemText}>
            {Languages("signOut")}
          </MenuItem>
        </Menu>
      </View>
    );
  };

  calloutList = (i, container) => {
    return (
      <TouchableOpacity
        style={styles.calloutListItem}
        onPress={() =>
          container.empty_today
            ? this.cantEmptyAlert()
            : this.showText(container.id, container.index)
        }
      >
        <Text
          style={[
            isPad ? styles.textIpad : styles.calloutListItemText,
            { color: container.empty_today ? "#0aa054" : "#f73340" },
          ]}
        >
          {Languages("sensorIdLBL") + (container.id || "-")}
        </Text>
        <Text>{container?.address}</Text>
      </TouchableOpacity>
    );
  };

  hideText = () => {
    if (this.state.id) {
      this.setState({ emptyModalShow: false, textLoader: false });
    } else this.setState({ printText: false });
  };

  showTextModal = (containerId) => {
    this.setState({ id: containerId });
    this.setState({ printText: true });
  };

  emptyContainer = async () => {
    this.setState({ textLoader: true });
    try {
      // if (!this.state.weight) {
      const token = await SecureStore.getItemAsync("secure_token");
      const isConnected = await SecureStore.getItemAsync("is_connection");
      if (isConnected === "true") {
        const settings = {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            container_id: this.state.id,
            weight: this.state.weight,
            note: this.state.note,
          }),
        };

        const data = await fetch(baseUrl + `container/pickup-note`, settings)
          .then(async (response) => {
            this.setState({ textLoader: false, mapLoader: false });
            if (response.status === 200) {
              Alert.alert(
                Languages("success"),
                Languages("emptiedSuccessALT_M")
              );
            }
            this.hideText();
            const pickupId = await SecureStore.getItemAsync("pickupId");
            this.getContainersWithToken(getPickupContainers + pickupId);
            this.state.showAllContainers == "true" &&
              this.getContainersWithToken(getAllContainers);
          })
          .catch((e) => {
            Alert.alert(Languages("error"));
          });
        const updatedArr = this.state.containers?.map((obj) => {
          return obj.id == this.state.id ? { ...obj, empty_today: true } : obj;
        });

        this.setState({
          containers: updatedArr,
          areContainersReady: true,
          containersToEmpty: this?.state?.containersToEmpty - 1,
          containersEmptied: this?.state?.containersEmptied + 1,
          emptyModalShow: false,
          canGetDirections: true,
        });
      }
    } catch (err) {
      Alert.alert(Languages("cantEmptyContALT_T"), Languages("pickupErrALT_M"));
    }
    this.setState({ textLoader: false });
  };

  onRegionChangeComplete = (newRegion) => {
    this.checkIfLocationIsCentered();
    this.setState({
      mapDelta: {
        latitudeDelta: newRegion.latitudeDelta,
        longitudeDelta: newRegion.longitudeDelta,
      },
    });
  };

  onPressMapType = () => {
    if (this.state.mapType === "terrain") {
      this.setState({ mapType: "satellite" });
    } else {
      this.setState({ mapType: "terrain" });
    }
  };

  mapTypeName = () => {
    if (this.state.mapType === "terrain") {
      return Languages("satellite");
    } else {
      return Languages("map");
    }
  };

  render() {
    const {
      containers,
      areContainersReady,
      region,
      myPosition,
      containersToEmpty,
      id,
      initialLatLong,
      canGetDirections,
      containersEmptied,
      fetchedLastRoute,
      modalVisible,
      list,
      isDirectionsModeSingle,
      container,
      isPicLoading,
    } = this.state;
    let timesToLoop, coOrdinates;

    if (areContainersReady && myPosition) {
      //keep coOrdinates in state.
      coOrdinates = [myPosition];
      containers?.map((container) => {
        if (container.lat && container.lng) {
          let coOrdinate = {
            latitude: parseFloat(container.lat),
            longitude: parseFloat(container.lng),
            id: container.id,
          };
          coOrdinates.push(coOrdinate);
        }
      });

      coOrdinates = coOrdinates.filter((coOrdinate, i) => {
        if (i !== coOrdinates.length - 1) {
          return (
            coOrdinate.latitude !== coOrdinates[i + 1].latitude ||
            coOrdinate.longitude !== coOrdinates[i + 1].longitude
          );
        }
        return true;
      });

      timesToLoop = isDirectionsModeSingle
        ? 1
        : !isAppPaid
        ? 1
        : Math.ceil(coOrdinates.length / increment);
    }

    return (
      <>
        <View style={styles.container}>
          {this.renderHeader()}
          <View style={{ flex: 1 }}>
            <View style={styles.mapTypeContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={this.onPressMapType}
                style={styles.mapModebutton}
              >
                <Text style={styles.typeTextStyle}>{this.mapTypeName()}</Text>
              </TouchableOpacity>
            </View>
            <MapView
              toolbarEnabled={false}
              mapType={this.state.mapType}
              region={region}
              tracksViewChanges={true}
              style={styles.map}
              ref={this.mapRef}
              showsUserLocation={true}
              showsMyLocationButton={true}
              userLocationAnnotationTitle={Languages("here")}
              initialRegion={initialLatLong}
              onRegionChangeComplete={this.onRegionChangeComplete}
              onTouchStart={() => {
                this.setState({ isMapToach: true });
              }}
            >
              {this.renderMarkers(this.state.containers)}
              {this.state.showAllContainers == "true" &&
                this.renderMarkers(this.state.allContainers, true)}
              {myPosition &&
                areContainersReady &&
                (isDirectionsModeSingle ? !fetchedLastRoute : true) &&
                ((canGetDirections &&
                  Array.from(Array(timesToLoop)).map(() => {
                    return this.renderDirections(coOrdinates);
                  })) ||
                  this.tooFarAlert())}
            </MapView>

            <View style={styles.counterView}>
              <View style={styles.counterViewChild}>
                <Text style={styles.counterTextLabel}>
                  {Languages("contEmptyLB")}
                </Text>
                {this.state.contCountLoader ? (
                  <Spinkit />
                ) : (
                  <Text style={styles.counterValue}>{containersToEmpty}</Text>
                )}
              </View>
              <View style={styles.counterViewChild}>
                <Text style={styles.counterTextLabel}>
                  {Languages("contEmptiedLB")}
                </Text>
                {this.state.textLoader ? (
                  <Spinkit />
                ) : (
                  <Text style={styles.counterValue}>{containersEmptied}</Text>
                )}
              </View>
            </View>
            <View style={styles.reportBtnAllView}>
              <TouchableOpacity
                onPress={this.confirmEmptyingAllContainers}
                style={isPad ? styles.btnLogInIpad : styles.btnReportAll}
              >
                <Text
                  style={[
                    isPad ? styles.btnLogInTextIpad : styles.btnLogInText,
                    { fontSize: 14 },
                  ]}
                >
                  {Languages("reportBTN")}
                </Text>
              </TouchableOpacity>
            </View>
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
            >
              <View style={styles.modalView}>
                <View>
                  <Icon
                    name="times-circle"
                    size={24}
                    color="#000"
                    onPress={() => {
                      this.setState({
                        modalVisible: false,
                        areContainersReady: true,
                      });
                    }}
                  />
                </View>
                <View style={styles.modalHeader}>
                  <Text style={isPad ? [styles.titleIpad] : [styles.title]}>
                    {Languages("modalHD")}
                  </Text>
                </View>
                <ScrollView style={{ height: "100%" }}>
                  <FlatList
                    initialNumToRender={6}
                    data={list}
                    numColumns={1}
                    ListEmptyComponent={
                      <Text style={isPad ? [styles.titleIpad] : [styles.title]}>
                        {Languages("noContainer")}
                      </Text>
                    }
                    renderItem={({ item, i }) => this.calloutList(i, item)}
                  />
                </ScrollView>
              </View>
            </Modal>
            <Modal
              animationType="fade"
              transparent={true}
              visible={this.state.emptyModalShow}
            >
              <View style={stylesModal.container}>
                {!true ? (
                  <>
                    <AnimatedHeader
                      goBack={() => {
                        this.setState({ emptyModalShow: false });
                      }}
                      label={Languages("contInfoHD")}
                      scrollY={this.state.scrollY}
                    />
                    <ScrollView
                      style={stylesModal.listView}
                      contentContainerStyle={stylesModal.scrollViewContent}
                      showsVerticalScrollIndicator={false}
                    >
                      <View style={[stylesModal.row]}>
                        <Text
                          style={
                            isPad ? stylesModal.textIpad : stylesModal.text
                          }
                        >
                          {Languages("idLB") + container?.id}
                        </Text>
                      </View>
                      <View style={stylesModal.row}>
                        <Text
                          style={
                            isPad ? stylesModal.textIpad : stylesModal.text
                          }
                        >
                          {Languages("addressLBL") + container?.address}
                        </Text>
                      </View>
                      <View style={stylesModal.row}>
                        <Text
                          style={
                            isPad ? stylesModal.textIpad : stylesModal.text
                          }
                        >
                          {Languages("fillingDegLBL") +
                            container?.waste_distance +
                            "%"}
                        </Text>
                      </View>
                      <View style={stylesModal.row}>
                        <Text
                          style={
                            isPad ? stylesModal.textIpad : stylesModal.text
                          }
                        >
                          {Languages("contFracLBL") +
                            (container[updatefractionLanguageKey()]
                              ? container[updatefractionLanguageKey()]
                              : Languages("notFilled"))}
                        </Text>
                      </View>
                      <View style={stylesModal.row}>
                        <Text
                          style={
                            isPad ? stylesModal.textIpad : stylesModal.text
                          }
                        >
                          {Languages("contTypeLBL") +
                            (container[updateContainerTypeLanguageKey()]
                              ? container[updateContainerTypeLanguageKey()]
                              : Languages("notFilled"))}
                        </Text>
                      </View>
                      {!!container?.image_url && (
                        <View style={{ paddingTop: vh * 2.5 }}>
                          <Image
                            source={
                              isPicLoading
                                ? loadingImage
                                : { uri: container?.image_url }
                            }
                            style={{ height: vh * 25, width: vh * 18 }}
                            resizeMode={"stretch"} //contain, cover, stretch, center
                            onLoadEnd={() =>
                              this.setState({ isPicLoading: false })
                            }
                          />
                        </View>
                      )}
                      <TouchableOpacity
                        style={stylesModal.btnEmpty}
                        onPress={() => this.showTextModal(container?.id)}
                      >
                        <Text
                          style={
                            isPad
                              ? stylesModal.btnEmptyTextIpad
                              : stylesModal.btnEmptyText
                          }
                        >
                          {Languages("emptyBTN")}
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </>
                ) : (
                  <KeyboardAwareScrollView>
                    <View style={stylesModal.wrap}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons
                          name="chevron-back"
                          size={20}
                          color="#000000"
                          style={{ marginRight: 30, marginLeft: 10 }}
                          onPress={() => {
                            this.setState({
                              emptyModalShow: false,
                              textLoader: false,
                            });
                          }}
                        />
                        <Text
                          style={
                            isPad
                              ? [stylesModal.maintitleIpad]
                              : [stylesModal.maintitle]
                          }
                        >
                          {Languages("emptyContainerLB")}
                        </Text>
                      </View>
                      <View style={stylesModal.wrapForm}>
                        <Text
                          style={
                            isPad
                              ? [stylesModal.titleIpad]
                              : [stylesModal.title]
                          }
                        >
                          {Languages("sensorIdLBL") + id}
                        </Text>
                        <View style={stylesModal.textInputWrap}>
                          <Text
                            style={
                              isPad
                                ? stylesModal.textLabelIpad
                                : stylesModal.textLabel
                            }
                          >
                            {Languages("weightLB")}
                          </Text>
                          <TextInput
                            placeholder={Languages("weightPH")}
                            underlineColorAndroid="transparent"
                            style={
                              isPad
                                ? stylesModal.textInputIpad
                                : stylesModal.textInput
                            }
                            blurOnSubmit={false}
                            onChangeText={(text) =>
                              this.setState({ weight: text })
                            }
                            keyboardType={"decimal-pad"}
                            onSubmitEditing={() => this.noteField.focus()}
                          />
                        </View>

                        <View style={stylesModal.textInputWrap}>
                          <Text
                            style={
                              isPad
                                ? stylesModal.textLabelIpad
                                : stylesModal.textLabel
                            }
                          >
                            {Languages("noteLB")}
                          </Text>
                          <TextInput
                            placeholder={Languages("notePH")}
                            underlineColorAndroid="transparent"
                            style={
                              isPad
                                ? stylesModal.textInputIpad
                                : stylesModal.textInput
                            }
                            onChangeText={(text) =>
                              this.setState({ note: text })
                            }
                            ref={(input) => (this.noteField = input)}
                          />
                        </View>
                      </View>
                      <View style={stylesModal.wrapButton}>
                        <TouchableOpacity
                          style={
                            isPad
                              ? stylesModal.btnLogInIpad
                              : stylesModal.btnLogIn
                          }
                          onPress={this.hideText}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={
                              isPad
                                ? stylesModal.btnLogInTextIpad
                                : stylesModal.btnText
                            }
                          >
                            {Languages("cancel")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={
                            isPad
                              ? stylesModal.btnLogInIpad
                              : stylesModal.btnLogIn
                          }
                          onPress={() => {
                            this.setState({ mapLoader: true });
                            this.emptyContainer();
                          }}
                          activeOpacity={0.7}
                        >
                          {this.state.mapLoader ? (
                            <Spinkit />
                          ) : (
                            <Text
                              style={
                                isPad
                                  ? stylesModal.btnLogInTextIpad
                                  : stylesModal.btnText
                              }
                            >
                              {Languages("report")}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </KeyboardAwareScrollView>
                )}
              </View>
            </Modal>
          </View>
          {(this.state.textLoader || this?.state?.mapLoader) && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={Color.toolbarTint} />
            </View>
          )}
        </View>
      </>
    );
  }
}

const defaultProps = {
  enableHack: false,
  geolocationOptions: GEOLOCATION_OPTIONS,
};

// MapView.defaultProps = defaultProps;

const mapStateToProps = ({ map, categories }) => {
  return {
    latitudeDelta: map.latitudeDelta,
    longitudeDelta: map.longitudeDelta,
    selectedCategory: categories.selectedCategory,
    containersArray: categories.containersArray,
  };
};

const stylesModal = StyleSheet.create({
  listView: {
    marginTop: vh * 7,
    flex: 1,
  },
  scrollViewContent: {
    alignItems: "center",
    paddingBottom: vh * 2,
  },
  row: {
    paddingVertical: vh * 2.5,
    left: 0,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
  textIpad: {
    fontSize: 32,
    textAlign: "center",
  },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  wrapButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 999,
  },
  btnLogIn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(72,194,172)",
    padding: vh,
    margin: 10,
    borderRadius: 25,
    zIndex: 1,
  },
  btnLogInIpad: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(72,194,172)",
    flex: 1,
    padding: 30,
    margin: 20,
    borderRadius: 50,
    zIndex: 1,
  },
  btnEmpty: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(72,194,172)",
    padding: 5,
    marginTop: vh * 6,
    borderRadius: vh * 3,
    height: vh * 6,
    width: vw * 62,
  },
  btnEmptyText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 1.5,
  },
  btnEmptyTextIpad: {
    color: "white",
    fontWeight: "bold",
    fontSize: 32,
    letterSpacing: 1.9,
  },
  btnLogInTextIpad: {
    color: "white",
    fontWeight: "bold",
    fontSize: 26,
  },
  wrap: {
    marginTop: 0.05 * height,
    marginHorizontal: vw * 3,
    marginBottom: 4,
    borderRadius: 8,
    height: vh * 75,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  maintitle: {
    paddingTop: 20,
    paddingBottom: 10,
    fontSize: 25,
    color: "#333",
    marginTop: 3,
    marginRight: 7,
    letterSpacing: 1.5,
    lineHeight: 14,
    textAlign: "center",
    backgroundColor: "transparent",
  },
  maintitleIpad: {
    paddingTop: 40,
    paddingBottom: 20,
    fontSize: 55,
    color: "#333",
    marginTop: 6,
    marginRight: 14,
    letterSpacing: 3.0,
    lineHeight: 28,
    textAlign: "center",
    backgroundColor: "transparent",
  },
  wrapForm: {
    flex: 1,
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 16,
  },
  title: {
    fontSize: 15,
    color: "#333",
    marginTop: 3,
    marginRight: 7,
    letterSpacing: 1.5,
    lineHeight: 18,
    textAlign: "center",
    backgroundColor: "transparent",
  },
  titleIpad: {
    fontSize: 30,
    color: "#333",
    marginTop: 6,
    marginRight: 14,
    letterSpacing: 3.0,
    lineHeight: 28,
    textAlign: "center",
    backgroundColor: "transparent",
  },
  textInputWrap: {
    marginTop: 30,
  },
  textLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 8,
  },
  textLabelIpad: {
    fontSize: 32,
    color: "#333",
    fontWeight: "500",
    marginBottom: 16,
    marginTop: 16,
  },
  textInputIpad: {
    backgroundColor: "#ffffff",
    fontSize: 32,
    padding: 20,
    paddingLeft: 20,
    paddingRight: 20,
    color: "#000000",
  },
  textInput: {
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#9B9B9B",
    paddingTop: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.8,
  },
});

export default connect(mapStateToProps, { setContainerArr })(Index);
