import { createRouter, createWebHistory } from "vue-router";

import Login from '@/pages/UserLogin.vue';
import Signup from '@/pages/UserSignup.vue';
import PasswordRecovery from '@/pages/PasswordRecovery.vue';

import DashboardLayout from "@/layout/dashboard/DashboardLayout.vue";
import UserProfile from "@/pages/UserProfile.vue";
import CardCollection from "@/pages/CardCollection.vue";
import BattleRequests from "@/pages/BattleRequests.vue";
import BattleHistory from "@/pages/BattleHistory.vue";
import BattlePage from "@/pages/BattlePage.vue";
// import Notifications from "@/pages/UserNotifications.vue";
import PokeDiscovered from "@/pages/PokeDiscovered.vue";
import UserHome from "@/pages/HomePage.vue";

import { isAuthenticated } from '@/pages/UserLogin.vue';

function requireAuth(to, from, next) {
  console.log(`Authenticated (router): ${isAuthenticated.value}`);
  if (isAuthenticated.value) {
    // User is authenticated, allow access to the route
    next();
  } else {
    // User is not authenticated, redirect to login
    // next({ name: 'login' });
    next();
  }
};

const routes = [
  {
    path: '/',
    redirect: '/login' // Redirect root path to login
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
  },
  {
    path: '/password-recovery',
    name: 'PasswordRecovery',
    component: PasswordRecovery
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    redirect: '/home',
    beforeEnter: requireAuth, // Apply the navigation guard
    children: [
      {
        path: '/home',
        name: 'home',
        component: UserHome,
      },
      {
        path: '/profile',
        name: 'profile',
        component: UserProfile,
      },
      {
        path: '/card-collection',
        name: 'card-collection',
        component: CardCollection,
      },
      {
        path: '/battle-req',
        name: 'battle-requests',
        component: BattleRequests,
      },
      {
        path: '/battle-hist',
        name: 'battle-history',
        component: BattleHistory,
      },
      {
        path: '/battle-page',
        name: 'battle-page',
        component: BattlePage,
      },
      // {
      //   path: '/notifications',
      //   name: 'notifications',
      //   component: Notifications,
      // },
      {
        path: '/poke-discovered',
        name: 'poke-discovered',
        component: PokeDiscovered,
      },
    ],
  },
];


const router = createRouter({
  history: createWebHistory(), //to decide the type of url we want, hash url or normal Url
  routes,

})

export default router;
