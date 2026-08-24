import { useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserToken } from "../../context";
import { clearStorage } from "../../functions/storage";

export function useAuthentication() {
  let { userToken, setUserToken }: any = useContext(UserToken);
  useEffect((): any => {
    const unsubscribeFromAuthStatuChanged = async () => {
      const tok: any = await AsyncStorage.getItem("accessToken");
      if (tok != false) {
        setUserToken(tok);
      } else {
        clearStorage();
        setUserToken(false);
      }
    };
    unsubscribeFromAuthStatuChanged();
  }, []);
  return { userToken };
}
