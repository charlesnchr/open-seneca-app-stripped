import React, { Component } from 'react';

import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
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
    ActivityIndicator,
    Pressable
  } from 'react-native';

import { Button, Icon, Text, Tooltip } from "react-native-elements";
import { LineChart } from "react-native-chart-kit";
var sess = require("./sess.js");  
  

class HistoricDataFigure extends Component {
    constructor(props){
      super(props)
      this.state = {
        // data: [1,2,3] // [1,2,3] for dev 
        data: null,
        displayedParam: 'pm25',
        timewindow: 30, // in seconds
        titleParam: 'PM2.5 [μg/m³]',
        titleTimewindow: 'last 30 seconds'
      }
    }

    fetchData() {
        fetch(sess.baseurl + '/api/getData?minutes=' + 200, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }}).then((data) => data. json()).then((jsonobj) => {
                this.setState({data:jsonobj})
            })
    }


    componentDidMount() {
        this.fetchData()
    }

    render() {

        let dataset = []
        let firstidx = 0

        if(this.state.data && this.state.data.length > 1) {
            // this.state.data.forEach(element => {
                // dataset.push(element[this.state.displayedParam])
            // });

            for(let i = 0; i < this.state.timewindow && i < this.state.data.length; i++) {
                let val = this.state.data[i];
                // dataset.push(val[this.state.displayedParam]);
                dataset.unshift(val[this.state.displayedParam]);
                firstidx = i
            }
        }

        let refreshIcon = <Icon type="material-community" name='refresh' color='rgb(32,137,220)'/>

        return (this.state.data && this.state.data.length > 1) ? 
        <View style={{}}>
                <View style={{flexDirection:'row'}}>
                    <View>
                        <Text style={{ padding: 15, fontWeight: "bold", fontSize: 25 }}>
                        Recorded sensor data 
                        </Text>
                    </View>
                    <View>
                    <Pressable onPress={this.fetchData.bind(this)} style={{flex:1,justifyContent:'center',flexDirection:'column',alignItems:'center'}}>{refreshIcon}</Pressable>
                    </View>
                </View>

                <Text
                style={{ padding: 10, fontSize: 15, textDecorationLine: "underline" }}
                >
                Displayed quantity
                </Text>
                <View style={{ flexDirection: "row" }}>
                <View style={{ margin: 5 }}>
                    <Button title="PM2.5" onPress={() => this.setState({displayedParam:'pm25',titleParam:'PM2.5 [μg/m³]'})}/>
                </View>
                <View style={{ margin: 5 }}>
                    <Button title="PM10" onPress={() => this.setState({displayedParam:'pm10',titleParam:'PM10 [μg/m³]'})}/>
                </View>
                <View style={{ margin: 5 }}>
                    <Button title="Humidity" onPress={() => this.setState({displayedParam:'humidity',titleParam:'Relative humidity'})}/>
                </View>
                </View>
                <Text
                style={{ padding: 10, fontSize: 15, textDecorationLine: "underline" }}
                >
                Time window
                </Text>
                <View style={{ flexDirection: "row" }}>
                <View style={{ margin: 5 }}>
                    <Button title="Seconds" onPress={() => this.setState({timewindow: 30, titleTimewindow: 'last 30 seconds'}) }/>
                </View>
                <View style={{ margin: 5 }}>
                    <Button title="Minutes" onPress={() => this.setState({timewindow: 30*60, titleTimewindow: 'last 30 minutes'}) }/>
                </View>
                <View style={{ margin: 5 }}>
                    <Button title="Hours" onPress={() => this.setState({timewindow: 10*3600, titleTimewindow: 'last 10 hours'}) }/>
                </View>
                <View style={{ margin: 5 }}>
                    <Button title="Days" onPress={() => this.setState({timewindow: 7*24*3600, titleTimewindow: 'last 7 days'}) }/>
                </View>
                </View>
                <View
                style={{
                    borderBottomColor: "black",
                    borderBottomWidth: 1,
                    marginTop: 40,
                    marginBottom: 40
                }}
                />


            <Text style={{ padding: 10, fontWeight: "bold", fontSize: 17 }}>
              {this.state.titleParam} — {this.state.titleTimewindow}
            </Text>
            <LineChart
              data={{
                labels: [this.state.data[firstidx].t, '+' + (0.25*this.state.timewindow).toString(), '+' + (0.5*this.state.timewindow).toString()  ],
                datasets: [{ data: dataset }]
              }}
              width={Dimensions.get("window").width-20} // from react-native
              height={220}
              // yAxisLabel="$"
              // yAxisSuffix="k"
              segments={4}
              yAxisInterval={25} // optional, defaults to 1
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
                  r: "0",
                  strokeWidth: "2",
                  stroke: "#000000"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
                alignSelf:'center'
              }}
            />
        </View> : <ActivityIndicator size="large" />
    }
}
export default HistoricDataFigure;