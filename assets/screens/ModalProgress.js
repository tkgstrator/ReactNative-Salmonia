import React, { Component } from "react";
import { StyleSheet, Text, View, SafeAreaView, Button } from "react-native";
import * as Progress from "react-native-progress";

const ProgressModal = props => {
    const { now, length, text } = props
    // render() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
            {/* <Progress.Pie animated={true} indeterminate={false} progress={0.3} size={200} /> */}
            <Text>{props.now}</Text>
        </View>
    );
    // }
}