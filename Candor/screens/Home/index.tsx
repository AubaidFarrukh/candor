import {
  FC,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  NativeModules,
  Platform,
  View,
  Image,
  Pressable,
  Linking,
} from "react-native";
import {
  Button,
  Column,
  Input,
  Permission,
  Row,
  Spacer,
  TouchableIcon,
  Typography,
} from "../../components";
import { Page } from "../../layouts";
import { Colors, FontType, getHexColorOpacity } from "../../theme";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Game } from "./Game";
import { Inbox } from "./Inbox";
import { Submit } from "./Submit";
import RBSheet from "react-native-raw-bottom-sheet";
import { RevenueShare } from "./RevenueShare";
import { Screens } from "../../navigation";
import {
  ActiveTabContext,
  ProSubscriptionContext,
  UserProfile,
  UserToken,
} from "../../context";
import * as Contacts from "expo-contacts";
import * as WebBrowser from "expo-web-browser";
import * as MailComposer from "expo-mail-composer";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { Support } from "./Support";
import { DonateShare } from "./DonateShare";
import { RecurringDonation } from "./RecurringDonation";
import Modal from "react-native-modal";
import CloseIcon from "../../assets/svgs/Close.svg";
import { DELETE_ACCOUNT, SAVE_USER_SNAP_INFO } from "../../graphQL/mutations";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GET_PRESIGNED_URL,
  GET_UNREAD_MESSAGES_COUNT,
  GET_USER_REV_SHARE,
} from "../../graphQL/queries";
import { clearStorage } from "../../functions/storage";
import { FreeTrial } from "../../components/FreeTrial";
import { LoginKit } from "@snapchat/snap-kit-react-native";
import Share from "react-native-share";
import { CustomMenuSheet } from "../../components/CustomMenuSheet";
import * as ImagePicker from "expo-image-picker";
import { ResizeMode, Video } from "expo-av";
import { Image as ImageCompressor } from "react-native-compressor";

interface HomeProps {
  navigation: any;
  route: any;
}

async function startIosAdsRewardsAds() {
  return await NativeModules.AdsModule.showRewardsAds();
}

async function showInterstitialAds() {
  return await NativeModules.AdsModule.showInterstitialAds();
}

async function startAndroidAdsRewardsAds() {
  return await NativeModules.AdsModule.showRewardsAds();
}

