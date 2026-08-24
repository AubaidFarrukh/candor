import { FC, ReactElement } from "react";
import TitleSvg from "../../assets/svgs/Title.svg";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Row } from "./Row";

interface TitleProps {}

export const Title: FC<TitleProps> = ({}): ReactElement => {
  return (
    <Row justifyContent="center">
      <TitleSvg
        width={getScreenResponsiveWidth(280)}
        height={getScreenResponsiveHeight(127)}
      />
    </Row>
  );
};
