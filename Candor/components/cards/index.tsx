import { ReactElement, useContext, useState } from "react";
import { Image, Platform } from "react-native";
import { Colors, FontType, getHexColorOpacity } from "../../theme";
import {
  getScreenResponsiveWidth,
  getScreenResponsiveHeight,
} from "../../utils";
import {
  Column,
  Spacer,
  Typography,
  Row,
  Button,
  TouchableIcon,
} from "../main";
import { ProSubscriptionContext } from "../../context";

export const Card = ({
  data,
  onChange = () => {},
  image,
}: any): ReactElement => {
  const [currIndex, setCurrIndex] = useState<any>(0);

  const { isPro: subscribed }: any = useContext(ProSubscriptionContext);

  const currCard = data[currIndex];

  const isPro =
    currCard?.is_premium &&
    subscribed === false &&
    currCard?.is_premium &&
    currCard?.isPurchased === false;
  return (
    <>
      {data?.length > 0 ? (
        <Column
          style={{
            display: data.length > 0 ? "flex" : "none",
          }}
          alignItems="center"
          justifyContent="center"
          height={"100%"}
          // backgroundColor="red"
        >
          <Column
            alignItems="center"
            justifyContent="center"
            height={125}
            width={290}
            style={{
              position: "relative",
              width: "100%",
              borderRadius: 20,
            }}
          >
            <Row
              height={115}
              width={280}
              backgroundColor={"#000"}
              style={{
                borderRadius: 20,
                position: "absolute",
                top: 25,
                // right: 0,
              }}
            />
            <Column
              height={125}
              width={290}
              backgroundColor={Colors.CANDOR_WHITE}
              justifyContent={"space-between"}
              style={{
                borderRadius: 20,
                paddingHorizontal: getScreenResponsiveWidth(21),
                paddingVertical: getScreenResponsiveHeight(20),
                borderWidth: 3,
                borderColor: Colors.CANDOR_BLACK,
              }}
            >
              <Row
                width={290}
                justifyContent="center"
                alignItems="center"
                style={{
                  position: "absolute",
                  top: getScreenResponsiveHeight(-19),
                }}
              >
                {image ? image() : null}
              </Row>
              <Spacer height={8} />

              <Column
                height={"100%"}
                width={"100%"}
                justifyContent="center"
                alignItems="center"
              >
                <Typography
                  fontFamily={FontType.REGULAR_SECULAR}
                  lineHeight={18}
                  color={Colors.CANDOR_BLACK}
                  textAlign={"center"}
                  size={16}
                  style={{ width: getScreenResponsiveWidth(200) }}
                >
                  {data[currIndex]?.caption_text}
                </Typography>
                {/* <Typography
                  fontFamily={FontType.REGULAR_FREDOKA}
                  color={data[currIndex]?.text_color || Colors.CANDOR_BLACK}
                >
                  {data[currIndex]?.description}
                </Typography> */}
              </Column>
            </Column>
          </Column>
          {data?.length >= 1 ? (
            <TouchableIcon
              style={{
                opacity: data?.length == 1 ? 0 : 1,
                marginTop: getScreenResponsiveHeight(-10),
              }}
              onPress={() => {
                if (currIndex == data?.length - 1) {
                  setCurrIndex(0);
                  onChange(data[0]);
                  return;
                }
                onChange(data[currIndex + 1]);
                setCurrIndex(currIndex + 1);
              }}
            >
              <Image
                style={{
                  width: getScreenResponsiveWidth(33),
                  height: getScreenResponsiveHeight(33),
                }}
                source={require("../../assets/Dice.png")}
              />
            </TouchableIcon>
          ) : (
            <></>
          )}
          <>
            {isPro && (
              <Button
                color={getHexColorOpacity(Colors.CANDOR_BLACK, 50)}
                width={62}
                height={30}
                disabled
                style={{
                  borderRadius: 17.5,
                  opacity: 1,
                  display: data[currIndex]?.is_premium ? "flex" : "none",
                  bottom: getScreenResponsiveHeight(
                    Platform.OS == "ios" ? 30 : 45
                  ),
                  position: "absolute",
                }}
              >
                <Image
                  style={{
                    width: 13,
                    height: 16,
                  }}
                  source={require("../../assets/lock.png")}
                />
                <Spacer width={3} />
                <Typography
                  fontFamily={FontType.REGULAR_FREDOKA}
                  color={Colors.CANDOR_WHITE}
                  size={10}
                >
                  Pro
                </Typography>
              </Button>
            )}
          </>
        </Column>
      ) : null}
    </>
  );
};
