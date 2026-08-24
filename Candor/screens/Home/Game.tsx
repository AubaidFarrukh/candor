import { ReactElement, useState, useContext, useRef, useEffect } from "react";
import {
  Linking,
  Platform,
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Dimensions,
  NativeModules,
  FlatList,
  Text,
  Keyboard,
} from "react-native";
import {
  Button,
  Column,
  Row,
  Spacer,
  TouchableIcon,
  Typography,
} from "../../components";
import { Colors, FontType, getHexColorOpacity } from "../../theme";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
  showOnly,
} from "../../utils";
import Swiper from "react-native-swiper";
import {
  ProSubscriptionContext,
  SnapChatLoginContext,
  ToastContext,
  UserProfile,
} from "../../context";
import * as Clipboard from "expo-clipboard";
import RBSheet from "react-native-raw-bottom-sheet";
import { TutorialSlide } from "../../components/TutorialSlide";
import SnapChat from "../../assets/svgs/Snapchat.svg";
import Whatsapp from "../../assets/svgs/Whatsapp.svg";
import Telegram from "../../assets/svgs/Telegram.svg";
import Instagram from "../../assets/svgs/Instagram.svg";
import Twitter from "../../assets/svgs/Twitter.svg";
import GeneralShare from "../../assets/svgs/GenerShare.svg";
import Share, { Social } from "react-native-share";
import {
  CreativeKit,
  LoginKit,
  LoginState,
  MetadataParams,
} from "@snapchat/snap-kit-react-native";
import * as WebBrowser from "expo-web-browser";
import { useQuery } from "@apollo/client";
import { GET_BLANK_CARD_AVAILABILITY, LIST_CARDS } from "../../graphQL/queries";
import { ProCard } from "./ProCard";
import { MessageCard } from "../../components/cards/MessageCard";
import { ComplimentsCard } from "../../components/cards/ComplimentsCard";
import { AudioCard } from "../../components/cards/AudioCard";
import { RoastCard } from "../../components/cards/RoastCard";
import { PhotoCard } from "../../components/cards/PhotoCard";
import { BlankTextCard } from "../../components/cards/BlankTextCard";
import { PreviewBlankCard } from "./PreviewBlankCard";
import {
  CARD_LINK_COPIED,
  CREATE_CARD,
  CREATE_GROUP,
  SAVE_USER_SNAP_INFO,
} from "../../graphQL/mutations";
import { useMutation } from "@apollo/client";
import RNFetchBlob from "rn-fetch-blob";
import AppIntroSlider from "react-native-app-intro-slider";
import { ProBlankTextCard } from "./ProBlankTextCard";
import { ProBlankAudioCard } from "./ProBlankAudioCard";
import { ValsDayCard } from "../../components/cards/ValsDayCard";
import { ProChatWithMe } from "../../components/cards/ProChatWithMe";
import { ChatWithMeCard } from "../../components/cards/ChatWithMeCard";
import { ChatWithMePreview } from "../../components/ChatWithMePreview";
import { PreviewChatwithMePro } from "./PreviewChatwithMePro";
import { NavBar } from "../../components/v2/NavBar";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { GroupAMA } from "../../components/cards/GroupAMA";
import { GroupHotSeat } from "../../components/cards/GroupHotSeat";

