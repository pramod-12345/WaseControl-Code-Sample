import React, { Component } from "react";
import { User } from "../Container";
import { connect } from "react-redux";

class UserProfileScreen extends Component {
  static navigationOptions = {
    header: null,
  };

  render = () => {
    const { user, navigation } = this.props;
    return (
      <User
        userData={user.data}
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />
    );
  };
}
const mapStateToProps = ({ user }) => ({ user });
export default connect(mapStateToProps)(UserProfileScreen);
