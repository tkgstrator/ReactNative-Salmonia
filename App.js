import React, { Component } from "react";
import { Alert, Linking, AsyncStorage } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome";
import AppConfig from "./assets/screens/AppConfig";
import SalmonStats from "./assets/screens/SalmonStats";

// global.auth_code_verifier = String

// async function getSessionToken(session_token_code, auth_code_verifier) {
//   // Get Session Token
//   let url = "https://accounts.nintendo.com/connect/1.0.0/api/session_token";
//   let header = {
//     "Host": "accounts.nintendo.com",
//     "Content-Type": "application/json",
//     "Connecton": "keep-alive",
//     "User-Agent": "com.nintendo.znca/1.6.1.2 (Android/7.1.2)",
//     "Accept": "*/*",
//     "Content-Length": "555",
//     "Accept-Language": "en-ca",
//     "Accept-Encoding": "gzip, deflate, br",
//   };
//   let body = {
//     "client_id": "71b963c1b7b6d119",
//     "session_token_code": session_token_code,
//     "session_token_code_verifier": auth_code_verifier,
//   };

//   let response = await fetch(url, {
//     method: "POST",
//     headers: header,
//     body: JSON.stringify(body),
//   });
//   let json = await response.json()
//   let session_token = json["session_token"]
//   console.log("SessionToken", session_token)
//   return session_token
// }

// async function getAccessToken(session_token) {
//   // Get Access Token
//   let url = "https://accounts.nintendo.com/connect/1.0.0/api/token"
//   let header = {
//     "Host": "accounts.nintendo.com",
//     "Content-Type": "application/json",
//     "Connecton": "keep-alive",
//     "User-Agent": "com.nintendo.znca/1.6.1.2 (Android/7.1.2)",
//     "Accept": "*/*",
//     "Content-Length": "439",
//     "Accept-Language": "en-US",
//     "Accept-Encoding": "gzip, deflate, br",
//   };
//   let body = {
//     "client_id": "71b963c1b7b6d119",
//     "session_token": session_token,
//     "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer-session-token"
//   };
//   let response = await fetch(url, {
//     method: "POST",
//     headers: header,
//     body: JSON.stringify(body),
//   });
//   let json = await response.json()
//   let access_token = json["access_token"]
//   console.log("AccessToken", access_token)
//   return access_token
// }

// async function callS2SAPI(access_token, timestamp, ver) {
//   // Call s2s API
//   let url = "https://elifessler.com/s2s/api/gen2"
//   let body = {
//     "naIdToken": access_token,
//     "timestamp": timestamp
//   }
//   // s2s APIだけ何故かBodyの形式が違うので変換
//   const queryString = require('query-string');
//   body = queryString.stringify(body)
//   let header = {
//     "Host": "elifessler.com",
//     "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
//     "Connection": "keep-alive",
//     "Accept": "*/*",
//     "Accept-Language": "ja-JP;q=1.0, en-CA;q=0.9, zh-Hant-CA;q=0.8",
//     "Content-Length": body.length,
//     "User-Agent": "Salmonia for Android/" + ver,
//     "Accept-Encoding": "br;q=1.0, gzip;q=0.9, deflate;q=0.8"
//   };
//   let response = await fetch(url, {
//     method: "POST",
//     headers: header,
//     body: body,
//     // body: JSON.stringify(body),
//   });
//   let json = await response.json()
//   let hash = json["hash"]
//   console.log("s2s API(NSO)", json, hash)
//   return hash
// }

// async function callFlapgAPI(access_token, guid, type, ver) {
//   let timestamp = String(parseInt(new Date().getTime() / 1000))
//   // Call s2s API
//   let hash = await callS2SAPI(access_token, timestamp, ver)
//   // Call flapg API
//   let url = "https://flapg.com/ika2/api/login?public"
//   let header = {
//     "x-token": access_token,
//     "x-time": timestamp,
//     "x-guid": guid, // 一時的に固定した値を使ってみる
//     "x-hash": hash,
//     "x-ver": "3",
//     "x-iid": type,
//     "User-Agent": "Salmonia for Android/" + ver
//   };
//   let response = await fetch(url, {
//     method: "GET",
//     headers: header,
//   });
//   let json = await response.json()
//   let flapg = json["result"]
//   console.log("flapg API(NSO)", flapg)
//   return flapg
// }

