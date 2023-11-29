import { createApp } from 'vue';

import App from './App.vue';
import router from './router';

import GlobalComponents from '@/plugins/globalComponents';
import PaperDashboard from "@/plugins/paperDashboard";
import SidebarPlugin from "@/components/SidebarPlugin/index"; 

const app = createApp(App);
  
// Registering a global component

// Using the router and any global plugins
app.use(router);
app.use(GlobalComponents);
app.use(PaperDashboard);
app.use(SidebarPlugin);

// Mounting the app to the DOM
app.mount('#app');


