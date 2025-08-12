<template>
  <div class="register-container">

    <!-- 注册卡片 -->
    <div class="register-card">
      <div class="card-content">
        <!-- 左侧Logo区域 -->
        <div class="logo-container">
          <img
              class="logo-img"
              src="@/assets/logo/logo.png"
              alt="Logo"
          />
        </div>
        <!-- 右侧注册表单区域 -->
        <div class="form-section">
          <div class="form-header">
            <h2 class="form-title">注册用户</h2>
          </div>
          <t-form
              class="register-form"
              ref="register_form"
              :data="register_form_data"
              :colon="true"
              :label-width="0"
              :rules="REGISTER_FORM_RULES"
              @submit="onSubmit"
          >
            <t-form-item name="username">
              <t-input
                  class="register-input"
                  v-model="register_form_data.username"
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
                  class="register-input"
                  v-model="register_form_data.password"
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
            <t-form-item name="check_password">
              <t-input class="register-input"
                       v-model="register_form_data.check_password"
                       type="password"
                       clearable
                       size="large"
                       placeholder="再次输入密码"
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
                    theme="primary"
                    size="large"
                    type="submit"
                    :loading="is_loading"
                >
                  注册
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

  const request = axios.create({
    baseURL: BASE_URLS,
  })

  const is_loading = ref(false);

  const REGISTER_FORM_RULES: FormProps['rules'] = {
    username: [
      {
        required: true,
        message: "用户名必填"
      },
      {
        pattern:  /^[a-zA-Z0-9_]{3,20}$/,
        message: "用户名长度在 3-20 位，仅允许字母（大小写）、数字、下划线"
      }
    ],
    password: [
      {
        required: true,
        message: "密码必填"
      },
      {
        pattern:  /^.{4,}$/,
        message: "密码长度不小于 4 位"
      }
    ],
    check_password: [
      {
        required: true,
        message: "请再次输入密码"
      }
    ]
  }
  const register_form_data: FormProps['data'] = reactive({
    username: '',
    password: '',
    check_password: '',
  });

  const onSubmit: FormProps['onSubmit'] = ({ validateResult, firstError }) => {
    is_loading.value = true;
    if (validateResult === true) {
      request.post(API_URLS.users.user_register, {
        username: register_form_data.username,
        password: register_form_data.password,
        check_password: register_form_data.check_password,
      }).then((response) => {
        if (response.status === 200) {
          is_loading.value = false;
          if (response.data.code === "success") {
            MessagePlugin.success('注册成功');
          }else {
            if (response.data.data != "") {
              MessagePlugin.error(response.data.data);
            }
            else {
              MessagePlugin.error(response.data.message);
            }
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

</script>

<style scoped>

  .register-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    min-height: 796px;
    background: linear-gradient(135deg, #7db2c5 0%, #62bfd4 100%);
    background-size: cover;
    overflow: hidden;
  }

  .register-card {
    width: 100%;
    max-width: 1000px;
    display: flex;
    justify-content: center;
  }

  .card-content {
    display: flex;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    /* 毛玻璃效果 */
    backdrop-filter: blur(20px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    min-height: 600px;
  }

  /* 左侧 logo 区域*/
  .logo-container {
    flex: 1;
    background: linear-gradient(135deg, #8dbfd1 0%, #7ad6e8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    position: relative;
    overflow: hidden;
    flex-direction: column;
    text-align: center;
  }

  .logo-img {
    width: 200px;
    height: 200px;
    border-radius: 20px;
    object-fit: contain;
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

  /* 右侧注册表单区域 */
  .form-section {
    flex: 1;
    display: flex;
    padding: 60px 50px;
    flex-direction: column;
    justify-content: center;
  }

  .form-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .form-title {
    font-size: 32px;
    font-weight: bold;
    color: #333;
    margin: 0 0 10px 0;
  }

  .register-form {
    width: 100%;
  }

  .register-input {
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
    background: linear-gradient(135deg, #8dbfd1 0%, #7ad6e8 100%);
    border: none;
    margin-right: auto;
    font-weight: 500;
  }

  .register-button:hover {
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