import React, { FC, ReactElement, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Row,
  Spacer,
  TouchableIcon,
  Typography,
} from "../../components";
import { Page } from "../../layouts";
import { Colors } from "../../theme";
import { getScreenResponsiveHeight } from "../../utils";
import { Public } from "./Public";
import { YourPoll } from "./YourPoll";
import { StatusBar } from "expo-status-bar";
import BackButton from "../../assets/svgs/Backbutton.svg";
import { Submit } from "../Home/Submit";

interface HomeProps {
  navigation: any;
}

export const Polls: FC<HomeProps> = ({ navigation }): ReactElement => {
  const [activeTab, setactiveTab] = useState(0);

  return (
    <Page backgroundColor={Colors.CANDOR_WHITE} dismissKeyboard keyboardAware>
      <StatusBar style="dark" />
      <Spacer height={20} />
      <Row width={"100%"} justifyContent={"space-between"}>
        <TouchableIcon
          onPress={() => {
            navigation.goBack();
          }}
        >
          <BackButton />
        </TouchableIcon>

        <Typography
          type="Heading1"
          textAlign="center"
          color={Colors.CANDOR_BLACK}
          size={27}
        >
          Post questionz
        </Typography>

        <View style={{ opacity: 0 }}>
          <BackButton />
        </View>
      </Row>

      <Spacer height={20} />
      <Row width={"100%"} justifyContent="space-evenly">
        <Button
          onPress={() => setactiveTab(0)}
          width={160}
          height={37}
          title="Submit"
          textStyle={{
            fontSize: 12,
          }}
          textColor={activeTab == 0 ? Colors.CANDOR_WHITE : Colors.CANDOR_WHITE}
          color={activeTab == 0 ? Colors.CANDOR_BLACK : Colors.CANDOR_GRAY}
        />
        {/* <Button
          onPress={() => setactiveTab(1)}
          width={95.78}
          height={37}
          title="Voting"
          textStyle={{
            fontSize: 12,
          }}
          textColor={activeTab == 1 ? Colors.CANDOR_WHITE : Colors.CANDOR_WHITE}
          color={activeTab == 1 ? Colors.CANDOR_BLACK : Colors.CANDOR_GRAY}
        /> */}
        <Button
          width={160}
          height={37}
          onPress={() => setactiveTab(2)}
          title="Submitted"
          textStyle={{
            fontSize: 12,
          }}
          textColor={activeTab == 2 ? Colors.CANDOR_WHITE : Colors.CANDOR_WHITE}
          color={activeTab == 2 ? Colors.CANDOR_BLACK : Colors.CANDOR_GRAY}
        />
      </Row>
      <Spacer height={20} />

      {activeTab == 0 ? (
        <Submit navigation={navigation} />
      ) : (
        // : activeTab == 1 ? (
        //   <Public navigation={navigation} submitPoll={() => setactiveTab(0)} />
        // ) :
        <YourPoll navigation={navigation} submitPoll={() => setactiveTab(0)} />
      )}
    </Page>
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
  center: {
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: Colors.CANDOR_WHITE,
    // paddingTop: 20,
  },
});
