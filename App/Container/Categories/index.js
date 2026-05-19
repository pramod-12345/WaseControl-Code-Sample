import React, { Component } from "react";
import {
  Animated,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Platform,
  Alert,
  ImageBackground,
} from "react-native";
import {
  fetchCategories,
  setActiveCategory,
  setContainerArr,
} from "../../Redux/actions";
import { connect } from "react-redux";
import { Languages } from "../../Common";
import styles from "./styles";
import Icon from "react-native-vector-icons/FontAwesome";
import { Spinkit } from "../../Components";

class Categories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollY: new Animated.Value(0),
      containers: [],
      containersTemp: [],
      searchData: "",
      appLoading: true,
    };
  }

  componentDidMount() {
    this.focusListener = this.props.navigation?.addListener("willFocus", () => {
      this.props.setContainerArr("categories");
      this.getContainersWithToken().then();
      this.setState({ searchData: "" });
    });
  }

  emptyContainer = async () => {
    // API logic scrubbed
    setTimeout(() => {
      Alert.alert(Languages("success"), Languages("emptiedAll"));
    }, 500);
  };

  getContainersWithToken = async () => {
    // API logic scrubbed
    setTimeout(() => {
      const mockContainers = [
        { id: 1, address: "Sample Address 1", empty_today: false },
        { id: 2, address: "Sample Address 2", empty_today: false },
      ];
      this.setState({
        containers: mockContainers,
        containersTemp: mockContainers,
        appLoading: false,
      });
    }, 1000);
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.categories !== nextProps.categories) {
      this.props.selectedLayout != nextProps.selectedLayout ||
        this.props.categories != nextProps.categories;
      // this.getContainersWithToken()
    }
  }

  showCategory = (category) => {
    const { setActiveCategory, onViewCategory } = this.props;
    setActiveCategory(category);
    onViewCategory(category);
  };

  _renderItem = ({ item, index }) => {
    let category = item;
    if (category && !category.empty_today) {
      return (

        <TouchableOpacity
          onPress={() => this.showCategory(category)}
          activeOpacity={1}
        >
          <ImageBackground
            style={
              Platform.isPad
                ? [styles.imageIpad, styles.containerStyleIpad]
                : { ...styles.image, ...styles.containerStyle }
            }
            source={{
              uri: "https://images.pexels.com/photos/128421/pexels-photo-128421.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            }}
          >
            <View style={styles.titleView}>
              <Text style={Platform.isPad ? styles.titleIpad : styles.title}>
                {category.id.toString()}
              </Text>
              <Text
                numberOfLines={2}
                style={Platform.isPad ? styles.titleIpad : styles.title}
              >
                {category.address || "-"}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    }
    return <View />;
  };

  renderContent = () => {
    const { isFetching } = this.props;

    if (isFetching) {
      return (
        <View style={[styles.horizontalLoading]}>
          <ActivityIndicator size="small" color="#00ff00" />
        </View>
      );
    }

    return (
      <FlatList
        style={styles.wrapListCate}
        onScroll={Animated.event([
          { nativeEvent: { contentOffset: { y: this.state.scrollY } } },
        ])}
        renderItem={this._renderItem}
        data={this.state.containers}
        onEndReachedThreshold={3}
      />
    );
  };

  filterData = (text) => {
    this.setState({ searchData: text });
    if (text !== "") {
      if (this.state.containersTemp.length > 0) {
        let data = [];
        data = this.state.containersTemp.filter((container) => {
          return text == container.id;
        });
        this.setState({ containers: data });
      }
    } else {
      this.setState({ containers: this.state.containersTemp });
    }
  };

  removeSearchData = () => {
    this.setState({ searchData: "", containers: this.state.containersTemp });
  };

  render() {
    if (this.state.appLoading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Spinkit size={30} type="FadingCircle" color="rgb(72,194,172)" />
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{Languages("containersHD")}</Text>
        </View>
        <View style={styles.textInputWrap}>
          <Icon name="search" size={20} color="#000000" />
          <TextInput
            placeholder={Languages("searchContainerPH")}
            underlineColorAndroid="transparent"
            style={Platform.isPad ? styles.textInputIpad : styles.textInput}
            value={this.state.searchData}
            onChangeText={(text) => this.filterData(text)}
            keyboardType={"decimal-pad"}
          />
          <TouchableOpacity
            style={Platform.isPad ? styles.searchRemIpad : styles.searchRem}
            onPress={() => this.removeSearchData()}
          >
            <Icon name="close" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
        {this.renderContent()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const categories = state.categories.list;
  const selectedLayout = state.categories.selectedLayout;
  const isFetching = state.categories.isFetching;
  const containersArray = state.categories.containersArray;

  return { categories, selectedLayout, isFetching, containersArray };
};

export default connect(mapStateToProps, {
  fetchCategories,
  setActiveCategory,
  setContainerArr,
})(Categories);
