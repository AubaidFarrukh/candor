import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  FlatList,
  View,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Image,
  Platform,
  AppState,
  NativeModules,
} from "react-native";
import {
  Button,
  Column,
  Row,
  Spacer,
  TouchableIcon,
  Typography,
} from "../../components";
import { Screens } from "../../navigation";
import { Colors, FontType, getHexColorOpacity } from "../../theme";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { LIST_MESSAGES } from "../../graphQL/queries";
import {
  DELETE_MESSAGE,
  DELETE_MESSAGE_AND_BLOCK_SENDER,
  MARK_READ,
  MARK_REPLIED,
} from "../../graphQL/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { WhoSentThis } from "./WhoSentThis";
import * as MailComposer from "expo-mail-composer";
import BackButton2 from "../../assets/svgs/BackButton2.svg";
import Reportbutton from "../../assets/svgs/Reportbutton.svg";
import Check from "../../assets/svgs/Check.svg";
import SnapChat from "../../assets/svgs/Snapchat.svg";
import Instagram from "../../assets/svgs/Instagram.svg";
import Whatsapp from "../../assets/svgs/Whatsapp.svg";
import RBSheet from "react-native-raw-bottom-sheet";
import { useActionSheet } from "@expo/react-native-action-sheet";
import {
  ProSubscriptionContext,
  ToastContext,
  UserProfile,
} from "../../context";
import * as Clipboard from "expo-clipboard";
import Share, { Social } from "react-native-share";
import { CreativeKit, MetadataParams } from "@snapchat/snap-kit-react-native";
import ViewShot from "react-native-view-shot";
import Lottie from "lottie-react-native";
import Sound from "react-native-sound";
import { useFocusEffect } from "@react-navigation/native";
import CloseIcon from "../../assets/svgs/Close.svg";
import { OneTimeReveal } from "./OneTimeReveal";
import { emojis } from "../../constants";

