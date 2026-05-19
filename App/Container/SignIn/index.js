import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { Spinkit } from "../../Components";
import { Config, Languages, Color } from "../../Common";
import * as SecureStore from "expo-secure-store";
import css from "./style";

const { baseUrl, login } = Config.URL;

export default class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      appLoading: false,
      email: "",
      password: "",
    };
  }

  updateLoading = (status) => this.setState({ loading: status });

  loginFailure = (message = Languages("defaultUnauthorised")) => {
    this.updateLoading(false);
    Alert.alert(Languages("loginFailALT_T"), message);
  };

  onSignIn = async () => {
    this.updateLoading(true);
    const isConnected = await SecureStore.getItemAsync("is_connection"); // Check internet connection.
    if (isConnected === "true") {
      // Business logic and API requests scrubbed for client demonstration.
      setTimeout(async () => {
        if (this.state.email && this.state.password) {
          // Mock successful login
          const mockToken = "mock_token_12345";
          const mockUserId = "1";
          this.setState({ email: "", password: "", loading: false });
          await SecureStore.setItemAsync("secure_token", mockToken);
          await SecureStore.setItemAsync("user_Id", mockUserId);
          this.props.toNextScreen();
        } else {
          // Mock failed login
          this.loginFailure("Invalid credentials");
        }
        this.updateLoading(false);
      }, 1000);
    }
  };

  checkForActiveToken = async () => {
    const token = await SecureStore.getItemAsync("secure_token");
    if (token) this.props.toNextScreen();
  };

  render() {
    this.checkForActiveToken();

    const { email, password, loading } = this.state;
    const { btnColor, blackTextDisable } = Color;
    let isBtnDisabled = !email || !password || loading;

    if (this.state.appLoading) {
      return <Spinkit size={30} type="FadingCircle" color="#FFFFFF" />;
    }

    return (
      <KeyboardAvoidingView>
        <View style={css.wrap}>
          <View style={css.body}>
            <View style={css.wrapForm}>
              <View style={css.textInputWrap}>
                <Text
                  style={Platform.isPad ? css.textLabelIpad : css.textLabel}
                >
                  {Languages("usernameLB")}
                </Text>
                <TextInput
                  placeholder={Languages("usernamePH")}
                  underlineColorAndroid="transparent"
                  style={Platform.isPad ? css.textInputIpad : css.textInput}
                  blurOnSubmit={false}
                  value={email}
                  onChangeText={(text) => this.setState({ email: text })}
                  onSubmitEditing={() => this.passField.focus()}
                  returnKeyType={"next"}
                />
              </View>

              <View style={css.textInputWrap}>
                <Text
                  style={Platform.isPad ? css.textLabelIpad : css.textLabel}
                >
                  {Languages("passwordLB")}
                </Text>
                <TextInput
                  placeholder={Languages("passwordPH")}
                  underlineColorAndroid="transparent"
                  style={Platform.isPad ? css.textInputIpad : css.textInput}
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => this.setState({ password: text })}
                  ref={(input) => (this.passField = input)}
                  onSubmitEditing={this.onSignIn}
                  returnKeyType={"done"}
                />
              </View>
            </View>

            <View style={css.wrapButton}>
              <TouchableOpacity
                style={[
                  Platform.isPad ? css.btnLogInIpad : css.btnLogIn,
                  {
                    backgroundColor: isBtnDisabled
                      ? blackTextDisable
                      : btnColor,
                  },
                ]}
                onPress={this.onSignIn}
                disabled={isBtnDisabled}
                activeOpacity={0.5}
              >
                {loading ? (
                  <Spinkit />
                ) : (
                  <Text
                    style={
                      Platform.isPad ? css.btnLogInTextIpad : css.btnLogInText
                    }
                  >
                    {Languages("signInBTN")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}
