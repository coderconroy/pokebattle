"use strict";

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloServerPluginDrainHttpServer } = require("@apollo/server/plugin/drainHttpServer");
const express = require("express");
const http = require("http");
const cors = require("cors");
const fs = require('fs');

// Read GraphQL schema and resolvers
const { resolvers } = require("./graphql/resolvers");
const typeDefs = fs.readFileSync("./graphql/schema.graphql", "utf-8");

// Initialize express server
const app = express();
const port = 3000;
const httpServer = http.createServer(app);

// Initialize Apollo Server and server drain plugin
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

(async () => {
    // Start Apollo server
    await apolloServer.start();

    // Set express middleware to handle CORS, body parsing and expressMiddleware function.
    const graphqlPath = "/graphql";
    app.use(
        graphqlPath,
        cors(),
        express.json(),
        expressMiddleware(apolloServer, {
            context: async ({ req }) => ({ token: req.headers.token }),
        })
    );

    // Start express server
    httpServer.listen(port, () => console.log(`Server started on http://localhost:${port}${graphqlPath}`));
})();
