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
    Pressable,
    Share
  } from 'react-native';

  import { WebView } from "react-native-webview";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Button, Icon, Text, Tooltip } from "react-native-elements";

const moment = require('moment');
var sess = require("./sess.js");  

const Stack = createStackNavigator();

const styles = StyleSheet.create({
    tripBtn: {
        padding: 10,
        margin:5,
        backgroundColor:'lightblue'
    }
})


class TripList extends Component {
    constructor(props){
      super(props)
      this.state = {
        // data: [1,2,3] // [1,2,3] for dev 
        data: null,
        displayedParam: 'pm25',
        timewindow: 30, // in seconds
        titleParam: 'PM2.5 [μg/m³]',
        titleTimewindow: 'last 30 seconds',
        navigation: props.navigation,
      }
    }

    fetchData() {
        fetch(sess.baseurl + '/api/getTrips', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }}).then((data) => data. json()).then((jsonobj) => {
                this.setState({data:jsonobj})
            })
    }


    componentDidMount() {
        sess.fetchTripData = this.fetchData.bind(this)
        this.fetchData()
    }

    

    render() {
        let results = []
        let data = this.state.data

        if(data) {
            if(data.length > 0) {
                for(let i = 0; i < data.length; i++ ) {
                    let datestr1 = moment.unix(data[i].t1 / 1000).format("HH:mm MMMM DD YYYY")
                    let datestr2 = moment.unix(data[i].t2 / 1000).format("HH:mm MMMM DD YYYY")
                    let button = <Pressable 
                        style={styles.tripBtn} 
                        key={data[i].tripId}
                        onPress={() => this.state.navigation.navigate('Session explore', {tripId: data[i].tripId}) }
                        >
                            
                            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                            <Text>#{data.length - i}</Text>
                            <Text>{parseFloat(data[i].dist).toFixed(0)} m / {data[i].tripLen} pts</Text>
                            </View>

                            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                            <Text>{datestr1}</Text>
                            <Text>{datestr2}</Text>
                            </View>
                            
                        </Pressable>
                    results.push(button)
                }
            }
        }

        return <ScrollView>{results}</ScrollView>
        // return <View style={{flex:1,backgroundColor:'blue',alignItems: 'center', justifyContent: 'center', color:'black' }}><Text>dasd</Text></View>
    }
}


class DataView extends Component {
    constructor(props){
      super(props)
      this.state = {
        navigation: props.navigation,
        route: props.route,
        loading:true
      }
    }

    fetchData() {
        console.log('fetching with',this.state.route.params)
        fetch(sess.baseurl + '/map', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tripId: this.state.route.params.tripId
            })
        }).then((response) => response.json()).then((json) => {
            // console.log('received',json.msg,"AND",json.success)
            if(json.success === -1 && this.state.loading) {
                this.setState({html:'reloading',loading:false})
                sess.reloadAuth()
                setTimeout(() => {
                    this.fetchData()
                }, 1000);
            } else if(json.success === 0) {
                this.setState({html:'data not found',loading:false})
            } else if(json.success === 1) { 
                sess.shareLink = sess.baseurl + "/m/" + json.shareLink
                this.setState({html:json.msg,loading:false})
            }
        })
    }

    componentDidMount() {
        sess.shareLink = 'Unique link not found'
        this.fetchData()
    }

    render() {
        if(this.state.loading) {
            return <View >
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        } else {
            return (
                <View style={{ flex: 1 }}>
                <WebView
                    // source={{
                    //   uri:
                    //     sess.baseurl + "/map" // does not have session
                    // }}
                    source={{
                        html: this.state.html
                    }}
                />
                </View>
            );
        }
    }
}


class TripStack extends Component {
    constructor(props){
      super(props)
    }

    render() {
        return (
            <Stack.Navigator
            // headerMode="none"
            style={{flex:1,backgroundColor:'red'}}
            >
            
            <Stack.Screen
                name="Previously recorded sessions"
                component={TripList}
                options={{
                    headerRight: () => (
                      <Button
                        onPress={() => sess.fetchTripData()}
                        icon={{
                            type:"material-community",
                            name:'refresh',
                            color:'rgb(32,137,220)'
                        }}
                        type="clear"
                      />
                    ),
                  }}
            />
            <Stack.Screen
                name="Session explore"
                component={DataView}
                options={{
                    headerRight: () => (
                      <Button
                        onPress={() => Share.share({message:sess.shareLink})}
                        icon={{
                            type:"material-community",
                            name:'share-variant',
                            color:"#fff"
                        }}
                        type="solid"
                        title="Share"
                        color="#fff"
                      />
                    ),
                  }}
            />
            </Stack.Navigator>
        )
    }
}


export default TripStack;