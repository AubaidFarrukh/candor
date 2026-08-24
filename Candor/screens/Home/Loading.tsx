import React, { FC, ReactElement } from "react";
import { Page } from "../../layouts";
import { Spacer, Typography } from "../../components";
import { ImageBackground } from "react-native";

interface LoadingProps {}

export const Loading: FC<LoadingProps> = ({}): ReactElement => {
  const icon = ["📝", "🎲", "💰", "🃏", "❔"];
  const randomNumber = Math.floor(Math.random() * 5) + 1;
  return (
    <Page style={{ justifyContent: "center", alignItems: "center" }}>
      <ImageBackground
        source={require("../../assets/GradientBg.png")}
        style={{
          borderRadius: 22,
          height: 140,
          width: 133,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography lineHeight={90} size={70}>
          {icon[randomNumber - 1]}
        </Typography>
      </ImageBackground>
      <Spacer height={20} />
      <Typography type="Heading1" textAlign="center" size={24}>
        {`Loading...`}
      </Typography>
    </Page>
  );
};
