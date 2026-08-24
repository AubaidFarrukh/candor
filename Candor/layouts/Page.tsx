import { FC, ReactElement } from "react";
import { Keyboard, StyleSheet, ViewStyle, View, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../theme";
import { getScreenResponsiveWidth } from "../utils";
import { StatusBar } from "expo-status-bar";

interface PageProps {
  children?: ReactElement | ReactElement[];
  keyboardAware?: boolean;
  style?: ViewStyle;
  dismissKeyboard?: boolean;
  safeAreaView?: boolean;
  backgroundColor?: string;
}

export const Page: FC<PageProps> = ({
  children,
  keyboardAware,
  style,
  safeAreaView = true,
  dismissKeyboard,
  backgroundColor = Colors.CANDOR_WHITE,
}): ReactElement => {
  if (dismissKeyboard)
    return (
      <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
        <StatusBar style="dark" />
        {safeAreaView ? (
          <SafeAreaView
            style={{ ...style, ...styles.container, backgroundColor }}
            edges={["top"]}
          >
            {keyboardAware ? (
              <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                resetScrollToCoords={{ x: 0, y: 0 }}
                scrollEnabled={false}
              >
                {children}
              </KeyboardAwareScrollView>
            ) : (
              children
            )}
          </SafeAreaView>
        ) : (
          <View style={{ ...styles.container, backgroundColor, ...style }}>
            {keyboardAware ? (
              <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                resetScrollToCoords={{ x: 0, y: 0 }}
                scrollEnabled={false}
                extraHeight={30}
              >
                {children}
              </KeyboardAwareScrollView>
            ) : (
              children
            )}
          </View>
        )}
      </Pressable>
    );

  return (
    <>
      {safeAreaView ? (
        <SafeAreaView
          style={{ ...styles.container, backgroundColor, ...style }}
          edges={["top"]}
        >
          {keyboardAware ? (
            <KeyboardAwareScrollView
              resetScrollToCoords={{ x: 0, y: 0 }}
              scrollEnabled={false}
            >
              {children}
            </KeyboardAwareScrollView>
          ) : (
            children
          )}
        </SafeAreaView>
      ) : (
        <View style={{ ...styles.container, backgroundColor, ...style }}>
          {keyboardAware ? (
            <KeyboardAwareScrollView
              resetScrollToCoords={{ x: 0, y: 0 }}
              scrollEnabled={false}
            >
              {children}
            </KeyboardAwareScrollView>
          ) : (
            children
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: getScreenResponsiveWidth(20),
    flex: 1,
    backgroundColor: Colors.CANDOR_WHITE,
  },
});