export const Home: FC<HomeProps> = ({ navigation, route }): ReactElement => {
  const { setUserToken }: any = useContext(UserToken);
  const { setUserProfile, userProfile }: any = useContext<any>(UserProfile);
  const { activeTab, setactiveTab }: any = useContext(ActiveTabContext);
  const { isPro }: any = useContext(ProSubscriptionContext);
  const video = useRef(null);
  const [_, setAdLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisibleTutorial, setModalVisibleTutorial] = useState(false);
  const [imageLink, setImageLink] = useState("");
  const customMeuRBSheet = useRef<any>();
  const customMeuRBSheet2 = useRef<any>();
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const revShareSheet = useRef<any>();
  const supportSheet = useRef<any>();
  const donateShareSheet = useRef<any>();
  const recdonateShareSheet = useRef<any>();
  const [image, setImage] = useState("");
  const [totalEarnings, setTotalEarnings] = useState(0);

  const [UploadAsset, { data }] = useLazyQuery(GET_PRESIGNED_URL, {});

  const [SaveUserSnapInfo] = useMutation(SAVE_USER_SNAP_INFO, {
    async onCompleted(d) {
      console.log(d, "save user snap info");
      setImageUploadLoading(false);
      setUserProfile({
        ...userProfile,
        ...d?.UpdateUser,
      });
    },
    onError(e) {
      setImageUploadLoading(false);
    },
  });

  const getBlob = async (fileUri: string) => {
    try {
      const res = await fetch(fileUri)
        .then((r) => {
          return r.blob();
        })
        .catch((e) => console.log(e));

      return res;
    } catch (err) {
      console.log(err, "error from the blob");
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    ///

    if (!result.canceled) {
      const image = await ImageCompressor.compress(result.assets[0].uri, {
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
      });
      console.log(image);
      setImage(image);
    }
  };

  const { refetch: refetchRev } = useQuery(GET_USER_REV_SHARE, {
    fetchPolicy: "network-only",
    variables: {
      userId: userProfile?._id,
    },
    onCompleted(data) {
      setTotalEarnings(data?.User?.pending_earnings);
    },
  });

  // useEffect(() => {
  //   if (userProfile?.snapchat_bitmoji) {
  //     RNFetchBlob.config({
  //       fileCache: true,
  //       appendExt: "png",
  //     })
  //       .fetch("GET", userProfile?.snapchat_bitmoji, {})
  //       .then((res) => {
  //         console.log(res?.blob(), "blob");
  //       });
  //   }
  // }, []);

  useEffect(() => {
    (async function () {
      if (image) {
        const fileName = image.split("/").pop();
        const blob = await getBlob(image);
        UploadAsset({
          variables: {
            fileNames: [fileName],
          },
        });
        const url = data?.GetS3PreSignedUrls?.urls[0];
        try {
          setImageUploadLoading(true);
          const res = await fetch(url?.put, {
            method: "PUT",
            body: blob ? blob : "",
          });
          if (res?.status === 200) {
            const imagelink =
              "https://bsocial-assets.s3-accelerate.amazonaws.com/" + url.key;
            setImageLink(imagelink);
          } else {
            setImageUploadLoading(false);
          }
        } catch (err) {
          setImageUploadLoading(false);
        }
      }
    })();
  }, [image]);

  useEffect(() => {
    if (imageLink) {
      SaveUserSnapInfo({
        variables: {
          snapchatBitmoji: imageLink,
        },
      });
    }
  }, [imageLink]);

  const closeDonateRefSheet = () => {
    donateShareSheet.current?.close();
  };

  const closeRecurringRefSheet = () => {
    recdonateShareSheet?.current?.close();
  };

  const closeSupportSheet = () => {
    supportSheet?.current?.close();
  };

  const openDonateSheet = () => {
    donateShareSheet?.current?.open();
  };

  const openRecurringSheet = () => {
    recdonateShareSheet?.current?.open();
  };

  const [permissionModal, setPermissionModal] = useState(false);
  const [trialModal, setTrialModal] = useState(false);

  const { refetch } = useQuery(GET_UNREAD_MESSAGES_COUNT, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      refetchRev();
      setUnreadCount(
        data?.UnreadMessageCount +
        data?.TotalUnreadDMMessagesCount +
        data?.TotalUnreadGroupMessagesCount
      );
    },
    variables: {
      limit: 10000000,
      page: 0,
    },
  });

  useFocusEffect(() => {
    if (route?.params) {
      setactiveTab(route?.params?.tab);
      route.params = undefined;
    }
    refetchRev();
    refetch();
  });

  function showAd() {
    if (Platform.OS === "ios") {
      setAdLoading(true);
      startIosAdsRewardsAds()
        .then((item) => {
          if (item?.loaded === "0") {
            setAdLoading(true);
            showInterstitialAds()
              .then((item) => {
                setAdLoading(false);
              })
              .catch((e) => {
                setAdLoading(false);
              });
          }
          setAdLoading(false);
        })
        .catch((e) => {
          //handle generic error
          setAdLoading(false);
          console.log(e, "error");
        });
    } else {
      startAndroidAdsRewardsAds()
        .then((item) => { })
        .catch((e) => {
          // handle generic error here
        });
    }
  }

  const termsOfService = async () => {
    await WebBrowser.openBrowserAsync(
      "https://www.playcandor.com/terms-of-services"
    );
  };

  const privacyPolicy = async () => {
    await WebBrowser.openBrowserAsync(
      "https://www.playcandor.com/privacy-policy"
    );
  };

  const [DeleteAccount, { loading }] = useMutation(DELETE_ACCOUNT, {
    onCompleted() {
      setModalVisible(false);
      setUserProfile(null);
      setUserToken(null);
    },
  });

  const options2 = [
    {
      text: "Terms of Services",
      emoji: "📝",
      onPress: () => termsOfService(),
    },
    {
      text: "Privacy Policy",
      emoji: "⚖",
      onPress: () => privacyPolicy(),
    },
    {
      text: "Open Tutorial",
      emoji: "🎺",
      onPress: () => {
        customMeuRBSheet2.current.close();

        setTimeout(() => setModalVisibleTutorial(true), 500);
      },
    },
    {
      text: "Log out",
      emoji: "⚠",
      onPress: () => {
        setUserProfile(null);
        setUserToken(null);
        LoginKit.clearToken();
        clearStorage();
      },
    },
    {
      text: "Delete Account",
      emoji: "⛔",
      onPress: () => {
        customMeuRBSheet2.current.close();

        setTimeout(() => setModalVisible(true), 500);
      },
    },
  ];

  const openSettings = () => {
    customMeuRBSheet2.current.open();
  };

  const openInstagramLink = async () => {
    await WebBrowser.openBrowserAsync(
      "https://instagram.com/playcandor?igshid=YWJhMjlhZTc="
    );
  };

  const openMail = async () => {
    const isAvail = await MailComposer.isAvailableAsync();
    if (isAvail)
      await MailComposer.composeAsync({
        recipients: ["safety.candor@gmail.com"],
        subject: "I need help",
      });
  };

  const options = [
    {
      text: "Watch ads to donate to us",
      emoji: "🎬",
      onPress: () => showAd(),
    },

    {
      text: "Follow us on IG",
      emoji: "📱",
      onPress: () => openInstagramLink(),
    },
    {
      text: "Refer your friends",
      emoji: "🎁",
      onPress: () =>
        Share.open({
          url: `https://playcandor.com/app/signup/${userProfile?.username}`,
          title: "Share your profile link",
          message:
            "Candor is fun when more of your friends signup…. Share your unique link to refer Candor to your friends.",
        }),
    },
    {
      text: "I need help",
      emoji: "🏥",
      onPress: () => openMail(),
    },
    {
      text: "Add Profile Pic",
      emoji: "👩‍🔧",
      onPress: () => {
        customMeuRBSheet.current.close();

        setTimeout(pickImage, 500);
      },
    },

    {
      text: "Change password",
      emoji: "🔐",
      onPress: () => navigation.navigate(Screens.CHANGE_PASSWORD),
    },
    {
      text: "Settings",
      emoji: "⚙️",
      onPress: () => {
        customMeuRBSheet.current.close();
        setTimeout(openSettings, 500);
      },
    },
  ];

  const onpenMenu = () => {
    customMeuRBSheet.current.open();
  };

  useEffect(() => {
    async function getPermissions() {
      const contactStatus = await Contacts.getPermissionsAsync();

      if (!contactStatus.granted) {
        if (contactStatus.canAskAgain) {
          setPermissionModal(true);
        }
      }
    }
    getPermissions();
  }, []);
  useEffect(() => {
    const run = async () => {
      if (!isPro) {
        const openTimes: any = await AsyncStorage.getItem("NUMBER_OF_OPENS");

        let isTenth: boolean = false;
        if (openTimes) {
          if (Number(openTimes) % 10 === 0) {
            isTenth = true;
          } else {
            isTenth = false;
          }
        } else {
          isTenth = false;
        }

        if (isTenth) {
          console.log("isTenth");
          if (isPro) {
            setTrialModal(false);
          } else {
            setTrialModal(true);
          }
        } else {
          setTrialModal(false);
        }
      }
    };
    run();
  }, []);

  const openAppStore = () => {
    const link =
      Platform.OS == "ios"
        ? "itms-apps://apps.apple.com/us/app/besocial-social-commerce-app/id6444913142"
        : "https://play.google.com/store/apps/details?id=com.besocial.candor";

    Linking.canOpenURL(link).then(
      async (supported) => {
        if (supported) Linking.openURL(link);
        else WebBrowser.openBrowserAsync("https://joinbesocial.com/");
      },
      (err) => console.log(err)
    );
  };

  if (permissionModal) {
    return (
      <Permission
        closeModal={async () => {
          setPermissionModal(false);
          const res = await AsyncStorage.getItem("AFTER_FIRST_OPEN");
          if (res === "YES") {
            setModalVisibleTutorial(false);
          } else setModalVisibleTutorial(true);
        }}
      />
    );
  }

  if (!isPro && trialModal) {
    return <FreeTrial closeModal={() => setTrialModal(false)} />;
  }

  return (
    <Page safeAreaView={false} style={styles.center}>
      <StatusBar style="dark" />
      <Column
        backgroundColor={Colors.CANDOR_WHITE}
        style={{
          borderBottomEndRadius: 30,
          borderBottomStartRadius: 30,
          width: "100%",
          height: Platform.OS === "ios" ? "82%" : "87%",
          overflow: "hidden",
          padding: 0,
        }}
      >
        {activeTab == 0 ? (
          <Game
            navigation={navigation}
            onProfle={() => onpenMenu()}
            totalEarnings={totalEarnings}
            openRevShare={() => revShareSheet.current.open()}
            openProfile={() => onpenMenu()}
            openSupport={() => supportSheet.current.open()}
          />
        ) : activeTab == 1 ? (
          <Inbox
            navigation={navigation}
            refetchCount={refetch}
            totalEarnings={totalEarnings}
            setActiveTab={setactiveTab}
            isPro={isPro}
            openRevShare={() => revShareSheet.current.open()}
            openProfile={() => onpenMenu()}
            openSupport={() => supportSheet.current.open()}
          />
        ) : (
          <Submit navigation={navigation} />
        )}
        {/* </LinearGradient> */}
      </Column>
      <Row
        justifyContent="center"
        alignItems="center"
        backgroundColor={Colors.CANDOR_BLACK}
        width={"100%"}
        height={"7%"}
      >
        <TouchableIcon>
          <Column justifyContent="center" alignItems="center">
            <Typography
              color={activeTab == 0 ? Colors.CANDOR_WHITE : Colors.CANDOR_GRAY}
              textAlign="center"
              lineHeight={18}
              size={14}
              onPress={() => setactiveTab(0)}
            >
              Game
            </Typography>
            {activeTab == 0 ? (
              <Button
                color={Colors.CANDOR_WHITE}
                width={20}
                height={3}
                style={{
                  padding: 0,
                }}
              />
            ) : (
              <></>
            )}
          </Column>
        </TouchableIcon>
        <Spacer width={30} />
        <TouchableIcon>
          <Column justifyContent="center" alignItems="center">
            <Row alignItems="center">
              <Typography
                color={
                  activeTab == 1 ? Colors.CANDOR_WHITE : Colors.CANDOR_GRAY
                }
                textAlign="center"
                lineHeight={18}
                size={14}
                onPress={() => setactiveTab(1)}
              >
                Inbox
              </Typography>
              {unreadCount > 0 ? (
                <Column
                  height={22}
                  width={22}
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    zIndex: 1,
                    borderWidth: 2,
                    borderColor: Colors.CANDOR_BLACK,
                    borderRadius: 100,
                    alignSelf: "flex-end",
                    position: "absolute",
                    right: -getScreenResponsiveWidth(25),
                    bottom: -getScreenResponsiveHeight(2),
                  }}
                  backgroundColor={Colors.CANDOR_PINK}
                >
                  <Typography
                    textAlign="center"
                    type="Paragraph5"
                    color={Colors.CANDOR_WHITE}
                  >
                    {unreadCount}
                  </Typography>
                </Column>
              ) : (
                <></>
              )}
            </Row>
            {activeTab == 1 ? (
              <Button
                color={Colors.CANDOR_WHITE}
                width={20}
                height={3}
                style={{
                  padding: 0,
                }}
              />
            ) : (
              <></>
            )}
          </Column>
        </TouchableIcon>
      </Row>

      <Column width={"100%"}>
        <TouchableIcon onPress={openAppStore}>
          <Image
            style={{
              width: "100%",
              height: getScreenResponsiveHeight(90),
            }}
            source={require("../../assets/BesocialBanner.png")}
          />
        </TouchableIcon>
      </Column>

      <RBSheet
        ref={revShareSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={getScreenResponsiveHeight(509)}
        customStyles={{
          wrapper: styles.wrapper,
          draggableIcon: styles.draggableIcon,
          container: styles.container,
        }}
      >
        <RevenueShare navigation={navigation} rbSheetRef={revShareSheet} />
      </RBSheet>

      <RBSheet
        ref={supportSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={getScreenResponsiveHeight(681)}
        customStyles={{
          wrapper: styles.wrapper,
          draggableIcon: styles.draggableIcon,
          container: styles.container,
        }}
      >
        <Support
          close={closeSupportSheet}
          openDonateSheet={openDonateSheet}
          openRecurringSheet={openRecurringSheet}
        />
      </RBSheet>

      <RBSheet
        ref={donateShareSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={getScreenResponsiveHeight(509)}
        customStyles={{
          wrapper: styles.wrapper,
          draggableIcon: styles.draggableIcon,
          container: styles.container,
        }}
      >
        <DonateShare
          navigation={navigation}
          close={closeDonateRefSheet}
          setAdLoading={setAdLoading}
        />
      </RBSheet>

      <RBSheet
        ref={recdonateShareSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={getScreenResponsiveHeight(509)}
        customStyles={{
          wrapper: styles.wrapper,
          draggableIcon: styles.draggableIcon,
          container: styles.container,
        }}
      >
        <RecurringDonation
          close={closeRecurringRefSheet}
          navigation={navigation}
        />
      </RBSheet>

      <RBSheet
        ref={customMeuRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={getScreenResponsiveHeight(380)}
        customStyles={{
          container: {
            justifyContent: "flex-start",
            alignItems: "center",
            borderTopEndRadius: 20,
            borderTopStartRadius: 20,
            paddingHorizontal: getScreenResponsiveWidth(28),
          },
          draggableIcon: {
            width: 43.6,
            height: 0,
            borderStyle: "solid",
            borderWidth: 3,
            borderColor: "#eeeeee",
            borderRadius: 20,
          },
        }}
      >
        <CustomMenuSheet navigation={navigation} options={options} />
      </RBSheet>
      <RBSheet
        ref={customMeuRBSheet2}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={getScreenResponsiveHeight(350)}
        customStyles={{
          container: {
            justifyContent: "flex-start",
            alignItems: "center",
            borderTopEndRadius: 20,
            borderTopStartRadius: 20,
            paddingHorizontal: getScreenResponsiveWidth(28),
          },
          draggableIcon: {
            width: 43.6,
            height: 0,
            borderStyle: "solid",
            borderWidth: 3,
            borderColor: "#eeeeee",
            borderRadius: 20,
          },
        }}
      >
        <CustomMenuSheet navigation={navigation} options={options2} />
      </RBSheet>

      <Modal
        animationIn={"fadeIn"}
        animationOut={"fadeOut"}
        isVisible={isModalVisible}
        avoidKeyboard
        style={{ justifyContent: "center", alignItems: "center" }}
        onBackdropPress={() => setModalVisible(false)}
      >
        <Column
          backgroundColor={Colors.CANDOR_WHITE}
          style={{
            borderRadius: 26,
            paddingHorizontal: getScreenResponsiveWidth(11),
            paddingLeft: getScreenResponsiveWidth(29),
            paddingVertical: getScreenResponsiveHeight(14),
          }}
          height={330}
          width={300}
        >
          <View style={{ alignSelf: "flex-end" }}>
            <TouchableIcon onPress={() => setModalVisible(false)}>
              <CloseIcon />
            </TouchableIcon>
          </View>
          <Spacer height={10} />
          <Column
            style={{
              paddingRight: getScreenResponsiveWidth(29),
            }}
          >
            <Typography color={Colors.CANDOR_RED} size={24} type="Heading1">
              Delete Account
            </Typography>
            <Spacer height={10} />
            <Typography color={Colors.CANDOR_BLACK} type="Paragraph3">
              Delete your account will remove all your information from our
              database. This cannot be undone
            </Typography>
            <Spacer height={20} />
            <Typography
              color={Colors.CANDOR_RED}
              fontFamily={FontType.REGULAR_INTER}
              type="Paragraph3"
            >
              To confirm this enter your password
            </Typography>
            <Spacer height={10} />
            <Input
              secureTextEntry
              onChangeText={(text: string) => setPassword(text)}
              placeholder="Password"
            />
            <Spacer height={20} />
            <Button
              height={50}
              onPress={() => {
                DeleteAccount({
                  variables: {
                    password,
                  },
                });
              }}
              loading={loading}
              disabled={!password}
              color={Colors.CANDOR_DARK_GRAY}
              title="Delete"
            />
          </Column>
        </Column>
      </Modal>

      <Modal
        animationIn={"fadeIn"}
        animationOut={"fadeOut"}
        isVisible={isModalVisibleTutorial}
        style={{ justifyContent: "center", alignItems: "center" }}
        onBackdropPress={async () => {
          setModalVisibleTutorial(false);
          await AsyncStorage.setItem("AFTER_FIRST_OPEN", "YES");
        }}
      >
        <Column
          width={324.26}
          height={634}
          backgroundColor={Colors.CANDOR_WHITE}
          alignItems="center"
          justifyContent="center"
          style={{
            borderRadius: 15,
          }}
        >
          <Typography type="Heading1" textAlign="center" size={27}>
            {`Candor\nIn Action!!👇`}
          </Typography>
          <Spacer height={20} />
          <Video
            ref={video}
            shouldPlay
            isMuted={false}
            resizeMode={ResizeMode.COVER}
            style={{
              width: getScreenResponsiveWidth(230),
              height: getScreenResponsiveHeight(440),
              backgroundColor: Colors.CANDOR_GRAY,
              borderRadius: 20,
              alignSelf: "center",
            }}
            onError={(error) => {
              console.log(error, "video");
            }}
            source={require("../../assets/videos/tutorial.mov")}
            useNativeControls
          // isLooping
          />
          <Spacer height={20} />
          <Button
            onPress={async () => {
              setModalVisibleTutorial(false);
              await AsyncStorage.setItem("AFTER_FIRST_OPEN", "YES");
            }}
            title="Enter experience"
            width={257.68}
            height={47}
            textStyle={{
              fontSize: 14,
            }}
          />
        </Column>
      </Modal>
    </Page>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: getHexColorOpacity(Colors.CANDOR_BLACK, 32),
  },

  draggableIcon: {
    backgroundColor: Colors.CANDOR_BLACK,
  },
  container: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: Colors.CANDOR_BLACK,
  },
  badge: {
    backgroundColor: Colors.CANDOR_RED,
    width: getScreenResponsiveHeight(30),
    height: getScreenResponsiveHeight(30),
    alignSelf: "flex-end",
    borderRadius: 100,
    borderColor: Colors.CANDOR_BLACK,
    borderWidth: 3,
    marginBottom: -20,
    zIndex: 1,
  },
  center: {
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 0,
    paddingHorizontal: 0,
    backgroundColor: Colors.CANDOR_BLACK,
  },
});
