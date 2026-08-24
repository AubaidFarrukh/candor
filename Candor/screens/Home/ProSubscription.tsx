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
  ImageBackground,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import BackButtonWhite from "../../assets/svgs/BackButton-White.svg";
import {
  Button,
  Column,
  Row,
  Spacer,
  TouchableIcon,
  TouchableText,
  Typography,
} from "../../components";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import {
  Colors,
  FontType,
  TypographyStyle,
  getHexColorOpacity,
} from "../../theme";
import Swiper from "react-native-swiper";
import { benefitsData } from "../../constants";
import HorizontalLine from "../../assets/svgs/HorizontalLine.svg";
import { StatusBar } from "expo-status-bar";
import { DonateShare } from "./DonateShare";
import { RecurringDonation } from "./RecurringDonation";
import RBSheet from "react-native-raw-bottom-sheet";
import * as IAP from "react-native-iap";
import {
  DonationationSubscriptionContext,
  ProSubscriptionContext,
  ToastContext,
} from "../../context";
import Spinner from "react-native-loading-spinner-overlay";
import { useMutation } from "@apollo/client";
import { MARK_USER_AS_PAID, MARK_USER_ANDROID } from "../../graphQL/mutations";
import { ScrollView } from "react-native-gesture-handler";
import ParsedText from "react-native-parsed-text";
import * as WebBrowser from "expo-web-browser";
import { Screens } from "../../navigation";

interface ProSubscriptionProps {
  navigation: any;
  route: any;
}
interface TypeProps {
  type: "OneTimeReveal" | "OneTimeProCards" | "Pro";
}

const items: any = Platform.select({
  ios: ["cd_399_1w"],
  android: ["cd_pro_sub"],
});

let purchaseUpdatedListener: any;
let purchaseErrorListener: any;

