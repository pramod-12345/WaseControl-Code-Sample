import React, { Component } from 'react'
import { View, StyleSheet, Image } from 'react-native'

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center'
  },
  icon: {
    width: 20,
    height: 18,
    resizeMode: 'contain',
  }
});

export default class Index extends Component {
  render() {
    const {iconStatic, icon, tintColor, css} = this.props;

    return (
      <View style={styles.container}>
       <Image
          source={iconStatic ? iconStatic : { uri: icon }}
          style={[styles.icon, css, { tintColor: tintColor }]}
        />
      </View>
    )
  }
}
