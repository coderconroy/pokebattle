import { createApp, provide, h } from 'vue';
import { DefaultApolloClient } from '@vue/apollo-composable';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

import App from './App.vue';
import router from './router';

import GlobalComponents from '@/plugins/globalComponents';
import PaperDashboard from "@/plugins/paperDashboard";
import SidebarPlugin from "@/components/SidebarPlugin/index";

// Apollo Client configuration
const cache = new InMemoryCache();
const apolloClient = new ApolloClient({
  cache,
  uri: 'http://localhost:3000/graphql',
});

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

// Mounting the app to the DOM
app.mount('#app');
