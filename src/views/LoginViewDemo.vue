<script setup lang="ts">
import { ref, reactive } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', type: 'error' },
    { min: 3, message: '用户名至少3个字符', type: 'error' }
  ],
  password: [
    { required: true, message: '请输入密码', type: 'error' },
    { min: 6, message: '密码至少6个字符', type: 'error' }
  ]
}

// 表单引用
const formRef = ref()

// 加载状态
const loading = ref(false)

// 登录方法
const handleLogin = async () => {
  const valid = await formRef.value?.validate()
  if (valid === true) {
    loading.value = true
    try {
      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1500))
      MessagePlugin.success('登录成功！')
    } catch (error) {
      MessagePlugin.error('登录失败，请重试')
    } finally {
      loading.value = false
    }
  }
}
</script>

<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#0052D9"/>
            <path d="M12 24L20 32L36 16" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="title">欢迎回来</h1>
        <p class="subtitle">请登录您的账户</p>
      </div>

      <!-- 登录表单 -->
      <t-form
        ref="formRef"
        :data="formData"
        :rules="rules"
        class="login-form"
        @submit="handleLogin"
      >
        <!-- 用户名输入 -->
        <t-form-item name="username">
          <t-input
            v-model="formData.username"
            placeholder="请输入用户名"
            size="large"
            clearable
          />
        </t-form-item>

        <!-- 密码输入 -->
        <t-form-item name="password">
          <t-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            clearable
          />
        </t-form-item>

        <!-- 记住我和忘记密码 -->
        <div class="form-options">
          <t-checkbox v-model="formData.rememberMe">
            记住我
          </t-checkbox>
          <t-link theme="primary" hover="color">
            忘记密码？
          </t-link>
        </div>

        <!-- 登录按钮 -->
        <t-button
          type="submit"
          theme="primary"
          size="large"
          block
          :loading="loading"
          class="login-button"
        >
          {{ loading ? '登录中...' : '登录' }}
        </t-button>

        <!-- 其他登录方式 -->
        <div class="divider">
          <span>或</span>
        </div>

        <div class="social-login">
          <t-button variant="outline" size="large" class="social-btn">
            谷歌登录
          </t-button>
          
          <t-button variant="outline" size="large" class="social-btn">
            微信登录
          </t-button>
        </div>

        <!-- 注册链接 -->
        <div class="register-link">
          <span>还没有账户？</span>
          <t-link theme="primary" hover="color">
            立即注册
          </t-link>
        </div>
      </t-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -100px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -75px;
  left: -75px;
  animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: 10%;
  animation: float 7s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* 登录卡片 */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

/* Logo 区域 */
.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  margin-bottom: 16px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
  font-weight: 400;
}

/* 表单样式 */
.login-form {
  width: 100%;
}

.login-form :deep(.t-input) {
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.login-form :deep(.t-input:hover) {
  border-color: #0052D9;
}

.login-form :deep(.t-input--focused) {
  border-color: #0052D9;
  box-shadow: 0 0 0 3px rgba(0, 82, 217, 0.1);
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0;
}

/* 登录按钮 */
.login-button {
  margin: 24px 0;
  border-radius: 12px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #0052D9 0%, #1890ff 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 82, 217, 0.3);
}

/* 分割线 */
.divider {
  position: relative;
  text-align: center;
  margin: 32px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e8e8e8;
}

.divider span {
  background: rgba(255, 255, 255, 0.95);
  padding: 0 16px;
  color: #999;
  font-size: 14px;
}

/* 社交登录 */
.social-login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.social-btn {
  border-radius: 12px;
  height: 48px;
  font-weight: 500;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.social-btn:hover {
  border-color: #0052D9;
  transform: translateY(-1px);
}

/* 注册链接 */
.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-link span {
  margin-right: 4px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    margin: 20px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .social-login {
    grid-template-columns: 1fr;
  }
  
  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style> 