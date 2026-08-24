import { ReactElement, useState } from "react";
import { Card } from ".";
import { Column, Row } from "../main";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Image, Platform } from "react-native";

export const MessageCard = ({
  data,
  onChange = () => {},
}: any): ReactElement => {
  return (
    <Column
      style={{
        position: "relative",
        width: "100%",
        height: "auto",
      }}
    >
      <Card
        data={data}
        onChange={onChange}
        image={() => (
          <Image
            source={require("../../assets/ac.png")}
            style={{
              width: getScreenResponsiveWidth(
                Platform.OS == "ios" ? 122.93 : 132.93
              ),
              height: getScreenResponsiveHeight(38),
            }}
          />
        )}
      />
    </Column>
  );
};
