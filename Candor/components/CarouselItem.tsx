import { ReactElement } from "react";
import { Column, Typography } from "./main";
import { Colors, FontType } from "../theme";
import { getScreenResponsiveWidth } from "../utils";

export const CarouselItem = ({ item }: any): ReactElement => {
  return (
    <Column alignItems="center" width={"100%"}>
      <Column
        height={290}
        width={299}
        alignItems={"center"}
        style={{ borderRadius: 20 }}
      >
        <Column
          height={280}
          width={299}
          backgroundColor={
            item.background_color ? item.background_color : Colors.CANDOR_YELLOW
          }
          justifyContent={"center"}
          alignItems={"center"}
          style={{ borderRadius: 20 }}
        >
          <Typography
            fontFamily={FontType.REGULAR_ANTON}
            lineHeight={50}
            color={item.text_color ? item.text_color : Colors.CANDOR_BLACK}
            textAlign={"center"}
            size={35}
            style={{ width: getScreenResponsiveWidth(172) }}
          >
            {item.caption_text}
          </Typography>
          <Typography
            fontFamily={FontType.REGULAR_FREDOKA}
            color={item.text_color ? item.text_color : Colors.CANDOR_BLACK}
            textAlign={"center"}
          >
            {item.description}
          </Typography>
        </Column>
      </Column>
    </Column>
  );
};
