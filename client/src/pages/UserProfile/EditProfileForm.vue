<template>
  <card class="card" title="Edit Profile">
    <div>
      <form @submit.prevent>
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
  mutation UpdateUser($email: String!, $firstName: String!, $lastName: String!, $username: String!) {
    updateUser(email: $email, firstName: $firstName, lastName: $lastName, username: $username) {
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

    const { mutate: updateUser } = useMutation(UPDATE_USER_MUTATION);

    const updateProfile = () => {
      updateUser({
        email: user.value.email,
        firstName: user.value.firstName,
        lastName: user.value.lastName,
        username: user.value.username
      }).then(response => {
        console.log('User updated:', response);
      }).catch(err => {
        console.error('Error updating user:', err);
      });
    };

    return { user, updateProfile, loading, error };
  },
};
</script>


<style></style>

