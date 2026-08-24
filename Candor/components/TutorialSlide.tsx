import { ReactElement, useState, useContext, useRef, FC } from "react";
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { Button, Column, Row, Spacer, Typography } from "../components";
import { Colors } from "../theme";
import { getScreenResponsiveHeight, getScreenResponsiveWidth } from "../utils";
import Swiper from "react-native-swiper";
import { LinearGradient } from "expo-linear-gradient";
import ViewShot from "react-native-view-shot";

interface TutorialSlideProps {
  shareFn?: (a: any) => void;
  card?: any;
  instragramLoader: boolean;
}

export const TutorialSlide: FC<TutorialSlideProps> = ({
  shareFn,
  card,
  instragramLoader,
}): ReactElement => {
  console.log(card);
  const slider = useRef<any>();

  const tutorial = [
    {
      text: "Click the button",
      image: require("../assets/Instagram1.png"),
      last: false,
    },
    {
      text: "Click the button",
      image: require("../assets/Instagram2.png"),
      last: false,
    },
    {
      text: "Paste your link",
      image: require("../assets/Instagram3.png"),
      last: true,
    },
  ];

  return (
    <Swiper
      ref={slider}
      loop={false}
      showsPagination={false}
      width={getScreenResponsiveWidth(375)}
    >
      {tutorial.map((item, index) => {
        return (
          <View key={index}>
            <TutorialItem
              card={card}
              index={index}
              item={item}
              instragramLoader={instragramLoader}
              onShare={shareFn}
              onPress={() => {
                slider.current.scrollBy(1, true);
              }}
              onBack={() => {
                slider.current.scrollBy(-1, true);
              }}
            />
          </View>
        );
      })}
    </Swiper>
  );
};

const TutorialItem = ({
  item,
  index,
  onPress,
  onBack,
  onShare,
  card,
  instragramLoader,
}: any) => {
  console.log(card);
  const picture = useRef<any>();
  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: getScreenResponsiveWidth(28),
      }}
    >
      <Typography color={Colors.CANDOR_BLACK} textAlign="center" size={14}>
        How to add a Link on IG story
      </Typography>
      <Spacer height={2} />
      <Typography type="Heading1" textAlign="center" size={27}>
        {item?.text}
      </Typography>
      <Spacer height={15} />
      <Image
        source={item?.image}
        style={{
          width: "100%",
          height: getScreenResponsiveHeight(148),
          backgroundColor: Colors.CANDOR_GRAY,
          borderRadius: 20,
          alignSelf: "center",
        }}
      />
      <Spacer height={15} />
      {item?.last ? (
        <TouchableOpacity
          onPress={() => {
            picture.current.capture().then(async (uri: any) => {
              onShare(uri);
            });
          }}
          style={{
            borderRadius: 50,
            borderColor: Colors.CANDOR_BLACK,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 4,
          }}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={["#F0B853", "#D635AE"]}
            style={{
              height: getScreenResponsiveHeight(62),
              width: "100%",
              borderRadius: 50,
              borderColor: Colors.CANDOR_BLACK,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {instragramLoader ? (
              <ActivityIndicator color={Colors.CANDOR_WHITE} size={"small"} />
            ) : (
              <Typography
                color={Colors.CANDOR_WHITE}
                textAlign="center"
                size={14}
              >
                Share on Instagram
              </Typography>
            )}
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <Button color={Colors.CANDOR_BLUE} onPress={onPress} title="Next" />
      )}
      <Spacer height={10} />
      {index !== 0 && (
        <Button
          color={"rgba(0,0,0,0)"}
          onPress={onBack}
          title="Go Back"
          height={20}
          textColor={Colors.CANDOR_GRAY}
          textStyle={{
            fontSize: 14,
          }}
        />
      )}

      <Spacer height={50}></Spacer>
      <ViewShot
        ref={picture}
        options={{
          fileName: "answerCardImage",
          format: "png",
          quality: 0.9,
        }}
      >
        <View
          style={{
            width: "100%",
            paddingHorizontal: getScreenResponsiveWidth(28),
            paddingTop: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            color={Colors.CANDOR_WHITE}
            textAlign="center"
            size={37}
            style={{
              textShadowColor: Colors.CANDOR_BLACK,
              textShadowRadius: 5,
              lineHeight: 50,
              width: "100%",
            }}
          >
            {card?.caption_text}
          </Typography>
          <Typography
            color={Colors.CANDOR_WHITE}
            textAlign="center"
            size={14}
            style={{
              textShadowColor: Colors.CANDOR_BLACK,
              textShadowRadius: 5,
            }}
          >
            Anonymous Inbox
          </Typography>
          <Spacer height={0} />
          <Image
            source={require("../assets/link.png")}
            style={{
              transform: [{ scale: 0.5 }],
            }}
          />
        </View>
      </ViewShot>
    </View>
  );
};
