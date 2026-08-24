import { ReactElement, useState } from "react";
import { Card } from ".";
import { Column } from "../main";
import { Image } from "react-native";
import {
  getScreenResponsiveWidth,
  getScreenResponsiveHeight,
} from "../../utils";

export const PhotoCard = ({ data, onChange = () => {} }: any): ReactElement => {
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
            source={require("../../assets/style.png")}
            style={{
              width: getScreenResponsiveWidth(133),
              height: getScreenResponsiveHeight(44),
            }}
          />
        )}
      />
    </Column>
  );
};