export const Message = ({
  navigation,
  setActiveTab,
  refetchCount,
}: any): ReactElement => {
  const whoSentThis = useRef<any>();
  const videoGen = useRef<any>();
  const animationRef = useRef<Lottie>(null);
  const [isPlaying, setisPlaying] = useState<any>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [openedMsg, setopenedMsg] = useState<any>(null);
  const [_, setopenedMsgIndex] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setpage] = useState<any>(0);
  const { userProfile }: any = useContext(UserProfile);
  const [inboxs, setInboxs] = useState([]);
  const { isPro }: any = useContext(ProSubscriptionContext);
  const [videoGenProgress, setvideoGenProgress] = useState("5%");
  const { toast } = useContext<any>(ToastContext);

  const appState = useRef(AppState.currentState);

  const platformShare =
    Platform.OS == "ios"
      ? ["Instagram", "whatsapp"]
      : ["Instagram", "whatsapp"];

  const [sound1, setsound1] = useState<any>({
    sound1: null,
  });

  function delay(time: any) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  useEffect(() => {
    Sound.setCategory("Playback", true);
    return () => {
      if (sound1.sound1) {
        sound1.sound1.release();
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        sound1.sound1?.stop(() => {
          console.log("Stop");
          setisPlaying(false);
          animationRef.current?.reset();
        });
      };
    }, [navigation])
  );

  function killAudio() {
    sound1.sound1?.stop(() => {
      console.log("Stop");
      setisPlaying(false);
      animationRef.current?.reset();
    });
  }

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
      } else {
        killAudio();
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const playSound = () => {
    sound1.sound1 = new Sound(openedMsg?.answer_audio, "", (error: any) => {
      if (error) {
        alert("error" + error.message);
        setisPlaying(false);
        return;
      }
      sound1.sound1.play(() => {
        sound1.sound1.release();
        setisPlaying(false);
        animationRef.current?.reset();
      });
      animationRef.current?.play();
      setisPlaying(true);
    });
    return;
  };

  const stopSound = () => {
    if (sound1.sound1) {
      sound1.sound1.stop(() => {
        console.log("Stop");
        setisPlaying(false);
        animationRef.current?.reset();
      });
    } else {
      alert("Not set");
    }
  };

  const limit = 20;
  const { data, loading, refetch, fetchMore } = useQuery(LIST_MESSAGES, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      setpage(page + 1);
      setInboxs(data?.ListMessages);
      refetchCount();
    },
    variables: {
      limit: limit,
      page: 0,
    },
  });

  const { showActionSheetWithOptions } = useActionSheet();

  const openMail = async () => {
    const isAvail = await MailComposer.isAvailableAsync();
    if (isAvail)
      await MailComposer.composeAsync({
        recipients: ["report.candor@gmail.com"],
        body: `-----\nUSERID:${userProfile?._id}\nMESSAGEID:${openedMsg?._id}\n-----\n`,
      });
  };

  const [DeleteMessage] = useMutation(DELETE_MESSAGE, {
    onCompleted() {
      refetch();
      refetchCount();
      setModalVisible(!modalVisible);
    },
  });

  const [DeleteMessageAndBlockSender] = useMutation(
    DELETE_MESSAGE_AND_BLOCK_SENDER,
    {
      onCompleted() {
        refetch();
        refetchCount();
        setModalVisible(!modalVisible);
      },
    }
  );

  const openReportAction = () => {
    const options = [
      "Delete message",
      "Block user",
      "Tell Candor Team",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: [0, 1, 2],
      },
      (selectedIndex: any) => {
        switch (selectedIndex) {
          case 0:
            DeleteMessage({
              variables: {
                deleteMessageId: openedMsg?._id,
              },
            });
            break;

          case 1:
            DeleteMessageAndBlockSender({
              variables: {
                deleteMessageId: openedMsg?._id,
                temporarySenderUserId: openedMsg?.temporary_sender_user_id,
              },
            });
            break;

          case 2:
            openMail();
            break;
        }
      }
    );
  };
  const openReport = () => {
    if (Platform.OS === "android") {
      setModalVisible(false);
    }
    const options = [
      "Bullying or harassment",
      "Spam",
      "I just dont like it",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: 2,
        title: "Why are you reporting this message?",
      },
      (selectedIndex: any) => {
        switch (selectedIndex) {
          case 0:
            openReportAction();
            break;

          case 1:
            openReportAction();
            break;

          case 2:
            openReportAction();
            break;
          case 3:
            setModalVisible(true);
            break;
        }
      }
    );
  };

  const [MarkRead] = useMutation(MARK_READ, {
    onCompleted() {
      refetch();
      refetchCount();
    },
  });

  const [MarkReplied] = useMutation(MARK_REPLIED, {
    onCompleted() {
      refetch();
      refetchCount();
    },
  });

  const onRefresh = async () => {
    setpage(0);
    setRefreshing(true);
    const { loading } = await refetch();
    setRefreshing(loading);
  };

  const answerCard = useRef<any>();

  const preLink = "https://playcandor.com";

  const cardId = openedMsg?.card?._id;

  const link = `${preLink}/${userProfile?.username}/${cardId}`;

  const shareToInsta = async (image: string) => {
    Platform.OS === "ios" ? NativeModules.AdsModule.copyText(link) : null;
    await Clipboard.setStringAsync(link).then(async () => {
      await Share.shareSingle({
        social: Social.InstagramStories,
        stickerImage: image,
        backgroundBottomColor: Colors.CANDOR_BLACK,
        backgroundTopColor: Colors.CANDOR_BLACK,
        appId: "688761346318080",
        attributionURL: link,
      });
    });
  };

  const shareToSnapchat = async (image: string) => {
    let uri = image;
    if (Platform.OS === "ios") {
      uri = "file:/" + image;
    }

    if (uri) {
      const photoContent: MetadataParams = {
        sticker:
          Platform.OS === "android"
            ? {
                uri: uri,
                posX: 0.5,
                posY: 0.3,
                width: 290,
                height: 290,
                rotationDegreesInClockwise: 0,
                isAnimated: false,
              }
            : {
                uri: uri,
                posX: 0.5,
                posY: 0.3,
                rotationDegreesInClockwise: 0,
                isAnimated: false,
              },
        attachmentUrl: link,
      };

      CreativeKit.shareToCameraPreview(photoContent)
        .then((d) => {})
        .catch((error) => {});
    }
  };

  const shareToWhatsapp = async (image: any) => {
    try {
      Platform.OS === "ios" ? NativeModules.AdsModule.copyText(link) : null;
      let uri = "file://" + image;
      if (Platform.OS === "ios") {
        uri = "file:/" + image;
        let options = {
          type: "image/png",
          url: uri,
          subject: "Candor",
        };
        await Share.open(options)
          .then((res) => {
            return true;
          })
          .catch((err) => {
            err && console.log(err);
          });
      } else {
        await Share.shareSingle({
          social: Social.Whatsapp,
          message: link,
          url: uri,
          filename: uri,
          title: "Candor",
          type: "image/png",
        });
      }
    } catch (err) {
      alert("errro1");
      console.log(err);
    }
  };

  const reveeal = isPro || openedMsg?.isPaid;

  if (loading) {
    if (data === undefined) refetch();
    return (
      <Column flex={1} justifyContent={"center"} alignItems="center">
        <ActivityIndicator size={"large"} />
        <Typography type="Paragraph1" textAlign="center">
          Loading Messages
        </Typography>
      </Column>
    );
  }

  return (
    <View style={styles.center}>
      {inboxs?.length === 0 ? (
        <Column
          flex={1}
          width={"100%"}
          alignItems="center"
          justifyContent="center"
        >
          <Typography type="Heading1" textAlign="center">
            Your Inbox
          </Typography>
          <Spacer height={5} />
          <Typography
            color={Colors.CANDOR_GRAY}
            textAlign="center"
            size={15}
            fontFamily={FontType.REGULAR_FREDOKA}
          >
            {`You have not received any anonymous \nmessages yet. Share your Candor link with\nyour friends or your socials or messaging  \napp to start receiving messages`}
          </Typography>
          <Spacer height={22} />
          <Button
            color={Colors.CANDOR_BLUE}
            onPress={() => setActiveTab(0)}
            title="Go back to Game"
          />
        </Column>
      ) : (
        <Column justifyContent="space-between" flex={1} width={"100%"}>
          <FlatList
            data={inboxs}
            horizontal={false}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={{ height: 20, width: 25 }} />
            )}
            keyExtractor={(_, index) => index.toFixed(1)}
            columnWrapperStyle={{
              alignItems: "flex-start",
              justifyContent: "space-evenly",
            }}
            renderItem={({ item, index }: any) => (
              <ListItem
                onPress={() => {
                  setopenedMsg(item);
                  setopenedMsgIndex(index);
                  setModalVisible(true);
                }}
                item={item}
                index={index}
              />
            )}
            onEndReached={async () => {
              await fetchMore({
                variables: {
                  limit: limit,
                  page: page,
                },
                updateQuery(previousResult, { fetchMoreResult }) {
                  const newEntries = fetchMoreResult?.ListMessages;

                  return {
                    ListMessages: [
                      ...previousResult?.ListMessages,
                      ...newEntries,
                    ],
                  };
                },
              });
            }}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
          {/* <Spacer height={10} /> */}

          {!isPro ? (
            <>
              <Button
                color={Colors.CANDOR_BLUE}
                onPress={() => {
                  navigation.navigate(Screens.PRO, { type: "Pro" });
                }}
                title="Who sent this👀"
              />
              <Spacer height={50} />
            </>
          ) : (
            <></>
          )}
        </Column>
      )}

      <Modal
        animationType="fade"
        transparent={false}
        // visible={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          setopenedMsg(null);
          sound1.sound1?.stopAsync();
          sound1.sound1.unloadAsync();
        }}
        onShow={() => {
          MarkRead({
            variables: {
              markMessageAsReadId: openedMsg?._id,
            },
          });
        }}
      >
        <Column
          width={"100%"}
          height={"100%"}
          style={{
            paddingHorizontal: getScreenResponsiveWidth(28),
            paddingTop: getScreenResponsiveHeight(65),
            paddingBottom: getScreenResponsiveHeight(52),
          }}
          justifyContent="space-between"
        >
          <Row width={"100%"} justifyContent={"space-between"}>
            <TouchableIcon
              onPress={() => {
                killAudio();
                setModalVisible(false);
              }}
            >
              <BackButton2 height={35} width={35} />
            </TouchableIcon>

            <TouchableIcon
              onPress={() => {
                openReport();
              }}
            >
              <Reportbutton height={30} width={30} />
            </TouchableIcon>
          </Row>
          <ViewShot
            ref={answerCard}
            options={{
              fileName: "answerCardImage",
              format: "png",
              quality: 0.9,
            }}
          >
            <Column
              width={"100%"}
              backgroundColor={Colors.CANDOR_WHITE}
              style={{
                borderRadius: 20,
                elevation: 10,
                shadowColor: Colors.CANDOR_BLACK,
                shadowOffset: { width: 0, height: 3 },
                shadowRadius: 11,
                shadowOpacity: 0.116,
              }}
              justifyContent="flex-start"
            >
              <Row
                height={84}
                width={"100%"}
                style={{
                  borderRadius: 20,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }}
                backgroundColor={
                  openedMsg?.card?.background_color
                    ? openedMsg?.card?.background_color
                    : Colors.CANDOR_YELLOW
                }
                justifyContent="center"
                alignItems="center"
              >
                <Typography
                  fontFamily={FontType.REGULAR_ANTON}
                  type="Heading1"
                  textAlign="center"
                  size={18}
                  style={{
                    width: "60%",
                  }}
                  color={
                    openedMsg?.card?.text_color
                      ? openedMsg?.card?.text_color
                      : Colors.CANDOR_BLACK
                  }
                >
                  {openedMsg?.question}
                </Typography>
              </Row>
              <Row
                // height={170}

                width={"100%"}
                justifyContent="center"
                alignItems="center"
                style={{
                  minHeight: getScreenResponsiveHeight(170),
                  paddingVertical: getScreenResponsiveHeight(20),
                  paddingHorizontal: getScreenResponsiveWidth(20),
                }}
              >
                {openedMsg?.answer_audio ? (
                  <Column justifyContent="center" alignItems="center">
                    {openedMsg?.answer_text && (
                      <Typography size={22} type="Heading1" textAlign="center">
                        {openedMsg?.answer_text}
                      </Typography>
                    )}
                    <Spacer height={10} />
                    <Row
                      width={275}
                      height={86}
                      backgroundColor={Colors.CANDOR_BLUE}
                      style={{
                        borderRadius: 16,
                      }}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Lottie
                        ref={animationRef}
                        source={require("../../assets/waveblue.json")}
                        loop
                        style={{
                          width: getScreenResponsiveWidth(245),
                        }}
                      />
                      <Row
                        width={"100%"}
                        justifyContent="center"
                        style={{
                          position: "absolute",
                          bottom: -19,
                        }}
                      >
                        <Button
                          onPress={async () => {
                            if (isPlaying) {
                              stopSound();
                            } else {
                              playSound();
                            }
                          }}
                          title={isPlaying ? "Stop" : "Play"}
                          width={88}
                          height={37}
                        />
                      </Row>
                    </Row>
                    <Spacer height={10} />
                  </Column>
                ) : (
                  <Column justifyContent="center" alignItems="center">
                    {openedMsg?.answer_text && (
                      <Typography size={22} type="Heading1" textAlign="center">
                        {openedMsg?.answer_text}
                      </Typography>
                    )}
                    <Spacer height={10} />
                    {openedMsg?.answer_picture ? (
                      <Image
                        style={{
                          width: getScreenResponsiveWidth(199),
                          height: getScreenResponsiveHeight(178),
                          backgroundColor: Colors.CANDOR_GRAY,
                          borderRadius: 10,
                        }}
                        source={{ uri: openedMsg?.answer_picture }}
                      />
                    ) : (
                      <></>
                    )}
                  </Column>
                )}
              </Row>
            </Column>
          </ViewShot>

          <Column>
            <Button
              color={Colors.CANDOR_BLUE}
              onPress={() => {
                whoSentThis.current.open();
              }}
              title={
                openedMsg?.card?.response_type == "audio" &&
                isPro &&
                openedMsg?.answer_audio
                  ? "View the original audio"
                  : reveeal
                  ? "View Who sent this👀"
                  : "Who sent this👀"
              }
            />

            <Spacer height={10} />
            <Row justifyContent="space-between">
              {platformShare.map((item: any, index: any) => {
                return (
                  <Button
                    key={index}
                    color={Colors.CANDOR_BLACK}
                    onPress={async () => {
                      MarkReplied({
                        variables: {
                          markMessageAsRepliedId: openedMsg?._id,
                        },
                      });

                      answerCard.current.capture().then(async (uri: any) => {
                        if (item == "Instagram") {
                          await shareToInsta(uri);
                        } else if (item === "Snapchat") {
                          await shareToSnapchat(uri);
                        } else {
                          await shareToWhatsapp(uri);
                        }
                      });
                    }}
                    style={{
                      width: platformShare.length <= 2 ? "48%" : "32%",
                      justifyContent: "space-between",
                      paddingHorizontal: getScreenResponsiveWidth(12),
                    }}
                  >
                    <Typography
                      color={Colors.CANDOR_WHITE}
                      fontFamily={FontType.REGULAR_FREDOKA}
                      size={Platform.OS === "android" ? 13 : 14}
                    >
                      Reply
                    </Typography>
                    {item == "Instagram" ? (
                      <Instagram />
                    ) : item == "Snapchat" ? (
                      <SnapChat />
                    ) : (
                      <Whatsapp />
                    )}
                  </Button>
                );
              })}
            </Row>
          </Column>
        </Column>

        <RBSheet
          ref={videoGen}
          closeOnDragDown={true}
          closeOnPressMask={true}
          height={getScreenResponsiveHeight(261)}
          customStyles={{
            // wrapper: styles.wrapper,
            draggableIcon: { display: "none" },
            container: {
              paddingHorizontal: getScreenResponsiveHeight(25),
              justifyContent: "center",
              alignItems: "center",
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
            },
          }}
        >
          <TouchableIcon
            style={{
              position: "absolute",
              top: getScreenResponsiveHeight(10),
              right: getScreenResponsiveWidth(10),
            }}
            onPress={() => videoGen.current.close()}
          >
            <CloseIcon />
          </TouchableIcon>

          <Typography
            color={Colors.CANDOR_BLACK}
            fontFamily={FontType.REGULAR_FREDOKA}
            textAlign="center"
          >
            {`🔊\nCreating audio to share`}
          </Typography>
          <Spacer height={15} />

          <Row
            style={{
              borderRadius: 50,
            }}
            width={"100%"}
            backgroundColor="#CCCACA"
            height={29}
          >
            <Row
              style={{
                borderRadius: 50,
                paddingHorizontal: getScreenResponsiveWidth(10),
              }}
              width={videoGenProgress}
              backgroundColor={Colors.CANDOR_BLACK}
              height={29}
              justifyContent="flex-end"
            >
              <ActivityIndicator color={Colors.CANDOR_WHITE} />
            </Row>
          </Row>
        </RBSheet>

        <RBSheet
          ref={whoSentThis}
          closeOnDragDown={true}
          closeOnPressMask={true}
          height={
            openedMsg?.card?.response_type === "audio"
              ? getScreenResponsiveHeight(616)
              : getScreenResponsiveHeight(500)
          }
          customStyles={{
            wrapper: styles.wrapper,
            draggableIcon: styles.draggableIcon,
            container: styles.container,
          }}
        >
          {!reveeal ? (
            <OneTimeReveal
              closeModal={async () => {
                setModalVisible(false);
              }}
              message={openedMsg}
              navigation={navigation}
              setOpenedMessage={setopenedMsg}
              rbSheetRef={whoSentThis}
            />
          ) : (
            <WhoSentThis
              item={openedMsg}
              navigation={navigation}
              onClose={() => {
                return whoSentThis.current.close();
              }}
            />
          )}
        </RBSheet>
      </Modal>
    </View>
  );
};

