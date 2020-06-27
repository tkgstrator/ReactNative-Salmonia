import React, { Component } from "react";
import { Text, View, Linking, AsyncStorage } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { WebView } from "react-native-webview";
import AppConfig from "./assets/screens/AppConfig";

global.auth_code_verifier = String

async function getSessionToken(session_token_code, auth_code_verifier) {
  let ver = "1.0.0"
  let url, header, body, response, json, hash
  let timestamp = String(parseInt(new Date().getTime() / 1000))
  let guid = "037239ef-1914-43dc-815d-178aae7d8934"

  // Get Session Token
  url = "https://accounts.nintendo.com/connect/1.0.0/api/session_token";
  header = {
    "Host": "accounts.nintendo.com",
    "Content-Type": "application/json",
    "Connecton": "keep-alive",
    "User-Agent": "com.nintendo.znca/1.6.1.2 (Android/7.1.2)",
    "Accept": "*/*",
    "Content-Length": "555",
    "Accept-Language": "en-ca",
    "Accept-Encoding": "gzip, deflate, br",
  };
  body = {
    "client_id": "71b963c1b7b6d119",
    "session_token_code": session_token_code,
    "session_token_code_verifier": auth_code_verifier,
  };

  response = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body),
  });
  json = await response.json()
  let session_token = json["session_token"]
  console.log("SessionToken", session_token)

  // Get Access Token
  url = "https://accounts.nintendo.com/connect/1.0.0/api/token"
  header = {
    "Host": "accounts.nintendo.com",
    "Content-Type": "application/json",
    "Connecton": "keep-alive",
    "User-Agent": "com.nintendo.znca/1.6.1.2 (Android/7.1.2)",
    "Accept": "*/*",
    "Content-Length": "439",
    "Accept-Language": "en-US",
    "Accept-Encoding": "gzip, deflate, br",
  };
  body = {
    "client_id": "71b963c1b7b6d119",
    "session_token": session_token,
    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer-session-token"
  };
  response = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body),
  });
  json = await response.json()
  let access_token = json["access_token"]
  console.log("AccessToken", access_token)

  // Call s2s API
  url = "https://elifessler.com/s2s/api/gen2"
  body = {
    "naIdToken": access_token,
    "timestamp": timestamp
  }
  // s2s APIだけ何故かBodyの形式が違うので変換
  const queryString = require('query-string');
  body = queryString.stringify(body)
  header = {
    "Host": "elifessler.com",
    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    "Connection": "keep-alive",
    "Accept": "*/*",
    "Accept-Language": "ja-JP;q=1.0, en-CA;q=0.9, zh-Hant-CA;q=0.8",
    "Content-Length": body.length,
    "User-Agent": "Salmonia for Android/" + ver,
    "Accept-Encoding": "br;q=1.0, gzip;q=0.9, deflate;q=0.8"
  };
  response = await fetch(url, {
    method: "POST",
    headers: header,
    body: body,
    // body: JSON.stringify(body),
  });
  json = await response.json()
  hash = json["hash"]
  console.log("s2s API(NSO)", json, hash)

  // Call flapg API
  url = "https://flapg.com/ika2/api/login?public"
  header = {
    "x-token": access_token,
    "x-time": timestamp,
    "x-guid": guid, // 一時的に固定した値を使ってみる
    "x-hash": hash,
    "x-ver": "3",
    "x-iid": "nso",
    "User-Agent": "Salmonia for Android/" + ver
  };
  response = await fetch(url, {
    method: "GET",
    headers: header,
  });
  json = await response.json()
  let flapg_nso = json["result"]
  console.log("flapg API(NSO)", flapg_nso)

  // Get Splatoon Token
  url = "https://api-lp1.znc.srv.nintendo.net/v1/Account/Login"
  body = {
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
  header = {
    "Host": "api-lp1.znc.srv.nintendo.net",
    "Accept": "*/*",
    "X-ProductVersion": "1.6.1.2",
    "Accept-Language": "en-US",
    "Accept-Encoding": "gzip, deflate, br",
    "User-Agent": "com.nintendo.znca/1.6.1.2 (Android/7.1.2)",
    "Content-Type": "application/json; charset=utf-8",
    "Connection": "keep-alive",
    "Authorization": "Bearer",
    // "Content-Length": body.length,
    "X-Platform": "Android",
  };
  response = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body)
  });
  json = await response.json()
  let splatoon_token = json["result"]["webApiServerCredential"]["accessToken"]
  console.log("Splatoon Token", splatoon_token)

  // Call s2s API
  url = "https://elifessler.com/s2s/api/gen2"
  body = {
    "naIdToken": splatoon_token,
    "timestamp": timestamp
  }
  // s2s APIだけ何故かBodyの形式が違うので変換
  body = queryString.stringify(body)
  header = {
    "Host": "elifessler.com",
    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    "Connection": "keep-alive",
    "Accept": "*/*",
    "Accept-Language": "ja-JP;q=1.0, en-CA;q=0.9, zh-Hant-CA;q=0.8",
    "Content-Length": body.length,
    "User-Agent": "Salmonia for Android/" + ver,
    "Accept-Encoding": "br;q=1.0, gzip;q=0.9, deflate;q=0.8"
  };
  response = await fetch(url, {
    method: "POST",
    headers: header,
    body: body,
    // body: JSON.stringify(body),
  });
  json = await response.json()
  hash = json["hash"]
  console.log("s2s API(APP)", json, hash)

  // Call flapg API
  url = "https://flapg.com/ika2/api/login?public"
  header = {
    "x-token": splatoon_token,
    "x-time": timestamp,
    "x-guid": guid, // 一時的に固定した値を使ってみる
    "x-hash": hash,
    "x-ver": "3",
    "x-iid": "app",
    "User-Agent": "Salmonia for Android/" + ver
  };
  response = await fetch(url, {
    method: "GET",
    headers: header,
  });
  json = await response.json()
  let flapg_app = json["result"]
  console.log("flapg API(APP)", flapg_app)

  // Get Splatoon Access Token
  url = "https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken"
  header = {
    "Host": "api-lp1.znc.srv.nintendo.net",
    "User-Agent": "com.nintendo.znca/1.6.1.2 Android",
    "Accept": "application/json",
    "X-ProductVersion": "1.6.1.2",
    "Content-Type": "application/json; charset=utf-8",
    "Connection": "Keep-Alive",
    "Authorization": "Bearer " + splatoon_token,
    "Content-Length": "267",
    "X-Platform": "Android",
    "Accept-Encoding": "gzip"
  }
  body = {
    "parameter": {
      "id": 5741031244955648, // Splatoon Game ID
      "f": flapg_app["f"],
      "registrationToken": flapg_app["p1"],
      "timestamp": flapg_app["p2"],
      "requestId": flapg_app["p3"],
    }
  }
  response = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body)
  });
  json = await response.json()
  console.log(response, json)
  let splatoon_access_token = json["result"]["accessToken"]
  console.log("Splatoon Access Token", splatoon_access_token)

  // Get iksm_session
  url = "https://app.splatoon2.nintendo.net"
  header = {
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
    "X-Requested-With": "com.nintendo.znca"
  }
  response = await fetch(url, {
    method: "GET",
    headers: header,
  });
  let cookie = response.headers.get("set-cookie")
  let iksm_session = cookie.substr(13, 40)

  await AsyncStorage.setItem("@iksm_session:key", iksm_session)
}

class App extends Component {
  state = {
    response: {}
  }

  componentDidMount() {
    Linking.addEventListener("url", this.handleOpenURL);
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL);
  }

  handleOpenURL = (deeplink) => {
    let session_token_code = deeplink.url.match("de=(.*)&")[1];

    let session_token = getSessionToken(session_token_code, global.auth_code_verifier)
  }

  render() {
    return (
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    );
  }
}

class SalmonStats extends Component {
  render() {
    return <WebView source={{ uri: "https://salmon-stats.yuki.games/" }} />;
  }
}

function Profile() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile!</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      tabBarOptions={{
        activeTintColor: "#e91e63",
      }}
    >
      <Tab.Screen
        name="SalmonStats"
        component={SalmonStats}
        options={{
          tabBarLabel: "SalmonStats",
        }}
      />
      <Tab.Screen
        name="Config"
        // component={() => <AppConfig />}
        component={AppConfig}
        options={{
          tabBarLabel: "Config",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

export default App;