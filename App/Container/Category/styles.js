import React, {StyleSheet, Dimensions} from 'react-native'
import { Constants } from '@common'

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  flatlist: {
    marginTop: 35,
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  body: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  box: {
    borderRadius: 6,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  content: {
    backgroundColor: 'transparent',
    width: width,
    height: height * 90 / 100,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  image: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 15,
    height: 150,
    marginBottom: 30,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  titleView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    color: 'white',
    fontFamily: Constants.fontFamilyBold,
  },
  containerStyle: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  }
})
