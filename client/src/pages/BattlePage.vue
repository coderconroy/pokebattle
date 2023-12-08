


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
    <div class="card" v-for="card in otherUserCards" :key="card.id">
      <!-- Display the actual card image if revealed, else show the hidden card image -->
      <img v-if="card.revealed" :src="card.card.images.small" alt="Card Image">
      <img v-else src="https://i.ebayimg.com/images/g/F1MAAOSwY29jyw~t/s-l1200.webp" alt="Hidden Card">
      
      <!-- Display the actual card name if revealed, else show 'Unknown Card' -->
      <h5 v-if="card.revealed">{{ card.card.name }}</h5>
      <h5 v-else>Unknown Card</h5>
      
      <!-- Display additional card details if revealed -->
      <div v-if="card.revealed">
        <p>HP: {{ card.currentHp }} / {{ card.card.hp }}</p>
        <p>Damage: {{ card.card.attack.damage }}</p>
        <!-- Include any other details you wish to display here -->
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
      <div class="card" v-for="card in currentUserCards" :key="card.id" :class="{ 'grayed-out': card.isDead }">
        <img :src="card.card.images.small" alt="Card Image">
        <h5>{{ card.card.name }}</h5>
        <p>HP: {{ card.currentHp }} / {{ card.card.hp }}</p>
        <p>Damage: {{ card.card.attack.damage }}</p>
        <!-- Select Button for each card -->
        <button @click="onCardSelected(card.id)" :disabled="card.isDead">Select</button>
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

    

    <!-- UI for card selection -->
<div v-if="showCardSelector" class="card-selection-ui">
  

  <div class="cards-row">
    <div class="card" v-for="card in currentUserCards" :key="card.id" :class="{ 'grayed-out': card.isDead === true }">
      <img :src="card.card.images.small" alt="Card Image">
      <h5>{{ card.card.name }}</h5>
      <p>HP: {{ card.currentHp }} / {{ card.card.hp }}</p>
      <p>Damage: {{ card.card.attack.damage }}</p>
      <!-- Select Button for each card -->
      <button @click="onCardSelected(card.id)" :disabled="card.isDead === true">Select</button>
    </div>
  </div>
</div>

<!-- Dialog for round results -->
<div v-if="showDialog && roundDetails.value" class="popup">
  <div class="popup-content">
    <h3>Round Results</h3>
    <p>Card Played by Player One: {{ roundDetails.value.playerOneCard.card.name }}</p>
    <p>Card Played by Player Two: {{ roundDetails.value.playerTwoCard.card.name }}</p>
    <p>Round Start HP: {{ roundDetails.value.roundStartHp }}</p>
    <p>Round End HP: {{ roundDetails.value.roundEndHp }}</p>
    <!-- Close button or timeout logic here -->
  </div>
</div>

<round-status-mini-bar :rounds="battleDetails?.rounds" />
      
    </div> 
  
</template>




