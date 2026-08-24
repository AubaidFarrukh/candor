import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("screen");

export const getScreenPercent = (
  number: number,
  dimension: "height" | "width" = "width"
): number => {
  let max = width;

  if (dimension == "height") {
    max = height;
  }

  return dimension === "height" ? (number * max) / 812 : (number * max) / 375;
};

export const getScreenResponsiveHeight = (number: number) => {
  return getScreenPercent(number, "height");
};

export const getScreenResponsiveWidth = (number: number) => {
  return getScreenPercent(number, "width");
};

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const percentToHex = (p: number) => {
  const percent = Math.max(0, Math.min(100, p));
  const intValue = Math.round((percent / 100) * 255);
  const hexValue = intValue.toString(16);
  return hexValue.padStart(2, "0").toUpperCase();
};


export function randomRange(myMin: number, myMax: number) {
  return Math.floor(Math.random() * (myMax - myMin + 1) + myMin);
}