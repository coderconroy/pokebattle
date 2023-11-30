const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const BattleState = require("../enums/BattleState");

const { SECRET_KEY } = require("../config/config");

async function verifyCurrentUser(ds, currentUser) {
    // Check if user is logged in
    if (!currentUser || !currentUser.id) {
        throw new Error("No user is currently logged in or user ID is missing");
    }

    // Check if user exists in database
    const user = await ds.getUser(currentUser.id);
    if (!user) {
        throw new Error("Currently logged in user does not exist in database");
    }

    return user;
}

const resolvers = {
    Query: {
        currentUser: async (_, __, { ds, currentUser }) => {
            // Check if user is logged in
            if (!currentUser) {
                return null;
            }

            // Check if user exists in database
            const user = await ds.getUser(currentUser.id);
            if (!user) {
                throw new Error("Currently logged in user does not exist in database");
            }

            return user;
        },
        users: async (_, __, { ds }) => {
            return await ds.getUsers();
        },
        user: (_, { id }) => {},
        card: (_, { id }) => {},
        battle: async (_, { id }, { ds }) => {
            const battle = await ds.getBattle(id);

            if (!battle) {
                throw new Error("Battle not found");
            }

            return battle;
        },
        // Stubs
        pokeAlert: (_, __, { ds, currentUser }) => null,
        userBattles: (_, __, { ds, currentUser }) => [],
        userCollection: (_, __, { ds, currentUser }) => [],
    },
    Mutation: {
        // Stubs
        signup: async (_, { firstName, lastName, username, email, password }, { ds }) => {
            // Check if username already exists
            let existingUser = await ds.getUserByUsername(username);
            if (existingUser) {
                throw new Error("Username already exists. Please choose a different username.");
            }

            // Check if email already exists
            existingUser = await ds.getUserByEmail(email);
            if (existingUser) {
                throw new Error("Email already exists. Please choose a different email.");
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Load card ids from database
            const cards = await ds.getCards();

            // Randomly select 10 distinct cards for the collection and select the first 6 for the deck
            const collection = [];
            while (collection.length < 10) {
                const randomIndex = Math.floor(Math.random() * cards.length);
                const cardId = cards[randomIndex].id;
                let containsCard = collection.some((collectionCard) => collectionCard.cardId === cardId);
                if (!containsCard) {
                    collection.push({
                        cardId: cardId,
                        inDeck: collection.length < 6,
                    });
                }
            }

            // Add user to database
            const user = await ds.createUser({
                firstName: firstName,
                lastName: lastName,
                username: username,
                email: email,
                collection: collection,
                passwordHash: passwordHash,
            });

            // Create token
            const token = jwt.sign({ id: user.id }, SECRET_KEY);

            return { token, user };
        },
        login: async (_, { username, password }, { ds }) => {
            // Retrieve user from the database using username
            const user = await ds.getUserByUsername(username);
            if (!user) {
                throw new Error("Username does not exist");
            }

            if (user && (await bcrypt.compare(password, user.passwordHash))) {
                const token = jwt.sign({ id: user.id }, SECRET_KEY);
                return { token, user };
            } else {
                throw new Error("Invalid credentials");
            }
        },
        requestBattle: async (_, { userId }, { ds, currentUser }) => {
            // Verify current user and get both user details
            const requestingUser = await verifyCurrentUser(ds, currentUser);
            const requestedUser = await ds.getUser(userId);

            // Verify players are two different users
            if (requestingUser.id === requestedUser.id) {
                throw new Error("Cannot request battle with onself");
            }

            // Verify requested user exists
            if (!requestedUser) {
                throw new Error("Requested user does not exist");
            }

            // Initialize requesting players cards
            const deckIds = requestingUser.collection
            .filter((colCard) => colCard.inDeck)
            .map((colCard) => colCard.cardId);
            const cards = await ds.getCardsByIds(deckIds);
            const playerOneCards = cards.map((card) => ({
                id: new ObjectId(),
                cardId: card.id,
                currentHp: parseInt(card.hp),
                isDead: false,
            }));

            // Create battle
            const battle = await ds.createBattle({
                playerOneId: requestingUser.id,
                playerTwoId: requestedUser.id,
                playerOneCards: playerOneCards,
            });

            return battle;
        },
        acceptBattle: async (_, { battleId }, { ds, currentUser }) => {
            // Verify current user
            const acceptingUser = await verifyCurrentUser(ds, currentUser);

            // Retrieve the battle from the database
            const battle = await ds.getBattle(battleId);

            // Verify the battle exists
            if (!battle) {
                throw new Error("Battle not found");
            }

            // Verify that the accepting user is the challenged user
            if (battle.playerTwoId !== acceptingUser.id) {
                throw new Error("User is not the challenged player in this battle");
            }

            // Verify that the battle is in the REQUESTED state
            if (battle.state !== BattleState.REQUESTED) {
                throw new Error("Battle must be in REQUESTED state to be accepted");
            }

            // Initialize accepting player's cards (player two)
            const deckIds = acceptingUser.collection
                .filter((colCard) => colCard.inDeck)
                .map((colCard) => colCard.cardId);
            const cards = await ds.getCardsByIds(deckIds);
            const playerTwoCards = cards.map((card) => ({
                id: new ObjectId(),
                cardId: card.id,
                currentHp: parseInt(card.hp),
                isDead: false,
            }));

            // Update the battle state to ACTIVE and set playerTwoCards
            const updatedBattle = await ds.updateBattle(battleId, {
                state: BattleState.ACTIVE,
                playerTwoCards: playerTwoCards,
            });

            return updatedBattle;
        },
        rejectBattle: async (_, { battleId }, { ds, currentUser }) => {
            // Verify current user
            const rejectingUser = await verifyCurrentUser(ds, currentUser);

            // Retrieve the battle from the database
            const battle = await ds.getBattle(battleId);

            // Verify the battle exists
            if (!battle) {
                throw new Error("Battle not found");
            }

            // Verify that the rejecting user is the challenged user
            if (battle.playerTwoId !== rejectingUser.id) {
                throw new Error("User is not the challenged player in this battle");
            }

            // Verify that the battle is in the REQUESTED state
            if (battle.state !== BattleState.REQUESTED) {
                throw new Error("Battle must be in REQUESTED state to be rejected");
            }

            // Update the battle state to REJECTED
            const updatedBattle = await ds.updateBattle(battleId, {
                state: BattleState.REJECTED,
            });

            return updatedBattle;
        },
        updateUser: (_, { id, firstName, lastName, username, email }) => {},
        viewBattle: (_, { battleId }) => {},
        playCardInBattle: (_, { battleId, battleCardId }) => {},
        forfeitBattle: (_, { battleId }) => {},
        claimPokeAlert: (_, { pokeAlertId }) => {},
        deletePokeAlert: (_, { pokeAlertId }) => true,
    },
    AuthPayload: {
        // Assuming AuthPayload contains token and user
        token: (authPayload) => authPayload.token,
        user: (authPayload) => authPayload.user,
    },
    User: {
        collection: async (user, _, { ds }) => {
            if (!user.collection || user.collection.length === 0) {
                return [];
            }

            // Get array of cards
            const cards = await ds.getCardsByIds(user.collection.map((colCard) => colCard.cardId));

            // Transform the cards into CollectionCard objects
            return cards.map((card) => {
                // Find the matching collection item to get the inDeck status
                const collectionCard = user.collection.find((colCard) => colCard.cardId === card.id);
                return {
                    card: card,
                    inDeck: collectionCard ? collectionCard.inDeck : false,
                };
            });
        },
        battles: async (user, _, { ds }) => {
            const userBattles = await ds.getUserBattles(user.id);
            return userBattles;
        },
        currentPokeAlert: (user) => user.currentPokeAlert,
    },
    Card: {
        id: (card) => card.id,
        name: (card) => card.name,
        level: (card) => card.level,
        hp: (card) => card.hp,
        attack: (card) => card.attack,
        rarity: (card) => card.rarity,
        images: (card) => card.images,
    },
    Attack: {
        name: (attack) => attack.name,
        damage: (attack) => attack.damage,
    },
    Images: {
        small: (images) => images.small,
        large: (images) => images.large,
    },
    PokeAlert: {
        id: (pokeAlert) => pokeAlert.id,
        card: (pokeAlert) => pokeAlert.card,
        discoveredAt: (pokeAlert) => pokeAlert.discoveredAt,
        expiresAt: (pokeAlert) => pokeAlert.expiresAt,
        claimed: (pokeAlert) => pokeAlert.claimed,
    },
    CollectionCard: {
        card: (collectionCard) => collectionCard.card,
        inDeck: (collectionCard) => collectionCard.inDeck,
    },
    Battle: {
        playerOne: async (battle, _, { ds }) => {
            if (!battle.playerOneId) {
                throw new Error("Player One ID is missing in the battle");
            }

            const playerOne = await ds.getUser(battle.playerOneId);
            if (!playerOne) {
                throw new Error("Player One not found");
            }

            return playerOne;
        },
        playerTwo: async (battle, _, { ds }) => {
            if (!battle.playerTwoId) {
                throw new Error("Player Two ID is missing in the battle");
            }
    
            const playerTwo = await ds.getUser(battle.playerTwoId);
            if (!playerTwo) {
                throw new Error("Player Two not found");
            }
    
            return playerTwo;
        },
        playerOneCards: async (battle, _, { ds }) => {
            // Check if playerOneCards are present
            if (!battle.playerOneCards || battle.playerOneCards.length === 0) {
                return [];
            }
    
            // Map through playerOneCards array
            const battleCards = await Promise.all(battle.playerOneCards.map(async (battleCard) => {
                // Fetch the card details for each cardId
                const card = await ds.getCard(battleCard.cardId);
                return {
                    id: battleCard.id,
                    card: card,
                    currentHp: battleCard.currentHp,
                    isDead: battleCard.isDead
                };
            }));
    
            return battleCards;
        },
        playerTwoCards: async (battle, _, { ds }) => {
            // Check if playerTwoCards are present
            if (!battle.playerTwoCards || battle.playerTwoCards.length === 0) {
                return [];
            }
    
            // Map through playerTwoCards array
            const battleCards = await Promise.all(battle.playerTwoCards.map(async (battleCard) => {
                // Fetch the card details for each cardId
                const card = await ds.getCard(battleCard.cardId);
                return {
                    id: battleCard.id,
                    card: card,
                    currentHp: battleCard.currentHp,
                    isDead: battleCard.isDead
                };
            }));
    
            return battleCards;
        },
        rounds: (battle) => [],
        winner: (battle) => null,
    },
    Round: {
        playerOneCard: (round) => round.playerOneCard,
        playerTwoCard: (round) => round.playerTwoCard,
        playerOneViewed: (round) => round.playerOneViewed,
        playerTwoViewed: (round) => round.playerTwoViewed,
    },
    BattleCard: {
        id: (battleCard) => battleCard.id,
        card: (battleCard) => battleCard.card,
        currentHp: (battleCard) => battleCard.currentHp,
        isDead: (battleCard) => battleCard.isDead,
    },
    PlayedCard: {
        battleCard: (playedCard) => playedCard.battleCard,
        roundStartHp: (playedCard) => playedCard.roundStartHp,
        roundEndHp: (playedCard) => playedCard.roundEndHp,
    },
};

module.exports = { resolvers };
