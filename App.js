import React, { Component } from "react";
import { Alert, Linking, AsyncStorage } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome";
import AppConfig from "./assets/screens/AppConfig";
import SalmonStats from "./assets/screens/SalmonStats";

class App extends Component {
  state = {
    response: {}
  }

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