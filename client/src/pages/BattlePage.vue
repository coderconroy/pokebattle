<!-- <template>
  <div class="battle-container">
    <div v-if="loading">Loading...</div>
    <div v-else-if="battleDetails">
      
      <div class="cards-section">
        <h3>{{ otherUser.username }}'s Cards</h3>
        <div class="health-bar-container">
        <div class="health-bar-label">Health Bar</div>
        <div class="health-bar-outer">
          <div class="health-bar-inner" :style="{ width: otherUserHealthPercentage + '%' }"></div>
        </div>
        <div class="health-label">{{ otherUserCurrentHP }} / {{ otherUserTotalHP }}</div>
      </div>
        <div class="cards-row">
          <div class="card" v-for="n in otherUserCards.length" :key="n">
            <img src="https://i.ebayimg.com/images/g/F1MAAOSwY29jyw~t/s-l1200.webp" alt="Hidden Card">
            <h5>Unknown Card</h5>
          </div>
        </div>
      </div>

     
      <div class="cards-section">
        <h3>Your Cards</h3>
        <div class="health-bar-container">
        <div class="health-bar-label">Health Bar</div>
        <div class="health-bar-outer">
          <div class="health-bar-inner" :style="{ width: currentUserHealthPercentage + '%' }"></div>
        </div>
        <div class="health-label">{{ currentUserCurrentHP }} / {{ currentUserTotalHP }}</div>
      </div>
        <div class="cards-row">
          <div class="card" v-for="card in currentUserCards" :key="card.id" @click="selectCard(card)">
            <img :src="card.card.images.small" alt="Card Image">
            <h5>{{ card.card.name }}</h5>
            <p>HP: {{ card.currentHp }} / {{ card.card.hp }}</p>
            <p>Damage: {{ card.card.attack.damage }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="fetchError">Error: {{ fetchError }}</div>

  
    <div v-if="selectedCard" class="modal">
      <div class="modal-content">
        <span class="close-button" @click="closeModal">&times;</span>
        <p>Selected "{{ selectedCard.card.name }}" card</p>
      </div>
    </div>
  </div>
</template> -->


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
          <div class="card" v-for="n in otherUserCards.length" :key="n">
            <img src="https://i.ebayimg.com/images/g/F1MAAOSwY29jyw~t/s-l1200.webp" alt="Hidden Card">
            <h5>Unknown Card</h5>
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
          <div class="card" v-for="card in currentUserCards" :key="card.id" @click="selectCard(card)">
            <img :src="card.card.images.small" alt="Card Image">
            <h5>{{ card.card.name }}</h5>
            <p>HP: {{ card.currentHp }} / {{ card.card.hp }}</p>
            <p>Damage: {{ card.card.attack.damage }}</p>
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
      </div>
    </div>

    <!-- Dialog for showing round results -->
    <!-- <div v-if="showRoundResultsDialog">
      
    </div> -->
  </div>
</template>




<script>
import { ref, onMounted, computed } from 'vue';
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
    const battleDetails = ref(null);
    const fetchError = ref(null);
    const loading = ref(true);
    const currentUser = ref({username:null});

    const { result, error, refetch } = useQuery(BATTLE_QUERY, 
       { battleId: props.battleId }
    );

    const { result: currentUserResult } = useQuery(CURRENT_USER_QUERY);
    //const [playCard, { loading: playCardLoading, error: playCardError }] = useMutation(PLAY_CARD_MUTATION);

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

    const currentUserIsPlayerOne = computed(() => {
      return currentUser.value && currentUser.value.username === battleDetails.value?.playerOne.username;
    });

    const currentUserCards = computed(() => {
      return currentUserIsPlayerOne.value 
        ? battleDetails.value?.playerOneCards 
        : battleDetails.value?.playerTwoCards;
    });

    const otherUser = computed(() => {
      return currentUserIsPlayerOne.value 
        ? battleDetails.value?.playerTwo 
        : battleDetails.value?.playerOne;
    });

    const otherUserCards = computed(() => {
      return currentUserIsPlayerOne.value 
        ? battleDetails.value?.playerTwoCards 
        : battleDetails.value?.playerOneCards;
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
      return cards.reduce((acc, card) => acc + card.card.hp, 0);
    }

    function sumCurrentHP(cards) {
      return cards.reduce((acc, card) => acc + card.currentHp, 0);
    }

//     const handlePlayerOneAlgorithm = async () => {
//       const latestRound = battleDetails.value.rounds[battleDetails.value.rounds.length - 1];

//       // Check if playerOne has not played a card in the latest round
//       if (!latestRound.playerOneCard) {
//         if (battleDetails.value.rounds.length > 1) {
//           const previousRound = battleDetails.value.rounds[battleDetails.value.rounds.length - 2];

//           // Show results of the previous round if not viewed
//           if (!previousRound.playerOneViewed) {
//             await showDialogWithRoundResults(previousRound);
//             // Player can play a card after closing the dialog
//           }
//         }

//         showCardSelectionUI();
//       }
//     };

//     const handlePlayerTwoAlgorithm = async () => {
//       const latestRound = battleDetails.value.rounds[battleDetails.value.rounds.length - 1];

//       // Check if playerOne has not played a card in the latest round
//       if (!latestRound.playerTwoCard) {
//         if (battleDetails.value.rounds.length > 1) {
//           const previousRound = battleDetails.value.rounds[battleDetails.value.rounds.length - 2];

//           // Show results of the previous round if not viewed
//           if (!previousRound.playerTwoViewed) {
//             await showDialogWithRoundResults(previousRound);
//             // Player can play a card after closing the dialog
//           }
//         }

//         // Allow playerOne to play a card
//         showCardSelectionUI();
//       }
//     };

//     const roundResultsData = ref(null); // Holds the data to be shown in the dialog

// const showDialogWithRoundResults = (round) => {
//   roundResultsData.value = round; // Populate the dialog with round data
//   showRoundResultsDialog.value = true; // Show the dialog
// };

// const closeRoundResultsDialog = () => {
//   showRoundResultsDialog.value = false; // Close the dialog
//   roundResultsData.value = null; // Clear the dialog data
//   // Here you can add logic to fetch new data or update the state
//   // Example: refetchBattle();
// };

// const updateBattleState = (newBattleState) => {
//       battleDetails.value = newBattleState;
//       // Continue the game based on the updated state
//       if (currentUserIsPlayerOne.value) {
//         handlePlayerOneAlgorithm();
//       } else {
//         handlePlayerTwoAlgorithm();
//       }
//     };

//     // Select a card and play it
//     const selectCard = (cardId) => {
//       playCard(
//          { battleId: props.battleId, battleCardId: cardId }
//       ).then(response => {
//         updateBattleState(response.data.playCardInBattle);
//       }).catch(err => {
//         console.error("Error playing card:", err);
//       });
//     };

    return {
      battleDetails,
      fetchError,
      loading,
      currentUser,
      currentUserCards,
      otherUser,
      otherUserCards,
      //selectCard,
      hovering,
      selectedCard,
      closeModal,
      currentUserTotalHP,
      currentUserCurrentHP,
      currentUserHealthPercentage,
      otherUserTotalHP,
      otherUserCurrentHP,
      otherUserHealthPercentage,
      //closeRoundResultsDialog

    };
  }
};
</script>




<style scoped>

.card:hover {
  transform: scale(1.1);
  cursor: pointer;
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

.opponent-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 150px;
  height: 200px;
  text-align: center;
  display: flex;
  flex-direction: column;
  perspective: 1000px;
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

