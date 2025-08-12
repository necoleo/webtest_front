import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import TDesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';

const app = createApp(App);
app.use(router); // 挂载路由
app.use(TDesign);
app.mount('#app');
