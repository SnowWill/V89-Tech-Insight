import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import ChatView from '../views/ChatView.vue'
import ImageView from '../views/ImageView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/chat', component: ChatView },
  { path: '/images', component: ImageView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ป้องกันเข้า /chat และ /images ถ้าไม่ login
router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('loggedIn') === 'yes'
  if ((to.path === '/chat' || to.path === '/images') && !loggedIn) next('/login')
  else next()
})

export default router
