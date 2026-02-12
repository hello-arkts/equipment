<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-left">
        <div class="logo">
          <el-icon class="logo-icon"><ElementPlus /></el-icon>
          <span class="logo-text">设备插件管理系统</span>
        </div>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <div class="el-dropdown-link">
            <el-avatar :size="30" :icon="UserFilled" class="user-avatar" />
            <span class="username">{{ username }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="main-container">
      <el-aside :width="isCollapse ? '64px' : '180px'" class="aside">
        <div class="menu-header" @click="toggleCollapse">
          <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          <span v-show="!isCollapse">菜单管理</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
          :collapse="isCollapse"
          :collapse-transition="false"
          text-color="#fff"
          active-text-color="#fff"
          background-color="transparent"
        >
          <el-menu-item index="/constant">
            <el-icon><Document /></el-icon>
            <span>仪器管理</span>
          </el-menu-item>
          <el-menu-item index="/orgAdministration">
            <el-icon><Files /></el-icon>
            <span>机构管理</span>
          </el-menu-item>
          <el-sub-menu index="/history">
            <template #title>
              <el-icon><Collection /></el-icon>
              <span>历史记录</span>
            </template>
            <el-menu-item index="/category">
              <el-icon><Download /></el-icon>
              <span>下载记录</span>
            </el-menu-item>
            <el-menu-item index="/authRecord">
              <el-icon><Tickets /></el-icon>
              <span>授权记录</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      
      <el-main class="main-content">
        <div class="breadcrumb-container">
           <!-- Breadcrumb could go here -->
        </div>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ElementPlus, 
  Fold,
  Expand,
  Document,
  Files,
  Collection,
  Download,
  Tickets,
  ArrowDown,
  UserFilled
} from '@element-plus/icons-vue'
import loginServers from '../api/servers/loginServers'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const activeMenu = computed(() => route.path)
const isCollapse = ref(false)
const username = ref(localStorage.getItem('username') || '管理员')

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await loginServers.logout()
    } catch (error) {
      console.error(error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      ElMessage.success('退出成功')
      router.push('/login')
    }
  }
}
</script>

<style lang="scss" scoped>
$theme-blue: #3b82f6; // Adjust this to match the screenshot better
$theme-dark-blue: #2563eb;
$header-height: 50px;

.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: $theme-blue;
  color: white;
  height: $header-height !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .logo {
      display: flex;
      align-items: center;
      margin-right: 40px;
      font-size: 18px;
      font-weight: bold;
      
      .logo-icon {
        font-size: 24px;
        margin-right: 8px;
      }
    }
  }

  .header-right {
    padding-right: 20px;
    
    .el-dropdown-link {
      cursor: pointer;
      color: white;
      display: flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.3s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      &:focus-visible {
        outline: none;
      }

      .user-avatar {
        margin-right: 8px;
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .username {
        margin-right: 4px;
        font-weight: 500;
      }
    }
  }
}

.main-container {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.aside {
    background-color: $theme-blue;
    color: white;
    display: flex;
    flex-direction: column;
    transition: width 0.3s;
    
    .menu-header {
      height: 40px;
      display: flex;
      align-items: center;
      padding-left: 20px;
      background-color: rgba(0, 0, 0, 0.1);
      font-size: 14px;
      gap: 8px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
    }

    .sidebar-menu {
      border-right: none;
      flex: 1;
      
      :deep(.el-menu-item) {
        height: 46px;
        line-height: 46px;
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        &.is-active {
          background-color: white;
          color: $theme-blue;
          font-weight: bold;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background-color: $theme-dark-blue; // Or just rely on the white bg
          }
        }
      }
    }
  }

.main-content {
  background-color: #f0f2f5;
  padding: 8px;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column;
}
</style>
