import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PrivacyPolicyConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  const checkConsentStatus = async () => {
    try {
      const hasConsented = await AsyncStorage.getItem("hasConsented");
      if (hasConsented === null) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Error checking consent status:", error);
    }
  };

  useEffect(() => {
    checkConsentStatus();
  }, []);

  const handleAccept = async () => {
    setIsVisible(false);
    try {
      await AsyncStorage.setItem("hasConsented", "true");
    } catch (error) {
      console.error("Error saving consent status:", error);
    }
  };

  // const handleReject = () => {
  //   setIsVisible(false);
  //   // Handle rejection appropriately (e.g., restrict access to certain features)
  // };

  const openPrivacyPolicy = () => {
    // Replace the URL with the link to your privacy policy
    Linking.openURL("https://www.open-seneca.org/privacy");
  };

  return (
    <Modal isVisible={isVisible} style={styles.modal}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy Consent</Text>
        <Text style={styles.text}>
          We value your privacy. Please review our Privacy Policy to understand
          how we collect, use, and protect your information.
        </Text>
        <TouchableOpacity onPress={openPrivacyPolicy} style={styles.link}>
          <Text style={styles.linkText}>Read Privacy Policy</Text>
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleAccept} style={styles.acceptButton}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
    width: "90%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  link: {
    marginBottom: 20,
  },
  linkText: {
    fontSize: 16,
    color: "#2e78b7",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rejectButton: {
    backgroundColor: "#d9534f",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  acceptButton: {
    backgroundColor: "#5cb85c",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default PrivacyPolicyConsent;
