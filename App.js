import "react-native-gesture-handler";
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
// import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

import React, { Component, useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import { WebView } from "react-native-webview";
import MapView from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import RadioButtonRN from "radio-buttons-react-native";
import { Constants } from "react-native-unimodules";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button } from "react-native-elements";

import PrivacyPolicyConsent from "./PrivacyPolicyConsent";

import { LoginScreen, signOut } from "./auth";

import {
  StyleSheet,
  ScrollView,
  View,
  KeyboardAvoidingView,
  Text,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  StatusBar,
  TouchableHighlight,
  NativeEventEmitter,
  NativeModules,
  Platform,
  PermissionsAndroid,
  AppState,
  TouchableOpacity,
  Linking,
  Dimensions,
  FlatList,
  Image,
  Alert,
  Switch,
} from "react-native";

import Share from "react-native-share";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HistoricDataFigure from "./HistoricDataFigure";
import TripStack from "./TripStack";

import auth from "@react-native-firebase/auth";

import BLE from "./BLE_Connect_Component";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { user } from "./sess.js";

var RNFS = require("react-native-fs");
var sess = require("./sess.js");

const window = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    display: "flex",
    height: Dimensions.get("screen").height,
    width: Dimensions.get("screen").width,
  },
  map: {
    flex: 1,
  },
  mapMarkerContainer: {
    left: "47%",
    position: "absolute",
    top: "42%",
  },
  mapMarker: {
    fontSize: 40,
    color: "red",
  },
  deatilSection: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    display: "flex",
    justifyContent: "flex-start",
  },
  spinnerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  locationWrapper: {
    flexDirection: "row",
    // backgroundColor:'yellow',
  },
  locationPick: {
    flex: 1,
  },
  mylocation: {
    justifyContent: "center",
    // backgroundColor:'blue',
    padding: 9,
    paddingHorizontal: 15,
    marginHorizontal: 10,
  },
  link: {
    marginBottom: 20,
    // blue background
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
  },
  accountContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  accountInfoContainer: {
    padding: 20,
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
    backgroundColor: "#f0f0f0",
    width: "90%",
  },
  accountInfo: {
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 10,
  },
  signOutButton: {
    backgroundColor: "#d9534f",
  },
  privacyButton: {
    backgroundColor: "#2e78b7",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  loggingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  loggingText: {
    fontSize: 16,
  },
});

const ReportFormStyles = StyleSheet.create({
  textInput: {
    borderColor: "#CCCCCC",
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    height: 100,
    fontSize: 15,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 50,
  },
});

const Tab = createBottomTabNavigator();
const ExploreTab = createMaterialTopTabNavigator();

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Settings!</Text>
    </View>
  );
}

class ExploreScreen_Recent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      // <ScrollView style={{ flex: 1 }}>

      //   {/* <HistoricDataFigure/> */}
      <TripStack />

      // </ScrollView>
    );
  }
}

class ExploreScreen_History extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataExcerpt: null,
    };
  }

  componentDidMount() {
    fetch(sess.baseurl + "/api/userstats", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((data) => data.json())
      .then((jsonobj) => {
        console.log("now here", jsonobj);
        if (jsonobj != null) {
          this.setState({
            dataExcerpt: `All time: ${jsonobj.npts[0]}\nLast 7 days: ${jsonobj.npts[1]}`,
          });
        }
      });
  }

  render() {
    return (
      // <View style={{ flex: 1 }}>
      //   <WebView
      //     source={{ uri: 'http://app.open-seneca.org/bt/' }}
      //   />
      // </View>

      // <View style={{ flex: 1 }}>
      //   <WebView
      //     source={{
      //       html:
      //         "<html> <head> <style>body{margin:0;}iframe{width: 100%; height: 60%;}</style> </head> <body> <iframe style='height:40%;' src='http://app.open-seneca.org/charts.php?df=Paris_velib' frameborder='0'></iframe> <iframe src='http://app.open-seneca.org/Linemap.php?df=Paris_velib' frameborder='0'></iframe> </body></html>"
      //     }}
      //   />
      // </View>

      <View>
        <View style={{ alignItems: "center", padding: 20 }}>
          <Text style={{ textAlign: "center", fontWeight: "bold" }}>
            The amount of data collected from your user is shown below. You can
            also export data collected if you have enabled logging in the
            Account settings.
          </Text>
        </View>
        <ScrollView>
          <View style={{ margin: 10, padding: 20 }}>
            <Button
              onPress={() =>
                Share.open({
                  title: "This is my report ",
                  url:
                    "file://" +
                    RNFS.DocumentDirectoryPath +
                    "/open-seneca_logfile.csv",
                })
              }
              icon={{
                type: "material-community",
                name: "share-variant",
                color: "#fff",
              }}
              type="solid"
              title="Export logfile"
              color="#fff"
            />
          </View>
          <Text style={{ fontWeight: "bold", marginLeft: 20 }}>
            Data points
          </Text>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              padding: 20,
              backgroundColor: "rgb(255,255,255)",
            }}
          >
            <Text>{this.state.dataExcerpt}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

function ExploreScreen_City() {
  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{
          uri: "https://open-seneca.org/ppp25/open-seneca_mapbox_linepath/test.html",
        }}
      />
    </View>
  );
}

