<template>
  <div class="login-container">
    <!-- 左侧插画区域 -->
    <div class="left-section">
      <div class="left-illustration-wrapper">
        <img
            class="login-left-illustration"
            src="../../assets/login/login_left_illustration.png"
            alt="login_illustration"
        />
      </div>
    </div>

    <!-- 右侧登录卡片 -->
    <div class="right-section">
      <!-- 背景模糊层 -->
      <div class="background-blur">
        <img
            class="background-image"
            src="../../assets/login/login_right_background.png"
            alt="login_background"
        />
      </div>

      <!-- 登录表单卡片 -->
      <div class="login-form-card">
        <!-- 表单头部 -->
        <div class="login-form-header">
          <div class="welcome-section">
            <span class="welcome-text">欢迎回来</span>
            <span class="wave-icon">👋</span>
          </div>
          <h2 class="form-title">登录您的账户</h2>
        </div>
        <!-- 登录表单 -->
        <t-form
            class="login-form"
            labelAlign="top"
            :data = "login_form_data"
            :rules="rules"
            @submit="submit_login_form"
        >
          <t-form-item
              label="用户名"
              name="username"
          >
            <t-input
                class="login-input"
                placeholder="请输入用户名"
                v-model="login_form_data.username"
                clearable
                size="large"
                autofocus
            >
              <template #prefix-icon>
                <t-icon name="user" />
              </template>
            </t-input>
          </t-form-item>

          <t-form-item
              label="密码"
              name="password"
          >
            <t-input
                class="login-input"
                placeholder="请输入密码"
                v-model="login_form_data.password"
                clearable
                size="large"
                type="password"
            >
              <template #prefix-icon>
                <t-icon name="lock-on" />
              </template>
            </t-input>
          </t-form-item>

          <t-form-item class="login-button">
            <t-button
                theme="primary"
                type="submit"
                block
                :loading="login_button_loading"
            >
              登录
            </t-button>
          </t-form-item>

          <div class="form-footer">
            <t-link theme="primary">
              忘记密码？
            </t-link>
            <div class="register-section">
              <span class="register-text">未注册? </span>
              <t-link
                  theme="primary"
                  @click="to_register_view"
              >
                注册账户
              </t-link>
            </div>
          </div>
        </t-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

  import {type FormProps, MessagePlugin} from "tdesign-vue-next";
  import {reactive, ref} from "vue";
  import {request} from "@/api/urls.ts";
  import {API_URLS} from "@/api/urls.ts";
  import router from "@/router";

  const login_button_loading = ref(false);
  const login_form_data: FormProps['data'] = reactive({
    username: '',
    password: '',
  });

  const rules: FormProps['rules'] = {
    username: [
      {
        required: true,
        message: "用户名必填",
        type: "error",
      }
    ],
    password: [
      {
        required: true,
        message: "密码必填",
        type: "error",
      }
    ]
  }

  if (localStorage.getItem("register_username") && localStorage.getItem("register_password")) {
    login_form_data.username = localStorage.getItem("register_username");
    login_form_data.password = localStorage.getItem("register_password");
    localStorage.clear()
  }


  const submit_login_form: FormProps['onSubmit'] = ({ validateResult, firstError }) => {
    login_button_loading.value = true;
    if (validateResult === true) {
      try{
        request.post(API_URLS.users.user_login, {
          "username": login_form_data.username,
          "password": login_form_data.password,
        }).then((response) => {
          if (response.status === 200 && response.data.code === "success") {
            MessagePlugin.success("登录成功");

            // 获取重定向路径参数
            router.push({
              name: "Project"
            });
          }
          else {
            MessagePlugin.error(response.data.message);
          }
        })
      }catch(error) {
        MessagePlugin.error("登录失败: ${error.message}");
      }
    } else {
      MessagePlugin.warning(firstError ?? "表单校验失败，请检查输入");
    }
    login_button_loading.value = false;
  }


  const to_register_view = () => {
    router.push({
      name: "Register",
    })
  }

</script>

<style scoped>
  .login-container {
    display: flex;
    width: 100%;
    height: 100vh;
  }

  /* 登录页左侧区 */
  .left-section {
    display: flex;
    flex: 0 0 36%;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    background: #F4F9FF;
  }

  .left-illustration-wrapper{
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 90%;
    max-height: 90%;
    mix-blend-mode: multiply;
    opacity: 1;
    object-fit: contain;
  }

  .login-left-illustration{
    width: 100%;
    height: auto;
    object-fit: contain;
  }

  /* 登录页右侧区 */
  .right-section{
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    position: relative;
    width: 65.72%;
  }

  .background-blur{
    position: absolute;
    inset:0;
    z-index: 1;
    overflow: hidden;
  }

  .background-image{
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(8px);
    opacity: 0.6;
  }

  .login-form-card{
    position: relative;
    z-index: 2;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    border-radius: 24px;
    width: 37.92%;
    padding: 6% 8% 6% 8%;
  }

  .login-form-header{
    text-align: left;
    margin-bottom: 2rem;
  }

  .welcome-section {
    text-align: left;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .welcome-text{
    font-size: x-large;
    color: #333333;
    font-weight: normal;
  }

  .wave-icon{
    font-size: x-large;
  }

  .form-title{
    font-size: xx-large;
    font-weight: normal;
    color: #333333;
    margin: 0;
    line-height: 1.2;
  }

  .login-form{
    width: 100%;
  }

  :deep(.t-form__label--top){
    text-align: left;
    font-size: large;
  }

  :deep(.t-input.t-size-l){
    border-radius: 12px;
    min-height: 50px;
  }

  :deep(.t-is-error .t-input__extra){
    text-align: left;
  }

  .login-button{
    margin-top: 2rem;
    margin-bottom: 1.5rem;

  }

  :deep(.t-button__text){
    font-size: large;
  }

  :deep(.t-button){
    width: 100%;
    border-radius: 12px;
    min-height: 50px;
  }

  :deep(.t-button--variant-base.t-button--theme-primary){
    background-color: #0067FF;
  }

  /* 底部链接 */
  .form-footer{
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: large;
  }

  :deep(.t-link){
    font-size: large;
  }

</style>
