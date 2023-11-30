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
            const cardIds = cards.map((card) => card.id);

            // Randomly select 10 distinct cards for the collection and 6 of those for the deck
            const collectionIds = [];
            while (collectionIds.length < 10) {
                const randomIndex = Math.floor(Math.random() * cardIds.length);
                const cardId = cardIds[randomIndex];
                if (!collectionIds.includes(cardId)) {
                    collectionIds.push(cardId);
                }
            }
            const deckIds = collectionIds.slice(0, 6);

            console.log(deckIds[0]);

            // Add user to database
            const user = await ds.createUser({
                firstName: firstName,
                lastName: lastName,
                username: username,
                email: email,
                collectionIds: collectionIds,
                deckIds: deckIds,
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
            const cards = await ds.getCardsByIds(requestingUser.deckIds);
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
            // Assuming playerTwo's deck is set and available
            const cards = await ds.getCardsByIds(acceptingUser.deckIds);
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
            if (!user.collectionIds || user.collectionIds.length === 0) {
                return [];
            }
            return await ds.getCardsByIds(user.collectionIds);
        },
        deck: async (user, _, { ds }) => {
            if (!user.deckIds || user.deckIds.length === 0) {
                return [];
            }
            return await ds.getCardsByIds(user.deckIds);
        },
        battles: (user) => {
            return [];
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
    Battle: {
        playerOne: (battle) => battle.playerOne,
        playerTwo: (battle) => battle.playerTwo,
        playerOneCards: (battle) => battle.playerOneCards,
        playerTwoCards: (battle) => battle.playerTwoCards,
        rounds: (battle) => battle.rounds,
        winner: (battle) => battle.winner,
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
