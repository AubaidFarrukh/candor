import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Home, Polls, Share, ProSubscription, Submit } from "../screens";
import { PortalHost, PortalProvider } from "@gorhom/portal";
import { Screens } from "./screens";
import { ChangePassword } from "../screens/Home/ChangePassword";

import analytics from "@react-native-firebase/analytics";
import { Loading } from "../screens/Home/Loading";
import Ad from "../screens/Ad";

const Stack = createStackNavigator();

const forFade = ({ current }: any) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

export default function UserStack() {
  const routeNameRef: any = React.useRef();
  const navigationRef: any = React.useRef();
  return (
    <PortalProvider>
      <NavigationContainer
        ref={navigationRef}
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
          {/* <Stack.Screen
            name={"Ad"}
            component={Ad}
            options={{ cardStyleInterpolator: forFade }}
          /> */}
          <Stack.Screen
            name={Screens.HOME}
            component={Home}
            options={{ cardStyleInterpolator: forFade }}
          />
          <Stack.Screen
            name={Screens.POLLS}
            component={Polls}
            options={{ cardStyleInterpolator: forFade }}
          />
          <Stack.Screen
            name={Screens.SHARE}
            component={Share}
            options={{ cardStyleInterpolator: forFade }}
          />
          <Stack.Screen
            name={Screens.PRO}
            component={ProSubscription}
            options={{ cardStyleInterpolator: forFade }}
          />
          <Stack.Screen
            name={Screens.CHANGE_PASSWORD}
            component={ChangePassword}
            options={{ cardStyleInterpolator: forFade }}
          />
          <Stack.Screen
            name={Screens.SUBMIT}
            component={Submit}
            options={{ cardStyleInterpolator: forFade }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PortalProvider>
  );
}
