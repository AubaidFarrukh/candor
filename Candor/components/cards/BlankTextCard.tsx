import { ReactElement, useContext } from "react";
import { Image, Keyboard, Platform, TextInput } from "react-native";
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
import { ProSubscriptionContext, UserProfile } from "../../context";
import { GET_BLANK_CARD_AVAILABILITY } from "../../graphQL/queries";
import { useQuery } from "@apollo/client";

export const BlankTextCard = ({
  onChange = () => {},
  value = "",
}: any): ReactElement => {
  const { isPro }: any = useContext(ProSubscriptionContext);
  const { userProfile }: any = useContext(UserProfile);

  const { data: blankCard } = useQuery(GET_BLANK_CARD_AVAILABILITY, {
    fetchPolicy: "cache-and-network",
    variables: {
      userId: userProfile?._id,
    },
  });
  const blankTextIsPro = !blankCard?.User?.is_blank_text_card_enabled && !isPro;

  return (
    <Column alignItems="center" justifyContent="center" height={"100%"}>
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
            <Image
              source={require("../../assets/bc.png")}
              style={{
                width: getScreenResponsiveWidth(184.88),
                height: getScreenResponsiveHeight(32.93),
              }}
            />
          </Row>
          <Column
            height={"100%"}
            flex={1}
            justifyContent="center"
            alignItems="center"
          >
            <TextInput
              style={{
                fontFamily: FontType.REGULAR_SECULAR,
                fontSize: 18,
                textAlign: "center",
                width: "100%",
                color: Colors.CANDOR_BLACK,
                height: "auto",
                // backgroundColor: "red",
                maxHeight: getScreenResponsiveHeight(150),
              }}
              textAlign="center"
              placeholder="Type here"
              maxLength={60}
              onSubmitEditing={() => Keyboard.dismiss()}
              multiline
              onChangeText={(txt: any) => {
                onChange(txt);
              }}
              value={value}
            />
          </Column>
        </Column>
      </Column>
      <Spacer height={30} />
      {/* <>
        {blankTextIsPro && (
          <Button
            color={getHexColorOpacity(Colors.CANDOR_BLACK, 50)}
            width={62}
            height={30}
            disabled
            style={{
              borderRadius: 17.5,
              opacity: 1,
              position: "absolute",
              bottom: getScreenResponsiveHeight(Platform.OS == "ios" ? 30 : 45),
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
      </> */}
    </Column>
  );
};
