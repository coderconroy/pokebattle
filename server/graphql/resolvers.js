const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require('../config/config');

const cards = [
    {
        id: "c1",
        name: "Pikachu",
        level: 5,
        hp: 35,
        attack: { name: "Thunderbolt", damage: 40 },
        rarity: "Rare",
    },
    // ... add more cards
];

const users = [
    {
        id: "1",
        firstName: "Ash",
        lastName: "Ketchum",
        username: "pikachu_master",
        email: "ash@example.com",
        collection: ["c1"], // Assuming Pikachu is in Ash's collection
        deck: ["c1"], // Assuming Pikachu is also in Ash's deck
        battles: [], // Will be populated later
        currentPokeAlert: null, // No active PokeAlert for simplicity
    },
    {
        id: "2",
        firstName: "Misty",
        lastName: "Williams",
        username: "waterqueen",
        email: "misty@example.com",
        collection: ["c1"], // Reference card IDs in the collection
        deck: ["c1"], // Reference card IDs in the deck
        battles: [],
        currentPokeAlert: null, // Assuming Misty has no current PokeAlert
    },
    // ... add more users
];

const battles = [
    {
        id: "b1",
        state: "ACTIVE",
        playerOne: users[0],
        playerTwo: users[1],
        playerOneCards: [], // Assuming no cards selected yet
        playerTwoCards: [],
        rounds: [],
        winner: null,
    },
    // ... add more battles
];

// Adding this battle to users' battle lists
users[0].battles.push(battles[0]);
users[1].battles.push(battles[0]);

const resolvers = {
    Query: {
        // Implemented with dummy data
        currentUser: async (_, __, {ds, currentUser}) => {
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
        users: () => users,
        user: (_, { id }) => users.find((user) => user.id === id),
        cards: () => cards,
        card: (_, { id }) => cards.find((card) => card.id === id),
        battles: () => battles,
        battle: (_, { id }) => battles.find((battle) => battle.id === id),

        // Stubs
        pokeAlert: (_, { userId }) => null,
        userBattles: (_, { userId }) => [],
        userCollection: (_, { userId }) => [],
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

            // Add user to database
            const user = await ds.createUser({
                firstName: firstName,
                lastName: lastName,
                username: username,
                email: email,
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

            if (user && await bcrypt.compare(password, user.passwordHash)) {
                const token = jwt.sign({ id: user.id }, SECRET_KEY);
                return { token, user };
            } else {
                throw new Error('Invalid credentials');
            }
        },
        requestBattle: (_, { userId }) => {},
        acceptBattle: (_, { userId }) => {},
        claimPokeAlert: (_, { pokeAlertId }) => {},
        deletePokeAlert: (_, { pokeAlertId }) => true,
        updateUser: (_, { id, firstName, lastName, username, email }) => {},
        viewBattle: (_, { battleId }) => {},
        playCardInBattle: (_, { battleId, battleCardId }) => {},
        forfeitBattle: (_, { battleId }) => {},
    },
    AuthPayload: {
        // Assuming AuthPayload contains token and user
        token: (authPayload) => authPayload.token,
        user: (authPayload) => authPayload.user,
    },
    User: {
        // Implemented with dummy data
        collection: (user) => user.collection.map((cardId) => cards.find((card) => card.id === cardId)),
        deck: (user) => user.deck.map((cardId) => cards.find((card) => card.id === cardId)),
        battles: (user) => user.battles,
        currentPokeAlert: (user) => user.currentPokeAlert,
        // Other fields like 'id', 'firstName', 'lastName', 'username', and 'email' do not need resolvers
        // as they can be resolved directly from the User object returned by other resolvers
    },
    Card: {
        id: (card) => card.id,
        name: (card) => card.name,
        level: (card) => card.level,
        hp: (card) => card.hp,
        attack: (card) => card.attack,
        rarity: (card) => card.rarity,
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
        // Implemented with dummy data
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
