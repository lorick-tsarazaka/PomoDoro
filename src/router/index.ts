import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue'
import Settings from '../views/Settings.vue';
import Trash from '../views/Trash.vue';
import About from '../views/About.vue';
import Project from '../views/Project.vue';
import Help from '../views/Help.vue';
import TaskDetail from '../views/TaskDetail.vue';
import Ringtone from '../views/Ringtone.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/settings/ringtone',
    name: 'Ringtone',
    component: Ringtone
  },
  {
    path: '/trash',
    name: 'Trash',
    component: Trash
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/help',
    name: 'Help',
    component: Help
  },
  {
    path: '/project/:id',
    name: 'Project',
    component: Project
  },
  {
    path: '/project/:projectId/task/:taskId',
    name: 'TaskDetail',
    component: TaskDetail
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
