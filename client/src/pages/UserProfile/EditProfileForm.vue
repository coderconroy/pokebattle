<template>
  <card class="card" title="Edit Profile">
    <div>
      <form @submit.prevent = "updateProfile">
        <div class="row">
          <div class="col-md-6">
            <fg-input
              type="text"
              label="Username"
              placeholder="Username"
              v-model="user.username"
            >
            </fg-input>
          </div>
          <div class="col-md-6">
            <fg-input
              type="email"
              label="Email"
              placeholder="Email"
              v-model="user.email"
            >
            </fg-input>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <fg-input
              type="text"
              label="First Name"
              placeholder="First Name"
              v-model="user.firstName"
            >
            </fg-input>
          </div>
          <div class="col-md-6">
            <fg-input
              type="text"
              label="Last Name"
              placeholder="Last Name"
              v-model="user.lastName"
            >
            </fg-input>
          </div>
        </div>

        <div class="row">
          <div class="col-md-4">
            <fg-input
              type="text"
              label="City"
              placeholder="City"
              v-model="user.city"
            >
            </fg-input>
          </div>
          <div class="col-md-4">
            <fg-input
              type="text"
              label="State"
              placeholder="State"
              v-model="user.state"
            >
            </fg-input>
          </div>
          <div class="col-md-4">
            <fg-input
              type="text"
              label="Country"
              placeholder="Country"
              v-model="user.country"
            >
            </fg-input>
          </div>
        </div>

        <div class="text-center">
          <p-button type="info" round nativeType="submit">
            Update Profile
          </p-button>
        </div>
        <div class="clearfix"></div>
      </form>
    </div>
  </card>
</template>


<script>
import { ref, onMounted } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@vue/apollo-composable';

// GraphQL query for fetching current user details
const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      email
      firstName
      lastName
      username
    }
  }
`;

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUserDetails($firstName: String!, $lastName: String!, $username: String!, $email: String!) {
    updateUserDetails(firstName: $firstName, lastName: $lastName, username: $username, email: $email) {
      email
      firstName
      lastName
      username
  }
}
`;

export default {
  setup() {
    const user = ref({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      city: "",
      state: "",
      country: "",
    });

    const { result, loading, error, refetch } = useQuery(CURRENT_USER_QUERY);

    onMounted(() => {
      refetch().then(response => {

        if (response.data && response.data.currentUser) {
          user.value = { ...response.data.currentUser };
        }
      }).catch(err => {
        console.error('Error fetching user details:', err);
      });
    });

    const { mutate: UpdateUserDetails } = useMutation(UPDATE_USER_MUTATION, {
      onCompleted : () => {
        console.log("compelted")
        refetch();
      }
    });

    const updateProfile = async () => {
      console.log('button pressed');

      // Check if all required fields are provided
      if (!user.value.email || !user.value.firstName || !user.value.lastName || !user.value.username) {
        console.error('All fields are required');
        return; // Exit the function if any field is missing
      }

      try {
        console.log(user.value.email)
        const response = await UpdateUserDetails({
            email: user.value.email,
            firstName: user.value.firstName,
            lastName: user.value.lastName,
            username: user.value.username,
        });
        console.log('User updated:', response);
      } catch (err) {
        console.error('Error updating user:', err);
      }
    };

    return { user, updateProfile, loading, error };
  },
};
</script>


<style></style>

