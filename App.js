import React, { Component } from "react";
import { Text, View, Alert, Button, Linking, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
// import { Button } from "native-base";

componentDidMount() {
  // アンドロイドでDeepLink対応
  if (Platform.OS === "android") {
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          this.openFromUrlScheme(url)
        }
      })
  }
}

componentWillUnmount() {
  Linking.removeEventListener("url", this.handleOpenURL)
}

handleOpenURL = event => {
  if (event.url) {
    this.openFromUrlScheme(event.url)
  }
}

// DeepLinkを開いたときの挙動
openFromUrlScheme = url => {
  console.log(url)
  const parsedURL = parse(url, true)
  if (parsedURL.protocol === "npf71b963c1b7b6d119") {
    console.log("DeepLink Success")
  }
}

class SalmonStats extends Component {
  render() {
    return <WebView source={{ uri: "https://salmon-stats.yuki.games/" }} />;
  }
}

async function getOAuthURL() {
  try {
    let res = await fetch("https://salmonia.mydns.jp/");
    let json = await res.json();
    return json;
  } catch (error) {
    console.log(error);
  }
}
class Config extends Component {
  loginSplatNet2 = async () => {
    // 押下したらログインのための情報を取得する
    let oauth = await getOAuthURL();
    let auth_code_verifier = oauth["auth_code_verifier"];
    let auth_url = oauth["auth_url"];
    Linking.openURL(auth_url).catch((err) => console.error("Invalid URL"), err);
    console.log(auth_url, auth_code_verifier);
  };
  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button title="SplatNet2" onPress={this.loginSplatNet2} />
        {/* <Text>Notifications!</Text> */}
      </View>
    );
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

function MyTabs() {
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
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Config"
        component={Config}
        options={{
          tabBarLabel: "Config",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  );
}
