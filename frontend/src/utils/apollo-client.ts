// src/utils/apollo-client.ts

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  ApolloLink,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import { setContext } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: "http://" + process.env.REACT_APP_BACK_END_URL,
});

const wsLink = new WebSocketLink({
  uri: `ws://` + process.env.REACT_APP_BACK_END_URL,
  options: {
    reconnect: true,
    connectionParams: () => {
      const token = localStorage.getItem("token");
      return token ? { authorization: `Bearer ${token}` } : {};
    },
  },
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export const resetApolloCache = () => {
  client.resetStore();
};
