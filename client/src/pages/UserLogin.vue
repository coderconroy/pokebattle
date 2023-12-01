<template>
    <div class="pokemon-login">
      <div class="login-form-container">
        <div class="form-header">
          <img src="../assets/pokemon_logo.png" alt="Pokémon Logo" class="logo">
          <!-- <h2>Welcome</h2> -->
        </div>
        <form class="login-form" @submit.prevent="onSubmit">
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

          <div class="form-group">
              <input type="text" placeholder="Enter your username" class="form-control" v-model="userData.username" />
          </div>

          <!-- <div class="form-group">
            <input type="text" placeholder="Enter your email" class="form-control" v-model="userData.email" />
          </div> -->
  
          <div class="form-group">
            <input type="password" placeholder="Enter your password" class="form-control" v-model="userData.password" />
          </div>

          <div class="forgot-password">
            <router-link to="/password-recovery">Forgot Password?</router-link>
          </div>
          
          <button type="submit" class="login-button">Log In</button>

          <div class="signup-prompt">
            Don't have an account?
          </div>
          <!-- <button type="submit" class="signup-button">Sign-up</button> -->
          <router-link to="/signup" class="signup-button">Sign-up</router-link>
        </form>
      </div>
    </div>
  </template>
  
<script>
import gql from "graphql-tag";
import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { useRouter } from 'vue-router';

const LOGIN_MUTATION = gql`
    mutation ($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            token
            user {
                username
            }
        }
    }
`;

  export const isAuthenticated = ref(false);
  export default {
    name: 'PokemonLogin',
    setup() {
        const userData = ref({
            username: '',
            // email: '',
            password: '',
        });
        let token = ref("");
        const errorMessage = ref(null);
        const router = useRouter(); // Get the router instance

        const { mutate, onDone, onError } = useMutation(LOGIN_MUTATION);

        // Check if there's a stored token
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            token.value = storedToken;
            isAuthenticated.value = true;
        }

        // Handling the response
        onDone(({ data }) => {
            token.value = data.login.token;
            isAuthenticated.value = true;

            // Store the token in localStorage
            localStorage.setItem('authToken', data.login.token);

            // Handle post-login logic (e.g., redirecting the user)
            router.push({ name: 'home' });
        });

        onError((error) => {
            // Extract and set the error message
            errorMessage.value = error.message || 'An error occurred during login.';
        });

        // Submit handler
        const onSubmit = () => {
            mutate({
                username: userData.value.username,
                // email: userData.value.email,
                password: userData.value.password,
            });
        };

        return { onSubmit, token, userData, errorMessage };
    },
  };
  </script>
  

  <style scoped>

  .pokemon-login {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: url('../assets/pokemon_login.png') center/cover no-repeat;
  }
  
  .login-form-container {
    padding: 40px;
    background: rgba(255, 255, 255, 0);
    border-radius: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 300px;
  }
  
  .form-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .logo {
    width: 205px;
    margin-top: -240px;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-control {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 16px;
  }

  .error-message {
  font-weight: bold;
  color: black;
}
  
  .forgot-password {
  text-align: center; /* Center the link */
  margin-bottom: 10px;
}

.forgot-password a {
  font-size: 14px; /* Smaller font size for the link */
  color: #000000; /* Hyperlink color, adjust as needed */
  text-decoration: underline; /* Underline to indicate it's a clickable link */
  font-weight: bold;
}

  .login-button {
    background-color: #ffcb05; /* Pokémon yellow */
    color: #3b4cca; /* Pokémon blue */
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    cursor: pointer;
    transition: background-color 0.3s;
    color: black;
  }

  .signup-prompt {
    text-align: center; /* Center the text */
    font-size: 16px; /* Adjust the font size as needed */
    font-weight: bold;
    color: black;
    margin-bottom: 5px;
  }


  /* .signup-button {
    background-color: #ffcb05;
    color: #3b4cca;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    cursor: pointer;
    transition: background-color 0.3s;
  } */

  .signup-button {
  /* Existing styles... */
  display: flex;       /* Use flexbox for alignment */
  background-color: #ffcb05;
  justify-content: center; /* Center horizontally */
  align-items: center;     /* Center vertically */
  text-decoration: none;  /* Remove underline from link */
  font-size: 16px;
  font-weight: bold;
  height: 40px;        /* Specify a height */
  line-height: 40px;   /* Line height to match the button height for vertical centering */
  padding: 0 15px;     /* Horizontal padding (adjust as needed) */
  color: black;
}

/* Optional: Adjust for router-link specifically if it behaves differently */
/* .login-button.router-link-active, */
/* .login-button.router-link-exact-active { */
  /* Add any specific styles for active state */
/* } */

  
  .login-button:hover {
    background-color: #ffdd57;
  }

  .signup-button:hover {
    background-color: #ffdd57;
  }
  </style>
  