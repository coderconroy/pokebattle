"use strict";

const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");
const bcrypt = require("bcrypt");
const BattleState = require("../src/enums/BattleState");

class DataSourceJson {
    constructor(configFile) {
        this.config = DataSourceJson._loadConfig(configFile);
        const uri = `mongodb://${this.config.host}:${this.config.port}`;
        this.client = new MongoClient(uri);
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
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return;
        }
    
        try {
            // Read and parse file content
            const fileContent = fs.readFileSync(filePath, "utf8");
            const allCards = JSON.parse(fileContent);
    
            // Filter cards based on specific conditions:
            // 1. Pokemon supertype must be "Pokémon"
            // 2. Must have at least one attack with non-empty damage
            const filteredCards = allCards.filter(card =>
                card.supertype === "Pokémon" &&
                card.attacks &&
                card.attacks.some(attack => attack.damage && attack.damage.trim() !== "")
            );
    
            // Prepare bulk operations for MongoDB
            const bulkOps = filteredCards.map(card => ({
                updateOne: {
                    filter: { id: card.id },
                    update: { $set: card },
                    upsert: true,
                },
            }));
    
            // Execute bulk write to the database
            await this._db.collection("card").bulkWrite(bulkOps);
            console.log(`Processed ${filteredCards.length} Pokémon cards from ${filePath}`);
        } catch (err) {
            // Handle any errors in file reading or JSON parsing
            console.error(`Error importing cards from file -- ${err}`);
        }
    }

    // User-related methods
    async getUser(id) {
        if (!id) return null;
        // Fetch user by ID
        const user = await this._db.collection("user").findOne({ _id: new ObjectId(id) });
        return user ? DataSourceJson._decorateUser(user) : null;
    }

    async createUser({ firstName, lastName, username, email, collection, passwordHash }) {
        // Create new user object
        const user = { firstName, lastName, username, email, collection, passwordHash };

        // Insert user into collection
        const { insertedId } = await this._db.collection("user").insertOne(user);

        if (!insertedId) {
            throw new Error(`Error creating user`);
        }

        user.id = insertedId.toString();
        return user;
    }

    async updateUser(userId, { firstName, lastName, username, email, password, collection }) {
        // Prepare user update data
        const updateData = {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(username && { username }),
            ...(email && { email }),
            ...(collection && { collection }),
        };

        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        // Convert userId from string to ObjectId
        const objectId = new ObjectId(userId);

        // Perform the update in the database
        const updatedUser = await this._db
            .collection("user")
            .findOneAndUpdate({ _id: objectId }, { $set: updateData }, { returnDocument: "after" });

        if (!updatedUser) {
            throw new Error("Failed to update user or user not found");
        }

        return DataSourceJson._decorateUser(updatedUser);
    }

    async getUserByUsername(username) {
        if (!username) return null;
        // Fetch user by username
        const user = await this._db.collection("user").findOne({ username });
        return user ? DataSourceJson._decorateUser(user) : null;
    }

    async getUserByEmail(email) {
        if (!email) return null;
        // Fetch user by email
        const user = await this._db.collection("user").findOne({ email });
        return user ? DataSourceJson._decorateUser(user) : null;
    }

    async getUserBattles(userId) {
        if (!userId) return null;
        // Fetch battles involving the user
        const battles = await this._db
            .collection("battle")
            .find({ $or: [{ playerOneId: userId }, { playerTwoId: userId }] })
            .toArray();

        return battles.map((battle) => DataSourceJson._decorateBattle(battle));
    }

    async getUsers() {
        // Fetch all users
        let users = await this._db.collection("user").find().toArray();
        return users.map((user) => DataSourceJson._decorateUser(user)) || [];
    }

    // Card-related methods
    async getCard(id) {
        if (!id) return null;
        // Fetch card by ID
        const card = await this._db.collection("card").findOne({ _id: new ObjectId(id) });
        return card ? DataSourceJson._decorateCard(card) : null;
    }

    async getCards() {
        // Fetch all cards
        let cards = await this._db.collection("card").find().toArray();
        return cards.map(card => DataSourceJson._decorateCard(card)) || [];
    }

    async getCardsByIds(cardIds) {
        // Convert string IDs to ObjectId
        const objectIds = cardIds.map(id => new ObjectId(id));
        let cards = await this._db
            .collection("card")
            .find({ _id: { $in: objectIds } })
            .toArray();

        return cards.map(card => DataSourceJson._decorateCard(card)) || [];
    }

    // Battle-related methods
    async getBattle(id) {
        if (!id) return null;
        // Fetch battle by ID
        const battle = await this._db.collection("battle").findOne({ _id: new ObjectId(id) });
        return battle ? DataSourceJson._decorateBattle(battle) : null;
    }

    async createBattle({ playerOneId, playerTwoId, playerOneCards }) {
        // Create new battle with initial state
        const battle = {
            state: BattleState.REQUESTED,
            playerOneId: playerOneId,
            playerTwoId: playerTwoId,
            playerOneCards: playerOneCards,
        };

        // Insert battle into collection
        const { insertedId } = await this._db.collection("battle").insertOne(battle);

        if (!insertedId) {
            throw new Error(`Error creating battle.`);
        }

        battle.id = insertedId.toString();
        return battle;
    }

    async updateBattle(battleId, { state, playerOneCards, playerTwoCards, rounds, winnerId }) {
        // Convert ObjectId to string for card IDs
        if (playerOneCards) {
            playerOneCards = playerOneCards.map((card) => ({ ...card, id: new ObjectId(card.id) }));
        }
        if (playerTwoCards) {
            playerTwoCards = playerTwoCards.map((card) => ({ ...card, id: new ObjectId(card.id) }));
        }

        // Only include defined fields in update data
        const battleUpdate = {
            ...(state && { state }),
            ...(playerOneCards && { playerOneCards }),
            ...(playerTwoCards && { playerTwoCards }),
            ...(rounds && { rounds }),
            ...(winnerId && { winnerId }),
        };

        // Convert battleId from string to ObjectId for querying
        const objectId = new ObjectId(battleId);

        // Update specific fields of the battle
        const updatedBattle = await this._db
            .collection("battle")
            .findOneAndUpdate({ _id: objectId }, { $set: battleUpdate }, { returnDocument: "after" });

        if (!updatedBattle) {
            throw new Error("No battle found with the provided ID");
        }

        return DataSourceJson._decorateBattle(updatedBattle);
    }

    async getBattleCard(battleCardId) {
        if (!battleCardId) return null;

        // Convert battleCardId to ObjectId for query
        const battleCardObjectId = new ObjectId(battleCardId);

        // Find and return the battle containing the battle card
        const battle = await this._db.collection("battle").findOne({
            $or: [{ "playerOneCards.id": battleCardObjectId }, { "playerTwoCards.id": battleCardObjectId }],
        });

        if (!battle) {
            throw new Error("No battle containing a battle card with the given id found");
        }

        // Extract and return the battle card
        const battleCard =
            battle.playerOneCards.find((card) => card.id.equals(battleCardObjectId)) ||
            battle.playerTwoCards.find((card) => card.id.equals(battleCardObjectId));

        return battleCard ? DataSourceJson._decorateBattleCard(battleCard) : null;
    }

    // PokeAlert-related methods
    async createPokeAlert(userId, { cardId }, lifetime) {
        const currentTime = new Date();
        const expiresAt = new Date(currentTime.getTime() + lifetime);

        const pokeAlert = {
            id: new ObjectId(),
            cardId: cardId,
            discoveredAt: currentTime.toISOString(),
            expiresAt: expiresAt.toISOString(),
            claimed: false
        };

        const user = await this._db.collection('user').findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $set: { currentPokeAlert: pokeAlert } },
            { returnDocument: 'after' }
        );

        if (!user) {
            throw new Error('User not found or PokeAlert creation failed');
        }

        // Decorate the PokeAlert object before returning
        return DataSourceJson._decoratePokeAlert(user.currentPokeAlert);
    }

    // Static helper methods
    static _decorateUser(user) {
        // Convert ObjectId to string for user ID
        user.id = user._id.toString();
        return user;
    }

    static _decorateCard(card) {
        // Find first valid attack and create a decorated card object
        const firstValidAttack = card.attacks.find((attack) => attack.damage.trim() !== "");
        const attack = firstValidAttack
            ? { name: firstValidAttack.name, damage: parseInt(firstValidAttack.damage) }
            : null;

        if (!attack) {
            throw new Error(`No valid attack found for card with id: ${card._id}`);
        }

        // Return the decorated card with converted fields
        return {
            id: card._id.toString(),
            name: card.name,
            level: parseInt(card.level),
            hp: parseInt(card.hp),
            attack: attack,
            rarity: card.rarity,
            images: card.images,
        };
    }

    static _decorateBattle(battle) {
        // Convert ObjectId to string for battle ID and card IDs
        battle.id = battle._id.toString();
        if (battle.playerOneCards && Array.isArray(battle.playerOneCards)) {
            battle.playerOneCards = battle.playerOneCards.map((card) => ({
                ...card,
                id: card.id.toString(),
            }));
        }
        if (battle.playerTwoCards && Array.isArray(battle.playerTwoCards)) {
            battle.playerTwoCards = battle.playerTwoCards.map((card) => ({
                ...card,
                id: card.id.toString(),
            }));
        }
        return battle;
    }

    static _decorateBattleCard(battleCard) {
        // Convert ObjectId to string for battle card ID
        battleCard.id = battleCard.id.toString();
        return battleCard;
    }

    static _decoratePokeAlert(pokeAlert) {
        // Convert ObjectId to string for battle card ID
        pokeAlert.id = pokeAlert.id.toString();
        return pokeAlert;
    }

    static _loadConfig(configFile) {
        // Check if the configuration file exists
        if (fs.existsSync(configFile)) {
            let config;
            try {
                // Attempt to read and parse the configuration file
                config = JSON.parse(fs.readFileSync(configFile, "utf8"));
            } catch (err) {
                // Exit if there is an error in reading or parsing the file
                console.error("Error reading config file:", err);
                process.exit(2);
            }
            return config; // Return the loaded configuration
        } else {
            // Log a message and return default configuration if file is not found
            console.log("Config not found - using default config");
            return {
                host: "localhost",
                port: "27017",
                db: "pokebattle",
                opts: { useUnifiedTopology: true },
            };
        }
    }
    
}

module.exports = { DataSourceJson };
