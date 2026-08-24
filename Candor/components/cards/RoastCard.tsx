import { ReactElement, useState } from "react";
import { Card } from ".";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Column, Row } from "../main";
import { Image } from "react-native";

export const RoastCard = ({ data, onChange = () => {} }: any): ReactElement => {
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
            source={require("../../assets/fyc.png")}
            style={{
              width: getScreenResponsiveWidth(145.88),
              height: getScreenResponsiveHeight(38.93),
            }}
          />
        )}
      />
    </Column>
  );
};
