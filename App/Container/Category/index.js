import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  BackHandler,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";
import { Color, Config, Languages, Device } from "../../Common";
import { AnimatedHeader, LogoSpinner } from "../../Components";
import Icon from "react-native-vector-icons/Ionicons";
import {
  updateContainerTypeLanguageKey,
  updatefractionLanguageKey,
} from "../../Common/Languages";

const { baseUrl } = Config.URL,
  { width, height } = Dimensions.get("window"),
  { isIOS, isPad } = Device,
  vw = width / 100,
  vh = height / 100,
  ImagesPath = "../../../assets/Images/",
  loadingImage = require(ImagesPath + "loadingImg.gif");

class Category extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollY: new Animated.Value(0),
      container: {},
      printText: false,
      id: null,
      weight: "",
      note: "",
      isLoading: false,
      isPicLoading: true,
    };
  }

  componentDidMount() {
    const { selectedCategory, goBack, containerId } = this.props;
    this.setState({ container: selectedCategory });
    if (containerId) this.setState({ printText: true, id: containerId });

    this.nestedBackHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (this.state.printText === false) goBack();
        else this.hideText();
        return true;
      }
    );
  }

  showText = (containerId) => {
    this.setState({ id: containerId });
    this.setState({ printText: true });
  };

  hideText = () => {
    const { containerId, goBack } = this.props;
    if (containerId) goBack();
    else this.setState({ printText: false });
  };

  emptyContainer = async () => {
    try {
      // API call scrubbed for client demonstration
      setTimeout(() => {
        Alert.alert(Languages("success"), Languages("emptiedSuccessALT_M"));
        this.hideText();
        setTimeout(() => {
          this.props.goBack();
          this.setState({ printText: false });
        }, 1500);
      }, 500);
    } catch (err) {
      Alert.alert(Languages("cantEmptyContALT_T"), Languages("pickupErrALT_M"));
    }
  };

  render() {
    const { goBack } = this.props;
    const { id, container, printText, isLoading, loading, isPicLoading } =
      this.state;

    if (isLoading) {
      return <LogoSpinner fullStretch={true} />;
    }

    return (
      <View style={stylesModal.container}>
        {!printText ? (
          <>
            <AnimatedHeader
              goBack={goBack}
              label={Languages("contInfoHD")}
              scrollY={this.state.scrollY}
            />
            <ScrollView
              style={stylesModal.listView}
              contentContainerStyle={stylesModal.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={[stylesModal.row]}>
                <Text style={isPad ? stylesModal.textIpad : stylesModal.text}>
                  {Languages("idLB") + container.id}
                </Text>
              </View>
              <View style={stylesModal.row}>
                <Text style={isPad ? stylesModal.textIpad : stylesModal.text}>
                  {Languages("addressLBL") + container.address}
                </Text>
              </View>
              <View style={stylesModal.row}>
                <Text style={isPad ? stylesModal.textIpad : stylesModal.text}>
                  {Languages("fillingDegLBL") + container.waste_distance + "%"}
                </Text>
              </View>
              <View style={stylesModal.row}>
                <Text style={isPad ? stylesModal.textIpad : stylesModal.text}>
                  {Languages("contFracLBL") +
                    (container[updatefractionLanguageKey()]
                      ? container[updatefractionLanguageKey()]
                      : Languages("notFilled"))}
                </Text>
              </View>
              <View style={stylesModal.row}>
                <Text style={isPad ? stylesModal.textIpad : stylesModal.text}>
                  {Languages("contTypeLBL") +
                    (container[updateContainerTypeLanguageKey()]
                      ? container[updateContainerTypeLanguageKey()]
                      : Languages("notFilled"))}
                </Text>
              </View>
              {!!container.image_url && (
                <View style={{ paddingTop: vh * 2.5 }}>
                  <Image
                    source={
                      isPicLoading ? loadingImage : { uri: container.image_url }
                    }
                    style={{ height: vh * 25, width: vh * 18 }}
                    resizeMode={"stretch"} //contain, cover, stretch, center
                    onLoadEnd={() => this.setState({ isPicLoading: false })}
                  />
                </View>
              )}
              <TouchableOpacity
                style={stylesModal.btnEmpty}
                onPress={() => this.showText(container.id)}
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
                <Icon
                  name="chevron-back"
                  size={20}
                  color="#000000"
                  style={{ marginRight: 30, marginLeft: 10 }}
                  onPress={() => {
                    goBack();
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
                  style={isPad ? [stylesModal.titleIpad] : [stylesModal.title]}
                >
                  {Languages("sensorIdLBL") + id}
                </Text>
                <View style={stylesModal.textInputWrap}>
                  <Text
                    style={
                      isPad ? stylesModal.textLabelIpad : stylesModal.textLabel
                    }
                  >
                    {Languages("weightLB")}
                  </Text>
                  <TextInput
                    placeholder={Languages("weightPH")}
                    underlineColorAndroid="transparent"
                    style={
                      isPad ? stylesModal.textInputIpad : stylesModal.textInput
                    }
                    blurOnSubmit={false}
                    onChangeText={(text) => this.setState({ weight: text })}
                    keyboardType={"decimal-pad"}
                    onSubmitEditing={() => this.noteField.focus()}
                  />
                </View>

                <View style={stylesModal.textInputWrap}>
                  <Text
                    style={
                      isPad ? stylesModal.textLabelIpad : stylesModal.textLabel
                    }
                  >
                    {Languages("noteLB")}
                  </Text>
                  <TextInput
                    placeholder={Languages("notePH")}
                    underlineColorAndroid="transparent"
                    style={
                      isPad ? stylesModal.textInputIpad : stylesModal.textInput
                    }
                    onChangeText={(text) => this.setState({ note: text })}
                    ref={(input) => (this.noteField = input)}
                  />
                </View>
              </View>
              <View style={stylesModal.wrapButton}>
                <TouchableOpacity
                  style={
                    isPad ? stylesModal.btnLogInIpad : stylesModal.btnLogIn
                  }
                  onPress={this.hideText}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <Spinkit />
                  ) : (
                    <Text
                      style={
                        isPad
                          ? stylesModal.btnLogInTextIpad
                          : stylesModal.btnText
                      }
                    >
                      {Languages("cancel")}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={
                    isPad ? stylesModal.btnLogInIpad : stylesModal.btnLogIn
                  }
                  onPress={this.emptyContainer}
                  activeOpacity={0.7}
                >
                  {loading ? (
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
    );
  }

  componentWillUnmount() {
    this.nestedBackHandler.remove();
  }
}

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
  },
  btnLogIn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(72,194,172)",
    padding: vh,
    margin: 10,
    borderRadius: 25,
  },
  btnLogInIpad: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(72,194,172)",
    flex: 1,
    padding: 30,
    margin: 20,
    borderRadius: 50,
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

const mapStateToProps = ({ categories }) => ({
  selectedCategory: categories.selectedCategory,
});

export default connect(mapStateToProps, null)(Category);