// async function getSplatoonToken(flapg_nso) {
//   // Get Splatoon Token
//   let url = "https://api-lp1.znc.srv.nintendo.net/v1/Account/Login"
//   let body = {
//     "parameter": {
//       "f": flapg_nso["f"],
//       "naIdToken": flapg_nso["p1"],
//       "timestamp": flapg_nso["p2"],
//       "requestId": flapg_nso["p3"],
//       "naCountry": "JP",
//       "naBirthday": "1990-01-01",
//       "language": "ja-JP"
//     }
//   }
//   let header = {
//     "Host": "api-lp1.znc.srv.nintendo.net",
//     "Accept": "*/*",
//     "X-ProductVersion": "1.6.1.2",
//     "Accept-Language": "en-US",
//     "Accept-Encoding": "gzip, deflate, br",
//     "User-Agent": "com.nintendo.znca/1.6.1.2 (Android/7.1.2)",
//     "Content-Type": "application/json; charset=utf-8",
//     "Connection": "keep-alive",
//     "Authorization": "Bearer",
//     // "Content-Length": body.length,
//     "X-Platform": "Android",
//   };
//   let response = await fetch(url, {
//     method: "POST",
//     headers: header,
//     body: JSON.stringify(body)
//   });
//   let json = await response.json()
//   let splatoon_token = json["result"]["webApiServerCredential"]["accessToken"]
//   console.log("Splatoon Token", splatoon_token)
//   return splatoon_token
// }

// async function getSplatoonAccessToken(splatoon_token, flapg_app) {
//   // Get Splatoon Access Token
//   let url = "https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken"
//   let header = {
//     "Host": "api-lp1.znc.srv.nintendo.net",
//     "User-Agent": "com.nintendo.znca/1.6.1.2 Android",
//     "Accept": "application/json",
//     "X-ProductVersion": "1.6.1.2",
//     "Content-Type": "application/json; charset=utf-8",
//     "Connection": "Keep-Alive",
//     "Authorization": "Bearer " + splatoon_token,
//     "Content-Length": "267",
//     "X-Platform": "Android",
//     "Accept-Encoding": "gzip"
//   }
//   let body = {
//     "parameter": {
//       "id": 5741031244955648, // Splatoon Game ID
//       "f": flapg_app["f"],
//       "registrationToken": flapg_app["p1"],
//       "timestamp": flapg_app["p2"],
//       "requestId": flapg_app["p3"],
//     }
//   }
//   let response = await fetch(url, {
//     method: "POST",
//     headers: header,
//     body: JSON.stringify(body)
//   });
//   let json = await response.json()
//   let splatoon_access_token = json["result"]["accessToken"]
//   console.log("Splatoon Access Token", splatoon_access_token)
//   return splatoon_access_token
// }

// async function getIksmSession(splatoon_access_token, ver) {
//   // Get iksm_session
//   let url = "https://app.splatoon2.nintendo.net"
//   let header = {
//     "Host": "app.splatoon2.nintendo.net",
//     "X-IsAppAnalyticsOptedIn": "false",
//     "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
//     "Accept-Encoding": "gzip,deflate",
//     "X-GameWebToken": splatoon_access_token,
//     "Accept-Language": "en-US",
//     "X-IsAnalyticsOptedIn": "false",
//     "Connection": "keep-alive",
//     "DNT": "0",
//     "Cookie": "iksm_session=", // 空にして常に再生成する
//     // "User-Agent": "Salmonia for iOS/" + ver,
//     "X-Requested-With": "com.nintendo.znca"
//   }
//   let response = await fetch(url, {
//     method: "GET",
//     headers: header,
//   });
//   let cookie = response.headers.get("set-cookie")
//   let iksm_session = cookie.substr(13, 40)
//   console.log("iksm_session", splatoon_access_token, iksm_session)
//   return iksm_session
// }

// async function loginSplatNet2(code, verifier) {
//   let ver = "1.0.0"
//   let guid = "037239ef-1914-43dc-815d-178aae7d8934"

//   let session_token = await getSessionToken(code, verifier)
//   let access_token = await getAccessToken(session_token)
//   let flapg_nso = await callFlapgAPI(access_token, guid, "nso", ver)
//   let splatoon_token = await getSplatoonToken(flapg_nso)
//   let flapg_app = await callFlapgAPI(splatoon_token, guid, "app", ver)
//   let splatoon_access_token = await getSplatoonAccessToken(splatoon_token, flapg_app)
//   let iksm_session = await getIksmSession(splatoon_access_token, ver)
//   console.log(iksm_session)
//   await AsyncStorage.setItem("@iksm_session:key", iksm_session)
//   Alert.alert("Login Success!");
// }

class App extends Component {
  state = {
    response: {}
  }

  // componentDidMount() {
  //   Linking.addEventListener("url", this.handleOpenURL);
  // }

  // componentWillUnmount() {
  //   Linking.removeEventListener('url', this.handleOpenURL);
  // }

  // handleOpenURL = (deeplink) => {
  //   let session_token_code = deeplink.url.match("de=(.*)&")[1];

  //   let session_token = loginSplatNet2(session_token_code, global.auth_code_verifier)
  // }

  render() {
    return (
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    );
  }
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
          tabBarIcon: ({ color, size }) => (
            <Icon name="snowflake-o" style={{ fontSize: 20, color: "blue" }} />
          ),
        }}
      />
      <Tab.Screen
        name="Config"
        component={AppConfig}
        options={{
          tabBarLabel: "Config",
          tabBarIcon: ({ color, size }) => (
            <Icon name="gears" style={{ fontSize: 20, color: "blue" }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default App;