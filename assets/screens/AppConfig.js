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

  loginSplatNet2 = async () => {
    let oauth = await getOAuthURL();
    auth_code_verifier = oauth["auth_code_verifier"];
    Linking.openURL(oauth["auth_url"]);
  };

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button title="SplatNet2" onPress={this.loginSplatNet2} />
        {/* <Button title="DeepLink Test" onPress={() => Linking.openURL("npf71b963c1b7b6d119://auth")} /> */}
        {/* <Button title="Generate URL" onPress={this.loginSplatNet2} /> */}
      </View>
    );
  }
}

export default AppConfig;