function ExploreScreen_Global() {
  return (
    <View style={{ flex: 1 }}>
      <WebView source={{ uri: "http://app.open-seneca.org/maps.php" }} />
    </View>
  );
}

function ExploreScreen() {
  return (
    // <View style={{ flex: 1 }}>
    //   <WebView
    //     source={{ uri: 'http://app.open-seneca.org' }}
    //   />
    // </View>
    <SafeAreaView style={{ flex: 1 }}>
      <ExploreTab.Navigator swipeEnabled={false}>
        <ExploreTab.Screen name="Sessions" component={ExploreScreen_Recent} />
        <ExploreTab.Screen
          name="Stats & Export"
          component={ExploreScreen_History}
        />
        {/* <ExploreTab.Screen name="City" component={ExploreScreen_} /> */}
        {/* <ExploreTab.Screen name="Global" component={ExploreScreen_Global} /> */}
      </ExploreTab.Navigator>
    </SafeAreaView>
  );
}

class MapSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      region: {
        latitude: null,
        longitude: null,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      },
      isMapReady: false,
      marginTop: 1,
      userLocation: "",
      regionChangeProgress: false,
      setUserLocation: props.setUserLocation,
    };
  }

  componentDidMount() {}

  onMapReady = () => {
    this.setState({ isMapReady: true, marginTop: 0 });
  };

  // Fetch location details as a JOSN from google map API
  fetchAddress = () => {
    fetch(
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
        this.state.region.latitude +
        "," +
        this.state.region.longitude +
        "&key=" +
        "AIzaSyDmPUYi1rGptsBXWe4AAVl6PIOST00HiOQ"
    )
      .then((response) => response.json())
      .then((responseJson) => {
        const userLocation = responseJson.results[0].formatted_address;
        this.setState({
          userLocation: userLocation,
          regionChangeProgress: false,
        });
      });
  };

  // Update state on region change
  onRegionChange = (region) => {
    this.setState(
      {
        region,
        regionChangeProgress: true,
      },
      () => this.fetchAddress()
    );
  };

  // Action to be taken after select location button click
  onLocationSelect = () => {
    // alert(this.state.userLocation);
    this.state.setUserLocation(
      this.state.userLocation,
      this.state.region.latitude,
      this.state.region.longitude
    );
  };

  setRegion() {
    console.log("setting region");
    let region;

    if (!sess.currentPosition_lat || !sess.currentPosition_lon) {
      region = {
        latitude: 52.20426351622033,
        longitude: 0.11590346516899737,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      };
    } else {
      region = {
        latitude: sess.currentPosition_lat,
        longitude: sess.currentPosition_lon,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      };
    }

    this.setState({
      region: region,
      loading: false,
      error: null,
    });
  }

  setRegionCurrentLocation() {
    console.log("setting region to current");

    Geolocation.getCurrentPosition(
      (position) => {
        console.log("obtained position");
        const region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        };
        sess.currentPosition_lat = position.coords.latitude;
        sess.currentPosition_lon = position.coords.longitude;
        this.setState({
          region: region,
          loading: false,
          error: null,
        });
      },
      (error) => {
        alert("Could not get location", error);
        this.setState({
          error: error.message,
          loading: false,
        });
      },
      { enableHighAccuracy: false, timeout: 200000, maximumAge: 5000 }
    );
  }

  render() {
    //  Geolocation.getCurrentPosition(
    //   position => {
    //     const region = {
    //       latitude: position.coords.latitude,
    //       longitude: position.coords.longitude,
    //       latitudeDelta: 0.001,
    //       longitudeDelta: 0.001
    //     };
    //     sess.currentPosition_lat = position.coords.latitude;
    //     sess.currentPosition_lon = position.coords.longitude;
    //     this.setState({
    //       region: region,
    //       loading: false,
    //       error: null
    //     });
    //   },
    //   error => {
    //     alert("Could not get location",error);
    //     this.setState({
    //       error: error.message,
    //       loading: false
    //     });
    //   },
    //   { enableHighAccuracy: false, timeout: 200000, maximumAge: 5000 }
    // );

    // spinner wheel
    // return (
    //   <View style={styles.spinnerView}>
    //     <ActivityIndicator size="large" color="#0000ff" />
    //   </View>
    // );
    // console.log(this.state.region.latitude,this.state.region.longitude)

    if (this.state.loading) {
      // return <Text>No location</Text>
      this.setRegion();

      return (
        <View style={styles.spinnerView}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <View style={{ flex: 2 }}>
            {!!this.state.region.latitude && !!this.state.region.longitude && (
              <MapView
                style={{ ...styles.map, marginTop: this.state.marginTop }}
                initialRegion={this.state.region}
                showsUserLocation={true}
                onMapReady={this.onMapReady}
                onRegionChangeComplete={this.onRegionChange}
                region={this.state.region}
              >
                {/* <MapView.Marker
                  coordinate={{ "latitude": this.state.region.latitude, "longitude": this.state.region.longitude }}
                  title={"Your Location"}
                  draggable
                /> */}
              </MapView>
            )}

            <View style={styles.mapMarkerContainer}>
              <Icon
                name="place"
                size={40}
                color={"red"}
                style={{ marginTop: 10 }}
              />
            </View>
          </View>
          <View style={styles.deatilSection}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                fontFamily: "System",
                marginBottom: 20,
              }}
            >
              Move map for location
            </Text>
            <Text style={{ fontSize: 10, color: "#999" }}>LOCATION</Text>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 14,
                paddingVertical: 10,
                borderBottomColor: "silver",
                borderBottomWidth: 0.5,
              }}
            >
              {!this.state.regionChangeProgress
                ? this.state.userLocation
                : "Identifying Location..."}
            </Text>
            {/* <View style={styles.btnContainer}> */}

            {/* <View style={styles.btnInner}>
              <Button
                title="PICK THIS LOCATION"
                disabled={this.state.regionChangeProgress}
                onPress={this.onLocationSelect}
                style={styles.btnLocation}
              />
              <Button
                title="Current"
                disabled={this.state.regionChangeProgress}
                onPress={this.onLocationSelect}
                style={styles.btnLocation}
              />
            </View> */}
            {/* </View> */}

            <View style={styles.locationWrapper}>
              <View style={styles.locationPick}>
                <Button
                  title="Pick location"
                  disabled={this.state.regionChangeProgress}
                  onPress={this.onLocationSelect}
                />
              </View>

              <Pressable
                style={styles.mylocation}
                onPress={() => this.setRegionCurrentLocation()}
              >
                <Icon name="my-location" size={20} />
              </Pressable>
            </View>
          </View>
        </View>
      );
    }
  }
}

class ReportScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLocation: "N/A",
      selectedIndex: null,
      topMargin: 0,
      comment: null,
      level: null,
    };
  }

  componentDidMount() {
    console.log("report screen mounted");
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this._keyboardDidShow.bind(this)
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this._keyboardDidHide.bind(this)
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    this.setState({ topMargin: -300 });
  }

  _keyboardDidHide() {
    this.setState({ topMargin: 0 });
  }

  setUserLocation(location, lat, lon) {
    this.setState({ userLocation: location, lat: lat, lon: lon });
  }

  cancel() {
    this.setState({ userLocation: "N/A", comment: null, level: null });
  }

  submitReport() {
    const response = fetch(sess.baseurl + "/api/saveReport", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location: this.state.userLocation,
        lat: this.state.lat,
        lon: this.state.lon,
        comment: this.state.comment,
        level: this.state.level,
      }),
    })
      .then((data) => data.json())
      .then((jsonobj) => {
        let resp = jsonobj["resp"];
        console.log("RESPONSE", resp);
        if (resp === "signinRequired") {
          alert("Report not saved. Sign in required.");
          signOut();
        } else {
          Alert.alert(
            "Thank you",
            "Your observation has been stored and used in publicly available aggregated maps.",
            [
              {
                text: "Got it",
                onPress: () => {},
                style: "cancel",
              },
            ]
          );
          this.cancel();
        }
      })
      .catch((err) => {
        console.log("report saving failed");
      });
  }

  render() {
    let reportform = (
      <View style={{ flex: 1, marginTop: this.state.topMargin }}>
        <KeyboardAwareScrollView style={{ flex: 1, paddingTop: 30 }}>
          <Text style={{ padding: 15, fontWeight: "bold", fontSize: 25 }}>
            Describe your observation
          </Text>
          <Text style={{ padding: 10, fontSize: 15 }}>
            Location: {this.state.userLocation}
          </Text>
          <Text style={{ padding: 10, fontSize: 15 }}>
            Assessment of air quality
          </Text>

          <RadioButtonRN
            data={[
              {
                label: "(1/4) Low air pollution level",
                value: 1,
              },
              {
                label: "(2/4) Medium pollution level",
                value: 2,
              },
              {
                label: "(3/4) High pollution level",
                value: 3,
              },
              {
                label: "(4/4) Severe pollution level",
                value: 4,
              },
            ]}
            selectedBtn={(e) => {
              console.log(e.value);
              this.setState({ level: e.value });
            }}
          />

          <Text style={{ padding: 10, fontSize: 15 }}>Comment</Text>
          <TextInput
            multiline
            style={ReportFormStyles.textInput}
            placeholder="For instance: This location gets highly congested in the afternoon resulting in poor air quality."
            maxLength={60}
            onChangeText={(text) => this.setState({ comment: text })}
            // onFocus={()=>this.setState({topMargin:0})}
            // onBlur={()=>this.setState({topMargin:0})}
          />
        </KeyboardAwareScrollView>
        <View style={{ backgroundColor: "lightgray" }}>
          <View style={{ padding: 10 }}>
            <Button
              title="Submit"
              disabled={
                this.state.comment === null || this.state.level === null
              }
              onPress={this.submitReport.bind(this)}
            />
          </View>
          <View style={{ padding: 10 }}>
            <Button
              onPress={this.cancel.bind(this)}
              color="red"
              title="Cancel"
            />
          </View>
        </View>
      </View>
    );

    let map = (
      <View style={{ flex: 1 }}>
        <MapSelect setUserLocation={this.setUserLocation.bind(this)} />
      </View>
    );

    return this.state.userLocation === "N/A" ? map : reportform;
  }
}

