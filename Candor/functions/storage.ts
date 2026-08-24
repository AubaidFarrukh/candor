import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async (value:string, arg:string) => {
  try {
    await AsyncStorage.setItem(arg, value);
  } catch (e) {
    return false;
  }
};

export const getData = async (arg:string) => {
  try {
    const value = await AsyncStorage.getItem(arg);
    if (value !== null) {
      return value;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

export const clearStorage = async () => {
  await AsyncStorage.clear();
};
