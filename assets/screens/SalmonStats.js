import React, { Component } from "react"
import { WebView } from "react-native-webview"

class SalmonStats extends Component {

    render() {
        return <WebView source={{ uri: "https://salmon-stats-api.yuki.games/auth/twitter" }} />;
    }
}

export default SalmonStats