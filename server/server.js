"use strict";

const { ApolloServer } = require("@apollo/server");
const { MongoClient, ObjectId } = require("mongodb");
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

class DataSourceJson {
    constructor(configFile) {
        this.config = DataSourceJson._loadConfig(configFile);
        const uri = `mongodb://${this.config.host}:${this.config.port}`;
        this.client = new MongoClient(uri);
        console.log()
    }

    async init_db() {
        try {
            this._db = this.client.db(this.config.db);
            // Ensure the 'id' field is unique in the 'card' collection
            await this._db.collection("card").createIndex({ "id": 1 }, { unique: true });
        } catch (err) {
            console.error(`Mongo DB Connection Error -- ${err}`);
            process.exit(5);
        }
    }

    async importCardsFromFile(filePath) {
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return;
        }
    
        try {
            const fileContent = fs.readFileSync(filePath, "utf8");
            const cards = JSON.parse(fileContent);
            const bulkOps = cards.map(card => ({
                updateOne: {
                    filter: { id: card.id },
                    update: { $set: card },
                    upsert: true
                }
            }));
    
            await this._db.collection("card").bulkWrite(bulkOps);
            console.log(`Processed ${cards.length} cards from ${filePath}`);
        } catch (err) {
            console.error(`Error importing cards from file -- ${err}`);
        }
    }

    async getUser(id) {
        if (!id) return null;
        const users = await this.getUsers();
        for (let i = 0; i < users.length; i++) {
            if (id === users[i].id) {
                return users[i];
            }
        }
        return null;
    }

    async getCard(id) {
        if (!id) return null;
        const cards = await this.getCards();
        for (let i = 0; i < cards.length; i++) {
            if (id === cards[i].id) {
                return cards[i];
            }
        }
        return null;
    }

    async createUser({ firstName, lastName, username, email }) {
        // Create new user
        const user = {
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email
        };

        // Add user to collection
        const { insertedId: _id } = await this._db.collection("user").insertOne(user);

        if (!_id) {
            throw new Error(`Error creating user -- data:${data}`);
        }

        return _id.toString();
    }

    async getUsers() {
        const users = await this._db.collection("user").find().toArray();
        users.map((user) => DataSourceJson._decorateUser(user));
        return users ? users : [];
    }

    async getCards() {
        const cards = await this._db.collection("card").find().toArray();
        cards.map((card) => DataSourceJson._decorateUser(card));
        return cards ? cards : [];
    }

    static _decorateUser(user) {
        user.id = user._id.toString();
        return user;
    }

    static _decorateCard(card) {
        // card.id = card._id.toString();
        return card;
    }

    static _loadConfig(configFile) {
        // Read MongoDB config file
        if (fs.existsSync(configFile)) {
            // Load config and validate JSON
            let config;
            try {
                config = JSON.parse(fs.readFileSync(configFile, "utf8"));
            } catch (err) {
                process.exit(2);
            }
            return config;
        } else {
            // Return default values if file is not found
            console.log("Config not found - using default config");
            const defaults = {
                host: "localhost",
                port: "27017",
                db: "ee547_hw",
                opts: { useUnifiedTopology: true },
            };
            return defaults;
        }
    }
}

// Initialize Data Source
const datasource = new DataSourceJson("./config/mongo.json");

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

    // Connect to database
    await datasource.init_db();

    // Import card data
    const exts = ['p', '1', '2', '3', '4', '5', '6'];
    for (let i = 0; i < exts.length; i++) {
        await datasource.importCardsFromFile(`./data/base${exts[i]}.json`);
    }

    // Start express server
    httpServer.listen(port, () => console.log(`Server started on http://localhost:${port}${graphqlPath}`));
})();
