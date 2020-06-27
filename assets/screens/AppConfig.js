import React, { Component } from "react";
import { TextInput, View, Button, Linking, StyleSheet } from "react-native";
import { Body } from "native-base";

async function getOAuthURL() {
  try {
    let res = await fetch("https://salmonia.mydns.jp/");
    let json = await res.json();
    return json;
  } catch (error) {
    console.log(error);
  }
}

class AppConfig extends Component {
  state = {
    auth_url: String,
    auth_code_verifier: String,
    session_token_code: String,
    onChangeText: String,
    text: String,
  };

  loginSplatNet2 = async () => {
    let oauth = await getOAuthURL();
    this.state.auth_code_verifier = oauth["auth_code_verifier"];
    this.state.auth_url = oauth["auth_url"];
    Linking.openURL(this.state.auth_url);
  };

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button title="SplatNet2" onPress={this.loginSplatNet2} />
        {/* <Button title="Generate URL" onPress={this.loginSplatNet2} /> */}
      </View>
    );
  }
}

export default AppConfig;