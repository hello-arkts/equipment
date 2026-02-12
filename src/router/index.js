import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/index.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录' }
  },
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
        component: () => import('../views/recordManagement/downloadHistory/index.vue'),
        meta: { title: '下载记录' }
      },
      {
        path: 'authRecord',
        name: 'AuthRecord',
        component: () => import('../views/recordManagement/authorizationRecord/index.vue'),
        meta: { title: '授权记录' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 插件管理系统`
  } else {
    document.title = '插件管理系统'
  }

  const token = localStorage.getItem('token')
  if (to.path === '/login') {
    if (token) {
      next('/')
    } else {
      next()
    }
  } else {
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
