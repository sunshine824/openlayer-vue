import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';

import 'virtual:svg-icons-register';
import './assets/iconfont/iconfont.js';
import '@/public/css/base.css';
import '@/public/css/ol.css';

createApp(App).use(router).mount('#app');
