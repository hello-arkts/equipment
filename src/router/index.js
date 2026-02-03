import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/index.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/constant',
    children: [
      {
        path: 'constant',
        name: 'Constant',
        component: () => import('../views/deviceManagement/index.vue'),
        meta: { title: '仪器管理' }
      },
      {
        path: 'orgAdministration',
        name: 'OrgAdministration',
        component: () => import('../views/orgManagement/index.vue'),
        meta: { title: '机构管理' }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('../views/Placeholder.vue'),
        meta: { title: '分类管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
