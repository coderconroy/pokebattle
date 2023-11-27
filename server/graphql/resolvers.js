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
    }
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
        users: () => users,
        user: (_, { id }) => users.find((user) => user.id === id),
        cards: () => cards,
        card: (_, { id }) => cards.find((card) => card.id === id),
        battles: () => battles,
        battle: (_, { id }) => battles.find((battle) => battle.id === id),
    },
    User: {
        collection: (user) => user.collection.map((cardId) => cards.find((card) => card.id === cardId)),
        deck: (user) => user.deck.map((cardId) => cards.find((card) => card.id === cardId)),
        battles: (user) => user.battles,
        currentPokeAlert: (user) => user.currentPokeAlert,
    },
    Battle: {
        playerOne: (battle) => battle.playerOne,
        playerTwo: (battle) => battle.playerTwo,
        playerOneCards: (battle) => battle.playerOneCards,
        playerTwoCards: (battle) => battle.playerTwoCards,
        rounds: (battle) => battle.rounds,
        winner: (battle) => battle.winner,
    },
    // ... define resolvers for other types like PokeAlert, Card, etc.
};

module.exports = { resolvers };
