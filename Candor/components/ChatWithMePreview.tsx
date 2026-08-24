import {
  FC,
  ReactElement,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  StyleSheet,
  View,
  Image,
  Platform,
  Linking,
  ActivityIndicator,
  NativeModules,
} from "react-native";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
  showOnly,
} from "../utils";
import { Colors, FontType } from "../theme";
import {
  Button,
  Column,
  Input,
  Row,
  Spacer,
  TouchableIcon,
  Typography,
} from "../components";
import ViewShot from "react-native-view-shot";
import RBSheet from "react-native-raw-bottom-sheet";
import { TutorialSlide } from "../components/TutorialSlide";
import * as Clipboard from "expo-clipboard";
import { SnapChatLoginContext, ToastContext, UserProfile } from "../context";
import Share, { Social } from "react-native-share";
import SnapChat from "../assets/svgs/Snapchat.svg";
import Whatsapp from "../assets/svgs/Whatsapp.svg";
import Instagram from "../assets/svgs/Instagram.svg";
import Twitter from "../assets/svgs/Twitter.svg";
import GeneralShare from "../assets/svgs/GenerShare.svg";
import {
  CreativeKit,
  LoginKit,
  MetadataParams,
} from "@snapchat/snap-kit-react-native";
import { useMutation } from "@apollo/client";
import {
  CREATE_CARD,
  CREATE_LINK_RECEIVER,
  SAVE_USER_SNAP_INFO,
} from "../graphQL/mutations";
import RNFetchBlob from "rn-fetch-blob";

interface ChatWithMePreviewProps {
  text: any;
  cardId: any;
  card: any;
  copy?: any;
  onClose?: any;
}

