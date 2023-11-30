"use strict";

const { ApolloServer } = require("@apollo/server");
const { MongoClient, ObjectId } = require("mongodb");
const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloServerPluginDrainHttpServer } = require("@apollo/server/plugin/drainHttpServer");
const express = require("express");
const http = require("http");
const cors = require("cors");
const fs = require("fs");
const { SECRET_KEY } = require("./config/config");
const jwt = require("jsonwebtoken");
const BattleState = require("./enums/BattleState");

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
        console.log();
    }

    async init_db() {
        try {
            this._db = this.client.db(this.config.db);
            // Ensure the 'id' field is unique in the 'card' collection
            await this._db.collection("card").createIndex({ id: 1 }, { unique: true });
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
            const allCards = JSON.parse(fileContent);

            // Filter cards based on conditions
            // 1. Pokemon supertype must be "Pokémon"
            // 2. Must have at least one attack with non-empty damage
            const filteredCards = allCards.filter(
                (card) =>
                    card.supertype === "Pokémon" &&
                    card.attacks &&
                    card.attacks.some((attack) => attack.damage && attack.damage.trim() !== "")
            );

            const bulkOps = filteredCards.map((card) => ({
                updateOne: {
                    filter: { id: card.id },
                    update: { $set: card },
                    upsert: true,
                },
            }));

            await this._db.collection("card").bulkWrite(bulkOps);
            console.log(`Processed ${filteredCards.length} Pokémon cards from ${filePath}`);
        } catch (err) {
            console.error(`Error importing cards from file -- ${err}`);
        }
    }

    async getUser(id) {
        if (!id) return null;
        const user = await this._db.collection("user").findOne({ _id: new ObjectId(id) });
        return user ? DataSourceJson._decorateUser(user) : null;
    }

    async getCard(id) {
        if (!id) return null;
        const card = await this._db.collection("card").findOne({ _id: new ObjectId(id) });
        return card ? DataSourceJson._decorateCard(card) : null;
    }

    async getBattle(id) {
        if (!id) return null;
        const battle = await this._db.collection("battle").findOne({ _id: new ObjectId(id) });
        return battle ? DataSourceJson._decorateBattle(battle) : null;
    }

    async createUser({ firstName, lastName, username, email, collection, passwordHash }) {
        // Create new user
        const user = {
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            collection,
            passwordHash: passwordHash,
        };

        // Add user to collection
        const { insertedId } = await this._db.collection("user").insertOne(user);

        if (!insertedId) {
            throw new Error(`Error creating user.`);
        }

        user.id = insertedId.toString();

        return user;
    }

    async createBattle({ playerOneId, playerTwoId, playerOneCards }) {
        // Create new battle
        const battle = {
            state: BattleState.REQUESTED,
            playerOneId: playerOneId,
            playerTwoId: playerTwoId,
            playerOneCards: playerOneCards,
        };

        // Add battle to collection
        const { insertedId } = await this._db.collection("battle").insertOne(battle);

        if (!insertedId) {
            throw new Error(`Error creating battle.`);
        }

        battle.id = insertedId.toString();

        return battle;
    }

    async getUsers() {
        const users = await this._db.collection("user").find().toArray();
        users.map((user) => DataSourceJson._decorateUser(user));
        return users ? users : [];
    }

    async getCards() {
        const cards = await this._db.collection("card").find().toArray();
        cards.map((card) => DataSourceJson._decorateCard(card));
        return cards ? cards : [];
    }

    async getCardsByIds(cardIds) {
        cardIds = cardIds.map((id) => new ObjectId(id));
        const cards = await this._db
            .collection("card")
            .find({
                _id: { $in: cardIds },
            })
            .toArray();

        cards.map((card) => DataSourceJson._decorateCard(card));
        return cards ? cards : [];
    }

    async getUserByUsername(username) {
        if (!username) return null;
        const user = await this._db.collection("user").findOne({ username: username });
        return user ? DataSourceJson._decorateUser(user) : null;
    }

    async getUserByEmail(email) {
        if (!email) return null;
        const user = await this._db.collection("user").findOne({ email: email });
        return user ? DataSourceJson._decorateUser(user) : null;
    }

    async getUserBattles(userId) {
        if (!userId) return null;
        const battles = await this._db.collection("battle").find({
            $or: [
                { playerOneId: userId },
                { playerTwoId: userId }
            ]
        }).toArray();

        return battles.map(battle => DataSourceJson._decorateBattle(battle));
    }

    // TODO: Continue here with no battle being found even though passed battle id is correct
    async updateBattle( battleId, { state, playerTwoCards }) {
        // Only include defined fields in update data
        const updateData = {
            ...(state && { state }),
            ...(playerTwoCards && { playerTwoCards }),
        };

        const updatedBattle = await this._db
            .collection("battle")
            .findOneAndUpdate({ _id: new ObjectId(battleId) }, { $set: updateData }, { returnDocument: "after" });

        if (!updatedBattle) {
            throw new Error("No battle found with the provided ID");
        }

        console.log(updatedBattle);

        return DataSourceJson._decorateBattle(updatedBattle);
    }

    static _decorateUser(user) {
        user.id = user._id.toString();
        return user;
    }

    // TODO: Consider issues from existing card id. Since card is never updated this may not be a problem
    static _decorateCard(card) {
        card.id = card._id.toString();
        return card;
    }

    static _decorateBattle(battle) {
        battle.id = battle._id.toString();
        return battle;
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
            context: async ({ req }) => {
                let user = null;

                const token = req.headers.authorization?.replace("Bearer ", "");

                if (token) {
                    try {
                        user = jwt.verify(token, SECRET_KEY);
                    } catch (error) {
                        // If there's an error (e.g., token is invalid), user remains null
                    }
                }

                return {
                    currentUser: user,
                    ds: datasource,
                };
            },
        })
    );

    // Connect to database
    await datasource.init_db();

    // Import card data
    const exts = ["p", "1", "2", "3", "4", "5", "6"];
    for (let i = 0; i < exts.length; i++) {
        await datasource.importCardsFromFile(`./data/base${exts[i]}.json`);
    }

    // Start express server
    httpServer.listen(port, () => console.log(`Server started on http://localhost:${port}${graphqlPath}`));
})();
