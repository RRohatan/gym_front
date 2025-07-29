import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '../views/Login.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
    },
    {
      path: '/members',
      name: 'Members',
      component: () => import('@/views/Members.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/menu',
      name: 'Menu',
      component: () => import('@/views/Menu.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/members/:id',
      name: 'MemberDetail',
      component: () => import('@/views/MemberDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/RegisterMember',
      name: 'RegisterMember',
      component: () => import('@/views/RegisterMember.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/Payments',
      name: 'Payments',
      component: () => import('@/views/Payments.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/MembershipPlans',
      name: 'MembershipPlans',
      component: () => import('@/views/MmbershipPlans.vue'),
      meta: {requiresAuth: true},
    },

    {
      path: '/Membership',
      name: 'Membership',
      component: () => import('@/views/Membership.vue'),
      meta: {requiresAuth: true},
    },

    {
      path: '/Sidebar',
      name: 'Sidebar',
      component: () => import('@/views/Sidebar.vue'),
      meta: {requiresAuth: true},
    },

  {
     path: '/CashBox',
     name: 'CashBosx',
     component: () => import('@/views/CashBox.vue'),
     meta: {requiresAuth: true},
  }


  ],
});

// 🛡️ Guardia global de autenticación
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;

