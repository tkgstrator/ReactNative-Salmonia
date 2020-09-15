import React, { Component } from "react";
import { Alert, Linking, AsyncStorage, StyleSheet, View } from "react-native";
import CookieManager from '@react-native-community/cookies';
import { Container, Content, Text, Button } from "native-base";
import Modal from "react-native-modal";
import * as Progress from "react-native-progress";

global.auth_code_verifier = String

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

async function getSessionToken(session_token_code, auth_code_verifier) {
  // Get Session Token
  let url = "https://accounts.nintendo.com/connect/1.0.0/api/session_token";
  let header = {
    "Host": "accounts.nintendo.com",
    "Content-Type": "application/json",
    "Connecton": "keep-alive",
    "User-Agent": "com.nintendo.znca/1.9.0 (Android/7.1.2)",
    "Accept": "*/*",
    "Content-Length": "555",
    "Accept-Language": "en-ca",
    "Accept-Encoding": "gzip, deflate, br",
  };
  let body = {
    "client_id": "71b963c1b7b6d119",
    "session_token_code": session_token_code,
    "session_token_code_verifier": auth_code_verifier,
  };

  let response = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body),
  });
  let json = await response.json()
  let session_token = json["session_token"]
  console.log("SessionToken", session_token)
  return session_token
}

async function getAccessToken(session_token) {
  // Get Access Token
  let url = "https://accounts.nintendo.com/connect/1.0.0/api/token"
  let header = {
    "Host": "accounts.nintendo.com",
    "Content-Type": "application/json",
    "Connecton": "keep-alive",
    "User-Agent": "com.nintendo.znca/1.9.0 (Android/7.1.2)",
    "Accept": "*/*",
    "Content-Length": "439",
    "Accept-Language": "en-US",
    "Accept-Encoding": "gzip, deflate, br",
  };
  let body = {
    "client_id": "71b963c1b7b6d119",
    "session_token": session_token,
    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer-session-token"
  };
  let response = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body),
  });
  let json = await response.json()
  let access_token = json["access_token"]
  console.log("AccessToken", access_token)
  return access_token
}

async function callS2SAPI(access_token, timestamp, ver) {
  // Call s2s API
  let url = "https://elifessler.com/s2s/api/gen2"
  let body = {
    "naIdToken": access_token,
    "timestamp": timestamp
  }
  // s2s APIだけ何故かBodyの形式が違うので変換
  const queryString = require('query-string');
  body = queryString.stringify(body)
  console.log(body)
  let header = {
    "Host": "elifessler.com",
    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    "Connection": "keep-alive",
    "Accept": "*/*",
    "Accept-Language": "ja-JP;q=1.0, en-CA;q=0.9, zh-Hant-CA;q=0.8",
    "Content-Length": body.length,
    "User-Agent": "Salmonia for Android/" + ver,
    "Accept-Encoding": "br;q=1.0, gzip;q=0.9, deflate;q=0.8"
  };
  let response = await fetch(url, {
    method: "POST",
    headers: header,
    body: body,
    // body: JSON.stringify(body),
  });
  let json = await response.json()
  let hash = json["hash"]
  console.log("s2s API(NSO)", json, hash)
  return hash
}

async function callFlapgAPI(access_token, guid, type, ver) {
  let timestamp = String(parseInt(new Date().getTime() / 1000))
  // Call s2s API
  let hash = await callS2SAPI(access_token, timestamp, ver)
  // Call flapg API
  let url = "https://flapg.com/ika2/api/login?public"
  let header = {
    "x-token": access_token,
    "x-time": timestamp,
    "x-guid": guid, // 一時的に固定した値を使ってみる
    "x-hash": hash,
    "x-ver": "3",
    "x-iid": type,
    "User-Agent": "Salmonia for Android/" + ver
  };
  let response = await fetch(url, {
    method: "GET",
    headers: header,
  });
  let json = await response.json()
  let flapg = json["result"]
  console.log("flapg API(NSO)", flapg)
  return flapg
}

