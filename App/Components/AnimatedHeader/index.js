import React, { Component } from "react";
import { Animated, View, Platform } from "react-native";
import { Back } from "../../Navigation/Icons";
import styles from "./styles";
import { Images } from "../../Common";
const headerMinHeight = 50;

export default class AnimatedHeader extends Component {
  render() {
    const { scrollY, label, goBack, image, right } = this.props;

    const titleTransformY = scrollY.interpolate({
      inputRange: [0, headerMinHeight],
      outputRange: [0, -40],
      extrapolate: "clamp",
    });
    const titleTransformX = scrollY.interpolate({
      inputRange: [0, headerMinHeight],
      outputRange: [0, 25],
      extrapolate: "clamp",
    });
    const titleScale = scrollY.interpolate({
      inputRange: [0, headerMinHeight],
      outputRange: [1, 0.8],
      extrapolate: "clamp",
    });
    const navbarOpacity = scrollY.interpolate({
      inputRange: [0, headerMinHeight * 1.5],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.body}>
        <Animated.View
          style={
            Platform.isPad
              ? [styles.headerViewIpad, { opacity: navbarOpacity }]
              : [styles.headerView, { opacity: navbarOpacity }]
          }
        />
        {label && (
          <Animated.Text
            style={
              Platform.isPad
                ? [
                    styles.headerLabelIpad,
                    {
                      transform: [
                        { translateY: titleTransformY },
                        { translateX: titleTransformX },
                        { scale: titleScale },
                      ],
                    },
                  ]
                : [
                    styles.headerLabel,
                    {
                      transform: [
                        { translateY: titleTransformY },
                        { translateX: titleTransformX },
                        { scale: titleScale },
                      ],
                    },
                  ]
            }
          >
            {label}
          </Animated.Text>
        )}

        {image && (
          <Animated.Image
            source={image}
            style={
              Platform.isPad
                ? [
                    styles.headerImageIpad,
                    {
                      transform: [
                        { translateY: titleTransformY },
                        { translateX: titleTransformX },
                        { scale: titleScale },
                      ],
                    },
                  ]
                : [
                    styles.headerImage,
                    {
                      transform: [
                        { translateY: titleTransformY },
                        { translateX: titleTransformX },
                        { scale: titleScale },
                      ],
                    },
                  ]
            }
          />
        )}

        {typeof goBack != "undefined" ? (
          <View style={styles.homeMenu}>
            {Back(goBack, Images.icons.LongBack, "#000")}
          </View>
        ) : (
          <View style={styles.homeMenu} />
        )}

        {right && (
          <Animated.View
            style={
              Platform.isPad
                ? [
                    styles.headerRightIpad,
                    { transform: [{ translateY: titleTransformY }] },
                  ]
                : [
                    styles.headerRight,
                    { transform: [{ translateY: titleTransformY }] },
                  ]
            }
          >
            {right}
          </Animated.View>
        )}
      </View>
    );
  }
}
