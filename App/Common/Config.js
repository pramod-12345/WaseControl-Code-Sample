const productionURL = "https://api.example.com/";
const stageURL = "https://api.staging.example.com/";

const isProduction = true;

const Config = {
  AppName: "Logistic - AppName",
  Language: "en",
  URL: {
    baseUrl: isProduction ? productionURL : stageURL,
    login: "login",
    getAllContainers: "containers-pickup",
    getPickupRequests: "pickup-requests",
    getPickupContainers: "pickup-containers/",
    emptyContainer: "container/pickup-note",
    distanceMatrix:
      "https://maps.googleapis.com/maps/api/distancematrix/json?key=",
  },
  keys: {
    mapKey: "YOUR_GOOGLE_MAPS_API_KEY",
  },
  map: {
    LATITUDE_DELTA: 0.00222,
    LATITUDE_DELTA_USER: 0.0922,
  },
};

export default Config;
