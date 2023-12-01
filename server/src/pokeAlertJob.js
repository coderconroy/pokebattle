const cron = require("node-cron");

const PA_SELECT_USER_FRAC = 1; // Fraction of users without alerts to generate alerts for
const PA_JOB_FREQ = "*/20 * * * * *"; // Frequency of execution of the poke alert job (10 seconds)
const PA_LIFETIME = 10 * 1000; // Lifetime of poke alert before expiry (15 seconds)

class PokeAlertJob {
    constructor(dataSource) {
        this.ds = dataSource;
    }

    start() {
        cron.schedule(PA_JOB_FREQ, async () => {
            const deleted = await this.deleteExpiredPokeAlerts();
            const created = await this.generatePokeAlerts();
            const currentTime = new Date();
            console.log(
                `${currentTime.toISOString()}: PokeAlert Job | ${created} PokeAlerts created | ${deleted} PokeAlerts expired`
            );
        });
        console.log("PokeAlert scheduled job started");
    }

    async deleteExpiredPokeAlerts() {
        const currentTime = new Date();
        try {
            // Update user documents by removing expired PokeAlerts
            const result = await this.ds._db
                .collection("user")
                .updateMany(
                    { "currentPokeAlert.expiresAt": { $lte: currentTime.toISOString() } },
                    { $unset: { currentPokeAlert: "" } }
                );

            return result.modifiedCount;
        } catch (error) {
            throw new Error(`Failed to delete expired PokeAlerts: ${error.message}`);
        }
    }

    async generatePokeAlerts() {
        try {
            // Fetch all users
            const allUsers = await this.ds.getUsers();

            // Filter to get users without a current PokeAlert
            const usersWithoutAlerts = allUsers.filter((user) => !user.currentPokeAlert);

            // Calculate the number of users to generate alerts for
            const numUsersToAlert = Math.ceil(usersWithoutAlerts.length * PA_SELECT_USER_FRAC);

            // Randomly select users
            const selectedUsers = this.getRandomSubset(usersWithoutAlerts, numUsersToAlert);

            // Generate and assign new PokeAlerts for selected users
            for (const user of selectedUsers) {
                // Find card not in the user's collection
                const availableCardId = await this.findAvailableCardId(user.id);

                if (availableCardId) {
                    await this.ds.createPokeAlert(user.id.toString(), { cardId: availableCardId }, PA_LIFETIME);
                }
            }

            return numUsersToAlert;
        } catch (error) {
            throw new Error(`Error generating new PokeAlerts: ${error.message}`);
        }
    }

    getRandomSubset(arr, n) {
        const shuffled = arr.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    async findAvailableCardId(userId) {
        try {
            // Fetch user's collection
            const user = await this.ds.getUser(userId);
            if (!user || !user.collection) {
                throw new Error(`User with ID ${userId} not found or has no collection`);
            }

            // Fetch all cards
            const allCards = await this.ds.getCards();

            // Filter out cards already in the user's collection
            const availableCards = allCards.filter(
                (card) => !user.collection.some((collectionCard) => collectionCard.cardId === card.id)
            );

            if (availableCards.length === 0) {
                return null;
            }

            // Randomly select a card ID from the available cards
            const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
            return randomCard.id;
        } catch (error) {
            throw new Error(`Error finding an available card ID: ${error.message}`);
        }
    }
}

module.exports = { PokeAlertJob };
