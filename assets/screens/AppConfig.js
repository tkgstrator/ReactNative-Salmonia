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

async function getSessionToken(session_token_url, auth_code_verifier) {
  let session_token_code = session_token_url.match("de=(.*)&")[1];
  let url = "https://accounts.nintendo.com/connect/1.0.0/api/session_token";
  let app_head = new Headers({
    "User-Agent": "OnlineLounge/1.6.1.2 NASDKAPI Android",
    "Accept-Language": "en-US",
    Accept: "application/json",
    "Content-Length": "541",
    Host: "accounts.nintendo.com",
    Connecton: "Keep-Alive",
    "Accept-Encoding": "gzip",
  });
  let body = {
    client_id: "71b963c1b7b6d119",
    session_token_code: session_token_code,
    session_token_code_verifier: auth_code_verifier,
  };
  try {
    let res = await fetch(url, {
      method: "POST",
      headers: app_head,
      body: JSON.stringify(body),
    });
    let json = await res.json();
    console.log("SESSION_TOKEN", json["session_token"]);
    return json["session_token"];
  } catch (error) {
    console.log(error);
  }
}

async function getAccessToken(session_token) {
  let url = "https://accounts.nintendo.com/connect/1.0.0/api/token";
  let app_head = new Headers({
    Host: "accounts.nintendo.com",
    "Accept-Encoding": "gzip",
    "Content-Type": "application/json; charset=utf-8",
    "Accept-Language": "en-US", // UserLang
    "Content-Length": "439",
    Accept: "application/json",
    Connecton: "Keep-Alive",
    "User-Agent": "OnlineLounge/1.6.1.2 NASDKAPI Android",
  });
  let body = {
    client_id: "71b963c1b7b6d119",
    session_token: session_token,
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer-session-token",
  }();
  try {
    let res = await fetch(url, {
      method: "POST",
      headers: app_head,
      body: JSON.stringify(body),
    });
    let json = await res.json();
    console.log("ACCESS_TOKEN", json["access_token"]);
    return json["access_token"];
  } catch (error) {
    console.log(error);
  }
}

async function getUserInfo(access_token) {
  let session_token_code = session_token_url.match("de=(.*)&")[1];
  let url = "https://api.accounts.nintendo.com/2.0.0/users/me";
  let app_head = new Headers({
    "User-Agent": "OnlineLounge/1.6.1.2 NASDKAPI Android",
    "Accept-Language": userLang,
    Accept: "application/json",
    Authorization: "Bearer " + access_token,
    Host: "api.accounts.nintendo.com",
    Connection: "Keep-Alive",
    "Accept-Encoding": "gzip",
  });
  try {
    let res = await fetch(url, {
      method: "GET",
      headers: app_head,
      body: JSON.stringify(body),
    });
    let json = await res.json();
    console.log("USER_INFO", json);
    return json;
  } catch (error) {
    console.log(error);
  }
}

async function getSplatoonToken(user_info, flapg_nso) {
  let url = "https://api-lp1.znc.srv.nintendo.net/v1/Account/Login";
  let app_head = new Headers({
    Host: "api-lp1.znc.srv.nintendo.net",
    "Accept-Language": userLang,
    "User-Agent": "com.nintendo.znca/1.6.1.2 (Android/7.1.2)",
    Accept: "application/json",
    "X-ProductVersion": "1.6.1.2",
    "Content-Type": "application/json; charset=utf-8",
    Connection: "Keep-Alive",
    Authorization: "Bearer",
    "Content-Length": "1036",
    "X-Platform": "Android",
    "Accept-Encoding": "gzip",
  });
  body = {
    f: flapg_nso["f"],
    naIdToken: flapg_nso["p1"],
    timestamp: flapg_nso["p2"],
    requestId: flapg_nso["p3"],
    naCountry: user_info["country"],
    naBirthday: user_info["birthday"],
    language: user_info["language"],
  };

  // 辞書型に変換する処理が要るかも
  try {
    let res = await fetch(url, {
      method: "POST",
      headers: app_head,
      body: JSON.stringify(body),
    });
    let json = await res.json();
    console.log(
      "USER_INFO",
      json["result"]["webApiServerCredential"]["accessToken"]
    );
    return json["result"]["webApiServerCredential"]["accessToken"];
  } catch (error) {
    console.log(error);
  }
}

async function getSplatoonAccessToken(splatoon_token, flapg_app) {
  let url = "https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken";
  let app_head = new Headers({
    Host: "api-lp1.znc.srv.nintendo.net",
    "User-Agent": "com.nintendo.znca/1.6.1.2 Android",
    Accept: "application/json",
    "X-ProductVersion": "1.6.1.2",
    "Content-Type": "application/json; charset=utf-8",
    Connection: "Keep-Alive",
    Authorization: "Bearer " + splatoon_token,
    "Content-Length": "37",
    "X-Platform": "Android",
    "Accept-Encoding": "gzip",
  });
  body = {
    id: 5741031244955648,
    f: flapg_app["f"],
    registrationToken: flapg_app["p1"],
    timestamp: flapg_app["p2"],
    requestId: flapg_app["p3"],
  };
  // 辞書型に変換する処理が要るかも
  try {
    let res = await fetch(url, {
      method: "POST",
      headers: app_head,
      body: JSON.stringify(body),
    });
    let json = await res.json();
    console.log("USER_INFO", json["result"]["accessToken"]);
    return json["result"]["accessToken"];
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
    // 押下したらログインのための情報を取得する
    let oauth = await getOAuthURL();
    this.state.auth_code_verifier = oauth["auth_code_verifier"];
    this.state.auth_url = oauth["auth_url"];
    Linking.openURL(this.state.auth_url);
  };

  getIksmSession = async () => {
    let session_token = getSessionToken("ReactNative-Salmonia");
    // let id_response = this.getAccessToken();
    // let access_token = id_response["access_token"];
    // let user_info = this.getUserInfo();
    // let flapg_nso = this.callFlapgAPI();
    // let splatoon_token = this.getSplatoonToken();
    // let flapg_app = this.callFlapgAPI();
    // let splatoo_access_token = this.getSplatoonAccessToken();
  };

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button title="SplatNet2" onPress={this.getIksmSession} />
        <Button title="Generate URL" onPress={this.loginSplatNet2} />
      </View>
    );
  }
}

export default AppConfig;
