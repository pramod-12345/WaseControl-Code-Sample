import React, {StyleSheet, Dimensions} from 'react-native'

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  icon: {
    fontSize: 40,
    color: '#494949',
  },
  logo: {
    resizeMode: 'contain',
    height: 22,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
  },
  image: {
    width: width - 20,
  },
  buttonText: {
    color: '#eee',
    alignSelf: 'center',
    fontSize: 18,
  },
  textInput: {
    height: 40,
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.9)',
    paddingLeft: 40,
  },
  textInputIpad: {
    height: 80,
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.9)',
    paddingLeft: 80,
  }
})
