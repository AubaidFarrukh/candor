import { ReactElement } from "react";
import { Card } from ".";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Column } from "../main";
import { Image } from "react-native";

export const ComplimentsCard = ({
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
            source={require("../../assets/cc.png")}
            style={{
              width: getScreenResponsiveWidth(227),
              height: getScreenResponsiveHeight(43),
            }}
          />
        )}
      />
    </Column>
  );
};
