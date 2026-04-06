import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import MainPage from '../views/Main.vue';
import SettingsPage from '../views/Settings.vue';
import TrashPage from '../views/Trash.vue';
import AboutPage from '../views/About.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: MainPage
  },
  {
    path: '/settings',
    component: SettingsPage
  },
  {
    path: '/trash',
    component: TrashPage
  },
  {
    path: '/about',
    component: AboutPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
