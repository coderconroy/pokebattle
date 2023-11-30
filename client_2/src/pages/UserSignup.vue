<template>
    <div class="pokemon-login">
      <div class="login-form-container">
        <div class="form-header">
          <img src="../assets/pokemon_logo.png" alt="Pokémon Logo" class="logo">
          <!-- <h2>Welcome</h2> -->
        </div>
        <form class="login-form">

          <div class="form-group">
            <input type="text" placeholder="Enter your name" class="form-control" />
          </div>

          <div class="form-group">
            <input type="text" placeholder="Enter your email" class="form-control" />
          </div>
  
          <div class="form-group">
            <input type="password" placeholder="Enter your password" class="form-control" />
          </div>
          
          <button type="submit" class="signup-button">Sign-up</button>

          <div class="login-prompt">
            Already have an account?
          </div>

          <router-link to="/login" class="login-button">Go to login page</router-link>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PokemonSignup'
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
  
  .signup-button {
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

  .login-prompt {
    text-align: center; /* Center the text */
    font-size: 16px; /* Adjust the font size as needed */
    font-weight: bold;
    margin-bottom: 5px;
    color: black;
  }

  .login-button {
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
  
  .login-button:hover {
    background-color: #ffdd57;
  }

  .signup-button:hover {
    background-color: #ffdd57;
  }
  </style>
  