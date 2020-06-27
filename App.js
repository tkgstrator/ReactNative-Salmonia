import React, { Component } from "react";
import { Text, View, Linking } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { WebView } from "react-native-webview";
import DeepLinking from "react-native-deep-linking";
import AppConfig from "./assets/screens/AppConfig";

class App extends Component {
  state = {
    response: {}
  }

  componentDidMount() {
    console.log("Setup DeepLink")
    DeepLinking.addScheme("npf71b963c1b7b6d119://")
    Linking.addEventListener('url', this.handleOpenURL);

    DeepLinking.addRoute('/auth', (response) => {
      this.setState({ response });
    });

    Linking.getInitialURL().then((link) => {
      if (link) {
        console.log(link)
      }
    }).catch(err => console.error("ERROR!", err));
  }

  componentWillUnmount() {
    console.log("Remove DeepLink")
    Linking.removeEventListener('url', this.handleOpenURL);
  }

  handleOpenURL = (url) => {
    Linking.canOpenURL.then((link) => {
      if (link) {
        DeepLinking.evaluateUrl(url)
      }
    });
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