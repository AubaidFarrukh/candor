import {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { StyleSheet, ImageBackground, AppState } from "react-native";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Colors, FontType } from "../../theme";
import { Button, Column, Row, Spacer, Typography } from "../../components";
import HorizontalLine from "../../assets/svgs/HorizontalLine.svg";
import Lottie from "lottie-react-native";
import Sound from "react-native-sound";
import { useFocusEffect } from "@react-navigation/native";

interface RevenueShareProps {
  navigation: any;
  onClose: () => {};
  item: any;
  audio?: any;
}

export const WhoSentThis: FC<RevenueShareProps> = ({
  navigation,
  onClose,
  item,
  audio,
}): ReactElement => {
  let data: any;
  try {
    data = JSON.parse(item?.country_name);
  } catch (err) {}

  const animationRef = useRef<Lottie>(null);
  const [isPlaying, setisPlaying] = useState<any>(false);
  const appState = useRef(AppState.currentState);

  const [sound1, setsound1] = useState<any>({
    sound1: null,
  });

  function delay(time: any) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  useEffect(() => {
    Sound.setCategory("Playback", true);

    return () => {
      if (sound1.sound1) {
        sound1.sound1.release();
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        sound1.sound1?.stop(() => {
          console.log("Stop");
          setisPlaying(false);
          animationRef.current?.reset();
        });
      };
    }, [navigation])
  );

  function killAudio() {
    sound1.sound1?.stop(() => {
      console.log("Stop");
      setisPlaying(false);
      animationRef.current?.reset();
    });
  }

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
      } else {
        killAudio();
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const playSound = () => {
    sound1.sound1 = new Sound(item?.additional_audio, "", (error: any) => {
      if (error) {
        alert("error" + error.message);
        setisPlaying(false);
        return;
      }
      sound1.sound1.play(() => {
        sound1.sound1.release();
        setisPlaying(false);
        animationRef.current?.reset();
      });
      animationRef.current?.play();
      setisPlaying(true);
    });
    return;
  };

  const stopSound = () => {
    if (sound1.sound1) {
      sound1.sound1.stop(() => {
        console.log("Stop");
        setisPlaying(false);
        animationRef.current?.reset();
      });
    } else {
      alert("Not set");
    }
  };

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
        <Spacer height={32} />
        <Typography
          textAlign="center"
          type="Heading1"
          color={Colors.CANDOR_WHITE}
        >
          {`Who sent this👀`}
        </Typography>
        <Spacer height={20} />

        <Column
          width="100%"
          backgroundColor={Colors.CANDOR_DARK_GRAY}
          style={{
            paddingHorizontal: getScreenResponsiveWidth(22),
            paddingVertical: getScreenResponsiveHeight(20),
            borderRadius: 20,
          }}
        >
          <Typography
            color={Colors.CANDOR_GRAY}
            fontFamily={FontType.REGULAR_FREDOKA}
            size={14}
            lineHeight={14}
            style={{
              display: item?.ip_address ? "flex" : "none",
            }}
          >
            IP Address:{" "}
            <Typography
              color={Colors.CANDOR_WHITE}
              fontFamily={FontType.REGULAR_FREDOKA}
            >
              {item?.ip_address}
            </Typography>
          </Typography>
          <Typography
            color={Colors.CANDOR_GRAY}
            fontFamily={FontType.REGULAR_FREDOKA}
            size={14}
            lineHeight={14}
            style={{
              display: item?.browser_name ? "flex" : "none",
            }}
          >
            Browser name:{" "}
            <Typography
              color={Colors.CANDOR_WHITE}
              fontFamily={FontType.REGULAR_FREDOKA}
            >
              {item?.browser_name}
            </Typography>
          </Typography>
          <Typography
            color={Colors.CANDOR_GRAY}
            fontFamily={FontType.REGULAR_FREDOKA}
            size={14}
            lineHeight={14}
            style={{
              display: item?.network_provider ? "flex" : "none",
            }}
          >
            Network Provider{" "}
            <Typography
              color={Colors.CANDOR_WHITE}
              fontFamily={FontType.REGULAR_FREDOKA}
            >
              {item?.network_provider}
            </Typography>
          </Typography>
        </Column>
        <Spacer height={15} />
        <Column
          width="100%"
          backgroundColor={Colors.CANDOR_DARK_GRAY}
          style={{
            paddingHorizontal: getScreenResponsiveWidth(22),
            paddingVertical: getScreenResponsiveHeight(20),

            borderRadius: 20,
          }}
        >
          <Typography
            color={Colors.CANDOR_GRAY}
            fontFamily={FontType.REGULAR_FREDOKA}
            size={14}
            lineHeight={14}
            style={{
              display: data?.city ? "flex" : "none",
            }}
          >
            City:{" "}
            <Typography
              color={Colors.CANDOR_WHITE}
              fontFamily={FontType.REGULAR_FREDOKA}
            >
              {data?.city}
            </Typography>
          </Typography>
          <Typography
            color={Colors.CANDOR_GRAY}
            fontFamily={FontType.REGULAR_FREDOKA}
            size={14}
            lineHeight={14}
            style={{
              display: item?.approx_location ? "flex" : "none",
            }}
          >
            Region:{" "}
            <Typography
              color={Colors.CANDOR_WHITE}
              fontFamily={FontType.REGULAR_FREDOKA}
            >
              {item?.approx_location}
            </Typography>
          </Typography>
          <Typography
            color={Colors.CANDOR_GRAY}
            fontFamily={FontType.REGULAR_FREDOKA}
            size={14}
            lineHeight={14}
            style={{
              display: data?.country ? "flex" : "none",
            }}
          >
            Country:{" "}
            <Typography
              color={Colors.CANDOR_WHITE}
              fontFamily={FontType.REGULAR_FREDOKA}
            >
              {data?.country}
            </Typography>
          </Typography>
          <Typography
            color={Colors.CANDOR_GRAY}
            fontFamily={FontType.REGULAR_FREDOKA}
            size={14}
            lineHeight={14}
            style={{
              display: data?.loc ? "flex" : "none",
            }}
          >
            Location:{" "}
            <Typography
              color={Colors.CANDOR_WHITE}
              fontFamily={FontType.REGULAR_FREDOKA}
            >
              {data?.loc}
            </Typography>
          </Typography>
          <Typography
            color={Colors.CANDOR_GRAY}
            fontFamily={FontType.REGULAR_FREDOKA}
            size={14}
            lineHeight={14}
            style={{
              display: item?.postal ? "flex" : "none",
            }}
          >
            Postal:{" "}
            <Typography
              color={Colors.CANDOR_WHITE}
              fontFamily={FontType.REGULAR_FREDOKA}
            >
              {item?.postal}
            </Typography>
          </Typography>
          <Typography
            color={Colors.CANDOR_GRAY}
            fontFamily={FontType.REGULAR_FREDOKA}
            size={14}
            lineHeight={14}
            style={{
              display: data?.timezone ? "flex" : "none",
            }}
          >
            Timezone:{" "}
            <Typography
              color={Colors.CANDOR_WHITE}
              fontFamily={FontType.REGULAR_FREDOKA}
            >
              {data?.timezone}
            </Typography>
          </Typography>
        </Column>
        <Spacer height={15} />
        <Column
          width="100%"
          //   height={100}
          backgroundColor={Colors.CANDOR_DARK_GRAY}
          style={{
            paddingHorizontal: getScreenResponsiveWidth(22),
            paddingVertical: getScreenResponsiveHeight(20),
            // paddingBottom: getScreenResponsiveHeight(20),
            borderRadius: 20,
            display: item?.hints ? "flex" : "none",
          }}
        >
          <Typography
            color={Colors.CANDOR_GRAY}
            fontFamily={FontType.REGULAR_FREDOKA}
            size={14}
            lineHeight={14}
          >
            Hint:{" "}
            <Typography
              color={Colors.CANDOR_WHITE}
              fontFamily={FontType.REGULAR_FREDOKA}
            >
              {item?.hints}
            </Typography>
          </Typography>
        </Column>
        {/* <Spacer height={15} /> */}
        {item?.additional_audio ? (
          <Column
            width="100%"
            // height={100}
            backgroundColor={Colors.CANDOR_DARK_GRAY}
            style={{
              paddingHorizontal: getScreenResponsiveWidth(22),
              paddingVertical: getScreenResponsiveHeight(20),
              // paddingBottom: getScreenResponsiveHeight(20),
              borderRadius: 20,
              display: item?.card?.response_type === "audio" ? "flex" : "none",
            }}
          >
            <Row
              width={275}
              height={86}
              backgroundColor={Colors.CANDOR_BLUE}
              style={{
                borderRadius: 16,
              }}
              alignItems="center"
              justifyContent="center"
            >
              <Lottie
                ref={animationRef}
                source={require("../../assets/waveblue.json")}
                loop
                style={{
                  width: getScreenResponsiveWidth(245),
                }}
              />
              <Row
                width={"100%"}
                justifyContent="center"
                style={{
                  position: "absolute",
                  bottom: -19,
                }}
              >
                <Button
                  onPress={async () => {
                    if (isPlaying) {
                      stopSound();
                    } else {
                      playSound();
                    }
                  }}
                  title={isPlaying ? "Stop" : "Play"}
                  width={88}
                  height={37}
                />
              </Row>
            </Row>
          </Column>
        ) : (
          <></>
        )}
        <Spacer height={15} />
        <Button
          height={45}
          color={Colors.CANDOR_BLUE}
          title="Done"
          onPress={onClose}
        />
        <Spacer height={17} />
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