export const Game = ({
  navigation,
  setActiveTab,
  refetchCount,
  imageUploadLoading = false,
  openProfile,
  openRevShare,
  totalEarnings,
  openSupport,
}: any): ReactElement => {
  const listScroll = useRef<any>();

  const [currCard, setCurrCard] = useState<any>(null);
  const [msgCards, setmsgCards] = useState<any>([]);
  const [blankText, setblankText] = useState<any>("");
  const [createdCard, setcreatedCard] = useState<any>("");
  const [isCopy, setisCopy] = useState<any>(false);
  const [instagramLoading, setInstagramLoading] = useState(false);
  const [snapchatLoading, setSnapchatLoading] = useState(false);
  const [showInstagramStory, setShowInstagramStory] = useState(false);
  const [blankTextIsPro, setBlankTextIsPro] = useState(false);
  const [messageToken, setMessageToken] = useState("");
  const { setIsSnapLoggedIn, isSnapLoggedIn }: any =
    useContext(SnapChatLoginContext);

  const { toast } = useContext<any>(ToastContext);
  const bsheet = useRef<any>();
  const bsheetProCard = useRef<any>();
  const bsheetBlanktextCard = useRef<any>();
  const bsheetBlankAudioCard = useRef<any>();

  const bsheetPreview = useRef<any>();
  const bsheetChatWithPreview = useRef<any>();

  const { isPro: subscribed }: any = useContext(ProSubscriptionContext);

  const isPro =
    currCard?.is_premium &&
    subscribed === false &&
    currCard?.is_premium &&
    currCard?.isPurchased === false;

  const { userProfile, setUserProfile }: any = useContext(UserProfile);

  const { data: blankCard, refetch: refetchBlankCardAvailability } = useQuery(
    GET_BLANK_CARD_AVAILABILITY,
    {
      fetchPolicy: "network-only",
      variables: {
        userId: userProfile?._id,
      },
      onCompleted(data) {
        setBlankTextIsPro(!isPro && !data?.User?.is_blank_text_card_enabled);
      },
    }
  );

  const slider = useRef<any>();

  const { data, loading, refetch } = useQuery(LIST_CARDS, {
    initialFetchPolicy: "cache-and-network",
    variables: {
      limit: 70,
      page: 0,
    },
    onCompleted(data) { },

    onError(error) {
      console.log(error, "error");
    },
  });

  const [CardLinkCopied] = useMutation(CARD_LINK_COPIED, {
    async onCompleted(data) {
      console.log(data, "copied");
    },
    onError(error) {
      console.log(error, "copied");
    },
  });

  const shareToSnapchat = async () => {
    const uri = currCard?.sticker_image;
    CardLinkCopied({
      variables: {
        cardId: currCard?._id,
      },
    });
    if (uri) {
      if (Platform.OS === "ios") {
        const photoContent: MetadataParams = {
          sticker: {
            uri: uri,
            posX: 0.5,
            posY: 0.3,
            rotationDegreesInClockwise: 0,
            isAnimated: false,
          },
          attachmentUrl: link,
        };

        CreativeKit.shareToCameraPreview(photoContent)
          .then((d) => { })
          .catch((error) => {
            console.log(error);
          });
      } else
        RNFetchBlob.config({
          fileCache: true,
          appendExt: "png",
        })
          .fetch("GET", uri, {})
          .then((res) => {
            const photoContent: MetadataParams = {
              sticker: {
                uri:
                  Platform.OS === "android"
                    ? "file://" + res.path()
                    : "" + res.path(),
                width: 300,
                height: 300,
                posX: 0.5,
                posY: 0.3,
                rotationDegreesInClockwise: 0,
                isAnimated: false,
              },
              attachmentUrl: link,
            };

            CreativeKit.shareToCameraPreview(photoContent)
              .then((d) => { })
              .catch((error) => {
                console.log(error);
              });
          });
    }
  };

  const [SaveUserSnapInfo] = useMutation(SAVE_USER_SNAP_INFO, {
    async onCompleted(d) {
      setIsSnapLoggedIn(d?.UpdateUser?.is_snap_logged_in);
      setUserProfile({
        ...userProfile,
        ...d?.UpdateUser,
      });
      setSnapchatLoading(false);
      await shareToSnapchat();
    },
    async onError(e) {
      console.log(e, "error");
      setSnapchatLoading(false);
    },
  });

  const snapLogin = async () => {
    setSnapchatLoading(true);

    LoginKit.login()
      .then((d) => {
        const snapQuery = "{me{bitmoji{avatar},displayName}}";
        LoginKit.fetchUserData(snapQuery, {})
          .then((userData) => {
            // Use response
            console.log(userData);
            SaveUserSnapInfo({
              variables: {
                snapchatName: userData?.displayName,
                snapchatBitmoji: userData?.bitmojiAvatar,
              },
            });
          })
          .catch((error) => {
            // Handle error
            setSnapchatLoading(false);
            console.log(error);
          });
      })
      .catch((error) => {
        setSnapchatLoading(false);
        console.log(error, "snap error");
      });
  };

  useEffect(() => {
    if (data?.ListCards) {
      const messageArr = data?.ListCards?.filter((a: any) => {
        return a?.category == "message";
      });

      let firstMsg = data?.ListCards?.filter((a: any) => {
        return a?._id == "63efcebeff566b5a941b4856";
      });

      messageArr?.unshift(firstMsg[0]);

      setmsgCards(messageArr);
      setCurrCard(firstMsg[0]);
    }
  }, [data]);

  useEffect(() => {
    if (Platform.OS === "ios") {
      Linking.canOpenURL("instagram://")
        .then((val) => setShowInstagramStory(val))
        .catch((err) => console.error(err));
    } else {
      Share.isPackageInstalled("com.instagram.android")
        .then(({ isInstalled }: any) => setShowInstagramStory(isInstalled))
        .catch((err: any) => console.error(err));
    }
  }, []);

  const checkIfPro = () => {
    if (isPro) {
      bsheetProCard.current.open();
      return true;
    }
    return false;
  };

  // Subscribing to events

  const [CreateCard, CreateCardQuery] = useMutation(CREATE_CARD, {
    async onCompleted(data) {
      setCurrCard(data?.CreateCard);
      setcreatedCard(data?.CreateCard?._id);
      if (isCopy) {
        const preLink = "https://playcandor.com";
        const link = `${preLink}/${userProfile?.username}/${data?.CreateCard?._id}`;
        Platform.OS === "ios"
          ? NativeModules.AdsModule.copyText(link)
          : await Clipboard.setStringAsync(link);
        toast({ message: "Copied link!", intent: "success" });
      } else {
        bsheetPreview.current.open();
      }

      setisCopy(false);
    },
    onError(error) {
      toast({ message: error.message });
      console.log(error);
      setisCopy(false);
    },
  });

  // const preLink = "https://stage.playcandor.com";
  const preLink = "https://playcandor.com";

  const cardId = currCard?._id;

  // const link = `${preLink}/${userProfile?.username}/${cardId}`;

  const [link, setLink] = useState(
    `${preLink}/${userProfile?.username}/${cardId}`
  );
  useEffect(() => {
    setLink(`${preLink}/${userProfile?.username}/${cardId}`);
    console.log(link);
  }, [currCard]);

  // group stuff
  const [CreateGroup] = useMutation(CREATE_GROUP, {
    async onCompleted(data) {
      if (isCopy) {
        const groupLink = `${preLink}/group/${userProfile?.username}/${data?.CreateGroupChatCard?.group_token}`;
        Platform.OS === "ios"
          ? NativeModules.AdsModule.copyText(groupLink)
          : await Clipboard.setStringAsync(groupLink);
        console.log(groupLink, "groupLink");
        return toast({ message: "Copied link!", intent: "success" });
      }
    },
    onError(error) {
      console.log(error, "copied");
    },
  });

  const groupNames: any = {
    group_ama: "GroupAMA",
    group_compliment: "GroupCompliment",
    group_hotseat: "HotSeatGroup",
  };
  const handleCopy = async () => {
    if (currCard?.category?.includes("group")) {
      setisCopy(true);
      return await CreateGroup({
        variables: {
          groupName: groupNames[currCard?.category],
        },
      });
    }
    if (currCard?.category === "chatme") {
      return bsheetChatWithPreview.current.open();
    }
    if (currCard?.category === "blank_text") {
      setisCopy(true);
      if (blankTextIsPro) {
        bsheetBlanktextCard?.current?.open();
        return;
      }
      return CreateCard({
        variables: {
          backgroundColor: "#6FF9FF",
          gradientBackgroundColor: "#6FF9FF,#009CA3",
          captionText: blankText,
          newTextColor: Colors.CANDOR_WHITE,
          textColor: Colors.CANDOR_BLACK,
          isPremium: currCard?.is_premium,
          category: "blank_text",
          responseType: currCard?.response_type,
        },
      });
    }
    if (currCard?.category === "chatwithme") {
      return bsheetPreview.current.open();
    }
    if (isPro) return bsheetProCard.current.open();
    Platform.OS === "ios"
      ? NativeModules.AdsModule.copyText(link)
      : await Clipboard.setStringAsync(link);
    CardLinkCopied({
      variables: {
        cardId: currCard?._id,
      },
    });

    toast({ message: "Copied link!", intent: "success" });
  };

  const shareToInsta = async (uri: any, cardlink: any = link) => {
    CardLinkCopied({
      variables: {
        cardId: currCard?._id,
      },
    });
    Platform.OS === "ios" ? NativeModules.AdsModule.copyText(cardlink) : null;
    Clipboard.setStringAsync(cardlink)
      .then(() => {
        if (showInstagramStory) {
          setInstagramLoading(true);
          RNFetchBlob.config({
            fileCache: true,
            appendExt: "png",
          })
            .fetch("GET", currCard?.background_image, {})
            .then(async (res) => {
              try {
                await Share.shareSingle({
                  url: cardlink,
                  social: Social.InstagramStories,
                  stickerImage: uri,
                  backgroundBottomColor: Colors.CANDOR_BLACK,
                  backgroundTopColor: Colors.CANDOR_BLACK,
                  appId: "688761346318080",
                  attributionURL: cardlink,
                  backgroundImage:
                    Platform.OS === "android"
                      ? "file://" + res.path()
                      : res.path(),
                });
                setInstagramLoading(false);
                bsheet?.current?.close();
              } catch (err) {
                setInstagramLoading(false);
              }
            })
            .catch((err) => {
              setInstagramLoading(false);
            });
        } else {
          setInstagramLoading(false);
          console.log("failed");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const tweetNow = (cardlink: any = link) => {
    CardLinkCopied({
      variables: {
        cardId: currCard?._id,
      },
    });
    let twitterParameters = [];
    twitterParameters.push("url=" + encodeURI(cardlink));
    const url =
      "https://twitter.com/intent/tweet?" + twitterParameters.join("&");
    Linking.openURL(url);
  };

  const shareToTelegram = (cardlink: any = link) => {
    CardLinkCopied({
      variables: {
        cardId: currCard?._id,
      },
    });

    const url = `https://t.me/share/url?url=${encodeURIComponent(cardlink)}`;
    Linking.openURL(url);
  };

  const shareToWhatsapp = async (cardlink: any = link) => {
    CardLinkCopied({
      variables: {
        cardId: currCard?._id,
      },
    });
    try {
      await Share.shareSingle({
        social: Social.Whatsapp,
        message: currCard?.caption_text || "Hey checkout my card on candor",
        url: cardlink,
      });
    } catch (err) { }
  };

  const generalShare = async (cardlink: any = link) => {
    CardLinkCopied({
      variables: {
        cardId: currCard?._id,
      },
    });
    try {
      await Share.open({
        title: currCard?.caption_text || "Hey checkout my card on candor",
        message: cardlink,
      });
    } catch (err) { }
  };

  const openPromotionLink = async () => {
    await WebBrowser.openBrowserAsync(
      "https://youtube.com/@FinanceProfessorBBDM"
    );
  };

  if (data === undefined) {
    refetch();
  }

  const [refetchLoading, setRefetchLoading] = useState(false);
  const refetchCards = async () => {
    const { loading } = await refetch();
    setRefetchLoading(loading);
  };

  const noCards =
    data?.ListCards?.length === 0 || data == undefined || !data?.ListCards;

  let cardsIndex = [
    "messages",
    "groupAma",
    "chatme",
    "compliments",
    "chatwithme",
    "groupHotSeat",
    "vals",
    "audio",
    "roast",
    "blankText",
    "photo",
  ];

  let cards: any = {
    chatme: [
      {
        caption_text: "ChatWithMe",
        category: "chatme",
        response_type: "text",
        is_premium: false,
        background_image: "https://manage.playcandor.com/bg1.png",
        gradient_background_color: "#FFB46F,#A3007F",
        new_text_color: "#FFFFFF",
      },
    ],

    chatwithme: data?.ListCards?.filter((a: any) => {
      return a?.category == "chatwithme";
    }),

    messages: msgCards,

    audio: data?.ListCards?.filter((a: any) => {
      return a?.category == "audio";
    }),

    roast: data?.ListCards?.filter((a: any) => {
      return a?.category == "roast";
    }),

    compliments: data?.ListCards?.filter((a: any) => {
      return a?.category == "compliments";
    }),

    blankText: [
      {
        category: "blank_text",
        response_type: "text",
        is_premium: false,
        isPurchased: true,
        background_image: "https://manage.playcandor.com/bg1.png",
        gradient_background_color: "#6FF9FF,#009CA3",
        new_text_color: "#FFFFFF",
      },
    ],

    photo: data?.ListCards?.filter((a: any) => {
      return a?.category == "photo";
    }),

    vals: data?.ListCards?.filter((a: any) => {
      return a?.category == "Vals Day";
    }),
    groupAma: data?.ListCards?.filter((a: any) => {
      return a?.category == "group_ama";
    }),

    groupHotSeat: data?.ListCards?.filter((a: any) => {
      return a?.category == "group_hotseat";
    }),
  };

  // useEffect(() => {
  //   setCurrCard(
  //     cards[cardsIndex[0]]?.length > 0 ? cards[cardsIndex[0]][0] : null
  //   );
  // }, [data]);

  return (
    <LinearGradient
      colors={
        currCard?.gradient_background_color
          ? String(currCard?.gradient_background_color).split(",")
          : ["#6FF9FF", "#009CA3"]
      }
      start={{ x: 0.8, y: 0.2 }}
      end={{ x: 0.2, y: 0.8 }}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        paddingLeft: 0,
        marginLeft: 0,
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          ...styles.center,
          justifyContent: "space-between",
        }}
        edges={["top"]}
      >
        <Column
          style={{
            // paddingHorizontal: getScreenResponsiveWidth(20),
            width: "100%",
          }}
        >
          <Spacer height={30} />
          <Column
            style={{
              paddingHorizontal: getScreenResponsiveWidth(15),
              width: "100%",
            }}
          >
            <NavBar
              navigation={navigation}
              setActiveTab={setActiveTab}
              refetchCount={refetchCount}
              isPro={subscribed}
              imageUploadLoading={imageUploadLoading}
              page={0}
              openSupport={openSupport}
              totalEarnings={totalEarnings}
              openProfile={openProfile}
              openRevShare={openRevShare}
            />
          </Column>
          <Spacer height={20} />
          <Column height={240}>
            <>
              {!loading ? (
                noCards ? (
                  <Column
                    justifyContent="center"
                    alignItems="center"
                    height={365}
                  >
                    <Typography>No Cards Available Please try again</Typography>
                    <Spacer height={20} />
                    <Button
                      onPress={refetchCards}
                      loading={refetchLoading}
                      title="Refresh"
                      width={200}
                      height={50}
                    />
                  </Column>
                ) : Platform.OS === "ios" ? (
                  <Swiper
                    ref={slider}
                    loop={false}
                    autoplay={false}
                    showsPagination={true}
                    showsButtons={true}
                    nextButton={<Text>Next</Text>}
                    prevButton={<Text>Prev</Text>}
                    width={getScreenResponsiveWidth(375)}
                    onIndexChanged={(index: any) => {
                      Keyboard.dismiss();
                      if (!loading)
                        setCurrCard(
                          cards[cardsIndex[index]]?.length > 0
                            ? cards[cardsIndex[index]][0]
                            : null
                        );
                      setblankText("");
                      listScroll?.current?.scrollToIndex({
                        viewPosition: 0.565,
                        index: index,
                      });
                    }}
                  >
                    <MessageCard
                      data={cards.messages}
                      onChange={(index: any) => {
                        setCurrCard(index);
                      }}
                    />

                    <GroupAMA
                      data={cards.groupAma}
                      onChange={(index: any) => {
                        setCurrCard(index);
                      }}
                    />

                    <ChatWithMeCard />

                    <ComplimentsCard
                      data={cards.compliments}
                      onChange={(index: any) => {
                        setCurrCard(index);
                      }}
                    />
                    <ProChatWithMe
                      data={cards.chatwithme}
                      onChange={(index: any) => {
                        setCurrCard(index);
                      }}
                    />

                    <GroupHotSeat
                      data={cards.groupHotSeat}
                      onChange={(index: any) => {
                        setCurrCard(index);
                      }}
                    />
                    <ValsDayCard
                      data={cards.vals}
                      onChange={(index: any) => {
                        setCurrCard(index);
                      }}
                    />
                    <AudioCard
                      data={cards.audio}
                      onChange={(index: any) => {
                        setCurrCard(index);
                      }}
                    />
                    <RoastCard
                      data={cards.roast}
                      onChange={(index: any) => {
                        setCurrCard(index);
                      }}
                    />

                    <BlankTextCard
                      onChange={(txt: any) => {
                        setblankText(txt);
                      }}
                      value={blankText}
                    />
                    {/* <BlankAudioCard
                  onChange={(txt: any) => {
                    setblankText(txt);
                  }}
                  value={blankText}
                /> */}

                    <PhotoCard
                      data={cards.photo}
                      onChange={(index: any) => {
                        setCurrCard(index);
                      }}
                    />
                  </Swiper>
                ) : (
                  <View
                    style={{
                      height: getScreenResponsiveHeight(330),
                      width: "100%",
                    }}
                  >
                    <AppIntroSlider
                      showSkipButton={false}
                      showNextButton={false}
                      showPrevButton={false}
                      showDoneButton={false}
                      dotClickEnabled={false}
                      bottomButton={false}
                      // renderPagination={(activeIndex: number) => {
                      //   return <View style={{
                      //     backgroundColor: Colors.CANDOR_GRAY,
                      //     width: getScreenResponsiveWidth(30),
                      //     height: getScreenResponsiveHeight(30),
                      //     borderRadius: 15,
                      //   }}>
                      //     <Text>{activeIndex + 1}</Text>
                      //   </View>
                      // }}
                      dotStyle={{
                        marginBottom: getScreenResponsiveHeight(80),
                        backgroundColor: Colors.CANDOR_GRAY,
                      }}
                      activeDotStyle={{
                        backgroundColor: Colors.CANDOR_BLACK,
                        width: getScreenResponsiveWidth(30),
                        marginBottom: getScreenResponsiveHeight(80),
                      }}
                      onSlideChange={(index: any) => {
                        console.log(cardsIndex[index]);
                        // console.log(cards[cardsIndex[index]][0]);
                        if (!loading)
                          console.log(
                            "....>>>> ",
                            cards[cardsIndex[index]]?.length > 0
                              ? cards[cardsIndex[index]][0]
                              : null
                          );
                        setCurrCard(
                          cards[cardsIndex[index]]?.length > 0
                            ? cards[cardsIndex[index]][0]
                            : null
                        );
                        listScroll?.current?.scrollToIndex({
                          viewPosition: 0.5,
                          index: index,
                        });
                        setblankText("");
                      }}
                      renderItem={({ item }: any) => {
                        return (
                          <View
                            style={{
                              height: getScreenResponsiveHeight(330),
                            }}
                          >
                            {item === "messages" ? (
                              <MessageCard
                                data={cards.messages}
                                onChange={(index: any) => {
                                  setCurrCard(index);
                                }}
                              />
                            ) : item === "chatme" ? (
                              <ChatWithMeCard />
                            ) : item === "chatwithme" ? (
                              <ProChatWithMe
                                data={cards.chatwithme}
                                onChange={(index: any) => {
                                  setCurrCard(index);
                                }}
                              />
                            ) : item === "vals" ? (
                              <ValsDayCard
                                data={cards.vals}
                                onChange={(index: any) => {
                                  setCurrCard(index);
                                }}
                              />
                            ) : item === "audio" ? (
                              <AudioCard
                                data={cards.audio}
                                onChange={(index: any) => {
                                  setCurrCard(index);
                                }}
                              />
                            ) : item === "roast" ? (
                              <RoastCard
                                data={cards.roast}
                                onChange={(index: any) => {
                                  setCurrCard(index);
                                }}
                              />
                            ) : item === "compliments" ? (
                              <ComplimentsCard
                                data={cards.compliments}
                                onChange={(index: any) => {
                                  setCurrCard(index);
                                }}
                              />
                            ) : item === "blankText" ? (
                              <BlankTextCard
                                onChange={(txt: any) => {
                                  setblankText(txt);
                                }}
                                value={blankText}
                              />
                            ) : item === "photo" ? (
                              <PhotoCard
                                data={cards.photo}
                                onChange={(index: any) => {
                                  setCurrCard(index);
                                }}
                              />
                            ) : item === "groupAma" ? (
                              <GroupAMA
                                data={cards.groupAma}
                                onChange={(index: any) => {
                                  setCurrCard(index);
                                }}
                              />
                            ) : item === "groupHotSeat" ? (
                              <GroupHotSeat
                                data={cards.groupHotSeat}
                                onChange={(index: any) => {
                                  setCurrCard(index);
                                }}
                              />
                            ) : (
                              <></>
                            )}
                          </View>
                        );
                      }}
                      data={cardsIndex}
                      onDone={() => { }}
                    />
                  </View>
                )
              ) : (
                <Column
                  width={"100%"}
                  alignItems="center"
                  justifyContent="center"
                  height={365}
                >
                  <ActivityIndicator size={"large"} />
                  <Typography color={Colors.CANDOR_WHITE}>
                    Loading cards, please wait a moment.
                  </Typography>
                </Column>
              )}
            </>
          </Column>

          <View
            style={{
              width: Dimensions.get("screen").width,
              position: "relative",
              top: 30,
            }}
          >
            <FlatList
              ref={listScroll}
              data={cardsIndex}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              renderItem={({ item, index }: any) => {
                let isActive = false;
                if (cards[item]) {
                  isActive = currCard?._id === cards[item][0]?._id;
                }
                return (
                  <ItemView
                    item={item}
                    index={index}
                    isActive={isActive}
                    lastIndex={cardsIndex?.length - 1}
                    bgColor={
                      cards[item]
                        ? cards[item][0]?.gradient_background_color
                        : []
                    }
                  />
                );
              }}
              keyExtractor={(item, index) => index.toString()}
              horizontal
            />
            <Row
              justifyContent="center"
              alignItems="center"
              // backgroundColor="white"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                zIndex: 0,
                alignSelf: "center",
              }}
            >
              <Row
                style={{
                  width: getScreenResponsiveWidth(68),
                  height: getScreenResponsiveHeight(53),
                  // borderWidth: 4,
                  // borderColor: Colors.CANDOR_WHITE,
                  // borderRadius: 18,
                  zIndex: 99,
                  elevation: 5,
                  shadowColor: Colors.CANDOR_BLACK,
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.5,
                  shadowRadius: 3.84,
                  // backgroundColor: "black",
                }}
              />
            </Row>
          </View>
          <View
            style={{
              marginTop: getScreenResponsiveHeight(-20),
            }}
          />
          <Spacer height={15} />
        </Column>

        <Column
          style={{
            paddingHorizontal: getScreenResponsiveWidth(20),
            width: "100%",
          }}
          height={228}
          backgroundColor={Colors.CANDOR_WHITE}
          justifyContent="center"
          alignItems="center"
        >
          {currCard?.category == "blank_text" ||
            currCard?.category == "chatme" ||
            currCard?.category == "chatwithme" ? (
            <View
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <Row
                height={90}
                width={"100%"}
                backgroundColor={"#000"}
                style={{
                  borderRadius: 25,
                  position: "absolute",
                  top: 5,
                  right: 5,
                }}
              />
              <Column
                backgroundColor={
                  String(currCard?.gradient_background_color).split(",")[1]
                }
                style={{
                  borderRadius: 25,
                  paddingHorizontal: getScreenResponsiveWidth(17),
                  borderColor: Colors.CANDOR_BLACK,
                  borderWidth: 2,
                  shadowColor: "#000",
                  elevation: 5,
                  zIndex: 2,
                  height: getScreenResponsiveHeight(91),
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Column justifyContent="flex-start">
                  <Typography
                    color={currCard?.new_text_color}
                    type="Paragraph2"
                    size={10}
                    lineHeight={11}
                    fontFamily={FontType.REGULAR_FREDOKA}
                  >
                    {currCard?.category == "chatme"
                      ? `Tap here to select your price`
                      : `Preview & share on socials`}
                  </Typography>
                </Column>
                <Spacer height={10} />
                <Button
                  style={{
                    backgroundColor: "rgba(0,0,0,0)",
                    // width: 161,
                    height: 49,
                    borderRadius: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    padding: 0,
                    marginTop: -5,
                  }}
                  onPress={() => {
                    if (currCard?.category == "chatwithme") {
                      bsheetPreview.current.open();
                      return;
                    }

                    if (currCard?.category === "blank_text") {
                      console.log(blankText, "blankText");
                      CreateCard({
                        variables: {
                          backgroundColor: "#6FF9FF",
                          gradientBackgroundColor: "#6FF9FF,#009CA3",
                          captionText: blankText,
                          newTextColor: Colors.CANDOR_WHITE,
                          textColor: Colors.CANDOR_BLACK,
                          isPremium: currCard?.is_premium,
                          category: "blank_text",
                          responseType: currCard?.response_type,
                        },
                      });
                    } else {
                      bsheetChatWithPreview.current.open();
                    }
                  }}
                  disabled={
                    currCard?.category == "chatme" ||
                      currCard?.category == "chatwithme"
                      ? false
                      : blankText.length < 1
                  }
                  color={Colors.CANDOR_BLACK}
                  loaderColor={Colors.CANDOR_BLACK}
                  loading={CreateCardQuery.loading}
                >
                  <Row justifyContent="flex-end">
                    <TouchableIcon
                      disabled={true}
                      style={{
                        borderColor: Colors.CANDOR_BLACK,
                        borderWidth: 2,
                        borderRadius: 50,
                        backgroundColor: "black",
                      }}
                    >
                      <Whatsapp />
                    </TouchableIcon>
                    {/* <Spacer width={6} />
              <TouchableIcon
                disabled={noCards}
                onPress={() => {
                  if (checkIfPro()) {
                    return;
                  } else {
                    if (isSnapLoggedIn) {
                      return shareToSnapchat();
                    }
                    snapLogin();
                    // shareToSnapchat();
                  }
                }}
              >
                {snapchatLoading ? (
                  <ActivityIndicator size={"large"} />
                ) : (
                  <SnapChat />
                )}
              </TouchableIcon> */}
                    <Spacer width={6} />
                    <TouchableIcon
                      disabled={true}
                      style={{
                        borderColor: Colors.CANDOR_BLACK,
                        borderWidth: 2,
                        borderRadius: 50,
                        backgroundColor: "black",
                      }}
                    >
                      <Instagram />
                    </TouchableIcon>
                    <Spacer width={6} />
                    <TouchableIcon
                      disabled={true}
                      style={{
                        borderColor: Colors.CANDOR_BLACK,
                        borderWidth: 2,
                        borderRadius: 50,
                        backgroundColor: "black",
                      }}
                    >
                      <Twitter />
                    </TouchableIcon>
                    <Spacer width={6} />
                    <TouchableIcon
                      disabled={true}
                      style={{
                        borderColor: Colors.CANDOR_BLACK,
                        borderWidth: 2,
                        borderRadius: 50,
                        backgroundColor: "black",
                      }}
                    >
                      <GeneralShare />
                    </TouchableIcon>
                  </Row>
                </Button>
              </Column>
            </View>
          ) : currCard?.category?.includes("group") ? (
            <View
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <Row
                height={90}
                width={"100%"}
                backgroundColor={"#000"}
                style={{
                  borderRadius: 25,
                  position: "absolute",
                  top: 5,
                  right: 5,
                }}
              />

              <Column
                backgroundColor={
                  String(currCard?.gradient_background_color).split(",")[1]
                }
                style={{
                  borderRadius: 25,
                  paddingHorizontal: getScreenResponsiveWidth(17),
                  borderColor: Colors.CANDOR_BLACK,
                  borderWidth: 2,
                  shadowColor: "#000",
                  elevation: 5,
                  zIndex: 2,
                  height: getScreenResponsiveHeight(91),
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Column justifyContent="flex-start">
                  <Typography
                    color={currCard?.new_text_color}
                    type="Paragraph2"
                    size={10}
                    lineHeight={11}
                    fontFamily={FontType.REGULAR_FREDOKA}
                  >
                    Tap on icon to share on social
                  </Typography>
                </Column>
                <Spacer height={10} />
                <Row justifyContent="flex-end">
                  <TouchableIcon
                    disabled={noCards}
                    onPress={async () => {
                      if (checkIfPro()) {
                        return;
                      } else {
                        const data: any = await CreateGroup({
                          variables: {
                            groupName: groupNames[currCard?.category],
                          },
                        });
                        const link = `${preLink}/group/${userProfile?.username}/${data?.data?.CreateGroupChatCard?.group_token}`;
                        shareToWhatsapp(link);
                      }
                    }}
                    style={{
                      borderColor: Colors.CANDOR_BLACK,
                      borderWidth: 2,
                      borderRadius: 50,
                      backgroundColor: Colors.CANDOR_BLACK,
                    }}
                  >
                    <Whatsapp />
                  </TouchableIcon>
                  {/* <Spacer width={6} />
              <TouchableIcon
                disabled={noCards}
                onPress={() => {
                  if (checkIfPro()) {
                    return;
                  } else {
                    if (isSnapLoggedIn) {
                      return shareToSnapchat();
                    }
                    snapLogin();
                    // shareToSnapchat();
                  }
                }}
              >
                {snapchatLoading ? (
                  <ActivityIndicator size={"large"} />
                ) : (
                  <SnapChat />
                )}
              </TouchableIcon> */}
                  <Spacer width={6} />
                  <TouchableIcon
                    disabled={noCards}
                    onPress={async () => {
                      if (checkIfPro()) {
                        return;
                      } else {
                        const data: any = await CreateGroup({
                          variables: {
                            groupName: groupNames[currCard?.category],
                          },
                        });
                        const link = `${preLink}/group/${userProfile?.username}/${data?.data?.CreateGroupChatCard?.group_token}`;
                        setLink(link);
                        bsheet.current.open();
                        // shareToInsta();
                      }
                    }}
                    style={{
                      borderColor: Colors.CANDOR_BLACK,
                      borderWidth: 2,
                      backgroundColor: Colors.CANDOR_BLACK,
                      borderRadius: 50,
                    }}
                  >
                    <Instagram />
                  </TouchableIcon>
                  <Spacer width={6} />
                  <TouchableIcon
                    disabled={noCards}
                    onPress={async () => {
                      if (checkIfPro()) {
                        return;
                      } else {
                        const data: any = await CreateGroup({
                          variables: {
                            groupName: groupNames[currCard?.category],
                          },
                        });
                        const link = `${preLink}/group/${userProfile?.username}/${data?.data?.CreateGroupChatCard?.group_token}`;
                        tweetNow(link);
                      }
                    }}
                    style={{
                      borderColor: Colors.CANDOR_BLACK,
                      borderWidth: 2,
                      borderRadius: 50,
                      backgroundColor: Colors.CANDOR_BLACK,
                    }}
                  >
                    <Twitter />
                  </TouchableIcon>
                  <Spacer width={6} />
                  <TouchableIcon
                    disabled={noCards}
                    onPress={async () => {
                      if (checkIfPro()) {
                        return;
                      } else {
                        const data: any = await CreateGroup({
                          variables: {
                            groupName: groupNames[currCard?.category],
                          },
                        });
                        const link = `${preLink}/group/${userProfile?.username}/${data?.data?.CreateGroupChatCard?.group_token}`;
                        generalShare(link);
                      }
                    }}
                    style={{
                      borderColor: Colors.CANDOR_BLACK,
                      borderWidth: 2,
                      borderRadius: 50,
                      backgroundColor: Colors.CANDOR_BLACK,
                    }}
                  >
                    <GeneralShare />
                  </TouchableIcon>
                </Row>
              </Column>
            </View>
          ) : (
            <View
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <Row
                height={90}
                width={"100%"}
                backgroundColor={"#000"}
                style={{
                  borderRadius: 25,
                  position: "absolute",
                  top: 5,
                  right: 5,
                }}
              />

              <Column
                backgroundColor={
                  String(currCard?.gradient_background_color).split(",")[1]
                }
                style={{
                  borderRadius: 25,
                  paddingHorizontal: getScreenResponsiveWidth(17),
                  borderColor: Colors.CANDOR_BLACK,
                  borderWidth: 2,
                  shadowColor: "#000",
                  elevation: 5,
                  zIndex: 2,
                  height: getScreenResponsiveHeight(91),
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Column justifyContent="flex-start">
                  <Typography
                    color={currCard?.new_text_color}
                    type="Paragraph2"
                    size={10}
                    lineHeight={11}
                    fontFamily={FontType.REGULAR_FREDOKA}
                  >
                    Tap on icon to share on social
                  </Typography>
                </Column>
                <Spacer height={10} />
                <Row justifyContent="flex-end">
                  <TouchableIcon
                    disabled={noCards}
                    onPress={() => {
                      if (checkIfPro()) {
                        return;
                      } else {
                        shareToWhatsapp();
                      }
                    }}
                    style={{
                      borderColor: Colors.CANDOR_BLACK,
                      borderWidth: 2,
                      borderRadius: 50,
                      backgroundColor: Colors.CANDOR_BLACK,
                    }}
                  >
                    <Whatsapp />
                  </TouchableIcon>
                  {/* <Spacer width={6} />
              <TouchableIcon
                disabled={noCards}
                onPress={() => {
                  if (checkIfPro()) {
                    return;
                  } else {
                    if (isSnapLoggedIn) {
                      return shareToSnapchat();
                    }
                    snapLogin();
                    // shareToSnapchat();
                  }
                }}
              >
                {snapchatLoading ? (
                  <ActivityIndicator size={"large"} />
                ) : (
                  <SnapChat />
                )}
              </TouchableIcon> */}
                  <Spacer width={6} />
                  <TouchableIcon
                    disabled={noCards}
                    onPress={() => {
                      if (checkIfPro()) {
                        return;
                      } else {
                        bsheet.current.open();
                        // shareToInsta();
                      }
                    }}
                    style={{
                      borderColor: Colors.CANDOR_BLACK,
                      borderWidth: 2,
                      backgroundColor: Colors.CANDOR_BLACK,
                      borderRadius: 50,
                    }}
                  >
                    <Instagram />
                  </TouchableIcon>
                  <Spacer width={6} />
                  <TouchableIcon
                    disabled={noCards}
                    onPress={() => {
                      if (checkIfPro()) {
                        return;
                      } else {
                        tweetNow();
                      }
                    }}
                    style={{
                      borderColor: Colors.CANDOR_BLACK,
                      borderWidth: 2,
                      borderRadius: 50,
                      backgroundColor: Colors.CANDOR_BLACK,
                    }}
                  >
                    <Twitter />
                  </TouchableIcon>
                  <Spacer width={6} />
                  <TouchableIcon
                    disabled={noCards}
                    onPress={() => {
                      if (checkIfPro()) {
                        return;
                      } else {
                        shareToTelegram();
                      }
                    }}
                    style={{
                      borderColor: Colors.CANDOR_BLACK,
                      borderWidth: 2,
                      borderRadius: 50,
                      backgroundColor: Colors.CANDOR_BLACK,
                    }}
                  >
                    <Telegram width={40} height={39} />
                  </TouchableIcon>
                  <Spacer width={6} />
                  <TouchableIcon
                    disabled={noCards}
                    onPress={() => {
                      if (checkIfPro()) {
                        return;
                      } else {
                        generalShare();
                      }
                    }}
                    style={{
                      borderColor: Colors.CANDOR_BLACK,
                      borderWidth: 2,
                      borderRadius: 50,
                      backgroundColor: Colors.CANDOR_BLACK,
                    }}
                  >
                    <GeneralShare />
                  </TouchableIcon>
                </Row>
              </Column>
            </View>
          )}
          {/* OR */}
          <View
            style={{
              position: "relative",
              height: 25,
              width: getScreenResponsiveWidth(30),
              zIndex: -10000,
            }}
          >
            <Row
              width={40}
              height={40}
              backgroundColor={Colors.CANDOR_BLACK}
              justifyContent="center"
              alignItems="center"
              style={{
                borderRadius: 40,
                position: "absolute",
                top: -10,
              }}
            >
              <Typography size={12} color={Colors.CANDOR_WHITE}>
                OR
              </Typography>
            </Row>
          </View>

          <View
            style={{
              position: "relative",
              width: "100%",
            }}
          >
            <Row
              height={49}
              width={"100%"}
              backgroundColor={"#000"}
              style={{
                borderRadius: 55,
                position: "absolute",
                top: 5,
                right: 5,
              }}
            />
            <Button
              height={49}
              disabled={noCards}
              color={String(currCard?.gradient_background_color).split(",")[1]}
              onPress={handleCopy}
              textColor={Colors.CANDOR_BLACK}
              textStyle={{
                fontSize: 12,
                width: "100%",
              }}
              style={{
                borderColor: Colors.CANDOR_BLACK,
                borderWidth: 2,
                shadowColor: "#000",
                elevation: 5,
                overflow: "hidden",
              }}
            >
              <Column
                style={{
                  width: "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography color={currCard?.new_text_color} size={16}>
                  {currCard?.category === "chatme"
                    ? "💰 Select your price"
                    : "🔗 Copy link"}
                </Typography>
              </Column>
            </Button>
          </View>
        </Column>

        <RBSheet
          ref={bsheet}
          height={getScreenResponsiveHeight(380)}
          openDuration={250}
          closeOnDragDown={true}
          closeOnPressMask={true}
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
          <TutorialSlide
            instragramLoader={instagramLoading}
            shareFn={shareToInsta}
            card={currCard}
          />
        </RBSheet>

        <RBSheet
          ref={bsheetProCard}
          openDuration={250}
          closeOnDragDown={true}
          closeOnPressMask={true}
          height={getScreenResponsiveHeight(509)}
          customStyles={{
            wrapper: styles.wrapper,
            draggableIcon: styles.draggableIcon,
            container: styles.container,
          }}
        >
          <ProCard
            item={currCard}
            rbSheetRef={bsheetProCard}
            navigation={navigation}
            refetch={refetch}
            typeOfCard={currCard?.is_premium ? "pro" : "blank"}
            onClose={() => bsheetProCard.current.close()}
          />
        </RBSheet>

        <RBSheet
          ref={bsheetBlanktextCard}
          openDuration={250}
          closeOnDragDown={true}
          closeOnPressMask={true}
          height={getScreenResponsiveHeight(509)}
          customStyles={{
            wrapper: styles.wrapper,
            draggableIcon: styles.draggableIcon,
            container: styles.container,
          }}
        >
          <ProBlankTextCard
            item={currCard}
            rbSheetRef={bsheetBlanktextCard}
            refetchBlankCardAvailability={refetchBlankCardAvailability}
            navigation={navigation}
            onClose={() => bsheetBlanktextCard.current.close()}
          />
        </RBSheet>

        <RBSheet
          ref={bsheetBlankAudioCard}
          openDuration={250}
          closeOnDragDown={true}
          closeOnPressMask={true}
          height={getScreenResponsiveHeight(509)}
          customStyles={{
            wrapper: styles.wrapper,
            draggableIcon: styles.draggableIcon,
            container: styles.container,
          }}
        >
          <ProBlankAudioCard
            item={currCard}
            rbSheetRef={bsheetBlankAudioCard}
            navigation={navigation}
            refetchBlankCardAvailability={refetchBlankCardAvailability}
            onClose={() => bsheetBlankAudioCard.current.close()}
          />
        </RBSheet>

        <RBSheet
          ref={bsheetPreview}
          openDuration={250}
          closeOnDragDown={true}
          closeOnPressMask={true}
          height={getScreenResponsiveHeight(
            currCard?.category === "chatwithme" ? 582 : 500
          )}
          customStyles={{
            wrapper: styles.wrapper,
            draggableIcon: styles.draggableIcon,
            container: {
              ...styles.container,
              backgroundColor: Colors.CANDOR_WHITE,
            },
          }}
        >
          {currCard?.category?.includes("blank") && (
            <PreviewBlankCard
              text={blankText?.trim()}
              cardId={createdCard}
              card={currCard}
            />
          )}
          {currCard?.category === "chatwithme" && (
            <PreviewChatwithMePro messageToken={messageToken} card={currCard} />
          )}
        </RBSheet>

        <RBSheet
          ref={bsheetChatWithPreview}
          openDuration={250}
          closeOnDragDown={true}
          closeOnPressMask={true}
          height={getScreenResponsiveHeight(336)}
          customStyles={{
            wrapper: styles.wrapper,
            draggableIcon: styles.draggableIcon,
            container: {
              ...styles.container,
              backgroundColor: Colors.CANDOR_WHITE,
            },
          }}
        >
          <ChatWithMePreview
            text={blankText?.trim()}
            cardId={createdCard}
            card={currCard}
            onClose={() => {
              bsheetChatWithPreview.current.close();
            }}
          />
        </RBSheet>
      </SafeAreaView>
    </LinearGradient>
  );
};

const ItemView = ({ item, index, bgColor, lastIndex, isActive }: any) => {
  return (
    <Column
      style={{
        marginRight:
          index == lastIndex
            ? getScreenResponsiveWidth(150)
            : getScreenResponsiveWidth(30),
        marginLeft: index == 0 ? getScreenResponsiveWidth(153.5) : 0,
      }}
    >
      <Row
        style={{
          borderWidth: isActive ? 4 : 0,
          borderColor: Colors.CANDOR_WHITE,
          borderRadius: 18,
          width: getScreenResponsiveWidth(65),
          height: getScreenResponsiveHeight(53),
        }}
        alignItems="center"
      >
        <Typography
          color={Colors.CANDOR_WHITE}
          size={33}
          lineHeight={40}
          style={{
            opacity: 0.5,
            left:
              String(index + 1)?.length > 1
                ? -getScreenResponsiveWidth(25)
                : -getScreenResponsiveWidth(20),
            position: "absolute",
          }}
        >
          {index + 1}
        </Typography>
        <Row
          backgroundColor={String(bgColor).split(",")[1]}
          style={{
            borderRadius: 14,
            overflow: "hidden",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            style={{
              zIndex: 99999,
            }}
            size={20}
            lineHeight={25}
          >
            💬
          </Typography>
          {isActive && (
            <Image
              style={{
                width: getScreenResponsiveWidth(9),
                height: getScreenResponsiveHeight(9),
                borderRadius: 50,
                position: "absolute",
                bottom: -2,
                zIndex: 9999900000,
              }}
              source={require("../../assets/poly.png")}
            />
          )}
        </Row>
      </Row>
    </Column>
  );
};

const styles = StyleSheet.create({
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
    // width: "100%",
  },
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
});