const ListItem = ({ onPress, item, index }: any) => {
  const data = item;
  let emoji: string;
  if (index > emojis.length - 1) {
    emoji = emojis[0];
  }
  emoji = emojis[emojis.length - 1 - index];

  return (
    <Column justifyContent="center" alignItems="center">
      <>
        {data?.is_replied && (
          <Column
            justifyContent="center"
            alignItems="center"
            style={styles.badge}
          >
            <Check />
          </Column>
        )}
      </>
      <Button
        onPress={() => {
          onPress();
        }}
        title={emoji}
        color={!data?.is_read ? Colors.CANDOR_YELLOW : Colors.CANDOR_GRAY}
        style={{
          borderRadius: getScreenResponsiveWidth(100),
          opacity: data?.is_read ? 0.5 : 1,
          width: 100,
          height: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
        textStyle={{
          fontSize: 48,
          lineHeight: 70,
          textAlign: "center",
        }}
      />
    </Column>
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
    backgroundColor: Colors.CANDOR_SEA_BLUE,
    width: 30,
    height: 30,
    alignSelf: "flex-end",
    borderRadius: 100,
    borderColor: Colors.CANDOR_WHITE,
    borderWidth: 3,
    zIndex: 1,
    position: "absolute",
    top: -2,
  },
  center: {
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    flex: 1,
  },
});
