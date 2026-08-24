import { useEffect, useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  DefaultOptions,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistCache, AsyncStorageWrapper } from "apollo3-cache-persist";
import { getMainDefinition } from "@apollo/client/utilities";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { WebSocketLink } from "@apollo/client/link/ws";

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};

export function useApolloClient() {
  const [client, setClient] = useState<any>(null);

  try {
    const cache = new InMemoryCache();

    const httpLink = createHttpLink({
      // uri: "https://api.candour.app/graphql",
      uri: "https://prod-api.playcandor.com/graphql",
    });

    const authLink = setContext(async (_, { headers }) => {
      const token = await AsyncStorage.getItem("accessToken");

      return {
        headers: {
          ...headers,
          Authorization: token ? `Bearer ${token}` : "",
        },
      };
    });
    useEffect(() => {
      const unsubscribeFromApolloClient = async () => {
        const token = await AsyncStorage.getItem("accessToken");
        const wsLink = new WebSocketLink(
          new SubscriptionClient("wss://prod-api.playcandor.com/graphql", {
            // new SubscriptionClient("wss://api.candour.app/graphql", {
            connectionParams: {
              authToken: token,
            },
          })
        );
        const splitLink = split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === "OperationDefinition" &&
              definition.operation === "subscription"
            );
          },
          wsLink,
          httpLink
        );

        await persistCache({
          cache,
          storage: new AsyncStorageWrapper(AsyncStorage),
          trigger: "write",
          debug: true,
        }).then(() => {
          setClient(
            new ApolloClient({
              link: authLink.concat(splitLink),
              cache: cache,
              defaultOptions: defaultOptions,
            })
          );
        });
      };
      unsubscribeFromApolloClient();
    }, []);

    return { client };
  } catch (error) {
    console.log(error);

    return { client: false };
  }
}
