import React, { Component, useState, useEffect } from "react";

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
  Dimensions,
  FlatList,
  Image
} from "react-native";

import { Button } from "react-native-elements";
import LinearGradient from "react-native-linear-gradient";
// import sha256 from "crypto-js/sha256";
// import Hex from "crypto-js/enc-hex";

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes
} from "@react-native-community/google-signin";

import {
  appleAuth,
  appleAuthAndroid,
  AppleButton
} from "@invertase/react-native-apple-authentication";

import auth from "@react-native-firebase/auth";
import { set } from "react-native-reanimated";

import { BleManager } from 'react-native-ble-plx';

export const manager = new BleManager();

var sess = require("./sess.js");

const styles = StyleSheet.create({
  appleButton: {
    width: 190,
    height: 35,
    shadowColor: "#555",
    shadowOpacity: 0.5,
    shadowOffset: {
      width: 0,
      height: 1
    },
    marginVertical: 5
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    margin: 5
  },
  buttonSignin: {
    backgroundColor: "#2196F3"
  },
  buttonClose: {
    backgroundColor: "rgb(100,100,100)"
  },
  buttonForgot: {
    backgroundColor: "rgb(200,20,20)"
  }
});

function opensenecaForgotpassword(username) {
  if (username.length == 0) {
    alert("Input your email address");
  } else
    try {
      auth().sendPasswordResetEmail(username);
      alert(
        "An email has been sent to " + username + " with a password reset link"
      );
    } catch (error) {
      alert("Input your email address");
    }
}

function opensenecaSignin(username, password) {
  auth()
    .createUserWithEmailAndPassword(username, password)
    .then(() => {
      console.log("user account created and signed in");
    })
    .catch(error => {
      if (error.code === "auth/email-already-in-use") {
        // console.log('That email address is already in use!');
        auth()
          .signInWithEmailAndPassword(username, password)
          .then(() => {
            console.log("user account signed in");
          })
          .catch(error => {
            alert("Incorrect email or password");
          });
      } else {
        if (error.code === "auth/invalid-email") {
          alert("Email address invalid");
        }

        console.error(error);
      }
    });
}

async function onAppleButtonPress() {
  // Start the sign-in request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME]
  });

  // Ensure Apple returned a user identityToken
  if (!appleAuthRequestResponse.identityToken) {
    throw "Apple Sign-In failed - no identify token returned";
  }

  // Create a Firebase credential from the response
  const { identityToken, nonce, fullName } = appleAuthRequestResponse;
  const appleCredential = auth.AppleAuthProvider.credential(
    identityToken,
    nonce
  );

  // Sign the user in with the credential
  const userCredential = await auth().signInWithCredential(appleCredential);

  if (
    fullName.givenName !== null ||
    fullName.middleName !== null ||
    fullName.familyName !== null
  ) {
    let fullname = "";
    if (fullName.givenName !== null) fullname += fullName.givenName + " ";
    if (fullName.middleName !== null) fullname += fullName.middleName + " ";
    if (fullName.familyName !== null) fullname += fullName.familyName;
    console.log("full name is:  " + fullname);

    if (userCredential.user.displayName === null) {
      console.log("updating display name in Firebase");
      userCredential.user.updateProfile({ displayName: fullname });
    }
  }
}

async function onGoogleButtonPress() {
  console.log("clicked sigin");
  try {
    console.log("has play");
    await GoogleSignin.hasPlayServices();
    console.log("google sig in");
    const userInfo = await GoogleSignin.signIn();
    // console.log("got userinfo",userInfo,"now attempting firebase auth");
    // Create a Google credential with the token
    console.log("google cred");
    const googleCredential = auth.GoogleAuthProvider.credential(
      userInfo.idToken
    );

    // Sign-in the user with the credential
    console.log("firebase sign in");
    const userCredential = await auth().signInWithCredential(googleCredential);
    console.log("firebase get id");
    let idToken = await userCredential.user.getIdToken(true);

    console.log("backend signin");
    sess.backendSignin(idToken, userCredential.user, userCredential, userInfo);
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log("user cancelled the login flow");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log("operation (e.g. sign in) is in progress already");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log("play services not available or outdated");
    } else {
      console.log("some other error happened");
      throw error;
    }
  }
}

