import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import SettingsPage from '../views/SettingsPage.vue';
import TrashPage from '../views/TrashPage.vue';
import AboutPage from '../views/AboutPage.vue';
import ProjectPage from '../views/ProjectPage.vue';
import HelpPage from '../views/HelpPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage
  },
  {
    path: '/trash',
    name: 'Trash',
    component: TrashPage
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage
  },
  {
    path: '/help',
    name: 'Help',
    component: HelpPage
  },
  {
    path: '/project/:id',
    name: 'Project',
    component: ProjectPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
