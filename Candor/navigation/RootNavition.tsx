import AuthStack from "./authStack";
import UserStack from "./userStack";
import { useContext, useEffect, useState } from "react";
import {
  DonationationSubscriptionContext,
  ProSubscriptionContext,
  SnapChatLoginContext,
  UserProfile,
  UserToken,
} from "../context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearStorage } from "../functions/storage";
import { Loading } from "../screens/Home/Loading";
import { useMutation, useQuery } from "@apollo/client";
import {
  CHECK_IF_IS_SNAPCHAT_LOGGEDIN,
  CHECK_IF_USER_IS_PREMIUM,
  GET_CURRENT_VERSION_OF_APP,
} from "../graphQL/queries";
import { MARK_USER_AS_PAID } from "../graphQL/mutations";
import { Platform } from "react-native";
import * as IAP from "react-native-iap";
import { OutdatedVerstion } from "../screens/OutdatedVerstion";
import { APP_VERSION } from "../constants";

const items: any = Platform.select({
  ios: ["cd_399_1w", "cd_699_1m"],
  android: ["cd_pro_sub"],
});
export function RootNavigation() {
  const [loading, setLoading] = useState(true);
  const { userToken, setUserToken }: any = useContext(UserToken);
  const { userProfile, setUserProfile }: any = useContext(UserProfile);
  const { setIsPro }: any = useContext(ProSubscriptionContext);
  const { setIsDonated }: any = useContext(DonationationSubscriptionContext);
  const { setIsSnapLoggedIn }: any = useContext(SnapChatLoginContext);

  const [purchase, setPurchase] = useState<any>(null);
  const [MarkUserAsPaid] = useMutation(MARK_USER_AS_PAID, {
    async onCompleted(d) {
      await IAP.finishTransaction({ purchase });
      setIsPro(true);
      setLoading(false);
    },
    async onError(e) {
      console.log(e, "error");
      setLoading(false);
    },
  });

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

          setPurchase(filteredRes[filteredRes?.length - 1]);
          if (receipt) {
            if (Platform.OS === "ios") {
              MarkUserAsPaid({
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

  const { loading: userLoading } = useQuery(CHECK_IF_USER_IS_PREMIUM, {
    initialFetchPolicy: "network-only",
    variables: {
      userId: userProfile?._id,
    },
    onCompleted(data) {
      setIsPro(data?.User?.is_premium);
      setIsDonated(data?.User?.is_donated);
      if (data?.User?.was_premium) {
        setLoading(true);
        _restorePurchases();
      }
    },
  });

  const { data } = useQuery(GET_CURRENT_VERSION_OF_APP, {
    initialFetchPolicy: "network-only",
    variables: {
      userId: userProfile?._id,
    },
    onCompleted(data) {},
  });

  const { loading: snapLoading } = useQuery(CHECK_IF_IS_SNAPCHAT_LOGGEDIN, {
    initialFetchPolicy: "network-only",
    variables: {
      userId: userProfile?._id,
    },
    onCompleted(data) {
      setIsSnapLoggedIn(data?.User?.is_snap_logged_in);
      setUserProfile({
        ...userProfile,
        ...data?.User,
      });
    },
  });

  useEffect((): any => {
    const unsubscribeFromAuthStatuChanged = async () => {
      const tok: any = await AsyncStorage.getItem("accessToken");
      if (tok != false) {
        setUserToken(tok);
        setLoading(false);
      } else {
        clearStorage();
        setUserToken(false);
        setLoading(false);
      }
    };
    unsubscribeFromAuthStatuChanged();
  }, []);
  if (loading || userLoading || snapLoading) return <Loading />;
  if (data?.GetCurrentVersionOfApp?.json) {
    if (data?.GetCurrentVersionOfApp?.json?.version !== APP_VERSION) {
      return <OutdatedVerstion />;
    }
  }
  return userToken ? <UserStack /> : <AuthStack />;
}