async function signOut() {
  console.log("Signing out");
  try {
    // sess.unsubscribeAuthStateHandler()
    if (auth().currentUser) {
      console.log("Signing out", auth().currentUser);
      auth()
        .signOut()
        .then(() => {
          // console.log("disconnecting BLE");
          sess.disconnectBLE();
          sess.setUser(null);
        });
    } else {
      console.log("Signout failed, no user", auth().currentUser);
    }
  } catch (error) {
    console.error(error);
  }
}

sess.reloadAuth = async () => {
  console.log("attempting to reload user");
  let user = auth().currentUser;
  let idToken = await user.getIdToken(true);
  sess.backendSignin(idToken, user, null, null);
};

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      value: "",
      password: ""
    }
  }

  componentDidMount() {
    GoogleSignin.configure({
      webClientId:
        "917957692861-ij34bmovlk3ni4hlcnt7isdg2mhf3f4d.apps.googleusercontent.com"
    });
  }

  render() {
    let signinBtn = (
      <GoogleSigninButton
        style={{ width: 200, height: 48 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={() => onGoogleButtonPress()}
      />
    );

    let opensenecaBtn = (
      <Button
        ViewComponent={LinearGradient} // Don't forget this!
        linearGradientProps={{
          colors: ["rgb(245,245,245)", "rgb(210,210,210)"],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 3 }
        }}
        title="Sign in with open-seneca"
        titleStyle={{ fontSize: 14.5, color: "rgb(80,80,80)" }}
        buttonStyle={{ marginTop: 10, borderRadius: 5, width: 190 }}
        onPress={() => this.setState({modalVisible: true})}
      />
    );

    let appleBtn = [];

    if (Platform.OS === "ios" && appleAuth.isSupported) {
      appleBtn = (
        <AppleButton
          buttonStyle={AppleButton.Style.WHITE}
          buttonType={AppleButton.Type.SIGN_IN}
          style={styles.appleButton}
          onPress={() => onAppleButtonPress()}
        />
      );
    }

    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          resizeMode="contain"
          style={{ width: "90%", marginLeft: "auto", marginRight: "auto" }}
          source={require("./logo.png")}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({modalVisible: false});
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={{ fontSize: 20, marginBottom: 10 }}>
                Create account or login
              </Text>
              <Text style={styles.modalText}>
                Create a new account or {"\n"}login with an existing
              </Text>
              <TextInput
                style={{
                  height: 40,
                  borderColor: "gray",
                  borderWidth: 1,
                  width: 200,
                  padding: 10
                }}
                placeholder="Email address"
                maxLength={60}
                onChangeText={text => this.setState({value: text})}
                value={this.state.value}
                autoCapitalize={"none"}
                autoCorrect={false}
                autoFocus={true}
              />
              <TextInput
                style={{
                  height: 40,
                  borderColor: "gray",
                  borderWidth: 1,
                  width: 200,
                  padding: 10
                }}
                placeholder="Password"
                maxLength={60}
                onChangeText={text => this.setState({password: text})}
                value={this.state.password}
                autoCapitalize={"none"}
                autoCorrect={false}
                autoFocus={false}
                secureTextEntry={true}
                onSubmitEditing={() => opensenecaSignin(this.state.value, this.state.password)} // for pressing enter
              />
              <Pressable
                style={[styles.button, styles.buttonSignin]}
                onPress={() => opensenecaSignin(this.state.value, this.state.password)}
              >
                <Text style={styles.textStyle}>Continue</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonForgot]}
                onPress={() => opensenecaForgotpassword(value)}
              >
                <Text style={styles.textStyle}>Forgot password?</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => this.setState({modalVisible: false})}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {signinBtn}
        {appleBtn}
        {opensenecaBtn}
      </View>
    );
  }
}

export { LoginScreen, signOut };
