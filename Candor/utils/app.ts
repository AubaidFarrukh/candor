import Constants from "expo-constants";
import { Linking, Platform } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";

export const showOnly = (maxText: number, input: string) =>
  input.length > maxText ? `${input.substring(0, maxText)}...` : input;

const pkg = Constants?.manifest?.releaseChannel
  ? Constants?.manifest?.android?.package
  : "host.exp.exponent";

export const openAppSettings = async () => {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:");
  } else {
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
      { data: "package:" + pkg }
    );
  }
};
