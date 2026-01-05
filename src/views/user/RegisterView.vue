<template>
  <div class="register-container">
    <!-- 左侧插画区域 -->
    <div class="left-section">
      <div class="left-illustration-wrapper">
        <img
            class="register-left-illustration"
            src="../../assets/login/login_left_illustration.png"
            alt="register_illustration"
        />
      </div>
    </div>

    <!-- 右侧注册卡片 -->
    <div class="right-section">
      <!-- 背景模糊层 -->
      <div class="background-blur">
        <img
            class="background-image"
            src="../../assets/login/login_right_background.png"
            alt="register_background"
        />
      </div>

      <!-- 注册表单卡片 -->
      <div class="register-form-card">
        <!-- 表单头部 -->
        <div class="register-form-header">
          <div class="welcome-section">
            <span class="welcome-text">欢迎使用 Heypon 测试平台</span>
            <span class="wave-icon">👋</span>
          </div>
          <h2 class="form-title">注册您的账户</h2>
        </div>
        <!-- 注册表单 -->
        <t-form
            class="register-form"
            labelAlign="top"
            :data = "register_form_data"
            :rules="rules"
            @submit="submit_register_form"
        >
          <t-form-item
              label="用户名"
              name="username"
          >
            <t-input
                class="register-input"
                placeholder="请输入用户名"
                v-model="register_form_data.username"
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
                class="register-input"
                placeholder="请输入密码"
                v-model="register_form_data.password"
                clearable
                size="large"
                type="password"
            >
              <template #prefix-icon>
                <t-icon name="lock-on" />
              </template>
            </t-input>
          </t-form-item>

          <t-form-item
              label="确认密码"
              name="check_password"
          >
            <t-input
                class="register-input"
                placeholder="请再次输入密码"
                v-model="register_form_data.check_password"
                clearable
                size="large"
                type="password"
            >
              <template #prefix-icon>
                <t-icon name="lock-on" />
              </template>
            </t-input>
          </t-form-item>

          <t-form-item class="register-button">
            <t-button
                theme="primary"
                type="submit"
                block
                :loading="register_button_loading"
            >
              注册
            </t-button>
          </t-form-item>

          <div class="form-footer">
            <t-link
                theme="primary"
                @click="get_admin_work_wechat"
            >
              联系管理员
            </t-link>
            <div class="register-section">
              <span class="register-text">已有账户? </span>
              <t-link
                  theme="primary"
                  @click="to_login_view"
              >
                返回登录页
              </t-link>
            </div>
          </div>
        </t-form>
      </div>
    </div>
    <t-dialog
        header="管理员企业微信"
        body="后续更新"
        placement="center"
        :visible="visible"
        :on-close="on_close_dialog"
        :on-confirm="on_confirm_dialog"
    />
  </div>
</template>

<script setup lang="ts">

  import {type FormProps, MessagePlugin} from "tdesign-vue-next";
  import {reactive, ref} from "vue";
  import {request} from "@/api/urls.ts";
  import {API_URLS} from "@/api/urls.ts";
  import router from "@/router";

  const register_button_loading = ref(false);
  const register_form_data: FormProps['data'] = reactive({
    username: '',
    password: '',
    check_password: '',
  });

  const rules: FormProps['rules'] = {
    username: [
      {
        required: true,
        message: "用户名必填",
        type: "error",
      },
      {
        pattern: /^[a-zA-Z0-9_]{3,20}$/,
        message: "用户名长度在 3-20 位，仅允许字母（大小写）、数字、下划线"
      }
    ],
    password: [
      {
        required: true,
        message: "密码必填",
        type: "error",
      },
      {
        pattern: /^.{4,}$/,
        message: "密码长度不小于 4 位"
      }
    ],
    check_password: [
      {
        required: true,
        message: "确认密码",
        type: "error",
      },
      {
        validator: (val: string) => val === register_form_data.password,
        message: "两次输入的密码不一致",
      }
    ]
  }

  const submit_register_form: FormProps['onSubmit'] = ({ validateResult, firstError }) => {
    register_button_loading.value = true;
    if (validateResult === true) {
      try{
        request.post(API_URLS.users.user_register, {
          "username": register_form_data.username,
          "password": register_form_data.password,
          "check_password": register_form_data.check_password,
        }).then((response) => {
          if (response.status === 200 && response.data.code === "success") {
            MessagePlugin.success("注册成功");

            // 将注册的用户名和密码存入 localStorage 里
            localStorage.setItem("register_username", register_form_data.username);
            localStorage.setItem("register_password", register_form_data.password);

            // 重定向到登录页
            router.push({
              name: "Login",
            });
          }
          else {
            MessagePlugin.error(response.data.message);
          }
        })
      }catch(error) {
        MessagePlugin.error("注册失败: ${error.message}");
      }
    } else {
      MessagePlugin.warning(firstError ?? "表单校验失败，请检查输入");
    }
    register_button_loading.value = false;
  }

  const visible = ref(false);
  const get_admin_work_wechat = () => {
    visible.value = true;
  }

  const on_close_dialog = () => {
    visible.value = false;
  }

  const on_confirm_dialog = () => {
    visible.value = false;
  }

  const to_login_view = () => {
    router.push({
      name: "Login",
    })
  }

</script>

<style scoped>
  .register-container {
    display: flex;
    width: 100%;
    height: 100vh;
  }

  /* 注册页左侧区 */
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

  .register-left-illustration{
    width: 100%;
    height: auto;
    object-fit: contain;
  }

  /* 注册页右侧区 */
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

  .register-form-card{
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

  .register-form-header{
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

  .register-form{
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

  .register-button{
    margin-top: 2rem;
    margin-bottom: 1.5rem;

  }

  :deep(.register-button .t-button__text){
    font-size: large;
  }

  :deep(.register-button .t-button){
    width: 100%;
    min-height: 50px;
  }

  :deep(.t-button)
  {
    border-radius: 12px;
  }

  :deep(.register-button .t-button--variant-base.t-button--theme-primary){
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
