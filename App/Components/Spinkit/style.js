import React, {StyleSheet, Dimensions} from 'react-native'

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  spinner: {
    width: width,
    alignItems: 'center',
  },
})
