import { ReactElement, useContext } from "react";
import { Image, Keyboard, Platform, TextInput } from "react-native";
import { Colors, FontType, getHexColorOpacity } from "../../theme";
import {
  getScreenResponsiveWidth,
  getScreenResponsiveHeight,
} from "../../utils";
import { Column, Spacer, Typography, Row, Button } from "../main";
import { ProSubscriptionContext, UserProfile } from "../../context";
import { useQuery } from "@apollo/client";
import { GET_BLANK_CARD_AVAILABILITY } from "../../graphQL/queries";

export const BlankAudioCard = ({
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
  const blankAudioIsPro =
    !blankCard?.User?.is_blank_audio_card_enabled && !isPro;
  return (
    <Column alignItems="center" width={"100%"}>
      <Column height={290} width={290} style={{ borderRadius: 20 }}>
        <Column
          height={Platform.OS === "ios" ? 374 : 309}
          width={290}
          backgroundColor={Colors.CANDOR_RED}
          justifyContent={"space-between"}
          style={{
            borderRadius: 20,
            paddingHorizontal: getScreenResponsiveWidth(21),
            paddingVertical: getScreenResponsiveHeight(20),
          }}
        >
          <>
            {blankAudioIsPro && (
              <Button
                color={Colors.CANDOR_WHITE}
                width={56}
                height={24}
                style={{
                  borderRadius: 8,
                  position: "absolute",
                  top: 17,
                  right: 12,
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
                  color={Colors.CANDOR_BLACK}
                  size={14}
                >
                  Pro
                </Typography>
              </Button>
            )}
          </>
          <Column>
            <TextInput
              style={{
                fontFamily: FontType.REGULAR_ANTON,
                fontSize: 35,
                textAlign: "left",
                width: getScreenResponsiveWidth(200),
                color: Colors.CANDOR_WHITE,
              }}
              placeholder="Type here"
              placeholderTextColor={getHexColorOpacity(Colors.CANDOR_WHITE, 40)}
              multiline
              maxLength={56}
              onSubmitEditing={() => Keyboard.dismiss()}
              onChangeText={(txt: any) => {
                onChange(txt);
              }}
              value={value}
            />
          </Column>
          <Row alignItems="center" justifyContent="space-between">
            <Typography
              fontFamily={FontType.REGULAR_FREDOKA}
              type="Paragraph4"
              color={Colors.CANDOR_BLACK}
              style={{
                opacity: 0.5,
              }}
            >
              {`Audio \nResponses`}
            </Typography>
            <Image
              style={{
                width: getScreenResponsiveWidth(81),
                height: getScreenResponsiveHeight(24),
              }}
              source={require("../../assets/Logo.png")}
            />
          </Row>
        </Column>
      </Column>
      <Spacer height={10} />
    </Column>
  );
};
