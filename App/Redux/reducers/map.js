import { Config } from "../../Common";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE = 0;
const LONGITUDE = 0;
const LATITUDE_DELTA = Config.map.LATITUDE_DELTA; //0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const initialState = {
  region: {
    latitude: LATITUDE,
    longitude: LONGITUDE,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  },
  latitudeDelta: LATITUDE_DELTA - 0.02,
  longitudeDelta: LONGITUDE_DELTA - 0.02,
  index: 0,
  myPosition: "",
  isFetching: false,
};

export default (state = initialState) => {
  return state;
};
