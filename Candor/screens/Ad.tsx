import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  NativeModules,
  Button,
  Platform,
  Alert,
} from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";

const slides = [
  {
    key: 1,
    title: "Title 1",
    text: "Description.\nSay something cool",
    backgroundColor: "#59b2ab",
  },
  {
    key: 2,
    title: "Title 2",
    text: "Other cool stuff",
    backgroundColor: "#febe29",
  },
  {
    key: 3,
    title: "Rocket guy",
    text: "I'm already out of descriptions\n\nLorem ipsum bla bla bla",
    backgroundColor: "#22bcb5",
  },
  {
    key: 4,
    title: "Rocket guy",
    text: "I'm already out of descriptions\n\nLorem ipsum bla bla bla",
    backgroundColor: "#22bcb5",
  },
  {
    key: 5,
    title: "Rocket guy",
    text: "I'm already out of descriptions\n\nLorem ipsum bla bla bla",
    backgroundColor: "#22bcb5",
  },
  {
    key: 6,
    title: "Rocket guy",
    text: "I'm already out of descriptions\n\nLorem ipsum bla bla bla",
    backgroundColor: "#22bcb5",
  },
  {
    key: 7,
    title: "Title 1",
    text: "Description.\nSay something cool",
    backgroundColor: "#59b2ab",
  },
  {
    key: 8,
    title: "Title 2",
    text: "Other cool stuff",
    backgroundColor: "#febe29",
  },
  {
    key: 9,
    title: "Rocket guy",
    text: "I'm already out of descriptions\n\nLorem ipsum bla bla bla",
    backgroundColor: "#22bcb5",
  },
  {
    key: 10,
    title: "Rocket guy",
    text: "I'm already out of descriptions\n\nLorem ipsum bla bla bla",
    backgroundColor: "#22bcb5",
  },
  {
    key: 11,
    title: "Rocket guy",
    text: "I'm already out of descriptions\n\nLorem ipsum bla bla bla",
    backgroundColor: "#22bcb5",
  },
  {
    key: 12,
    title: "Rocket guy",
    text: "I'm already out of descriptions\n\nLorem ipsum bla bla bla",
    backgroundColor: "#22bcb5",
  },
];

export default function Ad() {
  const _renderItem = ({ item }: any) => {
    return (
      <View
        style={{
          width: "100%",
          height: 200,
          backgroundColor: item.backgroundColor,
        }}
      >
        <Text>{item.title}</Text>
        <Text>{item.text}</Text>
      </View>
    );
  };
  const _onDone = () => {};

  return (
    // <View style={styles.container}>
    <AppIntroSlider
      onSlideChange={(index: any) => {
        console.log(index);
      }}
      renderItem={_renderItem}
      data={slides}
      onDone={_onDone}
    />
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
