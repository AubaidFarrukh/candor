import { FC, ReactElement, useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  ImageBackground,
  NativeModules,
  Platform,
  Pressable,
  ActivityIndicator,
  EmitterSubscription,
  Alert,
} from "react-native";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Colors } from "../../theme";
import { Button, Column, Row, Spacer, Typography } from "../../components";
import HorizontalLine from "../../assets/svgs/HorizontalLine.svg";
import * as IAP from "react-native-iap";
import { ToastContext } from "../../context";

interface RevenueShareProps {
  navigation: any;
  setAdLoading: (value: boolean) => void;
  close: () => void;
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

const items: any = Platform.select({
  ios: ["cdd_199", "cdd_399", "cdd_699"],

  android: ["cdd_199", "cdd_399", "cdd_699"],
});

// https://us-central1-candor-b084e.cloudfunctions.net/validateProduct
// https://us-central1-candor-b084e.cloudfunctions.net/validateSubscription

let purchaseUpdatedListener: any;
let purchaseErrorListener: EmitterSubscription;

export const DonateShare: FC<RevenueShareProps> = ({
  navigation,
  setAdLoading,
  close,
}): ReactElement => {
  const [products, setProducts] = useState<any[]>([]);
  const [activeSubCard, setActiveSubCard] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [_, setChecking] = useState(true);
  const [purchase, setPurchase] = useState<any>(null);
  const { toast } = useContext<any>(ToastContext);

  const validate = async (receipt: any) => {
    setChecking(true);
    const receiptBody = {
      "receipt-data": receipt,
      password: "7100affbce654a80b73ed5d22019b34a",
    };

    if (Platform.OS === "ios") {
      await IAP.validateReceiptIos({ receiptBody })
        .catch((error: any) => {})
        .then((receipt: any) => {
          try {
            const renewalHistory = receipt.latest_receipt_info;

            const expiration = renewalHistory[0].expiration;
            let expired = Date.now() > expiration;
            if (!expired) {
              // setIsPro(true);
            } else {
              // setIsPro(false);
              // setPurchased(false);
            }
          } catch (error) {}
        });
    } else {
      try {
        const deliveryReceipt = await fetch(
          "https://us-central1-candor-b084e.cloudfunctions.net/validateProduct",
          {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ data: JSON.parse(receipt) }),
          }
        ).then((res) => {
          res.json().then(async (r) => {
            if (r.result.error == -1) {
              // alert("Error There has been an error with your purchase");
              // toast({
              //   message: "Error There has been an error with your purchase",
              //   intent: "error",
              // });
            } else if (r.result.isActiveSubscription) {
              //success
              await IAP.finishTransaction({ purchase });
              // toast({
              //   message: "Thanks for donating",
              //   intent: "success",
              // });
              close();
            } else {
              // alert("Error validating your purchase");
              // toast({
              //   message: "Error validating your purchase",
              //   intent: "error",
              // });
            }
          });
        });
      } catch (error: any) {
        Alert.alert("Error!", error?.message);
      }
    }
  };

  useEffect(() => {
    IAP.initConnection()
      .catch(() => {})
      .then(() => {
        console.log("connected to store...");
        IAP.getProducts({ skus: items })
          .catch((error: any) => {
            console.log(JSON.stringify(error));
            console.log("error finding purchases");
          })
          .then((res: any) => {
            if (Platform.OS === "ios") {
              const filteredRes: any[] = res?.filter((item: any) => {
                if (items.includes(item.productId)) return item;
              });
              setProducts(filteredRes);
              setActiveSubCard(filteredRes[0]);
            } else {
              const filteredRes: any[] = res?.filter((item: any) => {
                return true;
              });

              let D1 = filteredRes[0];
              let D2 = filteredRes[1];
              let D3 = filteredRes[2];

              let d1Obj = {
                countryCode: D1.currency,
                currency: D1.currency,
                description: "",
                discounts: [],
                introductoryPrice: "",
                introductoryPriceAsAmountIOS: "",
                introductoryPriceNumberOfPeriodsIOS: "",
                introductoryPricePaymentModeIOS: "",
                introductoryPriceSubscriptionPeriodIOS: "",
                localizedPrice: D1.localizedPrice,
                platform: "android",
                price: Number(
                  D1.oneTimePurchaseOfferDetails?.priceAmountMicros / 1000000
                ).toFixed(2),
                productId: D1.productId,
                subscriptionPeriodNumberIOS: "1",
                subscriptionPeriodUnitIOS: "DAY",
                title: "",
                type: "subs",
              };

              let d2Obj = {
                countryCode: D2.currency,
                currency: D2.currency,
                description: "",
                discounts: [],
                introductoryPrice: "",
                introductoryPriceAsAmountIOS: "",
                introductoryPriceNumberOfPeriodsIOS: "",
                introductoryPricePaymentModeIOS: "",
                introductoryPriceSubscriptionPeriodIOS: "",
                localizedPrice: D2.localizedPrice,
                platform: "android",
                price: Number(
                  D2.oneTimePurchaseOfferDetails?.priceAmountMicros / 1000000
                ).toFixed(2),
                productId: D2.productId,
                subscriptionPeriodNumberIOS: "1",
                subscriptionPeriodUnitIOS: "DAY",
                title: "",
                type: "subs",
              };

              let d3Obj = {
                countryCode: D3.currency,
                currency: D3.currency,
                description: "",
                discounts: [],
                introductoryPrice: "",
                introductoryPriceAsAmountIOS: "",
                introductoryPriceNumberOfPeriodsIOS: "",
                introductoryPricePaymentModeIOS: "",
                introductoryPriceSubscriptionPeriodIOS: "",
                localizedPrice: D3.localizedPrice,
                platform: "android",
                price: Number(
                  D3.oneTimePurchaseOfferDetails?.priceAmountMicros / 1000000
                ).toFixed(2),
                productId: D3.productId,
                subscriptionPeriodNumberIOS: "1",
                subscriptionPeriodUnitIOS: "DAY",
                title: "",
                type: "subs",
              };

              const newArr = [d1Obj, d2Obj, d3Obj];

              setProducts(newArr);
              setActiveSubCard(d1Obj);
            }
          });

        IAP.getPurchaseHistory().then((items: any) => {
          items.map(async (item: any) => {
            await IAP.finishTransaction({ purchase: item, isConsumable: true });
          });
        });
      });

    purchaseErrorListener = IAP.purchaseErrorListener((error: any) => {
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

          if (receipt) {
            validate(receipt);
          }
        } catch (error) {}
      }
    );

    return () => {
      try {
        purchaseErrorListener.remove();
      } catch (err) {}
      try {
        IAP.endConnection();
      } catch (err) {}
    };
  }, []);

  function showAd() {
    close();
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
          setAdLoading(false);
          console.log(e, "error");
        });
    } else {
      startAndroidAdsRewardsAds()
        .then((item) => {})
        .catch((e) => {
          // handle generic error here
        });
    }
  }

  if (products.length < 1 || typeof activeSubCard?.price === "undefined") {
    return (
      <ImageBackground
        style={{
          ...styles.imageBackground,
        }}
        source={require("../../assets/ProSubscriptionBackground.png")}
      >
        <Column flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size={"large"} />
          <Typography color={Colors.CANDOR_WHITE}>Loading</Typography>
        </Column>
      </ImageBackground>
    );
  }
  return (
    <ImageBackground
      style={styles.imageBackground}
      source={require("../../assets/bottomSheetBackground.png")}
    >
      <Column
        flex={1}
        style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
      >
        <Spacer height={22} />
        <Typography
          textAlign="center"
          type="Heading1"
          size={24}
          color={Colors.CANDOR_WHITE}
        >
          {`One \nTime Donation`}
        </Typography>
        <Spacer height={50} />
        <Row justifyContent="space-between" alignItems="center">
          {products.map((item, index) => {
            const active = activeIndex === index;
            return (
              <Pressable
                key={index}
                onPress={() => {
                  setActiveSubCard(item);
                  setActiveIndex(index);
                }}
                style={{ justifyContent: "center" }}
              >
                <Column
                  style={{
                    borderRadius: 9,
                    borderColor: active
                      ? Colors.CANDOR_BLUE
                      : Colors.CANDOR_GRAY,
                    borderWidth: 2,
                    marginTop: -getScreenResponsiveHeight(10),
                    zIndex: -1,
                  }}
                  height={123}
                  width={95}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Typography
                    size={12}
                    type="Paragraph4"
                    color={Colors.CANDOR_GRAY}
                  >
                    of
                  </Typography>
                  <Spacer height={3.5} />
                  <Typography
                    size={15}
                    type="Heading1"
                    color={Colors.CANDOR_WHITE}
                  >
                    {`${item?.localizedPrice}`}
                  </Typography>
                  <Spacer height={2} />
                  <Typography
                    size={12}
                    type="Paragraph4"
                    color={Colors.CANDOR_GRAY}
                  >
                    {`once`}
                  </Typography>
                </Column>
              </Pressable>
            );
          })}
        </Row>
        <Spacer height={24} />
        <Button
          height={45}
          color={Colors.CANDOR_BLUE}
          onPress={() => {
            IAP.requestPurchase({
              sku: activeSubCard?.productId,
              skus: [activeSubCard?.productId],
            });
          }}
          title="Donate to help pay our server cost"
        />
        <Spacer height={17} />
        <Row alignItems="center">
          <HorizontalLine />
          <Spacer width={34} />
          <Typography color={Colors.CANDOR_DARK_GRAY}>Or</Typography>
          <Spacer width={34} />
          <HorizontalLine />
        </Row>
        <Spacer height={17} />
        <Button
          height={45}
          onPress={showAd}
          color={Colors.CANDOR_DARK_GRAY}
          title="Watch an Ad to help pay our server cost"
        />

        <Spacer height={17} />
        <Typography
          textAlign="center"
          type="Paragraph6"
          color={Colors.CANDOR_WHITE}
        >
          Thank you so much for helping Candor continue to serve you with
          amazing anonymous contents
        </Typography>
      </Column>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    height: getScreenResponsiveHeight(509),
    width: "100%",
  },
});
