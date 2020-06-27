import React, { Component } from "react";
import { TextInput, View, Button, Linking, StyleSheet, AsyncStorage } from "react-native";
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

  getResults = async () => {
    let iksm_session = await AsyncStorage.getItem('@iksm_session:key');
    let url, header, response

    console.log(iksm_session)
    url = "https://app.splatoon2.nintendo.net/api/coop_results"
    header = {
      "cookie": "iksm_session=" + iksm_session,
    }
    response = await fetch(url, {
      method: "GET",
      headers: header,
    });
    let json = await response.json()
    let job_num = json["summary"]["card"]["job_num"]
    console.log(job_num)
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button title="SplatNet2" onPress={this.loginSplatNet2} />
        <Button title="Download Result from SplatNet2" onPress={this.getResults} />
      </View>
    );
  }
}

export default AppConfig;