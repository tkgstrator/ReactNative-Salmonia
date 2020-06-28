import React, { Component } from "react";
import { Alert, Linking, AsyncStorage, StyleSheet } from "react-native";
import CookieManager from '@react-native-community/cookies';
import { Container, Header, Left, Body, Right, Title, Button } from "native-base";
import { Content, List, ListItem, Text, Icon, Switch, Thumbnail } from "native-base";

export interface Cookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  version?: string;
  expires?: string;
  secure?: boolean;
  httpOnly?: boolean;
}

export interface Cookies {
  [key: string]: Cookie;
}

CookieManager.get("https://salmon-stats.yuki.games/")
  .then((cookies) => {
    let laravel_session = cookies["laravel_session"]["value"]
    AsyncStorage.setItem("@laravel_session:key", laravel_session)
  });

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

  loginSalmonStats = async () => {
    let cookie = await AsyncStorage.getItem("@laravel_session:key")
    if (cookie == null) {
      Alert.alert("Login Salmon Stats First!");
      return
    }
    console.log(cookie)
    let url = "https://salmon-stats-api.yuki.games/api-token"
    let header = {
      "Cookie": "laravel_session=" + cookie
    }
    let response = await fetch(url, {
      method: "GET",
      headers: header,
    });
    let api_token = await response.json()
    console.log(api_token["api_token"])
    await AsyncStorage.setItem("@api_token:key", api_token["api_token"])
    Alert.alert("Login Success!");
  }

  getResults = async () => {
    let iksm_session = await AsyncStorage.getItem("@iksm_session:key")
    if (iksm_session == null) {
      Alert.alert("iksm_session is not set!");
    }
    let api_token = await AsyncStorage.getItem("@api_token:key")
    if (api_token == null) {
      Alert.alert("api_token is not set!");
    }
    let url, body, header, response, json

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

    console.log("InfoMgr:", api_token, iksm_session, max, min)
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
    Alert.alert("Complete!");
  }

  render() {
    return (
      <Container>
        <Header />
        <Content style={style.content}>
          <Button block large onPress={this.loginSplatNet2}>
            <Text>Login SplatNet2</Text>
          </Button>
          <Button block large onPress={this.loginSalmonStats}>
            <Text>Login Salmon Stats</Text>
          </Button>
          <Button block large onPress={this.getResults}>
            <Text>Upload Your Results</Text>
          </Button>
        </Content>
      </Container>
      // <Button title="SplatNet2" onPress={this.loginSplatNet2} />
      // <Button title="SalmonStats" onPress={this.loginSalmonStats} />
      // <Button title="Download Result from SplatNet2" onPress={this.getResults} />
    );
  }
}

const style = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: "#F0F0F0"
  }
})

export default AppConfig;