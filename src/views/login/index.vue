<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>系统登录</h2>
      </div>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="0px" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" :prefix-icon="User" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item prop="captcha">
          <div style="display: flex; width: 100%; gap: 10px;">
            <el-input
                v-model="loginForm.captcha"
                :prefix-icon="Lock"
                placeholder="请输入验证码"
                @keyup.enter="handleLogin"
                style="flex: 1;"
            />
            <el-image 
              :src="captchaImg" 
              style="width: 120px; height: 32px; cursor: pointer; border-radius: 4px;" 
              @click="getCaptcha" 
              title="点击刷新验证码"
            >
              <template #error>
                <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; background: #f5f7fa; color: #909399; font-size: 12px;">
                  加载失败
                </div>
              </template>
            </el-image>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-button" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted} from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import loginServers from '../../api/servers/loginServers'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)
const captchaImg = ref('')

const loginForm = reactive({
  username: '',
  password: '',
  captchaKey:'',
  captcha:''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await loginServers.login(loginForm)
        if (res.code === 200 || res.code === 0) {
          ElMessage.success('登录成功')
          // 假设后端返回的数据中有 token，这里将其存储到 localStorage
          // 根据实际后端返回结构调整，这里假设 token 在 res.data.token 或直接是 res.data
          const token = res.data?.token || res.data
          if (token) {
            localStorage.setItem('token', token)
            localStorage.setItem('username', loginForm.username)
          }
          router.push('/')
        } else {
          ElMessage.error(res.message || '登录失败')
        }
      } catch (error) {
        console.error(error)
        ElMessage.error(error.message || '登录请求异常')
      } finally {
        loading.value = false
      }
    }
  })
}

const getCaptcha = async () => {
  try {
    const res = await loginServers.getCaptcha()
    if (res.code == 200){
      captchaImg.value = res.data.captchaImage
      loginForm.captchaKey = res.data.captchaKey
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

onMounted(() =>{
  getCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  background-image: url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg'); /* 示例背景图 */
  background-repeat: no-repeat;
  background-position: center 110px;
  background-size: 100%;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 24px;
  color: #303133;
  font-weight: 600;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  padding: 20px 0;
  font-size: 16px;
}
</style>