export const ChatWithMePreview: FC<ChatWithMePreviewProps> = ({
  text = "",
  cardId,
  card,
  copy = false,
  onClose = () => {},
}): ReactElement => {
  const [currCard, setCurrCard] = useState<any>([]);
  const [isCopy, setisCopy] = useState<any>(false);
  const { userProfile, setUserProfile }: any = useContext(UserProfile);
  const answerCard = useRef<any>();
  const bsheet = useRef<any>();
  const { toast } = useContext<any>(ToastContext);
  const [snapchatLoading, setSnapchatLoading] = useState(false);
  const { setIsSnapLoggedIn, isSnapLoggedIn }: any =
    useContext(SnapChatLoginContext);
  const [showInstagramStory, setShowInstagramStory] = useState(false);
  const [selectedPrice, setselectedPrice] = useState(1);
  const [page, setpage] = useState(0);
  const [msgToken, setmsgToken] = useState("");
  const [textMode, setTextMode] = useState(false);
  const [writtenAmount, setWrittenAmount] = useState("");
  const [prices, setPrices] = useState<number[]>([1, 2, 4]);
  const [amountError, setAmountError] = useState("");
  const [copied, setIsCopied] = useState(false);
  useEffect(() => {
    if (Platform.OS === "ios") {
      Linking.canOpenURL("instagram://")
        .then((val) => setShowInstagramStory(val))
        .catch((err) => console.error(err));
    } else {
      Share.isPackageInstalled("com.instagram.android")
        .then(({ isInstalled }) => setShowInstagramStory(isInstalled))
        .catch((err) => console.error(err));
    }
  }, []);

  const preLink = "https://playcandor.com";
  // const preLink = "https://stage.playcandor.com";

  const link = `${preLink}/${userProfile?.username}/${currCard?._id}-${msgToken}`;

  const [CreateLink, CreateLinkQuery] = useMutation(CREATE_LINK_RECEIVER, {
    async onCompleted(data) {
      //   setCurrCard(data?.CreateCard);
      setmsgToken(data?.CreateLinkForDMPaidByUsers?.json?.msg_token);
      setpage(1);
    },
    onError(error) {
      console.log(error);
    },
  });

  const [CreateCard, CreateCardQuery] = useMutation(CREATE_CARD, {
    async onCompleted(data) {
      console.log(data);
      setCurrCard(data?.CreateCard);
      if (selectedPrice) {
        CreateLink({
          variables: {
            amount: selectedPrice,
          },
        });
      }
    },
    onError(error) {
      console.log(error);
    },
  });

  const handleCopy = async () => {
    Platform.OS === "ios"
      ? NativeModules.AdsModule.copyText(link)
      : await Clipboard.setStringAsync(link).then(() => {
          onClose();
        });
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const [instagramLoading, setInstagramLoading] = useState(false);

  const shareToInsta = async (uri: any) => {
    console.log(card);
    Platform.OS === "ios" ? NativeModules.AdsModule.copyText(link) : null;
    Clipboard.setStringAsync(link)
      .then(() => {
        if (showInstagramStory) {
          setInstagramLoading(true);
          RNFetchBlob.config({
            fileCache: true,
            appendExt: "png",
          })
            .fetch("GET", "https://manage.playcandor.com/bg3.png", {})
            .then(async (res) => {
              try {
                await Share.shareSingle({
                  url: link,
                  social: Social.InstagramStories,
                  stickerImage: uri,
                  backgroundBottomColor: Colors.CANDOR_BLACK,
                  backgroundTopColor: Colors.CANDOR_BLACK,
                  appId: "688761346318080",
                  attributionURL: link,
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

  const tweetNow = () => {
    let twitterParameters = [];
    twitterParameters.push("url=" + encodeURI(link));
    const url =
      "https://twitter.com/intent/tweet?" + twitterParameters.join("&");
    Linking.openURL(url);
  };

  const shareToWhatsapp = async () => {
    try {
      await Share.shareSingle({
        social: Social.Whatsapp,
        message: text || "Hey checkout my card on candor",
        url: link,
      });
    } catch (err) {}
  };

  const shareToSnapchat = async (image: any) => {
    let uri = image;
    if (Platform.OS === "ios") {
      uri = "file:/" + image;
    }
    if (uri) {
      const photoContent: MetadataParams = {
        sticker: {
          uri: uri,

          posX: 0.5,
          posY: 0.6,
          rotationDegreesInClockwise: 0,
          isAnimated: false,
        },
        attachmentUrl: link,
      };

      CreativeKit.shareToCameraPreview(photoContent)
        .then((d) => {
          console.log("ran");
        })
        .catch((error) => {
          console.log(error, "from preview");
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
      answerCard.current.capture().then(async (uri: any) => {
        await shareToSnapchat(uri);
      });
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

  const generalShare = async () => {
    try {
      await Share.open({
        title: text || "Hey checkout my card on candor",
        message: link,
      });
    } catch (err) {}
  };

  return (
    <View style={styles.imageBackground}>
      {page == 0 ? (
        <Column
          //   flex={1}
          style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
          alignItems="center"
          //   justifyContent="space-between"
        >
          <Spacer height={30} />
          <Typography
            textAlign="center"
            //   type="Heading1"
            color={Colors.CANDOR_BLACK}
            size={12}
            lineHeight={15}
          >
            Select how much you want your friends or fans to pay before they can
            chat with you anonymously
          </Typography>
          <Spacer height={15} />
          {textMode ? (
            <>
              <Input
                containerStyle={{
                  backgroundColor: Colors.CANDOR_GRAY,
                  width: getScreenResponsiveWidth(319),
                  height: getScreenResponsiveHeight(46),

                  borderColor: Colors.CANDOR_GRAY,
                }}
                placeholder="Enter Amount"
                placeholderTextColor={Colors.CANDOR_BLACK}
                style={{
                  width: getScreenResponsiveWidth(200),
                  fontFamily: FontType.REGULAR_FREDOKA,
                }}
                autoFocus={true}
                focusable
                keyboardType={"decimal-pad"}
                value={writtenAmount}
                error={amountError}
                onChangeText={(text) => {
                  setWrittenAmount(text);
                  setAmountError("");
                }}
                inputRight={() => (
                  <Button
                    width={88}
                    height={36}
                    color={Colors.CANDOR_BLACK}
                    title={`Done`}
                    onPress={() => {
                      if (!writtenAmount) {
                        setWrittenAmount("");
                      }
                      if (Number(writtenAmount) < 1) {
                        alert("Price cannot be less than $1");
                        return;
                      }
                      if (Number.isNaN(Number(writtenAmount))) {
                        setAmountError("Invalid Amount");
                      } else if (writtenAmount) {
                        setPrices([
                          parseInt(writtenAmount),
                          ...prices.slice(1, prices.length),
                        ]);
                        setselectedPrice(parseInt(writtenAmount));
                        setTextMode(false);
                        setWrittenAmount("");
                      }
                    }}
                    textColor={Colors.CANDOR_WHITE}
                    textStyle={{
                      fontSize: getScreenResponsiveHeight(10),
                    }}
                    style={{
                      borderRadius: 13,
                      marginRight: getScreenResponsiveWidth(10),
                    }}
                  />
                )}
              />
            </>
          ) : (
            <Row>
              <>
                {prices.map((item, index) => {
                  return (
                    <Button
                      key={index}
                      width={58}
                      height={45}
                      color={
                        selectedPrice === item
                          ? Colors.CANDOR_WHITE
                          : Colors.CANDOR_GRAY
                      }
                      onPress={() => setselectedPrice(item)}
                      title={`$${item}`}
                      textColor={
                        selectedPrice === item
                          ? Colors.CANDOR_BLACK
                          : Colors.CANDOR_WHITE
                      }
                      textStyle={{
                        fontSize: 17,
                      }}
                      style={{
                        borderWidth: 3,

                        borderColor:
                          selectedPrice === item
                            ? Colors.CANDOR_BLACK
                            : Colors.CANDOR_GRAY,
                        borderRadius: 17,
                        marginRight: getScreenResponsiveWidth(10),
                      }}
                    />
                  );
                })}
              </>

              <Button
                width={94}
                height={45}
                color={Colors.CANDOR_GRAY}
                title={`Type amount`}
                onPress={() => setTextMode(true)}
                textColor={Colors.CANDOR_WHITE}
                textStyle={{
                  fontSize: getScreenResponsiveHeight(10),
                }}
                style={{
                  borderRadius: 17,
                  marginRight: getScreenResponsiveWidth(10),
                }}
              />
            </Row>
          )}

          {textMode ? (
            <></>
          ) : (
            <>
              <Spacer height={79} />
              <Typography type="Paragraph4">
                All payments are active for 24 hours
              </Typography>
              <Spacer height={10} />
              <Button
                width={318}
                height={62}
                color={Colors.CANDOR_BLACK}
                onPress={() => {
                  if (selectedPrice)
                    CreateCard({
                      variables: {
                        backgroundColor: Colors.CANDOR_BLUE,
                        captionText: card?.caption_text,
                        textColor: Colors.CANDOR_BLACK,
                        isPremium: card?.is_premium,
                        category: "chatwithme",
                        responseType: card?.response_type,
                        price: Number(selectedPrice),
                      },
                    });
                }}
                title="Create your link"
                textColor={Colors.CANDOR_WHITE}
                textStyle={{
                  fontSize: 12,
                }}
                loading={CreateCardQuery.loading}
              />
            </>
          )}
        </Column>
      ) : CreateLinkQuery.loading ? (
        <Column justifyContent="center" alignItems="center" flex={1}>
          <ActivityIndicator color={Colors.CANDOR_BLACK} />
        </Column>
      ) : (
        <Column
          flex={1}
          style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
          alignItems="center"
        >
          <Spacer height={10} />
          <Typography
            textAlign="center"
            //   type="Heading1"
            color={Colors.CANDOR_GRAY}
            size={12}
            lineHeight={15}
          >
            Share after selecting your price
          </Typography>
          <Spacer height={15} />
          <ViewShot
            ref={answerCard}
            options={{
              fileName: "answerCardImage",
              format: "png",
              quality: 0.9,
            }}
          >
            <Column
              width={290}
              backgroundColor={Colors.CANDOR_BLUE}
              justifyContent={"space-between"}
              style={{
                borderRadius: 20,
                paddingHorizontal: getScreenResponsiveWidth(21),
                paddingVertical: getScreenResponsiveHeight(20),
                display: "none",
              }}
            >
              <Column>
                <Typography
                  fontFamily={FontType.REGULAR_ANTON}
                  lineHeight={49.5}
                  color={Colors.CANDOR_WHITE}
                  textAlign={"left"}
                  size={35}
                  style={{ width: getScreenResponsiveWidth(200) }}
                >
                  {card?.caption_text}
                </Typography>
                <Typography
                  fontFamily={FontType.REGULAR_FREDOKA}
                  color={Colors.CANDOR_BLACK}
                ></Typography>
              </Column>
              <Row alignItems="center" justifyContent="space-between">
                <Typography
                  fontFamily={FontType.REGULAR_FREDOKA}
                  type="Paragraph4"
                  color={Colors.CANDOR_WHITE}
                  style={{
                    opacity: 0.32,
                  }}
                >
                  Only Truths, No Lies!
                </Typography>
                <Image
                  style={{
                    width: getScreenResponsiveWidth(81),
                    height: getScreenResponsiveHeight(24),
                  }}
                  source={require("../assets/Logo.png")}
                />
              </Row>
            </Column>
          </ViewShot>
          <Spacer height={19} />

          <Row
            height={80}
            width={"100%"}
            justifyContent="space-between"
            alignItems="center"
            backgroundColor={Colors.CANDOR_BLACK}
            style={{
              borderRadius: 25,
              paddingHorizontal: getScreenResponsiveWidth(17),
            }}
          >
            <Column justifyContent="flex-start">
              <Typography
                color={Colors.CANDOR_WHITE}
                type="Paragraph2"
                size={16}
                lineHeight={16}
                fontFamily={FontType.REGULAR_FREDOKA}
              >
                {`Share on \nsocials`}
              </Typography>
            </Column>
            <Row justifyContent="flex-end">
              <TouchableIcon
                onPress={() => {
                  if (false) {
                    return;
                  } else {
                    shareToWhatsapp();
                  }
                }}
              >
                <Whatsapp />
              </TouchableIcon>
              {/* <Spacer width={6} />
            <TouchableIcon
              onPress={() => {
                if (isSnapLoggedIn)
                  return answerCard.current
                    .capture()
                    .then(async (uri: any) => {
                      await shareToSnapchat(uri);
                    });
                snapLogin();
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
                onPress={() => {
                  if (false) {
                    return;
                  } else {
                    bsheet.current.open();
                    // shareToInsta();
                  }
                }}
              >
                <Instagram />
              </TouchableIcon>
              <Spacer width={6} />
              <TouchableIcon
                onPress={() => {
                  if (false) {
                    return;
                  } else {
                    tweetNow();
                  }
                }}
              >
                <Twitter />
              </TouchableIcon>
              <Spacer width={6} />
              <TouchableIcon
                onPress={() => {
                  if (false) {
                    return;
                  } else {
                    generalShare();
                  }
                }}
              >
                <GeneralShare />
              </TouchableIcon>
            </Row>
          </Row>
          <Spacer height={10} />
          <Row
            height={80}
            width={"100%"}
            justifyContent="space-between"
            alignItems="center"
            backgroundColor={Colors.CANDOR_BLACK}
            style={{
              borderRadius: 25,
              paddingHorizontal: getScreenResponsiveWidth(20),
            }}
          >
            <Column width={150} justifyContent="flex-start">
              <Typography
                color={Colors.CANDOR_WHITE}
                type="Paragraph5"
                size={14}
                fontFamily={FontType.REGULAR_FREDOKA}
              >
                {`${showOnly(
                  26,
                  `playcandor.com/${userProfile?.username}/${currCard?._id}`
                )}`}
              </Typography>
            </Column>
            <Button
              width={100}
              height={32}
              color={Colors.CANDOR_WHITE}
              loading={CreateCardQuery.loading}
              loaderColor={Colors.CANDOR_BLACK}
              onPress={handleCopy}
              textColor={Colors.CANDOR_BLACK}
              textStyle={{
                fontSize: 12,
              }}
            >
              <Typography type="Paragraph4">
                {copied ? "Copied" : "Copy Link"}
              </Typography>
            </Button>
          </Row>
          <Button
            width={318}
            height={62}
            color={Colors.CANDOR_WHITE}
            onPress={() => {
              setpage(0);
            }}
            title="Go Back"
            textColor={Colors.CANDOR_GRAY}
            textStyle={{
              fontSize: 12,
            }}
          />
        </Column>
      )}

      <RBSheet
        ref={bsheet}
        height={getScreenResponsiveHeight(370)}
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
          card={{
            ...card,
            caption_text:
              "I’m available to chat! - Tap on the link & lets have fun chatting",
          }}
          shareFn={shareToInsta}
        />
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    height: getScreenResponsiveHeight(600),
    width: "100%",
    backgroundColor: Colors.CANDOR_WHITE,
  },
});
