<template>
  <div class="battle-container">
    <div v-if="loading">Loading...</div>
    <div v-else-if="battleDetails">
      <!-- Other User's Cards (hidden) -->
      <div class="cards-section">
        <h3 class="card-title">{{ otherUser.username }}'s Cards</h3>
        <div class="health-bar-container">
          <div class="health-bar-label">Health Bar</div>
          <div class="health-bar-outer">
            <div class="health-bar-inner" :style="{ width: otherUserHealthPercentage + '%' }"></div>
          </div>
          <div class="health-label">{{ otherUserCurrentHP }} / {{ otherUserTotalHP }}</div>
        </div>
        <div class="cards-row">
          <!-- <div class="card" v-for="n in otherUserCards.length" :key="n"> -->
          <div v-for="card in otherUserCards" :key="card.id">
            <div :class="{ 'opp-card': true, 'dead-card': isCardDead(card) }">
            <img src="https://i.ebayimg.com/images/g/F1MAAOSwY29jyw~t/s-l1200.webp" alt="Hidden Card">
            <h5>Unknown Card</h5>
            </div>
          </div>
        </div>
      </div>

      <!-- Current User's Cards -->
      <div class="cards-section">
        <h3 class="card-title">Your Cards</h3>
        <div class="health-bar-container">
          <div class="health-bar-label">Health Bar</div>
          <div class="health-bar-outer">
            <div class="health-bar-inner" :style="{ width: currentUserHealthPercentage + '%' }"></div>
          </div>
          <div class="health-label">{{ currentUserCurrentHP }} / {{ currentUserTotalHP }}</div>
        </div>
        <div class="cards-row">
          <!-- <div class="card" v-for="card in currentUserCards" :key="card.id" @click="selectCard(card)"> -->
          <div v-for="card in currentUserCards" :key="card.id">
            <div :class="{ 'card': true, 'dead-card': isCardDead(card) }" @click="isCardDead(card) ? null : selectCard(card)">
              <img :src="card.card.images.small" alt="Card Image">
              <h5>{{ card.card.name }}</h5>
              <p>HP: {{ card.currentHp }} / {{ card.card.hp }}</p>
              <p>Damage: {{ card.card.attack.damage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="fetchError">Error: {{ fetchError }}</div>

    <!-- Modal for selected card -->
    <div v-if="selectedCard" class="modal">
      <div class="modal-content">
        <span class="close-button" @click="closeModal">&times;</span>
        <p>Selected "{{ selectedCard.card.name }}" card</p>
        <!-- Allow playing card if conditions are met -->
        <!-- <button v-if="canPlayCard" @click="handlePlayCard">Play Card</button> -->
        <button @click="handlePlayCard">Play Card</button>

      </div>
    </div>

    <!-- Dialog for showing round results -->
    <div v-if="showResultDialog" class="modal">
      <div class="modal-content">
        <p>{{ resultDialogMessage }}</p>
        <button @click="handleResultDialogAction">View</button>
        <!-- <button @click="closeResultDialog">No</button> -->
      </div>
    </div>
    <!-- Dialog for showing round results -->
    <div v-if="showTurnDialog" class="modal">
      <div class="modal-content">
        <p>{{ turnDialogMessage }}</p>
        <button @click="handleTurnDialogAction">Yes</button>
        <!-- <button @click="closeTurnDialog">No</button> -->
      </div>
    </div>
    <!-- Dialog for opponent's turn -->
    <div v-if="showOppTurnDialog" class="modal">
      <div class="modal-content">
        <p>{{ oppTurnDialogMessage }}</p>
      </div>
    </div>
    <!-- <div v-if="gameEnded" class="modal">
      <div class="modal-content">
        <p>Winner: {{ winner }}</p>
        <button @click="goToHome">Go to Home</button>
      </div>
    </div> -->
    <!-- <div v-if="latestRound && (latestRound.playerOneCard || latestRound.playerTwoCard)">
      <p>{{ resultDialogMessage }}</p>
      <button v-if="latestRound.playerOneCard && latestRound.playerTwoCard" @click="handleViewResults">View Results</button>
    </div> -->
  </div>
</template>

<script>
import { ref, onMounted, computed, watchEffect, onUnmounted } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const BATTLE_QUERY = gql`
  query Query($battleId: ID!) {
    battle(id: $battleId) {
      playerOne {
        username
      }
      playerTwo {
        username
      }
      playerOneCards {
        card {
          attack {
            damage
            name
          }
          images {
            small
          }
          id
          name
          hp
        }
        currentHp
        id
        isDead
      }
      playerTwoCards {
        card {
          attack {
            damage
            name
          }
          images {
            small
          }
          id
          name
          hp
        }
        currentHp
        id
        isDead
      }
      rounds {
        playerOneCard {
          battleCard {
            id
            isDead
            card {
              name
            }
          }
          roundEndHp
          roundStartHp
        }
        playerOneViewed
        playerTwoCard {
          battleCard {
            id
            card {
              name
            }
            isDead
          }
          roundEndHp
          roundStartHp
        }
        playerTwoViewed
      }
    }
  }
`;

const VIEW_BATTLE_MUTATION = gql`
  mutation ViewBattle($battleId: ID!) {
    viewBattle(battleId: $battleId) {
      playerOne {
        username
      }
      playerTwo {
        username
      }
      playerOneCards {
        card {
          attack {
            damage
            name
          }
          images {
            small
          }
          id
          name
          hp
        }
        currentHp
        id
        isDead
      }
      playerTwoCards {
        card {
          attack {
            damage
            name
          }
          images {
            small
          }
          id
          name
          hp
        }
        currentHp
        id
        isDead
      }
      rounds {
        playerOneCard {
          battleCard {
            id
            isDead
            card {
              name
            }
          }
          roundEndHp
          roundStartHp
        }
        playerOneViewed
        playerTwoCard {
          battleCard {
            id
            card {
              name
            }
            isDead
          }
          roundEndHp
          roundStartHp
        }
        playerTwoViewed
      }
    }
  }
`;

const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      username
    }
  }
