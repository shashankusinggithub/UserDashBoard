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
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

export const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const httpServer = createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanup = useServer(
  {
    schema,
    context: (ctx) => {
      // You can access connection parameters here if needed
      const token = ctx.connectionParams?.Authorization || "";
      return createContext({
        req: { headers: { authorization: token } },
      } as any);
    },
  },
  wsServer
);
const server = new ApolloServer({
  schema,
  context: createContext,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

export { app, httpServer, server };
