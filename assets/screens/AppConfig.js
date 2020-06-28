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
    let iksm_session = await AsyncStorage.getItem("@iksm_session:key")
    let url, body, header, response, json
    let api_token = "e177c07226e9195215a43a7686401852542cc5aa52899bf47834b8a9f4803cbb"

    url = "https://app.splatoon2.nintendo.net/api/coop_results"
    header = {
      "cookie": "iksm_session=" + iksm_session,
    }
    response = await fetch(url, {
      method: "GET",
      headers: header,
    });
    json = await response.json()
    let max = json["summary"]["card"]["job_num"] // 最新のバイトID
    let min = await AsyncStorage.getItem("@job_num:key") == null ? max - 49 : await AsyncStorage.getItem("@job_num:key")

    console.log(max, min)
    for (let job_num = min; job_num <= max; job_num++) {
      // Get Result from SplatNet2
      console.log("Downloading JobID", min)
      url = "https://app.splatoon2.nintendo.net/api/coop_results/" + job_num
      header = {
        "cookie": "iksm_session=" + iksm_session
      }
      response = await fetch(url, {
        method: "GET",
        headers: header,
      });
      json = await response.json()
      // Upload Result to Salmon Stats
      url = "https://salmon-stats-api.yuki.games/api/results"
      header = {
        "Content-type": "application/json",
        "Authorization": "Bearer " + api_token
      }
      body = { "results": [json] }
      response = await fetch(url, {
        method: "POST",
        headers: header,
        body: JSON.stringify(body)
      });
      console.log(response.status)
      console.log("Uploading JobID", job_num)
    }
    // 最新のバイトIDに更新する
    await AsyncStorage.setItem("@job_num:key", max.toString()) // 何故かString型にしないといけない（なぜ）

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