async function getSplatoonToken(flapg_nso) {
  // Get Splatoon Token
  let url = "https://api-lp1.znc.srv.nintendo.net/v1/Account/Login"
  let body = {
    "parameter": {
      "f": flapg_nso["f"],
      "naIdToken": flapg_nso["p1"],
      "timestamp": flapg_nso["p2"],
      "requestId": flapg_nso["p3"],
      "naCountry": "JP",
      "naBirthday": "1990-01-01",
      "language": "ja-JP"
    }
  }
  let header = {
    "Host": "api-lp1.znc.srv.nintendo.net",
    "Accept": "*/*",
    "X-ProductVersion": "1.9.0",
    "Accept-Language": "en-US",
    "Accept-Encoding": "gzip, deflate, br",
    "User-Agent": "com.nintendo.znca/1.9.0 (Android/7.1.2)",
    "Content-Type": "application/json; charset=utf-8",
    "Connection": "keep-alive",
    "Authorization": "Bearer",
    // "Content-Length": body.length,
    "X-Platform": "Android",
  };
  let response = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body)
  });
  let json = await response.json()
  let splatoon_token = json["result"]["webApiServerCredential"]["accessToken"]
  console.log("Splatoon Token", splatoon_token)
  return splatoon_token
}

async function getSplatoonAccessToken(splatoon_token, flapg_app) {
  // Get Splatoon Access Token
  let url = "https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken"
  let header = {
    "Host": "api-lp1.znc.srv.nintendo.net",
    "User-Agent": "com.nintendo.znca/1.9.0 Android",
    "Accept": "application/json",
    "X-ProductVersion": "1.9.0",
    "Content-Type": "application/json; charset=utf-8",
    "Connection": "Keep-Alive",
    "Authorization": "Bearer " + splatoon_token,
    "Content-Length": "267",
    "X-Platform": "Android",
    "Accept-Encoding": "gzip"
  }
  let body = {
    "parameter": {
      "id": 5741031244955648, // Splatoon Game ID
      "f": flapg_app["f"],
      "registrationToken": flapg_app["p1"],
      "timestamp": flapg_app["p2"],
      "requestId": flapg_app["p3"],
    }
  }
  let response = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body)
  });
  let json = await response.json()
  let splatoon_access_token = json["result"]["accessToken"]
  console.log("Splatoon Access Token", splatoon_access_token)
  return splatoon_access_token
}

async function getIksmSession(splatoon_access_token, ver) {
  // Get iksm_session
  let url = "https://app.splatoon2.nintendo.net"
  let header = {
    "Host": "app.splatoon2.nintendo.net",
    "X-IsAppAnalyticsOptedIn": "false",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Encoding": "gzip,deflate",
    "X-GameWebToken": splatoon_access_token,
    "Accept-Language": "en-US",
    "X-IsAnalyticsOptedIn": "false",
    "Connection": "keep-alive",
    "DNT": "0",
    "Cookie": "iksm_session=", // 空にして常に再生成する
    "User-Agent": "Salmonia for iOS/" + ver,
    "X-Requested-With": "com.nintendo.znca",
  }
  let response = await fetch(url, {
    method: "GET",
    headers: header,
  });
  let cookie = response.headers.get("set-cookie")
  let iksm_session = cookie.substr(13, 40)
  console.log(iksm_session)
  return iksm_session
}

async function getResultFromSplatNet2(job_num) {
  let iksm_session = await AsyncStorage.getItem("@iksm_session:key")
  let url = "https://app.splatoon2.nintendo.net/api/coop_results/" + job_num
  let header = {
    "cookie": "iksm_session=" + iksm_session,
  }
  let response = await fetch(url, {
    method: "GET",
    headers: header,

  });
  let result = await response.json()
  return result
}

