import * as Localization from "expo-localization";
import i18n from "i18n-js";
import { memoize } from "lodash";

//PH stands for Placeholder.
//LB, LBL stands for Label.
//BTN stands for Button.
//HD stands for Header.
//ALT stands for Alert.
const langs = {
  en: {
    //common
    oops: "Oops",
    error: "Error",
    success: "Success",
    didCatch: "Something went wrong. Try closing the app and opening it again",
    noInternet: "No internet connection, Please check your network.",
    no: "No",
    yes: "Yes",
    wrong: "Sorry for inconveniences. Something went wrong.",
    all: "All",
    pickup: "Pickup",
    continue: "Continue",
    //Sign In screen
    title: "Wastecontrol",
    usernameLB: "USERNAME",
    usernamePH: "Enter your username",
    passwordLB: "PASSWORD",
    passwordPH: "Enter your password",
    signInBTN: "Sign In",
    loginFailALT_T: "Unable to sign in",
    defaultUnauthorised: "Invalid Username or Password",
    //Pickup Requests screen
    PickupHD: "Pickup Requests",
    noPickups: "No Pickup requests for you now.",
    cantLogOutALT_M: `Unfortunately, we're unable to log you out at this moment.`,
    addressLB: "Address",
    contTypeLB: "Container Type",
    fractionTypeLB: "Fraction Type",
    pickupErrALT_T: `We can't fetch Pickup requests`,
    pickupErrALT_M: `Sorry, something went wrong.`,
    checkInternet: "Please check your internet connection and try again",
    errResALT_M:
      "Sorry for inconveniences. Something went wrong at server side.",
    driveModeTxt: "Your vehicle",
    weightModeTxt: "Are you entering container weight and note?",
    pickupContMode: "See all containers or only pickup containers?",
    //Containers list (tab 1)
    containersHD: "Containers",
    searchContainerPH: "Search container by ID",
    contErrResALT_T: `We can't fetch containers`,
    contFetchFailALT_M: `Fetching containers failed.`,
    //Container's Info screen
    contInfoHD: "Container information:",
    idLB: "ID: ",
    //Map Screen (tab 2)
    cantEmptyALT_T: "The container is already empty",
    cantEmptyALT_M: "You cannot empty this container today.",
    detailsLBL: "Details:",
    sensorIdLBL: "Sensor ID: ",
    fillingDegLBL: "Filling degree: ",
    addressLBL: "Address: ",
    batteryLBL: "Battery: ",
    contFracLBL: "Container fraction: ",
    contTypeLBL: "Container type: ",
    notFilled: "Not filled",
    emptyBTN: "Empty",
    emptiedSuccessALT_M: "Container emptied successfully",
    cantEmptyContALT_T: `We can't empty the container.`,
    noContainersALT: "There are no containers in this pickup request",
    allRoutesALT_T: "Would you like to have a route for all your containers?",
    contact: "Contact support@wastecontrol.dk",
    distanceErrALT_M: `We can't calculate distance for routes.`,
    emptiedLastALT_T: `You've emptied the last container`,
    emptiedLastALT_M: "No further directions could be fetched.",
    nextRouteErrALT_M: `Can't fetch next route.`,
    directionErr: `Sorry, we can't get direction for you`,
    directionsErr: `Sorry, we can't get directions for you`,
    tooFar: "Your location is too far from the containers.",
    locationPermission:
      "We need you to grant permission, for us to access your current location",
    currentLocALT_M: `Sorry, we're unable to fetch your current location.`,
    confirm: `Confirm first`,
    emptyAllALT_M: `Please confirm that all containers are emptied.`,
    emptyContErrALT_M: `Something went wrong, we are unable to empty the containers`,
    emptiedAll: `You've now reported all the containers emptied.`,
    directionsHD: "Directions",
    singleMode: "Drive for a single sensor",
    allMode: "Drive for all sensors",
    nextDirection: "Next location",
    here: `You're here`,
    contEmptyLB: "Containers to Empty",
    contEmptiedLB: "Containers Emptied",
    reportBTN: "Report containers emptied",
    modalHD: "Select container:",
    noContainer: "No Container found on this location",
    emptyContainerLB: "Empty Container",
    weightLB: "Weight (kg)",
    weightPH: "Weight of the container in kg",
    noteLB: "Note",
    notePH: "Write a note",
    cancel: "Cancel",
    report: "Report",
    alertTtl: "Choose driving mode",
    alertTxt: "Are you driving in a car or on a bike?",
    car: "Car",
    bike: "Bike",
    routeFinalized:
      "The route has been finalized, and you'll receive an email with the emptied containers.",
    //User (tab 3)
    viewPickups: "View Pickups",
    deleteAccount: "Delete Account",
    signOut: "Sign out",
    weighRequire: "Please enter the weight",

    map: "Map",
    satellite: "Satellite",
  },
  da: {
    //common
    oops: "Ups",
    error: "Fejl",
    success: "Succes",
    didCatch: "Noget gik galt. Prøv at lukke appen og åbne den igen",
    noInternet: "Ingen internetforbindelse. Tjek dit netværk.",
    no: "Nej",
    yes: "Ja",
    wrong: "Beklager. Noget gik galt.",
    all: "Alle",
    pickup: "Pickup",
    continue: "Fortsæt",
    //Sign In screen
    title: "Wastecontrol",
    usernameLB: "BRUGERNAVN",
    usernamePH: "Skriv dit brugernavn",
    passwordLB: "ADGANGSKODE",
    passwordPH: "Skriv dit kodeord",
    signInBTN: "Log ind",
    loginFailALT_T: "Kan ikke logge ind",
    defaultUnauthorised: "Ugyldigt brugernavn eller kodeord",
    //Pickup Requests screen
    PickupHD: "Pickup requests klar til afhentning",
    noPickups: "Ingen pickup requests til afhentning for dig nu.",
    cantLogOutALT_M: `Vi er desværre ikke i stand til at logge dig ud lige nu.`,
    addressLB: "Adresse",
    contTypeLB: "Container type",
    fractionTypeLB: "Fraktion",
    pickupErrALT_T: `Vi kan ikke hente pickup requests`,
    pickupErrALT_M: "Beklager, noget gik galt.",
    checkInternet: "Tjek din internetforbindelse, og prøv igen",
    errResALT_M: "Beklager. Der gik noget galt på serversiden.",
    driveModeTxt: "Dit køretøj",
    weightModeTxt: "Indtaster du containervægt og note?",
    pickupContMode: "Se alle containere eller kun pickup containere?",
    //Containers list (tab 1)
    containersHD: "Containere",
    searchContainerPH: "Søg efter container med ID",
    contErrResALT_T: `Vi kan ikke hente containere`,
    contFetchFailALT_M: `Hentning af containere mislykkedes.`,
    //Container's Info screen
    contInfoHD: "Container information:",
    idLB: "ID: ",
    //Map Screen (tab 2)
    cantEmptyALT_T: "Containeren er allerede tømt",
    cantEmptyALT_M: "Du kan ikke tømme denne container i dag.",
    detailsLBL: "Detaljer:",
    sensorIdLBL: "Sensor ID: ",
    fillingDegLBL: "Fyldningsgrad: ",
    addressLBL: "Adresse: ",
    batteryLBL: "Batteri: ",
    contFracLBL: "Container fraktion: ",
    contTypeLBL: "Container type: ",
    notFilled: "Ikke udfyldt",
    emptyBTN: "Tøm",
    emptiedSuccessALT_M: "Containeren blev tømt med succes",
    cantEmptyContALT_T: `Vi kan ikke tømme containeren.`,
    noContainersALT: "Der er ingen containere i denne pickup request",
    allRoutesALT_T: "Vil du gerne have en rute for alle dine containere?",
    contact: "Kontakt support@wastecontrol.dk",
    distanceErrALT_M: `Vi kan ikke beregne afstanden for ruten.`,
    emptiedLastALT_T: `Du har tømt den sidste container`,
    emptiedLastALT_M: "Ingen yderligere lokationer kunne hentes.",
    nextRouteErrALT_M: `Kan ikke hente næste rute.`,
    directionErr: `Beklager, vi kan ikke lave ruten for dig`,
    directionsErr: `Vi kan desværre ikke lave en rutevejledning til dig`,
    tooFar: "Din placering er for langt fra containerne.",
    locationPermission: "Giv os adgang til at hente din nuværende placering",
    currentLocALT_M: `Beklager, det er ikke muligt at hente din nuværende placering.`,
    confirm: `Bekræft først`,
    emptyAllALT_M: `Venligst bekræft, at alle containere er tømt`,
    emptyContErrALT_M: `Der gik noget galt, vi kan ikke tømme containerne`,
    emptiedAll: `De registrerede tømninger er nu rapporteret`,
    directionsHD: "Kørselsvejledning",
    singleMode: "Kør for en sensor",
    allMode: "Kør for alle sensorer",
    nextDirection: "Næste lokation",
    here: `Du er her`,
    contEmptyLB: "Containere til tømning",
    contEmptiedLB: "Containere tømt",
    reportBTN: "Rapportér containere tømt",
    modalHD: "Vælg Container:",
    noContainer: "Der blev ikke fundet nogen container på denne lokation",
    emptyContainerLB: "Tøm container",
    weightLB: "Vægt (kg)",
    weightPH: "Vægt af containeren i kg",
    noteLB: "Bemærk",
    notePH: "Skriv en note",
    cancel: "Annuller",
    report: "Rapportér",
    alertTtl: "Vælg køretøj",
    alertTxt: "Kører du i bil eller på cykel?",
    car: "Bil",
    bike: "Cykel",
    routeFinalized:
      "Ruten er nu færdiggjort og du vil modtage en email med de tømte containere.",
    //User (tab 3)
    viewPickups: "Vis pickup requests",
    deleteAccount: "Slet konto",
    signOut: "Log ud",
    weighRequire: "Indtast venligst vægten",

    map: "Kort",
    satellite: "Satellit",
  },
  es: {
    //common
    oops: "¡Vaya!",
    error: "Error",
    success: "Éxito",
    didCatch: "Algo salió mal. Intente cerrar la aplicación y volver a abrirla",
    noInternet: "No hay conexión a Internet, verifique su red.",
    no: "No",
    yes: "Sí",
    wrong: "Disculpen las molestias. Algo salió mal.",
    all: "Todo",
    pickup: "Recogida",
    continue: "Continuar",
    //Sign In screen
    title: "Wastecontrol",
    usernameLB: "NOMBRE DE USUARIO",
    usernamePH: "Ingrese el nombre de usuario",
    passwordLB: "CONTRASEÑA",
    passwordPH: "Ingrese la contraseña",
    signInBTN: "Iniciar sesión",
    loginFailALT_T: "No se puede iniciar sesión",
    defaultUnauthorised: "Nombre de usuario o contraseña no válidos",
    //Pickup Requests screen
    PickupHD: "Solicitudes de recogida",
    noPickups: "No hay solicitudes de recogida para usted ahora.",
    cantLogOutALT_M: `Desafortunadamente, no podemos cerrar la sesión en este momento.`,
    addressLB: "Dirección",
    contTypeLB: "Tipo de contenedor",
    fractionTypeLB: "Tipo de fracción",
    pickupErrALT_T: `No podemos recuperar las solicitudes de recogida`,
    pickupErrALT_M: `Lo sentimos, algo salió mal.`,
    checkInternet: "Compruebe la conexión a Internet e inténtelo de nuevo",
    errResALT_M:
      "Disculpen las molestias. Algo salió mal en el lado del servidor.",
    driveModeTxt: "Su vehículo",
    weightModeTxt: "¿Está ingresando el peso del contenedor y la nota?",
    pickupContMode:
      "¿Ver todos los contenedores o solo los contenedores de recogida?",
    //Containers list (tab 1)
    containersHD: "Contenedores",
    searchContainerPH: "Buscar contenedor por ID",
    contErrResALT_T: `No podemos recuperar contenedores`,
    contFetchFailALT_M: `Error en la obtención de contenedores.`,
    //Container's Info screen
    contInfoHD: "Información del contenedor:",
    idLB: "IDENTIFICACIÓN: ",
    //Map Screen (tab 2)
    cantEmptyALT_T: "El contenedor ya está vacío",
    cantEmptyALT_M: "No puede vaciar este contenedor hoy.",
    detailsLBL: "Detalles:",
    sensorIdLBL: "Sensor ID: ",
    fillingDegLBL: "Grado de llenado: ",
    addressLBL: "Dirección: ",
    batteryLBL: "Batería: ",
    contFracLBL: "Fracción en contenedor: ",
    contTypeLBL: "Tipo de contenedor: ",
    notFilled: "No relleno",
    emptyBTN: "Vacío",
    emptiedSuccessALT_M: "El contenedor se ha vaciado con éxito",
    cantEmptyContALT_T: `No podemos vaciar el contenedor.`,
    noContainersALT: "No hay contenedores en esta solicitud de recogida",
    allRoutesALT_T: "¿Te gustaría tener una ruta para todos tus contenedores?",
    contact: "Contacta con support@wastecontrol.dk",
    distanceErrALT_M: `No podemos calcular la distancia de las rutas.`,
    emptiedLastALT_T: `Has vaciado el último contenedor`,
    emptiedLastALT_M: "No se pudieron obtener más indicaciones.",
    nextRouteErrALT_M: `No se puede recuperar la siguiente ruta.`,
    directionErr: `Lo sentimos, no podemos darle instrucciones`,
    directionsErr: `Lo sentimos, no podemos darle indicaciones`,
    tooFar: "Su ubicación está demasiado lejos de los contenedores.",
    locationPermission:
      "Necesitamos que nos conceda permiso para que podamos acceder a su ubicación actual",
    currentLocALT_M: `Lo sentimos, no podemos recuperar su ubicación actual.`,
    confirm: `Confirmar primero`,
    emptyAllALT_M: `Confirme que todos los contenedores estén vacíos.`,
    emptyContErrALT_M: `Algo salió mal, no podemos vaciar los contenedores`,
    emptiedAll: `Ahora ha informado de todos los contenedores vaciados.`,
    directionsHD: "Indicaciones",
    singleMode: "Conducir hacia un único contenedor",
    allMode: "Conduzca por todos los sensores",
    nextDirection: "Próxima ubicación",
    here: `Estás aquí`,
    contEmptyLB: "Contenedores para vaciar",
    contEmptiedLB: "Contenedores vaciados",
    reportBTN: "Informe de contenedores vaciados",
    modalHD: "Seleccionar contenedor:",
    noContainer: "No se encontró ningún contenedor en esta ubicación",
    emptyContainerLB: "Contenedor vacío",
    weightLB: "Peso (kg)",
    weightPH: "Peso del contenedor en kg",
    noteLB: "Nota",
    notePH: "Escribe una nota",
    cancel: "Cancelar",
    report: "Informe",
    alertTtl: "Elegir el modo de conducción",
    alertTxt: "¿Conduces en coche o en bicicleta?",
    car: "Coche",
    bike: "Bicicleta",
    routeFinalized:
      "La ruta se ha finalizado y recibirá un correo electrónico con los contenedores vaciados.",
    //User (tab 3)
    viewPickups: "Ver recogidas",
    deleteAccount: "Eliminar cuenta",
    signOut: "Cerrar sesión",
    weighRequire: "Por favor, introduzca el peso",

    map: "Mapa",
    satellite: "Satélite",
  },
};

i18n.fallbacks = true;
i18n.translations = langs;
i18n.locale = Localization.locale; //detect from device's setting.
// i18n.locale = 'en'; //only single language.

const Languages = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key)
);

const setI18nConfig = (language = null) => {
  i18n.locale = language;
};

const updatefractionLanguageKey = () => {
  switch (Localization.locale.split("-")[0]) {
    case "en":
      return "fraction_en";
    case "es":
      return "fraction_es";
    case "da":
      return "fraction";
    default:
      return "fraction_en";
  }
};
const updateContainerTypeLanguageKey = () => {
  switch (Localization.locale.split("-")[0]) {
    case "en":
      return "container_type_en";
    case "es":
      return "container_type_es";
    case "da":
      return "container_type";
    default:
      return "container_type_en";
  }
};

export {
  setI18nConfig,
  Languages,
  updatefractionLanguageKey,
  updateContainerTypeLanguageKey,
};
