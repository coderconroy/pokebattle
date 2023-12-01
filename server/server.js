"use strict";

// Import core modules
const express = require("express");
const http = require("http");
const cors = require("cors");
const fs = require("fs");

// Import third-party modules
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloServerPluginDrainHttpServer } = require("@apollo/server/plugin/drainHttpServer");
const jwt = require("jsonwebtoken");

// Import local modules
const { SECRET_KEY } = require("./config/config");
const { DataSourceJson } = require("./src/datasource");
const { PokeAlertJob } = require("./src/pokeAlertJob");
const { resolvers } = require("./src/resolvers");

// Read GraphQL schema
const typeDefs = fs.readFileSync("./src/schema.graphql", "utf-8");

// Initialize express application
const app = express();
const port = 3000; // Define the port number for the server
const httpServer = http.createServer(app); // Create an HTTP server

// Initialize Apollo Server with type definitions, resolvers, and plugins
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Initialize the data source for MongoDB
const datasource = new DataSourceJson("./config/mongo.json");

// Function to start the Apollo server
async function startServer() {
    // Start the Apollo server
    await apolloServer.start();

    // Define GraphQL endpoint
    const graphqlPath = "/graphql";

    // Configure express middleware for CORS, JSON parsing, and Apollo
    app.use(
        graphqlPath,
        cors(),
        express.json(),
        expressMiddleware(apolloServer, {
            // Define the context for GraphQL requests
            context: async ({ req }) => {
                let user = null; // Default user to null
                const token = req.headers.authorization?.replace("Bearer ", "");

                // Verify the token and set the user if valid
                if (token) {
                    try {
                        user = jwt.verify(token, SECRET_KEY);
                    } catch (error) {
                        // Token verification failed, user remains null
                    }
                }

                // Return the context with current user and data source
                return {
                    currentUser: user,
                    ds: datasource,
                };
            },
        })
    );

    // Connect to the database
    await datasource.init_db();

    // Import card data from JSON files
    const exts = ["p", "1", "2", "3", "4", "5", "6"];
    for (let i = 0; i < exts.length; i++) {
        await datasource.importCardsFromFile(`./data/base${exts[i]}.json`);
    }

    // Start the HTTP server
    httpServer.listen(port, () => console.log(`Server started on http://localhost:${port}${graphqlPath}`));

    // Start PokeAlert generation job
    const pokeAlertJob = new PokeAlertJob(datasource);
    pokeAlertJob.start();
}

// Execute the startServer function
startServer();
