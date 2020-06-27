import React, { Component } from "react";
import { Text, View, Linking } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { WebView } from "react-native-webview";
import DeepLinking from "react-native-deep-linking";
import AppConfig from "./assets/screens/AppConfig";

global.auth_code_verifier = String

async function getSessionToken(session_token_code, auth_code_verifier) {
  console.log(auth_code_verifier)
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

  console.log(JSON.stringify(body))
  try {
    let res = await fetch(url, {
      method: "POST",
      headers: app_head,
      body: JSON.stringify(body),
    });
    let json = await res.json();
    console.log("SESSION_TOKEN", json);
    return json["session_token"];
  } catch (error) {
    console.log(error);
  }
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
    this.state.session_token_code = deeplink.url.match("de=(.*)&")[1];

    let session_token = getSessionToken(this.state.session_token_code, global.auth_code_verifier)
    console.log(this.state.session_token_code)
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