async function uploadResultToSalmonStats(result) {
  let api_token = await AsyncStorage.getItem("@api_token:key")
  let url = "https://salmon-stats-api.yuki.games/api/results"
  let header = {
    "Content-type": "application/json",
    "Authorization": "Bearer " + api_token
  }
  let body = { "results": [result] }
  let response = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body)
  });
  return response.status
}

class AppConfig extends Component {
  state = {
    isModalVisible: false,
    text: String,
    now: 0,
    length: 1
  }

  toggleModal = async () => {
    this.setState({ isModalVisible: !this.state.isModalVisible })
  }

  componentDidMount() {
    Linking.addEventListener("url", this.handleOpenURL);
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL);
  }

  handleOpenURL = (deeplink) => {
    let session_token_code = deeplink.url.match("de=(.*)&")[1];
    this.loginSplatNet2(session_token_code, global.auth_code_verifier)
  }

  loginNintendoSwitchOnline = async () => {
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
    let url = "https://salmon-stats-api.yuki.games/api-token"
    let header = {
      "Cookie": "laravel_session=" + cookie
    }
    let response = await fetch(url, {
      method: "GET",
      headers: header,
    });
    let api_token = await response.json()
    await AsyncStorage.setItem("@api_token:key", api_token["api_token"])
    Alert.alert("Login Success!");
  }

  loginSplatNet2 = async (code, verifier) => {
    let ver = "1.0.1"
    let guid = "037239ef-1914-43dc-815d-178aae7d8934"

    this.toggleModal() // モーダルプログレスバー表示
    this.setState({ text: "session_tokenを取得しています", now: 0, length: 6 })
    let session_token = await getSessionToken(code, verifier)
    this.setState({ text: "access_tokenを取得しています", now: 1 })
    let access_token = await getAccessToken(session_token)
    this.setState({ text: "fを取得しています(1/2)", now: 2 })
    let flapg_nso = await callFlapgAPI(access_token, guid, "nso", ver)
    this.setState({ text: "splatoon_tokenを取得しています", now: 3 })
    let splatoon_token = await getSplatoonToken(flapg_nso)
    this.setState({ text: "fを取得しています(2/2)", now: 4 })
    let flapg_app = await callFlapgAPI(splatoon_token, guid, "app", ver)
    this.setState({ text: "splatoon_access_tokenを取得しています", now: 5 })
    let splatoon_access_token = await getSplatoonAccessToken(splatoon_token, flapg_app)
    this.setState({ text: "iksm_sessionを取得しています", now: 6 })
    let iksm_session = await getIksmSession(splatoon_access_token, ver)
    await AsyncStorage.setItem("@iksm_session:key", iksm_session)
    await AsyncStorage.setItem("@session_token:key", session_token)
    this.toggleModal() // モーダルプログレスバー表示
  }

  regenerateIksmSession = async () => {
    let ver = "1.0.1"
    let guid = "037239ef-1914-43dc-815d-178aae7d8934"

    let session_token = await AsyncStorage.getItem("@session_token:key")
    this.setState({ text: "access_tokenを取得しています", now: 0, length: 5 })
    let access_token = await getAccessToken(session_token)
    this.setState({ text: "fを取得しています(1/2)", now: 1 })
    let flapg_nso = await callFlapgAPI(access_token, guid, "nso", ver)
    this.setState({ text: "splatoon_tokenを取得しています", now: 2 })
    let splatoon_token = await getSplatoonToken(flapg_nso)
    this.setState({ text: "fを取得しています(2/2)", now: 3 })
    let flapg_app = await callFlapgAPI(splatoon_token, guid, "app", ver)
    this.setState({ text: "splatoon_access_tokenを取得しています", now: 4 })
    let splatoon_access_token = await getSplatoonAccessToken(splatoon_token, flapg_app)
    this.setState({ text: "iksm_sessionを取得しています", now: 5 })
    let iksm_session = await getIksmSession(splatoon_access_token, ver)
    await AsyncStorage.setItem("@iksm_session:key", iksm_session)
  }

  getJobNum = async () => {
    let iksm_session = await AsyncStorage.getItem("@iksm_session:key")
    let url = "https://app.splatoon2.nintendo.net/api/coop_results"
    let header = {
      "cookie": "iksm_sessions=" + iksm_session,
      "Cache-Control": "no-store"
    }
    let response = await fetch(url, {
      method: "GET",
      cache: "no-cache",
      headers: header,
    });
    let json = await response.json()
    // console.log(json)
    try {
      let job_num = json["summary"]["card"]["job_num"] // 最新のバイトID
      console.log(job_num)
      return job_num
    } catch {
      // 多分動くんちゃうかな、多分
      await this.regenerateIksmSession()
      await this.getJobNum()
    }
  }

  getResults = async () => {
    this.setState({ now: 0 })
    this.toggleModal() // モーダルプログレスバー表示

    this.setState({ text: "認証キーを確認しています(1/2)" })
    let iksm_session = await AsyncStorage.getItem("@iksm_session:key")

    if (iksm_session == null) {
      Alert.alert("iksm_session is not set!");
      this.toggleModal() // モーダルプログレスバー閉じる
      return
    }

    this.setState({ text: "認証キーを確認しています(2/2)" })
    let api_token = await AsyncStorage.getItem("@api_token:key")
    if (api_token == null) {
      Alert.alert("api_token is not set!");
      this.toggleModal() // モーダルプログレスバー閉じる
      return
    }

    this.setState({ text: "最新のバイトIDを取得しています" })
    let max = await this.getJobNum()
    let min = await AsyncStorage.getItem("@job_num:key") == null ? max - 49 : await AsyncStorage.getItem("@job_num:key")

    console.log("JOB ID", max, min)
    if (max == min) {
      this.setState({ text: "新しいバイト履歴がありません" })
      this.toggleModal() // モーダルプログレスバー閉じる
      return
    }
    this.setState({ length: max - min + 1 })

    for (let job_num = min; job_num <= max; job_num++) {
      this.setState({ text: "リザルトを取得しています" })
      this.setState({ now: job_num - min + 1 })

      let result = await getResultFromSplatNet2(job_num)
      let response = await uploadResultToSalmonStats(result)
    }
    await AsyncStorage.setItem("@job_num:key", max.toString()) // 何故かString型にしないといけない（なぜ）
    this.toggleModal() // モーダルプログレスバー閉じる
    return
  }

  render() {
    return (
      <Container style={{ alignItems: "center" }}>
        {/* <Header /> */}
        <Modal isVisible={this.state.isModalVisible}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
            <Progress.Pie animated={true} indeterminate={false} progress={this.state.now / this.state.length} size={200} />
            <View style={{ flexDirection: "column" }}>
              <Text>Developer @tkgling</Text>
              <Text>Special Thanks @ckoshien_tech</Text>
              <Text>AppIcon Design @barley_ural</Text>
              <Text>External API @frozenpandaman</Text>
              <Text>External API @nexusmine</Text>
              <Text>External API @yukinkling</Text>
            </View>
            <Text>{this.state.text}</Text>
          </View>
        </Modal>
        <View style={style.content}>
          <Button block large onPress={this.loginNintendoSwitchOnline} style={style.button}>
            <Text uppercase={false}>Login SplatNet2</Text>
          </Button>
        </View>
        <View style={style.content}>
          <Button block large onPress={this.loginSalmonStats} style={style.button}>
            <Text uppercase={false}>Login Salmon Stats</Text>
          </Button>
        </View>
        <View style={style.content}>
          <Button block large onPress={this.getResults} style={style.button}>
            <Text uppercase={false}>Upload Your Results</Text>
          </Button>
        </View>
      </Container >
    );
  }
}

const style = StyleSheet.create({
  content: {
    paddingBottom: 50,
    // borderRadius: 10,
    width: "80%",
    alignSelf: "center",
  },
})

export default AppConfig;