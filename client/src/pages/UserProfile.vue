<template>
  <div class="row">
    <div class="col-xl-4 col-lg-5 col-md-6">
      <user-card> </user-card>
    </div>
    <div class="col-xl-8 col-lg-7 col-md-6">
      <edit-profile-form> </edit-profile-form>
    </div>
    <div class="col-xl-5 col-lg-7 col-md-6">
      <update-password-form> </update-password-form>
    </div>
  </div>
</template>
<script>
import UserCard from "./UserProfile/UserCard.vue";
import EditProfileForm from "./UserProfile/EditProfileForm.vue";
import UpdatePasswordForm from "./UserProfile/UpdatePasswordForm.vue";
export default {
  components: {
    EditProfileForm,
    UserCard,
    UpdatePasswordForm,
  },
};
</script>
<style></style>
