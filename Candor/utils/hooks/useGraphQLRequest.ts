import { GraphQLClient } from "graphql-request";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getGraphQLRequest(
  query: any,
  variables: any,
  requireToken: boolean = false
) {
  // const endpoint = "https://api.candour.app/graphql";
  const endpoint = "https://prod-api.playcandor.com/graphql";
  const token = await AsyncStorage.getItem("accessToken");

  if (requireToken && token) {
    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      },
    });

    const data = await graphQLClient.request(query, variables);

    return { data: JSON.parse(JSON.stringify(data)) };
  } else {
    const graphQLClient = new GraphQLClient(endpoint);

    const data = await graphQLClient.request(query, variables);
    return { data: JSON.parse(JSON.stringify(data)) };
  }
}
