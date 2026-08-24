import { ReactElement, useState } from "react";
import { Card } from ".";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Column, Row } from "../main";
import { Image } from "react-native";

export const ValsDayCard = ({
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
            source={require("../../assets/hsc.png")}
            style={{
              width: getScreenResponsiveWidth(165),
              height: getScreenResponsiveHeight(36),
            }}
          />
        )}
      />
    </Column>
  );
};
