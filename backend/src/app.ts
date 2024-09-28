import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { PrismaClient } from "@prisma/client";
import typeDefs from "./schema/typeDefs";
import resolvers from "./resolvers";
import { createContext } from "./context";
import cors from "cors";

export const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const httpServer = createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const subscriptionServer = SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: (connectionParams: any) => {
      return createContext({
        req: {
          headers: { authorization: connectionParams.authorization },
        } as any,
      });
    },
  },
  { server: httpServer, path: "/graphql" }
);

const server = new ApolloServer({
  schema,
  context: createContext,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close();
          },
        };
      },
    },
  ],
});

export { app, httpServer, server };
