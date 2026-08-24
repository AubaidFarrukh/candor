import { useState, useEffect } from "react";
import { FredokaOne_400Regular } from "@expo-google-fonts/fredoka-one";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { Anton_400Regular } from "@expo-google-fonts/anton";
import { SecularOne_400Regular } from "@expo-google-fonts/secular-one";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigation } from "./navigation/RootNavition";
import { useApolloClient } from "./utils/hooks/useApolloClient";
import { NativeModules, Platform, View } from "react-native";
import { useFonts } from "expo-font";
import { Audio } from "expo-av";
import { ApolloProvider } from "@apollo/client";
import {
  ActiveTabContext,
  DonationationSubscriptionContext,
  ProSubscriptionContext,
  SnapChatLoginContext,
  UserProfile,
  UserToken,
} from "./context";
import { ToastWrapper } from "./components/Toast/ToastWrapper";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { getData } from "./functions/storage";
import * as Sentry from "@sentry/react-native";
import { getGraphQLRequest } from "./utils/hooks/useGraphQLRequest";
import { UPDATE_FCM_TOKEN } from "./graphQL/mutations";
import messaging from "@react-native-firebase/messaging";

import AsyncStorage from "@react-native-async-storage/async-storage";

Sentry.init({
  dsn: "https://f0a265bb9a70493680cfb944b7c4d4fe@o1202366.ingest.sentry.io/4504481149091840",
  tracesSampleRate: 1.0,
});

function App() {
  const [userToken, setUserToken] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [activeTab, setactiveTab] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [isDonated, setIsDonated] = useState(false);
  const [isSnapLoggedIn, setIsSnapLoggedIn] = useState(false);

  const [toastData] = useState<any>(null);

  const { client } = useApolloClient();

  if (client === false) {
    return <View />;
  }

  useEffect(() => {
    async function load() {
      NativeModules.JailBreakManager.isJailBroken();
      NativeModules.AdsModule.initializedAdsMob();
    }
    load();
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const run = async () => {
      let user = await getData("user");
      if (user) {
        setUserProfile(JSON.parse(user));
      }
    };
    run();
  }, []);

  useEffect(() => {
    async function requestUserPermission() {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        if (authStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
          const status = await messaging().requestPermission();
          const notificationStatus =
            status === messaging.AuthorizationStatus.AUTHORIZED ||
            status === messaging.AuthorizationStatus.PROVISIONAL;
          if (notificationStatus) {
            const token = await messaging().getToken();
            const authtoken = await AsyncStorage.getItem("accessToken");
            if (authtoken) {
              await getGraphQLRequest(
                UPDATE_FCM_TOKEN,
                {
                  fcmToken: token,
                  device: Platform.OS,
                },
                true
              );
            }
          }
        }
      }

      if (enabled) {
        const token = await messaging().getToken();
        const authtoken = await AsyncStorage.getItem("accessToken");
        if (authtoken) {
          await getGraphQLRequest(
            UPDATE_FCM_TOKEN,
            {
              fcmToken: token,
              device: Platform.OS,
            },
            true
          );
        }
      }
    }

    requestUserPermission();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      if (remoteMessage?.notification?.title.includes("message")) {
      }
      console.log(remoteMessage, "hey");
    });

    return unsubscribe;
  }, [messaging]);

  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    messaging().onNotificationOpenedApp((remoteMessage) => {
      setactiveTab(1);
      console.log(remoteMessage);
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification
      );
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        // PushNotification.getApplicationIconBadgeNumber((count: number) => {
        // });
        if (remoteMessage) {
          setactiveTab(1);
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          );
        }
      });
  }, []);

  useEffect(() => {
    const run = async () => {
      const openTimes = await AsyncStorage.getItem("NUMBER_OF_OPENS");
      if (openTimes === null) {
        await AsyncStorage.setItem("NUMBER_OF_OPENS", "0");
      } else {
        await AsyncStorage.setItem(
          "NUMBER_OF_OPENS",
          String(Number(openTimes) + 1)
        );
      }
    };
    run();
  }, []);

  const [fontsLoaded] = useFonts({
    FredokaOne_400Regular,
    Inter_400Regular,
    Anton_400Regular,
    SecularOne_400Regular,
  });

  if (!client || !fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ActionSheetProvider>
        <ActiveTabContext.Provider value={{ activeTab, setactiveTab }}>
          <SnapChatLoginContext.Provider
            value={{ isSnapLoggedIn, setIsSnapLoggedIn }}
          >
            <ProSubscriptionContext.Provider value={{ isPro, setIsPro }}>
              <DonationationSubscriptionContext.Provider
                value={{ isDonated, setIsDonated }}
              >
                <ToastWrapper data={toastData}>
                  <UserToken.Provider value={{ userToken, setUserToken }}>
                    <UserProfile.Provider
                      value={{ userProfile, setUserProfile }}
                    >
                      <ApolloProvider client={client}>
                        <RootNavigation />
                      </ApolloProvider>
                    </UserProfile.Provider>
                  </UserToken.Provider>
                </ToastWrapper>
              </DonationationSubscriptionContext.Provider>
            </ProSubscriptionContext.Provider>
          </SnapChatLoginContext.Provider>
        </ActiveTabContext.Provider>
      </ActionSheetProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);
