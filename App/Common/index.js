import _Color from './Color'
import _Constants from './Constants'
import _Images from './Images'
import { setI18nConfig, Languages } from './Languages'
import _Style from './style'
import _Config from './Config'
import _Device from './Device'
import reactotron from 'reactotron-react-native'

const log = (values) => __DEV__ && reactotron.log(values);
const warn = (values) => __DEV__ && reactotron.warn(values);
const error = (values) => __DEV__ && reactotron.error(values);
export function connectConsoleToReactotron() {
  console.log = log;
  console.warn = warn;
  console.error = error
}

export const request = async (url, data = {}) => {
  try {
    const response = await fetch(url, data);

    return await response.json()
  } catch (err) {
    error(err);
    return { error: err }
  }
};

export const Color = _Color;
export const Constants = _Constants;
export const Images = _Images;
export { Languages, setI18nConfig }
export const Style = _Style;
export const Config = _Config;
export const Device = _Device;
