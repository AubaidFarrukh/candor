import { ReactElement } from "react";
import { Card } from ".";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Image } from "react-native";

export const ProChatWithMe = ({
  data,
  onChange = () => {},
}: any): ReactElement => {
  return (
    <Card
      data={data}
      onChange={onChange}
      image={() => (
        <Image
          source={require("../../assets/cch.png")}
          style={{
            width: getScreenResponsiveWidth(210.93),
            height: getScreenResponsiveHeight(43),
          }}
        />
      )}
    />
  );
};
