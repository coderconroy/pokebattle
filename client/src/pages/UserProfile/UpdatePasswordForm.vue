<template>
  <card class="card" :title="title">
    <div>
      <form @submit.prevent="updatePassword" class="form-horizontal">
        <div class="form-group row">
          <label for="oldPassword" class="col-md-4 col-form-label">Old Password</label>
          <div class="col-md-8">
            <input type="password" id="oldPassword" v-model="oldPassword" class="form-control" required>
          </div>
        </div>

        <div class="form-group row">
          <label for="newPassword" class="col-md-4 col-form-label">New Password</label>
          <div class="col-md-8">
            <input type="password" id="newPassword" v-model="newPassword" class="form-control" required>
          </div>
        </div>

        <div class="form-group row">
          <label for="confirmPassword" class="col-md-4 col-form-label">Confirm New Password</label>
          <div class="col-md-8">
            <input type="password" id="confirmPassword" v-model="confirmPassword" class="form-control" required>
          </div>
        </div>

        <div class="text-center">
          <p-button type="info" round native-type="submit">
            <i class="fa fa-key"></i> Update Password
          </p-button>
        </div>

      </form>
    </div>
  </card>
</template>

<script>
export default {
  data() {
    return {
      title: "Update Password",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  },
  methods: {
    updatePassword() {
      if (this.newPassword !== this.confirmPassword) {
        alert("New passwords do not match.");
        return;
      }
      // Add logic to handle password update
      alert("Password update requested:",  + JSON.stringify(this.newPassword));
    },
  },
};
</script>

<style>
  /* Add any specific styles for your password update form here */
</style>
