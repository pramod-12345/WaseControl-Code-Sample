import {Platform} from 'react-native'
const isIOS = Platform.OS !== 'android';

export default {
  main: '#FFFFFF', // '#1CB5B4',
  toolbarTint: '#1CB5B4',
  text: '#333333',
  tabbar: 'rgba(255, 255, 255, 1)',
  tabbarTint: 'rgb(27, 229, 141)', //#2D2F3A
  tabbarColor: '#D5D8DE',
  background: '#fff',
  map: {
    defaultPinColor: '#ff0000',
    emptiedTodayPinColor: '#008000',
    multiContainersPinColor: isIOS ? 'navy' : 'cyan',
    loading: 'rgb(27, 229, 141)',
  },
  error: '#f44336',
  backButton: {
    button: 'rgba(0, 0, 0, .8)',
    text: '#FFF',
  },
  spin: '#333333',
  title: '#333333',
  blackTextPrimary: 'rgba(0,0,0,1)',
  blackTextDisable: 'rgba(0,0,0,0.3)',
  btnColor: 'rgb(72,194,172)',
  header: '#3c85a5',
}