`;

const PLAY_CARD_MUTATION = gql`
  mutation PlayCardInBattle($battleId: ID!, $battleCardId: ID!) {
    playCardInBattle(battleId: $battleId, battleCardId: $battleCardId) {
      playerOne {
        username
      }
      playerTwo {
        username
      }
      playerOneCards {
        card {
          attack {
            damage
            name
          }
          images {
            small
          }
          id
          name
          hp
        }
        currentHp
        id
        isDead
      }
      playerTwoCards {
        card {
          attack {
            damage
            name
          }
          images {
            small
          }
          id
          name
          hp
        }
        currentHp
        id
        isDead
      }
      rounds {
        playerOneCard {
          battleCard {
            id
            isDead
            card {
              name
            }
          }
          roundEndHp
          roundStartHp
        }
        playerOneViewed
        playerTwoCard {
          battleCard {
            id
            card {
              name
            }
            isDead
          }
          roundEndHp
          roundStartHp
        }
        playerTwoViewed
      }
    }
  }
`;

export default {
  props: {
    battleId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const battleDetails = ref({});
    const fetchError = ref(null);
    const loading = ref(true);
    const currentUser = ref({ username: null });
    const showResultDialog = ref(false); // Initialize with a default value, false in this case
    const resultDialogMessage = ref(''); // Initialize with a default empty string
    const showTurnDialog = ref(false); // Initialize with a default value, false in this case
    const turnDialogMessage = ref(''); // Initialize with a default empty string
    const showOppTurnDialog = ref(false);
    const oppTurnDialogMessage = ref('');
    const hasTurnNotificationBeenShown = ref(false);
    const { result, error, refetch } = useQuery(BATTLE_QUERY, { battleId: props.battleId });
    const { result: currentUserResult } = useQuery(CURRENT_USER_QUERY);
    const { mutate: viewBattle } = useMutation(VIEW_BATTLE_MUTATION);
    const { mutate: playCard } = useMutation(PLAY_CARD_MUTATION);

    onMounted(async () => {
      try {
        await refetch();
        if (result.value) {
          battleDetails.value = result.value.battle;
        }
        if (currentUserResult.value) {
          currentUser.value.username = currentUserResult.value.currentUser.username;
        }
      } catch (err) {
        fetchError.value = err.message;
      } finally {
        loading.value = false;
      }
    });

    // Check if battleDetails.value is valid before computing
    const isValidBattleDetails = () => battleDetails.value && battleDetails.value.playerOne && battleDetails.value.playerTwo;
    // const isValidBattleDetails = () => battleDetails.value && typeof battleDetails.value === 'object';

    const currentUserIsPlayerOne = computed(() => {
      console.log("currentUser.value.username", currentUser.value.username)
      console.log("battleDetails.value.playerOne.username", battleDetails.value.playerOne.username)
      return isValidBattleDetails() && currentUser.value.username === battleDetails.value.playerOne.username;
    });

    // Return empty array if battleDetails.value or playerOneCards/playerTwoCards is not available
    const currentUserCards = computed(() => {
      console.log("currentUserIsPlayerOne", currentUserIsPlayerOne.value)
      return isValidBattleDetails() ? (currentUserIsPlayerOne.value ? battleDetails.value.playerOneCards : battleDetails.value.playerTwoCards) : [];
    });

    const otherUser = computed(() => {
      return isValidBattleDetails() ? (currentUserIsPlayerOne.value ? battleDetails.value.playerTwo : battleDetails.value.playerOne) : null;
    });

    const otherUserCards = computed(() => {
      return isValidBattleDetails() ? (currentUserIsPlayerOne.value ? battleDetails.value.playerTwoCards : battleDetails.value.playerOneCards) : [];
    });

    // Use optional chaining to safely access properties
    const latestRound = computed(() => {
      return battleDetails.value?.rounds?.[battleDetails.value.rounds.length - 1];
    });


    const hovering = ref(false);
    const selectedCard = ref(null);

    const selectCard = (card) => {
      selectedCard.value = card;
    };

    const closeModal = () => {
      selectedCard.value = null;
    };
    
    const currentUserTotalHP = computed(() => sumHP(currentUserCards.value));
    const currentUserCurrentHP = computed(() => sumCurrentHP(currentUserCards.value));
    const currentUserHealthPercentage = computed(() => {
      return (currentUserCurrentHP.value / currentUserTotalHP.value) * 100;
    });

    const otherUserTotalHP = computed(() => sumHP(otherUserCards.value));
    const otherUserCurrentHP = computed(() => sumCurrentHP(otherUserCards.value));
    const otherUserHealthPercentage = computed(() => {
      return (otherUserCurrentHP.value / otherUserTotalHP.value) * 100;
    });

    function sumHP(cards) {
      return Array.isArray(cards) ? cards.reduce((acc, card) => acc + card.card.hp, 0) : 0;
    }

    function sumCurrentHP(cards) {
      return Array.isArray(cards) ? cards.reduce((acc, card) => acc + card.currentHp, 0) : 0;
    }

    // Function to close the dialog
    const closeResultDialog = () => {
      showResultDialog.value = false; // Set the state to false to close the dialog
      // You can add other logic here if needed
    };

    const isCardDead = (card) => {
      return card.isDead;
    };

    // const gameEnded = computed(() => {
    //   return battleDetails.value.playerOneCards.value.isDead || battleDetails.value.playerTwoCards.value.isDead;
    // });

    // const gameEnded = computed(() => {
    //   const allPlayerOneCardsDead = battleDetails.value.playerOneCards?.every(card => card.isDead);
    //   const allPlayerTwoCardsDead = battleDetails.value.playerTwoCards?.every(card => card.isDead);

    //   return allPlayerOneCardsDead || allPlayerTwoCardsDead;
    // });


    // const winner = computed(() => {
    //   if (!gameEnded.value) 
    //     return null;

    //   return battleDetails.value.winner;
    // });

    const goToHome = () => {
      router.push('/home'); // Replace '/home' with the path to your home page
    };


    const canPlayCard = computed(() => {
      if (
        battleDetails.value &&
        battleDetails.value.rounds &&
        battleDetails.value.rounds.length > 0
      ) {
        const latestRound = battleDetails.value.rounds[battleDetails.value.rounds.length - 1];
        return !latestRound.playerOneCard && !latestRound.playerTwoCard;
      }
      return false;
    });

    const handleResultDialogAction = () => {
      // Close the dialog
      showResultDialog.value = false;

      // Additional logic for enabling the card selection goes here
      // For example, highlighting available cards or setting a state 
      // to indicate that the user can now select a card to play
    };

    const handleTurnDialogAction = () => {
      // Close the dialog
      showTurnDialog.value = false;

      // Additional logic for enabling the card selection goes here
      // For example, highlighting available cards or setting a state 
      // to indicate that the user can now select a card to play
    };


    const handlePlayCard = async () => {
      console.log('handlePlayCard function called');

      // Check if a card is selected before proceeding
      if (!selectedCard.value || !selectedCard.value.id) {
        console.error('No card selected or card ID is missing');
        return; // Exit the function if no card is selected or if card ID is missing
      }

      try {
        const { data, error } = await playCard({
          battleId: props.battleId,
          battleCardId: selectedCard.value.id
        });

        // Check if the mutation was successful
        if (data && data.playCardInBattle) {
          closeModal();
          await refetch(); // Ensure the latest game state is fetched
          console.log('You played a card');
          console.log("Updated battle details:", battleDetails.value);
        } else {
          // Log the error from the mutation if it's present
          if (error) {
            console.error('Error playing card:', error);
          } else {
            console.error('Error: Mutation did not return expected data');
          }
        }
      } catch (error) {
        console.error('Error playing card:', error);
      }
    };

    // Added: Function to determine if it's the current user's turn
    const isCurrentUserTurn = computed(() => {
      if (isValidBattleDetails()) {
        const latestRound = battleDetails.value.rounds[battleDetails.value.rounds.length - 1];
        
        console.log("Latest Round:", latestRound);
        console.log("Current User:", currentUser.value.username);
        console.log("Player One:", battleDetails.value.playerOne.username);
        console.log("Player Two:", battleDetails.value.playerTwo.username);

        // Determine if it's the current user's turn based on the latest round state
        let currentUserTurn = false;
        if (currentUserIsPlayerOne.value) {
          currentUserTurn = !latestRound.playerOneCard;
          console.log("latestRound.playerOneCard: ", latestRound.playerOneCard);
        } else {
          currentUserTurn = !latestRound.playerTwoCard;
          console.log("latestRound.playerTwoCard: ", latestRound.playerTwoCard);
        }

        console.log("Is Current User's Turn:", currentUserTurn);
        return currentUserTurn;
      }
      return false;
    });


    const handleViewResults = async () => {
      try {
        await viewBattle({
          battleId: props.battleId
        });
        // Optionally, refetch battle details or handle updated data here
        await refetch();
        showResultDialog.value = false; // Hide the dialog after viewing results
      } catch (err) {
        console.error('Error viewing battle:', err);
      }
    };



    watchEffect(() => {
      const pollInterval = setInterval(async () => {
        await refetch();

        if (isValidBattleDetails()) {
          const latestRound = battleDetails.value.rounds[battleDetails.value.rounds.length - 1];
          let isCurrentUserTurn_status = isCurrentUserTurn.value;
          console.log("isCurrentUserTurn_status", isCurrentUserTurn_status)
          if (isCurrentUserTurn_status && !hasTurnNotificationBeenShown.value) {
            showOppTurnDialog.value = false;
            showResultDialog.value = false;
            showTurnDialog.value = true;
            turnDialogMessage.value = 'It\'s your turn! Select a card to play.';
            hasTurnNotificationBeenShown.value = true;
          } else if ((!latestRound.playerOneCard || !latestRound.playerTwoCard) && !isCurrentUserTurn_status) {
            showTurnDialog.value = false;
            showResultDialog.value = false;
            showOppTurnDialog.value = true;
            oppTurnDialogMessage.value = 'Waiting for the opponent to play.';
          } else if (latestRound.playerOneCard && latestRound.playerTwoCard) {
            showOppTurnDialog.value = false;
            showTurnDialog.value = false;
            showResultDialog.value = true;
            resultDialogMessage.value = 'Round results are ready. Do you want to view them?';
          }
        }
      }, 5000);

      onUnmounted(() => {
        clearInterval(pollInterval);
      });
    });



    return {
      battleDetails,
      fetchError,
      loading,
      currentUser,
      currentUserCards,
      otherUser,
      otherUserCards,
      hovering,
      selectCard,
      selectedCard,
      closeModal,
      isCardDead,
      currentUserTotalHP,
      currentUserCurrentHP,
      currentUserHealthPercentage,
      otherUserTotalHP,
      otherUserCurrentHP,
      otherUserHealthPercentage,
      canPlayCard,
      handlePlayCard,
      isCurrentUserTurn,
      showResultDialog,
      showTurnDialog,
      showOppTurnDialog,
      latestRound,
      handleViewResults,
      resultDialogMessage,
      oppTurnDialogMessage,
      turnDialogMessage,
      // gameEnded,
      // winner,
      goToHome,
      handleTurnDialogAction,
      handleResultDialogAction,
      closeResultDialog
    };
  }
};
</script>


<style scoped>

  .card:hover {
    transform: scale(1.1);
    cursor: pointer;
  }
  
  .dead-card {
  opacity: 0.5; /* Grey out the card */
  pointer-events: none; /* Make the card non-interactive */
  /* Additional styling for dead card */
}

  .hover-dialog {
    position: absolute;
    /* Adjust positioning as needed */
  }
  
  .health-bar-container {
    width: 200px; /* Adjust for desired width */
    position: relative;
    margin: 10px 0;
  }
  
  .health-bar-label {
    font-size: 0.8em;
    color: #333;
    margin-bottom: 5px;
    text-align: center; /* Center the label above the bar */
  }
  
  .health-bar-outer {
    background-color: #eee;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .health-bar-inner {
    height: 20px;
    background-color: #4caf50; /* Green color for health */
    border-radius: 4px;
    transition: width 0.3s ease-in-out;
  }
  
  .health-label {
    position: absolute;
    right: 5px;
    bottom: -20px; /* Adjust this value as needed to move the label below the bar */
    color: white;
    font-weight: bold;
    background: rgba(0, 0, 0, 0.6); /* Optional: Adds a background for better readability */
    padding: 2px 5px; /* Optional: Adds padding around the text */
    border-radius: 4px; /* Optional: Rounds the corners of the label background */
  }
  .modal {
    display: block; /* Hidden by default; can use v-show or v-if in template */
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
  }
  
  .modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
  }
  
  .close-button {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }
  
  .close-button:hover,
  .close-button:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }
  .battle-container {
    padding: 20px;
  }
  
  .health-bar-container {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .health-bar {
    width: 100%;
    background-color: #eee;
    border-radius: 4px;
  }
  
  .health {
    height: 20px;
    border-radius: 4px;
    transition: width 0.5s ease, background-color 0.5s ease;
  }
  
  
  .cards-section {
    text-align: center;
  }
  
  .cards-row {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  
  .card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    width: 150px;
    height: 400px;
    text-align: center;
    display: flex;
    flex-direction: column;
    perspective: 1000px;
  }
  
  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }
  
  .card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
  }
  
  .card-back {
    transform: rotateY(180deg);
  }
  
  .is-flipped {
    transform: rotateY(180deg);
  }
  
  .card-content img {
    width: 100%;
    max-height: 60%;
    object-fit: contain;
    border-radius: 5px;
    margin-bottom: 10px;
  }
  
  .card-selection {
    margin-top: auto;
  }
  
  .opp-card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    width: 150px;
    height: 250px;
    text-align: center;
    display: flex;
    flex-direction: column;
    perspective: 1000px;
    pointer-events: none; 
  }
  
  .opponent-card-content img {
    width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 5px;
    margin-bottom: 10px;
  }
  
  .opponent-card-image {
    width: 100%;  /* Full width of the card */
    height: 100%; /* Full height of the card */
  }
  
  .card-title {
    font-weight: 900; /* Maximum boldness */
    color: #333; /* Dark color; adjust as needed */
    font-size: 1.5em; /* Larger font size */
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Optional: Text shadow for better visibility */
  }
  
  
  </style>
  

