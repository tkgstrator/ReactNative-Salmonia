import React, { Component } from "react"
import { WebView } from "react-native-webview"

class SalmonStats extends Component {

    render() {
        return <WebView source={{ uri: "https://salmon-stats.yuki.games/" }} />;
    }
}

export default SalmonStats