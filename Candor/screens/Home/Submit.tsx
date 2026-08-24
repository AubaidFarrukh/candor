import { ReactElement, useState, useContext } from "react";
import {
  StyleSheet,
  View,
  Modal,
  TextInput,
  Dimensions,
  Keyboard,
  Platform,
} from "react-native";
import {
  Button,
  Column,
  Row,
  Spacer,
  TouchableIcon,
  Typography,
} from "../../components";
import { Colors, FontType } from "../../theme";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Page } from "../../layouts";
import BackButton from "../../assets/svgs/Backbutton.svg";
import { CREATE_POLL } from "../../graphQL/mutations";
import { useMutation } from "@apollo/client";
import { Screens } from "../../navigation";
import { ToastContext } from "../../context";
import { ScrollView } from "react-native-gesture-handler";

const { width } = Dimensions.get("screen");
export const Submit = ({ navigation }: any): ReactElement => {
  const { toast } = useContext<any>(ToastContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [premium, setPremium] = useState(false);
  const [payload, setpayload] = useState<string | any>({
    question: null,
    name: null,
  });

  const [CreatePoll, { loading }] = useMutation(CREATE_POLL, {
    onCompleted() {
      setModalVisible(false);
      setpayload({ question: null, name: null });
      toast({
        message: `📝\nYour poll has successfully uploaded, we\nwill update you when it goes live in the app`,
        intent: "success",
      });
    },
    onError(error) {
      toast({ message: error.message });
    },
  });

  const handleSignup = (type: boolean) => {
    CreatePoll({
      variables: {
        text: payload.question?.trim(),
        bragName: payload.name?.trim(),
        isPremium: type,
      },
    });
  };

  const disable = !payload.question;

  return (
    <>
      <Column
        width={"100%"}
        height={"100%"}
        style={{}}
        justifyContent="flex-start"
      >
        <Column
          width={"100%"}
          height={240}
          backgroundColor={Colors.CANDOR_BLUE}
          style={{
            borderRadius: 20,
            overflow: "hidden",
            paddingHorizontal: 27,
            paddingVertical: 22,
          }}
          justifyContent="flex-start"
        >
          <Row width={"100%"} alignItems="center">
            <Typography
              fontFamily={FontType.REGULAR_FREDOKA}
              type="Heading1"
              textAlign="left"
              size={27}
              color={Colors.CANDOR_WHITE}
            >
              Submit a question
            </Typography>
          </Row>
          <Spacer height={10} />
          <TextInput
            style={{
              fontFamily: FontType.REGULAR_FREDOKA,
              fontSize: 18,
              color: Colors.CANDOR_WHITE,
              height: 50,
            }}
            multiline
            maxLength={50}
            onSubmitEditing={() => Keyboard.dismiss()}
            textAlignVertical="top"
            placeholder="Type your question"
            placeholderTextColor={"#67BCFF"}
            returnKeyType="done"
            onChangeText={(text) => setpayload({ ...payload, question: text })}
            value={payload.question}
          />
        </Column>
        <Spacer height={20} />
        <Column
          width={"100%"}
          height={108}
          backgroundColor={Colors.CANDOR_BLUE}
          style={{
            borderRadius: 20,
            overflow: "hidden",
            paddingHorizontal: 27,
            paddingVertical: 22,
          }}
          justifyContent="flex-start"
        >
          <Row width={"100%"} alignItems="center">
            <Typography
              fontFamily={FontType.REGULAR_FREDOKA}
              type="Heading1"
              textAlign="left"
              size={27}
              color={Colors.CANDOR_WHITE}
            >
              Bragging name
            </Typography>
          </Row>
          <Spacer height={10} />
          <TextInput
            style={{
              fontFamily: FontType.REGULAR_FREDOKA,
              fontSize: 14,
              color: Colors.CANDOR_WHITE,
              height: 30,
            }}
            textAlignVertical="top"
            onSubmitEditing={() => Keyboard.dismiss()}
            maxLength={15}
            placeholder="Add your name for bragging rights"
            placeholderTextColor={"#67BCFF"}
            returnKeyType="done"
            onChangeText={(text: any) => setpayload({ ...payload, name: text })}
            value={payload.name}
          />
        </Column>
        <Spacer height={33} />
        <Column>
          <Typography
            lineHeight={18}
            size={13}
            color={Colors.CANDOR_GRAY}
            textAlign="center"
          >
            {`If you have an interesting question you would like to see featured in the app, please submit it here to get the bragging right when it goes live in the app\n👇`}
          </Typography>
          <Spacer height={40} />
          <Button
            color={Colors.CANDOR_BLACK}
            onPress={() => {
              setPremium(false);
              handleSignup(false);
            }}
            disabled={disable}
            title="Submit this question"
            loading={!premium && loading}
          />
          {/* <Button
                    onPress={() => {
                      setPremium(true);
                      handleSignup(true);
                    }}
                    disabled={disable}
                    color={Colors.CANDOR_BLACK}
                    title="Submit and earn cash"
                    loading={premium && loading}
                  />
                  <Spacer height={13} />
                  <Typography
                    lineHeight={17}
                    size={13}
                    color={Colors.CANDOR_GRAY}
                    textAlign="center"
                  >
                    {`👆\nSubmit a premium poll question and receive \n50% revenue share when anyone unlocks it.`}
                  </Typography> */}
        </Column>
      </Column>
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.CANDOR_RED,
    width: getScreenResponsiveHeight(30),
    height: getScreenResponsiveHeight(30),
    alignSelf: "flex-end",
    borderRadius: 100,
    borderColor: Colors.CANDOR_BLACK,
    borderWidth: 3,
    marginBottom: -20,
    zIndex: 1,
  },
});
