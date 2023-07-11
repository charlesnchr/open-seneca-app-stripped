// import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import Geolocation from '@react-native-community/geolocation';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
import React, { Component } from 'react';
import {
  Alert,
  StyleSheet,
  ScrollView,
  View,
  KeyboardAvoidingView,
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
// import BleManager from 'react-native-ble-manager';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { Button, Icon, Text, Tooltip } from "react-native-elements";
import {
  Colors
} from 'react-native/Libraries/NewAppScreen';
import RealtimeFigure from "./RealtimeFigure";

import {request, check, openSettings, PERMISSIONS, RESULTS} from 'react-native-permissions';

import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

var RNFS = require('react-native-fs');


var Buffer = require("buffer/").Buffer; // note: the trailing slash is important!


const sensorValues = StyleSheet.create({
  container: {
    flexDirection:'row',alignContent:'stretch',height:'auto',
    padding:5
  },
  view: {
    height:'auto',marginVertical:10,marginHorizontal:5,padding:10,borderRadius:5,flex:1,backgroundColor:'rgb(210,210,210)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 8,
  },
  heading: {
    textAlign:'center',
    fontWeight:'bold'
  },
  value: {
    textAlign:'center'
  },
  seeMore: {
    textAlign:'center'
  },
})


const bluetoothBlock = StyleSheet.create({
  wrapper: {
  },
  container: {
    flexDirection:'row',
    padding:5
  },
  headerWrapper: {
    flexDirection:'row',
    flex:1,
    marginHorizontal:5
  },
  header: {
    flexDirection:'row',
    width:'100%',
    padding:10,borderRadius:5,
    backgroundColor:'rgb(210,210,210)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 8,
  },
  name: {
    fontWeight: 'bold'
  },
  disconnectWrapper: {
    flexDirection:'column',
  },
  disconnect: {
    flexDirection:'row',
    flex:1,
    marginHorizontal:5,
    borderRadius:10,
  },
  button: {
    // margin:0,
    // padding:10,
    // fontSize: 5,
    backgroundColor: 'rgb(255,193,7)',
    padding:10,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    flex:1,
    borderRadius:5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 8,
  },
  buttonContainer: {
    // margin:0,
    // padding:10,
    // flexDirection:'row',
    // justifyContent:'center',
    // alignItems:'center',
    // flex:1,
    // borderRadius:20,
    // alignSelf:'center'
  },
  buttonContent: {
    alignSelf:'center',
    flexDirection:'column',
    borderRadius:20,
    // flex:1
  },
  titleStyle: {
    fontSize:15,
    color: 'rgb(52,58,64)',
  }
})



// const BleManagerModule = NativeModules.BleManager;
// const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


var sess = require("./sess.js");


import { BleManager } from 'react-native-ble-plx';



// GLOBAL VARS

let readbuffer = []
let readtimer = Date.now()

///// for Android
// BLE config
// var serviceUUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
// var characteristicUUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

///// for iOS
// BLE config
var serviceUUID = 'ffe0';
var characteristicUUID = 'ffe1';


class BLE extends Component {
  constructor(props){
    super(props)

    // this.manager = new BleManager();

    // Restore state ? not sure it's necessary; seems to work without
    this.manager = new BleManager();

    this.state = {
      scanning:false,
      peripherals: new Map(),
      connectedPeripheral: null,
      appState: '',
      lat:0,
      lon:0,
      sensor_lat:0,
      sensor_lon:0,
      pm25: null,
      pm10: null,
      spd:0,
      watchHandler: null,
      isConnected: false,
      lastValueString: null,
      uniqueId: DeviceInfo.getUniqueId(),
      warningThreshold:30,
      alertThreshold:50,
      cloudSync:'Off',
      isEmulator:false,
      npackets:-1, // one less because first packet is assumed to be partial
      sentPackets:0,
      tripId:null // will be set to timestamp
    }
  }

  initBgTracker() {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      notificationTitle: 'Sensor recording',
      notificationText: 'ongoing',
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 1000,
      fastestInterval: 500,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
      url: null,

      // customize post properties
      postTemplate: {
        lat: '@latitude',
        lon: '@longitude',
        foo: 'bar' // you can also add your own properties
      }
    });

    BackgroundGeolocation.on('location', (location) => {

      // handle your locations here
      // to perform long running operation on iOS
      // you need to create background task

      // BackgroundGeolocation.startTask(taskKey => {
      //   // execute long running task
      //   // eg. ajax post location
      //   // IMPORTANT: task has to be ended by endTask
      //   BackgroundGeolocation.endTask(taskKey);
      // });

      console.log('GPS location bgTracker',Date.now(),location.latitude,location.longitude);
      this.setState({ lat:location.latitude, lon:location.longitude, spd:location.speed });

    });


    BackgroundGeolocation.on('stationary', (stationaryLocation) => {
      // handle stationary locations here
      // Actions.sendLocation(stationaryLocation);
    });

    BackgroundGeolocation.on('error', (error) => {
      console.log('[ERROR] BackgroundGeolocation error:', error);
    });

    BackgroundGeolocation.on('start', () => {
      console.log('[INFO] BackgroundGeolocation service has been started');
    });

    BackgroundGeolocation.on('stop', () => {
      console.log('[INFO] BackgroundGeolocation service has been stopped');
    });

    BackgroundGeolocation.on('authorization', (status) => {
      console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(() =>
          Alert.alert('Changing location permission to Always will provide more reliable geotagging.', 'Would you like to open app settings?', [
            { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
            { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
          ]), 1000);
      }
    });

    BackgroundGeolocation.on('background', () => {
      console.log('[INFO] App is in background');
    });

    BackgroundGeolocation.on('foreground', () => {
      console.log('[INFO] App is in foreground');
    });

    BackgroundGeolocation.on('abort_requested', () => {
      console.log('[INFO] Server responded with 285 Updates Not Required');

      // Here we can decide whether we want stop the updates or not.
      // If you've configured the server to return 285, then it means the server does not require further update.
      // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
      // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
    });

    BackgroundGeolocation.on('http_authorization', () => {
      console.log('[INFO] App needs to authorize the http requests');
    });

  }

  startBgTracker() {
    BackgroundGeolocation.checkStatus(status => {
      console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
      console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
      console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });
  }

  stopBgTracker() {
      BackgroundGeolocation.stop(); //triggers start on start event

    //   BackgroundGeolocation.checkStatus(status => {
    //   console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
    //   console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
    //   console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

    //   // you don't need to check status before start (this is just the example)
    //   if (status.isRunning) {
    //     BackgroundGeolocation.stop(); //triggers start on start event
    //   }
    // });
  }


  componentDidMount() {
    // FOR DEV — remove
    // this.setState({connectedPeripheral:{name:'test',id:'5345346'}, isConnected:true})

    sess.disconnectBLE = this.disconnect.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);

    DeviceInfo.isEmulator().then(isEmulator => {
      this.setState({isEmulator:isEmulator})
    })

    // get app configuration
    fetch('https://open-seneca.org/app_configuration.json').then((data) => data.json()).then((jsonobj) => {
      console.log('Downloaded configuration')
      this.setState({warningThreshold:jsonobj['pm25_warningThreshold'],alertThreshold:jsonobj['pm25_alertThreshold']})
    }).catch((error) => {console.log('could not load online configuration')})


    AppState.addEventListener('change', this.handleAppStateChange);

    // if (Platform.OS === 'android' && Platform.Version >= 23) {
    //     PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
    //         if (result) {
    //           console.log("Permission is OK");
    //         } else {
    //           PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
    //             if (result) {
    //               console.log("User accept");
    //             } else {
    //               console.log("User refuse");
    //             }
    //           });
    //         }
    //   });
    // }




    // you can also just start without checking for status
    // BackgroundGeolocation.start();


  }


  handleAppStateChange(nextAppState) {
    // if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
    //   console.log('App has come to the foreground!')
    // }
    console.log('App has come to',nextAppState)


    this.setState({appState: nextAppState});
  }

  componentWillUnmount() {
      console.log('will unmount BLE');
      console.log('perip',this.state.peripherals)
      this.disconnect();
      // Geolocation.clearWatch(this.state.watchHandler);
      // BackgroundGeolocation.removeAllListeners();
  }

  sendToDb(result) {
    fetch(sess.baseurl + '/api/saveEntry', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: this.state.lat,
        lon: this.state.lon,
        spd: this.state.spd,
        AID: this.state.uniqueId,
        sensorname: this.state.connectedPeripheral.name,
        t: Date.now(),
        tripId: this.state.tripId,
        data: result,
      })
    }).then((data) => data.json()).then((jsonobj) => {
      let resp = jsonobj['resp'];
      console.log('RESPONSE',resp)
      if(resp === 'signinRequired') {
        console.log('Not signed in on the backend server')
        // alert('The server does not know your identity')
        sess.reloadAuth()
      }
      else {
        let sentPackets = this.state.sentPackets
        sentPackets++
        console.log('cloudsync on');
        this.setState({cloudSync:'On',sentPackets:sentPackets})
      }
    }).catch((err) => {
      console.log('upload failed',err)
      this.setState({cloudSync:'Off'})
    })
  }


  parsePacket(readbuffer) {
    var n_commas = 0
    var result = ""
    for(var i = 0; i < readbuffer.length; i++) {
      if(readbuffer[i] == 44) n_commas++
      result += String.fromCharCode(readbuffer[i])
    }
    result = result.trim()

    if(sess.logging_enabled) {
      console.log('now logging')
      var path = RNFS.DocumentDirectoryPath + '/open-seneca_logfile.csv';

      // write the file
      RNFS.appendFile(path, result + "\n", 'utf8')
        .then((success) => {
          console.log('FILE WRITTEN!');
        })
        .catch((err) => {
          console.log(err.message);
        });
    }

    var lastValueString = 'Device:' + this.state.uniqueId + ', Time: ' +
      + parseInt(Date.now()/1000) + ' GPS: (' + this.state.lat + ', ' + this.state.lon +
      ') n_commas:' + n_commas + ' Data: ' + result
     this.sendToDb(result)
    // console.log(lastValueString)
    let resultSplit = result.split(',')
    let pm25 = parseFloat(resultSplit[11])
    let pm10 = parseFloat(resultSplit[13])
    let sensor_lat = parseFloat(resultSplit[1])
    let sensor_lon = parseFloat(resultSplit[2])

    this.setState({lastValueString:lastValueString,pm25:pm25,pm10:pm10,sensor_lat:sensor_lat,sensor_lon:sensor_lon})

    if(sess.addDataPt && !isNaN(pm25)) {
      sess.addDataPt(pm25)
    }

  }


  handleUpdateValueForCharacteristic(data) {
    // console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
    // console.log(data)
    // console.log('Got bluetooth packet')
    readbuffer.push(...data) // fix index
    if( data[data.length-1] === 10 ) { // is not newline
      this.state.npackets++
      if(this.state.npackets > 1) {
        this.parsePacket(readbuffer)
      }
      readbuffer = []
    }
    readtimer = Date.now()
  }

  refreshLocation() {
    Geolocation.getCurrentPosition(
      (position) => {
          console.log('got GPS location',Date.now());
         sess.currentPosition_lat = position.coords.latitude;
         sess.currentPosition_lon = position.coords.longitude;
         this.setState({ lat:position.coords.latitude, lon:position.coords.longitude, spd:position.coords.speed  });
      },
      (error) => {console.log("gps error:", error.message)},
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  async startScan() {
    // get first position
    console.log("requesting now",Date.now())
    this.refreshLocation()

    if (this.state.isEmulator) {
      this.setState({scanning:true});
      var peripherals = this.state.peripherals;
      let peripheral = {"advertising": {"isConnectable": 1, "localName": "HMSoft", "serviceUUIDs": ["FFE0"], "txPowerLevel": 0}, "id": "E2B58D0A-56EA-8150-03CF-A6A234FA6128", "name": "SimulatedDevice", "rssi": -76};
      console.log('Got simulated peripheral', peripheral);
      if (!peripheral.name) {
        peripheral.name = 'NO NAME';
      }
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals });
    } else if (!this.state.scanning) {
      this.setState({scanning:true})
      console.log("Shoulld start scan")
      //this.setState({peripherals: new Map()});
      this.manager.connectedDevices([serviceUUID]).then((devices) => {
        console.log("known devices",devices)
        devices.forEach(device => {
          var peripherals = this.state.peripherals;
          peripherals.set(device.id, device)  ;
          this.setState({ peripherals });
        });
      })

      this.manager.startDeviceScan([serviceUUID], null, (error, device) => {
        if (error) {
            // Handle error (scanning will be stopped automatically)
            return
        }

        console.log("Found device:",device.name,device.id,device.rssi)

        var peripherals = this.state.peripherals;
        peripherals.set(device.id, device)  ;
        this.setState({ peripherals });

        // }
      });
    } else {
      console.log("already scanning")
    }
    setTimeout(() => {
      this.manager.stopDeviceScan();
      this.setState({scanning:false});
    }, 3000);
  }


  prepareComm() {

    // ANDROID

    if (Platform.OS === 'android') {
      check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log('This feature is not available (on this device / in this context)');
            break;
          case RESULTS.DENIED:
            console.log('The permission has not been requested / is denied but requestable');
            request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((result) => {
              console.log("requested",result)
              switch (result) {
                case RESULTS.GRANTED:

                  this.startScan()
                  break
                case RESULTS.BLOCKED:
                  Alert.alert("Reinstall or change settings","The app will not work without location permissions. Either reinstall or go to Settings.", [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Settings cancelled"),
                      style: "cancel"
                    },
                    { text: "OK", onPress: () => {
                        console.log("OK Pressed")
                        openSettings()
                      }
                    }
                  ])
                  break
                case RESULTS.DENIED:
                  Alert.alert("Permissions needed","The app will not work without location permissions.", [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Settings cancelled"),
                      style: "cancel"
                    },
                    { text: "OK", onPress: () => {
                        console.log("OK Pressed")
                        openSettings()
                      }
                    }
                  ])
                  break
              }
            })
              break;
            case RESULTS.LIMITED:
              console.log('The permission is limited: some actions are possible');
              break;
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            this.startScan()
            break;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            Alert.alert("Reinstall or change settings","The app will not work without location permissions. Either reinstall or go to Settings.")
            break;
        }
      })

      // IOS

    } else if (Platform.OS === 'ios') {
      check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log('This feature is not available (on this device / in this context)');
            break;
          case RESULTS.DENIED:
            console.log('The permission has not been requested / is denied but requestable');
            request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then((result) => {
              console.log("requested",result)
              switch (result) {
                case RESULTS.GRANTED:
                  this.startScan()
                  break
                case RESULTS.BLOCKED:
                  Alert.alert("Reinstall or change settings","The app will not work without location permissions. Either reinstall or go to Settings.", [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Settings cancelled"),
                      style: "cancel"
                    },
                    { text: "OK", onPress: () => {
                        console.log("OK Pressed")
                        openSettings()
                      }
                    }
                  ])
                  break
                case RESULTS.DENIED:
                  Alert.alert("Permissions needed","The app will not work without location permissions.", [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Settings cancelled"),
                      style: "cancel"
                    },
                    { text: "OK", onPress: () => {
                        console.log("OK Pressed")
                        openSettings()
                      }
                    }
                  ])
                  break
              }
            })
              break;
            case RESULTS.LIMITED:
              console.log('The permission is limited: some actions are possible');
              break;
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            this.startScan()
              break;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            Alert.alert("Reinstall or change settings","The app will not work without location permissions. Either reinstall or go to Settings.", [
              {
                text: "Cancel",
                onPress: () => console.log("Settings cancelled"),
                style: "cancel"
              },
              { text: "OK", onPress: () => {
                  console.log("OK Pressed")
                  openSettings()
                }
              }
            ])

            break;
        }
      })
    }

  }

  retrieveConnected(){

  }

  disconnect() {
    var peripheral = this.state.connectedPeripheral;
    console.log('found',peripheral,'to be connected.. disconnecting')
    if(peripheral) {
      // if(peripheral.name != 'SimulatedDevice')
      //   BleManager.disconnect(peripheral.id);
      console.log("disconnected",peripheral.id);

      // stop gps listener

      if (Platform.OS === 'android') {
        this.stopBgTracker()
        BackgroundGeolocation.removeAllListeners();
      } else {
        Geolocation.clearWatch(this.state.watchHandler);
      }

      // this.manager.cancelDeviceConnection(peripheral)
      if(peripheral.name != 'SimulatedDevice')
        peripheral.cancelConnection()

      // BleManager.removePeripheral(peripheral.id); // Android only
      // BleManager.stopNotification(peripheral.id, service, characteristicUUID);
    }
  }

  handleDiscoverPeripheral(peripheral) {
    if(!this.state.isConnected) {
      var peripherals = this.state.peripherals;
      // console.log('Got ble peripheral', peripheral);
      if (!peripheral.name) {
        peripheral.name = 'NO NAME';
      }
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals });
    }
  }

  setRandomValue(peripheral) {
    console.log('inside setRandom',peripheral,this.state.connectedPeripheral)
    if (peripheral.connected) {
      this.state.npackets++
      var rndVal = (parseInt(Math.random()*1000)/1000).toString()
      // var readbuffer_tmp = "241748,0.000000,0.000000,0,0.00,0.00,0,20000000,000000,2278165,1.03, " + rndVal + ",1.90,24.57,43.55,5.87,7.59,8.09,8.16,8.17,0.82,-1,-1,5.22"
      var readbuffer_tmp = "241748,1.000000,2.000000,0,0.00,0.00,0,20000000,000000,2278165,1.03, " + rndVal + ",1.90,24.57,43.55,5.87,7.59,8.09,8.16,8.17,0.82,-1,-1,5.22"
      let readbuffer = []
      for(let i = 0; i < readbuffer_tmp.length; i++) {
        readbuffer.push(readbuffer_tmp.charCodeAt(i))
      }
      this.parsePacket(readbuffer)
      setTimeout(() => {
        this.setRandomValue(peripheral)
      }, 1000);
    }
  }

  async listenToCharacteristic(device) {

    // console.log("characteristic listener",device);
      this.setState({tripId: Date.now(),connectedPeripheral:device, isConnected:true});

      // Do work on device with services and characteristics
      // const services = await device.services();
      // console.log("Services:",services);
      // const characteristics = await services[2].characteristics();
      // console.log("Characteristics:",characteristics);

      let characteristics = await device.characteristicsForService(serviceUUID)

      // console.log("found characteristics",characteristics)

      characteristics[0].monitor((err, update) => {
        if (err) {
          console.log(`characteristic error: ${err}`);
          console.log(JSON.stringify(err));
        } else {
          // console.log("Is Characteristics Readable:",update.isReadable);
          // console.log("Heart Rate Data:",base64.decode(update.value));
          // console.log(update)
          let decoded = Buffer.from(update.value, 'base64');
          this.handleUpdateValueForCharacteristic(decoded)
          // console.log("Heart Rate Data:",update.value);
          // const readCharacteristic = await device.readCharacteristicForService(userDataServiceUUID, heightCharacteristicUUID); // assuming the device is already connected
          // var data = new Uint16Array(base64.decode(update.value));

          // const heartRateData = Buffer.from(update.value, 'base64').readUInt16LE(0);
          // console.log("Heart Beats:",heartRateData);
        }
      });
  }

  performDeviceConnect(device) {
            // Check if it is a device you are looking for based on advertisement data
        // or other criteria.
        // if (device.name === 'HMSoft') {
          console.log("connecting to",device)

          // Stop scanning as it's not necessary if you are scanning for one device.

        device.connect().then((device) => {
        console.log("asttemping to discovbertw")
          return device.discoverAllServicesAndCharacteristics()
        }).then(async (device) => {
          this.listenToCharacteristic(device)
        })

        //   await

        //   this.manager.servicesForDevice(device).then((characteistics) => {
        //     console.log("found characteristic",characteistics)
        //   })
        // })


          //   let thisSubscription = this.manager.monitorCharacteristicForDevice(device, service, characteristicUUID, (err, characteristic) => {
          //     // console.log('monitorCharacteristicForDevice fires once');
          //     if(err) {
          //       console.log('Err from pen', err);
          //       return
          //     }
          //     console.log('data from pen: ', characteristic);
          //   })

          //   console.log('thisSubscription', thisSubscription);
            // })
        .catch((error) => {
            // Handle errors
        });
  }


  async deviceConnectHandler(peripheral) {

    // will check if logging should be enabled

    try {
        const value = await AsyncStorage.getItem('logging_enabled');
        if (value !== null) {
          sess.logging_enabled = JSON.parse(value)
        }
      } catch (error) {
        // Error retrieving data
      }



    if (this.state.isEmulator) {
      let peripherals = this.state.peripherals;
      let p = peripherals.get(peripheral.id);

      if (peripheral.connected) {
        if (p) {
          p.connected = false;
          peripherals.set(peripheral.id, p);
          this.setState({peripherals: peripherals, connectedPeripheral:p, isConnected:false});
        }
      } else {
        console.log('Connected to simulated device' + peripheral.id,peripheral.name,p.id,p.name);

        if (p) {
          p.connected = true;
          peripherals.set(peripheral.id, p);
          this.setState({peripherals: peripherals, connectedPeripheral:p, isConnected:true});
        }
        setTimeout(() => {
          this.setRandomValue(peripheral)
        }, 500);
      }
    } else if (peripheral) {
      console.log("will now check if connected")
      if (this.state.isConnected) { // await peripheral.isConnected()
        console.log("disconnecting from",peripheral.id)

        // stop gps listener

        if (Platform.OS === 'android') {
          this.stopBgTracker()
          BackgroundGeolocation.removeAllListeners();
        } else {
          Geolocation.clearWatch(this.state.watchHandler);
        }

        // this.manager.cancelDeviceConnection(peripheral)
        peripheral.cancelConnection()
        this.setState({isConnected:false})

        // // stop BT
        // BleManager.stopNotification(peripheral.id, service, characteristicUUID).then(() => {
        //   BleManager.disconnect(peripheral.id).then(() => {
        //     this.setState({connectedPeripheral:peripheral,isConnected:false})
        //   })
        // })
      } else if (!this.state.isConnected) { // allow a new connection
        this.performDeviceConnect(peripheral)
        // BleManager.connect(peripheral.id).then(() => {
        //   console.log('Connected to ' + peripheral.id);

        //   // setting up gps listener
        if (Platform.OS === 'android') {
          this.refreshLocation()
          this.initBgTracker()
          this.startBgTracker()
        } else {
          this.state.watchHandler = Geolocation.watchPosition(
            (position) => {
            console.log('watched GPS location',Date.now(),position.coords.latitude);
            this.setState({ lat:position.coords.latitude, lon:position.coords.longitude, spd:position.coords.speed });
            },
            error => console.log(error),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter:0,useSignificantChanges:false }
          );
        }


        //   console.log('retrieving service')
        //   BleManager.retrieveServices(peripheral.id).then(() => {
        //     BleManager.startNotification(peripheral.id, service, characteristicUUID).then(() => {
        //       let peripherals = this.state.peripherals;
        //       let p = peripherals.get(peripheral.id);
        //       if (p) {
        //         console.log('connected to',p)
        //         p.connected = true;
        //         peripherals.set(peripheral.id, p);
        //         this.setState({peripherals: peripherals, connectedPeripheral:p, isConnected:true});
        //       }
        //     })
        //   })
        // })


      } else {
        // console.log('Rejecting dual connections')
        // console.log('new id',peripheral.id)

        // let peripherals = this.state.peripherals;
        // peripherals.forEach(p => {
        //     console.log(p)
        // });
      }
    }
  }

  disconnectFromConnectedPeripheral() {
    console.log('will try to disconnect from peripheral')
    this.deviceConnectHandler(this.state.connectedPeripheral)
  }

  renderItem(item) {

    const color = item.connected ? 'rgb(50,200,50)' : 'rgb(240,240,240)';
    return (
      <TouchableHighlight onPress={() => this.deviceConnectHandler(item) }>
        <View style={[styles.row, {backgroundColor: color}]}>
          <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
          <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>RSSI: {item.rssi}</Text>
          <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20}}>{item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  render() {

    if(this.state.appState == 'inactive' || this.state.appState == 'background')
      return []

    const list = Array.from(this.state.peripherals.values());
    // list.push({id:'1',name:'first',rssi:'rssi1'})
    // list.push({id:'2',name:'first',rssi:'rssi1'})
    // list.push({id:'3',name:'first',rssi:'rssi1'})
    // list.push({id:'4',name:'first',rssi:'rssi1'})
    // list.push({id:'5',name:'first',rssi:'rssi1'})

    const btnScanTitle = this.state.scanning ? 'Scanning...' : 'Scan Bluetooth';
    let checkIcon = <Icon type="material-community" name='checkbox-marked-circle' color='rgb(50,170,50)'/>
    let crossIcon = <Icon type="material-community" name='alert-circle' color='rgb(170,50,50)'/>

    const valueTable =
    <View style={sensorValues.container}>
      <Pressable style={sensorValues.view}>
        <Tooltip skipAndroidStatusBar={true} backgroundColor={'rgb(52,58,64)'} height={120} width={140} popover={<Text style={{fontWeight:'bold',color:'white'}}>PM 2.5:{"\n"}{this.state.pm25 && this.state.pm25.toFixed(2)} µg/㎥{"\n\n"}PM 10:{"\n"}{this.state.pm10 && this.state.pm10.toFixed(2)} µg/㎥</Text>}>
        <Text style={sensorValues.heading}>PM 2.5</Text>
        <Text style={sensorValues.value}>{this.state.pm25 ? this.state.pm25.toFixed(2) + '\nµg/㎥' : 'N/A'}</Text>
        <Text style={sensorValues.seeMore}>See more</Text>
        </Tooltip>
        </Pressable>
        <Pressable style={sensorValues.view}>
        <Tooltip skipAndroidStatusBar={true}  backgroundColor={'rgb(52,58,64)'} height={120} width={140} popover={<Text style={{fontWeight:'bold',color:'white'}}>Latitude:{"\n"}{this.state.sensor_lat.toFixed(8)} {"\n\n"}Longitude:{"\n"}{this.state.sensor_lon.toFixed(8)}</Text>}>
        <Text style={sensorValues.heading}>Sensor GPS</Text>
        <Text style={sensorValues.value}> {
          (this.state.sensor_lat < 0.0001
          && this.state.sensor_lat > -0.0001
          && this.state.sensor_lon < 0.0001
          && this.state.sensor_lon > -0.0001) ? crossIcon : checkIcon} </Text>
        <Text style={sensorValues.seeMore}>See more</Text>
        </Tooltip>
        </Pressable>
      <Pressable style={sensorValues.view}>
        <Tooltip skipAndroidStatusBar={true}  backgroundColor={'rgb(52,58,64)'} height={120} width={140} popover={<Text style={{fontWeight:'bold',color:'white'}}>Latitude:{"\n"}{this.state.lat.toFixed(8)} {"\n\n"}Longitude:{"\n"}{this.state.lon.toFixed(8)}</Text>}>
        <Text style={sensorValues.heading}>Phone GPS</Text>
        <Text style={sensorValues.value}> {
          (this.state.lat < 0.0001
          && this.state.lat > -0.0001
          && this.state.lon < 0.0001
          && this.state.lon > -0.0001) ? crossIcon : checkIcon} </Text>
        <Text style={sensorValues.seeMore}>See more</Text>
        </Tooltip>
        </Pressable>
      <Pressable style={sensorValues.view}>
        <Tooltip skipAndroidStatusBar={true}  backgroundColor={'rgb(52,58,64)'} height={60} width={140} popover={<Text style={{fontWeight:'bold',color:'white'}}>Packets sent: {this.state.sentPackets}</Text>}>
        <Text style={sensorValues.heading}>Cloud Link</Text>
        <Text style={sensorValues.value}> {this.state.cloudSync == 'On' ? checkIcon : crossIcon} </Text>
        <Text style={sensorValues.seeMore}>See more</Text>
        </Tooltip>
      </Pressable>
    </View>

    let scanView =
    <View>
    <Text style={{padding:20}}>Connect device</Text>
    <View style={{margin: 10}}>
      <Button title={btnScanTitle} onPress={() => this.prepareComm() } />
    </View>
    </View>




    return (

        <View style={{flex:1}}>

          {this.state.isConnected ? valueTable : scanView}

          {(!this.state.isConnected && list.length == 0) &&
            <View style={{margin: 20}}>
              <Text style={{textAlign: 'center'}}>No peripherals</Text>
            </View>
          }
          {(!this.state.isConnected && list.length > 0) &&
            <View>
            <FlatList
              data={list}
              renderItem={({ item }) => this.renderItem(item) }
              keyExtractor={item => item.id}
            />
            </View>
          }
          {this.state.isConnected &&
          <View style={bluetoothBlock.wrapper}>
            <View style={bluetoothBlock.container}>

              <View style={bluetoothBlock.headerWrapper}>
                <View style={bluetoothBlock.header}>
                  <View>
                    <Icon
                      style={{marginRight:10}}
                      type="material-community"
                      size={30}
                      name='bluetooth-transfer' color='rgb(50,170,50)'
                    />
                  </View>
                  <View>
                    <Text>Connected to:{"\n"}<Text style={bluetoothBlock.name}>{this.state.connectedPeripheral.name}</Text> </Text>
                  </View>
                </View>
              </View>
              <View style={bluetoothBlock.disconnectWrapper}>
                <View style={bluetoothBlock.disconnect}>
                  <View style={bluetoothBlock.buttonContainer}>
                    <Pressable style={bluetoothBlock.button} onPress={this.disconnectFromConnectedPeripheral.bind(this)}>
                      <Icon style={bluetoothBlock.buttonContent} type="material-community" name='bluetooth-off' color='rgb(52,58,64)'/>
                      <Text style={bluetoothBlock.buttonContent}>Disconnect</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </View>
          }


            { this.state.isConnected &&
            <RealtimeFigure/> }

        </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
    },
    scrollView: {
      backgroundColor: Colors.lighter,
    },
    engine: {
      position: 'absolute',
      right: 0,
    },
    body: {
      backgroundColor: Colors.white,
    },
    sectionContainer: {
      marginTop: 32,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: Colors.black,
    },
    sectionDescription: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: '400',
      color: Colors.dark,
    },
    highlight: {
      fontWeight: '700',
    },
    footer: {
      color: Colors.dark,
      fontSize: 12,
      fontWeight: '600',
      padding: 4,
      paddingRight: 12,
      textAlign: 'right',
    },
  });


export default BLE;
