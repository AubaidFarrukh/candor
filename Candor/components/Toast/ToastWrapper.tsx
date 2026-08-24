import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import { FC, ReactElement, useEffect, useRef, useState } from "react";
import { ToastContext } from "../../context";
import { Colors, FontSize, FontType } from "../../theme";
import InfoIcon from "../../Assets/svgs/info.svg";
import Animated, { EasingNode } from "react-native-reanimated";

export type IMessage = {
  type?: "ALERT" | "RETRY";
  message: string | null;
  duration?: number;
  action?: Function | null;
  intent?: string | any;
  isNotification?: boolean;
  title?: string | any;
};

export const ToastWrapper: FC<any> = ({
  children,
  data,
}: any): ReactElement => {
  const [messages, setMessages] = useState<any[]>([]);
  const animValue = useRef<any>(new Animated.Value(-300)).current;
  const animValueTwo = useRef<any>(new Animated.Value(-300)).current;
  const [current, setCurrent] = useState<IMessage | null>(null);

  const toast = ({
    message,
    type = "ALERT",
    duration = 2000,
    action = null,
    intent = "default",
    isNotification = false,
    title,
  }: IMessage) => {
    setMessages((prevState) => [
      ...prevState,
      {
        message,
        type,
        duration,
        action,
        intent,
        isNotification,
        title,
      },
    ]);
  };

  useEffect(() => {
    if (data) {
      // Alert.alert(data);
      toast(JSON.parse(data));
    }
  }, [data]);

  const openToast = ({ duration = 3000 }: IMessage) => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 200,
      easing: EasingNode.linear,
    }).start(() => {
      setTimeout(() => {
        setCurrent(null);
      }, duration);
    });
  };

  const openToast2 = ({ duration = 3000 }: IMessage) => {
    Animated.timing(animValueTwo, {
      toValue: 1,
      duration: 200,
      easing: EasingNode.linear,
    }).start(() => {
      setTimeout(() => {
        setCurrent(null);
      }, duration);
    });
  };

  const closeToast = () => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 200,
      easing: EasingNode.linear,
    }).start(() => {
      setMessages((prevState) => {
        return prevState.slice(1);
      });
    });
  };

  const closeToast2 = () => {
    Animated.timing(animValueTwo, {
      toValue: 0,
      duration: 200,
      easing: EasingNode.linear,
    }).start(() => {
      setMessages((prevState) => {
        return prevState.slice(1);
      });
    });
  };

  const toastPosition = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 30],
  });

  const toastPosition2 = animValueTwo.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 50],
  });

  useEffect(() => {
    if (messages.length > 0) {
      setCurrent(messages[0]);
    }
  }, [messages]);

  useEffect(() => {
    if (!!current) {
      if (current.isNotification == true) {
        openToast2(current);
      } else {
        openToast(current);
      }
    } else {
      closeToast();
      closeToast2();
    }
  }, [current]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Bottom */}
      <Animated.View
        style={{
          paddingVertical: 15,
          paddingHorizontal: 15,
          borderRadius: 15,
          backgroundColor:
            current?.intent == "success"
              ? Colors.CANDOR_GREEN
              : Colors.CANDOR_RED,
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          bottom: toastPosition,
          left: 20,
          right: 20,
          flexDirection: "row",
          minHeight: 70,
        }}
      >
        <Text
          style={{
            color:
              current?.intent == "success"
                ? Colors.CANDOR_BLACK
                : Colors.CANDOR_WHITE,
            flex: 1,
            fontSize: FontSize.PARAGRAPH2,
            fontFamily: FontType.REGULAR_FREDOKA,
            textAlign: "center",
          }}
        >
          {current?.message}
        </Text>
        {current?.action && (
          <TouchableOpacity
            onPress={() => {
              current?.action && current?.action();
              closeToast();
            }}
            style={{
              width: 67,
              height: 26,
              borderRadius: 30,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "flex-end",
            }}
          >
            <Text
              style={{
                fontFamily: FontType.REGULAR_FREDOKA,
                fontSize: 9,
                textAlign: "left",
                color: "black",
              }}
            >
              Try Again
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      <Animated.View
        style={{
          paddingVertical: 18,
          paddingHorizontal: 17,
          borderRadius: 15,
          backgroundColor: Colors.CANDOR_BLUE,
          alignItems: "center",
          position: "absolute",
          top: toastPosition2,
          left: 20,
          right: 20,
          flexDirection: "row",
        }}
      >
        <View style={{}}>
          <Text
            style={{
              color: "white",
              flex: 1,
              fontSize: 12,
              fontFamily: FontType.REGULAR_FREDOKA,
            }}
          >
            {current?.title}
          </Text>
          <Text
            style={{
              color: "white",
              flex: 1,
              fontSize: 12,
              fontFamily: FontType.REGULAR_FREDOKA,
              marginTop: -5,
            }}
          >
            {current?.message}
          </Text>
        </View>
      </Animated.View>
    </ToastContext.Provider>
  );
};
