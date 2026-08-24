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
  NativeModules,
} from "react-native";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Colors, FontType } from "../../theme";
import {
  Button,
  Column,
  Row,
  Spacer,
  TouchableIcon,
  Typography,
} from "../../components";
import ViewShot from "react-native-view-shot";
import RBSheet from "react-native-raw-bottom-sheet";
import { TutorialSlide } from "../../components/TutorialSlide";
import * as Clipboard from "expo-clipboard";
import { SnapChatLoginContext, ToastContext, UserProfile } from "../../context";
import Share, { Social } from "react-native-share";
import SnapChat from "../../assets/svgs/Snapchat.svg";
import Whatsapp from "../../assets/svgs/Whatsapp.svg";
import Instagram from "../../assets/svgs/Instagram.svg";
import Twitter from "../../assets/svgs/Twitter.svg";
import GeneralShare from "../../assets/svgs/GenerShare.svg";
import {
  CreativeKit,
  LoginKit,
  MetadataParams,
} from "@snapchat/snap-kit-react-native";
import { useMutation } from "@apollo/client";
import { SAVE_USER_SNAP_INFO } from "../../graphQL/mutations";
import RNFetchBlob from "rn-fetch-blob";

interface PreviewCardProps {
  text: any;
  cardId: any;
  card: any;
  copy?: any;
}

export const PreviewBlankCard: FC<PreviewCardProps> = ({
  text = "",
  cardId,
  card,
  copy = false,
}): ReactElement => {
  const { userProfile, setUserProfile }: any = useContext(UserProfile);
  const answerCard = useRef<any>();
  const bsheet = useRef<any>();
  const { toast } = useContext<any>(ToastContext);
  const [snapchatLoading, setSnapchatLoading] = useState(false);
  const { setIsSnapLoggedIn, isSnapLoggedIn }: any =
    useContext(SnapChatLoginContext);

  const [showInstagramStory, setShowInstagramStory] = useState(false);
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

  const link = `${preLink}/${userProfile?.username}/${cardId}`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(link);
    toast({ message: "Copied link!", intent: "success" });
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
      <Column
        flex={1}
        style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
        alignItems="center"
      >
        <Spacer height={10} />
        <Typography
          textAlign="center"
          type="Heading1"
          color={Colors.CANDOR_BLACK}
          size={14}
        >
          Preview of your Blank pro card
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
            // height={309}
            width={290}
            backgroundColor={
              card?.response_type === "audio" ? Colors.CANDOR_RED : "#27EEF7"
            }
            justifyContent={"space-between"}
            style={{
              borderRadius: 20,
              paddingHorizontal: getScreenResponsiveWidth(21),
              paddingVertical: getScreenResponsiveHeight(20),
            }}
          >
            <Column>
              <Typography
                fontFamily={FontType.REGULAR_ANTON}
                lineHeight={42.5}
                color={
                  card?.response_type === "audio"
                    ? Colors.CANDOR_WHITE
                    : Colors.CANDOR_BLACK
                }
                textAlign={"left"}
                size={35}
                style={{ width: getScreenResponsiveWidth(200) }}
              >
                {text}
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
                color={Colors.CANDOR_BLACK}
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
                source={require("../../assets/Logo.png")}
              />
            </Row>
          </Column>
        </ViewShot>
        <Spacer height={19} />

        {copy ? (
          <Button
            height={62}
            color={Colors.CANDOR_BLACK}
            title={"Share on instagram"}
            onPress={handleCopy}
          />
        ) : (
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
        )}
      </Column>

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
          card={card}
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
