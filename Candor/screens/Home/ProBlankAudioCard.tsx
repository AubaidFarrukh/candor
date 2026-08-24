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
import { ToastContext } from "../../context";
import {
  MARK_AUDIO_BLANK_CARD_AS_PAID,
  MARK_CHAT_WITH_ME_PRO_AS_PAID,
} from "../../graphQL/mutations";
import * as WebBrowser from "expo-web-browser";
import ParsedText from "react-native-parsed-text";
import { countris } from "../../utils/countries";

interface ProBlankAudioCardProps {
  rbSheetRef: any;
  navigation: any;
  item: any;
  onClose: () => void;
  refetchBlankCardAvailability: () => void;
}

// const items: any = Platform.select({
//   ios: ["cdbac_499"],
// });

export const ProBlankAudioCard: FC<ProBlankAudioCardProps> = ({
  rbSheetRef,
  navigation,
  onClose,
  refetchBlankCardAvailability,
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
          ios: ["cdcwmp_499"],
          android: ["cdbacr_499"],
        })
      ); // low
    } else if (midIncomeCountries.includes(apiCountry)) {
      setItems(
        Platform.select({
          ios: ["cdcwmp_499"],
          android: ["cdbacp_499"],
        })
      ); // mid
    } else {
      setItems(
        Platform.select({
          ios: ["cdcwmp_499"],
          android: ["cdbac_499"],
        })
      ); // high
    }
  }, [apiCountry]);

  const [MarkCardAsPaid] = useMutation(MARK_CHAT_WITH_ME_PRO_AS_PAID, {
    async onCompleted(d) {
      setLoading(false);
      await IAP.finishTransaction({ purchase });
      refetchBlankCardAvailability();
      onClose();
    },
    async onError(error) {
      console.log(error);
      setLoading(false);
    },
  });

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

              const filtered: any[] = res?.filter((item: any) => {});
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
                  appleReceipt: receipt,
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
                  appleReceipt: receipt,
                },
              });
            } else {
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
          {`Buy \nChatWithMe Pro`}
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
          title={"Buy for " + product?.price + ", valid for 7 days"}
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
