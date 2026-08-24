import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  SignIn,
  SignUp,
  Onboarding,
  ForgotPassword,
  RecoveryCode,
  ResetPassword,
} from "../screens";
import { PortalHost, PortalProvider } from "@gorhom/portal";
import { Screens } from "./screens";

import analytics from "@react-native-firebase/analytics";
import Ad from "../screens/Ad";
import { Loading } from "../screens/Home/Loading";
import linking from "../utils/Linking";

const Stack = createStackNavigator();

const forFade = ({ current }: any) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

export default function AuthStack() {
  const routeNameRef: any = React.useRef();
  const navigationRef: any = React.useRef();
  return (
    <PortalProvider>
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        onReady={() => {
          routeNameRef.current = navigationRef.current.getCurrentRoute().name;
        }}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current.getCurrentRoute().name;

          if (previousRouteName !== currentRouteName) {
            await analytics().logScreenView({
              screen_name: currentRouteName,
              screen_class: currentRouteName,
            });
          }
          routeNameRef.current = currentRouteName;
        }}
      >
        <PortalHost name="menu" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
        >
          <Stack.Screen
            name={Screens.ONBOARDING}
            component={Onboarding}
            options={{ cardStyleInterpolator: forFade }}
          />
          <Stack.Screen
            name={Screens.SIGNIN}
            component={SignIn}
            options={{ cardStyleInterpolator: forFade }}
          />
          <Stack.Screen
            name={Screens.SIGNUP}
            component={SignUp}
            options={{ cardStyleInterpolator: forFade }}
            initialParams={{ id: "cirlormx4489" }}
          />

          <Stack.Screen
            name={Screens.FORGOT_PASSWORD}
            component={ForgotPassword}
            options={{ cardStyleInterpolator: forFade }}
          />
          <Stack.Screen
            name={Screens.RECOVERY_CODE}
            component={RecoveryCode}
            options={{ cardStyleInterpolator: forFade }}
          />
          <Stack.Screen
            name={Screens.RESET_PASSWORD}
            component={ResetPassword}
            options={{ cardStyleInterpolator: forFade }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PortalProvider>
  );
}
