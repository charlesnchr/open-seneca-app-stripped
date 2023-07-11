import React, { Component } from 'react';

import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    TouchableHighlight,
    NativeEventEmitter,
    NativeModules,
    Platform,
    PermissionsAndroid,
    AppState,
    Dimensions,
    FlatList,
    Image,
    ActivityIndicator
  } from 'react-native';

import { LineChart } from "react-native-chart-kit";
var sess = require("./sess.js");  
  

class RealtimeFigure extends Component {
    constructor(props){
      super(props)
      this.state = {
        // data: [1,2,3] // [1,2,3] for dev 
        data: null
      }
    }

    addDataPt(dataPt) {
        let data = this.state.data;
        if (data === null) {
            data = [];
        } else if (data.length == 30) {
            data = data.slice(1, 30);
        }

        console.log("new datapoint",dataPt)
        data.push(dataPt);
        this.setState({ data: data });
    }

    componentDidMount() {
        sess.addDataPt = this.addDataPt.bind(this);
    }

    render() {
        return (this.state.data && this.state.data.length > 1) ? 
        <View style={{}}>
                <View
            style={{
                borderBottomColor: "black",
                borderBottomWidth: 1,
                marginTop: 10,
                marginBottom: 10
            }}
            />
            <Text style={{ padding: 10, fontWeight: "bold", fontSize: 17 }}>
              PM2.5 [μg/m³] over last 30 seconds
            </Text>
            <LineChart
              data={{
                // labels: ["-5", "-4", "-3", "-2", "-1"],
                datasets: [{ data: this.state.data }]
              }}
              width={Dimensions.get("window").width} // from react-native
              height={220}
              // yAxisLabel="$"
              // yAxisSuffix="k"
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: "#022173",
                backgroundGradientFrom: "#022173",
                backgroundGradientTo: "#1b3fa0",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#000000"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
        </View> : <ActivityIndicator size="large" color="black" />
    }
}
export default RealtimeFigure;