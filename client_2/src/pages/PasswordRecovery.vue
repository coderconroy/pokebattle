<template>
  <div class="pokemon-password-recovery">
    <div class="content-container">
      <h1>Password Recovery</h1>
      <div class="password-recovery-form-container">
        <div class="form-header">
          <!-- Optional: Pokémon-themed image or icon here -->
          <h4>Lost your way in the Pokémon world? Enter your email to reset your password.</h4>
        </div>
        <form class="password-recovery-form">
          <div class="form-group">
            <input type="text" placeholder="Enter your email address" class="form-control" />
          </div>
          <div class="button-group">
            <button type="submit" class="submit-button">Reset Password</button>
            <router-link to="/login" class="login-button">Back to Login</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


  
  <script>
  export default {
    name: 'PokemonPasswordRecovery'
  };
  </script>
  
  <style scoped>
  
  /* .pokemon-login {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: url('../assets/pokemon_login.png') center/cover no-repeat;
  } */
  
  /* .password-recovery-form-container {
    padding: 40px;
    background: rgba(255, 255, 255, 0);
    border-radius: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 300px;
  } */


  h1,
  h4,
  .form-header {
    text-align: center;
    margin-bottom: 20px;
    font-weight: bold;
    color: black;
  }
  
  /* .logo {
    width: 205px;
    margin-top: -240px;
  } */
  
  .password-recovery-form {
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

  .pokemon-password-recovery {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: url('../assets/pokemon_login.png') center/cover no-repeat;
  }

  .content-container {
    text-align: center;
    max-width: 400px; /* Adjust as needed */
  }

  /* Adjustments for .password-recovery-form-container, .form-header, etc. */

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Spacing between buttons */
  }

  .submit-button,
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
  width: auto; /* Adjust as needed, or use padding */
  margin: 0 auto; /* Centering buttons */
  color: black;
}
  
  .submit-button:hover,
  .login-button:hover {
    background-color: #ffdd57;
  }
  </style>
  
  