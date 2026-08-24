import { getScreenResponsiveHeight, percentToHex } from "../utils";

export enum Colors {
  CANDOR_BLACK = "#000000",
  CANDOR_WHITE = "#FFFFFF",
  CANDOR_BLUE = "#1795F8",
  CANDOR_BLUE_BLACK = "#004983",
  CANDOR_GRAY = "#CCCACA",
  CANDOR_LIGHT_GRAY = "#EBEBEB",
  CANDOR_YELLOW = "#FFD548",
  CANDOR_LEMON = "#FBFB4D",
  CANDOR_SEA_BLUE = "#27EEF7",
  CANDOR_RED = "#FD2424",
  CANDOR_PINK = "#FA2675",
  CANDOR_GREEN = "#36F859",
  CANDOR_DARK_GRAY = "#292929",
  CANDOR_ORANGE = "#FDA625",
  CANDOR_VOILET = "#8B36F8",
}

export const getHexColorOpacity = (color: Colors | string, opacity: number) => {
  return `${color}${percentToHex(opacity)}`;
};

export enum FontType {
  REGULAR_FREDOKA = "FredokaOne_400Regular",
  REGULAR_INTER = "Inter_400Regular",
  REGULAR_ANTON = "Anton_400Regular",
  REGULAR_SECULAR = "SecularOne_400Regular",
}

export enum FontSize {
  HEADING1 = getScreenResponsiveHeight(27),
  PARAGRAPH1 = getScreenResponsiveHeight(15),
  PARAGRAPH2 = getScreenResponsiveHeight(14),
  PARAGRAPH3 = getScreenResponsiveHeight(13),
  PARAGRAPH4 = getScreenResponsiveHeight(12),
  PARAGRAPH5 = getScreenResponsiveHeight(11),
  PARAGRAPH6 = getScreenResponsiveHeight(10),
  PARAGRAPH7 = getScreenResponsiveHeight(9),
}

export const TypographyStyle = {
  Heading1: {
    fontSize: FontSize.HEADING1,
    lineHeight: getScreenResponsiveHeight(29),
  },
  Paragraph1: {
    fontSize: FontSize.PARAGRAPH1,
    lineHeight: getScreenResponsiveHeight(22),
  },
  Paragraph2: {
    fontSize: FontSize.PARAGRAPH2,
    lineHeight: getScreenResponsiveHeight(17),
  },
  Paragraph3: {
    fontSize: FontSize.PARAGRAPH3,
    lineHeight: getScreenResponsiveHeight(16),
  },
  Paragraph4: {
    fontSize: FontSize.PARAGRAPH4,
    lineHeight: getScreenResponsiveHeight(16),
  },
  Paragraph5: {
    fontSize: FontSize.PARAGRAPH5,
    lineHeight: getScreenResponsiveHeight(14),
  },
  Paragraph6: {
    fontSize: FontSize.PARAGRAPH6,
    lineHeight: getScreenResponsiveHeight(12),
  },
  Paragraph7: {
    fontSize: FontSize.PARAGRAPH7,
    lineHeight: getScreenResponsiveHeight(10),
  },
};
