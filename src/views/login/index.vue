<template>
  <div class="login-container">
    <!-- 粒子动画背景 -->
    <Particles
      id="tsparticles"
      :particlesInit="particlesInit"
      :particlesLoaded="particlesLoaded"
      :options="particlesOptions"
    />
    
    <div class="login-content">
      <!-- 左侧品牌介绍 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-header">
            <img src="@/assets/logo.png" alt="logo" class="brand-logo">
            <h1 class="brand-title">管理系统</h1>
          </div>
          <p class="brand-desc">基于 Vue 3 + TypeScript 的现代化后台管理系统</p>
          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-icon">
                <CheckCircleOutlined />
              </div>
              <div class="feature-text">
                <h3>安全可靠</h3>
                <p>完善的权限管理，数据加密传输</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <ThunderboltOutlined />
              </div>
              <div class="feature-text">
                <h3>高效快速</h3>
                <p>优化的性能，快速的响应速度</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <AppstoreOutlined />
              </div>
              <div class="feature-text">
                <h3>功能丰富</h3>
                <p>丰富的组件和功能模块</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-section">
        <a-card class="login-card">
          <div class="login-header">
            <div class="login-brand">
              <img src="@/assets/logo.png" alt="logo" class="login-logo">
              <h2 class="login-title">欢迎登录</h2>
            </div>
            <p class="login-subtitle">请使用您的账号密码登录系统</p>
          </div>
          
          <a-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            @finish="handleLogin"
          >
            <a-form-item name="username">
              <a-input
                v-model:value="loginForm.username"
                placeholder="请输入用户名"
                size="large"
              >
                <template #prefix>
                  <UserOutlined />
                </template>
              </a-input>
            </a-form-item>
            
            <a-form-item name="password">
              <a-input-password
                v-model:value="loginForm.password"
                placeholder="请输入密码"
                size="large"
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </a-form-item>
            
            <div class="form-footer">
              <a-checkbox>记住密码</a-checkbox>
              <a href="#" class="forgot-link">忘记密码？</a>
            </div>
            
            <a-form-item>
              <a-button
                type="primary"
                :loading="loading"
                class="login-button"
                html-type="submit"
                size="large"
              >
                登录
              </a-button>
            </a-form-item>
          </a-form>

          <div class="login-footer">
            <div class="divider">
              <span>其他登录方式</span>
            </div>
            <div class="social-login">
              <a href="#" class="social-icon">
                <WechatOutlined />
              </a>
              <a href="#" class="social-icon">
                <QqOutlined />
              </a>
              <a href="#" class="social-icon">
                <DingdingOutlined />
              </a>
            </div>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { 
  UserOutlined, 
  LockOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  WechatOutlined,
  QqOutlined,
  DingdingOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import { useMenuStore } from '@/stores/menu'
const menuStore = useMenuStore()

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const isSubmitting = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// particles初始化函数
const particlesInit = async (engine: Engine) => {
  await loadFull(engine)
}

// particles加载完成回调
const particlesLoaded = async (container: any) => {
  console.log("Particles container loaded", container)
}

// 粒子动画配置
const particlesOptions = {
  background: {
    color: {
      value: "#1a237e",
    },
  },
  fpsLimit: 60,
  particles: {
    color: {
      value: "#ffffff",
    },
    links: {
      color: "#ffffff",
      distance: 150,
      enable: true,
      opacity: 0.3,
      width: 1,
    },
    move: {
      enable: true,
      speed: 2,
      direction: "none",
      random: false,
      straight: false,
      outModes: {
        default: "bounce",
      },
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 80,
    },
    opacity: {
      value: 0.4,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 3 },
    },
  },
  detectRetina: true,
}

const handleLogin = async () => {
  if (!loginFormRef.value || isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    loading.value = true
    await loginFormRef.value.validate()
    let result = await userStore.login(loginForm.value.username, loginForm.value.password)
    if(result.code == 200){
      message.success('登录成功')
      let userInfo = result.data;
      userStore.setCurrentUser({
        userId: userInfo.userId,
        username: loginForm.value.username,
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        wechatId: userInfo.wechatId || '',
        profile: userInfo.profile || '',
        isActive: userInfo.isActive || true,
        createdAt: userInfo.createdAt || new Date(),
        updatedAt: userInfo.updatedAt || new Date()
      })
      console.log(userStore.getUserInfo)
      await menuStore.initMenu()
      router.push('/home')
    }else{
      message.success(result.message);
      router.push('/login')
    }

  } catch (error: any) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

#tsparticles {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.login-content {
  position: relative;
  z-index: 2;
  display: flex;
  height: 100%;
}

