// main.js or main.ts
import { createApp, provide, h } from 'vue';
import { DefaultApolloClient } from '@vue/apollo-composable';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

import App from './App.vue';
import router from './router';

import GlobalComponents from '@/plugins/globalComponents';
import PaperDashboard from "@/plugins/paperDashboard";
import SidebarPlugin from "@/components/SidebarPlugin/index";

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql', // Replace with your GraphQL server URI
});

// Middleware to attach the token to requests
const authLink = setContext((_, { headers }) => {
  // Retrieve the authentication token from local storage
  const token = localStorage.getItem('authToken');
  // Return the headers to the context so HTTP link can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Apollo Client configuration
const cache = new InMemoryCache();
const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink), // Chain the auth link with the HTTP link
  cache,
});

// Create Vue application
const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },

  render: () => h(App),
});

// Using the router and any global plugins
app.use(router);
app.use(GlobalComponents);
app.use(PaperDashboard);
app.use(SidebarPlugin);

// Mount the Vue app
app.mount('#app');
