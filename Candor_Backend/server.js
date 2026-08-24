const schema = require('./schema/schema') 
const { createServer } = require("http");
const express = require("express");
const { ValidateUser } = require("./core/functions");
const { execute, subscribe } = require("graphql");
const { ApolloServerPluginInlineTrace } = require("apollo-server-core");
const { ApolloServer, gql } = require("apollo-server-express");
const cors = require("cors");
const { SubscriptionServer } = require("subscriptions-transport-ws");

(async function () {
    const PORT = process.env.PORT || 4001;
    const app = express();
    const corsOptions = {
        origin: '*',
        credentials: true
    };
    app.use(cors(corsOptions))
    app.use(express.json({limit: '50mb'}));
    const httpServer = createServer(app);

    const server = new ApolloServer({
        schema: schema,
        plugins: [ApolloServerPluginInlineTrace()],
        context: ({ req, res }) => ({ req, res })
    });
    
    await server.start();
    server.applyMiddleware({ app, cors: false });
    // console.log headers
    SubscriptionServer.create(
        { schema,  execute, subscribe,
            onConnect: async (connectionParams, webSocket, context) => {
                // Check if authorization bearer token is blank or not
                connectionParams.authorization = connectionParams.authorization || connectionParams.Authorization || '';
                if (connectionParams.authorization.length > 0) {
                    const VirtualHeader = {
                        req: {
                            headers: {
                                authorization: connectionParams.authorization
                            }
                        }
                    }
                    const user = await ValidateUser(VirtualHeader)
                    context.user = user;
                }else{
                    context.user = null;
                }
                return context
            }
        },
        { server: httpServer, path: server.graphqlPath }
    )
    httpServer.listen(PORT, () => {
        console.log(
          `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
        );
        console.log(
          `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
        );
    });
    
})()