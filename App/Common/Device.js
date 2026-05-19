import { Dimensions, Platform } from 'react-native'

const { width, height } = Dimensions.get('window');

const isIphoneX =
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (height >= 812 || width >= 812);

const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';
const isPad = Platform.isPad;
const isTVOS = Platform.isTVOS;

export default {
  isIOS,
  isAndroid,
  isPad,
  isTVOS,
  isIphoneX,
  ToolbarHeight: isIphoneX ? 35 : 0,
}
