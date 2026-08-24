import { FC, ReactElement, useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  ImageBackground,
  Platform,
  ActivityIndicator,
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
  TouchableText,
  Typography,
} from "../../components";
import HorizontalLine from "../../assets/svgs/HorizontalLine.svg";
import { Screens } from "../../navigation";
import * as IAP from "react-native-iap";
import { useMutation } from "@apollo/client";
import { MARK_CARD_AS_PAID, MARK_CARD_ANDROID } from "../../graphQL/mutations";
import { ToastContext } from "../../context";
import ParsedText from "react-native-parsed-text";
import * as WebBrowser from "expo-web-browser";
import { countris } from "../../utils/countries";

interface ProCardProps {
  rbSheetRef: any;
  navigation: any;
  item: any;
  typeOfCard?: "pro" | "blank";
  onClose?: () => void;
  refetch?: () => void;
}

export const ProCard: FC<ProCardProps> = ({
  rbSheetRef,
  navigation,
  item,
  typeOfCard = "pro",
  onClose = () => {},
  refetch = () => {},
}): ReactElement => {
  const [product, setProduct] = useState<any>(null);
  const [purchase, setPurchase] = useState<any>(null);
  const { toast } = useContext<any>(ToastContext);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<any>(null);
  const [apiCountry, setapiCountry] = useState<any>(null);

  const lowIncomeCountries: any = countris.low;
  const midIncomeCountries: any = countris.mid;

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
          ios: ["cdpcr_199"],
          android: ["cdpcr_199"], //cdbc_499
        })
      ); // low
    } else if (midIncomeCountries.includes(apiCountry)) {
      setItems(
        Platform.select({
          ios: ["cdpcp_199"],
          android: ["cdpcp_199"],
        })
      ); // mid
    } else {
      setItems(
        Platform.select({
          ios: ["cdpcp_199"],
          android: ["cdpc_199"],
        })
      ); // high
    }
  }, [apiCountry]);

  const [MarkCardAsPaid] = useMutation(MARK_CARD_AS_PAID, {
    async onCompleted() {
      setLoading(false);
      await IAP.finishTransaction({ purchase });
      refetch();
      rbSheetRef?.current?.close();
      toast({ message: "Pro card purchase is successful", intent: "success" });
    },
    async onError(error) {
      setLoading(false);
    },
  });

  const [MarkCardAsPaidAndroid] = useMutation(MARK_CARD_ANDROID, {
    async onCompleted() {
      setLoading(false);
      // toast({ message: "Pro card purchase is successful", intent: "success" });
      await IAP.finishTransaction({ purchase });
      refetch();
    },
    async onError(error) {
      setLoading(false);
    },
  });

  const validate = async (receipt: any) => {
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
          console.log(r);
          if (r.result.error == -1) {
            // alert("Error There has been an error with your purchase");
            setLoading(false);
          } else if (r.result.isActiveSubscription) {
            //success
            MarkCardAsPaidAndroid({
              variables: {
                cardId: item?._id,
              },
            });
            onClose();
            // toast({ message: "Purchase successful" });
          } else {
            // alert("Error validating your purchase");
            setLoading(false);
          }
        });
      });
    } catch (error: any) {
      console.log("Error!", error?.message);
      // toast({ message: "Error validating your purchase" });
    }
  };
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
              console.log(JSON.stringify(res));
              const filtered: any[] = res?.filter((item: any) => {
                if (typeOfCard === "pro") {
                  return item?.name.includes("Pro");
                } else {
                  return item?.name.includes("Blank");
                }
              });

              let d1Obj = {
                countryCode: filtered[0]?.currency,
                currency: filtered[0]?.currency,
                description: "",
                discounts: [],
                introductoryPrice: "",
                introductoryPriceAsAmountIOS: "",
                introductoryPriceNumberOfPeriodsIOS: "",
                introductoryPricePaymentModeIOS: "",
                introductoryPriceSubscriptionPeriodIOS: "",
                localizedPrice: filtered[0]?.localizedPrice,
                platform: "android",
                price: Number(
                  filtered[0].oneTimePurchaseOfferDetails?.priceAmountMicros /
                    1000000
                ).toFixed(2),
                productId: filtered[0]?.productId,
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
          toast({
            message: error?.debugMessage,
          });

          purchaseErrorListener.remove();
        } else {
          onClose();
          toast({
            message:
              "There has been an error with your purchase, error code = " +
              error["code"],
          });
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
              MarkCardAsPaid({
                variables: {
                  cardId: item?._id,
                  appleReceipt: receipt,
                },
              });
            } else {
              validate(receipt);
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
  }, [items]);

  const purchaseCard = async () => {
    if (Platform.OS === "ios") {
      setLoading(true);
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
      setLoading(true);
      await IAP.requestPurchase({
        sku: product?.productId,
        skus: [product?.productId],
      });
    }
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
              MarkCardAsPaid({
                variables: {
                  cardId: item?._id,
                  appleReceipt: receipt,
                },
              });
            } else {
              MarkCardAsPaidAndroid({
                variables: {
                  cardId: item?._id,
                },
              });
            }
          }
        }
      });
  };

  if (!product) {
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
        alignItems="center"
      >
        <Spacer height={22} />
        <Typography
          textAlign="center"
          type="Heading1"
          color={Colors.CANDOR_WHITE}
        >
          {`Buy \nthis Pro Card`}
        </Typography>
        <Spacer height={15} />
        <Row>
          <Typography color={Colors.CANDOR_WHITE} lineHeight={40} size={30}>
            {product?.currency}
          </Typography>
          <Typography color={Colors.CANDOR_WHITE} lineHeight={111} size={100}>
            {Number(product?.price).toFixed(2)}
          </Typography>
        </Row>
        <Spacer height={15} />
        <Button
          height={45}
          color={Colors.CANDOR_BLUE}
          loading={loading}
          onPress={purchaseCard}
          title={"Buy for " + product?.price}
        />
        <Spacer height={15} />
        <TouchableText
          onPress={_restorePurchases}
          textAlign="center"
          color={Colors.CANDOR_WHITE}
        >
          Restore Purchases
        </TouchableText>
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
          onPress={() => {
            rbSheetRef.current?.close();
            navigation.navigate(Screens.PRO, { type: "Pro" });
          }}
          height={45}
          color={Colors.CANDOR_GRAY}
        >
          <Row alignItems="center">
            <Typography color={Colors.CANDOR_WHITE}>Candor</Typography>
            <Spacer width={5} />
            <Column
              width={45}
              height={24}
              style={{ borderRadius: 5 }}
              alignItems="center"
              justifyContent="center"
              backgroundColor={Colors.CANDOR_WHITE}
            >
              <Typography>Pro</Typography>
            </Column>
          </Row>
        </Button>
        <Spacer height={17} />
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    height: getScreenResponsiveHeight(509),
    width: "100%",
  },
});
