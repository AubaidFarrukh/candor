import { ReactElement, useState } from "react";
import { Card } from ".";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Column, Row } from "../main";
import { Image } from "react-native";

export const AudioCard = ({ data, onChange = () => {} }: any): ReactElement => {
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
            source={require("../../assets/wc.png")}
            style={{
              width: getScreenResponsiveWidth(145),
              height: getScreenResponsiveHeight(44),
            }}
          />
        )}
      />
    </Column>
  );
};
