import React, { Component } from "react";
import {
  View,
  Animated,
  Platform,
  TouchableOpacity,
  Text,
  Dimensions,
  Alert,
} from "react-native";
import { Constants, Config, Languages } from "../../Common";
import { UserProfileHeader, LogoSpinner } from "../../Components";
import * as SecureStore from "expo-secure-store";
import styles from "./styles";
import { setContainerArr } from "../../Redux/actions";
import { connect } from "react-redux";

const { height } = Dimensions.get("window"),
  HEADER_MIN_HEIGHT = 42,
  HEADER_SCROLL_DISTANCE = 0.25 * height - HEADER_MIN_HEIGHT;

export class UserComp extends Component {
  state = { scrollY: new Animated.Value(0), pushNotification: false };

  async componentDidMount() {
    this.setState({
      isLoading: false,
    });
    this.focusListener = this.props.navigation?.addListener("willFocus", () => {
      this.props.setContainerArr("userScreen");
    });
  }

  _renderHeader = () => {
    const headerTranslate = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [0, -HEADER_SCROLL_DISTANCE],
      extrapolate: "clamp",
    });

    const imageTranslate = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [0, 50],
      extrapolate: "clamp",
    });

    const animateOpacity = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [1, 1, 0],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.header,
          { transform: [{ translateY: headerTranslate }] },
        ]}
      >
        <Animated.View
          style={[
            styles.profileView,
            {
              opacity: animateOpacity,
              transform: [{ translateY: imageTranslate }],
            },
          ]}
        >
          <UserProfileHeader />
        </Animated.View>
      </Animated.View>
    );
  };

  logOut = async () => {
    const { navigation } = this.props;
    await SecureStore.deleteItemAsync("secure_token");
    navigation.navigate("login");
  };

  viewPickups = () => {
    const { navigation } = this.props;
    navigation.navigate("pickup");
  };

  deleteAccount = async () => {
    this.setState({ isLoading: true });
    // API logic scrubbed
    setTimeout(async () => {
      await this.logOut();
      this.setState({ isLoading: false });
    }, 500);
  };

  deleteAccountOnPress = () => {
    Alert.alert(
      "Are you sure you want to delete your account, you will loose access to all your data?",
      "",
      [
        { text: "Cancel", onPress: () => {} },
        { text: "OK", onPress: () => this.deleteAccount() },
      ],
      { cancelable: false }
    );
  };

  render() {
    const { isLoading } = this.state;
    if (isLoading) {
      return <LogoSpinner fullStretch={true} />;
    }

    return (
      <View style={styles.body}>
        <Animated.ScrollView
          scrollEventThrottle={1}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          <View style={styles.content}>
            <View style={styles.profileSection}>
              <View>
                <TouchableOpacity
                  style={styles.centerContainer}
                  onPress={() => this.viewPickups()}
                >
                  <Text
                    style={
                      Platform.isPad ? styles.buttonTextIpad : styles.buttonText
                    }
                  >
                    {Languages("viewPickups")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.profileSection}>
              <View>
                <TouchableOpacity
                  style={styles.centerContainer}
                  onPress={() => this.deleteAccountOnPress()}
                >
                  <Text
                    style={
                      Platform.isPad ? styles.buttonTextIpad : styles.buttonText
                    }
                  >
                    {Languages("deleteAccount")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.profileSection}>
              <View>
                <TouchableOpacity
                  style={styles.centerContainer}
                  onPress={() => this.logOut()}
                >
                  <Text
                    style={
                      Platform.isPad ? styles.buttonTextIpad : styles.buttonText
                    }
                  >
                    {Languages("signOut")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
        {this._renderHeader()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const containersArray = state.categories.containersArray;
  return { containersArray };
};

export default connect(mapStateToProps, { setContainerArr })(UserComp);