<script>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import RoundStatusMiniBar from '../components/RoundStatusMiniBar.vue';
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

  components: {
    RoundStatusMiniBar
  },
  setup(props) {
    const battleDetails = ref(null);
    const fetchError = ref(null);
    const loading = ref(true);
    const currentUser = ref({username:null});
    const selectedCard = ref(null);
    const showDialog = ref(false);
    const roundDetails = ref(null);

    const { result, error, refetch } = useQuery(BATTLE_QUERY, 
       { battleId: props.battleId }
    );

    const { result: currentUserResult } = useQuery(CURRENT_USER_QUERY);
    const { mutate: playCard } = useMutation(PLAY_CARD_MUTATION, {
      onCompleted: (data) => {
        console.log("Play card mutation completed", data);
        // Optionally, you might want to refetch queries or update local state here
      },
      onError: (error) => {
        console.error("Error playing card:", error);
      }
    });


    const intervalId = ref(null);

    // Method to fetch the latest battle data
    const fetchBattleData = async () => {
      try {
        await refetch();
        // Add any additional logic if needed after refetching
      } catch (err) {
        console.error("Error fetching battle data:", err);
      }
    };

    // onMounted(async () => {
    //   try {
    //     await refetch();
    //     if (result.value) {
    //       battleDetails.value = result.value.battle;
    //     }
    //     if (currentUserResult.value) {
    //       currentUser.value.username = currentUserResult.value.currentUser.username;
    //     }
    //     if (currentUser.value.username === battleDetails.value.playerOne.username) {
    //       handlePlayerOneAlgorithm();
    //     } else if (currentUser.value.username === battleDetails.value.playerTwo.username) {
    //       handlePlayerTwoAlgorithm();
    //     }

    //     intervalId.value = setInterval(fetchBattleData, 5000);
    //     console.log(currentUserCards.value);
        
    //   } catch (err) {
    //     fetchError.value = err.message;
    //   } finally {
    //     loading.value = false;
    //   }
    // });

    const fetchAndProcessBattleData = async () => {
      try {
        await refetch();
        if (result.value) {
          battleDetails.value = result.value.battle;
        }
        if (currentUserResult.value) {
          currentUser.value.username = currentUserResult.value.currentUser.username;
        }
        if (currentUser.value.username === battleDetails.value.playerOne.username) {
          handlePlayerOneAlgorithm();
        } else if (currentUser.value.username === battleDetails.value.playerTwo.username) {
          handlePlayerTwoAlgorithm();
        }
        console.log(currentUserCards.value);
      } catch (err) {
        fetchError.value = err.message;
      }finally {
    loading.value = false;
    console.log('Loading state updated:', loading.value);
  }
    };

    onMounted(async () => {
      await fetchAndProcessBattleData();
      intervalId.value = setInterval(fetchAndProcessBattleData, 5000);
    });

    onBeforeUnmount(() => {
      // Clear the interval when the component is about to unmount
      if (intervalId.value) {
        clearInterval(intervalId.value);
      }
    });

    const { mutate: viewBattle } = useMutation(VIEW_BATTLE_MUTATION, {
      onCompleted: (data) => {
       
        
        // Optionally, update local state or refetch queries here
        refetch();
      },
      onError: (error) => {
        console.error("Error viewing battle:", error);
      }
    });



    const handlePlayerOneAlgorithm = async () => {
      
      const rounds = battleDetails.value.rounds;
      console.log(rounds);
     
      const latestRound = rounds[rounds.length - 1];
      
      console.log(latestRound.playerOneCard);
      if(latestRound.playerOneCard === null){
        if(rounds.length>1){
          const previousRound = rounds[rounds.length - 2];
          console.log(previousRound);
          

          if(!previousRound.playerOneViewed){
            console.log("not viewed");
            
            showDialogWithRoundResults(previousRound);
            await viewBattle({ battleId: props.battleId  });
        // Update battle details after viewing the battle
            refetch(); // Assuming refetch() is the method to update battleDetails
          }
          else{
         
          showCardSelectionUI();
          refetch();
          }
        } else if(rounds.length == 1){
       
          showCardSelectionUI();
          refetch();
        }
      } else{
      
        alert("cannot play card");
      }
  
     
  

    
 
    };

    const handlePlayerTwoAlgorithm = async () => {
      
      const rounds = battleDetails.value.rounds;
      const latestRound = rounds[rounds.length - 1];
      
      
      if(latestRound.playerTwoCard === null){
        if(rounds.length>1){
          const previousRound = rounds[rounds.length - 2];
          console.log(previousRound);
          

          if(!previousRound.playerTwoViewed){
            console.log("not viewed")
            showDialogWithRoundResults(previousRound);
            await viewBattle({ battleId: props.battleId } );
        // Update battle details after viewing the battle
            refetch(); // refetch() is the method to update battleDetails
          }
          else{
         
          showCardSelectionUI();
          refetch();
        }

        } else if(rounds.length == 1){
        
          showCardSelectionUI();
          refetch();
        }
      } else{
 
        alert("cannot play card");
      }
  
     
  

    
 
    };

    const initializeCards = (cards) => {
  return cards.map(card => ({ ...card, revealed: false }));
};



    const showDialogWithRoundResults = (round) => {
      console.log("entering dialog box");
      console.log(round);
      roundDetails.value = round;
      showDialog.value = true;
      console.log("dialog");

      setTimeout(() => {
      showDialog.value = false;
      }, 10000);
    };

    const closeDialog = () => {
      showDialog.value = false;
      roundDetails.value = null; // Optionally reset the round details
    };
      

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
    //const selectedCard = ref(null);

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

    // Reactive state to control the visibility of card selection UI
const showCardSelector = ref(false);

const showCardSelectionUI = () => {

  // Set showCardSelector to true to display the card selection interface in the template
  showCardSelector.value = true;
};


const onCardSelected = (selectedCardId) => {


  if (!selectedCardId) {
    console.error("Selected Card ID is undefined or null.");
    return;
  }

  playCard({battleId: props.battleId, battleCardId: selectedCardId })
    .then(response => {
 
      battleDetails.value = response.data.playCardInBattle;
      showCardSelector.value = false;
    })
    .catch(err => {
      console.error("Error playing card:", err);
      alert(`Error: ${err.message}`);
    });
};

const processRoundResults = (roundResults) => {
  // Example logic - modify according to your actual data structure
  otherUserCards.forEach(card => {
    if (roundResults.playerOneCard.battleCard?.id === card.id || roundResults.playerTwoCard.battleCard?.id === card.id) {
      card.revealed = true;
    }
  });

  // Update the state to reflect the changes
  otherUserCards = [...otherUserCards];
};


    // Method to set the selected card
    const setSelectedCard = (card) => {
     
      selectedCard.value = card;
      // You might trigger some UI change here to show the card is selected
    };

    

    const updateRevealedCards = () => {
  if (battleDetails.value && battleDetails.value.rounds) {
    const lastRound = battleDetails.value.rounds[battleDetails.value.rounds.length - 1];
    
    otherUserCards.value.forEach(card => {
      if (lastRound.playerOneCard.battleCard.id === card.id || lastRound.playerTwoCard.battleCard.id === card.id) {
        card.revealed = true;
      }
    });
  }
};

    console.log(showDialog.value);


    


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
      handlePlayerOneAlgorithm,
      handlePlayerTwoAlgorithm,
      showCardSelectionUI,
      onCardSelected,
      setSelectedCard,
      playCard,
      showDialogWithRoundResults,
      closeDialog,
      viewBattle,
      showDialog,
      processRoundResults,
      otherUserCards,
      initializeCards,
      updateRevealedCards,
      intervalId,
      fetchBattleData,
      onBeforeUnmount,
      fetchAndProcessBattleData

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

.dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's on top */
}

.dialog-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
}

.grayed-out {
  filter: grayscale(100%); /* Convert the image to grayscale */
  pointer-events: none; /* Disable interactions with the card */
}

.grayed-out button {
  background-color: #ccc; /* Gray background for the button */
  color: #666; /* Darker text color to indicate it's disabled */
  cursor: not-allowed; /* Change the cursor to indicate it's not clickable */
}

popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .popup-content {
    text-align: center;
  }




</style>

