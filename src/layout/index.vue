<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-left">
        <div class="logo">
          <el-icon class="logo-icon"><ElementPlus /></el-icon>
          <span class="logo-text">设备插件管理系统</span>
        </div>
      </div>
      <div class="top-nav">
        <div class="nav-item active">设备插件管理</div>
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
          <el-menu-item index="/category">
            <el-icon><Collection /></el-icon>
            <span>下载记录</span>
          </el-menu-item>
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
import { useRoute } from 'vue-router'
import { 
  ElementPlus, 
  Fold,
  Expand,
  Document,
  DataLine,
  SetUp,
  Files,
  Connection,
  Operation,
  Setting,
  Collection
} from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
const isCollapse = ref(false)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
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

  .top-nav {
    display: flex;
    justify-content: center;
    flex: 1;
    
    .nav-item {
      padding: 0 20px;
      height: $header-height;
      line-height: $header-height;
      cursor: pointer;
      font-size: 14px;
      opacity: 0.8;
      
      &:hover {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      &.active {
        opacity: 1;
        background-color: white;
        color: $theme-blue;
        font-weight: bold;
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
