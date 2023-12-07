const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const BattleState = require("./enums/BattleState");

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
        user: async (_, { id }, { ds }) => {
            return await ds.getUser(id);
        },
        card: async (_, { id }, { ds }) => {
            return await ds.getCard(id);
        },
        battle: async (_, { id }, { ds }) => {
            const battle = await ds.getBattle(id);

            if (!battle) {
                throw new Error("Battle not found");
            }

            return battle;
        },
        userBattles: async (_, __, { ds, currentUser }) => {
            // Verify current user
            const user = await verifyCurrentUser(ds, currentUser);
            return await ds.getUserBattles(user.id);
        },
        pokeAlert: async (_, __, { ds, currentUser }) => {
            // Verify current user
            const user = await verifyCurrentUser(ds, currentUser);

            // Check if the user has a PokeAlert
            if (!user.currentPokeAlert) {
                return null;
            }

            // Check if the PokeAlert has expired
            const currentTime = new Date();
            if (currentTime.toISOString() > user.currentPokeAlert.expiresAt) {
                return null; // PokeAlert has expired
            }

            return user.currentPokeAlert;
        },
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
        updateUserDeck: async (_, { cardIds }, { ds, currentUser }) => {
            // Verify current user
            const user = await verifyCurrentUser(ds, currentUser);

            // Validate input length
            if (cardIds.length !== 6) {
                throw new Error("Input array of deck card IDs should be of length 6");
            }

            // Verify all cards are distinct
            const cardIdSet = new Set(cardIds);
            if (cardIdSet.size !== cardIds.length) {
                throw new Error("All card IDs need to be distinct");
            }

            // Update the 'inDeck' status of each card in the user's collection
            let deckSize = 0;
            const updatedCollection = user.collection.map((collectionCard) => {
                const inDeck = cardIds.includes(collectionCard.cardId);
                if (inDeck) {
                    deckSize++;
                }
                return {
                    ...collectionCard,
                    inDeck: inDeck,
                };
            });

            // Check all deck cards are also part of the collection
            if (deckSize !== 6) {
                throw new Error("All card IDs must be in the user collection");
            }

            // Update the user's collection in the database
            const updatedUser = await ds.updateUser(user.id, {
                collection: updatedCollection,
            });

            return updatedUser;
        },
        updateUserDetails: async (_, { firstName, lastName, username, email, password }, { ds, currentUser }) => {
            // Verify current userr
            console.log("entered");
            const user = await verifyCurrentUser(ds, currentUser);

            // Call the updateUser function from the data source
            const updatedUser = await ds.updateUser(user.id, {
                firstName: firstName,
                lastName: lastName,
                username: username,
                email: email,
                password: password,
            });

            

            // Return the updated user details
            return updatedUser;
        },
        requestBattle: async (_, { userId }, { ds, currentUser }) => {
            console.log(userId);
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
                currentHp: card.hp,
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
                currentHp: card.hp,
                isDead: false,
            }));

            // Initialize the first round
            const firstRound = {
                playerOneCard: null, // No card played yet
                playerTwoCard: null, // No card played yet
                playerOneViewed: false,
                playerTwoViewed: false,
            };

            // Update the battle state to ACTIVE, set playerTwoCards, and add first round
            const updatedBattle = await ds.updateBattle(battleId, {
                state: BattleState.ACTIVE,
                playerTwoCards: playerTwoCards,
                rounds: [firstRound],
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
        viewBattle: async (_, { battleId }, { ds, currentUser }) => {
            // Verify current user
            const viewingUser = await verifyCurrentUser(ds, currentUser);

            // Fetch the battle from the data source
            const battle = await ds.getBattle(battleId);

            if (!battle) {
                throw new Error("Battle not found.");
            }

            // Check if the current user is playerOne or playerTwo in the battle
            const isPlayerOne = battle.playerOneId === viewingUser.id;
            const isPlayerTwo = battle.playerTwoId === viewingUser.id;

            // Iterate over rounds to update view status
            // The viewed flag only needs to be updated in the second to last round but all rounds are iterated over for robustness
            for (let i = 0; i < battle.rounds.length; i++) {
                // Check if round is complete
                const round = battle.rounds[i];
                if (!round.playerOneCard || !round.playerTwoCard) continue;

                if (isPlayerOne && !round.playerOneViewed) {
                    round.playerOneViewed = true;
                } else if (isPlayerTwo && !round.playerTwoViewed) {
                    round.playerTwoViewed = true;
                }
            }

            // Save the updated battle back to the database
            await ds.updateBattle(battleId, {
                rounds: battle.rounds,
            });

            return battle;
        },
        playCardInBattle: async (_, { battleId, battleCardId }, { ds, currentUser }) => {
            // Verify current user
            const user = await verifyCurrentUser(ds, currentUser);

            // Retrieve the battle from the database
            const battle = await ds.getBattle(battleId);

            // Check if the battle exists
            if (!battle) {
                throw new Error("Battle not found");
            }

            // Check if the battle is in the ACTIVE state
            if (battle.state !== BattleState.ACTIVE) {
                throw new Error("Battle is not active");
            }

            // Identify the current round (the last round in the array)
            const currentRound = battle.rounds[battle.rounds.length - 1];

            // Check if the current round is already complete
            if (currentRound.playerOneCard && currentRound.playerTwoCard) {
                throw new Error("Current round is already complete");
            }

            // Determine if the current user is playerOne or playerTwo
            const isPlayerOne = battle.playerOneId === user.id;
            const isPlayerTwo = battle.playerTwoId === user.id;

            if (!isPlayerOne && !isPlayerTwo) {
                throw new Error("User is not a participant in this battle");
            }

            // Update the current round with the played card
            const playedCard = { battleCardId: battleCardId };
            if (isPlayerOne && !currentRound.playerOneCard) {
                // Get and validate the battle card
                const battleCard = battle.playerOneCards.find((battleCard) => battleCard.id === battleCardId);
                if (!battleCard) {
                    throw new Error("Battle card not found in playerOneCards");
                }
                if (battleCard.isDead) {
                    throw new Error("Card cannot be played since it is dead");
                }
                currentRound.playerOneCard = playedCard;
            } else if (isPlayerTwo && !currentRound.playerTwoCard) {
                // Get and validate the battle card
                const battleCard = battle.playerTwoCards.find((battleCard) => battleCard.id === battleCardId);
                if (!battleCard) {
                    throw new Error("Battle card not found in playerTwoCards");
                }
                if (battleCard.isDead) {
                    throw new Error("Card cannot be played since it is dead");
                }
                currentRound.playerTwoCard = playedCard;
            } else {
                throw new Error("You have already played a card this round");
            }

            // If both players have played their cards, resolve the round
            if (currentRound.playerOneCard && currentRound.playerTwoCard) {
                // Get the battle cards
                const playerOneBattleCard = battle.playerOneCards.find(
                    (battleCard) => battleCard.id === currentRound.playerOneCard.battleCardId
                );
                const playerTwoBattleCard = battle.playerTwoCards.find(
                    (battleCard) => battleCard.id === currentRound.playerTwoCard.battleCardId
                );

                // Get the actual cards to find out the damage
                const playerOneCard = await ds.getCard(playerOneBattleCard.cardId);
                const playerTwoCard = await ds.getCard(playerTwoBattleCard.cardId);

                // Set round start HPs
                currentRound.playerOneCard.roundStartHp = playerOneBattleCard.currentHp;
                currentRound.playerTwoCard.roundStartHp = playerTwoBattleCard.currentHp;

                // Apply damage to each card
                playerTwoBattleCard.currentHp -= playerOneCard.attack.damage;
                playerOneBattleCard.currentHp -= playerTwoCard.attack.damage;

                // Check if any card is dead
                if (playerOneBattleCard.currentHp <= 0) {
                    playerOneBattleCard.currentHp = 0;
                    playerOneBattleCard.isDead = true;
                }
                if (playerTwoBattleCard.currentHp <= 0) {
                    playerTwoBattleCard.currentHp = 0;
                    playerTwoBattleCard.isDead = true;
                }

                // Set round end HPs
                currentRound.playerOneCard.roundEndHp = playerOneBattleCard.currentHp;
                currentRound.playerTwoCard.roundEndHp = playerTwoBattleCard.currentHp;

                // Record that the player who played second has viewed the round result
                if (isPlayerOne) currentRound.playerOneViewed = true;
                else currentRound.playerTwoViewed = true;

                // Check if battle is over
                const playerOneRemainCards = battle.playerOneCards.filter((card) => !card.isDead).length;
                const playerTwoRemainCards = battle.playerTwoCards.filter((card) => !card.isDead).length;

                if (playerOneRemainCards === 0 && playerTwoRemainCards === 0) {
                    battle.state = BattleState.TIED;
                } else if (playerOneRemainCards === 0) {
                    battle.state = BattleState.COMPLETED;
                    battle.winnerId = battle.playerTwoId;
                } else if (playerTwoRemainCards === 0) {
                    battle.state = BattleState.COMPLETED;
                    battle.winnerId = battle.playerOneId;
                } else {
                    // Create a new round
                    const newRound = {
                        playerOneCard: null,
                        playerTwoCard: null,
                        playerOneViewed: false,
                        playerTwoViewed: false,
                    };
                    battle.rounds.push(newRound);
                }
            }

            // Update the battle in the database
            await ds.updateBattle(battleId, {
                state: battle.state,
                playerOneCards: battle.playerOneCards, // Update currentHp and isDead
                playerTwoCards: battle.playerTwoCards, // Update currentHp and isDead
                rounds: battle.rounds,
                winnerId: battle.winnerId,
            });

            // Return the updated battle
            return await ds.getBattle(battleId);
        },
        forfeitBattle: async (_, { battleId }, { ds, currentUser }) => {
            // Verify current user
            const forfeitingUser = await verifyCurrentUser(ds, currentUser);

            // Fetch the battle from the data source
            const battle = await ds.getBattle(battleId);

            // Check if the battle exists
            if (!battle) {
                throw new Error("Battle not found.");
            }

            // Check battle is active
            if (battle.state !== BattleState.ACTIVE) {
                throw new Error("Battle is not currently active");
            }

            // Determine if the current user is playerOne or playerTwo
            const isPlayerOne = battle.playerOneId === forfeitingUser.id;
            const isPlayerTwo = battle.playerTwoId === forfeitingUser.id;

            if (!isPlayerOne && !isPlayerTwo) {
                throw new Error("User is not a participant in this battle");
            }

            // Update the battle state and winner
            battle.state = BattleState.FORFEITED;
            if (isPlayerOne) {
                battle.winnerId = battle.playerTwoId;
            } else {
                battle.winnerId = battle.playerOneId;
            }

            // Update the battle in the database
            await ds.updateBattle(battleId, {
                state: battle.state,
                winnerId: battle.winnerId,
            });

            return battle;
        },
        claimPokeAlert: async (_, __, { ds, currentUser }) => {
            // Verify current user
            const user = await verifyCurrentUser(ds, currentUser);

            // Check if the user has a PokeAlert
            if (!user.currentPokeAlert) {
                return false;
            }

            // Check if the PokeAlert has expired
            const currentTime = new Date();
            if (currentTime.toISOString() > user.currentPokeAlert.expiresAt) {
                return false; // PokeAlert has expired
            }

            // Add PokeAlert card to user collection
            user.collection.push({
                cardId: user.currentPokeAlert.cardId,
                inDeck: false,
            })
            const updateResult = await ds.updateUser(user.id, {collection: user.collection});

            if (!updateResult) {
                return false; // Failed to add card to collection
            }

            // Delete PokeAlert
            const updatedUser = await ds.deletePokeAlert(user.id);

            if (!updatedUser) {
                return false; // Failed to delete PokeAlert
            }

            return true;
        },
        deletePokeAlert: async (_, __, { ds, currentUser }) => {
            // Verify current user
            const user = await verifyCurrentUser(ds, currentUser);

            // Check if the user has a PokeAlert
            if (!user.currentPokeAlert) {
                return false;
            }

            // Check if the PokeAlert has expired
            const currentTime = new Date();
            if (currentTime.toISOString() > user.currentPokeAlert.expiresAt) {
                return false; // PokeAlert has expired
            }

            // Delete PokeAlert
            const updatedUser = await ds.deletePokeAlert(user.id);

            if (!updatedUser) {
                return false; // Failed to delete PokeAlert
            }

            return true;
        },
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
        card: async (pokeAlert, _, { ds }) => {
            if (pokeAlert.cardId) return await ds.getCard(pokeAlert.cardId);
            else return pokeAlert.card;
        },
        discoveredAt: (pokeAlert) => pokeAlert.discoveredAt,
        expiresAt: (pokeAlert) => pokeAlert.expiresAt,
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
            const battleCards = await Promise.all(
                battle.playerOneCards.map(async (battleCard) => {
                    // Fetch the card details for each cardId
                    const card = await ds.getCard(battleCard.cardId);
                    return {
                        id: battleCard.id,
                        card: card,
                        currentHp: battleCard.currentHp,
                        isDead: battleCard.isDead,
                    };
                })
            );

            return battleCards;
        },
        playerTwoCards: async (battle, _, { ds }) => {
            // Check if playerTwoCards are present
            if (!battle.playerTwoCards || battle.playerTwoCards.length === 0) {
                return [];
            }

            // Map through playerTwoCards array
            const battleCards = await Promise.all(
                battle.playerTwoCards.map(async (battleCard) => {
                    // Fetch the card details for each cardId
                    const card = await ds.getCard(battleCard.cardId);
                    return {
                        id: battleCard.id,
                        card: card,
                        currentHp: battleCard.currentHp,
                        isDead: battleCard.isDead,
                    };
                })
            );

            return battleCards;
        },
        rounds: async (battle) => {
            return battle.rounds ? battle.rounds : [];
        },
        winner: async (battle, _, { ds }) => {
            if (!battle.winnerId) return null;
            return await ds.getUser(battle.winnerId);
        },
    },
    Round: {
        playerOneCard: (round) => round.playerOneCard, // Complete
        playerTwoCard: (round) => round.playerTwoCard, // Complete
        playerOneViewed: (round) => round.playerOneViewed, // Complete
        playerTwoViewed: (round) => round.playerTwoViewed, // Complete
    },
    BattleCard: {
        id: (battleCard) => battleCard.id,
        card: async (battleCard, _, { ds }) => {
            if (battleCard.cardId) return await ds.getCard(battleCard.cardId);
            else return battleCard.card;
        },
        currentHp: (battleCard) => battleCard.currentHp, // Complete
        isDead: (battleCard) => battleCard.isDead, // Complete
    },
    PlayedCard: {
        battleCard: async (playedCard, _, { ds }) => {
            return await ds.getBattleCard(playedCard.battleCardId);
        },
        roundStartHp: (playedCard) => playedCard.roundStartHp, // Complete
        roundEndHp: (playedCard) => playedCard.roundEndHp, // Complete
    },
};

module.exports = { resolvers };
