<template>
  <div class="login-container">

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="card-content">
        <!-- 左侧Logo区域 -->
        <div class="logo-section">
          <div class="logo-container">
            <img
                class="logo-img"
                src="@/assets/logo/logo.png"
                alt="Logo"
            />
          </div>
        </div>

        <!-- 右侧登录表单区域 -->
        <div class="form-section">
          <div class="form-header">
            <h2 class="form-title">用户登录</h2>
          </div>

          <t-form
              class="login-form"
              ref="login_form"
              :data="login_form_data"
              :colon="true"
              :label-width="0"
              :rules="LOGIN_FORM_RULES"
              @submit="onSubmit"
          >
            <t-form-item name="username">
              <t-input
                  class="login-input"
                  v-model="login_form_data.username"
                  clearable
                  size="large"
                  placeholder="请输入用户名"
                  autofocus
              >
                <template #prefix-icon>
                  <t-icon name="user" />
                </template>
              </t-input>
            </t-form-item>

            <t-form-item name="password">
              <t-input
                  class="login-input"
                  v-model="login_form_data.password"
                  type="password"
                  clearable
                  size="large"
                  placeholder="请输入密码"
              >
                <template #prefix-icon>
                  <t-icon name="lock-on" />
                </template>
              </t-input>
            </t-form-item>

            <t-form-item>
              <div class="button-group">
                <t-button
                    class="register-button"
                    theme="default"
                    variant="outline"
                    size="large"
                    @click="routerRegisterView"
                >
                  注册用户
                </t-button>
                <t-button
                    class="login-button"
                    theme="primary"
                    type="submit"
                    size="large"
                    :loading="is_loading"
                >
                  立即登录
                </t-button>
              </div>
            </t-form-item>
          </t-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {reactive, ref} from 'vue';
  import {MessagePlugin, type FormProps} from 'tdesign-vue-next';
  import {API_URLS, BASE_URLS} from "@/api/urls.ts";
  import axios from "axios";
  import {useRouter} from "vue-router";

  const router = useRouter()
  const request = axios.create({
    baseURL: BASE_URLS,
  })

  const is_loading = ref(false);

  const LOGIN_FORM_RULES: FormProps['rules'] = {
    username: [
      {
        required: true,
        message: "用户名必填"
      }
    ],
    password: [
      {
        required: true,
        message: "密码必填"
      }
    ]
  }
  const login_form_data: FormProps['data'] = reactive({
    username: '',
    password: '',
  });

  const onSubmit: FormProps['onSubmit'] = ({ validateResult, firstError }) => {
    is_loading.value = true;
    if (validateResult === true) {
      request.post(API_URLS.users.user_login, {
        username: login_form_data.username,
        password: login_form_data.password,
      },
      ).then((response) => {
        if (response.status === 200) {
          is_loading.value = false;
          if (response.data.code === "success") {
            MessagePlugin.success('登录成功');
            router.push({name: 'Home'});
          }
        }
      }).catch((error) => {
        is_loading.value = false;
        MessagePlugin.error(error.message);
      })
    } else {
      is_loading.value = false;
      console.log('校验错误: ', firstError, validateResult);
      MessagePlugin.warning(firstError ?? "表单校验失败，请检查输入");
    }
  };

  const routerRegisterView = () => {
    router.push({name: "Register"})
  }

</script>

<style scoped>
  .login-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    min-height: 796px;
    background: linear-gradient(135deg, #7db2c5 0%, #62bfd4 100%);
    background-repeat: no-repeat;
    background-size: cover;
    overflow: hidden;
  }

  .login-card {
    width: 100%;
    max-width: 1000px;
    display: flex;
    justify-content: center;
    z-index: 1;
  }

  .card-content {
    display: flex;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    min-height: 600px;
  }

  /* 左侧Logo区域 */
  .logo-section {
    flex: 1;
    background: linear-gradient(135deg, #8dbfd1 0%, #7ad6e8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    position: relative;
    overflow: hidden;
  }

  .logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    z-index: 1;
  }

  .logo-img {
    width: 200px;
    height: 200px;
    object-fit: contain;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;
  }

  .logo-img:hover {
    transform: scale(1.05);
  }

  /* 右侧表单区域 */
  .form-section {
    flex: 1;
    padding: 60px 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .form-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .form-title {
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 10px 0;
  }

  .login-form {
    width: 100%;
  }

  .login-input {
    margin-bottom: 20px;
  }

  :deep(.t-input.t-size-l) {
    border-radius: 12px;
    border: 2px solid #e1e5e9;
    transition: all 0.3s ease;
    background: #f8f9fa;
  }

  :deep(.t-input.t-size-l:hover) {
    border-color: #667eea;
    background: white;
  }

  :deep(.t-input.t-size-l:focus-within) {
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  :deep(.t-input__prefix) {
    color: #667eea;
  }

  .button-group {
    display: flex;
    gap: 15px;
    width: 100%;
  }

  .register-button {
    flex: 1;
    border-radius: 12px;
    border: 2px solid #8dbfd1;
    color: #8dbfd1;
    font-weight: 500;
  }

  .register-button:hover {
    background: #8dbfd1;
    color: white;
  }

  .login-button {
    flex: 1;
    border-radius: 12px;
    background: linear-gradient(135deg, #8dbfd1 0%, #7ad6e8 100%);
    border: none;
    margin-right: auto;
    font-weight: 500;
  }

  .login-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  /* 响应式设计 */
  /* 适配小屏幕 */
  @media (max-width: 768px) {
    .card-content {
      flex-direction: column;
      min-height: auto;
    }

    .logo-section {
      padding: 30px 20px;
    }

    .logo-img {
      width: 120px;
      height: 120px;
      margin-bottom: 20px;
    }

    .form-section {
      padding: 40px 30px;
    }

    .form-title {
      font-size: 1.5rem;
    }

    .button-group {
      flex-direction: column;
    }
  }
</style>