class AccountScreen extends Component {
  constructor(props) {
    super(props);
    this.state = { logging: false };
  }

  async componentDidMount() {
    try {
      const value = await AsyncStorage.getItem("logging_enabled");
      if (value !== null) {
        this.setState({ logging: JSON.parse(value) });
      }
    } catch (error) {
      // Error retrieving data
    }
  }

  async toggleSwitch() {
    this.state.logging = !this.state.logging;
    sess.logging_enabled = this.state.logging;
    this.setState({ logging: this.state.logging });

    if (this.state.logging) {
      // enabled ater being disabled -> clean previous file
      try {
        let path = RNFS.DocumentDirectoryPath + "/open-seneca_logfile.csv";
        await RNFS.unlink(path)
          .then(() => {
            console.log("FILE DELETED");
          })
          // `unlink` will throw an error, if the item to unlink does not exist
          .catch((err) => {
            console.log(err.message);
          });
      } catch (error) {
        // Error saving data
      }
    }

    try {
      await AsyncStorage.setItem(
        "logging_enabled",
        JSON.stringify(this.state.logging)
      );
    } catch (error) {
      // Error saving data
    }
  }

  openPrivacyNotice = () => {
    // Replace the URL with the link to your privacy notice
    Linking.openURL("https://www.open-seneca.org/privacy");
  };

  render() {
    let accountInfo = sess.user.displayName ? sess.user.displayName + "\n" : "";
    accountInfo += sess.user.email;

    let signoutBtn = (
      <View style={styles.accountInfoContainer}>
        <Text style={styles.accountInfo}>
          {sess.user ? "Logged in:\n" + accountInfo : "not logged in\n"}
        </Text>
        <TouchableOpacity
          onPress={() => signOut()}
          style={[styles.button, styles.signOutButton]}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.loggingContainer}>
          <Text style={styles.loggingText}>
            Enable logging (required for local export)
          </Text>
          <Switch
            onValueChange={this.toggleSwitch.bind(this)}
            value={this.state.logging}
          />
        </View>

        <TouchableOpacity
          onPress={() => this.openPrivacyNotice()}
          style={[styles.button, styles.privacyButton]}
        >
          <Text style={styles.buttonText}>Read our Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <View style={styles.accountContainer}>
        {/* <Image
          style={{ width: 50, height: 50, borderRadius: 10, marginBottom: 20 }}
          source={{ uri: sess.userPicUrl }} # from user.photo Google obj
        /> */}
        {signoutBtn}
      </View>
    );
  }
}

