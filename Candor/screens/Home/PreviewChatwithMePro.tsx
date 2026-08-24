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
  FlatList,
  ActivityIndicator,
} from "react-native";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
  showOnly,
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
import * as IAP from "react-native-iap";
import {
  CreativeKit,
  LoginKit,
  MetadataParams,
} from "@snapchat/snap-kit-react-native";
import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_CHAT_WITH_ME_PRO_LINK,
  SAVE_USER_SNAP_INFO,
} from "../../graphQL/mutations";
import RNFetchBlob from "rn-fetch-blob";
import { ProChatWithMe } from "../../components/cards/ProChatWithMe";
import { LIST_DM_LINKS } from "../../graphQL/queries";
import { countris } from "../../utils/countries";
interface PreviewChatwithMeProProps {
  messageToken: any;
  card: any;
  copy?: any;
}

export const PreviewChatwithMePro: FC<PreviewChatwithMeProProps> = ({
  card,
  copy = false,
}): ReactElement => {
  const { userProfile, setUserProfile }: any = useContext(UserProfile);
  const answerCard = useRef<any>();
  const bsheet = useRef<any>();
  const [snapchatLoading, setSnapchatLoading] = useState(false);
  const { setIsSnapLoggedIn, isSnapLoggedIn }: any =
    useContext(SnapChatLoginContext);
  const [page, setPage] = useState("1a");
  const [links, setLinks] = useState<any[]>([]);
  const [showInstagramStory, setShowInstagramStory] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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
  const [link, setLink] = useState<any>(
    `${preLink}/${userProfile?.username}/${card?._id}-`
  );
  useEffect(() => {
    setLink(`${preLink}/${userProfile?.username}/${card?._id}-`);
  }, []);

  const changePage = (page: string) => {
    setPage(page);
  };

  const setActiveLink = (link: string) => {
    setLink(link);
    changePage("1b");
  };
  const handleCopy = async () => {
    Platform.OS === "ios"
      ? NativeModules.AdsModule.copyText(link)
      : await Clipboard.setStringAsync(link).then(() => {});
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const [instagramLoading, setInstagramLoading] = useState(false);

  const shareToInsta = async (uri: any) => {
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
        message: "Hey chat with me on Candor",
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

  useQuery(LIST_DM_LINKS, {
    onCompleted(d) {
      setLinks(
        d?.ListDMLinks?.json?.filter((d: any) => {
          return (
            d?.type === "paid_by_receiver" &&
            new Date(d?.expiry_time) > new Date()
          );
        })
      );
    },
    onError(e) {
      console.log(e);
    },
    variables: {
      limit: 1000,
      page: 0,
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
        title: "Hey chat with me on candor",
        message: link,
      });
    } catch (err) {}
  };

  //Payments
  const [product, setProduct] = useState<any>(null);
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<any>(null);
  const [apiCountry, setapiCountry] = useState<any>(null);

  const lowIncomeCountries: any = countris.low;
  const midIncomeCountries: any = countris.mid;
  const [CreateChatWithMeProLink] = useMutation(CREATE_CHAT_WITH_ME_PRO_LINK, {
    async onCompleted(data) {
      const messageToken: string =
        data?.CreateLinkForDMPaidByReceiver?.json?.msg_token;
      // const preLink = "https://stage.playcandor.com";
      const preLink = "https://playcandor.com";
      const link = `${preLink}/${userProfile?.username}/${card?._id}-${messageToken}`;
      await IAP.finishTransaction({ purchase });
      setActiveLink(link);
      setLoading(false);
    },
    async onError(error) {
      console.log(error, "api error");

      setLoading(false);
    },
  });
  useEffect(() => {
    fetch("https://ipinfo.io/json?token=e798cd32704c2c")
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setapiCountry(data?.country);
        }
      });
  }, [apiCountry]);

  useEffect(() => {
    if (!apiCountry) {
      return;
    }

    if (lowIncomeCountries?.includes(apiCountry)) {
      setItems(
        Platform.select({
          ios: ["cdcwmp_499"],
          android: ["cdcwmp_499"],
        })
      ); // low
    } else if (midIncomeCountries.includes(apiCountry)) {
      setItems(
        Platform.select({
          ios: ["cdcwmp_499"],
          android: ["cdcwmp_499"],
        })
      ); // mid
    } else {
      setItems(
        Platform.select({
          ios: ["cdcwmp_499"],
          android: ["cdcwmp_499"],
        })
      ); // high
    }
  }, [apiCountry]);

  useEffect(() => {
    IAP.initConnection()
      .catch(() => {})
      .then(() => {
        if (Platform.OS === "ios") {
          IAP.getSubscriptions({ skus: items })
            .catch((error: any) => {
              console.log(JSON.stringify(error));
              console.log("error finding purchases");
            })
            .then((res: any) => {
              const filteredRes: any[] = res?.filter((item: any) => {
                if (items.includes(item.productId)) return item;
              });
              setProduct(filteredRes[0]);
            });
        } else {
          IAP.getProducts({ skus: items })
            .catch((error: any) => {
              console.log(JSON.stringify(error));
              console.log("error finding purchases");
            })
            .then((res: any) => {
              //android

              const filtered: any[] = res?.filter((item: any) => {
                return true;
              });

              let d1Obj = {
                countryCode: filtered[0].currency,
                currency: filtered[0].currency,
                description: "",
                discounts: [],
                introductoryPrice: "",
                introductoryPriceAsAmountIOS: "",
                introductoryPriceNumberOfPeriodsIOS: "",
                introductoryPricePaymentModeIOS: "",
                introductoryPriceSubscriptionPeriodIOS: "",
                localizedPrice: filtered[0].localizedPrice,
                platform: "android",
                price: Number(
                  filtered[0].oneTimePurchaseOfferDetails?.priceAmountMicros /
                    1000000
                ).toFixed(2),
                productId: filtered[0].productId,
                subscriptionPeriodNumberIOS: "1",
                subscriptionPeriodUnitIOS: "DAY",
                title: "",
                type: "subs",
              };

              // const newArr = [d1Obj];
              // console.log(">>>> ", JSON.stringify(res));
              setProduct(d1Obj);
            });
        }
      });

    const purchaseErrorListener = IAP.purchaseErrorListener((error: any) => {
      if (error["responseCode"] === "2") {
      } else {
        setLoading(false);
        if (Platform.OS === "android") {
          if (error.code === "E_USER_CANCELLED") {
            return;
          }

          purchaseErrorListener.remove();
        } else {
        }
      }
    });

    const purchaseUpdatedListener = IAP.purchaseUpdatedListener(
      async (purchase: IAP.Purchase) => {
        try {
          const receipt = purchase.transactionReceipt;
          setPurchase(purchase);
          if (receipt) {
            if (Platform.OS === "ios") {
              CreateChatWithMeProLink({
                variables: {
                  appleReceipt: receipt,
                  amount: 1,
                },
              });
            } else {
            }
          }
        } catch (error) {}
      }
    );

    return () => {
      try {
        purchaseUpdatedListener.remove();
      } catch (err) {}
      try {
        purchaseErrorListener.remove();
      } catch (err) {}
      try {
        IAP.endConnection();
      } catch (err) {}
    };
  }, [items]);

  const purchaseCard = async () => {
    setLoading(true);
    if (Platform.OS === "ios") {
      await IAP.requestSubscription({
        sku: product?.productId,
        subscriptionOffers: [
          {
            sku: product?.description,
            offerToken: product?.productId,
          },
        ],
      });
    } else {
      await IAP.requestPurchase({
        sku: product?.productId,
        skus: [product?.productId],
      });
    }
  };

  if (!product) {
    return (
      <Column
        flex={1}
        style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
        alignItems="center"
      >
        <Column flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size={"large"} />
          <Typography color={Colors.CANDOR_BLACK}>Loading</Typography>
        </Column>
      </Column>
    );
  }
  return (
    <View style={styles.imageBackground}>
      {page.includes("1") ? (
        <>
          <Column
            flex={1}
            style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
            alignItems="center"
          >
            <Spacer height={10} />
            <>{links.length === 0 && page == "1a" && <Spacer height={40} />}</>
            <Typography
              textAlign="center"
              type="Heading1"
              color={Colors.CANDOR_BLACK}
              size={14}
            >
              Preview of your Chatwithme card
            </Typography>
            <Spacer height={15} />
            <Column
              height={280}
              width={290}
              backgroundColor={Colors.CANDOR_BLUE}
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
                  color={Colors.CANDOR_WHITE}
                  textAlign={"left"}
                  size={35}
                  style={{ width: getScreenResponsiveWidth(200) }}
                >
                  Chatwithme Pro
                </Typography>
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
            <Spacer height={19} />

            {page === "1a" ? (
              <Column width={"100%"} flex={1}>
                <Typography
                  color={Colors.CANDOR_BLACK}
                  size={13}
                  textAlign="center"
                >
                  This link is valid for 7 days
                </Typography>
                <Spacer height={9} />
                <Button
                  loading={loading}
                  title={
                    "Generate Link for " +
                    product?.currency +
                    "" +
                    Number(product?.price).toFixed(2)
                  }
                  onPress={purchaseCard}
                />
                <Spacer height={9} />
                <>
                  {links.length > 0 && (
                    <Button
                      color={Colors.CANDOR_GRAY}
                      textColor={Colors.CANDOR_BLACK}
                      onPress={() => changePage("2")}
                      title="View old generated links"
                    />
                  )}
                </>
              </Column>
            ) : (
              <>
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
                        bsheet.current.open();
                      }}
                    >
                      <Instagram />
                    </TouchableIcon>
                    <Spacer width={6} />
                    <TouchableIcon
                      onPress={() => {
                        tweetNow();
                      }}
                    >
                      <Twitter />
                    </TouchableIcon>
                    <Spacer width={6} />
                    <TouchableIcon
                      onPress={() => {
                        generalShare();
                      }}
                    >
                      <GeneralShare />
                    </TouchableIcon>
                  </Row>
                </Row>
                <Spacer height={13} />
                <Row
                  height={80}
                  width={318}
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
                        `playcandor.com/${userProfile?.username}/`
                      )}`}
                    </Typography>
                  </Column>
                  <Button
                    width={100}
                    height={32}
                    color={Colors.CANDOR_WHITE}
                    onPress={handleCopy}
                    textColor={Colors.CANDOR_BLACK}
                    textStyle={{
                      fontSize: 12,
                    }}
                  >
                    <Typography type="Paragraph4">
                      {" "}
                      {isCopied ? "Copied" : "Copy Link"}{" "}
                    </Typography>
                  </Button>
                </Row>
              </>
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
              card={{
                ...card,
                caption_text:
                  "I’m available to chat! - Tap on the link & lets have fun chatting",
              }}
              shareFn={shareToInsta}
            />
          </RBSheet>
        </>
      ) : (
        <ListLinks links={links} card={card} setActiveLink={setActiveLink} />
      )}
    </View>
  );
};

const ListLinks = ({
  links,
  card,
  setActiveLink,
}: {
  links?: any[];
  card?: any;
  setActiveLink: (link: string) => void;
}) => {
  const { userProfile }: any = useContext(UserProfile);

  const preLink = "https://playcandor.com";
  // const preLink = "https://stage.playcandor.com";

  const link = `${preLink}/${userProfile?.username}/${card?._id}-`;
  return (
    <Column
      flex={1}
      style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
    >
      <>
        <Spacer height={10} />
        <Typography
          textAlign="center"
          type="Heading1"
          color={Colors.CANDOR_BLACK}
          size={14}
        >
          Tap to view your previous old links
        </Typography>
        <Spacer height={15} />
        <Column
          flex={1}
          style={{
            paddingBottom: getScreenResponsiveHeight(60),
          }}
        >
          <FlatList
            data={links}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={{ height: 20, width: 25 }} />
            )}
            keyExtractor={(_, index) => index.toFixed(1)}
            renderItem={({ item, index }: any) => (
              <Button
                onPress={() => {
                  setActiveLink(link + item?.msg_token);
                }}
                title={showOnly(20, link + item?.msg_token)}
              />
            )}
          />
        </Column>
      </>
    </Column>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    height: getScreenResponsiveHeight(600),
    width: "100%",
    backgroundColor: Colors.CANDOR_WHITE,
  },
});
