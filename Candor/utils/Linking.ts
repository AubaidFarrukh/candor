import { Screens } from "../navigation/screens";

const linking = {
  prefixes: [
    "playcandor://",
    // "www.playcandor.com/app",
    // "https://playcandor.com/app",
  ],

  config: {
    // Deep link configuration
    screens: {
      [Screens.SIGNUP]: {
        path: "signup/:id",
        parse: {
          id: (id: any) => `${id}`,
        },
      },
      [Screens.HOME]: {
        path: "snap/auth",
      },
    },
  },
};

export default linking;