class Main extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log("rerendering app");

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Image
          resizeMode="contain"
          style={{
            width: "90%",
            marginLeft: "auto",
            marginRight: "auto",
            height: 50,
          }}
          source={require("./logo.png")}
        />

        <BLE />
      </SafeAreaView>
    );
  }
}

function MainApp() {
  return (
    <SafeAreaProvider>
      <PrivacyPolicyConsent />
      <NavigationContainer>
        <Tab.Navigator
          lazy={true}
          backBehavior={"initialRoute"}
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Sensor") {
                iconName = "router";
              } else if (route.name === "Explore") {
                iconName = "layers";
              } else if (route.name === "Observation") {
                iconName = "report";
              } else if (route.name === "Account") {
                iconName = "person";
              }

              // You can return any component that you like here!
              return (
                <Icon style={{}} name={iconName} size={size} color={color} />
              );
            },
          })}
          tabBarOptions={{
            // activeTintColor: "tomato",
            // inactiveTintColor: "gray",
            // safeAreaInsets: {bottom:20},
            style: { minHeight: 55 },
            labelStyle: { flex: 0.5 },
          }}
        >
          <Tab.Screen name="Sensor" component={Main} />
          <Tab.Screen name="Explore" component={ExploreScreen} />
          <Tab.Screen name="Observation" component={ReportScreen} />
          <Tab.Screen name="Account" component={AccountScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      initialising: true,
      subscriber: null,
    };
  }

  setUser(user) {
    this.setState({ user: user, initialising: false });
    sess.user = user;
  }

  backendSignin(idToken, firebaseUser, firebaseLoginObj, providerLoginObj) {
    console.log("attempting backend sigin:", sess.baseurl + "/api/signin");
    fetch(sess.baseurl + "/api/signin", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
        firebaseUser,
        firebaseLoginObj,
        providerLoginObj,
      }),
    })
      .then((data) => data.json())
      .then((jsonobj) => {
        let resp = jsonobj["resp"];
        console.log("Backend signin response", resp);
        if (resp === "success") {
          let displayName = firebaseUser.displayName;

          // // getting display name from other providers
          // if (displayName === null) {
          //   firebaseUser.providerData.forEach(pd => {
          //     console.log("checked",pd)
          //     if(pd.displayName != null) {
          //       displayName = pd.displayName
          //     }
          //   });
          // }

          let user = {
            displayName: displayName,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          };

          sess.setUser(user);
          console.log("now set state", user);
        } else {
          console.log("backend login reject", resp);
        }
      })
      .catch((err) => {
        console.log("backend login failed, signing out", err);
        signOut();
      });

    // fetch(sess.baseurl + "/signin?token=" + userInfo.idToken)
    //   .then(data => data.json())
    //   .then(jsonobj => {
    //     console.log("fetching", jsonobj["success"]);
    //   })
    //   .catch(error => {
    //     console.log("could not sign in to backend server");
    //   });
  }

  onAuthStateChanged = async (user) => {
    console.log("CHANGED", user);
    if (user && !this.state.user) {
      if (user.emailVerified) {
        console.log("sohuld sign in");
        console.log("trying to get token");
        let idToken = await user.getIdToken(true);
        this.backendSignin(idToken, user, null, null);
      } else {
        user.sendEmailVerification();
        alert(
          "An email has been sent to " +
            user.email +
            ". Please verify and login again."
        );
        signOut();
      }
    } else {
      console.log("shoudl sign out");
      sess.setUser(null);
    }
  };

  componentDidMount() {
    sess.unsubscribeAuthStateHandler = auth().onAuthStateChanged(
      this.onAuthStateChanged.bind(this)
    );

    // sess.signOut = this.signOut.bind(this);
    // sess.signIn = this.signIn.bind(this);
    // sess.reloadAuth = this.reloadAuth.bind(this);
    sess.backendSignin = this.backendSignin.bind(this);
    sess.setUser = this.setUser.bind(this);
  }

  render() {
    console.log("rerendering app");
    // activateKeepAwake();

    if (this.state.initialising)
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text>Authenticating{"\n"}</Text>
          <ActivityIndicator size="large" color="black" />
        </View>
      );

    return this.state.user ? MainApp() : <LoginScreen />;
  }
}

export default App;
