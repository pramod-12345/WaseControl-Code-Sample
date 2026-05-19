import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  Animated,
  StyleSheet,
} from "react-native";
import { Color, Config, Languages, Device } from "@common";
import * as SecureStore from "expo-secure-store";
import MapView, { Marker, Callout } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import _, { cloneDeep, isArray, remove } from "lodash";
import { connect } from "react-redux";
import { withNavigation } from "react-navigation";
import Icon from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Menu, { MenuDivider, MenuItem } from "react-native-material-menu";
import * as Location from "expo-location";
import { AnimatedHeader, LogoSpinner, Spinkit } from "../index";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setContainerArr } from "@redux/actions";
import { RFValue } from "react-native-responsive-fontsize";
import styles from "./styles";
import {
  updateContainerTypeLanguageKey,
  updatefractionLanguageKey,
} from "../../Common/Languages";

const { width, height } = Dimensions.get("window"),
  vw = width / 100,
  vh = height / 100;

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 20000,
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
  tooFarAlertShown = false,
  allContainersAlertShown = false;

function Index(props) {
  const [state, setState] = useState({
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
    coOrdinates: [],
    timesToLoop: 0,
    service_options: [],
  });

  const calloutRefs = useRef(state.containers.map(() => React.createRef()));

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
    printText,
    loading,
    isPicLoading,
  } = state;

  const intervalId = useRef(null);
  const mapRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
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

      let parts = [];
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

      setState((prevState) => ({
        ...prevState,
        timesToLoop,
        coOrdinates,
        service_options,
      }));
    }
  }, [myPosition]);

  const animateToNewRegion = (initialRegion) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 1000);
    }
  };

  useEffect(() => {
    const requestPermissions = async () => {
      await Location.requestForegroundPermissionsAsync().then(
        async (status) => {
          if (status.status === "granted") {
            await Location.getCurrentPositionAsync({}).then((coord) => {
              let region = {
                latitude: coord.coords.latitude,
                longitude: coord.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              };
              setState((prevState) => ({
                ...prevState,
                currentLocation: region,
                heading: coord.coords.heading,
                myPosition: {
                  latitude: coord.coords.latitude,
                  longitude: coord.coords.longitude,
                },
                initialLatLong: region,
              }));
              animateToNewRegion(region);
            });
          }
        }
      );
    };

    props.setContainerArr("mapScreen");
    initialMount();
    intervalId.current = setInterval(async () => {
      if (props?.containersArray != "mapScreen") {
        clearInterval(intervalId.current);
      }
      requestPermissions();
    }, 4000);

    const mapBackHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        props.navigation.navigate("pickup");
        setState({ emptyModalShow: false });
        if (state.printText === false) {
          setState({ emptyModalShow: false });
        } else {
          hideText();
        }
        return true;
      }
    );

    return () => {
      clearInterval(intervalId.current);
      mapBackHandler.remove();
    };
  }, []);

  const initialMount = async () => {
    const pickupId = await SecureStore.getItemAsync("pickupId");
    getContainersWithToken(getPickupContainers + pickupId);
    if (state.showAllContainers == "true") {
      getContainersWithToken(getAllContainers);
    }
    await setOriginPointAsCurrent();
    setState(async (prevState) => ({
      ...prevState,
      drivingMode: await SecureStore.getItemAsync("mode"),
      shouldAskWeight: await SecureStore.getItemAsync("shouldEnterWeight"),
      showAllContainers: await SecureStore.getItemAsync("showAllContainers"),
    }));
    if (state.areContainersReady) {
      setState((prevState) => ({
        ...prevState,
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
      }));
    }
    if (
      props.navigation &&
      props.navigation.state &&
      props.navigation.state.params &&
      props.navigation.state.params.fromPickupScreen
    ) {
      tooFarAlertShown = false;
      allContainersAlertShown = false;
      props.navigation.state.params = null;
    }
    startingIndexForRoute = 0;
  };

  const hideText = () => {
    if (state.id) {
      setState((prevState) => ({
        ...prevState,
        emptyModalShow: false,
        textLoader: false,
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        printText: false,
      }));
    }
  };

  const getEmptiedContainersCount = (data) => {
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

  const sortContainersForRoutes = async (currentPosition) => {
    try {
      return new Promise(async (resolve, reject) => {
        const isConnected = await SecureStore.getItemAsync("is_connection");
        const {
          containers,
          myPosition,
          containersForSingleRoute,
          isDirectionsModeSingle,
        } = state;
        if (!myPosition && !isDirectionsModeSingle) {
          setTimeout(sortContainersForRoutes, 300);
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
          let containersEmptied = await getEmptiedContainersCount(
            finalContainers
          );

          startingIndexForRoute = 0;

          setState((prevState) => ({
            ...prevState,
            containers: finalContainers,
            canGetDirections: sortedContainers.length !== 0,
            areContainersReady: !isDirectionsModeSingle,
            containersToEmpty: finalContainers.length - containersEmptied,
            containersEmptied,
          }));
        }
      });
    } catch (err) {
      Alert.alert(Languages("pickupErrALT_M"), Languages("distanceErrALT_M"));
    }
  };

  const getNextRoute = async () => {
    try {
      setState((prevState) => ({
        ...prevState,
        mapLoader: true,
      }));
      const { containers, destination } = state;
      let currentPosition = await setOriginPointAsCurrent(true);
      // let currentPosition = destination;
      let sortedContainers = await sortContainersForRoutes(currentPosition);
      if (sortedContainers.length === 0) {
        Alert.alert(
          Languages("emptiedLastALT_T"),
          Languages("emptiedLastALT_M")
        );
        setState((prevState) => ({
          ...prevState,
          areContainersReady: true,
          fetchedLastRoute: true,
          origin: currentPosition,
          mapLoader: false,
        }));
      } else {
        let destinationCoOrdinate = {
          latitude: parseFloat(sortedContainers[0] && sortedContainers[0].lat),
          longitude: parseFloat(sortedContainers[0] && sortedContainers[0].lng),
          id: containers[0].id,
        };
        sortedContainers = sortedContainers.splice(1);
        setState((prevState) => ({
          ...prevState,
          containersForSingleRoute: sortedContainers,
          origin: currentPosition,
          destination: destinationCoOrdinate,
          areContainersReady: true,
          canGetDirections: true,
          isDirectionsModeSingle: true,
          mapLoader: false,
        }));
      }
    } catch (err) {
      setState((prevState) => ({
        ...prevState,
        mapLoader: false,
      }));
      Alert.alert(Languages("nextRouteErrALT_M"), Languages("wrong"));
    }
  };

  const getContainersWithToken = async (endpointAddress) => {
    const token = await SecureStore.getItemAsync("secure_token");
    const isConnected = await SecureStore.getItemAsync("is_connection");
    // const pickupId = await SecureStore.getItemAsync("pickupId");
    const { containers, allContainers } = state;
    //if containers exists then delete them.
    endpointAddress == getAllContainers
      ? allContainers.length > 0 &&
        setState((prevState) => ({ ...prevState, allContainers: [] }))
      : containers.length > 0 &&
        setState((prevState) => ({ ...prevState, containers: [] }));

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
            // console.log('At getPickupContainers ())()(()()', json[0]);
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
                json = json.slice(0, 150); //only first 25 containers.
                let arr = [];
                for (let i = 0; i < json.length; i++) {
                  arr.push(json[i]);
                }
                let containersEmptied = await getEmptiedContainersCount(arr);
                setState((prevState) => ({
                  ...prevState,
                  [endpointAddress == getAllContainers
                    ? "allContainers"
                    : "containers"]: arr,
                  canGetDirections: arr.length !== 0,
                  areContainersReady: !state.isDirectionsModeSingle,
                  containersEmptied,
                  containersForSingleRoute: arr,
                }));
                endpointAddress != getAllContainers &&
                  endpointAddress != getAllContainers &&
                  setState((prevState) => ({
                    ...prevState,
                    containersToEmpty: arr.length - containersEmptied,
                    contCountLoader: false,
                  }));
              } else {
                setState((prevState) => ({
                  ...prevState,
                  [endpointAddress == getAllContainers
                    ? "allContainers"
                    : "containers"]: json,
                  containersForSingleRoute: cloneDeep(json),
                }));
                json.length > 0 &&
                  (state.isDirectionsModeSingle
                    ? getNextRoute()
                    : sortContainersForRoutes());
              }
              setState((prevState) => ({
                ...prevState,
                textLoader: false,
              }));
            }
          }
        })
        .catch((e) => {
          Alert.alert(Languages("contErrResALT_T"));
        });
      if (deleteToken === 1) {
        await SecureStore.deleteItemAsync("secure_token");
        props.navigation.navigate("login");
      }
    }
  };

  const setOriginPointAsCurrent = (returnData = false) => {
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
          setState((prevState) => ({
            ...prevState,
            myPosition: {
              latitude,
              longitude,
              heading: location.coords.heading,
            },
            region: {
              latitude,
              longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
              heading: location.coords.heading,
            },
            initialLatLong: {
              latitude,
              longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
              heading: location.coords.heading,
            },
          }));
        }
      } catch (err) {
        Alert.alert(Languages("error"), Languages("currentLocALT_M"));
      }
    });
  };

  const emptyContainer = async () => {
    setState((prevState) => ({ ...prevState, textLoader: true }));
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
          body: JSON.stringify({
            container_id: state.id,
            weight: state.weight,
            note: state.note,
          }),
        };

        const data = await fetch(baseUrl + `container/pickup-note`, settings)
          .then(async (response) => {
            setState((prevState) => ({
              ...prevState,
              textLoader: false,
              mapLoader: false,
            }));

            if (response.status === 200) {
              Alert.alert(
                Languages("success"),
                Languages("emptiedSuccessALT_M")
              );
            }
            hideText();
            const pickupId = await SecureStore.getItemAsync("pickupId");
            getContainersWithToken(getPickupContainers + pickupId);
            state.showAllContainers == "true" &&
              getContainersWithToken(getAllContainers);
          })
          .catch((e) => {
            Alert.alert(Languages("error"));
          });
        const updatedArr = state.containers?.map((obj) => {
          return obj.id == state.id ? { ...obj, empty_today: true } : obj;
        });

        setState((prevState) => ({
          ...prevState,
          containers: updatedArr,
          areContainersReady: true,
          containersToEmpty: state?.containersToEmpty - 1,
          containersEmptied: state?.containersEmptied + 1,
          emptyModalShow: false,
          canGetDirections: true,
        }));
      }
    } catch (err) {
      Alert.alert(Languages("cantEmptyContALT_T"), Languages("pickupErrALT_M"));
    }
    setState((prevState) => ({
      ...prevState,
      textLoader: false,
    }));
  };

  const showText = (containerId, containerIndex) => {
    const { selectedCategory } = props;
    setState((prevState) => ({
      ...prevState,
      id: containerId,
      container: selectedCategory,
      containerIndex,
      modalVisible: false,
      areContainersReady: true,
      loading: false,
    }));

    state.shouldAskWeight == "true"
      ? setState((prevState) => ({
          ...prevState,
          emptyModalShow: true,
          textLoader: true,
        }))
      : emptyContainer();
    startingIndexForRoute = 0;
  };

  const cantEmptyAlert = () => {
    Alert.alert(Languages("cantEmptyALT_T"), Languages("cantEmptyALT_M"));
  };

  const renderCalloutMaker = (item, index) => {
    return (
      <Callout
        onPress={() => {
          if (
            calloutRefs.current[item?.id] &&
            calloutRefs.current[item?.id].current
          ) {
            calloutRefs.current[item?.id].current.hideCallout(); // Assuming hideCallout is a method provided by your Callout component
          }
          if (item.empty_today) {
            cantEmptyAlert();
          } else {
            setState((prevState) => ({
              ...prevState,
              textLoader: true,
              loading: true,
            }));
            showText(item.id, index);
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
          <View style={styles.wrapButton}>
            <TouchableOpacity
              style={isPad ? styles.btnLogInIpad : styles.btnLogIn}
            >
              {state.loading ? (
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

  const toggleDirectionsMode = (isDirectionsModeSingleParam) => {
    menuRef.current && menuRef.current.hide();
    setState((prevState) => ({
      ...prevState,
      isDirectionsModeSingle: isDirectionsModeSingleParam,
    }));
    !isDirectionsModeSingleParam && sortContainersForRoutes();
    isDirectionsModeSingleParam && getNextRoute();
  };

  const renderNextDirection = () => {
    menuRef.current && menuRef.current.hide();
    getNextRoute();
  };

  const logOut = async () => {
    menuRef.current && menuRef.current.hide();
    await SecureStore.deleteItemAsync("secure_token");
    props.navigation && props.navigation.navigate("login");
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>{Languages("directionsHD")}</Text>
        {!state.shouldVisible && (
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => {
              animateToNewRegion(state.currentLocation);
              // setState((prevState) => ({
              //   ...prevState,
              //   isTrack: true,
              //   shouldVisible: false,
              // }));
              // setTimeout(() => {
              //   if (state.isTrack) {
              //     setState((prevState) => ({
              //       ...prevState,
              //       isTrack: false,
              //     }));
              //   }
              // }, 1500);
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
          ref={menuRef}
          button={
            <Icon
              name="bars"
              size={20}
              color="#000"
              onPress={() => menuRef.current.show()}
            />
          }
          style={{ marginTop: vh * 3 }}
        >
          <MenuItem
            onPress={() => toggleDirectionsMode(true)}
            textStyle={styles.menuItemText}
            disabled={state.isDirectionsModeSingle} //isDirectionsModeSingle
          >
            {Languages("singleMode")}
          </MenuItem>
          <MenuItem
            onPress={() => toggleDirectionsMode(false)}
            textStyle={styles.menuItemText}
            disabled={!state.isDirectionsModeSingle}
          >
            {Languages("allMode")}
          </MenuItem>
          {state.isDirectionsModeSingle && (
            <MenuItem
              onPress={renderNextDirection}
              textStyle={styles.menuItemText}
            >
              {Languages("nextDirection")}
            </MenuItem>
          )}
          <MenuDivider />
          <MenuItem onPress={logOut} textStyle={styles.menuItemText}>
            {Languages("signOut")}
          </MenuItem>
        </Menu>
      </View>
    );
  };

  const onOneOfMultipleMarkerPressed = (list) => {
    startingIndexForRoute = 0;
    setState((prevState) => ({
      ...prevState,
      modalVisible: true,
      list,
      areContainersReady: false,
    }));
  };

  const mapMarkers = (
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
          ref={calloutRefs.current[item?.id]}
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
            isOneOfMultiple && onOneOfMultipleMarkerPressed(list);
          }}
        >
          {isAllContainers && (
            <MaterialCommunityIcons name="map-marker" size={32} color="gray" />
          )}
          {!isOneOfMultiple && renderCalloutMaker(item, index)}
        </Marker>
      );
    });
  };

  const renderMarkers = (containers, isAllContainers = false) => {
    // console.log('=-=-=-=-=-=-=-=-=-=-=-=-=', containers.length);
    const { latitudeDelta, longitudeDelta } = props;
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
      mapMarkers(
        containers,
        latitudeDelta,
        longitudeDelta,
        multiContainersAtPoint,
        determineEmptied,
        isAllContainers
      )
    );
  };

  const renderDirections = (coOrdinates) => {
    try {
      if (state.isDirectionsModeSingle) {
        const { origin, destination, drivingMode } = state;
        return (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={mapKey}
            precision={"high"} //low
            strokeWidth={2}
            strokeColor={"red"}
            mode={drivingMode}
            onReady={(res) => {
              mapRef.current.fitToCoordinates(res && res.coordinates, {});
            }}
          />
        );
      } else {
        return state.service_options.map((item) => {
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
              mode={state.drivingMode}
              resetOnChange={false}
            />
          );
        });
      }
    } catch (err) {
      Alert.alert(Languages("error"), Languages("directionsErr"));
    }
  };

  const emptyAllContainers = async () => {
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
                      props.navigation.navigate("categories");
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

  const confirmEmptyingAllContainers = () => {
    Alert.alert(
      Languages("confirm"),
      Languages("emptyAllALT_M"),
      [
        { text: Languages("no"), style: "cancel" },
        {
          text: Languages("yes"),
          onPress: emptyAllContainers,
          style: "default",
        },
      ],
      { cancelable: false }
    );
  };

  const showTextModal = (containerId) => {
    setState((prevState) => ({
      ...prevState,
      id: containerId,
      printText: true,
    }));
  };

  const calloutList = (i, container) => {
    return (
      <TouchableOpacity
        style={styles.calloutListItem}
        onPress={() =>
          container.empty_today
            ? cantEmptyAlert()
            : showText(container.id, container.index)
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

  const tooFarAlert = () => {
    if (!tooFarAlertShown) {
      tooFarAlertShown = true;
      Alert.alert(Languages("directionsErr"), Languages("tooFar"));
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <View style={{ flex: 1 }}>
        {state.isTrack ? (
          <MapView
            tracksViewChanges={false}
            style={styles.map}
            ref={mapRef}
            showsMyLocationButton={true}
            showsUserLocation={false}
            userLocationAnnotationTitle={Languages("here")}
            initialRegion={initialLatLong}
            region={region}
          >
            {state.currentLocation !== null && (
              <Marker
                coordinate={{
                  latitude: state.currentLocation?.latitude,
                  longitude: state.currentLocation?.longitude,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                flat
                rotation={state.heading}
              >
                <MaterialCommunityIcons
                  name="navigation"
                  size={24}
                  color="blue"
                />
              </Marker>
            )}
            {areContainersReady && renderMarkers(state.containers)}
            {state.showAllContainers == "true" &&
              renderMarkers(state.allContainers, true)}
            {myPosition &&
              areContainersReady &&
              (isDirectionsModeSingle ? !fetchedLastRoute : true) &&
              ((canGetDirections &&
                Array.from(Array(state.timesToLoop)).map(() => {
                  return renderDirections(state.coOrdinates);
                })) ||
                tooFarAlert())}
          </MapView>
        ) : (
          <MapView
            region={region}
            tracksViewChanges={false}
            style={styles.map}
            ref={mapRef}
            showsUserLocation={true}
            showsMyLocationButton={true}
            userLocationAnnotationTitle={Languages("here")}
            initialRegion={initialLatLong}
          >
            {state.currentLocation !== null && (
              <Marker
                coordinate={{
                  latitude: state.currentLocation?.latitude,
                  longitude: state.currentLocation?.longitude,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                flat
                rotation={state.heading}
              >
                <MaterialCommunityIcons
                  name="navigation"
                  size={24}
                  color="blue"
                />
              </Marker>
            )}
            {renderMarkers(state.containers)}
            {state.showAllContainers == "true" &&
              renderMarkers(state.allContainers, true)}
            {myPosition &&
              areContainersReady &&
              (isDirectionsModeSingle ? !fetchedLastRoute : true) &&
              ((canGetDirections &&
                Array.from(Array(state.timesToLoop)).map(() => {
                  return renderDirections(state.coOrdinates);
                })) ||
                tooFarAlert())}
          </MapView>
        )}

        <View style={styles.counterView}>
          <View style={styles.counterViewChild}>
            <Text style={styles.counterTextLabel}>
              {Languages("contEmptyLB")}
            </Text>
            {state.contCountLoader ? (
              <Spinkit />
            ) : (
              <Text style={styles.counterValue}>{containersToEmpty}</Text>
            )}
          </View>
          <View style={styles.counterViewChild}>
            <Text style={styles.counterTextLabel}>
              {Languages("contEmptiedLB")}
            </Text>
            {state.textLoader ? (
              <Spinkit />
            ) : (
              <Text style={styles.counterValue}>{containersEmptied}</Text>
            )}
          </View>
        </View>
        <View style={styles.reportBtnAllView}>
          <TouchableOpacity
            onPress={confirmEmptyingAllContainers}
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
        <Modal animationType="fade" transparent={true} visible={modalVisible}>
          <View style={styles.modalView}>
            <View>
              <Icon
                name="times-circle"
                size={24}
                color="#000"
                onPress={() => {
                  setState((prevState) => ({
                    ...prevState,
                    modalVisible: false,
                    areContainersReady: true,
                  }));
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
                renderItem={({ item, i }) => calloutList(i, item)}
              />
            </ScrollView>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={state.emptyModalShow}
        >
          <View style={stylesModal.container}>
            {!true ? (
              <>
                <AnimatedHeader
                  goBack={() => {
                    setState((prevState) => ({
                      ...prevState,
                      emptyModalShow: false,
                    }));
                  }}
                  label={Languages("contInfoHD")}
                  scrollY={state.scrollY}
                />
                <ScrollView
                  style={stylesModal.listView}
                  contentContainerStyle={stylesModal.scrollViewContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={[stylesModal.row]}>
                    <Text
                      style={isPad ? stylesModal.textIpad : stylesModal.text}
                    >
                      {Languages("idLB") + container?.id}
                    </Text>
                  </View>
                  <View style={stylesModal.row}>
                    <Text
                      style={isPad ? stylesModal.textIpad : stylesModal.text}
                    >
                      {Languages("addressLBL") + container?.address}
                    </Text>
                  </View>
                  <View style={stylesModal.row}>
                    <Text
                      style={isPad ? stylesModal.textIpad : stylesModal.text}
                    >
                      {Languages("fillingDegLBL") +
                        container?.waste_distance +
                        "%"}
                    </Text>
                  </View>
                  <View style={stylesModal.row}>
                    <Text
                      style={isPad ? stylesModal.textIpad : stylesModal.text}
                    >
                      {Languages("contFracLBL") +
                        (container[updatefractionLanguageKey()]
                          ? container[updatefractionLanguageKey()]
                          : Languages("notFilled"))}
                    </Text>
                  </View>
                  <View style={stylesModal.row}>
                    <Text
                      style={isPad ? stylesModal.textIpad : stylesModal.text}
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
                          setState((prevState) => ({
                            ...prevState,
                            isPicLoading: false,
                          }))
                        }
                      />
                    </View>
                  )}
                  <TouchableOpacity
                    style={stylesModal.btnEmpty}
                    onPress={() => showTextModal(container?.id)}
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
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color="#000000"
                      style={{ marginRight: 30, marginLeft: 10 }}
                      onPress={() => {
                        setState((prevState) => ({
                          ...prevState,
                          emptyModalShow: false,
                          textLoader: false,
                        }));
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
                        isPad ? [stylesModal.titleIpad] : [stylesModal.title]
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
                          setState((prevState) => ({
                            ...prevState,
                            weight: text,
                          }))
                        }
                        keyboardType={"decimal-pad"}
                        // onSubmitEditing={() => this.noteField.focus()}
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
                          setState((prevState) => ({
                            ...prevState,
                            note: text,
                          }))
                        }
                        // ref={(input) => (this.noteField = input)}
                      />
                    </View>
                  </View>
                  <View style={stylesModal.wrapButton}>
                    <TouchableOpacity
                      style={
                        isPad ? stylesModal.btnLogInIpad : stylesModal.btnLogIn
                      }
                      onPress={hideText}
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
                        isPad ? stylesModal.btnLogInIpad : stylesModal.btnLogIn
                      }
                      onPress={() => {
                        setState((prevState) => ({
                          ...prevState,
                          mapLoader: true,
                        }));
                        emptyContainer();
                      }}
                      activeOpacity={0.7}
                    >
                      {state.mapLoader ? (
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
        {(state.textLoader || state?.mapLoader) && (
          <View
            style={{
              position: "absolute",
              height: height,
              width: width,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.0421)",
            }}
          >
            <ActivityIndicator size="large" color={Color.toolbarTint} />
          </View>
        )}
      </View>
    </View>
  );
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
