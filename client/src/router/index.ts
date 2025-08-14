import { createRouter, createWebHistory } from 'vue-router'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/views/Home.vue'),
  },
  {
    path: '/profile/:id',
    name: 'Profile',
    component: () => import('../components/views/Profile.vue'),
    props: true,
  },
  {
    path: '/marketplace',
    name: 'Marketplace',
    component: () => import('../components/views/Marketplace.vue'),
  },
  {
    path: '/tools',
    name: 'Tools',
    component: () => import('../components/views/Tools.vue'),
  },
  // Add additional workflow routes as needed
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
})

export default router