export const ProSubscription: FC<ProSubscriptionProps> = ({
  navigation,
  route,
}): ReactElement => {
  const { type = "OneTimeReveal" }: TypeProps = route.params;
  const [adLoading, setAdLoading] = useState<boolean>(false);
  const donateShareSheet = useRef<any>();
  const recdonateShareSheet = useRef<any>();
  const otBtnText = {
    OneTimeReveal: "One time reveal for $1.99",
    OneTimeProCards: "One time use of the card for $1.99",
    Pro: "",
  };
  const { toast } = useContext<any>(ToastContext);
  const [products, setProducts] = useState<any[]>([]);
  const [_, setChecking] = useState(true);
  const [activeSubCard, setActiveSubCard] = useState<any>(null);
  const { setIsPro }: any = useContext(ProSubscriptionContext);
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { isDonated }: any = useContext(DonationationSubscriptionContext);

  const [MarkUserAsPaid] = useMutation(MARK_USER_AS_PAID, {
    async onCompleted(d) {
      await IAP.finishTransaction({ purchase });
      setIsPro(true);
      toast({ message: "You are now a pro user", intent: "success" });
      setLoading(false);
      setTimeout(() => {
        navigation.navigate(Screens.HOME);
      }, 1000);
    },
    async onError(e) {
      console.log(e, "error");
      setLoading(false);
    },
  });

  const [MarkUserAndroid] = useMutation(MARK_USER_ANDROID, {
    async onCompleted(d) {
      await IAP.finishTransaction({ purchase });
      setIsPro(true);
      toast({ message: "You are now a pro user", intent: "success" });
      setLoading(false);
      setTimeout(() => {
        navigation.navigate(Screens.HOME);
      }, 1000);
    },
    async onError(e) {
      await IAP.finishTransaction({ purchase });
      console.log(e, "error");
    },
  });

  const validate = async (receipt: any) => {
    setChecking(true);
    const receiptBody = {
      "receipt-data": receipt,
      password: "7100affbce654a80b73ed5d22019b34a",
    };

    if (Platform.OS === "ios") {
      await IAP.validateReceiptIos({ receiptBody })
        .catch((error: any) => {})
        .then(async (receipt: any) => {
          try {
            const renewalHistory = receipt.latest_receipt_info;

            for (let history of renewalHistory) {
              const res = await IAP.finishTransaction({ purchase: history });
            }
            const expiration = renewalHistory[0].expiration;
            let expired = Date.now() > expiration;
            if (!expired) {
              // setIsPro(true);
            } else {
              setIsPro(false);
              // setPurchased(false);
            }
          } catch (error) {}
        });
    } else {
      try {
        const deliveryReceipt = await fetch(
          "https://us-central1-candor-b084e.cloudfunctions.net/validateSubscription",
          {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ data: JSON.parse(receipt) }),
          }
        ).then((res) => {
          res.json().then((r) => {
            if (r.result.error == -1) {
              toast({
                message: "Error There has been an error with your purchase",
                intent: "danger",
              });
            } else if (r.result.isActiveSubscription) {
              toast({ message: "Purchase successful", intent: "success" });
              MarkUserAndroid();
            } else {
              toast({ message: "Error with your purchase", intent: "danger" });
            }
          });
        });
      } catch (error: any) {
        Alert.alert("Error!", error?.message);
      }
    }
  };

  const closeDonateRefSheet = () => {
    donateShareSheet.current?.close();
  };

  const closeRecurringRefSheet = () => {
    recdonateShareSheet?.current?.close();
  };

  useEffect(() => {
    IAP.initConnection()
      .catch(() => {
        console.log("error connecting to store");
      })
      .then(() => {
        console.log("connected to store...");
        IAP.getSubscriptions({ skus: items })
          .catch((error: any) => {
            console.log(JSON.stringify(error));

            console.log("error finding purchases");
          })
          .then((res: any) => {
            if (Platform.OS === "ios") {
              const filteredRes: any[] = res?.filter((item: any) => {
                if (items.includes(item?.productId)) return item;
              });
              const week = filteredRes.findIndex(
                (item) => item?.productId === "cd_399_1w"
              );
              const month = filteredRes.findIndex(
                (item) => item?.productId === "cd_699_1m"
              );
              const newArr: any = [];

              if (filteredRes[week]) {
                if (filteredRes[week]?.localizedPrice)
                  newArr.push(filteredRes[week]);
              }
              if (filteredRes[month]) {
                if (filteredRes[month]?.localizedPrice)
                  newArr.push(filteredRes[month]);
              }

              setProducts(newArr);

              setActiveSubCard(filteredRes[week]);
            } else {
              //android
              let items = res[0].subscriptionOfferDetails;
              const filteredRes: any[] = items?.filter((item: any) => {
                return true;
              });

              let week = filteredRes.findIndex(
                (item) =>
                  item.pricingPhases?.pricingPhaseList[0]?.billingPeriod ===
                  "P1W"
              );
              const month = filteredRes.findIndex(
                (item) =>
                  item.pricingPhases?.pricingPhaseList[0]?.billingPeriod ===
                  "P1M"
              );

              let rawWeek =
                filteredRes[week]?.pricingPhases?.pricingPhaseList[0];
              let rawMonth =
                filteredRes[month]?.pricingPhases?.pricingPhaseList[0];

              let weekObj = {
                countryCode: rawWeek?.priceCurrencyCode,
                currency: rawWeek?.priceCurrencyCode,
                description: "",
                discounts: [],
                introductoryPrice: "",
                introductoryPriceAsAmountIOS: "",
                introductoryPriceNumberOfPeriodsIOS: "",
                introductoryPricePaymentModeIOS: "",
                introductoryPriceSubscriptionPeriodIOS: "",
                localizedPrice: rawWeek?.formattedPrice,
                platform: "android",
                price: Number(rawWeek?.priceAmountMicros / 1000000).toFixed(2),
                productId: filteredRes[week]?.offerToken,
                subscriptionPeriodNumberIOS: "7",
                subscriptionPeriodUnitIOS: "DAY",
                title: "",
                type: "subs",
              };
              let monthObj = {
                countryCode: rawMonth?.priceCurrencyCode,
                currency: rawMonth?.priceCurrencyCode,
                description: "",
                discounts: [],
                introductoryPrice: "",
                introductoryPriceAsAmountIOS: "",
                introductoryPriceNumberOfPeriodsIOS: "",
                introductoryPricePaymentModeIOS: "",
                introductoryPriceSubscriptionPeriodIOS: "",
                localizedPrice: rawMonth?.formattedPrice,
                platform: "android",
                price: Number(rawMonth?.priceAmountMicros / 1000000).toFixed(2),
                productId: filteredRes[month]?.offerToken,
                subscriptionPeriodNumberIOS: "1",
                subscriptionPeriodUnitIOS: "MONTH",
                title: "",
                type: "subs",
              };
              const newArr = [weekObj, monthObj];

              setProducts(newArr);
              setActiveSubCard(weekObj);
            }
          });
      });

    purchaseErrorListener = IAP.purchaseErrorListener((error: any) => {
      setLoading(false);
      if (error["responseCode"] === "2") {
      } else {
        if (Platform.OS === "android") {
          if (error.code === "E_USER_CANCELLED") {
            return;
          }
          toast({
            message: error?.debugMessage,
          });

          purchaseErrorListener.remove();
        } else {
          toast({
            message:
              "There has been an error with your purchase, error code = " +
              error["code"],
          });
        }
      }
    });

    purchaseUpdatedListener = IAP.purchaseUpdatedListener(
      async (purchase: IAP.Purchase) => {
        try {
          const receipt = purchase.transactionReceipt;

          setPurchase(purchase);
          // validate(receipt);

          if (receipt) {
            if (Platform.OS === "ios") {
              MarkUserAsPaid({
                variables: {
                  appleReceipt: receipt,
                  restore: false,
                },
              });
            } else {
              MarkUserAndroid();
              purchaseUpdatedListener.remove();
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
  }, []);

  // console.log(loading);

  const purchaseSubscription = async () => {
    setLoading(true);
    await IAP.requestSubscription({
      sku: activeSubCard?.productId,
      subscriptionOffers: [
        {
          sku: "cd_pro_sub",
          offerToken: activeSubCard?.productId,
        },
      ],
    });
  };

  const _restorePurchases = () => {
    // setShowLoading(true);
    IAP.getPurchaseHistory()
      .catch(() => {})
      .then((res: any) => {
        if (res) {
          const filteredRes = res?.filter((item: any) => {
            if (items.includes(item.productId)) return item;
          });
          const receipt =
            filteredRes[filteredRes?.length - 1]?.transactionReceipt;

          if (receipt) {
            if (Platform.OS === "ios") {
              MarkUserAsPaid({
                variables: {
                  appleReceipt: receipt,
                  restore: true,
                },
              });
            } else {
              validate(receipt);
            }
          }
        }
      });
  };

  if (products.length < 1 || typeof activeSubCard?.price === "undefined") {
    return (
      <ImageBackground
        style={{
          ...styles.imageBackground,
        }}
        source={require("../../assets/ProSubscriptionBackground.png")}
      >
        <Spacer height={60} />
        <Column style={{ paddingHorizontal: getScreenResponsiveWidth(20) }}>
          <TouchableIcon onPress={() => navigation.goBack()}>
            <BackButtonWhite />
          </TouchableIcon>
        </Column>
        <StatusBar style="light" />
        <Column flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size={"large"} />
          <Typography color={Colors.CANDOR_WHITE}>
            Loading subscriptions
          </Typography>
        </Column>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      style={styles.imageBackground}
      source={require("../../assets/ProSubscriptionBackground.png")}
    >
      <StatusBar style="light" />

      <Spacer height={Platform.OS === "android" ? 50 : 25} />

      {Platform.OS === "android" && (
        <Row
          style={{
            paddingHorizontal: getScreenResponsiveWidth(20),
            paddingBottom: getScreenResponsiveHeight(5),
          }}
        >
          <TouchableIcon
            style={{
              marginRight: getScreenResponsiveWidth(20),
            }}
            onPress={() => navigation.goBack()}
          >
            <BackButtonWhite />
          </TouchableIcon>
          <Row flex={1} justifyContent="center" alignItems="center">
            <Typography
              textAlign="center"
              type="Heading1"
              size={24}
              color={Colors.CANDOR_WHITE}
            >
              Candor
            </Typography>
            <Spacer width={6} />
            <Column
              width={45}
              height={24}
              style={{ borderRadius: 5 }}
              alignItems="center"
              justifyContent="center"
              backgroundColor={Colors.CANDOR_BLUE}
            >
              <Typography color={Colors.CANDOR_WHITE}>Pro</Typography>
            </Column>
          </Row>
          <></>
        </Row>
      )}

      <ScrollView
        enabled={Platform.OS === "android" ? true : false}
        showsVerticalScrollIndicator={false}
      >
        <Column
          flex={1}
          style={{ paddingHorizontal: getScreenResponsiveWidth(20) }}
        >
          <Spacer height={Platform.OS === "ios" ? 40 : 0} />
          {Platform.OS === "ios" ? (
            <Row>
              <TouchableIcon
                style={{
                  marginRight: getScreenResponsiveWidth(20),
                }}
                onPress={() => navigation.goBack()}
              >
                <BackButtonWhite />
              </TouchableIcon>
              <Row flex={1} justifyContent="center" alignItems="center">
                <Typography
                  textAlign="center"
                  type="Heading1"
                  size={24}
                  color={Colors.CANDOR_WHITE}
                >
                  Candor
                </Typography>
                <Spacer width={6} />
                <Column
                  width={45}
                  height={24}
                  style={{ borderRadius: 5 }}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={Colors.CANDOR_BLUE}
                >
                  <Typography color={Colors.CANDOR_WHITE}>Pro</Typography>
                </Column>
              </Row>
            </Row>
          ) : (
            <></>
          )}
          <Spacer height={20} />
          <Column
            style={{
              borderColor: Colors.CANDOR_BLUE,
              borderWidth: 3,
              borderRadius: 9,
              paddingBottom: getScreenResponsiveHeight(39),
              paddingTop: getScreenResponsiveHeight(22),
            }}
          >
            <Swiper
              dotColor={Colors.CANDOR_GRAY}
              activeDotColor={Colors.CANDOR_BLUE}
              loop
              height={getScreenResponsiveHeight(250)}
              autoplay
            >
              {benefitsData.map((item, index) => (
                <BenefitsItem key={index} item={item} index={index} />
              ))}
            </Swiper>
            <Spacer height={10} />
            <Typography
              type="Heading1"
              textAlign="center"
              color={Colors.CANDOR_WHITE}
            >
              {products[0]?.localizedPrice} / week
            </Typography>
            <Column
              height={86}
              width={86}
              backgroundColor={Colors.CANDOR_YELLOW}
              alignItems="center"
              justifyContent="center"
              style={{
                borderRadius: 300,
                position: "absolute",
                bottom: -getScreenResponsiveHeight(30),
                right: -getScreenResponsiveWidth(20),
              }}
            >
              <Typography
                lineHeight={18.15}
                size={15}
                textAlign="center"
                color={Colors.CANDOR_WHITE}
                style={{
                  textShadowRadius: 5,
                  textShadowColor: Colors.CANDOR_BLACK,
                }}
              >{`3 Days\nFree Trial`}</Typography>
            </Column>
          </Column>

          <Spacer height={39} />
          <Button
            height={45}
            color={Colors.CANDOR_BLUE}
            loading={loading}
            title={`Go ${
              activeSubCard?.subscriptionPeriodUnitIOS?.toLocaleLowerCase() ===
              "day"
                ? "week"
                : activeSubCard?.subscriptionPeriodUnitIOS?.toLocaleLowerCase()
            } pro for ${activeSubCard?.localizedPrice}`}
            onPress={purchaseSubscription}
          />

          <Spacer height={24} />
          <TouchableText
            onPress={_restorePurchases}
            textAlign="center"
            color={Colors.CANDOR_WHITE}
          >
            Restore Purchases
          </TouchableText>
          <Spacer height={24} />

          <>
            {type !== "Pro" && (
              <Column>
                <Row alignItems="center">
                  <HorizontalLine />
                  <Spacer width={34} />
                  <Typography color={Colors.CANDOR_DARK_GRAY}>Or</Typography>
                  <Spacer width={34} />
                  <HorizontalLine />
                </Row>
                <Spacer height={24} />
                <Button
                  height={45}
                  color={Colors.CANDOR_GRAY}
                  title={otBtnText[type]}
                />
              </Column>
            )}
          </>
          <>
            {type === "Pro" && (
              <Column>
                <HorizontalLine width={"100%"} />
                <Spacer height={10} />
                <Typography textAlign="center" color={Colors.CANDOR_DARK_GRAY}>
                  Support candor pay their server cost
                </Typography>
                <Spacer height={10} />
                <Row justifyContent="space-evenly">
                  <>
                    {!isDonated && (
                      <Button
                        onPress={() => recdonateShareSheet.current?.open()}
                        color={Colors.CANDOR_GRAY}
                        title="Recurring Support"
                        width={152}
                        height={45}
                      />
                    )}
                  </>
                  <Button
                    onPress={() => donateShareSheet.current?.open()}
                    color={Colors.CANDOR_GRAY}
                    title="One time Support"
                    width={152}
                    height={45}
                  />
                </Row>
              </Column>
            )}
          </>
          <Spacer height={20} />

          <ParsedText
            style={{
              textAlign: "center",
              fontFamily: FontType.REGULAR_FREDOKA,
              color: Colors.CANDOR_WHITE,
            }}
            parse={[
              {
                pattern: /Terms/,
                style: {
                  textDecorationStyle: "solid",

                  textDecorationLine: "underline",
                },
                onPress: async () => {
                  await WebBrowser.openBrowserAsync(
                    "https://www.playcandor.com/terms-of-services"
                  );
                },
              },
              {
                pattern: /Privacy/,
                style: {
                  textDecorationStyle: "solid",
                  textDecorationLine: "underline",
                },
                onPress: async () => {
                  await WebBrowser.openBrowserAsync(
                    "https://www.playcandor.com/privacy-policy"
                  );
                },
              },
            ]}
            childrenProps={{ allowFontScaling: false }}
          >
            {`Terms and Privacy`}
          </ParsedText>
        </Column>

        {Platform.OS === "android" ? <Spacer height={50} /> : null}

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
        <Spinner
          visible={adLoading}
          textContent={"Loading Ad..."}
          textStyle={{
            ...TypographyStyle["Paragraph1"],
            color: Colors.CANDOR_WHITE,
          }}
        />
      </ScrollView>
    </ImageBackground>
  );
};

export const BenefitsItem = ({ item, index }: any): ReactElement => {
  return (
    <Column alignItems="center">
      <Spacer height={20} />
      <Typography
        color={Colors.CANDOR_WHITE}
        type="Paragraph3"
        textAlign="center"
        size={13}
      >
        Benefits for going Candor Pro
      </Typography>
      <Spacer height={40} />
      <Typography size={60} lineHeight={67}>
        {item.icon}
      </Typography>
      <Spacer height={5} />
      <Typography size={14} type="Paragraph2" color={Colors.CANDOR_WHITE}>
        {item.title}
      </Typography>
      <Spacer height={4} />
      <Typography
        textAlign="center"
        type="Paragraph4"
        color={Colors.CANDOR_GRAY}
        size={12}
      >
        {item.description}
      </Typography>
    </Column>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  wrapper: {
    backgroundColor: getHexColorOpacity(Colors.CANDOR_BLACK, 32),
  },

  draggableIcon: {
    height: 0,
  },
  container: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: Colors.CANDOR_BLACK,
  },
});