.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 60px;
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(26, 35, 126, 0.1) 0%,
    rgba(66, 99, 235, 0.1) 100%
  );
}

.brand-content {
  max-width: 600px;
  animation: fadeIn 1s ease-out;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.brand-logo {
  /* width: 60px; */
  height: 85px;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  animation: float 3s ease-in-out infinite;
}

.brand-title {
  font-size: 3em;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #ffffff 30%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brand-desc {
  font-size: 1.4em;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 50px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.8s ease-out 0.2s both;
}

.brand-features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  animation: slideUp 0.8s ease-out both;
}

.feature-item:nth-child(1) {
  animation-delay: 0.4s;
}

.feature-item:nth-child(2) {
  animation-delay: 0.6s;
}

.feature-item:nth-child(3) {
  animation-delay: 0.8s;
}

.feature-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 1.5em;
}

.feature-text {
  flex: 1;
}

.feature-text h3 {
  font-size: 1.2em;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.feature-text p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.95em;
}

/* 添加动画关键帧 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.form-section {
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.8) 100%
  );
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

/* 添加装饰性圆形 */
.form-section::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: linear-gradient(
    45deg,
    rgba(66, 99, 235, 0.1) 0%,
    rgba(87, 97, 206, 0.1) 100%
  );
  border-radius: 50%;
  top: -150px;
  right: -150px;
}

.form-section::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: linear-gradient(
    45deg,
    rgba(66, 99, 235, 0.1) 0%,
    rgba(87, 97, 206, 0.1) 100%
  );
  border-radius: 50%;
  bottom: -100px;
  left: -100px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border: none;
  background: transparent;
  position: relative;
  z-index: 1;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.85) 100%
  );
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.login-logo {
  /* width: 40px; */
  height: 55px;
  object-fit: contain;
}

.login-title {
  color: #1a237e;
  font-size: 1.8em;
  margin: 0;
  font-weight: 600;
  background: linear-gradient(45deg, #1a237e, #4263eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-subtitle {
  color: #666;
  margin: 0;
  font-size: 1em;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forgot-link {
  color: #4263eb;
  text-decoration: none;
  font-size: 0.9em;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #1a237e;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
}

.divider {
  position: relative;
  margin: 20px 0;
  text-align: center;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: #e8e8e8;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: white;
  padding: 0 15px;
  color: #999;
  font-size: 0.9em;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f5f5;
  color: #666;
  transition: all 0.3s ease;
}

.social-icon:hover {
  background: #4263eb;
  color: white;
  transform: translateY(-2px);
}

/* 修改输入框样式 */
.login-card :deep(.ant-input-affix-wrapper) {
  transform: translateY(0);
  transition: all 0.3s ease;
  height: 50px;
  border-radius: 10px;
  border: 2px solid #eef2f7;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  background: #f8fafc;
}

.login-card :deep(.ant-input-affix-wrapper:hover) {
  border-color: #4263eb;
  background: #fff;
}

.login-card :deep(.ant-input-affix-wrapper:focus),
.login-card :deep(.ant-input-affix-wrapper-focused) {
  transform: translateY(-2px);
  border-color: #4263eb;
  box-shadow: 0 4px 12px rgba(66, 99, 235, 0.1);
  background: #fff;
}

.login-card :deep(.ant-input) {
  background: transparent;
  font-size: 1.05em;
}

.login-card :deep(.ant-input-prefix) {
  margin-right: 12px;
}

.login-card :deep(.anticon) {
  color: #4263eb;
  font-size: 1.2em;
}

/* 修改登录按钮样式 */
.login-button {
  width: 100% !important;
  height: 50px;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 500;
  margin-top: 10px;
  background: linear-gradient(45deg, #4263eb 30%, #5c6bc0 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(66, 99, 235, 0.2);
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 99, 235, 0.3);
  background: linear-gradient(45deg, #3651c9 30%, #4a5aa0 100%);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(66, 99, 235, 0.2);
}

/* 调整表单项间距 */
.login-card :deep(.ant-form-item) {
  margin-bottom: 24px;
}

.login-card :deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .login-content {
    flex-direction: column;
  }

  .brand-section {
    display: none;
  }

  .form-section {
    width: 100%;
  }
}
</style> 